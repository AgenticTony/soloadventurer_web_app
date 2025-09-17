import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Shield, 
  Calendar, 
  Zap, 
  Award, 
  MapPin, 
  Globe, 
  Camera,
  Users,
  Star,
  Crown,
  Target
} from "lucide-react"

interface AchievementBadgeProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  description: string
  unlocked: boolean
  progress?: number
  maxProgress?: number
  variant?: "default" | "country" | "city" | "special"
}

export function AchievementBadge({ 
  icon: Icon, 
  label, 
  description, 
  unlocked, 
  progress,
  maxProgress = 1,
  variant = "default" 
}: AchievementBadgeProps) {
  const getVariantStyles = () => {
    if (!unlocked) return "bg-gray-100 opacity-50 dark:bg-gray-900"
    
    switch (variant) {
      case "country":
        return "bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 border-blue-300 dark:border-blue-700"
      case "city":
        return "bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800 border-purple-300 dark:border-purple-700"
      case "special":
        return "bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900 dark:to-yellow-800 border-yellow-300 dark:border-yellow-700"
      default:
        return "bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900"
    }
  }

  const getIconStyles = () => {
    if (!unlocked) return "bg-gray-300 text-gray-500 dark:bg-gray-700"
    
    switch (variant) {
      case "country":
        return "bg-gradient-to-br from-blue-500 to-blue-600 text-white"
      case "city":
        return "bg-gradient-to-br from-purple-500 to-purple-600 text-white"
      case "special":
        return "bg-gradient-to-br from-yellow-500 to-yellow-600 text-white"
      default:
        return "bg-gradient-to-br from-blue-500 to-purple-600 text-white"
    }
  }

  return (
    <Card className={`h-full transition-all hover:scale-105 ${getVariantStyles()} border`}>
      <CardContent className="p-4 text-center">
        <div
          className={`mx-auto mb-3 inline-flex rounded-full p-3 ${getIconStyles()}`}
        >
          <Icon className="h-6 w-6" />
        </div>
        
        <h3 className="mb-1 font-semibold text-sm">{label}</h3>
        <p className="mb-3 text-xs text-muted-foreground">{description}</p>
        
        {progress !== undefined && maxProgress > 1 && (
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">
              {progress}/{maxProgress}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
              <div 
                className="bg-blue-600 h-1.5 rounded-full transition-all"
                style={{ width: `${(progress / maxProgress) * 100}%` }}
              />
            </div>
          </div>
        )}
        
        {unlocked && (
          <Badge variant="secondary" className="mt-2 text-xs">
            Unlocked
          </Badge>
        )}
      </CardContent>
    </Card>
  )
}

interface AchievementGridProps {
  countriesVisited: number
  citiesExplored: number
  hasProfilePhoto: boolean
  hasCompletedBio: boolean
  hasRecommendedFriend: boolean
  hasCreatedTrip: boolean
  emailVerified: boolean
  memberSince: string
}

export function AchievementGrid({
  countriesVisited,
  citiesExplored,
  hasProfilePhoto,
  hasCompletedBio,
  hasRecommendedFriend,
  hasCreatedTrip,
  emailVerified,
  memberSince
}: AchievementGridProps) {
  
  const achievements: AchievementBadgeProps[] = [
    // Profile Achievements
    {
      icon: Shield,
      label: "Profile Verified",
      description: "Email verified",
      unlocked: emailVerified,
      variant: "special"
    },
    {
      icon: Calendar,
      label: "Early Adopter",
      description: `Joined ${new Date(memberSince).getFullYear()}`,
      unlocked: true,
      variant: "special"
    },
    {
      icon: Zap,
      label: "Profile Complete",
      description: "All sections filled",
      unlocked: hasCompletedBio && hasProfilePhoto,
      variant: "special"
    },
    
    // Travel Achievements - Country based
    {
      icon: Globe,
      label: "First Country",
      description: "Visit your first country",
      unlocked: countriesVisited >= 1,
      variant: "country",
      progress: Math.min(countriesVisited, 1),
      maxProgress: 1
    },
    {
      icon: Globe,
      label: "World Explorer",
      description: "Visit 5 countries",
      unlocked: countriesVisited >= 5,
      variant: "country",
      progress: countriesVisited,
      maxProgress: 5
    },
    {
      icon: Globe,
      label: "Globe Trotter",
      description: "Visit 10 countries",
      unlocked: countriesVisited >= 10,
      variant: "country",
      progress: countriesVisited,
      maxProgress: 10
    },
    
    // Travel Achievements - City based
    {
      icon: MapPin,
      label: "City Explorer",
      description: "Visit 5 cities",
      unlocked: citiesExplored >= 5,
      variant: "city",
      progress: citiesExplored,
      maxProgress: 5
    },
    {
      icon: MapPin,
      label: "Urban Adventurer",
      description: "Visit 20 cities",
      unlocked: citiesExplored >= 20,
      variant: "city",
      progress: citiesExplored,
      maxProgress: 20
    },
    
    // Social Achievements
    {
      icon: Users,
      label: "Social Connector",
      description: "Recommend a friend",
      unlocked: hasRecommendedFriend,
      variant: "special"
    },
    {
      icon: Star,
      label: "Trip Creator",
      description: "Create your first trip",
      unlocked: hasCreatedTrip,
      variant: "special"
    }
  ]

  return (
    <div className="grid grid-cols-2 gap-4">
      {achievements.map((achievement, index) => (
        <AchievementBadge key={index} {...achievement} />
      ))}
    </div>
  )
}