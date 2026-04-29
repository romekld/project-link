import { ChoAnalyticsGisPage } from '@/features/cho-analytics/gis'
import { getChoAnalyticsGisData } from '@/features/cho-analytics/gis/queries'

export default async function Page() {
  const data = await getChoAnalyticsGisData()

  return <ChoAnalyticsGisPage data={data} />
}
