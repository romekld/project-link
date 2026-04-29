import type { ChoAnalyticsGisData } from './data/schema'
import { ChoAnalyticsGisPage as ChoAnalyticsGisPageComponent } from './components/cho-analytics-gis-page'

type ChoAnalyticsGisPageProps = {
  data: ChoAnalyticsGisData
}

export function ChoAnalyticsGisPage({ data }: ChoAnalyticsGisPageProps) {
  return <ChoAnalyticsGisPageComponent data={data} />
}
