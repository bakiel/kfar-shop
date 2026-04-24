import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { query, transaction } from '@/lib/db/postgres-client';
import { sendTransactional } from '@/lib/services/email/email-service';

// Types
export interface AuthUser {
  id: string;
  email: string;
  role: 'admin' | 'vendor' | 'customer';
  vendorId?: string;
  customerId?: string;
  displayName: string;
  isActive: boolean;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResult {
  success: boolean;
  user?: AuthUser;
  tokens?: TokenPair;
  error?: string;
  message?: string;
}

// Secrets - MUST be set via environment variables (no fallback)
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
  throw new Error('FATAL: JWT_SECRET and JWT_REFRESH_SECRET environment variables are required. Server cannot start without them.');
}
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

// Generate JWT access token (short-lived)
function generateAccessToken(user: AuthUser): string {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
      vendorId: user.vendorId,
      customerId: user.customerId,
    },
    JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
}

// Generate JWT refresh token (long-lived)
function generateRefreshToken(user: AuthUser): string {
  return jwt.sign(
    { userId: user.id, type: 'refresh' },
    JWT_REFRESH_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );
}

// Verify access token
export function verifyAccessToken(token: string): AuthUser | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    return {
      id: payload.userId,
      email: payload.email,
      role: payload.role,
      vendorId: payload.vendorId,
      customerId: payload.customerId,
      displayName: '', // Not stored in token
      isActive: true,
    };
  } catch {
    return null;
  }
}

// Verify refresh token
export function verifyRefreshToken(token: string): { userId: string } | null {
  try {
    const payload = jwt.verify(token, JWT_REFRESH_SECRET) as any;
    if (payload.type !== 'refresh') return null;
    return { userId: payload.userId };
  } catch {
    return null;
  }
}

// Login with email + password
export async function login(email: string, password: string): Promise<LoginResult> {
  try {
    const { rows } = await query<any>(
      'SELECT id, email, password_hash, role, vendor_id, customer_id, display_name, is_active, email_verified FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );

    if (rows.length === 0) {
      return { success: false, error: 'Invalid email or password' };
    }

    const dbUser = rows[0];

    if (!dbUser.is_active) {
      return { success: false, error: 'Account is disabled' };
    }

    const passwordValid = await bcrypt.compare(password, dbUser.password_hash);
    if (!passwordValid) {
      return { success: false, error: 'Invalid email or password' };
    }

    // Customers must verify email before logging in (admin/vendor pre-verified)
    if (dbUser.role === 'customer' && !dbUser.email_verified) {
      return { success: false, error: 'Please verify your email before logging in. Check your inbox for the verification link.' };
    }

    const user: AuthUser = {
      id: dbUser.id,
      email: dbUser.email,
      role: dbUser.role,
      vendorId: dbUser.vendor_id || undefined,
      customerId: dbUser.customer_id || undefined,
      displayName: dbUser.display_name || dbUser.email,
      isActive: dbUser.is_active,
    };

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Store refresh token in DB
    await query(
      `INSERT INTO user_sessions (user_id, refresh_token, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '7 days')`,
      [user.id, refreshToken]
    );

    // Update last login
    await query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [user.id]);

    return {
      success: true,
      user,
      tokens: { accessToken, refreshToken },
    };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'Login failed' };
  }
}

// Register a new customer
export async function registerCustomer(data: {
  email: string;
  password: string;
  name: string;
  phone?: string;
}): Promise<LoginResult> {
  try {
    // Check if email already exists
    const { rows: existing } = await query('SELECT id FROM users WHERE email = $1', [data.email.toLowerCase().trim()]);
    if (existing.length > 0) {
      return { success: false, error: 'Email already registered' };
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const result = await transaction(async (client) => {
      // Create customer record
      const { rows: customerRows } = await client.query(
        `INSERT INTO customers (name, email, phone, points, loyalty_tier)
         VALUES ($1, $2, $3, 50, 'bronze')
         RETURNING id`,
        [data.name, data.email.toLowerCase().trim(), data.phone || null]
      );
      const customerId = customerRows[0].id;

      // Create user record (email_verified = false, store verification token)
      const { rows: userRows } = await client.query(
        `INSERT INTO users (email, password_hash, role, customer_id, display_name, email_verified, verification_token, verification_token_expires)
         VALUES ($1, $2, 'customer', $3, $4, false, $5, NOW() + INTERVAL '24 hours')
         RETURNING id, email, role, customer_id, display_name, is_active`,
        [data.email.toLowerCase().trim(), passwordHash, customerId, data.name, verificationToken]
      );
      const dbUser = userRows[0];

      // Create rewards record with welcome bonus
      await client.query(
        `INSERT INTO rewards_points (customer_id, balance, lifetime_earned, tier)
         VALUES ($1, 50, 50, 'bronze')`,
        [customerId]
      );

      // Log welcome points
      await client.query(
        `INSERT INTO points_transactions (customer_id, type, amount, balance_after, description)
         VALUES ($1, 'earned', 50, 50, 'Welcome bonus')`,
        [customerId]
      );

      return dbUser;
    });

    // Send verification email (fire-and-forget)
    const verifyUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://kfarapp.com'}/api/auth/verify?token=${verificationToken}`;
    sendTransactional(data.email.toLowerCase().trim(), 'welcome', {
      customer_name: data.name,
      verification_url: verifyUrl,
      verification_link: `<a href="${verifyUrl}" style="display:inline-block;padding:12px 24px;background:#2D5A27;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;">Verify Email</a>`,
    }).catch(err => console.error('Failed to send verification email:', err));

    return {
      success: true,
      message: 'Registration successful. Please check your email to verify your account.',
    };
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, error: 'Registration failed' };
  }
}

