'use client';

import React from 'react';
import Image from 'next/image';
import { Bot, X, ArrowLeft, ArrowRight } from 'lucide-react';

interface MobileOnboardingLayoutProps {
  currentStep: number;
  totalSteps: number;
  stepTitle: string;
  aiMessage: string;
  showAIAssistant: boolean;
  setShowAIAssistant: (show: boolean) => void;
  children: React.ReactNode;
  onNext?: () => void;
  onPrev?: () => void;
  isNextDisabled?: boolean;
  isPrevDisabled?: boolean;
}

export default function MobileOnboardingLayout({
  currentStep,
  totalSteps,
  stepTitle,
  aiMessage,
  showAIAssistant,
  setShowAIAssistant,
  children,
  onNext,
  onPrev,
  isNextDisabled = false,
  isPrevDisabled = false
}: MobileOnboardingLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cream to-white">
      {/* Mobile Header - Fixed */}
      <div className="sticky top-0 z-40 bg-white shadow-sm">
        <div className="px-4 py-3">
          {/* Logo and Progress */}
          <div className="flex items-center justify-between mb-2">
            <Image
              src="/images/logos/kfar_logo_green.png"
              alt="KFAR"
              width={80}
              height={20}
              className="h-6 w-auto"
            />
            <button
              onClick={() => setShowAIAssistant(!showAIAssistant)}
              className="w-8 h-8 bg-leaf-green/10 text-leaf-green rounded-full flex items-center justify-center"
            >
              <Bot className="w-4 h-4 stroke-[1.5]" />
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-leaf-green h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
          
          {/* Step Title */}
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-gray-500">Step {currentStep} of {totalSteps}</span>
            <span className="text-sm font-semibold text-gray-800">{stepTitle}</span>
          </div>
        </div>
      </div>

      {/* AI Assistant Overlay - Mobile */}
      {showAIAssistant && (
        <div className="fixed inset-0 z-50 bg-black/50 lg:hidden">
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[70vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-leaf-green/10 rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5 stroke-[1.5] text-leaf-green" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">AI Assistant</h3>
                  <p className="text-xs text-gray-500">Your guide</p>
                </div>
              </div>
              <button
                onClick={() => setShowAIAssistant(false)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center"
              >
                <X className="w-4 h-4 stroke-[1.5] text-gray-500" />
              </button>
            </div>
            
            <div className="p-4">
              {/* AI Message */}
              <div className="bg-leaf-green/5 rounded-lg p-3 mb-4">
                <p className="text-sm text-gray-700">{aiMessage}</p>
              </div>
              
              {/* Quick Tips */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-800">Quick Tips:</h4>
                <ul className="text-xs text-gray-600 space-y-1">
                  {currentStep === 1 && (
                    <>
                      <li>• Choose a unique store name</li>
                      <li>• Add Hebrew translation</li>
                      <li>• Select relevant category</li>
                    </>
                  )}
                  {currentStep === 2 && (
                    <>
                      <li>• Logo: Square format (800x800)</li>
                      <li>• Banner: Landscape (3:1 ratio)</li>
                      <li>• Images auto-processed</li>
                    </>
                  )}
                  {currentStep === 3 && (
                    <>
                      <li>• Accurate contact info</li>
                      <li>• Delivery options</li>
                      <li>• Business hours</li>
                    </>
                  )}
                  {currentStep === 4 && (
                    <>
                      <li>• Product images: Square</li>
                      <li>• AI enhances descriptions</li>
                      <li>• Auto-translation</li>
                      <li>• Mark dietary options</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content - Scrollable */}
      <div className="px-4 py-4 pb-24">
        {children}
      </div>

      {/* Mobile Navigation - Fixed Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t px-4 py-3 z-30">
        <div className="flex gap-3">
          {currentStep > 1 && (
            <button
              onClick={onPrev}
              disabled={isPrevDisabled}
              className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4 stroke-[1.5] inline mr-2" />
              Previous
            </button>
          )}
          {currentStep < totalSteps && (
            <button
              onClick={onNext}
              disabled={isNextDisabled}
              className="flex-1 py-3 px-4 bg-leaf-green text-white rounded-lg text-sm font-medium hover:bg-leaf-green-dark disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
            >
              Continue
              <ArrowRight className="w-4 h-4 stroke-[1.5] inline ml-2" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}