import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cream-base">
      <div className="text-center p-8 max-w-md">
        <h1 className="text-8xl font-bold mb-4" style={{ color: '#f6af0d' }}>
          404
        </h1>
        <h2 className="text-3xl font-bold mb-4" style={{ color: '#3a3a1d' }}>
          <i className="fas fa-map-marked-alt mr-3"></i>
          Page Not Found
        </h2>
        <p className="text-gray-600 mb-8">
          Sorry, we couldn't find the page you're looking for. 
          It might have been moved or doesn't exist.
        </p>
        <Link
          href="/"
          className="inline-flex items-center px-6 py-3 rounded-lg text-white font-semibold hover:shadow-lg transition-all duration-300"
          style={{ backgroundColor: '#478c0b' }}
        >
          <i className="fas fa-home mr-2"></i>
          Back to Home
        </Link>
      </div>
    </div>
  )
}