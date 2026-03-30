import bbox from '@turf/bbox'
import type {
  CoveragePlannerRecord,
  HealthStationPinRecord,
  IntelligenceFixtures,
} from './types'

function roundCoordinate(value: number) {
  return Number(value.toFixed(6))
}

export function buildCoveragePlannerRecords(fixtures: IntelligenceFixtures): CoveragePlannerRecord[] {
  return fixtures.dasmarinas.features
    .map((feature) => {
      const snapshot = fixtures.snapshots[feature.properties.ADM4_PCODE]

      return {
        barangayCode: feature.properties.ADM4_PCODE,
        barangayName: feature.properties.ADM4_EN,
        bhsName: snapshot?.bhsName ?? `${feature.properties.ADM4_EN} Health Station`,
        inCho2Scope: feature.properties.inCho2Scope,
        totalCases: feature.properties.mockCases,
        activeAlerts: feature.properties.mockActiveAlerts,
        validationRate: feature.properties.mockValidationRate,
        householdsCovered: snapshot?.householdsCovered ?? 0,
        pendingAction: null,
        changeReason: '',
      }
    })
    .sort((left, right) => left.barangayName.localeCompare(right.barangayName))
}

export function buildHealthStationPins(fixtures: IntelligenceFixtures): HealthStationPinRecord[] {
  return fixtures.dasmarinas.features
    .filter((feature) => feature.properties.inCho2Scope)
    .map((feature) => {
      const [minX, minY, maxX, maxY] = bbox(feature)
      const snapshot = fixtures.snapshots[feature.properties.ADM4_PCODE]

      return {
        id: `pin-${feature.properties.ADM4_PCODE}`,
        stationName: snapshot?.bhsName ?? `${feature.properties.ADM4_EN} Health Station`,
        barangayCode: feature.properties.ADM4_PCODE,
        barangayName: feature.properties.ADM4_EN,
        latitude: roundCoordinate((minY + maxY) / 2),
        longitude: roundCoordinate((minX + maxX) / 2),
        isPrimary: true,
        draftStatus: 'saved' as const,
      }
    })
    .sort((left, right) => left.stationName.localeCompare(right.stationName))
}
