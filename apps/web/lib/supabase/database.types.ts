export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      barangays: {
        Row: {
          activated_at: string
          city_barangay_id: string
          deactivated_at: string | null
          id: string
          is_active: boolean
          last_change_reason: string
          last_changed_by: string | null
          name: string
          pcode: string
          updated_at: string | null
        }
        Insert: {
          activated_at?: string
          city_barangay_id: string
          deactivated_at?: string | null
          id?: string
          is_active?: boolean
          last_change_reason?: string
          last_changed_by?: string | null
          name: string
          pcode: string
          updated_at?: string | null
        }
        Update: {
          activated_at?: string
          city_barangay_id?: string
          deactivated_at?: string | null
          id?: string
          is_active?: boolean
          last_change_reason?: string
          last_changed_by?: string | null
          name?: string
          pcode?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "barangays_city_barangay_id_fkey"
            columns: ["city_barangay_id"]
            isOneToOne: false
            referencedRelation: "barangay_coverage_map_view"
            referencedColumns: ["city_barangay_id"]
          },
          {
            foreignKeyName: "barangays_city_barangay_id_fkey"
            columns: ["city_barangay_id"]
            isOneToOne: false
            referencedRelation: "city_barangay_registry_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "barangays_city_barangay_id_fkey"
            columns: ["city_barangay_id"]
            isOneToOne: false
            referencedRelation: "city_barangays"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "barangays_city_barangay_id_fkey"
            columns: ["city_barangay_id"]
            isOneToOne: false
            referencedRelation: "health_station_coverage_view"
            referencedColumns: ["city_barangay_id"]
          },
          {
            foreignKeyName: "barangays_last_changed_by_fkey"
            columns: ["last_changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      city_barangay_geometry_versions: {
        Row: {
          change_type: string
          changed_at: string
          changed_by: string | null
          city_barangay_id: string
          geometry: unknown
          id: string
          reason: string
          source_payload: Json
          version_no: number
        }
        Insert: {
          change_type: string
          changed_at?: string
          changed_by?: string | null
          city_barangay_id: string
          geometry: unknown
          id?: string
          reason: string
          source_payload?: Json
          version_no: number
        }
        Update: {
          change_type?: string
          changed_at?: string
          changed_by?: string | null
          city_barangay_id?: string
          geometry?: unknown
          id?: string
          reason?: string
          source_payload?: Json
          version_no?: number
        }
        Relationships: [
          {
            foreignKeyName: "city_barangay_geometry_versions_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "city_barangay_geometry_versions_city_barangay_id_fkey"
            columns: ["city_barangay_id"]
            isOneToOne: false
            referencedRelation: "barangay_coverage_map_view"
            referencedColumns: ["city_barangay_id"]
          },
          {
            foreignKeyName: "city_barangay_geometry_versions_city_barangay_id_fkey"
            columns: ["city_barangay_id"]
            isOneToOne: false
            referencedRelation: "city_barangay_registry_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "city_barangay_geometry_versions_city_barangay_id_fkey"
            columns: ["city_barangay_id"]
            isOneToOne: false
            referencedRelation: "city_barangays"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "city_barangay_geometry_versions_city_barangay_id_fkey"
            columns: ["city_barangay_id"]
            isOneToOne: false
            referencedRelation: "health_station_coverage_view"
            referencedColumns: ["city_barangay_id"]
          },
        ]
      }
      city_barangay_import_items: {
        Row: {
          action: string
          created_at: string
          existing_city_barangay_id: string | null
          feature_index: number
          id: string
          job_id: string
          name: string | null
          normalized_geometry: unknown
          pcode: string | null
          processed_at: string | null
          selected_overwrite: boolean
          source_payload: Json
          validation_errors: Json
        }
        Insert: {
          action?: string
          created_at?: string
          existing_city_barangay_id?: string | null
          feature_index: number
          id?: string
          job_id: string
          name?: string | null
          normalized_geometry?: unknown
          pcode?: string | null
          processed_at?: string | null
          selected_overwrite?: boolean
          source_payload?: Json
          validation_errors?: Json
        }
        Update: {
          action?: string
          created_at?: string
          existing_city_barangay_id?: string | null
          feature_index?: number
          id?: string
          job_id?: string
          name?: string | null
          normalized_geometry?: unknown
          pcode?: string | null
          processed_at?: string | null
          selected_overwrite?: boolean
          source_payload?: Json
          validation_errors?: Json
        }
        Relationships: [
          {
            foreignKeyName: "city_barangay_import_items_existing_city_barangay_id_fkey"
            columns: ["existing_city_barangay_id"]
            isOneToOne: false
            referencedRelation: "barangay_coverage_map_view"
            referencedColumns: ["city_barangay_id"]
          },
          {
            foreignKeyName: "city_barangay_import_items_existing_city_barangay_id_fkey"
            columns: ["existing_city_barangay_id"]
            isOneToOne: false
            referencedRelation: "city_barangay_registry_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "city_barangay_import_items_existing_city_barangay_id_fkey"
            columns: ["existing_city_barangay_id"]
            isOneToOne: false
            referencedRelation: "city_barangays"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "city_barangay_import_items_existing_city_barangay_id_fkey"
            columns: ["existing_city_barangay_id"]
            isOneToOne: false
            referencedRelation: "health_station_coverage_view"
            referencedColumns: ["city_barangay_id"]
          },
          {
            foreignKeyName: "city_barangay_import_items_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "city_barangay_import_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      city_barangay_import_jobs: {
        Row: {
          committed_at: string | null
          created_at: string
          duplicate_features: number
          error_features: number
          filename: string
          id: string
          payload_size_bytes: number | null
          source_payload: Json
          status: string
          total_features: number
          uploaded_by: string
          valid_features: number
          validated_at: string | null
        }
        Insert: {
          committed_at?: string | null
          created_at?: string
          duplicate_features?: number
          error_features?: number
          filename: string
          id?: string
          payload_size_bytes?: number | null
          source_payload?: Json
          status?: string
          total_features?: number
          uploaded_by: string
          valid_features?: number
          validated_at?: string | null
        }
        Update: {
          committed_at?: string | null
          created_at?: string
          duplicate_features?: number
          error_features?: number
          filename?: string
          id?: string
          payload_size_bytes?: number | null
          source_payload?: Json
          status?: string
          total_features?: number
          uploaded_by?: string
          valid_features?: number
          validated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "city_barangay_import_jobs_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      city_barangays: {
        Row: {
          city: string
          created_at: string
          created_by: string | null
          geometry: unknown
          id: string
          name: string
          pcode: string
          source_area_sqkm: number | null
          source_date: string | null
          source_fid: number | null
          source_payload: Json
          source_valid_on: string | null
          source_valid_to: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          city?: string
          created_at?: string
          created_by?: string | null
          geometry: unknown
          id?: string
          name: string
          pcode: string
          source_area_sqkm?: number | null
          source_date?: string | null
          source_fid?: number | null
          source_payload?: Json
          source_valid_on?: string | null
          source_valid_to?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          city?: string
          created_at?: string
          created_by?: string | null
          geometry?: unknown
          id?: string
          name?: string
          pcode?: string
          source_area_sqkm?: number | null
          source_date?: string | null
          source_fid?: number | null
          source_payload?: Json
          source_valid_on?: string | null
          source_valid_to?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "city_barangays_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "city_barangays_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      health_station_coverage: {
        Row: {
          barangay_id: string
          created_at: string
          created_by: string | null
          health_station_id: string
          id: string
          is_active: boolean
          is_primary: boolean
          notes: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          barangay_id: string
          created_at?: string
          created_by?: string | null
          health_station_id: string
          id?: string
          is_active?: boolean
          is_primary?: boolean
          notes?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          barangay_id?: string
          created_at?: string
          created_by?: string | null
          health_station_id?: string
          id?: string
          is_active?: boolean
          is_primary?: boolean
          notes?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "health_station_coverage_barangay_id_fkey"
            columns: ["barangay_id"]
            isOneToOne: false
            referencedRelation: "barangay_coverage_map_view"
            referencedColumns: ["operational_barangay_id"]
          },
          {
            foreignKeyName: "health_station_coverage_barangay_id_fkey"
            columns: ["barangay_id"]
            isOneToOne: false
            referencedRelation: "barangays"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "health_station_coverage_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "health_station_coverage_health_station_id_fkey"
            columns: ["health_station_id"]
            isOneToOne: false
            referencedRelation: "health_station_management_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "health_station_coverage_health_station_id_fkey"
            columns: ["health_station_id"]
            isOneToOne: false
            referencedRelation: "health_stations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "health_station_coverage_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      health_stations: {
        Row: {
          address: string | null
          created_at: string
          created_by: string | null
          deactivated_at: string | null
          deactivation_reason: string | null
          facility_type: string
          id: string
          is_active: boolean
          latitude: number | null
          longitude: number | null
          name: string
          notes: string | null
          physical_city_barangay_id: string | null
          station_code: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          created_by?: string | null
          deactivated_at?: string | null
          deactivation_reason?: string | null
          facility_type?: string
          id?: string
          is_active?: boolean
          latitude?: number | null
          longitude?: number | null
          name: string
          notes?: string | null
          physical_city_barangay_id?: string | null
          station_code?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          created_by?: string | null
          deactivated_at?: string | null
          deactivation_reason?: string | null
          facility_type?: string
          id?: string
          is_active?: boolean
          latitude?: number | null
          longitude?: number | null
          name?: string
          notes?: string | null
          physical_city_barangay_id?: string | null
          station_code?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "health_stations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "health_stations_physical_city_barangay_id_fkey"
            columns: ["physical_city_barangay_id"]
            isOneToOne: false
            referencedRelation: "barangay_coverage_map_view"
            referencedColumns: ["city_barangay_id"]
          },
          {
            foreignKeyName: "health_stations_physical_city_barangay_id_fkey"
            columns: ["physical_city_barangay_id"]
            isOneToOne: false
            referencedRelation: "city_barangay_registry_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "health_stations_physical_city_barangay_id_fkey"
            columns: ["physical_city_barangay_id"]
            isOneToOne: false
            referencedRelation: "city_barangays"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "health_stations_physical_city_barangay_id_fkey"
            columns: ["physical_city_barangay_id"]
            isOneToOne: false
            referencedRelation: "health_station_coverage_view"
            referencedColumns: ["city_barangay_id"]
          },
          {
            foreignKeyName: "health_stations_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      household_members: {
        Row: {
          classification_q1:
            | Database["public"]["Enums"]["classification_code"]
            | null
          classification_q2:
            | Database["public"]["Enums"]["classification_code"]
            | null
          classification_q3:
            | Database["public"]["Enums"]["classification_code"]
            | null
          classification_q4:
            | Database["public"]["Enums"]["classification_code"]
            | null
          created_at: string
          date_of_birth: string
          dob_estimated: boolean
          household_id: string
          id: string
          local_id: string | null
          member_first_name: string
          member_last_name: string
          member_middle_name: string | null
          member_mothers_maiden_name: string | null
          member_philhealth_id: string | null
          member_remarks: string | null
          relationship_to_hh_head: Database["public"]["Enums"]["relationship_to_hh_head"]
          sex: string
          updated_at: string
        }
        Insert: {
          classification_q1?:
            | Database["public"]["Enums"]["classification_code"]
            | null
          classification_q2?:
            | Database["public"]["Enums"]["classification_code"]
            | null
          classification_q3?:
            | Database["public"]["Enums"]["classification_code"]
            | null
          classification_q4?:
            | Database["public"]["Enums"]["classification_code"]
            | null
          created_at?: string
          date_of_birth: string
          dob_estimated?: boolean
          household_id: string
          id?: string
          local_id?: string | null
          member_first_name: string
          member_last_name: string
          member_middle_name?: string | null
          member_mothers_maiden_name?: string | null
          member_philhealth_id?: string | null
          member_remarks?: string | null
          relationship_to_hh_head: Database["public"]["Enums"]["relationship_to_hh_head"]
          sex: string
          updated_at?: string
        }
        Update: {
          classification_q1?:
            | Database["public"]["Enums"]["classification_code"]
            | null
          classification_q2?:
            | Database["public"]["Enums"]["classification_code"]
            | null
          classification_q3?:
            | Database["public"]["Enums"]["classification_code"]
            | null
          classification_q4?:
            | Database["public"]["Enums"]["classification_code"]
            | null
          created_at?: string
          date_of_birth?: string
          dob_estimated?: boolean
          household_id?: string
          id?: string
          local_id?: string | null
          member_first_name?: string
          member_last_name?: string
          member_middle_name?: string | null
          member_mothers_maiden_name?: string | null
          member_philhealth_id?: string | null
          member_remarks?: string | null
          relationship_to_hh_head?: Database["public"]["Enums"]["relationship_to_hh_head"]
          sex?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "household_members_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      households: {
        Row: {
          assigned_bhw_id: string | null
          barangay_id: string | null
          created_at: string
          health_station_id: string | null
          hh_head_philhealth_category:
            | Database["public"]["Enums"]["philhealth_category"]
            | null
          hh_head_philhealth_id: string | null
          hh_head_philhealth_member: boolean
          house_no_street: string | null
          household_number: string | null
          id: string
          is_indigenous_people: boolean
          latitude: number | null
          local_id: string | null
          longitude: number | null
          nhts_status: Database["public"]["Enums"]["nhts_status"]
          purok: string | null
          respondent_first_name: string
          respondent_last_name: string
          respondent_middle_name: string | null
          returned_reason: string | null
          sync_status: Database["public"]["Enums"]["hh_sync_status"]
          updated_at: string
          visit_date_q1: string | null
          visit_date_q2: string | null
          visit_date_q3: string | null
          visit_date_q4: string | null
          year: number
        }
        Insert: {
          assigned_bhw_id?: string | null
          barangay_id?: string | null
          created_at?: string
          health_station_id?: string | null
          hh_head_philhealth_category?:
            | Database["public"]["Enums"]["philhealth_category"]
            | null
          hh_head_philhealth_id?: string | null
          hh_head_philhealth_member?: boolean
          house_no_street?: string | null
          household_number?: string | null
          id?: string
          is_indigenous_people?: boolean
          latitude?: number | null
          local_id?: string | null
          longitude?: number | null
          nhts_status?: Database["public"]["Enums"]["nhts_status"]
          purok?: string | null
          respondent_first_name: string
          respondent_last_name: string
          respondent_middle_name?: string | null
          returned_reason?: string | null
          sync_status?: Database["public"]["Enums"]["hh_sync_status"]
          updated_at?: string
          visit_date_q1?: string | null
          visit_date_q2?: string | null
          visit_date_q3?: string | null
          visit_date_q4?: string | null
          year?: number
        }
        Update: {
          assigned_bhw_id?: string | null
          barangay_id?: string | null
          created_at?: string
          health_station_id?: string | null
          hh_head_philhealth_category?:
            | Database["public"]["Enums"]["philhealth_category"]
            | null
          hh_head_philhealth_id?: string | null
          hh_head_philhealth_member?: boolean
          house_no_street?: string | null
          household_number?: string | null
          id?: string
          is_indigenous_people?: boolean
          latitude?: number | null
          local_id?: string | null
          longitude?: number | null
          nhts_status?: Database["public"]["Enums"]["nhts_status"]
          purok?: string | null
          respondent_first_name?: string
          respondent_last_name?: string
          respondent_middle_name?: string | null
          returned_reason?: string | null
          sync_status?: Database["public"]["Enums"]["hh_sync_status"]
          updated_at?: string
          visit_date_q1?: string | null
          visit_date_q2?: string | null
          visit_date_q3?: string | null
          visit_date_q4?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "households_assigned_bhw_id_fkey"
            columns: ["assigned_bhw_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "households_barangay_id_fkey"
            columns: ["barangay_id"]
            isOneToOne: false
            referencedRelation: "barangay_coverage_map_view"
            referencedColumns: ["city_barangay_id"]
          },
          {
            foreignKeyName: "households_barangay_id_fkey"
            columns: ["barangay_id"]
            isOneToOne: false
            referencedRelation: "city_barangay_registry_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "households_barangay_id_fkey"
            columns: ["barangay_id"]
            isOneToOne: false
            referencedRelation: "city_barangays"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "households_barangay_id_fkey"
            columns: ["barangay_id"]
            isOneToOne: false
            referencedRelation: "health_station_coverage_view"
            referencedColumns: ["city_barangay_id"]
          },
          {
            foreignKeyName: "households_health_station_id_fkey"
            columns: ["health_station_id"]
            isOneToOne: false
            referencedRelation: "health_station_management_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "households_health_station_id_fkey"
            columns: ["health_station_id"]
            isOneToOne: false
            referencedRelation: "health_stations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address_line_1: string | null
          address_line_2: string | null
          admin_notes: string | null
          alternate_mobile_number: string | null
          city_municipality: string | null
          coverage_notes: string | null
          created_at: string
          date_of_birth: string | null
          deactivation_reason: string | null
          email: string
          first_name: string
          health_station_id: string | null
          id: string
          last_login_at: string | null
          last_name: string
          middle_name: string | null
          mobile_number: string | null
          must_change_password: boolean
          name_suffix: string | null
          password_changed_at: string | null
          profile_photo_url: string | null
          province: string | null
          purok_assignment: string | null
          role: Database["public"]["Enums"]["user_role"]
          sex: string | null
          status: Database["public"]["Enums"]["user_status"]
          updated_at: string
          user_id: string
          username: string
        }
        Insert: {
          address_line_1?: string | null
          address_line_2?: string | null
          admin_notes?: string | null
          alternate_mobile_number?: string | null
          city_municipality?: string | null
          coverage_notes?: string | null
          created_at?: string
          date_of_birth?: string | null
          deactivation_reason?: string | null
          email: string
          first_name: string
          health_station_id?: string | null
          id: string
          last_login_at?: string | null
          last_name: string
          middle_name?: string | null
          mobile_number?: string | null
          must_change_password?: boolean
          name_suffix?: string | null
          password_changed_at?: string | null
          profile_photo_url?: string | null
          province?: string | null
          purok_assignment?: string | null
          role: Database["public"]["Enums"]["user_role"]
          sex?: string | null
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string
          user_id: string
          username: string
        }
        Update: {
          address_line_1?: string | null
          address_line_2?: string | null
          admin_notes?: string | null
          alternate_mobile_number?: string | null
          city_municipality?: string | null
          coverage_notes?: string | null
          created_at?: string
          date_of_birth?: string | null
          deactivation_reason?: string | null
          email?: string
          first_name?: string
          health_station_id?: string | null
          id?: string
          last_login_at?: string | null
          last_name?: string
          middle_name?: string | null
          mobile_number?: string | null
          must_change_password?: boolean
          name_suffix?: string | null
          password_changed_at?: string | null
          profile_photo_url?: string | null
          province?: string | null
          purok_assignment?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          sex?: string | null
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string
          user_id?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_health_station_id_fkey"
            columns: ["health_station_id"]
            isOneToOne: false
            referencedRelation: "health_station_management_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_health_station_id_fkey"
            columns: ["health_station_id"]
            isOneToOne: false
            referencedRelation: "health_stations"
            referencedColumns: ["id"]
          },
        ]
      }
      spatial_ref_sys: {
        Row: {
          auth_name: string | null
          auth_srid: number | null
          proj4text: string | null
          srid: number
          srtext: string | null
        }
        Insert: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid: number
          srtext?: string | null
        }
        Update: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid?: number
          srtext?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      barangay_coverage_map_view: {
        Row: {
          city: string | null
          city_barangay_id: string | null
          geometry: Json | null
          in_cho_scope: boolean | null
          name: string | null
          operational_barangay_id: string | null
          pcode: string | null
          source_area_sqkm: number | null
          source_date: string | null
          source_valid_on: string | null
          source_valid_to: string | null
          updated_at: string | null
        }
        Relationships: []
      }
      city_barangay_registry_view: {
        Row: {
          city: string | null
          geometry: Json | null
          id: string | null
          in_cho_scope: boolean | null
          name: string | null
          pcode: string | null
          source_area_sqkm: number | null
          source_date: string | null
          source_fid: number | null
          source_payload: Json | null
          source_valid_on: string | null
          source_valid_to: string | null
          updated_at: string | null
          version_count: number | null
        }
        Relationships: []
      }
      geography_columns: {
        Row: {
          coord_dimension: number | null
          f_geography_column: unknown
          f_table_catalog: unknown
          f_table_name: unknown
          f_table_schema: unknown
          srid: number | null
          type: string | null
        }
        Relationships: []
      }
      geometry_columns: {
        Row: {
          coord_dimension: number | null
          f_geometry_column: unknown
          f_table_catalog: string | null
          f_table_name: unknown
          f_table_schema: unknown
          srid: number | null
          type: string | null
        }
        Insert: {
          coord_dimension?: number | null
          f_geometry_column?: unknown
          f_table_catalog?: string | null
          f_table_name?: unknown
          f_table_schema?: unknown
          srid?: number | null
          type?: string | null
        }
        Update: {
          coord_dimension?: number | null
          f_geometry_column?: unknown
          f_table_catalog?: string | null
          f_table_name?: unknown
          f_table_schema?: unknown
          srid?: number | null
          type?: string | null
        }
        Relationships: []
      }
      health_station_coverage_view: {
        Row: {
          barangay_id: string | null
          barangay_name: string | null
          barangay_pcode: string | null
          city_barangay_id: string | null
          city_barangay_name: string | null
          created_at: string | null
          health_station_id: string | null
          health_station_name: string | null
          id: string | null
          is_active: boolean | null
          is_primary: boolean | null
          notes: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "health_station_coverage_barangay_id_fkey"
            columns: ["barangay_id"]
            isOneToOne: false
            referencedRelation: "barangay_coverage_map_view"
            referencedColumns: ["operational_barangay_id"]
          },
          {
            foreignKeyName: "health_station_coverage_barangay_id_fkey"
            columns: ["barangay_id"]
            isOneToOne: false
            referencedRelation: "barangays"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "health_station_coverage_health_station_id_fkey"
            columns: ["health_station_id"]
            isOneToOne: false
            referencedRelation: "health_station_management_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "health_station_coverage_health_station_id_fkey"
            columns: ["health_station_id"]
            isOneToOne: false
            referencedRelation: "health_stations"
            referencedColumns: ["id"]
          },
        ]
      }
      health_station_management_view: {
        Row: {
          address: string | null
          assigned_staff_count: number | null
          coverage_count: number | null
          created_at: string | null
          deactivated_at: string | null
          deactivation_reason: string | null
          facility_type: string | null
          id: string | null
          is_active: boolean | null
          latitude: number | null
          longitude: number | null
          name: string | null
          notes: string | null
          physical_barangay_name: string | null
          physical_barangay_pcode: string | null
          physical_city_barangay_id: string | null
          primary_coverage_count: number | null
          station_code: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "health_stations_physical_city_barangay_id_fkey"
            columns: ["physical_city_barangay_id"]
            isOneToOne: false
            referencedRelation: "barangay_coverage_map_view"
            referencedColumns: ["city_barangay_id"]
          },
          {
            foreignKeyName: "health_stations_physical_city_barangay_id_fkey"
            columns: ["physical_city_barangay_id"]
            isOneToOne: false
            referencedRelation: "city_barangay_registry_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "health_stations_physical_city_barangay_id_fkey"
            columns: ["physical_city_barangay_id"]
            isOneToOne: false
            referencedRelation: "city_barangays"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "health_stations_physical_city_barangay_id_fkey"
            columns: ["physical_city_barangay_id"]
            isOneToOne: false
            referencedRelation: "health_station_coverage_view"
            referencedColumns: ["city_barangay_id"]
          },
        ]
      }
    }
    Functions: {
      _postgis_deprecate: {
        Args: { newname: string; oldname: string; version: string }
        Returns: undefined
      }
      _postgis_index_extent: {
        Args: { col: string; tbl: unknown }
        Returns: unknown
      }
      _postgis_pgsql_version: { Args: never; Returns: string }
      _postgis_scripts_pgsql_version: { Args: never; Returns: string }
      _postgis_selectivity: {
        Args: { att_name: string; geom: unknown; mode?: string; tbl: unknown }
        Returns: number
      }
      _postgis_stats: {
        Args: { ""?: string; att_name: string; tbl: unknown }
        Returns: string
      }
      _st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_coveredby:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_covers:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_crosses: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      _st_equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_intersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      _st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      _st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      _st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_sortablehash: { Args: { geom: unknown }; Returns: number }
      _st_touches: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_voronoi: {
        Args: {
          clip?: unknown
          g1: unknown
          return_polygons?: boolean
          tolerance?: number
        }
        Returns: unknown
      }
      _st_within: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      addauth: { Args: { "": string }; Returns: boolean }
      addgeometrycolumn:
        | {
            Args: {
              catalog_name: string
              column_name: string
              new_dim: number
              new_srid_in: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
      apply_barangay_coverage_change: {
        Args: {
          p_action: string
          p_actor_id: string
          p_city_barangay_id: string
          p_name?: string
          p_reason: string
        }
        Returns: Json
      }
      deactivate_health_station: {
        Args: {
          p_actor_id: string
          p_health_station_id: string
          p_reason: string
        }
        Returns: Json
      }
      disablelongtransactions: { Args: never; Returns: string }
      dropgeometrycolumn:
        | {
            Args: {
              catalog_name: string
              column_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | { Args: { column_name: string; table_name: string }; Returns: string }
      dropgeometrytable:
        | {
            Args: {
              catalog_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | { Args: { schema_name: string; table_name: string }; Returns: string }
        | { Args: { table_name: string }; Returns: string }
      enablelongtransactions: { Args: never; Returns: string }
      equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      geometry: { Args: { "": string }; Returns: unknown }
      geometry_above: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_below: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_cmp: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_contained_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_distance_box: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_distance_centroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_eq: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_ge: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_gt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_le: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_left: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_lt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overabove: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overbelow: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overleft: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overright: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_right: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_within: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geomfromewkt: { Args: { "": string }; Returns: unknown }
      get_my_role: {
        Args: never
        Returns: Database["public"]["Enums"]["user_role"]
      }
      gettransactionid: { Args: never; Returns: unknown }
      longtransactionsenabled: { Args: never; Returns: boolean }
      normalize_geojson_multipolygon: {
        Args: { p_geometry: Json }
        Returns: unknown
      }
      populate_geometry_columns:
        | { Args: { tbl_oid: unknown; use_typmod?: boolean }; Returns: number }
        | { Args: { use_typmod?: boolean }; Returns: string }
      postgis_constraint_dims: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_srid: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_type: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: string
      }
      postgis_extensions_upgrade: { Args: never; Returns: string }
      postgis_full_version: { Args: never; Returns: string }
      postgis_geos_version: { Args: never; Returns: string }
      postgis_lib_build_date: { Args: never; Returns: string }
      postgis_lib_revision: { Args: never; Returns: string }
      postgis_lib_version: { Args: never; Returns: string }
      postgis_libjson_version: { Args: never; Returns: string }
      postgis_liblwgeom_version: { Args: never; Returns: string }
      postgis_libprotobuf_version: { Args: never; Returns: string }
      postgis_libxml_version: { Args: never; Returns: string }
      postgis_proj_version: { Args: never; Returns: string }
      postgis_scripts_build_date: { Args: never; Returns: string }
      postgis_scripts_installed: { Args: never; Returns: string }
      postgis_scripts_released: { Args: never; Returns: string }
      postgis_svn_version: { Args: never; Returns: string }
      postgis_type_name: {
        Args: {
          coord_dimension: number
          geomname: string
          use_new_name?: boolean
        }
        Returns: string
      }
      postgis_version: { Args: never; Returns: string }
      postgis_wagyu_version: { Args: never; Returns: string }
      preview_health_station_coverage_impact: {
        Args: { p_health_station_id: string; p_rows: Json }
        Returns: Json
      }
      reactivate_health_station: {
        Args: { p_actor_id: string; p_health_station_id: string }
        Returns: {
          address: string | null
          created_at: string
          created_by: string | null
          deactivated_at: string | null
          deactivation_reason: string | null
          facility_type: string
          id: string
          is_active: boolean
          latitude: number | null
          longitude: number | null
          name: string
          notes: string | null
          physical_city_barangay_id: string | null
          station_code: string | null
          updated_at: string | null
          updated_by: string | null
        }
        SetofOptions: {
          from: "*"
          to: "health_stations"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      record_city_barangay_geometry_version: {
        Args: {
          p_change_type: string
          p_changed_by: string
          p_city_barangay_id: string
          p_geometry: unknown
          p_reason: string
          p_source_payload: Json
        }
        Returns: undefined
      }
      replace_health_station_coverage: {
        Args: { p_actor_id: string; p_health_station_id: string; p_rows: Json }
        Returns: Json
      }
      st_3dclosestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3ddistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_3dlongestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmakebox: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmaxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dshortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_addpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_angle:
        | { Args: { line1: unknown; line2: unknown }; Returns: number }
        | {
            Args: { pt1: unknown; pt2: unknown; pt3: unknown; pt4?: unknown }
            Returns: number
          }
      st_area:
        | { Args: { geog: unknown; use_spheroid?: boolean }; Returns: number }
        | { Args: { "": string }; Returns: number }
      st_asencodedpolyline: {
        Args: { geom: unknown; nprecision?: number }
        Returns: string
      }
      st_asewkt: { Args: { "": string }; Returns: string }
      st_asgeojson:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | {
            Args: {
              geom_column?: string
              maxdecimaldigits?: number
              pretty_bool?: boolean
              r: Record<string, unknown>
            }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_asgml:
        | {
            Args: {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
            }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
        | {
            Args: {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
            Returns: string
          }
        | {
            Args: {
              geom: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
            Returns: string
          }
      st_askml:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; nprefix?: string }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; nprefix?: string }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_aslatlontext: {
        Args: { geom: unknown; tmpl?: string }
        Returns: string
      }
      st_asmarc21: { Args: { format?: string; geom: unknown }; Returns: string }
      st_asmvtgeom: {
        Args: {
          bounds: unknown
          buffer?: number
          clip_geom?: boolean
          extent?: number
          geom: unknown
        }
        Returns: unknown
      }
      st_assvg:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; rel?: number }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; rel?: number }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_astext: { Args: { "": string }; Returns: string }
      st_astwkb:
        | {
            Args: {
              geom: unknown
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              geom: unknown[]
              ids: number[]
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
            Returns: string
          }
      st_asx3d: {
        Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
        Returns: string
      }
      st_azimuth:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: number }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
      st_boundingdiagonal: {
        Args: { fits?: boolean; geom: unknown }
        Returns: unknown
      }
      st_buffer:
        | {
            Args: { geom: unknown; options?: string; radius: number }
            Returns: unknown
          }
        | {
            Args: { geom: unknown; quadsegs: number; radius: number }
            Returns: unknown
          }
      st_centroid: { Args: { "": string }; Returns: unknown }
      st_clipbybox2d: {
        Args: { box: unknown; geom: unknown }
        Returns: unknown
      }
      st_closestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_collect: { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
      st_concavehull: {
        Args: {
          param_allow_holes?: boolean
          param_geom: unknown
          param_pctconvex: number
        }
        Returns: unknown
      }
      st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_coorddim: { Args: { geometry: unknown }; Returns: number }
      st_coveredby:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_covers:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_crosses: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_curvetoline: {
        Args: { flags?: number; geom: unknown; tol?: number; toltype?: number }
        Returns: unknown
      }
      st_delaunaytriangles: {
        Args: { flags?: number; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_difference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_disjoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_distance:
        | {
            Args: { geog1: unknown; geog2: unknown; use_spheroid?: boolean }
            Returns: number
          }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
      st_distancesphere:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
        | {
            Args: { geom1: unknown; geom2: unknown; radius: number }
            Returns: number
          }
      st_distancespheroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      st_equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_expand:
        | { Args: { box: unknown; dx: number; dy: number }; Returns: unknown }
        | {
            Args: { box: unknown; dx: number; dy: number; dz?: number }
            Returns: unknown
          }
        | {
            Args: {
              dm?: number
              dx: number
              dy: number
              dz?: number
              geom: unknown
            }
            Returns: unknown
          }
      st_force3d: { Args: { geom: unknown; zvalue?: number }; Returns: unknown }
      st_force3dm: {
        Args: { geom: unknown; mvalue?: number }
        Returns: unknown
      }
      st_force3dz: {
        Args: { geom: unknown; zvalue?: number }
        Returns: unknown
      }
      st_force4d: {
        Args: { geom: unknown; mvalue?: number; zvalue?: number }
        Returns: unknown
      }
      st_generatepoints:
        | { Args: { area: unknown; npoints: number }; Returns: unknown }
        | {
            Args: { area: unknown; npoints: number; seed: number }
            Returns: unknown
          }
      st_geogfromtext: { Args: { "": string }; Returns: unknown }
      st_geographyfromtext: { Args: { "": string }; Returns: unknown }
      st_geohash:
        | { Args: { geog: unknown; maxchars?: number }; Returns: string }
        | { Args: { geom: unknown; maxchars?: number }; Returns: string }
      st_geomcollfromtext: { Args: { "": string }; Returns: unknown }
      st_geometricmedian: {
        Args: {
          fail_if_not_converged?: boolean
          g: unknown
          max_iter?: number
          tolerance?: number
        }
        Returns: unknown
      }
      st_geometryfromtext: { Args: { "": string }; Returns: unknown }
      st_geomfromewkt: { Args: { "": string }; Returns: unknown }
      st_geomfromgeojson:
        | { Args: { "": Json }; Returns: unknown }
        | { Args: { "": Json }; Returns: unknown }
        | { Args: { "": string }; Returns: unknown }
      st_geomfromgml: { Args: { "": string }; Returns: unknown }
      st_geomfromkml: { Args: { "": string }; Returns: unknown }
      st_geomfrommarc21: { Args: { marc21xml: string }; Returns: unknown }
      st_geomfromtext: { Args: { "": string }; Returns: unknown }
      st_gmltosql: { Args: { "": string }; Returns: unknown }
      st_hasarc: { Args: { geometry: unknown }; Returns: boolean }
      st_hausdorffdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_hexagon: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_hexagongrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_interpolatepoint: {
        Args: { line: unknown; point: unknown }
        Returns: number
      }
      st_intersection: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_intersects:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_isvaliddetail: {
        Args: { flags?: number; geom: unknown }
        Returns: Database["public"]["CompositeTypes"]["valid_detail"]
        SetofOptions: {
          from: "*"
          to: "valid_detail"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      st_length:
        | { Args: { geog: unknown; use_spheroid?: boolean }; Returns: number }
        | { Args: { "": string }; Returns: number }
      st_letters: { Args: { font?: Json; letters: string }; Returns: unknown }
      st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      st_linefromencodedpolyline: {
        Args: { nprecision?: number; txtin: string }
        Returns: unknown
      }
      st_linefromtext: { Args: { "": string }; Returns: unknown }
      st_linelocatepoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_linetocurve: { Args: { geometry: unknown }; Returns: unknown }
      st_locatealong: {
        Args: { geometry: unknown; leftrightoffset?: number; measure: number }
        Returns: unknown
      }
      st_locatebetween: {
        Args: {
          frommeasure: number
          geometry: unknown
          leftrightoffset?: number
          tomeasure: number
        }
        Returns: unknown
      }
      st_locatebetweenelevations: {
        Args: { fromelevation: number; geometry: unknown; toelevation: number }
        Returns: unknown
      }
      st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makebox2d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makeline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makevalid: {
        Args: { geom: unknown; params: string }
        Returns: unknown
      }
      st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_minimumboundingcircle: {
        Args: { inputgeom: unknown; segs_per_quarter?: number }
        Returns: unknown
      }
      st_mlinefromtext: { Args: { "": string }; Returns: unknown }
      st_mpointfromtext: { Args: { "": string }; Returns: unknown }
      st_mpolyfromtext: { Args: { "": string }; Returns: unknown }
      st_multilinestringfromtext: { Args: { "": string }; Returns: unknown }
      st_multipointfromtext: { Args: { "": string }; Returns: unknown }
      st_multipolygonfromtext: { Args: { "": string }; Returns: unknown }
      st_node: { Args: { g: unknown }; Returns: unknown }
      st_normalize: { Args: { geom: unknown }; Returns: unknown }
      st_offsetcurve: {
        Args: { distance: number; line: unknown; params?: string }
        Returns: unknown
      }
      st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_perimeter: {
        Args: { geog: unknown; use_spheroid?: boolean }
        Returns: number
      }
      st_pointfromtext: { Args: { "": string }; Returns: unknown }
      st_pointm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
        }
        Returns: unknown
      }
      st_pointz: {
        Args: {
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_pointzm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_polyfromtext: { Args: { "": string }; Returns: unknown }
      st_polygonfromtext: { Args: { "": string }; Returns: unknown }
      st_project: {
        Args: { azimuth: number; distance: number; geog: unknown }
        Returns: unknown
      }
      st_quantizecoordinates: {
        Args: {
          g: unknown
          prec_m?: number
          prec_x: number
          prec_y?: number
          prec_z?: number
        }
        Returns: unknown
      }
      st_reduceprecision: {
        Args: { geom: unknown; gridsize: number }
        Returns: unknown
      }
      st_relate: { Args: { geom1: unknown; geom2: unknown }; Returns: string }
      st_removerepeatedpoints: {
        Args: { geom: unknown; tolerance?: number }
        Returns: unknown
      }
      st_segmentize: {
        Args: { geog: unknown; max_segment_length: number }
        Returns: unknown
      }
      st_setsrid:
        | { Args: { geog: unknown; srid: number }; Returns: unknown }
        | { Args: { geom: unknown; srid: number }; Returns: unknown }
      st_sharedpaths: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_shortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_simplifypolygonhull: {
        Args: { geom: unknown; is_outer?: boolean; vertex_fraction: number }
        Returns: unknown
      }
      st_split: { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
      st_square: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_squaregrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_srid:
        | { Args: { geog: unknown }; Returns: number }
        | { Args: { geom: unknown }; Returns: number }
      st_subdivide: {
        Args: { geom: unknown; gridsize?: number; maxvertices?: number }
        Returns: unknown[]
      }
      st_swapordinates: {
        Args: { geom: unknown; ords: unknown }
        Returns: unknown
      }
      st_symdifference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_symmetricdifference: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_tileenvelope: {
        Args: {
          bounds?: unknown
          margin?: number
          x: number
          y: number
          zoom: number
        }
        Returns: unknown
      }
      st_touches: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_transform:
        | {
            Args: { from_proj: string; geom: unknown; to_proj: string }
            Returns: unknown
          }
        | {
            Args: { from_proj: string; geom: unknown; to_srid: number }
            Returns: unknown
          }
        | { Args: { geom: unknown; to_proj: string }; Returns: unknown }
      st_triangulatepolygon: { Args: { g1: unknown }; Returns: unknown }
      st_union:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
        | {
            Args: { geom1: unknown; geom2: unknown; gridsize: number }
            Returns: unknown
          }
      st_voronoilines: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_voronoipolygons: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_within: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_wkbtosql: { Args: { wkb: string }; Returns: unknown }
      st_wkttosql: { Args: { "": string }; Returns: unknown }
      st_wrapx: {
        Args: { geom: unknown; move: number; wrap: number }
        Returns: unknown
      }
      unlockrows: { Args: { "": string }; Returns: number }
      updategeometrysrid: {
        Args: {
          catalogn_name: string
          column_name: string
          new_srid_in: number
          schema_name: string
          table_name: string
        }
        Returns: string
      }
      upsert_city_barangay: {
        Args: {
          p_actor_id: string
          p_city: string
          p_geometry_geojson: Json
          p_name: string
          p_overwrite?: boolean
          p_pcode: string
          p_reason: string
          p_source_area_sqkm?: number
          p_source_date?: string
          p_source_fid?: number
          p_source_payload?: Json
          p_source_valid_on?: string
          p_source_valid_to?: string
        }
        Returns: {
          city: string
          created_at: string
          created_by: string | null
          geometry: unknown
          id: string
          name: string
          pcode: string
          source_area_sqkm: number | null
          source_date: string | null
          source_fid: number | null
          source_payload: Json
          source_valid_on: string | null
          source_valid_to: string | null
          updated_at: string | null
          updated_by: string | null
        }
        SetofOptions: {
          from: "*"
          to: "city_barangays"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      upsert_health_station: {
        Args: {
          p_actor_id: string
          p_address?: string
          p_deactivation_reason?: string
          p_facility_type?: string
          p_is_active?: boolean
          p_latitude?: number
          p_longitude?: number
          p_name?: string
          p_notes?: string
          p_physical_city_barangay_id?: string
          p_station_code?: string
          p_station_id?: string
        }
        Returns: {
          address: string | null
          created_at: string
          created_by: string | null
          deactivated_at: string | null
          deactivation_reason: string | null
          facility_type: string
          id: string
          is_active: boolean
          latitude: number | null
          longitude: number | null
          name: string
          notes: string | null
          physical_city_barangay_id: string | null
          station_code: string | null
          updated_at: string | null
          updated_by: string | null
        }
        SetofOptions: {
          from: "*"
          to: "health_stations"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      classification_code:
        | "N"
        | "I"
        | "U"
        | "S"
        | "A"
        | "P"
        | "AP"
        | "PP"
        | "WRA"
        | "SC"
        | "PWD"
        | "AB"
      hh_sync_status:
        | "draft"
        | "pending_sync"
        | "pending_validation"
        | "returned"
        | "validated"
      nhts_status: "NHTS-4Ps" | "Non-NHTS"
      philhealth_category:
        | "Formal Economy"
        | "Informal Economy"
        | "Indigent/Sponsored"
        | "Senior Citizen"
        | "Other"
      relationship_to_hh_head:
        | "1-Head"
        | "2-Spouse"
        | "3-Son"
        | "4-Daughter"
        | "5-Others"
      user_role: "bhw" | "rhm" | "phn" | "phis" | "cho" | "system_admin"
      user_status: "active" | "inactive" | "invited" | "suspended"
    }
    CompositeTypes: {
      geometry_dump: {
        path: number[] | null
        geom: unknown
      }
      valid_detail: {
        valid: boolean | null
        reason: string | null
        location: unknown
      }
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      classification_code: [
        "N",
        "I",
        "U",
        "S",
        "A",
        "P",
        "AP",
        "PP",
        "WRA",
        "SC",
        "PWD",
        "AB",
      ],
      hh_sync_status: [
        "draft",
        "pending_sync",
        "pending_validation",
        "returned",
        "validated",
      ],
      nhts_status: ["NHTS-4Ps", "Non-NHTS"],
      philhealth_category: [
        "Formal Economy",
        "Informal Economy",
        "Indigent/Sponsored",
        "Senior Citizen",
        "Other",
      ],
      relationship_to_hh_head: [
        "1-Head",
        "2-Spouse",
        "3-Son",
        "4-Daughter",
        "5-Others",
      ],
      user_role: ["bhw", "rhm", "phn", "phis", "cho", "system_admin"],
      user_status: ["active", "inactive", "invited", "suspended"],
    },
  },
} as const
