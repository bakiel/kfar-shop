'use client';

import { useEffect } from 'react';

export default function TestVoiceChatPage() {
  useEffect(() => {
    console.log('Test page mounted');
    
    // Check if VoiceFirstChat is listening
    const checkListener = () => {
      console.log('Checking if voice chat listener exists...');
      
      // Wait a bit for dynamic import to complete
      setTimeout(() => {
        console.log('Dispatching test event...');
        const event = new CustomEvent('open-voice-chat');
        window.dispatchEvent(event);
      }, 2000);
    };
    
    checkListener();
  }, []);
  
  const handleTestClick = () => {
    console.log('Manual test button clicked');
    const event = new CustomEvent('open-voice-chat');
    window.dispatchEvent(event);
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-8">Voice Chat Test Page</h1>
      
      <div className="space-y-4 max-w-md w-full">
        <button
          onClick={handleTestClick}
          className="w-full px-4 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
        >
          Test Voice Chat Event
        </button>
        
        <div className="bg-gray-100 p-4 rounded-lg">
          <p className="text-sm text-gray-600">
            Check the browser console for debug messages. The voice chat should open automatically after 2 seconds, or when you click the button.
          </p>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-800">
            Expected console logs:
          </p>
          <ul className="text-xs mt-2 space-y-1">
            <li>🎤 Voice chat listener registered</li>
            <li>🎤 Voice chat event received!</li>
            <li>Voice chat modal should open</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
