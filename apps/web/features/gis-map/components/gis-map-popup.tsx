'use client'

import { XIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { GisMapPopupState } from '../data/types'

type GisMapPopupProps = {
  popup: GisMapPopupState | null
  children: React.ReactNode
  onClose: () => void
  showCloseButton?: boolean
}

export function GisMapPopup({
  popup,
  children,
  onClose,
  showCloseButton = true,
}: GisMapPopupProps) {
  if (!popup) return null

  return (
    <div
      className={cn(
        'pointer-events-auto absolute z-10 w-[min(360px,calc(100vw-2rem))]',
        'rounded-lg bg-popover p-3 text-popover-foreground'
      )}
      style={{
        left: popup.point.x,
        top: popup.point.y,
        transform: 'translate(-50%, calc(-100% - 16px))',
      }}
    >
      {showCloseButton ? (
        <Button
          aria-label='Close map popup'
          className='absolute right-2 top-2'
          onClick={onClose}
          size='icon'
          variant='ghost'
        >
          <XIcon />
        </Button>
      ) : null}
      {children}
      <div className='absolute left-1/2 top-full size-3 -translate-x-1/2 -translate-y-1/2 rotate-45 border-b border-r bg-popover' />
    </div>
  )
}
