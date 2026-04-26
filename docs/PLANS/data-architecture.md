# Project LINK — Data Architecture

> Finalized schema design for Phase 2+ health data modules.
> Last updated: 2026-04-26
> Complements: `ml-strategy.md`, `architecture.md`

---

## Confirmed Decisions

| Question | Decision | Rationale |
|---|---|---|
| Separate data warehouse? | **No.** Five PostgreSQL schemas within Supabase. | 32 BHS / 164K population is within PostgreSQL's ceiling. DWH adds sync complexity with no payoff at this scale. |
| Facility hierarchy | **`facilities` table replaces `health_stations`.** CHO2 + all BHS share one table with `type` and `parent_id`. | CHO2 must be a first-class DB entity for hierarchy queries, GIS layers, and future multi-CHO expansion. |
| Health worker identity | **Separate `health_workers` table** with nullable `profile_id`. | Providers appear in clinical records (ITR, visits) but may not have system logins (visiting doctors, retired midwives, transferred BHWs). |
| ST and MCT storage | **Stored as locked snapshot tables.** Values frozen on submit, locked on approval. | FHSIS compliance: a submitted monthly report is a legal artifact. Late TCL corrections create amendments, not retroactive changes. JSONB for indicator values allows DOH indicator code changes without schema migrations. |
| Analytics layer | **Materialized views in `analytics` schema**, refreshed nightly via pg_cron. | No separate analytics DB needed. |
| ML feature store | **`ml.feature_snapshots` with JSONB.** | Feature schema evolves during research without requiring migrations. Matches existing `ml-strategy.md` design. |

---

## Schema Organization

One Supabase PostgreSQL instance, five schemas:

```
public/      Core OLTP — facilities, persons, ITR, TCL, ST, MCT, supply chain
analytics/   Materialized views — disease incidence, coverage rates, consumption
ml/          ML tables — risk scores, forecasts, model registry, feature snapshots
sync/        Offline buffer — BHW submission queue from IndexedDB
audit/       Compliance — append-only mutation log (RA 10173)
```

---

## Schema: `public` — Operational OLTP

### Facilities (replaces `health_stations`)

