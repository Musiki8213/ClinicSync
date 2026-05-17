import { cn } from '@/lib/utils'
import { FadeIn } from './FadeIn'

export function SectionHeading({
  eyebrow,
  title,
  description,
  className,
  align = 'center',
}: {
  eyebrow?: string
  title: string
  description?: string
  className?: string
  align?: 'center' | 'left'
}) {
  return (
    <FadeIn className={cn(align === 'center' && 'mx-auto max-w-2xl text-center', className)}>
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">{eyebrow}</p>
      ) : null}
      <h2
        className={cn(
          'mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl',
          align === 'left' && 'text-left'
        )}
      >
        {title}
      </h2>
      {description ? (
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">{description}</p>
      ) : null}
    </FadeIn>
  )
}
