export type ManagementRole = 'admin' | 'cho'

export type ManagementRouteContext = {
  role: ManagementRole
  basePath: `/${ManagementRole}/health-stations/manage`
  pinsPath: `/${ManagementRole}/health-stations/pins`
  canManage?: boolean
}

export const adminManagementRouteContext: ManagementRouteContext = {
  role: 'admin',
  basePath: '/admin/health-stations/manage',
  pinsPath: '/admin/health-stations/pins',
  canManage: true,
}

export const choManagementRouteContext: ManagementRouteContext = {
  role: 'cho',
  basePath: '/cho/health-stations/manage',
  pinsPath: '/cho/health-stations/pins',
  canManage: true,
}

export function getStationCreatePath(routeContext: ManagementRouteContext) {
  return `${routeContext.basePath}/new`
}

export function getStationEditPath(
  routeContext: ManagementRouteContext,
  stationId: string
) {
  return `${routeContext.basePath}/${stationId}/edit`
}
