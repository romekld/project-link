import Link from 'next/link'
import { AlertCircleIcon } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  buildDefaultStationValues,
  toCityBarangayOptions,
  type DbCoverageRow,
} from '../data/form-schema'
import { getCityBarangayRegistryData } from '../../city-barangay-registry/queries'
import {
  getHealthStation,
  getOperationalBarangays,
  getStationCoverageRows,
} from '../queries'
import type { ManagementRouteContext } from '../data/route-context'
import { StationForm } from './components/station-form'

type EditStationPageProps = {
  stationId: string
  routeContext: ManagementRouteContext
}

export async function EditStationPage({
  stationId,
  routeContext,
}: EditStationPageProps) {
  const [registryData, operationalBarangays, station, coverageRows] = await Promise.all([
    getCityBarangayRegistryData(),
    getOperationalBarangays(),
    getHealthStation(stationId),
    getStationCoverageRows(stationId),
  ])

  if (!station) {
    return (
      <section className='flex flex-col gap-4 sm:gap-6'>
        <Alert variant='destructive'>
          <AlertCircleIcon />
          <AlertTitle>We couldn&apos;t find that health station</AlertTitle>
          <AlertDescription>
            The station may have been removed or the ID is invalid.
          </AlertDescription>
        </Alert>
        <div>
          <Button asChild variant='outline'>
            <Link href={routeContext.basePath}>Back to health stations</Link>
          </Button>
        </div>
      </section>
    )
  }

  const cityBarangays = toCityBarangayOptions(registryData.records)

  const dbCoverageRows: DbCoverageRow[] = coverageRows.map((row) => ({
    barangayId: row.barangayId,
    isPrimary: row.isPrimary,
    notes: row.notes,
  }))

  return (
    <section className='flex min-h-0 flex-1 flex-col'>
      <StationForm
        mode='edit'
        stationId={stationId}
        defaultValues={buildDefaultStationValues({
          stationCode: station.stationCode,
          station,
          cityBarangays,
          operationalBarangays,
          dbCoverageRows,
        })}
        registryRecords={registryData.records}
        operationalBarangays={operationalBarangays}
        routeContext={routeContext}
        activity={{
          createdAt: station.updatedAt,
          updatedAt: station.updatedAt,
          deactivatedAt: station.status === 'inactive' ? station.updatedAt : null,
        }}
      />
    </section>
  )
}

export default EditStationPage
