# Core ERD — Project LINK

> 15 core entities for the master manuscript diagram.
> For the full physical schema including all sub-tables, junction tables,
> and infrastructure tables, see `docs/PLANS/data-architecture.md`.
> Last updated: 2026-04-26

---

## How to Render

1. Copy the DBML block below
2. Paste into **[https://dbdiagram.io](https://dbdiagram.io)**
3. The diagram renders instantly in the right panel
4. Export: **Actions → Export PNG / SVG / PDF**
5. After rendering, click **Arrange** to auto-layout, then drag
   the TableGroup clusters apart for a clean manuscript layout

---

## DBML Source

```dbml
// ============================================================
// Project LINK — Core ERD (Manuscript Master Diagram)
// 15 Core Entities | Paste into https://dbdiagram.io
// Full schema: docs/PLANS/data-architecture.md
// ============================================================

// ── FOUNDATION ───────────────────────────────────────────────

Table facilities {
  id            uuid        [pk, note: 'Primary key']
  code          text        [not null, unique, note: 'e.g. CHO2, BHS-PAL3']
  type          text        [not null, note: 'cho | bhs | rhu']
  name          text        [not null]
  slug          text        [not null, unique]
  parent_id     uuid        [ref: > facilities.id, note: 'NULL for CHO root; BHS rows point to CHO2']
  catchment_pop integer
  is_active     boolean     [not null, default: true]
}

Table profiles {
  id                   uuid    [pk, note: 'FK to Supabase auth.users']
  facility_id          uuid    [not null, ref: > facilities.id]
  role                 text    [not null, note: 'bhw | rhm | phn | phis | cho | system_admin']
  status               text    [not null, note: 'active | inactive | invited | suspended']
  email                text    [not null, unique]
  must_change_password boolean [not null, default: true]
}

Table health_workers {
  id          uuid    [pk]
  facility_id uuid    [not null, ref: > facilities.id]
  profile_id  uuid    [ref: > profiles.id, note: 'Nullable — provider may have no system login']
  role        text    [not null, note: 'bhw | rhm | phn | phis | cho | doctor']
  license_no  text
  is_active   boolean [not null, default: true]
}

// ── PATIENTS ─────────────────────────────────────────────────

Table households {
  id           uuid        [pk]
  facility_id  uuid        [not null, ref: > facilities.id]
  household_no text        [not null]
  address      text
  deleted_at   timestamptz [note: 'RA 10173 — soft delete only, no hard DELETE']
}

Table persons {
  id            uuid        [pk]
  household_id  uuid        [ref: > households.id]
  philhealth_no text
  last_name     text        [not null]
  first_name    text        [not null]
  dob           date        [not null]
  sex           text        [not null, note: 'M | F']
  is_4ps        boolean     [not null, default: false]
  deleted_at    timestamptz
}

// ── CLINICAL RECORD ───────────────────────────────────────────

Table itrecords {
  id             uuid        [pk, note: 'Individual Treatment Record — single source of truth']
  facility_id    uuid        [not null, ref: > facilities.id]
  person_id      uuid        [not null, ref: > persons.id]
  encounter_date date        [not null]
  encounter_type text        [not null, note: 'opd | emergency | field_visit']
  chief_complaint text
  is_new_case    boolean     [not null, default: false]
  attendant_id   uuid        [ref: > health_workers.id]
  status         text        [not null, default: 'PENDING', note: 'PENDING | VALIDATED']
  validated_by   uuid        [ref: > health_workers.id]
  validated_at   timestamptz
  deleted_at     timestamptz
}

// ── TCL PROGRAMS ──────────────────────────────────────────────

Table maternal_registrations {
  id            uuid        [pk]
  person_id     uuid        [not null, ref: > persons.id]
  facility_id   uuid        [not null, ref: > facilities.id]
  lmp           date        [note: 'Last menstrual period']
  edd           date        [note: 'Estimated delivery date — auto-computed from LMP']
  gravida       integer
  para          integer
  risk_factors  jsonb       [note: 'e.g. {age_over_35: true, prev_cs: true}']
  status        text        [not null, default: 'PENDING', note: 'PENDING | VALIDATED']
  validated_by  uuid        [ref: > health_workers.id]
  validated_at  timestamptz
  deleted_at    timestamptz
}

Table prenatal_visits {
  id                  uuid        [pk]
  maternal_id         uuid        [not null, ref: > maternal_registrations.id]
  visit_date          date        [not null]
  aog_weeks           integer     [note: 'Age of gestation in weeks']
  bp_sys              integer
  bp_dia              integer
  weight_kg           float
  fundic_height_cm    float
  tetanus_toxoid_dose integer
  provider_id         uuid        [ref: > health_workers.id]
  deleted_at          timestamptz
}

Table child_registrations {
  id             uuid        [pk]
  person_id      uuid        [not null, ref: > persons.id]
  facility_id    uuid        [not null, ref: > facilities.id]
  birth_weight_g integer
  birth_order    integer
  deleted_at     timestamptz
}

Table immunizations {
  id           uuid        [pk]
  child_id     uuid        [not null, ref: > child_registrations.id]
  vaccine_code text        [not null, note: 'DOH EPI codes: BCG, OPV1, DPT1, MCV1, etc.']
  dose_no      integer     [not null]
  given_date   date        [not null]
  provider_id  uuid        [ref: > health_workers.id]
  lot_no       text
  deleted_at   timestamptz
}

Table ncd_registrations {
  id                 uuid        [pk]
  person_id          uuid        [not null, ref: > persons.id]
  facility_id        uuid        [not null, ref: > facilities.id]
  condition_icd10    text        [not null, note: 'I10 = Hypertension, E11 = Type 2 Diabetes']
  registration_date  date        [not null]
  philpen_risk_level text        [note: 'low | moderate | high (PhilPEN CV risk score)']
  deleted_at         timestamptz
}

// ── DISEASE SURVEILLANCE ──────────────────────────────────────

Table disease_cases {
  id                  uuid        [pk]
  facility_id         uuid        [not null, ref: > facilities.id]
  person_id           uuid        [ref: > persons.id]
  icd10_code          text        [not null]
  case_date           date        [not null]
  age_group           text        [not null, note: 'FHSIS bands: 0-<1 | 1-4 | 5-9 | ... | 60+']
  sex                 text        [not null]
  is_category_one     boolean     [not null, default: false, note: 'RA 11332 — triggers 24h alert on true']
  case_classification text        [note: 'suspect | probable | confirmed']
  outcome             text        [note: 'alive | dead']
  reported_by         uuid        [ref: > health_workers.id]
  reported_at         timestamptz [not null]
  deleted_at          timestamptz
}

Table disease_alerts {
  id               uuid        [pk]
  disease_case_id  uuid        [ref: > disease_cases.id]
  facility_id      uuid        [not null, ref: > facilities.id]
  icd10_code       text        [not null]
  alert_type       text        [not null, note: 'category_one_report | ml_outbreak_forecast | threshold_breach']
  severity         text        [not null, note: 'info | warning | critical']
  acknowledged_by  uuid        [ref: > health_workers.id]
  acknowledged_at  timestamptz
  created_at       timestamptz [not null, note: 'Supabase Realtime broadcasts on INSERT to CHO/PHIS dashboard']
}

// ── ZERO-TALLY ENGINE (REPORTS) ───────────────────────────────

Table summary_tables {
  id               uuid        [pk, note: 'BHS-level monthly report — auto-generated by Zero-Tally engine']
  facility_id      uuid        [not null, ref: > facilities.id]
  report_month     integer     [not null]
  report_year      integer     [not null]
  indicator_values jsonb       [not null, note: 'Keyed by DOH DM 2024-0007 codes e.g. {IND-M1-1.1: {num:12, den:15}}']
  status           text        [not null, default: 'DRAFT', note: 'DRAFT | SUBMITTED | APPROVED | RETURNED']
  submitted_by     uuid        [ref: > health_workers.id]
  submitted_at     timestamptz
  approved_by      uuid        [ref: > health_workers.id]
  approved_at      timestamptz
  locked_at        timestamptz [note: 'Set on APPROVED — all edits blocked after this timestamp']

  indexes {
    (facility_id, report_month, report_year) [unique]
  }
}

Table monthly_consolidations {
  id               uuid        [pk, note: 'CHO-level city-wide monthly consolidation — merges 32 BHS STs']
  facility_id      uuid        [not null, ref: > facilities.id]
  report_month     integer     [not null]
  report_year      integer     [not null]
  indicator_values jsonb       [not null, note: 'Summed from all 32 approved BHS summary tables']
  status           text        [not null, default: 'DRAFT', note: 'DRAFT | UNDER_REVIEW | APPROVED | EXPORTED']
  approved_by      uuid        [ref: > health_workers.id]
  approved_at      timestamptz
  exported_at      timestamptz
  locked_at        timestamptz

  indexes {
    (facility_id, report_month, report_year) [unique]
  }
}

// ── TABLE GROUPS (visual grouping in dbdiagram.io) ────────────

TableGroup Foundation {
  facilities
  profiles
  health_workers
}

TableGroup Patients {
  households
  persons
}

TableGroup "Clinical Record" {
  itrecords
}

TableGroup "TCL Programs" {
  maternal_registrations
  prenatal_visits
  child_registrations
  immunizations
  ncd_registrations
}

TableGroup "Disease Surveillance" {
  disease_cases
  disease_alerts
}

TableGroup "Zero-Tally Reports" {
  summary_tables
  monthly_consolidations
}
```

---

## Entity Summary

| # | Entity | Group | Key Relationship |
|---|---|---|---|
| 1 | `facilities` | Foundation | Self-referential: CHO2 (root) → 32 BHS via `parent_id` |
| 2 | `profiles` | Foundation | 1-to-1 with `auth.users`; scoped to one `facility` |
| 3 | `health_workers` | Foundation | Nullable `profile_id` — clinical identity separate from login |
| 4 | `households` | Patients | Belongs to one `facility` (BHS catchment) |
| 5 | `persons` | Patients | Belongs to one `household`; city-wide unique identity |
| 6 | `itrecords` | Clinical Record | Central record — every patient visit across all programs |
| 7 | `maternal_registrations` | TCL Programs | One per pregnancy per `person` |
| 8 | `prenatal_visits` | TCL Programs | Many visits per `maternal_registration` |
| 9 | `child_registrations` | TCL Programs | One per child `person` |
| 10 | `immunizations` | TCL Programs | Many vaccines per `child_registration` |
| 11 | `ncd_registrations` | TCL Programs | One per condition per `person` (HTN, DM, etc.) |
| 12 | `disease_cases` | Disease Surveillance | One case per disease event; `is_category_one` triggers alert |
| 13 | `disease_alerts` | Disease Surveillance | Auto-inserted on Category I case; Realtime WebSocket source |
| 14 | `summary_tables` | Zero-Tally Reports | One per BHS per month; locked after PHN approval |
| 15 | `monthly_consolidations` | Zero-Tally Reports | One per CHO per month; merges all 32 ST values |

---

## Omitted from Master ERD (Appendix Only)

These tables exist in the full schema but are excluded from the master diagram
to preserve readability. Include them in **Appendix A** of the manuscript.

| Omitted Table | Reason |
|---|---|
| `itrecord_diagnoses`, `itrecord_prescriptions`, `itrecord_referrals` | Sub-tables of `itrecords` |
| `delivery_records`, `postnatal_visits` | Sub-tables of `maternal_registrations` |
| `fp_registrations`, `fp_visits` | Family Planning module (secondary) |
| `tb_cases`, `tb_sputum_results`, `tb_treatment_outcomes` | TB-DOTS module (secondary) |
| `ncd_visits` | Sub-table of `ncd_registrations` |
| `growth_monitoring` | Nutrition sub-table |
| `monthly_consolidation_items` | Junction table — no domain meaning at ERD level |
| `inventory_ledger`, `medicines` | Supply chain module (Module 6) |
| `birth_records`, `death_records` | Vital statistics module |
| `sync.queue` | Infrastructure — offline sync buffer |
| `audit.audit_logs` | Compliance infrastructure (RA 10173) |
| `ml.*` tables | Covered in ML Architecture diagram |
| `analytics.*` views | Materialized views — not entities |
