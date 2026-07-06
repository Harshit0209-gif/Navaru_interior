import { AnimatedHeading } from '../AnimatedHeading'

type PageHeaderProps = {
  eyebrow: string
  title: string
  description?: string
}

export function PageHeader({ eyebrow, title, description }: PageHeaderProps) {
  return (
    <section className="border-b border-ink-900/10 bg-cream-100 pb-20 pt-44">
      <div className="mx-auto max-w-content px-6 lg:px-12">
        <p className="mb-5 text-xs font-medium uppercase tracking-widest2 text-brass-400">
          {eyebrow}
        </p>
        <AnimatedHeading
          as="h1"
          className="max-w-3xl text-5xl font-light leading-[1.05] tracking-tightest text-ink-900 sm:text-6xl"
        >
          {title}
        </AnimatedHeading>
        {description && (
          <p className="mt-6 max-w-xl text-base font-light leading-relaxed text-ink-700">
            {description}
          </p>
        )}
      </div>
    </section>
  )
}
