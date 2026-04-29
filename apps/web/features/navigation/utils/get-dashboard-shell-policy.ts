export type DashboardShellPolicy = {
  hideHeader: boolean
  removeMainPadding: boolean
}

const CHO_ANALYTICS_GIS_PATHNAME = "/cho/analytics/gis"

export function getDashboardShellPolicy(pathname: string): DashboardShellPolicy {
  const isChoAnalyticsGisRoute = pathname === CHO_ANALYTICS_GIS_PATHNAME

  return {
    hideHeader: isChoAnalyticsGisRoute,
    removeMainPadding: isChoAnalyticsGisRoute,
  }
}
