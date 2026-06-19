import Image from 'next/image'

type Size = 'sm' | 'md' | 'lg'

interface Props {
  size?: Size
  showWordmark?: boolean
  className?: string
}

const DIMS: Record<Size, number> = { sm: 24, md: 32, lg: 44 }
const FONTS: Record<Size, string> = { sm: 'text-base', md: 'text-lg', lg: 'text-2xl' }

export function Logo({ size = 'md', showWordmark = true, className = '' }: Props) {
  const d = DIMS[size]
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <Image
        src="/jobagent247-mark.svg"
        alt="JobAgent247"
        width={d}
        height={d}
        priority
        style={{ width: d, height: d }}
      />
      {showWordmark && (
        <span
          className={`font-heading font-bold tracking-tight ${FONTS[size]}`}
          style={{ color: '#F8FAFC', letterSpacing: '-0.01em' }}
        >
          Job
          <span
            style={{
              background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Agent
          </span>
          247
        </span>
      )}
    </span>
  )
}
