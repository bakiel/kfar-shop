'use client'

import { useState } from 'react'

export default function TestComponent() {
  const [test, setTest] = useState(false)
  
  const completeOnboarding = async () => {
    console.log('test')
  }

  return (
    <div className="min-h-screen flex kfar-bg-cream">
      <div>Test</div>
    </div>
  )
}