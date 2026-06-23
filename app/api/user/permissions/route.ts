import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyAccessToken } from '@/lib/services/auth-service'

export async function GET(request: NextRequest) {
  try {
    // Get auth token from cookies
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')

    if (!token) {
      return NextResponse.json({
        isAuthenticated: false,
        isSuperAdmin: false,
        isVendor: false,
        vendorId: null
      })
    }

    // Verify JWT token using auth-service (no insecure fallback secret)
    const user = verifyAccessToken(token.value)

    if (!user) {
      // Invalid or expired token
      return NextResponse.json({
        isAuthenticated: false,
        isSuperAdmin: false,
        isVendor: false,
        vendorId: null
      })
    }

    return NextResponse.json({
      isAuthenticated: true,
      isSuperAdmin: user.role === 'admin',
      isVendor: user.role === 'vendor',
      vendorId: user.vendorId || null,
      userId: user.id,
      email: user.email
    })
  } catch (error) {
    console.error('Error checking permissions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
