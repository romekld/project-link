import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { Tabs } from '@/components/ui/tabs'
import { choManagementRouteContext } from '../data/route-context'
import { HealthStationsManagementHeader } from './health-stations-management-header'

describe('HealthStationsManagementHeader', () => {
  it('renders CHO tabs and routes with the CHO management base path', () => {
    const html = renderToStaticMarkup(
      <Tabs defaultValue='map'>
        <HealthStationsManagementHeader routeContext={choManagementRouteContext} />
      </Tabs>
    )

    expect(html).toContain('Map')
    expect(html).toContain('Analytics')
    expect(html).toContain('Table')
    expect(html).toContain('/cho/health-stations/manage/new')
  })
})
