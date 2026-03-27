import Dexie, { type Table } from 'dexie'
import type { PatientVisit } from '@/features/bhw'

// Keyed store for small values (session mirror, feature flags)
export interface KVEntry {
  key: string    // primary key
  value: string  // JSON string
}

// Phase 2: Workbox background sync queue entry
export interface SyncQueueEntry {
  id?: number          // auto-increment
  record_type: string  // 'patient_visit' | 'tcl_record' etc.
  record_id: string    // client-generated UUID
  payload: string      // JSON string of the record
  status: 'pending' | 'syncing' | 'failed'
  created_at: string   // ISO timestamp
  retry_count: number
}

export class LinkDatabase extends Dexie {
  patientVisits!: Table<PatientVisit, string>
  syncQueue!: Table<SyncQueueEntry, number>
  kvStore!: Table<KVEntry, string>

  constructor() {
    super('link-db')
    this.version(1).stores({
      // Phase 2: BHW offline visit entry (id is client-generated UUID string)
      patientVisits: 'id, status, health_station_id, updated_at',
      // Phase 2: Workbox background sync queue (auto-increment local id)
      syncQueue: '++id, record_type, status, created_at',
      // Phase 1: session mirror + future feature flags
      kvStore: 'key',
    })
  }
}

export const db = new LinkDatabase()
