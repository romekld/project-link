# Maternal Visit Record — Entry (Clinical)

**Role:** bhw
**Purpose:** Records a single prenatal (ANC), postpartum, or newborn check-up encounter captured by a BHW during a home visit or purok outreach. Links to the patient's active Pregnancy Tracking Form. When VALIDATED, feeds the Maternal Care TCL row for this patient and contributes to FHSIS maternal care coverage indicators.
**FHSIS Reference:** FHSIS MOP 2018, Chapter 4.2 — Maternal Care and Services (PDF pages 115–182, doc pages 101–168). DOH Forms: MCRPC (Maternal Client Record for Prenatal Care) + MCRPNC (Maternal Client Record for Postpartum and Neonatal Care).
**Who fills it:** BHW (during home visits and outreach — captures vitals, supplements given, lab screens done, and subjective complaints)
**Who reviews/approves it:** Midwife (validates via Validation Queue; record must be `VALIDATED` before contributing to Maternal Care TCL or any FHSIS indicator)
**Frequency:** Per ANC check-up visit; per postpartum check-up; per newborn check-up.
**Storage location:** `anc_visits` table (ANC and postpartum encounters); parent: `maternal_records` table (one row per pregnancy, FK to `patients`).

---

## Required Fields

| Field Name | Data Type | Constraints / Validation Rules | Notes |
|:-----------|:----------|:-------------------------------|:------|
| `patient_id` | UUID | FK to `patients`. Required. Must be a registered female patient of reproductive age. | |
| `maternal_record_id` | UUID | FK to `maternal_records`. Required. Links to the patient's active pregnancy. | BHW selects from the patient's active pregnancy record. If no active pregnancy exists, the BHW initiates a new pregnancy registration (creates a `maternal_records` row with LMP and EDC). |
| `visit_date` | DATE | Required. Format: `YYYY-MM-DD`. Cannot be a future date. | |
| `visit_type` | ENUM | `ANC` / `Postpartum` / `Newborn`. Required. | Drives progressive disclosure of field sections. |
| `health_station_id` | UUID | FK to `health_stations`. Set from BHW JWT; never editable. | |
| `provider_id` | UUID | FK to `user_profiles`. Set from BHW JWT; never editable. | |
| `record_status` | ENUM | `PENDING_SYNC` (local) → `PENDING_VALIDATION` (after sync) → `VALIDATED` / `RETURNED`. | Digital Validation Gate. BHW-submitted records never bypass PENDING_VALIDATION. |
| `systolic_bp` | INTEGER | mmHg. Range: 60–250. Required for `visit_type = ANC`. | Paper form: "BP" shown as "120/80" — normalized into two integer columns. Inline validation: "Systolic BP must be 60–250 mmHg." High-risk flag threshold: ≥140 mmHg. |
| `diastolic_bp` | INTEGER | mmHg. Range: 40–150. Required for `visit_type = ANC`. | Inline validation: "Diastolic BP must be 40–150 mmHg." High-risk flag threshold: ≥90 mmHg. |
| `weight_kg` | DECIMAL(5,2) | kg. Range: 30–200. Required for all visit types. | |
| `chief_complaint` | TEXT | Required. Reason for visit or "Routine ANC check-up." | |

---

## Optional / Conditional Fields