// Refresh access token using refresh token
export async function refreshAccessToken(refreshToken: string): Promise<LoginResult> {
  try {
    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      return { success: false, error: 'Invalid refresh token' };
    }

    // Check session exists and is valid
    const { rows: sessions } = await query(
      'SELECT id FROM user_sessions WHERE user_id = $1 AND refresh_token = $2 AND expires_at > NOW()',
      [payload.userId, refreshToken]
    );

    if (sessions.length === 0) {
      return { success: false, error: 'Session expired' };
    }

    // Get user
    const { rows } = await query<any>(
      'SELECT id, email, role, vendor_id, customer_id, display_name, is_active FROM users WHERE id = $1',
      [payload.userId]
    );

    if (rows.length === 0 || !rows[0].is_active) {
      return { success: false, error: 'User not found or disabled' };
    }

    const dbUser = rows[0];
    const user: AuthUser = {
      id: dbUser.id,
      email: dbUser.email,
      role: dbUser.role,
      vendorId: dbUser.vendor_id || undefined,
      customerId: dbUser.customer_id || undefined,
      displayName: dbUser.display_name || dbUser.email,
      isActive: dbUser.is_active,
    };

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    // Rotate refresh token
    await query(
      `UPDATE user_sessions SET refresh_token = $1, expires_at = NOW() + INTERVAL '7 days'
       WHERE user_id = $2 AND refresh_token = $3`,
      [newRefreshToken, payload.userId, refreshToken]
    );

    return {
      success: true,
      user,
      tokens: { accessToken: newAccessToken, refreshToken: newRefreshToken },
    };
  } catch (error) {
    console.error('Refresh error:', error);
    return { success: false, error: 'Token refresh failed' };
  }
}

// Logout - invalidate session
export async function logout(userId: string, refreshToken?: string): Promise<void> {
  try {
    if (refreshToken) {
      await query(
        'DELETE FROM user_sessions WHERE user_id = $1 AND refresh_token = $2',
        [userId, refreshToken]
      );
    } else {
      // Logout all sessions
      await query('DELETE FROM user_sessions WHERE user_id = $1', [userId]);
    }
  } catch (error) {
    console.error('Logout error:', error);
  }
}

// Get current user from user ID
export async function getUserById(userId: string): Promise<AuthUser | null> {
  try {
    const { rows } = await query<any>(
      'SELECT id, email, role, vendor_id, customer_id, display_name, is_active FROM users WHERE id = $1',
      [userId]
    );

    if (rows.length === 0) return null;

    const dbUser = rows[0];
    return {
      id: dbUser.id,
      email: dbUser.email,
      role: dbUser.role,
      vendorId: dbUser.vendor_id || undefined,
      customerId: dbUser.customer_id || undefined,
      displayName: dbUser.display_name || dbUser.email,
      isActive: dbUser.is_active,
    };
  } catch {
    return null;
  }
}

// Verify email with token
export async function verifyEmail(token: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { rows } = await query<any>(
      `SELECT id, email_verified FROM users WHERE verification_token = $1 AND verification_token_expires > NOW()`,
      [token]
    );

    if (rows.length === 0) {
      return { success: false, error: 'Invalid or expired verification link. Please register again.' };
    }

    if (rows[0].email_verified) {
      return { success: true }; // Already verified
    }

    await query(
      `UPDATE users SET email_verified = true, verification_token = NULL, verification_token_expires = NULL WHERE id = $1`,
      [rows[0].id]
    );

    return { success: true };
  } catch (error) {
    console.error('Email verification error:', error);
    return { success: false, error: 'Verification failed' };
  }
}

