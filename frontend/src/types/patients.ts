export interface Patient {
  id: string // "KLD-2026-0001"
  philhealth_id: string | null
  last_name: string
  first_name: string
  middle_name: string | null
  suffix: string | null
  sex: 'Male' | 'Female'
  date_of_birth: string // "YYYY-MM-DD"
  civil_status: 'Single' | 'Married' | 'Widow/er' | 'Separated' | 'Co-habiting'
  barangay: string
  purok: string
  street_house_no: string
  is_nhts: boolean
  is_4ps: boolean
  is_ip: boolean
  created_at: string
}

export type ProgramCategory = 'General' | 'Maternal' | 'EPI' | 'FP' | 'Nutrition' | 'NCD' | 'TB'
export type ConsultationType = 'New Consultation' | 'Follow-up'

export interface Encounter {
  id: string
  patient_id: string
  consultation_type: ConsultationType
  weight: number | null
  height: number | null
  bp_systolic: number | null
  bp_diastolic: number | null
  temperature: number | null
  bmi: number | null
  program_category: ProgramCategory
  chief_complaint: string
  clinical_notes: string
  diagnosis: string
  consent_given: boolean
  status: 'PENDING_SYNC' | 'PENDING_VALIDATION'
  date_time: string
  provider_id: string
  facility_code: string
}