| Field Name | Data Type | Condition for Display | Notes |
|:-----------|:----------|:----------------------|:------|
| `aog_weeks` | INTEGER (computed) | ANC visits. Display only. | Auto-computed from `maternal_records.lmp_date`. Never editable by BHW. Inline label: "AOG is auto-calculated from LMP — do not edit directly." |
| `fundic_height_cm` | DECIMAL(4,1) | ANC visits, AOG ≥20 weeks. | cm. Should approximate AOG in weeks ± 2 cm after 20 weeks. Range: 15–45 cm. |
| `fetal_heart_tone_bpm` | INTEGER | ANC visits, AOG ≥12 weeks. | Normal range: 110–160 bpm. Inline validation: "FHT must be 110–160 bpm for a normal finding." |
| `edema` | ENUM | ANC visits. | `None` / `Feet only` / `Legs` / `Generalized`. High-risk flag if `Generalized`. |
| `td_dose_given` | ENUM | ANC visits, when applicable. | `Td1` / `Td2` / `Td3` / `Td4` / `Td5` / `None given this visit`. Cross-reference with `maternal_records` Td history. |
| `ifa_tablets_given` | INTEGER | ANC visits. | Number of Iron + Folic Acid tablets given this visit. Range: 0–120. |
| `ifa_date_given` | DATE | When `ifa_tablets_given > 0`. | Date of provision. |
| `calcium_tablets_given` | INTEGER | ANC visits. | Number of Calcium Carbonate tablets given. |
| `calcium_date_given` | DATE | When `calcium_tablets_given > 0`. | |
| `iodine_given` | BOOLEAN | ANC visits. | Yes / No. |
| `iodine_date_given` | DATE | When `iodine_given = true`. | |
| `deworming_given` | BOOLEAN | ANC visits, 2nd or 3rd trimester preferred. | Yes / No. |
| `deworming_drug` | TEXT | When `deworming_given = true`. | Drug name (e.g., Albendazole). |
| `cbc_hgb_done` | BOOLEAN | ANC visits, 1st visit or when ordered. | Yes / No toggle. Distinct from result. |
| `cbc_hgb_result` | ENUM | When `cbc_hgb_done = true`. | `Positive/Anemic` / `Negative/Normal` / `Pending`. |
| `syphilis_screened` | BOOLEAN | ANC visits. | Yes / No toggle. |
| `syphilis_result` | ENUM | When `syphilis_screened = true`. | `Positive (+)` / `Negative (−)` / `Pending`. |
| `hepb_screened` | BOOLEAN | ANC visits. | Yes / No toggle. |
| `hepb_result` | ENUM | When `hepb_screened = true`. | `Positive (+)` / `Negative (−)` / `Pending`. |
| `hiv_screened` | BOOLEAN | ANC visits. | Yes / No toggle. Note: per FHSIS, only date screened is tracked — result is confidential and NOT stored in FHSIS. |
| `gdm_screened` | BOOLEAN | ANC visits. | Yes / No toggle (Gestational Diabetes Mellitus screening). |
| `gdm_result` | ENUM | When `gdm_screened = true`. | `Positive (+)` / `Negative (−)` / `Pending`. |
| `pp_vitamin_a_given` | BOOLEAN | `visit_type = Postpartum` only. | Yes / No. Given within 1 month postpartum — 200,000 IU Vitamin A. |
| `pp_ifa_given` | BOOLEAN | `visit_type = Postpartum` only. | Yes / No. IFA provision for 3 months postpartum. |
| `newborn_breastfeeding_initiated` | BOOLEAN | `visit_type = Postpartum` or `Newborn`. | Yes / No. Initiated within 90 minutes of birth. |
| `complaints` | TEXT | Any visit type. | Free text. Patient-reported concerns. |
| `clinical_notes` | TEXT | Any visit type. | Additional observations, counseling topics covered. |
| `referral_required` | BOOLEAN | Any visit type. | Yes / No. |
| `referral_destination` | TEXT | When `referral_required = true`. | RHU/MHC/hospital name. Required when referral_required = true. |
| `return_visit_date` | DATE | Any visit. | Scheduled next ANC or postpartum check-up date. |
| `is_high_risk` | BOOLEAN (computed) | Auto-computed on save. Not editable by BHW. | Trigger conditions: `systolic_bp ≥ 140` OR `diastolic_bp ≥ 90` OR `edema = Generalized` OR `aog_weeks > 0 AND first ANC visit after 12 weeks` OR patient age >35 OR `fetal_heart_tone_bpm` outside 110–160. |
| `high_risk_reason` | TEXT[] (computed) | Auto-populated when `is_high_risk = true`. | Array of triggered reasons. E.g., `['BP ≥ 140/90 — Hypertension risk', 'First ANC after 12 weeks']`. Persistent badge in patient list view and all ITR tabs. |

---

## Enums / Controlled Vocabularies

- `visit_type`: `ANC` / `Postpartum` / `Newborn`
- `td_dose_given`: `Td1` / `Td2` / `Td3` / `Td4` / `Td5` / `None given this visit`
- `edema`: `None` / `Feet only` / `Legs` / `Generalized`
- `syphilis_result`, `hepb_result`, `gdm_result`: `Positive (+)` / `Negative (−)` / `Pending`
- `cbc_hgb_result`: `Positive/Anemic` / `Negative/Normal` / `Pending`
- `record_status`: `PENDING_SYNC` / `PENDING_VALIDATION` / `VALIDATED` / `RETURNED`

---

## UX / Clinical Safety Concerns