// Request password reset - generates token and sends email
export async function requestPasswordReset(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { rows } = await query<any>(
      'SELECT id, display_name FROM users WHERE email = $1 AND is_active = true',
      [email.toLowerCase().trim()]
    );

    // Always return success to prevent email enumeration
    if (rows.length === 0) {
      return { success: true };
    }

    const userId = rows[0].id;
    const displayName = rows[0].display_name || 'Customer';
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Invalidate any existing reset tokens for this user
    await query(
      'UPDATE password_reset_tokens SET used_at = NOW() WHERE user_id = $1 AND used_at IS NULL',
      [userId]
    );

    // Create new reset token (1 hour expiry)
    await query(
      `INSERT INTO password_reset_tokens (user_id, token, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '1 hour')`,
      [userId, resetToken]
    );

    // Send password reset email (fire-and-forget)
    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://kfarapp.com'}/reset-password?token=${resetToken}`;
    sendTransactional(email.toLowerCase().trim(), 'password_reset', {
      customer_name: displayName,
      reset_url: resetUrl,
      expiry_time: '1 hour',
    }).catch(err => console.error('Failed to send password reset email:', err));

    return { success: true };
  } catch (error) {
    console.error('Password reset request error:', error);
    return { success: false, error: 'Failed to process request' };
  }
}

// Reset password with token
export async function resetPassword(token: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Find valid token
    const { rows } = await query<any>(
      `SELECT id, user_id FROM password_reset_tokens
       WHERE token = $1 AND expires_at > NOW() AND used_at IS NULL`,
      [token]
    );

    if (rows.length === 0) {
      return { success: false, error: 'Invalid or expired reset link. Please request a new one.' };
    }

    const { id: tokenId, user_id: userId } = rows[0];

    // Validate password
    if (!newPassword || newPassword.length < 8) {
      return { success: false, error: 'Password must be at least 8 characters' };
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update password and mark token as used
    await query('UPDATE users SET password_hash = $1 WHERE id = $2', [passwordHash, userId]);
    await query('UPDATE password_reset_tokens SET used_at = NOW() WHERE id = $1', [tokenId]);

    // Invalidate all sessions (force re-login with new password)
    await query('DELETE FROM user_sessions WHERE user_id = $1', [userId]);

    return { success: true };
  } catch (error) {
    console.error('Password reset error:', error);
    return { success: false, error: 'Password reset failed' };
  }
}

// Resend verification email
export async function resendVerification(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { rows } = await query<any>(
      'SELECT id, display_name, email_verified FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );

    if (rows.length === 0) {
      return { success: true }; // Don't reveal if email exists
    }

    if (rows[0].email_verified) {
      return { success: false, error: 'Email is already verified. You can log in.' };
    }

    const newToken = crypto.randomBytes(32).toString('hex');
    await query(
      `UPDATE users SET verification_token = $1, verification_token_expires = NOW() + INTERVAL '24 hours' WHERE id = $2`,
      [newToken, rows[0].id]
    );

    const verifyUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://kfarapp.com'}/api/auth/verify?token=${newToken}`;
    sendTransactional(email.toLowerCase().trim(), 'welcome', {
      customer_name: rows[0].display_name || 'Customer',
      verification_url: verifyUrl,
      verification_link: `<a href="${verifyUrl}" style="display:inline-block;padding:12px 24px;background:#2D5A27;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;">Verify Email</a>`,
    }).catch(err => console.error('Failed to resend verification email:', err));

    return { success: true };
  } catch (error) {
    console.error('Resend verification error:', error);
    return { success: false, error: 'Failed to resend verification email' };
  }
}

// Clean up expired sessions (run periodically)
export async function cleanupExpiredSessions(): Promise<void> {
  await query('DELETE FROM user_sessions WHERE expires_at < NOW()');
}

// Generate tokens for a known user and store session in DB.
// Used by onboarding routes that create the user record themselves.
export async function generateTokensForUser(user: AuthUser): Promise<{ accessToken: string; refreshToken: string }> {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  await query(
    `INSERT INTO user_sessions (user_id, refresh_token, expires_at)
     VALUES ($1, $2, NOW() + INTERVAL '7 days')`,
    [user.id, refreshToken]
  );
  return { accessToken, refreshToken };
}
