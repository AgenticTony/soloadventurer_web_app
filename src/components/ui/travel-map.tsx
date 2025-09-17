'use client'

import { motion } from 'framer-motion'
import { MapPin } from 'lucide-react'

interface Location {
  id: string
  name: string
  coordinates: { x: number; y: number }
  visits: number
}

interface TravelMapProps {
  locations: Location[]
  className?: string
}

export function TravelMap({ locations, className = '' }: TravelMapProps) {
  return (
    <div className={`relative w-full h-full min-h-[400px] bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-2xl overflow-hidden ${className}`}>
      {/* World map background (simplified) */}
      <svg
        viewBox="0 0 1000 500"
        className="absolute inset-0 w-full h-full opacity-10"
      >
        <path
          d="M 100 200 Q 200 150 300 200 T 500 180 Q 600 150 700 200 T 900 180"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
        />
        <path
          d="M 150 300 Q 250 250 350 300 T 550 280 Q 650 250 750 300 T 950 280"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
        />
      </svg>

      {/* Connection lines */}
      <svg className="absolute inset-0 w-full h-full">
        {locations.map((loc, index) => {
          if (index === locations.length - 1) return null
          const nextLoc = locations[index + 1]
          return (
            <motion.line
              key={`line-${loc.id}-${nextLoc.id}`}
              x1={`${loc.coordinates.x}%`}
              y1={`${loc.coordinates.y}%`}
              x2={`${nextLoc.coordinates.x}%`}
              y2={`${nextLoc.coordinates.y}%`}
              stroke="url(#gradient)"
              strokeWidth="2"
              strokeDasharray="5,5"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, delay: index * 0.5 }}
            />
          )
        })}
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
      </svg>

      {/* Location pins */}
      {locations.map((location, index) => (
        <motion.div
          key={location.id}
          className="absolute"
          style={{
            left: `${location.coordinates.x}%`,
            top: `${location.coordinates.y}%`,
            transform: 'translate(-50%, -50%)'
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: index * 0.3, type: "spring" }}
        >
          <motion.div
            whileHover={{ scale: 1.2 }}
            className="relative cursor-pointer group"
          >
            <motion.div
              className="absolute inset-0 bg-blue-500 rounded-full"
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ opacity: 0.3 }}
            />
            <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 rounded-full p-2 shadow-lg">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <div className="bg-gray-900 text-white text-sm rounded-lg px-3 py-2 whitespace-nowrap">
                <div className="font-semibold">{location.name}</div>
                <div className="text-xs opacity-75">{location.visits} visits</div>
              </div>
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                <div className="border-4 border-transparent border-t-gray-900" />
              </div>
            </div>
          </motion.div>
        </motion.div>
      ))}
    </div>
  )
}