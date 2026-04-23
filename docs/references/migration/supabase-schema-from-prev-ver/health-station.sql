create table public.health_stations (
  id uuid not null default gen_random_uuid (),
  barangay_id uuid null,
  name text not null,
  address text null,
  created_at timestamp with time zone null default now(),
  physical_city_barangay_id uuid not null,
  facility_type text not null default 'BHS'::text,
  is_active boolean not null default true,
  deactivated_at timestamp with time zone null,
  notes text null,
  updated_at timestamp with time zone null,
  created_by uuid null,
  updated_by uuid null,
  constraint health_stations_pkey primary key (id),
  constraint health_stations_barangay_id_fkey foreign KEY (barangay_id) references barangays (id),
  constraint health_stations_created_by_fkey foreign KEY (created_by) references user_profiles (id),
  constraint health_stations_physical_city_barangay_id_fkey foreign KEY (physical_city_barangay_id) references city_barangays (id),
  constraint health_stations_updated_by_fkey foreign KEY (updated_by) references user_profiles (id),
  constraint health_stations_facility_type_check check (
    (
      facility_type = any (
        array[
          'BHS'::text,
          'BHC'::text,
          'HEALTH_CENTER'::text,
          'OTHER'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists health_stations_physical_city_barangay_idx on public.health_stations using btree (physical_city_barangay_id) TABLESPACE pg_default;

create index IF not exists health_stations_is_active_idx on public.health_stations using btree (is_active) TABLESPACE pg_default;

create trigger ensure_health_station_legacy_coverage_trigger
after INSERT on health_stations for EACH row
execute FUNCTION ensure_health_station_legacy_coverage ();

create trigger set_health_stations_updated_at BEFORE
update on health_stations for EACH row
execute FUNCTION set_updated_at ();

create trigger sync_health_station_legacy_fields_trigger BEFORE INSERT
or
update OF barangay_id,
physical_city_barangay_id,
facility_type on health_stations for EACH row
execute FUNCTION sync_health_station_legacy_fields ();