"use client"

import Link from 'next/link'
import { useTransition, useState } from 'react'
import { ListIcon, MapPinnedIcon, PlusIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/page-header'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { CityBarangayRegistryRecord } from '@/features/health-stations/city-barangay-registry/data/schema'
import type { HealthStation, HealthStationStatus } from './data/schema'
import { setStationStatusAction } from './actions'
import { HealthStationsStats } from './components/health-stations-stats'
import { HealthStationsTable } from './components/health-stations-table'
import { HealthStationsMapWorkspace } from './components/health-stations-map-workspace'

type HealthStationsManagementPageProps = {
  registryRecords: CityBarangayRegistryRecord[]
  initialStations: HealthStation[]
}

export function HealthStationsManagementPage({
  registryRecords,
  initialStations,
}: HealthStationsManagementPageProps) {
  const [stations, setStations] = useState<HealthStation[]>(initialStations)
  const [, startTransition] = useTransition()

  function handleSetStatus(stationIds: string[], nextStatus: HealthStationStatus) {
    // Optimistic update.
    const ids = new Set(stationIds)
    setStations((current) =>
      current.map((station) =>
        ids.has(station.id) ? { ...station, status: nextStatus } : station
      )
    )

    startTransition(async () => {
      await setStationStatusAction(stationIds, nextStatus)
    })
  }

  return (
    <Tabs defaultValue='map' className='flex min-h-0 flex-1 flex-col gap-4 sm:gap-6'>
      <PageHeader
        title='Health Stations'
        description='Map-first BHS management for CHO2 coverage, station pins, and table review.'
        controlsClassName='items-center'
        controls={
          <>
            <TabsList className='h-10'>
              <TabsTrigger value='map'>
                <MapPinnedIcon data-icon='inline-start' />
                Map
              </TabsTrigger>
              <TabsTrigger value='table'>
                <ListIcon data-icon='inline-start' />
                Table
              </TabsTrigger>
            </TabsList>
            <Button asChild className='h-10 px-4'>
              <Link href='/admin/health-stations/manage/new'>
                Add Station
                <PlusIcon />
              </Link>
            </Button>
          </>
        }
      />

      <TabsContent className='min-h-0' value='map'>
        <HealthStationsMapWorkspace
          registryRecords={registryRecords}
          stations={stations}
        />
      </TabsContent>

      <TabsContent className='flex flex-col gap-4' value='table'>
        <HealthStationsStats stations={stations} />

        <HealthStationsTable data={stations} onSetStatus={handleSetStatus} />
      </TabsContent>
    </Tabs>
  )
}
