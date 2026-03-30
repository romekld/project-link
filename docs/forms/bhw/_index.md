# Forms & Fields Research Report — BHW (Barangay Health Worker)

## Role Overview

The **Barangay Health Worker (BHW)** is the community-facing, grassroots health cadre in Project LINK. BHWs operate using a **mobile PWA (offline-first)** on Android devices in the field — often in remote puroks without reliable internet connectivity.

**Scope:** Own purok assignments within their BHS (Barangay Health Station). Approximately 20–25 households per BHW. Data is isolated by `health_station_id` via RLS; BHWs see only patients within their assigned BHS.

**Interface:** PWA (mobile, offline-first). All interactive elements must meet 44×44px minimum touch targets. Progressive form saves to IndexedDB (Dexie.js) on every field change.

**Primary responsibilities:**
1. **Quarterly HH Profiling** — House-to-house census of every household in the catchment area (January + Q2/Q3/Q4 updates). Captures demographics, health risk classifications, NHTS status, and PhilHealth membership. Foundation for Midwife Master Lists and TCL population denominators.
2. **Patient Visit Encounters** — Tier 1 clinical data capture during home visits and purok outreach: maternal ANC check-ups, child immunizations and nutrition assessments, NCD check-ins, and TB DOTS daily medication observations.
3. **Offline data integrity** — All entries saved to Dexie.js (IndexedDB) with `PENDING_SYNC` status; background sync flushes to the API when connectivity is detected.

**Critical constraint — Digital Validation Gate:** BHW-submitted clinical records **never** flow directly into TCLs, Summary Tables, or FHSIS reports. Every clinical encounter advances through `PENDING_SYNC → PENDING_VALIDATION` and requires explicit Midwife approval before becoming `VALIDATED` and contributing to any FHSIS indicator.

**HH Profile submissions** are administrative (not clinical) and use a separate intake flow — Midwife receives them in an HH Profile inbox and uses them to update Master Lists. HH Profiles do not use the clinical `record_status` lifecycle.

---

## Forms in This Directory

| Form Name | Category | FHSIS Reference | File |
|:----------|:---------|:----------------|:-----|
| HH Profile Form | Administrative / Profiling | FHSIS MOP 2018, Ch. 3 — Profiling of Households (doc pages 30–34). DOH Form 1. | [hh_profile.md](hh_profile.md) |
| Patient Registration | Entry (Administrative) | FHSIS MOP 2018, Ch. 2 (ITR overview, doc page 187) + Ch. 3 (HH Profile links) | [patient_registration.md](patient_registration.md) |
| Maternal Visit Record | Entry (Clinical) | FHSIS MOP 2018, Ch. 4.2 — Maternal Care and Services (doc pages 101–168). DOH: MCRPC + MCRPNC. | [maternal_visit.md](maternal_visit.md) |
| Child Immunization Encounter | Entry (Clinical) | FHSIS MOP 2018, Ch. 4.3 — Child Care / EPI (doc pages 169–240). DOH: ITR for Children (EPI section). | [child_immunization.md](child_immunization.md) |
| Child Nutrition Assessment | Entry (Clinical) | FHSIS MOP 2018, Ch. 4.3 — Child Care / Nutrition (doc pages 169–240). DOH: ITR for Children (anthropometric section). | [child_nutrition_assessment.md](child_nutrition_assessment.md) |
| NCD Check-in | Entry (Clinical) | FHSIS MOP 2018, Ch. 6 — NCD Prevention and Control (doc pages 319–354). DOH: PhilPEN CVD/NCD Risk Assessment Form. | [ncd_checkin.md](ncd_checkin.md) |
| TB DOTS Daily Check-in | Entry (Clinical) | FHSIS MOP 2018, Ch. 5 — Infectious Disease / TB Group B (doc pages 271–318). DOH: TB DOTS Observation Log. | [tb_dots_daily_checkin.md](tb_dots_daily_checkin.md) |

---

## Cross-Role Form Dependencies

