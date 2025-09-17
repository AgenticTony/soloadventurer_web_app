'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'

interface AnimatedStatCardProps {
  label: string
  value: number
  suffix?: string
  icon?: React.ReactNode
  color?: string
}

export function AnimatedStatCard({ 
  label, 
  value, 
  suffix = '', 
  icon, 
  color = 'bg-gradient-to-br from-blue-500 to-purple-600' 
}: AnimatedStatCardProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (isInView) {
      const duration = 2000 // 2 seconds
      const steps = 60
      const increment = value / steps
      let current = 0

      const timer = setInterval(() => {
        current += increment
        if (current >= value) {
          setCount(value)
          clearInterval(timer)
        } else {
          setCount(Math.floor(current))
        }
      }, duration / steps)

      return () => clearInterval(timer)
    }
  }, [isInView, value])

  return (
    <motion.div
      ref={ref}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 }}
      transition={{ duration: 0.5, type: "spring" }}
      className={`relative overflow-hidden rounded-2xl p-6 text-white ${color}`}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white" />
        <div className="absolute -left-8 -bottom-8 h-32 w-32 rounded-full bg-white" />
      </div>

      <div className="relative z-10">
        {icon && (
          <div className="mb-4 inline-flex rounded-lg bg-white/20 p-3">
            {icon}
          </div>
        )}
        
        <motion.div
          initial={{ y: 20 }}
          animate={isInView ? { y: 0 } : { y: 20 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="text-4xl font-bold">
            {count.toLocaleString()}{suffix}
          </div>
          <div className="mt-2 text-sm opacity-90">{label}</div>
        </motion.div>
      </div>

      {/* Decorative elements */}
      <motion.div
        className="absolute bottom-0 right-0 h-20 w-20"
        animate={{
          rotate: [0, 360],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <div className="h-full w-full rounded-full border-4 border-white/20 border-t-white/40" />
      </motion.div>
    </motion.div>
  )
}