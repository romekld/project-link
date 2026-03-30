import { useCallback, useMemo, useState } from 'react'
import { getAvailableLayersForRole } from '@/features/intelligence/fixtures'
import type { GeoLayerId, MapRoleView } from '@/features/intelligence/types'
import { getDefaultVisibleLayers } from './constants'

export function useLayerControls(roleView: MapRoleView) {
  const availableLayers = useMemo(() => getAvailableLayersForRole(roleView), [roleView])
  const defaultVisibleLayers = useMemo(
    () => getDefaultVisibleLayers(roleView).filter((layer) => availableLayers.includes(layer)),
    [availableLayers, roleView],
  )

  const [visibleLayers, setVisibleLayers] = useState<GeoLayerId[]>(() => defaultVisibleLayers)

  const effectiveVisibleLayers = useMemo(() => {
    const filteredLayers = visibleLayers.filter((layer) => availableLayers.includes(layer))
    return filteredLayers.length > 0 ? filteredLayers : defaultVisibleLayers
  }, [availableLayers, defaultVisibleLayers, visibleLayers])

  const toggleLayer = useCallback(
    (layerId: GeoLayerId) => {
      setVisibleLayers((currentLayers) => {
        const safeCurrentLayers = currentLayers.filter((layer) => availableLayers.includes(layer))
        const nextVisibleLayers = safeCurrentLayers.length > 0 ? safeCurrentLayers : defaultVisibleLayers
        const isVisible = nextVisibleLayers.includes(layerId)

        if (isVisible) {
          if (nextVisibleLayers.length === 1) {
            return nextVisibleLayers
          }

          return nextVisibleLayers.filter((layer) => layer !== layerId)
        }

        return [...nextVisibleLayers, layerId]
      })
    },
    [availableLayers, defaultVisibleLayers],
  )

  const resetLayers = useCallback(() => {
    setVisibleLayers(defaultVisibleLayers)
  }, [defaultVisibleLayers])

  return {
    availableLayers,
    effectiveVisibleLayers,
    toggleLayer,
    resetLayers,
  }
}