| Flow Direction | Form | From Role | To Role | Status Transition |
|:--------------|:-----|:----------|:--------|:------------------|
| BHW → Midwife | HH Profile Form | BHW (creates during house-to-house visit) | Midwife (receives in inbox; compiles Master Lists) | Administrative only; no clinical `record_status` |
| BHW → Midwife | Maternal Visit Record | BHW (submits in field) | Midwife (validates via Validation Queue) | `PENDING_SYNC` → `PENDING_VALIDATION` → `VALIDATED` / `RETURNED` |
| BHW → Midwife | Child Immunization Encounter | BHW (submits per dose) | Midwife (validates) | `PENDING_SYNC` → `PENDING_VALIDATION` → `VALIDATED` / `RETURNED` |
| BHW → Midwife | Child Nutrition Assessment | BHW (submits per visit) | Midwife (validates) | `PENDING_SYNC` → `PENDING_VALIDATION` → `VALIDATED` / `RETURNED` |
| BHW → Midwife | NCD Check-in | BHW (submits vitals + lifestyle) | Midwife (validates; completes PhilPEN assessment and CVD risk stratification) | `PENDING_SYNC` → `PENDING_VALIDATION` → `VALIDATED` / `RETURNED` |
| BHW → Midwife | TB DOTS Daily Check-in | BHW (daily observation log) | Midwife (monitors attendance; receives defaulter alerts) | `PENDING_SYNC` → `PENDING_VALIDATION` → `VALIDATED` / `RETURNED` |
| Midwife → BHW | Patient demographic data (read) | Midwife (Master List management) | BHW (uses existing patient data from local cache) | Read-only from BHW perspective |
| Midwife → BHW | RETURNED clinical records | Midwife (returns record with feedback) | BHW (corrects and resubmits) | `RETURNED` → BHW corrects → `PENDING_VALIDATION` (again) |
| Midwife → BHW | DOTS case assignment | Midwife (registers TB case; assigns BHW as DOTS observer) | BHW (receives assignment; can see daily DOTS form for that patient) | Midwife-initiated; BHW sees case in their active TB patients list |

---

## FHSIS Compliance Notes

1. **NHTS Disaggregation (DOH DM 2024-0007):** Every clinical record and HH Profile must capture `nhts_status` (`NHTS` / `Non-NHTS`). Captured once at patient registration; propagates to all encounter records automatically. All 2018 FHSIS indicators require disaggregation by NHTS status and sex. Engineers must NOT require re-entry at each visit — propagate from `patients.nhts_status`.

2. **DOH Form Names (exact):** Database field names must match DOH DM 2024-0007 codes where applicable. HH Profile = "Form 1." ITR fields follow exact FHSIS naming (e.g., `gravida`, `parity`, `lmp_date`, `edc_date`, `aog_weeks`, `td1_date`–`td5_date`).

3. **RA 10173 — Data Privacy Act:** No hard deletes on clinical tables. All clinical tables use `deleted_at TIMESTAMPTZ` for soft-delete. All reads filter `WHERE deleted_at IS NULL`. No PII (name, DOB, address) in `audit_logs` — log only UUIDs. DPA consent (`consent_obtained = true`) must be obtained and recorded before any patient PII is saved.

4. **RA 11332 — Notifiable Diseases:** Although BHWs do not directly file PIDSR reports, any presumptive TB case (cough ≥2 weeks) screened by a BHW and referred must be escalated. Category I disease cases discovered during BHW visits must be flagged for Midwife/DSO action immediately.

5. **Family Serial Number stability:** The `household_number` (`BHS_CODE-YYYY-NNNN`) is used as the Family Serial Number across HH Profile, ITR, TCL, and MCT forms. It must be immutable once assigned and unique city-wide (prefixed with BHS code). Never re-use across years.

6. **Digital Validation Gate (non-negotiable):** BHW-submitted records must never contribute to any TCL row tally, Summary Table column, or FHSIS report until they are `VALIDATED` by a Midwife. This is enforced at the database layer (RLS + API) — not solely at the UI level.

