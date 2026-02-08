'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function CustomerJoinPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the customer onboarding page
    router.replace('/customer/onboarding');
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-semibold mb-2">Redirecting...</h1>
        <p className="text-gray-600">Taking you to customer onboarding</p>
      </div>
    </div>
  );
}
