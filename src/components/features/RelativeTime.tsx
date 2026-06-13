'use client'

import { useEffect, useState } from 'react'
import { formatDistanceToNow, format } from 'date-fns'

interface RelativeTimeProps {
  date: Date | string
  className?: string
}

export function RelativeTime({ date, className }: RelativeTimeProps) {
  const [mounted, setMounted] = useState(false)
  const dateObj = typeof date === 'string' ? new Date(date) : date

  useEffect(() => {
    setMounted(true)
  }, [])

  // Use consistent ISO format for SSR to avoid locale differences
  const fallbackDate = format(dateObj, 'yyyy-MM-dd')

  // During SSR and initial render, show consistent date format to avoid hydration mismatch
  if (!mounted) {
    return (
      <time dateTime={dateObj.toISOString()} className={className} suppressHydrationWarning>
        {fallbackDate}
      </time>
    )
  }

  // After mounting, show relative time
  return (
    <time dateTime={dateObj.toISOString()} className={className}>
      {formatDistanceToNow(dateObj, { addSuffix: true })}
    </time>
  )
}
