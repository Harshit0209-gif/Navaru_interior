import { forwardRef } from 'react'
import type { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { cn } from '../../utils/cn'

type Variant = 'primary' | 'outline' | 'ghost'

type CommonProps = {
  variant?: Variant
  withArrow?: boolean
  children: ReactNode
  className?: string
}

type ConflictingEvents =
  | 'onAnimationStart'
  | 'onAnimationEnd'
  | 'onAnimationIteration'
  | 'onDrag'
  | 'onDragStart'
  | 'onDragEnd'

type ButtonAsButton = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, ConflictingEvents> & { href?: undefined }

type ButtonAsLink = CommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, ConflictingEvents> & { href: string }

type ButtonProps = ButtonAsButton | ButtonAsLink

const variantStyles: Record<Variant, string> = {
  primary:
    'bg-ink-900 text-cream-100 hover:bg-brass-400 hover:text-ink-950',
  outline:
    'border border-ink-900/25 text-ink-900 hover:border-ink-900 hover:bg-ink-900 hover:text-cream-100',
  ghost: 'text-ink-900 hover:text-brass-400',
}

export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  ({ variant = 'primary', withArrow = false, className, children, href, ...rest }, ref) => {
    const classes = cn(
      'group relative inline-flex items-center gap-2.5 overflow-hidden px-8 py-4 text-xs font-medium uppercase tracking-widest2 transition-colors duration-500 ease-luxury',
      variantStyles[variant],
      className,
    )

    const content = (
      <>
        <span className="relative z-10">{children}</span>
        {withArrow && (
          <ArrowUpRight
            className="relative z-10 h-3.5 w-3.5 transition-transform duration-500 ease-luxury group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            strokeWidth={1.75}
          />
        )}
      </>
    )

    if (href) {
      return (
        <motion.a
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          className={classes}
          whileHover={{ scale: 1.015 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          {...(rest as Omit<AnchorHTMLAttributes<HTMLAnchorElement>, ConflictingEvents>)}
        >
          {content}
        </motion.a>
      )
    }

    return (
      <motion.button
        ref={ref as React.Ref<HTMLButtonElement>}
        className={classes}
        whileHover={{ scale: 1.015 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        {...(rest as Omit<ButtonHTMLAttributes<HTMLButtonElement>, ConflictingEvents>)}
      >
        {content}
      </motion.button>
    )
  },
)

Button.displayName = 'Button'
