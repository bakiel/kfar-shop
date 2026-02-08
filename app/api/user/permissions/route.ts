import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

export async function GET(request: NextRequest) {
  try {
    // Get auth token from cookies
    const cookieStore = cookies()
    const token = cookieStore.get('auth-token')
    
    if (!token) {
      return NextResponse.json({
        isAuthenticated: false,
        isSuperAdmin: false,
        isVendor: false,
        vendorId: null
      })
    }
    
    try {
      // Decode JWT token
      const decoded = jwt.verify(token.value, process.env.JWT_SECRET || 'your-secret-key') as any
      
      return NextResponse.json({
        isAuthenticated: true,
        isSuperAdmin: decoded.role === 'superadmin',
        isVendor: decoded.role === 'vendor',
        vendorId: decoded.vendorId || null,
        userId: decoded.userId,
        email: decoded.email
      })
    } catch (error) {
      // Invalid token
      return NextResponse.json({
        isAuthenticated: false,
        isSuperAdmin: false,
        isVendor: false,
        vendorId: null
      })
    }
  } catch (error) {
    console.error('Error checking permissions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}