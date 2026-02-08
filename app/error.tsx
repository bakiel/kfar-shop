'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream-base">
      <div className="text-center p-8 max-w-md">
        <h2 className="text-3xl font-bold mb-4" style={{ color: '#c23c09' }}>
          <i className="fas fa-exclamation-triangle mr-3"></i>
          Something went wrong!
        </h2>
        <p className="text-gray-600 mb-6">
          We apologize for the inconvenience. An error occurred while loading this page.
        </p>
        <button
          onClick={reset}
          className="px-6 py-3 rounded-lg text-white font-semibold hover:shadow-lg transition-all duration-300"
          style={{ backgroundColor: '#478c0b' }}
        >
          <i className="fas fa-redo mr-2"></i>
          Try again
        </button>
      </div>
    </div>
  )
}