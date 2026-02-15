import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query, transaction } from '@/lib/db/postgres-client';

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
}

// Secrets - fallback to env vars, production uses Doppler
const JWT_SECRET = process.env.JWT_SECRET || 'kfar-jwt-secret-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'kfar-jwt-refresh-secret-change-in-production';
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
      'SELECT id, email, password_hash, role, vendor_id, customer_id, display_name, is_active FROM users WHERE email = $1',
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

    const result = await transaction(async (client) => {
      // Create customer record
      const { rows: customerRows } = await client.query(
        `INSERT INTO customers (name, email, phone, points, loyalty_tier)
         VALUES ($1, $2, $3, 50, 'bronze')
         RETURNING id`,
        [data.name, data.email.toLowerCase().trim(), data.phone || null]
      );
      const customerId = customerRows[0].id;

      // Create user record
      const { rows: userRows } = await client.query(
        `INSERT INTO users (email, password_hash, role, customer_id, display_name)
         VALUES ($1, $2, 'customer', $3, $4)
         RETURNING id, email, role, customer_id, display_name, is_active`,
        [data.email.toLowerCase().trim(), passwordHash, customerId, data.name]
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

    const user: AuthUser = {
      id: result.id,
      email: result.email,
      role: result.role,
      customerId: result.customer_id,
      displayName: result.display_name || data.name,
      isActive: true,
    };

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await query(
      `INSERT INTO user_sessions (user_id, refresh_token, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '7 days')`,
      [user.id, refreshToken]
    );

    return {
      success: true,
      user,
      tokens: { accessToken, refreshToken },
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

// Clean up expired sessions (run periodically)
export async function cleanupExpiredSessions(): Promise<void> {
  await query('DELETE FROM user_sessions WHERE expires_at < NOW()');
}
