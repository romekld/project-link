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
            referencedRelation: "city_barangays"
            referencedColumns: ["id"]
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
            referencedRelation: "city_barangays"
            referencedColumns: ["id"]
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
            referencedRelation: "city_barangays"
            referencedColumns: ["id"]
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
            referencedRelation: "city_barangays"
            referencedColumns: ["id"]
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
            referencedRelation: "health_stations"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: []
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
        Relationships: []
      }
    }
    Functions: {
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
      get_my_role: {
        Args: never
        Returns: Database["public"]["Enums"]["user_role"]
      }
      normalize_geojson_multipolygon: {
        Args: { p_geometry: Json }
        Returns: unknown
      }
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
          slug: string
          station_code: string | null
          updated_at: string | null
          updated_by: string | null
        }
      }
      replace_health_station_coverage: {
        Args: { p_actor_id: string; p_health_station_id: string; p_rows: Json }
        Returns: Json
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
          slug: string
          station_code: string | null
          updated_at: string | null
          updated_by: string | null
        }
      }
    }
    Enums: {
      user_role: "bhw" | "rhm" | "phn" | "phis" | "cho" | "system_admin"
      user_status: "active" | "inactive" | "invited" | "suspended"
    }
    CompositeTypes: {
      [_ in never]: never
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
      user_role: ["bhw", "rhm", "phn", "phis", "cho", "system_admin"],
      user_status: ["active", "inactive", "invited", "suspended"],
    },
  },
} as const
