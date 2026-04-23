import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type PageHeaderProps = {
  title: ReactNode
  description?: ReactNode
  controls?: ReactNode
  className?: string
  controlsClassName?: string
}

export function PageHeader({
  title,
  description,
  controls,
  className,
  controlsClassName,
}: PageHeaderProps) {
  return (
    <header className={cn('flex flex-wrap items-end justify-between gap-3', className)}>
      <div className='min-w-0'>
        <h1 className='font-heading text-2xl font-bold tracking-tight'>{title}</h1>
        {description ? <p className='text-sm text-muted-foreground'>{description}</p> : null}
      </div>

      {controls ? (
        <div className={cn('flex w-full flex-wrap justify-end gap-2 sm:w-auto', controlsClassName)}>
          {controls}
        </div>
      ) : null}
    </header>
  )
}