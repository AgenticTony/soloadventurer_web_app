'use client';

import { Suspense } from 'react';
import { ArrowLeft, Shield, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { PrivacyProvider, usePrivacy } from '@/contexts/PrivacyContext';
import { LocationSettings, PrivacyControls } from '@/components/settings';

function PrivacyPageContent() {
  const { resetToDefaults } = usePrivacy();

  const handleResetSettings = () => {
    if (confirm('Are you sure you want to reset all privacy settings to defaults? This action cannot be undone.')) {
      resetToDefaults();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/settings"
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              aria-label="Back to settings"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Shield className="h-6 w-6 text-blue-600" />
                Privacy Settings
              </h1>
              <p className="text-gray-600 mt-1">
                Control your location privacy and who can see your information
              </p>
            </div>
          </div>

          <button
            onClick={handleResetSettings}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            Reset to Defaults
          </button>
        </div>

        {/* Privacy Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium">Your Privacy Matters</p>
              <p className="mt-1">
                These settings control how your location and profile information are shared with other users.
                We&apos;ve set privacy-first defaults to protect your information, but you can adjust these settings
                to match your comfort level.
              </p>
            </div>
          </div>
        </div>

        {/* Settings Sections */}
        <div className="space-y-8">
          {/* Location Privacy */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <LocationSettings />
          </div>

          {/* Privacy Controls */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <PrivacyControls />
          </div>
        </div>

        {/* Footer Information */}
        <div className="mt-8 p-6 bg-gray-100 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-3">Important Privacy Information</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• Your location data is encrypted and stored securely on our servers</p>
            <p>• We never sell or share your personal information with third parties</p>
            <p>• You can download or delete all your data at any time from account settings</p>
            <p>• These privacy settings only affect other users - not core app functionality</p>
            <p>• Changes to privacy settings take effect immediately</p>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              For more information, see our{' '}
              <Link href="/privacy" className="text-blue-600 hover:underline">
                Privacy Policy
              </Link>
              {' '}and{' '}
              <Link href="/terms" className="text-blue-600 hover:underline">
                Terms of Service
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Loading fallback
function PrivacyPageLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-9 h-9 bg-gray-200 rounded-lg animate-pulse" />
          <div>
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-5 w-96 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 bg-blue-200 rounded animate-pulse mt-0.5" />
            <div className="flex-1">
              <div className="h-4 w-32 bg-blue-200 rounded animate-pulse mb-2" />
              <div className="space-y-2">
                <div className="h-3 w-full bg-blue-200 rounded animate-pulse" />
                <div className="h-3 w-3/4 bg-blue-200 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Settings skeleton */}
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start gap-3 mb-6">
                <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse" />
                <div>
                  <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-2" />
                  <div className="h-4 w-64 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-16 bg-gray-100 rounded-lg animate-pulse" />
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function PrivacyPage() {
  return (
    <PrivacyProvider>
      <Suspense fallback={<PrivacyPageLoading />}>
        <PrivacyPageContent />
      </Suspense>
    </PrivacyProvider>
  );
}