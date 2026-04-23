import { CityBarangayRegistryPage } from '@/features/health-stations/city-barangay-registry'
import { getCityBarangayRegistryData } from '@/features/health-stations/city-barangay-registry/queries'

export default async function Page() {
  const data = await getCityBarangayRegistryData()

  return <CityBarangayRegistryPage data={data} mode='admin' />
}

