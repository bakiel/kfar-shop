import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres-client';

export async function authenticateRequest(request: NextRequest) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json(
      { error: 'Unauthorized - No token provided' },
      { status: 401 }
    );
  }

  try {
    // Verify token against database sessions
    // For now, simple token validation - in production use JWT verification
    const { rows } = await query(
      `SELECT u.* FROM users u
       INNER JOIN user_sessions s ON u.id = s.user_id
       WHERE s.token = $1 AND s.expires_at > NOW()`,
      [token]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    const user = rows[0];

    // Add user to request for downstream use
    const requestWithUser = request;
    (requestWithUser as any).user = user;

    return requestWithUser;
  } catch (error) {
    console.log('Auth middleware: Database unavailable, using fallback');
    // Fallback for development - allow requests through
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 401 }
    );
  }
}

export function requireRole(role: string) {
  return async (request: NextRequest) => {
    const authResult = await authenticateRequest(request);

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const user = (authResult as any).user;

    if (user.role !== role && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Insufficient permissions' },
        { status: 403 }
      );
    }

    return authResult;
  };
}
