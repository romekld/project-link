'use client'

import { Layers3Icon, PanelRightOpenIcon, RotateCcwIcon } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type {
  ChoAnalyticsKpis,
  ChoOverlayKey,
  ChoTimeWindow,
} from '../data/schema'

type OverlayState = Record<ChoOverlayKey, boolean>

type ChoAnalyticsToolbarProps = {
  timeWindow: ChoTimeWindow
  overlays: OverlayState
  kpis: ChoAnalyticsKpis
  onTimeWindowChange: (nextWindow: ChoTimeWindow) => void
  onToggleOverlay: (overlay: ChoOverlayKey) => void
  onResetView: () => void
  onOpenRail: () => void
}

const TIME_WINDOW_OPTIONS: ChoTimeWindow[] = ['7d', '30d', '90d']

const OVERLAY_LABELS: Record<ChoOverlayKey, string> = {
  choropleth: 'Burden',
  heatmap: 'Heatmap',
  stations: 'Stations',
}

export function ChoAnalyticsToolbar({
  timeWindow,
  overlays,
  kpis,
  onTimeWindowChange,
  onToggleOverlay,
  onResetView,
  onOpenRail,
}: ChoAnalyticsToolbarProps) {
  return (
    <div className='border-b bg-background/95 px-4 py-3 backdrop-blur md:px-6'>
      <div className='flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between'>
        <div className='space-y-1'>
          <p className='text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground'>
            CHO Analytics GIS
          </p>
          <div className='flex flex-wrap items-center gap-2'>
            <h1 className='text-lg font-semibold text-foreground'>
              City disease burden workspace
            </h1>
            <Badge variant='outline'>
              {kpis.totalCases.toLocaleString()} tracked cases
            </Badge>
            <Badge variant='outline'>
              {kpis.hotspotBarangays.toLocaleString()} hotspot barangays
            </Badge>
          </div>
        </div>

        <div className='flex flex-col gap-2 xl:items-end'>
          <div className='flex flex-wrap items-center gap-2'>
            <Button
              className='xl:hidden'
              onClick={onOpenRail}
              size='sm'
              variant='outline'
            >
              <PanelRightOpenIcon className='mr-2 size-4' />
              Analytics
            </Button>
            {TIME_WINDOW_OPTIONS.map((option) => (
              <Button
                key={option}
                onClick={() => onTimeWindowChange(option)}
                size='sm'
                variant={timeWindow === option ? 'default' : 'outline'}
              >
                {option}
              </Button>
            ))}
            <Button onClick={onResetView} size='sm' variant='outline'>
              <RotateCcwIcon className='mr-2 size-4' />
              Reset View
            </Button>
          </div>

          <div className='flex flex-wrap items-center gap-2'>
            <Badge className='gap-1.5' variant='secondary'>
              <Layers3Icon className='size-3.5' />
              Active layers
            </Badge>
            {(Object.keys(OVERLAY_LABELS) as ChoOverlayKey[]).map((overlay) => (
              <Button
                key={overlay}
                onClick={() => onToggleOverlay(overlay)}
                size='sm'
                variant={overlays[overlay] ? 'default' : 'outline'}
              >
                {OVERLAY_LABELS[overlay]}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
