'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

interface ParallaxHeroProps {
  children: React.ReactNode
  className?: string
  backgroundImage?: string
}

export function ParallaxHero({ children, className = '', backgroundImage }: ParallaxHeroProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  })

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "100%"])
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "200%"])

  return (
    <div ref={ref} className={`relative h-screen overflow-hidden ${className}`}>
      <motion.div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: backgroundImage ? `url(${backgroundImage})` : 
            'linear-gradient(to bottom, rgba(59, 130, 246, 0.5), rgba(139, 92, 246, 0.5))',
          backgroundPosition: "center",
          backgroundSize: "cover",
          y: backgroundY
        }}
      />
      
      <motion.div
        className="absolute inset-0 z-10 flex items-center justify-center"
        style={{ y: textY }}
      >
        {children}
      </motion.div>
      
      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent z-20" />
    </div>
  )
}