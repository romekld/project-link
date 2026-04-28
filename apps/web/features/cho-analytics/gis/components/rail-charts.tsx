'use client'

import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis } from 'recharts'

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import type { ChoAnalyticsWindowData } from '../data/schema'

type RailChartsProps = {
  windowData: ChoAnalyticsWindowData
}

const trendConfig = {
  cases: {
    label: 'Cases',
    color: '#dc2626',
  },
  alerts: {
    label: 'Alerts',
    color: '#ea580c',
  },
}

const rankingConfig = {
  burdenScore: {
    label: 'Burden score',
    color: '#be123c',
  },
}

export function RailCharts({ windowData }: RailChartsProps) {
  const rankingData = windowData.topBarangays.slice(0, 6).map((barangay) => ({
    ...barangay,
    shortName: toShortBarangayLabel(barangay.barangayName),
  }))

  return (
    <div className='space-y-4'>
      <section className='rounded-xl border bg-background p-4 shadow-sm'>
        <div className='mb-3'>
          <h3 className='text-sm font-semibold text-foreground'>30-day trend</h3>
          <p className='text-xs text-muted-foreground'>
            Cases and alerts across the active reporting window.
          </p>
        </div>
        <ChartContainer
          className='h-56 w-full'
          config={trendConfig}
          initialDimension={{ width: 360, height: 224 }}
        >
          <LineChart data={windowData.trend}>
            <CartesianGrid vertical={false} />
            <XAxis axisLine={false} dataKey='label' tickLine={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line
              dataKey='cases'
              dot={false}
              stroke='var(--color-cases)'
              strokeWidth={2.5}
              type='monotone'
            />
            <Line
              dataKey='alerts'
              dot={false}
              stroke='var(--color-alerts)'
              strokeWidth={2}
              type='monotone'
            />
          </LineChart>
        </ChartContainer>
      </section>

      <section className='rounded-xl border bg-background p-4 shadow-sm'>
        <div className='mb-3'>
          <h3 className='text-sm font-semibold text-foreground'>Top barangays</h3>
          <p className='text-xs text-muted-foreground'>
            Highest disease burden in the current view.
          </p>
        </div>
        <ChartContainer
          className='h-56 w-full'
          config={rankingConfig}
          initialDimension={{ width: 360, height: 224 }}
        >
          <BarChart data={rankingData} layout='vertical'>
            <CartesianGrid horizontal={false} />
            <XAxis axisLine={false} dataKey='burdenScore' tickLine={false} type='number' />
            <ChartTooltip content={<ChartTooltipContent labelKey='barangayName' />} />
            <Bar dataKey='burdenScore' fill='var(--color-burdenScore)' radius={6} />
          </BarChart>
        </ChartContainer>
        <div className='mt-3 space-y-2'>
          {rankingData.map((barangay) => (
            <div
              key={barangay.cityBarangayId}
              className='flex items-center justify-between text-xs'
            >
              <span className='text-muted-foreground'>
                #{barangay.rank} {barangay.barangayName}
              </span>
              <span className='font-medium text-foreground'>
                {barangay.burdenScore.toFixed(1)}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function toShortBarangayLabel(name: string) {
  return name.split(' ').slice(0, 2).join(' ')
}
