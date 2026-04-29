import { EditStationPage } from '@/features/health-stations/management/station-editor'
import { adminManagementRouteContext } from '@/features/health-stations/management/data/route-context'

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function Page({ params }: PageProps) {
  const { id } = await params

  return (
    <EditStationPage
      routeContext={adminManagementRouteContext}
      stationId={id}
    />
  )
}
