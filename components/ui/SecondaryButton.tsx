import Link from 'next/link'
import { cn } from '@/lib/utils'

interface SecondaryButtonProps {
  children: React.ReactNode
  onClick?: () => void
  href?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
}

const sizeClasses = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
}

export function SecondaryButton({ children, onClick, href, className, size = 'md', disabled }: SecondaryButtonProps) {
  const classes = cn('btn-secondary', sizeClasses[size], className)

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    )
  }

  return (
    <button type="button" onClick={onClick} className={classes} disabled={disabled}>
      {children}
    </button>
  )
}
