# M2 Monthly Morbidity Report — Report

**Role:** Midwife (RHM)
**Purpose:** Monthly report on diseases/morbidity seen at the BHS during the reporting period. The M2 Section A tallies disease cases by ICD-10 code, disaggregated by sex and age group. This is separate from the M1 (program accomplishment) — the M2 captures disease burden data aligned with PIDSR reporting.
**FHSIS Reference:** FHSIS MOP 2018, Chapter 8.1 — Recording and Reporting Morbidity Data (PDF pages 407-416, doc pages 393-402); M2 Section A1 (Monthly Report of Morbidity/Diseases) and Section A2 (Ten Leading Causes of Morbidity)
**Who fills it:** Auto-generated from encounter diagnosis data (disease cases recorded in encounter records for the period). Midwife reviews and submits.
**Who reviews/approves it:** PHN reviews during MCT consolidation.
**Frequency:** Monthly. Submitted with ST and M1.
**Storage location:** `m2_reports` table

---

## Required Fields

### M2 Header

| Field Name | Data Type | Constraints / Validation Rules | Notes |
|:-----------|:----------|:-------------------------------|:------|
| `m2_id` | UUID | System-generated | |
| `health_station_id` | UUID | FK to `health_stations` | |
| `health_station_name` | String | | |
| `reporting_period_month` | Integer | 1-12 | |
| `reporting_period_year` | Integer | | |
| `prepared_by` | String | Midwife name | |
| `date_prepared` | Date | | |
| `status` | Enum | `DRAFT`, `SUBMITTED` | |

### M2 Section A1 — Monthly Report of Morbidity/Diseases

Each row represents one disease, with case counts disaggregated by sex and age group.

| Field Name | Data Type | Constraints / Validation Rules | Notes |
|:-----------|:----------|:-------------------------------|:------|
| `disease_code` | String | ICD-10 code aligned with PIDSR | |
| `disease_name` | String | Standard name per FHSIS/PIDSR list | |
| `cases_male_0_6d` | Integer | Males, 0-6 days | |
| `cases_female_0_6d` | Integer | Females, 0-6 days | |
| `cases_male_7_28d` | Integer | Males, 7-28 days | |
| `cases_female_7_28d` | Integer | Females, 7-28 days | |
| `cases_male_29d_11m` | Integer | Males, 29 days - 11 months | |
| `cases_female_29d_11m` | Integer | Females, 29 days - 11 months | |
| `cases_male_1_4y` | Integer | Males, 1-4 years | |
| `cases_female_1_4y` | Integer | Females, 1-4 years | |
| `cases_male_5_9y` | Integer | Males, 5-9 years | |
| `cases_female_5_9y` | Integer | Females, 5-9 years | |
| `cases_male_10_14y` | Integer | Males, 10-14 years | |
| `cases_female_10_14y` | Integer | Females, 10-14 years | |
| `cases_male_15_19y` | Integer | Males, 15-19 years | |
| `cases_female_15_19y` | Integer | Females, 15-19 years | |
| `cases_male_20_24y` | Integer | Males, 20-24 years | |
| `cases_female_20_24y` | Integer | Females, 20-24 years | |
| `cases_male_25_29y` | Integer | Males, 25-29 years | |
| `cases_female_25_29y` | Integer | Females, 25-29 years | |
| `cases_male_30_34y` | Integer | Males, 30-34 years | |
| `cases_female_30_34y` | Integer | Females, 30-34 years | |
| `cases_male_35_39y` | Integer | Males, 35-39 years | |
| `cases_female_35_39y` | Integer | Females, 35-39 years | |
| `cases_male_40_44y` | Integer | Males, 40-44 years | |
| `cases_female_40_44y` | Integer | Females, 40-44 years | |
| `cases_male_45_49y` | Integer | Males, 45-49 years | |
| `cases_female_45_49y` | Integer | Females, 45-49 years | |
| `cases_male_50_54y` | Integer | Males, 50-54 years | |
| `cases_female_50_54y` | Integer | Females, 50-54 years | |
| `cases_male_55_59y` | Integer | Males, 55-59 years | |
| `cases_female_55_59y` | Integer | Females, 55-59 years | |
| `cases_male_60_64y` | Integer | Males, 60-64 years | |
| `cases_female_60_64y` | Integer | Females, 60-64 years | |
| `cases_male_65_69y` | Integer | Males, 65-69 years | |
| `cases_female_65_69y` | Integer | Females, 65-69 years | |
| `cases_male_70plus` | Integer | Males, 70+ years | |
| `cases_female_70plus` | Integer | Females, 70+ years | |
| `total_male` | Integer | Auto-computed: sum of all male age groups | |
| `total_female` | Integer | Auto-computed: sum of all female age groups | |
| `grand_total` | Integer | Auto-computed: total_male + total_female | |

### M2 Section A2 — Ten Leading Causes of Morbidity

