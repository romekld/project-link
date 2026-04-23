import type {
  CoveragePlannerRecord,
  CoveragePlannerStats,
  CoverageStagedAction,
  CoverageStagedChanges,
} from './coverage-schema'
import type { RegistryFeatureCollection } from './geojson'
import type { CityBarangayRegistryRecord } from './schema'

export function buildCoverageRecords(
  records: CityBarangayRegistryRecord[],
  stagedChanges: CoverageStagedChanges
): CoveragePlannerRecord[] {
  return records.map((record) => {
    const stagedAction = stagedChanges[record.pcode] ?? null
    const currentScope = record.inCho2Scope ? 'in_scope' : 'outside_scope'
    const nextScope =
      stagedAction === 'add'
        ? 'in_scope'
        : stagedAction === 'remove'
          ? 'outside_scope'
          : currentScope

    return {
      ...record,
      currentScope,
      stagedAction,
      nextScope,
    }
  })
}

export function buildCoverageStats(
  records: CoveragePlannerRecord[]
): CoveragePlannerStats {
  return {
    totalBarangays: records.length,
    inScope: records.filter((record) => record.currentScope === 'in_scope')
      .length,
    outsideScope: records.filter((record) => record.currentScope === 'outside_scope')
      .length,
    stagedAdds: records.filter((record) => record.stagedAction === 'add').length,
    stagedRemoves: records.filter((record) => record.stagedAction === 'remove')
      .length,
    nextInScope: records.filter((record) => record.nextScope === 'in_scope')
      .length,
    totalAreaSqKm: records.reduce((total, record) => total + record.sourceAreaSqKm, 0),
    inScopeAreaSqKm: records
      .filter((record) => record.currentScope === 'in_scope')
      .reduce((total, record) => total + record.sourceAreaSqKm, 0),
    outsideScopeAreaSqKm: records
      .filter((record) => record.currentScope === 'outside_scope')
      .reduce((total, record) => total + record.sourceAreaSqKm, 0),
    nextInScopeAreaSqKm: records
      .filter((record) => record.nextScope === 'in_scope')
      .reduce((total, record) => total + record.sourceAreaSqKm, 0),
  }
}

export function getCoverageActionForRecord(
  record: CoveragePlannerRecord
): CoverageStagedAction {
  return record.currentScope === 'in_scope' ? 'remove' : 'add'
}

export function stageCoverageChange(
  record: CoveragePlannerRecord,
  stagedChanges: CoverageStagedChanges,
  action: CoverageStagedAction
): CoverageStagedChanges {
  const next = { ...stagedChanges }

  if (
    (record.currentScope === 'in_scope' && action === 'add') ||
    (record.currentScope === 'outside_scope' && action === 'remove')
  ) {
    delete next[record.pcode]
    return next
  }

  next[record.pcode] = action
  return next
}

export function undoCoverageChange(
  pcode: string,
  stagedChanges: CoverageStagedChanges
): CoverageStagedChanges {
  const next = { ...stagedChanges }
  delete next[pcode]
  return next
}

export function resetCoverageChanges(): CoverageStagedChanges {
  return {}
}

export function toCoverageFeatureCollection(
  records: CoveragePlannerRecord[]
): RegistryFeatureCollection {
  return {
    type: 'FeatureCollection',
    features: records.map((record) => ({
      type: 'Feature',
      geometry: record.geometry,
      properties: {
        id: record.id,
        name: record.name,
        pcode: record.pcode,
        city: record.city,
        inCho2Scope: record.nextScope === 'in_scope',
        stagedAction: record.stagedAction,
        sourceFid: record.sourceFid,
        sourceDate: record.sourceDate,
        validOn: record.sourceValidOn,
        validTo: record.sourceValidTo,
        areaSqKm: record.sourceAreaSqKm,
      },
    })),
  }
}