7. **TB Group B / ITIS alignment:** TB is a Group B program in FHSIS — full case management lives in ITIS (DOH NTP MIS). Project LINK stores minimum local data for BHW daily DOTS observation and CHO reporting. The `dots_observations` table must support ITIS sync. ITIS is the system of record for NTP.

8. **WHO 2006 Growth Standards:** Z-scores for child nutrition assessments must be computed from WHO 2006 growth standards (the DOH-adopted standard). The lookup tables must be bundled in the PWA for offline computation. Z-scores are never entered manually by users.

9. **FHSIS 2018 EPI Schedule:** The immunization schedule (BCG through MCV-2, school-based Td/MR) is defined by DOH and must match exactly. Dose intervals are minimum thresholds, not recommendations. The system must enforce minimum intervals before allowing dose entry.

---

## Open Questions / Ambiguities

1. **HH Profile — "AB" Age Code Lower Bound Discrepancy:** The FHSIS MOP Chapter 3 defines `AB` as "Adult 20–59 y/o" in the text description but the Form 1 template label reads "Adult 25–59 y/o." Clarify the correct lower bound with CHO II before implementing auto-classify logic. Currently using 20–59 y/o per the text description.

2. **NCD Check-in — BHW scope boundary on CVD risk:** The BHW userflow specifies BHWs capture BP, FBS, and lifestyle screening. `itr-ncd.md` states CVD risk stratification (Section 6 — WHO/ISH risk charts) requires Midwife/Doctor. Confirm with CHO II whether the BHW NCD Check-in form includes a `cvd_risk_level` placeholder field (set by system as "Pending until Midwife assessment") or if that field is only on the Midwife's view of the same record.

3. **Child Immunization — school-based EPI coverage:** The EPI schedule includes school-based Td and MR for Grade 1 and Grade 7. Confirm with CHO II whether BHWs record these doses (school health program operates separately from BHS), or if they are aggregated at the Midwife level from school-based immunization reports.

4. **Maternal Visit — high-risk confirmation gate scope:** `itr-maternal.md` specifies an explicit confirmation dialog for `is_high_risk = true` submissions. Confirm whether this confirmation gate applies to BHW submissions (which already go through the Midwife validation gate anyway) or only to Midwife-direct entries. Applying it at BHW level provides immediate in-field awareness; the Midwife validation remains the data quality control.

5. **TB DOTS — missed-day auto-flagging vs. explicit entry:** The DOTS calendar has three states: "Drugs Taken," "Missed," and "Not yet due." Confirm whether days with no BHW check-in should be automatically flagged as "Missed" after 24 hours (system-generated missed entry) or whether only explicit BHW `drugs_taken = false` entries count as missed. This affects defaulter detection logic and the DOTS attendance percentage calculation.

6. **Patient Registration — Unified Patient ID format reconciliation:** The BHW userflow specifies format `DASMA-YYYYMMDD-XXXXX`; `itr.md` specifies `{BHS_CODE}-{YYYY}-{NNNN}`. These differ. The `itr.md` format is more consistent with FHSIS facility-based patient numbering. Reconcile the correct format with CHO II and system admin before implementation.

7. **HH Profile — IP status granularity:** Form 1 shows IP status at the household level (field 4: "IP / Non-IP"). However, FHSIS 2018 added NHTS disaggregation at the individual indicator level. Confirm whether IP status in Project LINK needs to be captured at the member level (`household_members.is_ip BOOLEAN`) or only at the household level (`households.is_indigenous_people BOOLEAN`).

8. **NCD Check-in — FBS entry at BHW level:** FBS requires a fasting blood sample (capillary glucose test). This is typically a clinical skill, not a BHW skill. Confirm with CHO II whether BHWs carry glucometers and are trained to perform FBS in the field, or if FBS is entered only by the Midwife at the BHS. If BHW-only, the FBS field in the NCD Check-in form should be removed from the BHW interface and added only to the Midwife's view.