| Field Name | Data Type | Constraints / Validation Rules | Notes |
|:-----------|:----------|:-------------------------------|:------|
| `rank` | Integer | 1-10 | Auto-ranked by grand_total descending |
| `disease_code` | String | ICD-10 code | |
| `disease_name` | String | | |
| `total_cases` | Integer | From Section A1 grand_total | |

### M2 Section B — F1 Plus Indicators (if applicable)

| Field Name | Data Type | Constraints / Validation Rules | Notes |
|:-----------|:----------|:-------------------------------|:------|
| `maternal_deaths_count` | Integer | Maternal deaths for the month | |
| `infant_deaths_count` | Integer | Infant deaths for the month | |
| `facility_based_deliveries_count` | Integer | From Maternal Care TCL | |

---

## Optional / Conditional Fields

| Field Name | Data Type | Condition for Display | Notes |
|:-----------|:----------|:----------------------|:------|
| M2 Section B | Multiple | Clarify if midwife reports F1 Plus or if it's auto-derived from ST | See Open Questions |

---

## Enums / Controlled Vocabularies

### FHSIS/PIDSR Disease List (ICD-10 aligned)

| Disease | ICD-10 Code |
|:--------|:------------|
| Acute Watery Diarrhea | A09 |
| Acute Bloody Diarrhea | A09.0 |
| Acute Respiratory Infection (ARI) | J06.9 |
| Pneumonia | J18.9 |
| Influenza-Like Illness | J11 |
| Dengue Fever | A90 |
| Dengue Hemorrhagic Fever | A91 |
| Typhoid Fever | A01.0 |
| Cholera | A00 |
| Viral Hepatitis | B15-B19 |
| Measles | B05 |
| Tetanus (Neonatal) | A33 |
| Tetanus (Non-Neonatal) | A35 |
| Diphtheria | A36 |
| Pertussis | A37 |
| Meningococcal Disease | A39 |
| Malaria | B50-B54 |
| Leptospirosis | A27 |
| Rabies | A82 |
| Tuberculosis (all forms) | A15-A19 |
| STI — Syphilis | A50-A53 |
| STI — Gonorrhea | A54 |
| HIV/AIDS | B20-B24 |
| Filariasis | B74 |
| Schistosomiasis | B65 |
| Leprosy | A30 |
| COPD | J44 |
| Other diseases | Various |

> **Note:** The full disease list must match the PIDSR notifiable disease list. The codes above are representative. The complete list should be sourced from DOH DM 2024-0007.

---

## UX / Clinical Safety Concerns

- **Auto-tallied from encounter diagnoses:** The M2 should auto-tally disease cases from encounter records where `diagnosis` matches a PIDSR-reportable disease, for the BHS and reporting period. The midwife reviews the auto-generated report, not manual entry.
- **Disease case source:** Encounter records with ICD-10-coded diagnoses. In Phase 2, this may require a structured diagnosis field (dropdown or coded lookup) rather than free-text.
- **Category I alert cross-reference:** Any Category I disease case (e.g., cholera, measles, rabies) should already have triggered a real-time `disease_alerts` entry via the DSO flow (RA 11332). The M2 is the monthly aggregate, not the real-time alert.
- **Print/Export:** Exportable as Excel (.xlsx) and PDF matching the DOH M2 form layout.
- **Age group validation:** System must correctly assign each case to the right age group based on patient DOB, not manual age entry.
- **Zero vs empty:** Distinguish zero cases (confirmed no cases) from missing data (BHS did not report). Per Ch. 9.1 validation rules.
- **Top 10 auto-ranking:** Section A2 is auto-generated by sorting Section A1 by grand_total descending and taking top 10.

---

## Database Schema Notes

- **Table:** `m2_reports` — one row per BHS per month. FK to `health_station_id`.
- **Disease rows:** Child table `m2_disease_rows(id, m2_id, disease_code, disease_name, cases_male_0_6d, ..., grand_total)`. One row per disease with cases > 0.
- **Source data:** Tally engine queries `encounters` WHERE `health_station_id` = X AND `record_status = 'VALIDATED'` AND `date_of_visit` within reporting period, grouped by `diagnosis_code`, patient `sex`, and patient age group.
- **ICD-10 reference table:** `disease_codes(code, name, category, pidsr_notifiable)` — lookup table for valid disease codes.
- **Status:** `status ENUM('DRAFT', 'SUBMITTED')`. Immutable after submission.
- **Soft delete:** N/A — reports are immutable.
- **Indexes:** `m2_reports(health_station_id, reporting_period_year, reporting_period_month)`.

---

## Reports and Exports

| Export Format | Purpose | Template Source |
|:-------------|:--------|:---------------|
| Excel (.xlsx) | Submission to PHN for consolidation | DOH M2 form template |
| PDF | Print copy for BHS records | DOH M2 form template |
