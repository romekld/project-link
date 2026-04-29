import { AddStationPage } from '@/features/health-stations/management/station-editor'
import { adminManagementRouteContext } from '@/features/health-stations/management/data/route-context'

export default function Page() {
  return <AddStationPage routeContext={adminManagementRouteContext} />
}
