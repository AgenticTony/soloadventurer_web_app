import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  User,
  MapPin,
  Calendar,
  Users,
  Camera,
  Globe,
  CheckCircle,
  Circle,
  Plus,
  Target,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

interface ProfileCompletionItem {
  id: string
  label: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  completed: boolean
  action?: {
    label: string
    route: string
  }
}

export function ProfileCompletionTracker() {
  const { user } = useAuth()
  const router = useRouter()

  if (!user) return null

  const completionItems: ProfileCompletionItem[] = [
    {
      id: 'name',
      label: 'Add Your Name',
      description: 'Help others recognize you',
      icon: User,
      completed: !!user.name && !user.name.includes('@'),
      action: {
        label: 'Add Name',
        route: '/profile',
      },
    },
    {
      id: 'location',
      label: 'Set Your Location',
      description: "Let others know where you're based",
      icon: MapPin,
      completed: !!user.location,
      action: {
        label: 'Add Location',
        route: '/profile',
      },
    },
    {
      id: 'countries',
      label: 'Add Countries Visited',
      description: 'Share your travel experience',
      icon: Globe,
      completed: false, // This would be tracked separately
      action: {
        label: 'Add Countries',
        route: '/trips',
      },
    },
    {
      id: 'photo',
      label: 'Profile Photo',
      description: 'Add a face to your profile',
      icon: Camera,
      completed: false, // This would be tracked separately
      action: {
        label: 'Upload Photo',
        route: '/profile',
      },
    },
    {
      id: 'bio',
      label: 'Complete Bio',
      description: 'Share your travel story',
      icon: User,
      completed: !!(user.bio && user.bio.length > 10),
      action: {
        label: 'Edit Bio',
        route: '/profile',
      },
    },
    {
      id: 'trip',
      label: 'Create Your First Trip',
      description: 'Plan your next adventure',
      icon: Target,
      completed: false, // This would be tracked separately
      action: {
        label: 'Create Trip',
        route: '/trips',
      },
    },
    {
      id: 'friend',
      label: 'Recommend a Friend',
      description: 'Grow the travel community',
      icon: Users,
      completed: false, // This would be tracked separately
      action: {
        label: 'Invite Friend',
        route: '/messages',
      },
    },
  ]

  const completedItems = completionItems.filter(item => item.completed).length
  const totalItems = completionItems.length
  const completionPercentage = Math.round((completedItems / totalItems) * 100)

  const getCompletionLevel = () => {
    if (completionPercentage >= 80)
      return { level: 'Expert', color: 'text-green-600', bgColor: 'bg-green-100' }
    if (completionPercentage >= 60)
      return { level: 'Advanced', color: 'text-blue-600', bgColor: 'bg-blue-100' }
    if (completionPercentage >= 40)
      return { level: 'Intermediate', color: 'text-yellow-600', bgColor: 'bg-yellow-100' }
    if (completionPercentage >= 20)
      return { level: 'Beginner', color: 'text-orange-600', bgColor: 'bg-orange-100' }
    return { level: 'Starter', color: 'text-gray-600', bgColor: 'bg-gray-100' }
  }

  const completionLevel = getCompletionLevel()

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Profile Completion
          </span>
          <Badge className={`${completionLevel.bgColor} ${completionLevel.color} border-0`}>
            {completionLevel.level} Traveler
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">{completionPercentage}% Complete</span>
            <span className="text-muted-foreground">
              {completedItems}/{totalItems} tasks
            </span>
          </div>
          <Progress value={completionPercentage} className="h-3" />
        </div>

        {/* Completion Items */}
        <div className="grid gap-3 md:grid-cols-2">
          {completionItems.map(item => (
            <div
              key={item.id}
              className={`flex items-center justify-between rounded-lg border p-3 transition-colors ${
                item.completed
                  ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20'
                  : 'border-border bg-muted/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  {item.completed ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <item.icon className="h-4 w-4 text-muted-foreground" />
                    <span
                      className={`text-sm font-medium ${item.completed ? 'text-foreground' : 'text-muted-foreground'}`}
                    >
                      {item.label}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{item.description}</p>
                </div>
              </div>

              {!item.completed && item.action && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => router.push(item.action!.route)}
                  className="ml-2 flex-shrink-0"
                >
                  <Plus className="mr-1 h-3 w-3" />
                  {item.action.label}
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* Call to Action */}
        {completionPercentage < 100 && (
          <div className="border-t pt-4 text-center">
            <p className="mb-3 text-sm text-muted-foreground">
              Complete your profile to unlock more features and connect with fellow travelers!
            </p>
            <div className="flex justify-center gap-2">
              <Button variant="outline" onClick={() => router.push('/profile')} className="text-sm">
                Edit Profile
              </Button>
              <Button onClick={() => router.push('/trips')} className="text-sm">
                Plan Trip
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
