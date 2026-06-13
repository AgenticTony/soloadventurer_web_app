'use client'

import { Suspense } from 'react'
import { ArrowLeft, Shield, RotateCcw } from 'lucide-react'
import Link from 'next/link'
import { PrivacyProvider, usePrivacy } from '@/contexts/PrivacyContext'
import { LocationSettings, PrivacyControls } from '@/components/settings'
import { SocialPrivacy } from '@/components/settings/SocialPrivacy'

function PrivacyPageContent() {
  const { resetToDefaults } = usePrivacy()

  const handleResetSettings = () => {
    if (
      confirm(
        'Are you sure you want to reset all privacy settings to defaults? This action cannot be undone.'
      )
    ) {
      resetToDefaults()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/settings"
              className="rounded-lg p-2 transition-colors hover:bg-gray-200"
              aria-label="Back to settings"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
                <Shield className="h-6 w-6 text-blue-600" />
                Privacy Settings
              </h1>
              <p className="mt-1 text-gray-600">
                Control your location privacy, social features, and who can see your information
              </p>
            </div>
          </div>

          <button
            onClick={handleResetSettings}
            className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50"
          >
            <RotateCcw className="h-4 w-4" />
            Reset to Defaults
          </button>
        </div>

        {/* Privacy Notice */}
        <div className="mb-8 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-start gap-3">
            <Shield className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
            <div className="text-sm text-blue-800">
              <p className="font-medium">Your Privacy Matters</p>
              <p className="mt-1">
                These settings control how your location, social interactions, and profile
                information are shared with other users. We&apos;ve set privacy-first defaults to
                protect your information, but you can adjust these settings to match your comfort
                level.
              </p>
            </div>
          </div>
        </div>

        {/* Settings Sections */}
        <div className="space-y-8">
          {/* Location Privacy */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <LocationSettings />
          </div>

          {/* Social Features Privacy */}
          <SocialPrivacy />

          {/* Privacy Controls */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <PrivacyControls />
          </div>
        </div>

        {/* Footer Information */}
        <div className="mt-8 rounded-lg bg-gray-100 p-6">
          <h3 className="mb-3 font-medium text-gray-900">Important Privacy Information</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• Your location data is encrypted and stored securely on our servers</p>
            <p>• We never sell or share your personal information with third parties</p>
            <p>• You can download or delete all your data at any time from account settings</p>
            <p>• These privacy settings only affect other users - not core app functionality</p>
            <p>• Changes to privacy settings take effect immediately</p>
          </div>
          <div className="mt-4 border-t border-gray-200 pt-4">
            <p className="text-xs text-gray-500">
              For more information, see our{' '}
              <Link href="/privacy" className="text-blue-600 hover:underline">
                Privacy Policy
              </Link>{' '}
              and{' '}
              <Link href="/terms" className="text-blue-600 hover:underline">
                Terms of Service
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Loading fallback
function PrivacyPageLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center gap-4">
          <div className="h-9 w-9 animate-pulse rounded-lg bg-gray-200" />
          <div>
            <div className="mb-2 h-8 w-48 animate-pulse rounded bg-gray-200" />
            <div className="h-5 w-96 animate-pulse rounded bg-gray-200" />
          </div>
        </div>

        <div className="mb-8 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 h-5 w-5 animate-pulse rounded bg-blue-200" />
            <div className="flex-1">
              <div className="mb-2 h-4 w-32 animate-pulse rounded bg-blue-200" />
              <div className="space-y-2">
                <div className="h-3 w-full animate-pulse rounded bg-blue-200" />
                <div className="h-3 w-3/4 animate-pulse rounded bg-blue-200" />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Settings skeleton */}
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="rounded-lg border border-gray-200 bg-white p-6">
              <div className="mb-6 flex items-start gap-3">
                <div className="h-10 w-10 animate-pulse rounded-lg bg-gray-200" />
                <div>
                  <div className="mb-2 h-6 w-32 animate-pulse rounded bg-gray-200" />
                  <div className="h-4 w-64 animate-pulse rounded bg-gray-200" />
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-16 animate-pulse rounded-lg bg-gray-100" />
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-12 animate-pulse rounded bg-gray-100" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function PrivacyPage() {
  return (
    <PrivacyProvider>
      <Suspense fallback={<PrivacyPageLoading />}>
        <PrivacyPageContent />
      </Suspense>
    </PrivacyProvider>
  )
}
