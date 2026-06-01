'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  animate?: boolean
}

export function GlassCard({ children, className, hover = false, animate = false }: GlassCardProps) {
  const base = cn(
    'glass-card',
    hover && 'glass-card-hover cursor-pointer',
    className
  )

  if (animate) {
    return (
      <motion.div
        className={base}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        {children}
      </motion.div>
    )
  }

  return <div className={base}>{children}</div>
}
