# Forms & Fields Research Report — Midwife (Rural Health Midwife / RHM)

## Role Overview

The Rural Health Midwife (RHM) is the primary clinical manager at the Barangay Health Station (BHS) level. She operates on both **PWA** (field visits, some mobile data entry) and **Web** (desktop for validation, TCL management, reporting).

**Primary responsibilities:**
- Reviews and validates BHW-submitted ITR records (Digital Validation Gate)
- Maintains Target Client Lists (TCLs) for all health programs
- Manages the NTP Registry for TB cases
- Processes quarterly HH Profiles from BHWs into Master Lists
- Generates end-of-month Summary Tables (ST), M1, and M2 reports
- Submits reports to the PHN by the Monday of the 1st week of the succeeding month
- Directly records maternal care encounters (ANC, delivery, postpartum)
- Registers new TB cases and monitors treatment progress
- Co-administers NCD PhilPEN assessments with BHWs

**Scope:** All patients within the assigned `health_station_id`. Cannot see records from other BHS (enforced by RLS).

---

## Forms in This Directory

| Form Name | Category | FHSIS Reference | File |
|:----------|:---------|:----------------|:-----|
| Validation Queue | Admin / Workflow | FHSIS MOP 2018, Ch. 2 (Roles & Responsibilities) | [validation_queue.md](validation_queue.md) |
| HH Profile Review & Master List | Admin / Registry | FHSIS MOP 2018, Ch. 3 — Profiling of Households | [hh_profile_review.md](hh_profile_review.md) |
| Maternal Care TCL | TCL / Registry | FHSIS MOP 2018, Ch. 4.2 — Maternal Care | [maternal_care_tcl.md](maternal_care_tcl.md) |
| Child Care TCL Part 1 (0-11 months) | TCL / Registry | FHSIS MOP 2018, Ch. 4.3 — Child Care | [child_care_tcl_part1.md](child_care_tcl_part1.md) |
| Child Care TCL Part 2 (12-59 months) | TCL / Registry | FHSIS MOP 2018, Ch. 4.3 — Child Care | [child_care_tcl_part2.md](child_care_tcl_part2.md) |
| NCD TCL (Adults 20+) | TCL / Registry | FHSIS MOP 2018, Ch. 6 — NCD Prevention | [ncd_tcl.md](ncd_tcl.md) |
| NTP Registry (TB Cases) | Registry | FHSIS MOP 2018, Ch. 5 — Infectious Disease; ITIS | [ntp_registry.md](ntp_registry.md) |
| TB Case Registration | Entry | FHSIS MOP 2018, Ch. 5; NTP Protocol | [tb_case_registration.md](tb_case_registration.md) |
| Summary Table (ST) | Report | FHSIS MOP 2018, Ch. 2 & 4-6 (all program clusters) | [summary_table.md](summary_table.md) |
| M1 Monthly Report | Report | FHSIS MOP 2018, Ch. 2 — M1 Report Form | [m1_report.md](m1_report.md) |
| M2 Monthly Morbidity Report | Report | FHSIS MOP 2018, Ch. 8.1 — Morbidity Data | [m2_report.md](m2_report.md) |

---

## Cross-Role Form Dependencies

| Direction | Form / Record | From Role | To Role | Status Transition |
|:----------|:--------------|:----------|:--------|:------------------|
| **Receives** | ITR encounter records | BHW | Midwife | `PENDING_VALIDATION` → `VALIDATED` or `RETURNED` |
| **Receives** | HH Profile submissions | BHW | Midwife | BHW submits quarterly; Midwife reviews and builds Master Lists |
| **Receives** | Daily DOTS observation logs | BHW | Midwife | Midwife reviews weekly for missed doses |
| **Sends** | Returned records (with reason) | Midwife | BHW | `RETURNED` — BHW must correct and resubmit |
| **Sends** | ST + M1 + M2 reports | Midwife | PHN | `SUBMITTED` — locked for audit after submission |
| **Sends** | TB case referrals | Midwife | MHO/Doctor | For diagnosis confirmation |
| **Sends** | Cervical cancer positive referrals | Midwife | Doctor (RHU) | Mandatory referral for positive VIA/Pap |

---

## FHSIS Compliance Notes

### DOH DM 2024-0007 Requirements
- All FHSIS indicator codes, field names, and M1/M2 formulas must match the DOH standard exactly. Do not rename or abbreviate indicator labels.
- NHTS disaggregation is mandatory on all indicators: every TCL row and every ST column must separate `NHTS` from `Non-NHTS`.
- Age-group disaggregation for maternal care: `10-14`, `15-19`, `20-49`.
- Sex disaggregation for child care and NCD indicators.

### NHTS Disaggregation
Every TCL and Summary Table must provide separate counts for NHTS and Non-NHTS clients. The `nhts_status` field on the patient record is the source.

### Mandatory vs Optional Indicators
All indicators listed in FHSIS MOP 2018 Table 1 are mandatory. There are no optional FHSIS indicators — coverage of all program clusters (Family Health, Infectious Disease, NCD, Environmental Health) is required for Level 2 completeness.

### Reporting Periods
- **Monthly:** ST, M1 (program accomplishment), M2 Section A (morbidity)
- **Quarterly:** Q1 (compiled by PHN from M1 data — Midwife does not generate Q1 directly)
- **Annual:** A1 (compiled at PHN/PHIS level)

### Submission Deadlines
- BHS to RHU/MHC (Midwife → PHN): **Monday of the 1st week of the succeeding month**

---

## Open Questions / Ambiguities

1. **Family Planning TCL:** The midwife userflow does not explicitly list an FP TCL, but FHSIS MOP Ch. 4.1 defines one. Clarify with CHO II whether FP TCL management is within the midwife's scope or handled differently in Dasmarinas City.

2. **Oral Health TCL:** FHSIS MOP Ch. 4.4 defines oral health indicators and a TCL, but oral health is typically dentist-managed at RHU level. Clarify if midwives in CHO II track any oral health indicators.

3. **Environmental Health:** Ch. 7 indicators (water supply, sanitation) are typically handled by the Sanitary Inspector. Confirm these are excluded from the midwife's reporting scope.

4. **M2 Section B (F1 Plus Indicators):** The additional monthly report on maternal deaths, infant deaths, and facility-based deliveries. Clarify if this is a separate form the midwife fills or if it's auto-generated from ST data.

5. **Cervical Cancer Screening (VIA):** The NCD form spec says midwives trained in VIA can administer it. Confirm which midwives in CHO II are VIA-certified and whether this is a universal midwife responsibility.

6. **Deworming for WRA:** FHSIS FP chapter (Ch. 4.1) includes deworming for Women of Reproductive Age as an FP indicator. Clarify if the midwife tracks this separately from maternal deworming.

7. **Master List granularity:** The FHSIS MOP describes separate Master Lists per program (WRA, Pregnant Women, Under-5, Adults 20+, Senior Citizens). Clarify if Project LINK should implement these as separate list views or as filtered views of a single patient registry.

8. **Disease Log for M2:** The midwife generates the M2 from a "PIDSR Disease Log." Clarify the source data — is this a separate disease case entry form, or are disease cases extracted from encounter diagnoses?
