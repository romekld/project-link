import { HealthStationsManagementPage } from '@/features/health-stations/management'
import { getCityBarangayRegistryData } from '@/features/health-stations/city-barangay-registry/queries'
import { choManagementRouteContext } from '@/features/health-stations/management/data/route-context'
import { getHealthStations } from '@/features/health-stations/management/queries'

export default async function Page() {
  const [registryData, stations] = await Promise.all([
    getCityBarangayRegistryData(),
    getHealthStations(),
  ])

  return (
    <HealthStationsManagementPage
      registryRecords={registryData.records}
      initialStations={stations}
      routeContext={choManagementRouteContext}
    />
  )
}
