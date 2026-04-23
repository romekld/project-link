import type {
  CityBarangayPageMode,
  CityBarangayRegistryData,
} from './data/schema'
import { RegistryPageShell } from './components/registry-page-shell'

type CityBarangayRegistryPageProps = {
  data: CityBarangayRegistryData
  mode: CityBarangayPageMode
}

export function CityBarangayRegistryPage({
  data,
  mode,
}: CityBarangayRegistryPageProps) {
  return <RegistryPageShell data={data} mode={mode} />
}

