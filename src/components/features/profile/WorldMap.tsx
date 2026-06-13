'use client'

import { useState } from 'react'
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Globe, Navigation } from 'lucide-react'

interface GeoProperties {
  ISO_A3: string
  NAME: string
}

interface GeographyObject {
  rsmKey: string
  properties: GeoProperties
}

const geoUrl = 'https://raw.githubusercontent.com/deldersveld/topojson/master/world-countries.json'

interface WorldMapProps {
  visitedCountries: string[]
  className?: string
}

const TOTAL_COUNTRIES = 195

const MILESTONES = [
  { pct: 10, label: 'Explorer' },
  { pct: 25, label: 'Adventurer' },
  { pct: 50, label: 'Globetrotter' },
  { pct: 100, label: 'World Citizen' },
] as const

export function WorldMap({ visitedCountries = [], className = '' }: WorldMapProps) {
  const [tooltip, setTooltip] = useState('')

  const visitedCount = visitedCountries.length
  const pct = Math.round((visitedCount / TOTAL_COUNTRIES) * 100)

  const currentMilestone = [...MILESTONES].reverse().find(m => pct >= m.pct)

  const getStyle = (geo: GeographyObject) => {
    const visited = visitedCountries.includes(geo.properties.ISO_A3)
    return {
      default: {
        fill: visited ? 'hsl(var(--color-brand))' : 'hsl(var(--surface-border))',
        outline: 'none',
        stroke: 'hsl(var(--surface-elevated))',
        strokeWidth: 0.5,
        transition: 'fill 0.2s ease',
      },
      hover: {
        fill: visited ? 'hsl(var(--color-brand) / 0.8)' : 'hsl(var(--text-muted))',
        outline: 'none',
        stroke: 'hsl(var(--surface-elevated))',
        strokeWidth: 1,
      },
      pressed: {
        fill: visited ? 'hsl(var(--color-brand) / 0.6)' : 'hsl(var(--text-muted) / 0.6)',
        outline: 'none',
        stroke: 'hsl(var(--surface-elevated))',
        strokeWidth: 1,
      },
    }
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Globe className="h-5 w-5 text-primary" />
          Travel Map
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {visitedCount}/{TOTAL_COUNTRIES}
          </Badge>
          {currentMilestone && (
            <Badge className="badge-trust text-xs">{currentMilestone.label}</Badge>
          )}
        </div>
      </div>

      {/* Progress */}
      <div className="mb-3 space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>World exploration</span>
          <span>{pct}%</span>
        </div>
        <Progress value={pct} className="h-1.5" />
      </div>

      {/* Milestone pills */}
      <div className="mb-3 flex gap-1.5">
        {MILESTONES.map(m => (
          <div
            key={m.pct}
            className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
              pct >= m.pct ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
            }`}
          >
            {m.label}
          </div>
        ))}
      </div>

      {/* Map SVG */}
      <div className="relative overflow-hidden rounded-xl bg-muted/30">
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ scale: 120 }}
          className="h-56 w-full"
        >
          <ZoomableGroup center={[0, 20]} zoom={1}>
            <Geographies geography={geoUrl}>
              {({ geographies }: { geographies: GeographyObject[] }) =>
                geographies.map((geo: GeographyObject) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    style={getStyle(geo)}
                    onMouseEnter={() => {
                      const code = geo.properties.ISO_A3
                      const name = geo.properties.NAME
                      const visited = visitedCountries.includes(code)
                      setTooltip(`${name}${visited ? ' ✓' : ''}`)
                    }}
                    onMouseLeave={() => setTooltip('')}
                    className="cursor-pointer"
                  />
                ))
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>

        {tooltip && (
          <div className="pointer-events-none absolute left-2 top-2 rounded-lg bg-foreground/90 px-2 py-1 text-xs text-background">
            {tooltip}
          </div>
        )}

        {/* Legend */}
        <div className="absolute bottom-2 right-2 rounded-lg bg-card/90 p-1.5 shadow-card">
          <div className="flex items-center gap-1.5 text-[10px]">
            <div className="h-2.5 w-2.5 rounded-sm bg-primary" />
            <span className="text-muted-foreground">Visited</span>
          </div>
        </div>
      </div>

      {pct < 100 && (
        <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
          <Navigation className="h-3.5 w-3.5" />
          Keep exploring to unlock more milestones!
        </p>
      )}
    </div>
  )
}
