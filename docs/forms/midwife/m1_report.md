# M1 Monthly Program Accomplishment Report — Report

**Role:** Midwife (RHM)
**Purpose:** Monthly report on program service coverage — copied/derived from the Summary Table. The M1 is the standardized FHSIS reporting form that transmits BHS-level program accomplishment data to the PHN for MCT consolidation. It covers all four program clusters: Family Health (Maternal, Child), Infectious Disease (TB), NCD, and Environmental Health.
**FHSIS Reference:** FHSIS MOP 2018, Chapter 2 — M1 Report Form; Chapters 4-7 define M1 columns per cluster
**Who fills it:** Auto-generated from the approved Summary Table. Midwife reviews and submits alongside the ST.
**Who reviews/approves it:** PHN reviews M1 during MCT consolidation at city level.
**Frequency:** Monthly. Submitted with ST by Monday of the 1st week of the succeeding month.
**Storage location:** `m1_reports` table (or generated as a view from `summary_tables`)

---

## Required Fields

### M1 Header

| Field Name | Data Type | Constraints / Validation Rules | Notes |
|:-----------|:----------|:-------------------------------|:------|
| `m1_id` | UUID | System-generated | |
| `health_station_id` | UUID | FK to `health_stations` | |
| `health_station_name` | String | | |
| `barangay_name` | String | From `health_stations` join | |
| `municipality` | String | "Dasmarinas City" | |
| `province` | String | "Cavite" | |
| `reporting_period_month` | Integer | 1-12 | |
| `reporting_period_year` | Integer | | |
| `prepared_by` | String | Midwife name | |
| `date_prepared` | Date | | |
| `st_id` | UUID | FK to `summary_tables`. Source ST. | |

### M1 Body — Program Accomplishment Columns

The M1 mirrors the ST indicator structure. Each program cluster has a section:

**Section A — Family Health Services**
- A.1: Family Planning indicators (if applicable — see Open Questions)
- A.2: Maternal Care indicators (all from Maternal Care TCL/ST)
- A.3: Child Care indicators (all from Child Care TCL Part 1 & 2 / ST)

**Section B — Infectious Disease Prevention**
- TB indicators (from NTP Registry / ST)

**Section C — NCD Prevention**
- PhilPEN, HPN, DM, cancer screening, senior citizen indicators (from NCD TCL / ST)

Each indicator row contains:

| Field Name | Data Type | Constraints / Validation Rules | Notes |
|:-----------|:----------|:-------------------------------|:------|
| `indicator_code` | String | FHSIS standard. Must match DOH DM 2024-0007. | |
| `indicator_name` | String | Do not rename or abbreviate | |
| `numerator_nhts` | Integer | NHTS count | |
| `numerator_non_nhts` | Integer | Non-NHTS count | |
| `numerator_total` | Integer | NHTS + Non-NHTS | |
| `denominator` | Integer | Per FHSIS formula | |
| `coverage_percent` | Decimal | (numerator / denominator) x 100 | |

---

## Optional / Conditional Fields

| Field Name | Data Type | Condition for Display | Notes |
|:-----------|:----------|:----------------------|:------|
| Environmental Health section | Multiple | Only if midwife tracks env health (typically Sanitary Inspector's domain) | See Open Questions |
| FP section | Multiple | Only if FP is within midwife scope for this BHS | See Open Questions |

---

## Enums / Controlled Vocabularies

Same as Summary Table — indicator codes follow DOH DM 2024-0007 standard.

---

## UX / Clinical Safety Concerns

- **Auto-generated from ST:** The M1 should not require manual data entry. All values are copied from the approved Summary Table.
- **Print/Export:** The M1 must be exportable as Excel (.xlsx) and PDF, matching the DOH M1 form layout exactly. Column headers, row labels, and indicator codes must be pixel-perfect to the DOH template.
- **Read-only after ST submission:** The M1 is locked once the underlying ST is submitted.
- **Comparison view:** Optionally show previous month's M1 side-by-side for trend comparison.
- **Coverage validation:** Flag any indicator where coverage > 100% (data quality issue per Ch. 9.1).

---

## Database Schema Notes

- **Table:** `m1_reports` — one row per BHS per month. FK to `summary_tables`.
- **Alternatively:** M1 can be implemented as a **view** over `summary_tables` + `st_indicators` — no separate storage needed since M1 data is identical to ST data. The only addition is the header metadata and export formatting.
- **Export engine:** Server-side report generation using openpyxl (Excel) and WeasyPrint (PDF).
- **Template:** DOH M1 form template stored as a reference for export formatting.
- **Immutable:** Like ST, M1 is not editable after submission.

---

## Reports and Exports

| Export Format | Purpose | Template Source |
|:-------------|:--------|:---------------|
| Excel (.xlsx) | Submission to PHN for MCT consolidation | DOH M1 form template |
| PDF | Print copy for BHS records | DOH M1 form template |
