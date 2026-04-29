import { buildDefaultStationValues, toCityBarangayOptions } from '../data/form-schema'
import type { ManagementRouteContext } from '../data/route-context'
import { getCityBarangayRegistryData } from '../../city-barangay-registry/queries'
import { getNextStationCode, getOperationalBarangays } from '../queries'
import { StationForm } from './components/station-form'

type AddStationPageProps = {
  routeContext: ManagementRouteContext
}

export async function AddStationPage({ routeContext }: AddStationPageProps) {
  const [registryData, operationalBarangays, stationCode] = await Promise.all([
    getCityBarangayRegistryData(),
    getOperationalBarangays(),
    getNextStationCode(),
  ])

  const cityBarangays = toCityBarangayOptions(registryData.records)

  return (
    <section className='flex min-h-0 flex-1 flex-col'>
      <StationForm
        mode='create'
        defaultValues={buildDefaultStationValues({
          stationCode,
          cityBarangays,
          operationalBarangays,
        })}
        registryRecords={registryData.records}
        operationalBarangays={operationalBarangays}
        routeContext={routeContext}
      />
    </section>
  )
}

export default AddStationPage
