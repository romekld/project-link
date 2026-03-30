import { useCallback, useState } from 'react'
import { getStoredMapProvider, persistMapProvider, type MapProvider } from './constants'

export function useMapProvider() {
  const [mapProvider, setMapProvider] = useState<MapProvider>(() => getStoredMapProvider())

  const handleProviderChange = useCallback((provider: MapProvider) => {
    setMapProvider(provider)
    persistMapProvider(provider)
  }, [])

  return {
    mapProvider,
    handleProviderChange,
  }
}
