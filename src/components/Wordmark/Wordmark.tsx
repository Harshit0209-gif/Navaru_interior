import { cn } from '../../utils/cn'

type WordmarkProps = {
  light?: boolean
  size?: 'sm' | 'md' | 'lg'
  align?: 'start' | 'center'
  className?: string
}

const SIZE_MAP = {
  sm: { navaru: 'text-lg', sub: 'text-[7px]' },
  md: { navaru: 'text-2xl', sub: 'text-[9px]' },
  lg: { navaru: 'text-4xl sm:text-5xl', sub: 'text-xs sm:text-sm' },
}

export function Wordmark({ light = false, size = 'md', align = 'center', className }: WordmarkProps) {
  const s = SIZE_MAP[size]

  return (
    <div
      className={cn(
        'flex flex-col leading-none',
        align === 'center' ? 'items-center' : 'items-start',
        className,
      )}
    >
      <span
        className={cn(
          'font-sans font-light tracking-tightest transition-colors duration-500',
          s.navaru,
          light ? 'text-cream-100' : 'text-ink-900',
        )}
      >
        NAVARU
      </span>
      <span
        className={cn(
          'mt-1 font-sans font-medium uppercase tracking-widest2 text-brass-400',
          s.sub,
        )}
      >
        interior Solutions
      </span>
    </div>
  )
}
