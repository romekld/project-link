import type { CityBarangayRegistryRecord } from './schema'

export type CoverageStagedAction = 'add' | 'remove'

export type CoverageStagedChanges = Record<string, CoverageStagedAction>

export type CoveragePlannerRecord = CityBarangayRegistryRecord & {
  currentScope: 'in_scope' | 'outside_scope'
  stagedAction: CoverageStagedAction | null
  nextScope: 'in_scope' | 'outside_scope'
}

export type CoveragePlannerStats = {
  totalBarangays: number
  inScope: number
  outsideScope: number
  stagedAdds: number
  stagedRemoves: number
  nextInScope: number
  totalAreaSqKm: number
  inScopeAreaSqKm: number
  outsideScopeAreaSqKm: number
  nextInScopeAreaSqKm: number
}