```sql
CREATE TABLE public.facilities (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  code                 TEXT        UNIQUE NOT NULL,          -- e.g. 'CHO2', 'BHS-PAL3'
  type                 TEXT        NOT NULL,                 -- 'cho' | 'bhs' | 'rhu'
  name                 TEXT        NOT NULL,
  slug                 TEXT        UNIQUE NOT NULL,          -- retained for URL compat
  parent_id            UUID        REFERENCES facilities(id),-- NULL for CHO2 (root)
  barangay_psgc        TEXT,                                 -- PhilSys geo code
  geolocation          GEOMETRY(Point, 4326),                -- PostGIS
  catchment_population INT,
  is_active            BOOLEAN     NOT NULL DEFAULT true,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Seed plan:**
- CHO2 row added as root (`parent_id = NULL`, `type = 'cho'`).
- Existing 5 `health_stations` rows migrated as `type = 'bhs'` with `parent_id = CHO2.id`.
- Remaining 27 BHS added in the same migration.

**`profiles` change:** `health_station_id UUID → facility_id UUID` references `facilities(id)`.
All BHW and RHM profiles point to their assigned BHS facility row. CHO and PHN profiles point to the CHO2 facility row.

---

### Health Workers

Decouples clinical identity from system access. A provider can appear in patient records without having a login.

```sql
CREATE TABLE public.health_workers (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id  UUID        NOT NULL REFERENCES facilities(id),
  profile_id   UUID        REFERENCES profiles(id),   -- NULL if no system account
  role         TEXT        NOT NULL,  -- 'bhw' | 'rhm' | 'phn' | 'phis' | 'cho' | 'doctor'
  license_no   TEXT,
  is_active    BOOLEAN     NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

`health_workers.id` is used as `attendant_id` / `provider_id` / `recorded_by` in all clinical tables. Not `profiles.id`.

---

### Persons and Households

```sql
CREATE TABLE public.households (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id      UUID        NOT NULL REFERENCES facilities(id),
  household_no     TEXT        NOT NULL,
  address          TEXT,
  city_barangay_id UUID        REFERENCES city_barangays(id), -- GIS link
  geolocation      GEOMETRY(Point, 4326),
  deleted_at       TIMESTAMPTZ                                 -- RA 10173: no hard DELETE
);

CREATE TABLE public.persons (
  id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id          UUID        REFERENCES households(id),
  philhealth_no         TEXT,
  nhts_pr_id            TEXT,
  last_name             TEXT        NOT NULL,
  first_name            TEXT        NOT NULL,
  dob                   DATE        NOT NULL,
  sex                   TEXT        NOT NULL,  -- 'M' | 'F'
  civil_status          TEXT,
  is_4ps                BOOLEAN     NOT NULL DEFAULT false,
  educational_attainment TEXT,
  occupation            TEXT,
  deleted_at            TIMESTAMPTZ
);
```

---

### Individual Treatment Record (ITR) — Single Source of Truth

```sql
CREATE TABLE public.itrecords (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id    UUID        NOT NULL REFERENCES facilities(id),
  person_id      UUID        NOT NULL REFERENCES persons(id),
  encounter_date DATE        NOT NULL,
  encounter_type TEXT        NOT NULL,  -- 'opd' | 'emergency' | 'field_visit'
  chief_complaint TEXT,
  is_new_case    BOOLEAN     NOT NULL DEFAULT false,
  attendant_id   UUID        REFERENCES health_workers(id),
  status         TEXT        NOT NULL DEFAULT 'PENDING',
  -- PENDING (BHW entry) → VALIDATED (RHM approved) → ARCHIVED
  validated_by   UUID        REFERENCES health_workers(id),
  validated_at   TIMESTAMPTZ,
  deleted_at     TIMESTAMPTZ  -- RA 10173
);

CREATE TABLE public.itrecord_diagnoses (
  id           UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
  itrecord_id  UUID  NOT NULL REFERENCES itrecords(id),
  icd10_code   TEXT  NOT NULL,
  is_final     BOOLEAN NOT NULL DEFAULT false,
  deleted_at   TIMESTAMPTZ
);

CREATE TABLE public.itrecord_prescriptions (
  id           UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
  itrecord_id  UUID  NOT NULL REFERENCES itrecords(id),
  medicine_code TEXT NOT NULL,
  quantity     INT,
  dosage       TEXT,
  deleted_at   TIMESTAMPTZ
);

CREATE TABLE public.itrecord_referrals (
  id                UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
  itrecord_id       UUID  NOT NULL REFERENCES itrecords(id),
  referred_to_id    UUID  REFERENCES facilities(id),
  reason            TEXT,
  deleted_at        TIMESTAMPTZ
);
```

---

### Target Client Lists (TCL) — Per FHSIS Program

All TCL tables share a status lifecycle:
`PENDING` (BHW entry) → `VALIDATED` (RHM approved) → included in ST generation.
Only `VALIDATED` records count toward ST/MCT tallies.

#### Maternal Care (TCL-M)

```sql
CREATE TABLE public.maternal_registrations (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id       UUID        NOT NULL REFERENCES persons(id),
  facility_id     UUID        NOT NULL REFERENCES facilities(id),
  lmp             DATE,
  edd             DATE,        -- auto-computed from LMP
  gravida         SMALLINT,
  para            SMALLINT,
  risk_factors    JSONB,       -- {age_over_35: true, prev_cs: true, ...}
  status          TEXT        NOT NULL DEFAULT 'PENDING',
  validated_by    UUID        REFERENCES health_workers(id),
  validated_at    TIMESTAMPTZ,
  deleted_at      TIMESTAMPTZ
);

CREATE TABLE public.prenatal_visits (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  maternal_id         UUID        NOT NULL REFERENCES maternal_registrations(id),
  visit_date          DATE        NOT NULL,
  aog_weeks           SMALLINT,
  bp_sys              SMALLINT,
  bp_dia              SMALLINT,
  weight_kg           NUMERIC(5,2),
  fundic_height_cm    NUMERIC(4,1),
  fetal_presentation  TEXT,
  tetanus_toxoid_dose SMALLINT,
  iron_given          BOOLEAN,
  provider_id         UUID        REFERENCES health_workers(id),
  deleted_at          TIMESTAMPTZ
);

CREATE TABLE public.delivery_records (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  maternal_id     UUID        NOT NULL REFERENCES maternal_registrations(id),
  delivery_date   DATE        NOT NULL,
  delivery_type   TEXT,       -- 'normal' | 'cs' | 'assisted'
  birth_weight_g  INT,
  apgar_score     SMALLINT,
  complications   JSONB,
  provider_id     UUID        REFERENCES health_workers(id),
  deleted_at      TIMESTAMPTZ
);

CREATE TABLE public.postnatal_visits (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  maternal_id  UUID        NOT NULL REFERENCES maternal_registrations(id),
  visit_date   DATE        NOT NULL,
  provider_id  UUID        REFERENCES health_workers(id),
  deleted_at   TIMESTAMPTZ
);
```

#### Child Health & Immunization (TCL-C)

```sql
CREATE TABLE public.child_registrations (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id        UUID        NOT NULL REFERENCES persons(id),
  facility_id      UUID        NOT NULL REFERENCES facilities(id),
  birth_weight_g   INT,
  birth_order      SMALLINT,
  deleted_at       TIMESTAMPTZ
);

CREATE TABLE public.immunizations (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id     UUID        NOT NULL REFERENCES child_registrations(id),
  vaccine_code TEXT        NOT NULL,  -- DOH EPI codes: BCG, OPV1, DPT1, etc.
  dose_no      SMALLINT    NOT NULL,
  given_date   DATE        NOT NULL,
  provider_id  UUID        REFERENCES health_workers(id),
  lot_no       TEXT,
  deleted_at   TIMESTAMPTZ
);

CREATE TABLE public.growth_monitoring (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id            UUID        NOT NULL REFERENCES child_registrations(id),
  measurement_date    DATE        NOT NULL,
  weight_kg           NUMERIC(5,2),
  height_cm           NUMERIC(5,1),
  muac_cm             NUMERIC(4,1),
  waz                 NUMERIC(5,2),  -- WHO weight-for-age Z-score
  haz                 NUMERIC(5,2),  -- WHO height-for-age Z-score
  whz                 NUMERIC(5,2),  -- WHO weight-for-height Z-score
  nutritional_status  TEXT,          -- 'normal' | 'underweight' | 'stunted' | 'wasted' | 'obese'
  deleted_at          TIMESTAMPTZ
);
```

#### Family Planning (TCL-FP)

```sql
CREATE TABLE public.fp_registrations (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id         UUID        NOT NULL REFERENCES persons(id),
  facility_id       UUID        NOT NULL REFERENCES facilities(id),
  method_code       TEXT        NOT NULL,  -- FHSIS FP method codes
  registration_date DATE        NOT NULL,
  dropout_reason    TEXT,
  deleted_at        TIMESTAMPTZ
);

CREATE TABLE public.fp_visits (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  fp_id               UUID        NOT NULL REFERENCES fp_registrations(id),
  visit_date          DATE        NOT NULL,
  continuation_status TEXT,       -- 'continuing' | 'dropout' | 'method_change'
  provider_id         UUID        REFERENCES health_workers(id),
  deleted_at          TIMESTAMPTZ
);
```

#### NCD & PhilPEN (TCL-NCD)

```sql
CREATE TABLE public.ncd_registrations (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id         UUID        NOT NULL REFERENCES persons(id),
  facility_id       UUID        NOT NULL REFERENCES facilities(id),
  condition_icd10   TEXT        NOT NULL,  -- I10 (HTN), E11 (DM), etc.
  registration_date DATE        NOT NULL,
  philpen_risk_level TEXT,                 -- 'low' | 'moderate' | 'high'
  deleted_at        TIMESTAMPTZ
);

CREATE TABLE public.ncd_visits (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  ncd_id            UUID        NOT NULL REFERENCES ncd_registrations(id),
  visit_date        DATE        NOT NULL,
  bp_sys            SMALLINT,
  bp_dia            SMALLINT,
  blood_glucose     NUMERIC(6,2),
  weight_kg         NUMERIC(5,2),
  hba1c             NUMERIC(4,1),
  philpen_risk_level TEXT,
  provider_id       UUID        REFERENCES health_workers(id),
  deleted_at        TIMESTAMPTZ
);
```

#### TB-DOTS

```sql
CREATE TABLE public.tb_cases (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id         UUID        NOT NULL REFERENCES persons(id),
  facility_id       UUID        NOT NULL REFERENCES facilities(id),
  case_type         TEXT,       -- 'pulmonary' | 'extra_pulmonary'
  tb_category       TEXT,       -- Category I, II, III per DOTS protocol
  registration_date DATE        NOT NULL,
  deleted_at        TIMESTAMPTZ
);

CREATE TABLE public.tb_sputum_results (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tb_case_id   UUID        NOT NULL REFERENCES tb_cases(id),
  exam_date    DATE        NOT NULL,
  result       TEXT,       -- 'positive' | 'negative' | 'scanty'
  deleted_at   TIMESTAMPTZ
);

CREATE TABLE public.tb_treatment_outcomes (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tb_case_id   UUID        NOT NULL REFERENCES tb_cases(id),
  phase        TEXT,       -- 'intensive' | 'continuation'
  start_date   DATE,
  end_date     DATE,
  outcome      TEXT,       -- 'cured' | 'completed' | 'failed' | 'defaulted' | 'died'
  deleted_at   TIMESTAMPTZ
);
```

---

### Disease Surveillance — RA 11332

```sql
CREATE TABLE public.disease_cases (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id          UUID        NOT NULL REFERENCES facilities(id),
  person_id            UUID        REFERENCES persons(id),
  icd10_code           TEXT        NOT NULL,
  case_date            DATE        NOT NULL,
  age_group            TEXT        NOT NULL,  -- FHSIS standard bands: '0-<1'|'1-4'|'5-9'|...'60+'
  sex                  TEXT        NOT NULL,
  is_category_one      BOOLEAN     NOT NULL DEFAULT false,
  case_classification  TEXT,       -- 'suspect' | 'probable' | 'confirmed'
  outcome              TEXT,       -- 'alive' | 'dead'
  reported_by          UUID        REFERENCES health_workers(id),
  reported_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- RA 11332: reported_at - case_date must be <= 24h for Category I
  deleted_at           TIMESTAMPTZ
);

-- Trigger: INSERT on disease_cases WHERE is_category_one = true
-- → auto-inserts into disease_alerts + Supabase Realtime broadcast to DSO/CHO
CREATE TABLE public.disease_alerts (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  disease_case_id  UUID        REFERENCES disease_cases(id),
  facility_id      UUID        NOT NULL REFERENCES facilities(id),
  icd10_code       TEXT        NOT NULL,
  alert_type       TEXT        NOT NULL,  -- 'category_one_report' | 'ml_outbreak_forecast' | 'threshold_breach'
  message          TEXT,
  severity         TEXT        NOT NULL,  -- 'info' | 'warning' | 'critical'
  acknowledged_by  UUID        REFERENCES health_workers(id),
  acknowledged_at  TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
  -- Supabase Realtime subscription on this table broadcasts to CHO/PHIS dashboard
);
```

---

### Zero-Tally Engine — ST and MCT

#### Summary Tables (ST) — BHS Level

Generated by the auto-tally engine when RHM submits. Values are computed from all `VALIDATED` TCL records for the reporting period, then frozen.

```sql
CREATE TABLE public.summary_tables (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id      UUID        NOT NULL REFERENCES facilities(id),  -- BHS
  report_month     SMALLINT    NOT NULL,  -- 1–12
  report_year      SMALLINT    NOT NULL,
  -- Indicator values: keyed by DOH DM 2024-0007 exact codes
  -- e.g. {"IND-M1-1.1": {"num": 12, "den": 15, "note": ""}}
  indicator_values JSONB       NOT NULL DEFAULT '{}',
  status           TEXT        NOT NULL DEFAULT 'DRAFT',
  -- DRAFT → SUBMITTED (RHM) → APPROVED (PHN) → RETURNED (with reason)
  submitted_by     UUID        REFERENCES health_workers(id),
  submitted_at     TIMESTAMPTZ,
  approved_by      UUID        REFERENCES health_workers(id),
  approved_at      TIMESTAMPTZ,
  return_reason    TEXT,
  locked_at        TIMESTAMPTZ,  -- set on APPROVED; blocks all further edits
  UNIQUE (facility_id, report_month, report_year)
);
```

**Tally engine rule:** When RHM triggers "Generate ST", FastAPI queries all `VALIDATED` records in the reporting window, computes each DOH indicator count, and serializes the result into `indicator_values JSONB`. The record is then set to `SUBMITTED`. Edits are blocked after `locked_at` is set.

#### Monthly Consolidation Tables (MCT) — City Level

PHN merges all 32 approved STs into one MCT.

```sql
CREATE TABLE public.monthly_consolidations (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id      UUID        NOT NULL REFERENCES facilities(id),  -- CHO
  report_month     SMALLINT    NOT NULL,
  report_year      SMALLINT    NOT NULL,
  -- Consolidated indicator values (sum of all included STs)
  indicator_values JSONB       NOT NULL DEFAULT '{}',
  status           TEXT        NOT NULL DEFAULT 'DRAFT',
  -- DRAFT → UNDER_REVIEW (PHN) → APPROVED (CHO) → EXPORTED
  approved_by      UUID        REFERENCES health_workers(id),
  approved_at      TIMESTAMPTZ,
  exported_at      TIMESTAMPTZ,
  locked_at        TIMESTAMPTZ,
  UNIQUE (facility_id, report_month, report_year)
);

-- Which STs were included in this MCT
CREATE TABLE public.monthly_consolidation_items (
  id                    UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
  consolidation_id      UUID  NOT NULL REFERENCES monthly_consolidations(id),
  summary_table_id      UUID  NOT NULL REFERENCES summary_tables(id),
  included_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (consolidation_id, summary_table_id)
);
```

---

### Supply Chain — Module 6

```sql
CREATE TABLE public.medicines (
  id            UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
  medicine_code TEXT  UNIQUE NOT NULL,
  generic_name  TEXT  NOT NULL,
  form          TEXT,   -- 'tablet' | 'syrup' | 'injection' | 'capsule'
  unit          TEXT,   -- 'tab' | 'vial' | 'bottle'
  is_essential  BOOLEAN NOT NULL DEFAULT false,
  abc_class     TEXT,   -- A | B | C (inventory value)
  ven_class     TEXT    -- V | E | N (clinical criticality)
);

CREATE TABLE public.inventory_ledger (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id       UUID        NOT NULL REFERENCES facilities(id),
  medicine_id       UUID        NOT NULL REFERENCES medicines(id),
  transaction_type  TEXT        NOT NULL,  -- 'RECEIVED'|'ISSUED'|'EXPIRED'|'RETURNED'|'ADJUSTED'
  quantity          INT         NOT NULL,
  balance_after     INT         NOT NULL,  -- running balance; maintained by trigger
  transaction_date  DATE        NOT NULL,
  source_facility_id UUID       REFERENCES facilities(id),  -- for RECEIVED transfers
  batch_no          TEXT,
  recorded_by       UUID        REFERENCES health_workers(id),
  deleted_at        TIMESTAMPTZ  -- RA 10173
);
```

---

### Vital Statistics

```sql
CREATE TABLE public.birth_records (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id       UUID        NOT NULL REFERENCES facilities(id),
  person_id         UUID        REFERENCES persons(id),
  type_of_birth     TEXT,       -- 'live_birth' | 'fetal_death'
  registration_date DATE        NOT NULL,
  deleted_at        TIMESTAMPTZ
);

CREATE TABLE public.death_records (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id     UUID        NOT NULL REFERENCES facilities(id),
  person_id       UUID        REFERENCES persons(id),
  date_of_death   DATE        NOT NULL,
  cause_icd10     TEXT,
  place_of_death  TEXT,
  deleted_at      TIMESTAMPTZ
);
```

---

## Schema: `sync` — Offline Queue

Receives BHW submissions from IndexedDB via background sync. Records are validated and promoted to `public.*` by server-side processing.

```sql
CREATE TABLE sync.queue (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id        TEXT        NOT NULL,   -- IndexedDB device fingerprint
  facility_id      UUID        NOT NULL REFERENCES facilities(id),
  entity_type      TEXT        NOT NULL,   -- 'itrecord' | 'prenatal_visit' | 'immunization' | ...
  local_id         UUID        NOT NULL,   -- client-generated; used for idempotency
  payload          JSONB       NOT NULL,
  status           TEXT        NOT NULL DEFAULT 'PENDING',
  -- PENDING → SYNCED | CONFLICT | REJECTED
  conflict_snapshot JSONB,     -- server state at conflict time (for CONFLICT records)
  error_message    TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  synced_at        TIMESTAMPTZ,
  UNIQUE (device_id, local_id)  -- prevents duplicate submissions on retry
);
```

**Conflict resolution:** Server-authoritative on person/ITR identity fields. Last-write-wins (with audit log entry) on supplementary visit data.

---

## Schema: `analytics` — Materialized Views

Refreshed nightly via `pg_cron`. Feeds the CHO dashboard and ML feature extraction.

```sql
-- Weekly disease incidence per facility, disease, and demographic band
CREATE MATERIALIZED VIEW analytics.disease_incidence_weekly AS
SELECT
  facility_id,
  icd10_code,
  age_group,
  sex,
  DATE_TRUNC('week', case_date)     AS week_start,
  EXTRACT(ISOYEAR FROM case_date)   AS epi_year,
  EXTRACT(WEEK FROM case_date)      AS epi_week,
  COUNT(*)                          AS case_count,
  SUM(CASE WHEN outcome = 'dead' THEN 1 ELSE 0 END) AS death_count
FROM public.disease_cases
WHERE deleted_at IS NULL
GROUP BY facility_id, icd10_code, age_group, sex,
         DATE_TRUNC('week', case_date),
         EXTRACT(ISOYEAR FROM case_date),
         EXTRACT(WEEK FROM case_date);

-- Monthly immunization coverage per BHS
CREATE MATERIALIZED VIEW analytics.immunization_coverage_monthly AS ...;

-- Monthly maternal outcomes per BHS
CREATE MATERIALIZED VIEW analytics.maternal_outcomes_monthly AS ...;

-- Monthly supply consumption per facility and medicine
CREATE MATERIALIZED VIEW analytics.supply_consumption_monthly AS ...;

-- NCD burden by barangay (for GIS heatmap)
CREATE MATERIALIZED VIEW analytics.ncd_burden_by_barangay AS ...;
```

> **TimescaleDB:** Enable the TimescaleDB extension in Supabase. Convert `disease_cases` and `inventory_ledger` to hypertables. This improves time-range queries by 10–100× at no additional cost and is the only infrastructure change needed for analytics performance.

---

## Schema: `ml` — Machine Learning

As designed in `ml-strategy.md`. Reproduced here for schema completeness.

```sql
CREATE TABLE ml.risk_scores (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id      UUID        NOT NULL REFERENCES persons(id),
  score          FLOAT       NOT NULL,
  risk_level     TEXT        NOT NULL,   -- 'low' | 'moderate' | 'high'
  model_version  TEXT        NOT NULL,
  computed_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE ml.outbreak_forecasts (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  barangay_id      UUID        REFERENCES city_barangays(id),
  disease_code     TEXT        NOT NULL,   -- FHSIS indicator code e.g. 'IND-DNG'
  forecast_date    DATE        NOT NULL,
  predicted_cases  FLOAT,
  lower_bound      FLOAT,
  upper_bound      FLOAT,
  alert_flag       BOOLEAN     NOT NULL DEFAULT false,
  model_version    TEXT        NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- alert_flag = true → trigger inserts into disease_alerts (same RA 11332 pipeline)

CREATE TABLE ml.model_registry (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  model_name     TEXT        NOT NULL,
  version        TEXT        NOT NULL,
  use_case       TEXT        NOT NULL,   -- 'outbreak_forecast' | 'risk_score'
  accuracy       FLOAT,
  auc_roc        FLOAT,
  trained_at     TIMESTAMPTZ NOT NULL,
  artifact_path  TEXT        NOT NULL,   -- Supabase Storage: ml-models/
  is_production  BOOLEAN     NOT NULL DEFAULT false,
  UNIQUE (model_name, version)
);

-- JSONB: feature schema evolves without migrations
CREATE TABLE ml.feature_snapshots (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_date DATE        NOT NULL,
  entity_type   TEXT        NOT NULL,   -- 'patient' | 'barangay'
  entity_id     UUID        NOT NULL,
  features      JSONB       NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

## Schema: `audit` — Compliance Log

Required by RA 10173 (Data Privacy Act). Append-only. No UPDATE or DELETE permitted by RLS.

```sql
CREATE TABLE audit.audit_logs (
  id             BIGSERIAL   PRIMARY KEY,
  table_name     TEXT        NOT NULL,
  record_id      UUID        NOT NULL,
  operation      TEXT        NOT NULL,   -- 'INSERT' | 'UPDATE' | 'SOFT_DELETE'
  old_data       JSONB,
  new_data       JSONB,
  performed_by   UUID,                   -- auth.users.id
  performed_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  session_role   TEXT,                   -- user_role at time of action
  facility_id    UUID                    -- for BHS-scoped audit filtering
);
```

PostgreSQL trigger on every `public.*` clinical table fires on INSERT, UPDATE, and `deleted_at` writes → inserts into `audit.audit_logs`. RLS on `audit_logs` permits SELECT (for `cho`, `system_admin`) but blocks INSERT/UPDATE/DELETE for all roles — only the trigger function (SECURITY DEFINER) can write.

---

## Migration Path from Current State

The following migration sequence replaces the Phase 1 stubs with the full Phase 2 schema. Each file is additive or replaces the stub; no data is lost.

| Order | Migration File | Action |
|---|---|---|
| 1 | `create_facilities.sql` | Create `facilities` table. Insert CHO2 root row. Migrate 5 existing `health_stations` rows + seed remaining 27 BHS. |
| 2 | `migrate_profiles_to_facilities.sql` | Add `facility_id` column to `profiles`, populate from `health_station_id`, drop `health_station_id`. Update FK and RLS policies. |
| 3 | `drop_health_stations.sql` | Drop `health_stations` table (now replaced by `facilities`). |
| 4 | `create_health_workers.sql` | `health_workers` table. For all current `profiles` with clinical roles (bhw, rhm, phn, phis, cho), auto-insert a linked `health_workers` row. |
| 5 | `create_persons_households.sql` | `households`, `persons` tables with PostGIS geometry column. |
| 6 | `create_itrecords.sql` | `itrecords`, `itrecord_diagnoses`, `itrecord_prescriptions`, `itrecord_referrals`. |
| 7 | `create_tcl_maternal.sql` | `maternal_registrations`, `prenatal_visits`, `delivery_records`, `postnatal_visits`. |
| 8 | `create_tcl_child.sql` | `child_registrations`, `immunizations`, `growth_monitoring`. |
| 9 | `create_tcl_fp.sql` | `fp_registrations`, `fp_visits`. |
| 10 | `create_tcl_ncd.sql` | `ncd_registrations`, `ncd_visits`. |
| 11 | `create_tcl_tb.sql` | `tb_cases`, `tb_sputum_results`, `tb_treatment_outcomes`. |
| 12 | `create_disease_surveillance.sql` | `disease_cases`, `disease_alerts`. Category I trigger. |
| 13 | `create_zero_tally.sql` | `summary_tables`, `monthly_consolidations`, `monthly_consolidation_items`. |
| 14 | `create_supply_chain.sql` | `medicines`, `inventory_ledger`. Running balance trigger. |
| 15 | `create_vital_statistics.sql` | `birth_records`, `death_records`. |
| 16 | `create_sync_schema.sql` | `sync.queue`. |
| 17 | `create_analytics_schema.sql` | Materialized views. `pg_cron` refresh jobs. |
| 18 | `create_ml_schema.sql` | `ml.risk_scores`, `ml.outbreak_forecasts`, `ml.model_registry`, `ml.feature_snapshots`. |
| 19 | `create_audit_schema.sql` | `audit.audit_logs`. Triggers on all clinical tables. RLS locking audit table. |
| 20 | `enable_timescaledb.sql` | Enable TimescaleDB extension. Convert `disease_cases` and `inventory_ledger` to hypertables. |

---

## Key Design Decisions

| Decision | Rationale |
|---|---|
| `indicator_values JSONB` on ST/MCT | DOH updates FHSIS indicator codes annually (DM 2024-0007 replaced prior editions). JSONB allows the indicator set to evolve without schema migrations. FastAPI computes and serializes; PostgreSQL stores and locks. |
| `health_workers.profile_id` nullable | Providers in clinical records are not always system users. Visiting physicians, retired midwives, and transferred BHWs must remain traceable in old records even after their login is deactivated. |
| `deleted_at` on all clinical tables | RA 10173 prohibits hard deletion of patient data. `WHERE deleted_at IS NULL` on all reads. The `audit_logs` trigger records the `SOFT_DELETE` operation. |
| `facilities` with `parent_id` self-reference | Enables hierarchy queries (`WHERE parent_id = CHO2.id` returns all 32 BHS). Future multi-CHO expansion requires no schema change — just adding more CHO root rows. |
| `disease_alerts` as a first-class table | RA 11332 requires Category I cases to be reported within 24 hours. `disease_alerts` is the single table that both the compliance log and the Supabase Realtime WebSocket subscription target. ML outbreak forecasts reuse the same table via `alert_type = 'ml_outbreak_forecast'`. |
| No separate data warehouse | At 32 BHS and 164K population, materialized views in the `analytics` schema provide sufficient query performance. A separate DWH would create a synchronization problem between OLTP and analytical stores without measurable benefit at this scale. |
| TimescaleDB for time-series tables | `disease_cases` and `inventory_ledger` have natural time partitioning. TimescaleDB hypertables improve range query performance by 10–100× with zero schema changes to application queries. |
