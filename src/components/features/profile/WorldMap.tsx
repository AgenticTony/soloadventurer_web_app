'use client'

import { useState } from 'react'
// @ts-expect-error - react-simple-maps doesn't have TypeScript definitions
import { 
  ComposableMap, 
  Geographies, 
  Geography, 
  ZoomableGroup
} from 'react-simple-maps'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Globe, Navigation } from 'lucide-react'

// Type definitions
interface GeoProperties {
  ISO_A3: string
  NAME: string
}

interface GeographyObject {
  rsmKey: string
  properties: GeoProperties
}

// World map topology URL
const geoUrl = "https://raw.githubusercontent.com/deldersveld/topojson/master/world-countries.json"

interface WorldMapProps {
  visitedCountries: string[] // Array of country codes (ISO3)
  className?: string
}

export function WorldMap({ visitedCountries = [], className = '' }: WorldMapProps) {
  const [tooltipContent, setTooltipContent] = useState<string>('')

  // Calculate statistics
  const totalCountries = 195 // Total countries in the world
  const visitedCount = visitedCountries.length
  const visitPercentage = Math.round((visitedCount / totalCountries) * 100)

  // Country name mapping
  const countryNames: { [key: string]: string } = {
    'USA': 'United States',
    'CAN': 'Canada',
    'MEX': 'Mexico',
    'BRA': 'Brazil',
    'ARG': 'Argentina',
    'CHL': 'Chile',
    'COL': 'Colombia',
    'PER': 'Peru',
    'VEN': 'Venezuela',
    'GBR': 'United Kingdom',
    'FRA': 'France',
    'DEU': 'Germany',
    'ITA': 'Italy',
    'ESP': 'Spain',
    'NLD': 'Netherlands',
    'BEL': 'Belgium',
    'CHE': 'Switzerland',
    'AUT': 'Austria',
    'SWE': 'Sweden',
    'NOR': 'Norway',
    'DNK': 'Denmark',
    'FIN': 'Finland',
    'POL': 'Poland',
    'CZE': 'Czech Republic',
    'HUN': 'Hungary',
    'GRC': 'Greece',
    'PRT': 'Portugal',
    'IRL': 'Ireland',
    'RUS': 'Russia',
    'UKR': 'Ukraine',
    'TUR': 'Turkey',
    'ISR': 'Israel',
    'SAU': 'Saudi Arabia',
    'ARE': 'United Arab Emirates',
    'EGY': 'Egypt',
    'ZAF': 'South Africa',
    'KEN': 'Kenya',
    'NGA': 'Nigeria',
    'MAR': 'Morocco',
    'TUN': 'Tunisia',
    'DZA': 'Algeria',
    'ETH': 'Ethiopia',
    'CHN': 'China',
    'JPN': 'Japan',
    'KOR': 'South Korea',
    'IND': 'India',
    'THA': 'Thailand',
    'SGP': 'Singapore',
    'MYS': 'Malaysia',
    'IDN': 'Indonesia',
    'VNM': 'Vietnam',
    'PHL': 'Philippines',
    'TWN': 'Taiwan',
    'HKG': 'Hong Kong',
    'PAK': 'Pakistan',
    'BGD': 'Bangladesh',
    'LKA': 'Sri Lanka',
    'MMR': 'Myanmar',
    'KHM': 'Cambodia',
    'LAO': 'Laos',
    'NPL': 'Nepal',
    'BTN': 'Bhutan',
    'MDV': 'Maldives',
    'AFG': 'Afghanistan',
    'IRN': 'Iran',
    'IRQ': 'Iraq',
    'SYR': 'Syria',
    'JOR': 'Jordan',
    'LBN': 'Lebanon',
    'CYP': 'Cyprus',
    'GEO': 'Georgia',
    'ARM': 'Armenia',
    'AZE': 'Azerbaijan',
    'KAZ': 'Kazakhstan',
    'UZB': 'Uzbekistan',
    'TKM': 'Turkmenistan',
    'TJK': 'Tajikistan',
    'KGZ': 'Kyrgyzstan',
    'MNG': 'Mongolia',
    'AUS': 'Australia',
    'NZL': 'New Zealand',
    'FJI': 'Fiji',
    'PNG': 'Papua New Guinea',
    'SLB': 'Solomon Islands',
    'VUT': 'Vanuatu',
    'WSM': 'Samoa',
    'TON': 'Tonga',
    // Add more countries as needed
  }

  const getCountryStyle = (geo: GeographyObject) => {
    const countryCode = geo.properties.ISO_A3
    const isVisited = visitedCountries.includes(countryCode)

    return {
      default: {
        fill: isVisited ? '#10b981' : '#e5e7eb',
        outline: 'none',
        stroke: '#ffffff',
        strokeWidth: 0.5,
        transition: 'all 0.3s ease',
      },
      hover: {
        fill: isVisited ? '#059669' : '#d1d5db',
        outline: 'none',
        stroke: '#ffffff',
        strokeWidth: 1,
        transform: 'scale(1.05)',
        transformOrigin: 'center',
      },
      pressed: {
        fill: isVisited ? '#047857' : '#9ca3af',
        outline: 'none',
        stroke: '#ffffff',
        strokeWidth: 1,
      },
    }
  }

  const handleMouseEnter = (geo: GeographyObject) => {
    const countryCode = geo.properties.ISO_A3
    const countryName = countryNames[countryCode] || geo.properties.NAME
    const isVisited = visitedCountries.includes(countryCode)
    
    setTooltipContent(`${countryName}${isVisited ? ' ✓' : ''}`)
  }

  const handleMouseLeave = () => {
    setTooltipContent('')
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            World Travel Map
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-sm">
              {visitedCount}/{totalCountries} countries
            </Badge>
            <Badge variant="outline" className="text-sm font-semibold">
              {visitPercentage}%
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">World Exploration</span>
            <span className="text-sm text-muted-foreground">{visitPercentage}% complete</span>
          </div>
          <Progress value={visitPercentage} className="h-2" />
        </div>

        {/* World Map */}
        <div className="relative">
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{ scale: 120 }}
            className="w-full h-64 rounded-lg bg-blue-50/20 dark:bg-blue-950/20"
          >
            <ZoomableGroup center={[0, 20]} zoom={1}>
              <Geographies geography={geoUrl}>
                {({ geographies }) =>
                  geographies.map((geo) => (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      style={getCountryStyle(geo)}
                      onMouseEnter={() => handleMouseEnter(geo)}
                      onMouseLeave={handleMouseLeave}
                      className="cursor-pointer"
                    />
                  ))
                }
              </Geographies>
            </ZoomableGroup>
          </ComposableMap>

          {/* Tooltip */}
          {tooltipContent && (
            <div className="absolute top-2 left-2 bg-black/80 text-white px-2 py-1 rounded text-xs pointer-events-none z-10">
              {tooltipContent}
            </div>
          )}

          {/* Legend */}
          <div className="absolute bottom-2 right-2 bg-white/90 dark:bg-gray-900/90 p-2 rounded-lg shadow-lg">
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Visited</span>
            </div>
            <div className="flex items-center gap-2 text-xs mt-1">
              <div className="w-3 h-3 bg-gray-300 rounded"></div>
              <span>Not visited</span>
            </div>
          </div>
        </div>

        {/* Milestones */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { percentage: 25, label: 'Explorer', color: 'bg-orange-100 text-orange-700' },
            { percentage: 50, label: 'Adventurer', color: 'bg-blue-100 text-blue-700' },
            { percentage: 75, label: 'Globetrotter', color: 'bg-purple-100 text-purple-700' },
            { percentage: 100, label: 'World Citizen', color: 'bg-green-100 text-green-700' },
          ].map((milestone) => (
            <div
              key={milestone.percentage}
              className={`p-2 rounded-lg text-center text-xs font-medium ${
                visitPercentage >= milestone.percentage
                  ? milestone.color
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              {milestone.label}
              <div className="text-xs opacity-75 mt-1">{milestone.percentage}%</div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        {visitPercentage < 100 && (
          <div className="text-center pt-2 border-t">
            <p className="text-sm text-muted-foreground">
              <Navigation className="inline h-4 w-4 mr-1" />
              Keep exploring to unlock more achievements!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}