- **Progressive form save (required):** Maternal visit is a long form. Must auto-save to Dexie.js IndexedDB on every field change. If the BHW closes the app mid-entry, the draft is recoverable on next open. Show "Draft saved" indicator.
- **High-risk confirmation gate:** When `is_high_risk = true` is computed on save, show an explicit confirmation dialog before submission: "This visit has high-risk indicators: [list reasons]. Please confirm submission for Midwife validation." The BHW must acknowledge before the form submits.
- **Persistent high-risk badge:** `is_high_risk = true` records must display a persistent red/amber badge in the patient list view AND across all ITR tabs — not only on the detail page. Badge must survive list pagination.
- **AOG display (read-only, prominent):** Auto-computed AOG in weeks from LMP displayed prominently at the top of the ANC encounter form before any field entry. Inline note: "AOG is auto-calculated from LMP — do not edit directly." Show trimester alongside (e.g., "24 weeks — 2nd Trimester").
- **Progressive disclosure by visit type:** ANC-specific fields (fundic height, FHT, Td dose, supplements, labs) only shown for `visit_type = ANC`. Postpartum fields (Vitamin A, IFA) shown for `Postpartum`. Newborn fields (breastfeeding) shown for `Newborn` and `Postpartum`.
- **Lab screen two-step pattern:** Labs use toggle-then-result: `screened = Yes/No` first; `result` field appears only when screened = Yes. This avoids conflating "not screened" with "negative" — a critical clinical distinction.
- **BP inline validation:** Real-time inline validation as the BHW types: "Systolic BP must be 60–250 mmHg." High-risk badge shown immediately when BP ≥140/90 — do not wait until form submission.
- **Offline-first:** All fields available offline. Lab result enums bundled in PWA. AOG computation runs locally.
- **Touch targets:** 44×44px minimum. BP fields use numeric keyboard (no decimal). Supplement quantity fields use numeric keyboard.
- **Pre-population from patient/pregnancy context:** `patient_id`, `maternal_record_id`, `health_station_id`, `nhts_status` pre-populated when BHW navigates from a patient's Maternal Care ITR tab. No manual entry of these IDs by BHW.
- **Td dose tracking cross-reference:** The `td_dose_given` selection should show prior Td dose history from `maternal_records` (Td1–Td5 dates). If Td2 is selected, validate that Td1 was given ≥4 weeks prior.

---

## Database Schema Notes

- **Tables:** `anc_visits` (one row per ANC or postpartum encounter); parent `maternal_records` (one row per pregnancy, FK to `patient_id`).
- **FK:** `anc_visits.maternal_record_id` → `maternal_records`. `anc_visits.provider_id` → `user_profiles`. `maternal_records.patient_id` → `patients`.
- **record_status:** `anc_visits.record_status ENUM('PENDING_SYNC','PENDING_VALIDATION','VALIDATED','RETURNED')`.
- **BP columns:** `systolic_bp INTEGER`, `diastolic_bp INTEGER`. Never store as "120/80" string.
- **High-risk flags:** `anc_visits.is_high_risk BOOLEAN NOT NULL DEFAULT FALSE` + `anc_visits.high_risk_reason TEXT[]`. Computed server-side on every save/update. Never set by client directly.
- **Soft delete:** `anc_visits.deleted_at TIMESTAMPTZ`. All reads: `WHERE deleted_at IS NULL`. RA 10173 — no hard deletes.
- **NHTS propagation:** `anc_visits.nhts_status ENUM` inherited from `patients.nhts_status`. Set automatically on INSERT; not re-entered by BHW.
- **EDC storage:** `maternal_records.edc_date DATE` computed on `maternal_records` creation from `lmp_date`. `anc_visits` do not recalculate EDC.
- **ANC count trigger:** After each `VALIDATED` ANC visit with `visit_type = ANC`, recompute `maternal_records.anc_count INTEGER` and `maternal_records.ge4_anc BOOLEAN` (FHSIS indicator: ≥4 ANC achieved). Use PostgreSQL trigger or application-layer computation on validation.
- **Indexes:** `anc_visits(maternal_record_id)`, `anc_visits(patient_id)`, `anc_visits(visit_date)`, `anc_visits(record_status)`, `anc_visits(is_high_risk)`.
- **Td history:** `maternal_records` stores `td1_date` through `td5_date` as individual DATE columns. `anc_visits` stores `td_dose_given ENUM` for the dose given at this visit. The maternal_records Td columns are updated when an ANC visit with a Td dose is VALIDATED.

---

## Reports and Exports

This form feeds the following FHSIS indicators (aggregated via Maternal Care TCL → Summary Table → MCT → M1 Report):

| Indicator | Source Field | Target |
|:----------|:-------------|:-------|
| ≥4 ANC Check-ups | `maternal_records.ge4_anc = true` | 95% |
| Td1 (1st pregnancy) | `td1_date IS NOT NULL` | 95% |
| Td2 Plus (2nd+ pregnancy) | `td3_date IS NOT NULL` | 95% |
| Iron with Folic Acid completed | `ifa_date_given IS NOT NULL` | 95% |
| Calcium Carbonate completed | `calcium_date_given IS NOT NULL` | 95% |
| Iodine capsule given | `iodine_given = true` | 95% |
| Deworming given | `deworming_given = true` | 95% |
| Syphilis screened | `syphilis_screened = true` | 95% |
| HepB screened | `hepb_screened = true` | 95% |
| HIV screened | `hiv_screened = true` | 95% |
| CBC/Hgb tested | `cbc_hgb_done = true` | 95% |
| GDM screened | `gdm_screened = true` | 95% |
| ≥2 Postpartum check-ups | `maternal_records.pp_checkup_count >= 2` | 95% |
