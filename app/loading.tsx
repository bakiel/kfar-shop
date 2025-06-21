export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cream-base">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ backgroundColor: '#478c0b' }}>
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="text-lg font-semibold" style={{ color: '#3a3a1d' }}>
          Loading KFAR Marketplace...
        </p>
      </div>
    </div>
  )
}