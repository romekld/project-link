import { PinsWorkspacePage } from '@/features/health-stations/pins-workspace'
import { getCityBarangayRegistryData } from '@/features/health-stations/city-barangay-registry/queries'
import { createMockHealthStations } from '@/features/health-stations/management/data/health-stations'

export default async function Page() {
  const registryData = await getCityBarangayRegistryData()

  return (
    <PinsWorkspacePage
      registryRecords={registryData.records}
      stations={createMockHealthStations()}
    />
  )
}