'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'

interface ProfileCardProps {
  user?: {
    id: string
    name: string
    email: string
    avatar?: string
    bio?: string
    location?: string
    emailVerified: boolean
  }
  isOwnProfile?: boolean
  onEdit?: () => void
}

export function ProfileCard({ user, isOwnProfile = false, onEdit }: ProfileCardProps) {
  const { user: currentUser } = useAuth()
  const displayUser = user || currentUser

  if (!displayUser) {
    return <div>Loading profile...</div>
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-purple-500 text-2xl font-bold text-white">
          {displayUser.name.charAt(0).toUpperCase()}
        </div>

        <CardTitle className="text-xl">{displayUser.name}</CardTitle>
        {displayUser.location && (
          <CardDescription className="flex items-center justify-center gap-1">
            📍 {displayUser.location}
          </CardDescription>
        )}

        {displayUser.emailVerified && (
          <div className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs text-green-800">
            ✓ Verified
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {displayUser.bio && (
          <div>
            <p className="text-sm text-gray-600">{displayUser.bio}</p>
          </div>
        )}

        <div className="text-sm text-gray-500">
          <p>📧 {displayUser.email}</p>
          <p>👤 Member since {new Date().toLocaleDateString()}</p>
        </div>

        {/* Travel Stats */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-lg bg-gray-50 p-2">
            <div className="text-lg font-bold text-blue-600">0</div>
            <div className="text-xs text-gray-600">Trips</div>
          </div>
          <div className="rounded-lg bg-gray-50 p-2">
            <div className="text-lg font-bold text-green-600">0</div>
            <div className="text-xs text-gray-600">Buddies</div>
          </div>
          <div className="rounded-lg bg-gray-50 p-2">
            <div className="text-lg font-bold text-purple-600">0</div>
            <div className="text-xs text-gray-600">Reviews</div>
          </div>
        </div>

        {isOwnProfile && (
          <Button onClick={onEdit} className="w-full">
            Edit Profile
          </Button>
        )}

        {!isOwnProfile && (
          <div className="space-y-2">
            <Button variant="outline" className="w-full">
              Send Message
            </Button>
            <Button variant="outline" className="w-full">
              Add Travel Buddy
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
