"use client"

import Link from 'next/link'
import { ListIcon, MapPinnedIcon, FlameIcon, PlusIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/page-header'
import { TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { ManagementRouteContext } from '../data/route-context'
import { getStationCreatePath } from '../data/route-context'

type HealthStationsManagementHeaderProps = {
  routeContext: ManagementRouteContext
}

export function HealthStationsManagementHeader({
  routeContext,
}: HealthStationsManagementHeaderProps) {
  return (
    <PageHeader
      title='Health Stations'
      description='Map-first BHS management for CHO2 coverage, station pins, and table review.'
      controlsClassName='items-center'
      controls={
        <>
          <TabsList className='h-10'>
            <TabsTrigger value='map'>
              <MapPinnedIcon data-icon='inline-start' />
              Map
            </TabsTrigger>
            <TabsTrigger value='analytics'>
              <FlameIcon data-icon='inline-start' />
              Analytics
            </TabsTrigger>
            <TabsTrigger value='table'>
              <ListIcon data-icon='inline-start' />
              Table
            </TabsTrigger>
          </TabsList>
          {routeContext.canManage ? (
            <Button asChild className='h-10 px-4'>
              <Link href={getStationCreatePath(routeContext)}>
                Add Station
                <PlusIcon />
              </Link>
            </Button>
          ) : null}
        </>
      }
    />
  )
}
