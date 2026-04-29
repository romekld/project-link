"use client"

import { useTransition, useState } from 'react'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import type { CityBarangayRegistryRecord } from '@/features/health-stations/city-barangay-registry/data/schema'
import type { HealthStation, HealthStationStatus } from './data/schema'
import type { ManagementRouteContext } from './data/route-context'
import { setStationStatusAction } from './actions'
import { HealthStationsAnalyticsWorkspace } from './components/health-stations-analytics-workspace'
import { HealthStationsManagementHeader } from './components/health-stations-management-header'
import { HealthStationsStats } from './components/health-stations-stats'
import { HealthStationsTable } from './components/health-stations-table'
import { HealthStationsMapWorkspace } from './components/health-stations-map-workspace'

type HealthStationsManagementPageProps = {
  registryRecords: CityBarangayRegistryRecord[]
  initialStations: HealthStation[]
  routeContext: ManagementRouteContext
}

export function HealthStationsManagementPage({
  registryRecords,
  initialStations,
  routeContext,
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
      await setStationStatusAction(
        stationIds,
        nextStatus,
        undefined,
        routeContext.basePath
      )
    })
  }

  return (
    <Tabs defaultValue='map' className='flex min-h-0 flex-1 flex-col gap-4 sm:gap-6'>
      <HealthStationsManagementHeader routeContext={routeContext} />

      <TabsContent className='min-h-0' value='map'>
        <HealthStationsMapWorkspace
          registryRecords={registryRecords}
          routeContext={routeContext}
          stations={stations}
        />
      </TabsContent>

      <TabsContent className='min-h-0' value='analytics'>
        <HealthStationsAnalyticsWorkspace
          registryRecords={registryRecords}
          routeContext={routeContext}
          stations={stations}
        />
      </TabsContent>

      <TabsContent className='flex flex-col gap-4' value='table'>
        <HealthStationsStats stations={stations} />

        <HealthStationsTable
          data={stations}
          onSetStatus={handleSetStatus}
          routeContext={routeContext}
        />
      </TabsContent>
    </Tabs>
  )
}
