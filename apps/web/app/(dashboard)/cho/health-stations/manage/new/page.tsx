import { AddStationPage } from '@/features/health-stations/management/station-editor'
import { choManagementRouteContext } from '@/features/health-stations/management/data/route-context'

export default function Page() {
  return <AddStationPage routeContext={choManagementRouteContext} />
}
