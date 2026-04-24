'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Redirect to the login page in register mode
export default function CustomerRegister() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/customer/login?mode=register')
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Redirecting to registration...</p>
      </div>
    </div>
  )
}
