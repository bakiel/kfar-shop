'use client';

import React from 'react';

interface QRErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface QRErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

class QRErrorBoundary extends React.Component<QRErrorBoundaryProps, QRErrorBoundaryState> {
  constructor(props: QRErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): QRErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('QR Component Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return <>{this.props.fallback}</>;
      }

      return (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <i className="fas fa-exclamation-triangle text-red-500 text-2xl"></i>
          </div>
          <h3 className="text-lg font-semibold mb-2">QR Code Error</h3>
          <p className="text-gray-600 text-sm mb-4">
            Unable to generate QR code. Please refresh the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default QRErrorBoundary;