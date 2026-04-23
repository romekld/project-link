import type { GisMapStyleMode } from '../data/types'

const CARTO_STYLES = {
  light: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
  dark: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
} satisfies Record<GisMapStyleMode, string>

function getMapTilerStyle(mode: GisMapStyleMode) {
  const apiKey = process.env.NEXT_PUBLIC_MAPTILER_API_KEY
  if (!apiKey) return null

  const style = mode === 'dark' ? 'streets-v2-dark' : 'streets-v2'
  return `https://api.maptiler.com/maps/${style}/style.json?key=${apiKey}`
}

export function getGisMapStyleUrl(mode: GisMapStyleMode) {
  return getMapTilerStyle(mode) ?? CARTO_STYLES[mode]
}

export function getGisMapStyleLabel(mode: GisMapStyleMode) {
  if (process.env.NEXT_PUBLIC_MAPTILER_API_KEY) {
    return mode === 'dark' ? 'MapTiler Streets Dark' : 'MapTiler Streets'
  }

  return mode === 'dark' ? 'CARTO Dark Matter' : 'CARTO Voyager'
}

