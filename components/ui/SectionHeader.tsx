import { cn } from '@/lib/utils'

interface SectionHeaderProps {
  badge?: string
  heading: string
  subheading?: string
  centered?: boolean
  className?: string
}

export function SectionHeader({ badge, heading, subheading, centered = false, className }: SectionHeaderProps) {
  return (
    <div className={cn('mb-12', centered && 'text-center', className)}>
      {badge && (
        <span className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-widest rounded-full mb-4"
          style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8B5CF6', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
          {badge}
        </span>
      )}
      <h2 className="font-heading font-bold text-3xl md:text-4xl lg:text-5xl text-white leading-tight">
        {heading}
      </h2>
      {subheading && (
        <p className={cn('mt-4 text-lg max-w-2xl leading-relaxed text-[color:var(--color-text-secondary)]', centered && 'mx-auto')}>
          {subheading}
        </p>
      )}
    </div>
  )
}
