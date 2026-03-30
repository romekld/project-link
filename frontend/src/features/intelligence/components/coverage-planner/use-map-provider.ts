import { useCallback, useState } from 'react'
import {
  getStoredCoveragePlannerMapProvider,
  persistCoveragePlannerMapProvider,
} from './constants'
import type { MapProvider } from './types'

export function useCoveragePlannerMapProvider() {
  const [mapProvider, setMapProvider] = useState<MapProvider>(() => getStoredCoveragePlannerMapProvider())

  const handleProviderChange = useCallback((provider: MapProvider) => {
    setMapProvider(provider)
    persistCoveragePlannerMapProvider(provider)
  }, [])

  return {
    mapProvider,
    handleProviderChange,
  }
}
