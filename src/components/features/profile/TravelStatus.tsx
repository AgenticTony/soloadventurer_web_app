'use client'

import { motion } from 'framer-motion'
import { MapPin, Navigation, Calendar } from 'lucide-react'

interface TravelStatusProps {
  currentCity?: string | null
  headingTo?: string | null
  headingDates?: string | null
}

export function TravelStatus({
  currentCity,
  headingTo,
  headingDates,
}: TravelStatusProps) {
  if (!currentCity && !headingTo) return null

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.4 }}
        className="bg-grain card-base flex flex-wrap items-center gap-x-5 gap-y-2 px-5 py-3.5"
      >
        {currentCity && (
          <span className="flex items-center gap-2 text-sm font-medium text-foreground">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand/10">
              <MapPin className="h-3.5 w-3.5 text-brand" />
            </span>
            Currently in{' '}
            <span className="font-display font-semibold">{currentCity}</span>
          </span>
        )}
        {currentCity && headingTo && (
          <span className="hidden text-border sm:inline">|</span>
        )}
        {headingTo && (
          <span className="flex items-center gap-2 text-sm text-text-secondary">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-connection/10">
              <Navigation className="h-3.5 w-3.5 text-connection" />
            </span>
            Heading to{' '}
            <span className="font-medium text-foreground">{headingTo}</span>
            {headingDates && (
              <span className="flex items-center gap-1 text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {headingDates}
              </span>
            )}
          </span>
        )}
      </motion.div>
    </div>
  )
}
