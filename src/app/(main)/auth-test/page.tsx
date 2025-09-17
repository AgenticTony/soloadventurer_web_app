'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useEffect, useState } from 'react'
import { fetchAuthSession, getCurrentUser } from 'aws-amplify/auth'

export default function AuthTestPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const [sessionInfo, setSessionInfo] = useState<{
    hasTokens: boolean
    hasAccessToken: boolean
    hasIdToken: boolean
    userSub?: string
    identityId?: string
  } | null>(null)
  const [currentUserInfo, setCurrentUserInfo] = useState<{
    userId: string
    username: string
  } | null>(null)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    try {
      const session = await fetchAuthSession()
      setSessionInfo({
        hasTokens: !!session.tokens,
        hasAccessToken: !!session.tokens?.accessToken,
        hasIdToken: !!session.tokens?.idToken,
        userSub: session.userSub,
        identityId: session.identityId
      })

      const currentUser = await getCurrentUser()
      setCurrentUserInfo({
        userId: currentUser.userId,
        username: currentUser.username
      })
    } catch (err) {
      console.error('Error checking session:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Authentication Test Page</h1>
      
      <div className="space-y-6">
        {/* Context State */}
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-bold mb-2">Auth Context State:</h2>
          <pre className="text-sm">
            {JSON.stringify({
              isLoading,
              isAuthenticated,
              user
            }, null, 2)}
          </pre>
        </div>

        {/* Session Info */}
        <div className="bg-blue-100 p-4 rounded">
          <h2 className="font-bold mb-2">Direct Session Check:</h2>
          <pre className="text-sm">
            {JSON.stringify(sessionInfo, null, 2)}
          </pre>
        </div>

        {/* Current User Info */}
        <div className="bg-green-100 p-4 rounded">
          <h2 className="font-bold mb-2">Current User Info:</h2>
          <pre className="text-sm">
            {JSON.stringify(currentUserInfo, null, 2)}
          </pre>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-100 p-4 rounded">
            <h2 className="font-bold mb-2">Error:</h2>
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={checkSession}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Refresh Session Info
          </button>
          <button
            onClick={() => window.location.href = '/feed'}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Go to Feed
          </button>
          <button
            onClick={() => window.location.href = '/login'}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Go to Login
          </button>
        </div>
      </div>
    </div>
  )
}