import { buildDefaultStationValues, toCityBarangayOptions } from '../data/form-schema'
import { getCityBarangayRegistryData } from '../../city-barangay-registry/queries'
import { getNextStationCode, getOperationalBarangays } from '../queries'
import { StationForm } from './components/station-form'

export async function AddStationPage() {
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
      />
    </section>
  )
}

export default AddStationPage
