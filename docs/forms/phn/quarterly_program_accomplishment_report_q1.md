# Quarterly Program Accomplishment Report (Q1) - Report

**Role:** phn
**Purpose:** Compile the official quarterly city report by aggregating three approved monthly consolidation periods and preparing the package that the PHIS Coordinator will export and route for official submission.
**FHSIS Reference:** FHSIS MOP 2018, Chapter 2 Table 2; Chapter 4.2 G.2, Chapter 4.3 G.2, Chapter 5 Q1 section, Chapter 6 F.2, Chapter 7 E.2, Chapter 8.2 F.2
**Who fills it:** System aggregates three monthly city-approved periods; PHN reviews interpretation, confirms completeness, and submits the quarter package.
**Who reviews/approves it:** PHIS Coordinator performs downstream DQC/export; City Health Officer signs final official outputs downstream.
**Frequency:** Quarterly. Prepared during the first month of the succeeding quarter after all three source months are approved.
**Storage location:** derived from `monthly_consolidation_tables`; exported artifact tracked in `report_exports` with `report_type = 'Q1'`; recommended draft table `quarterly_report_snapshots`

## Required Fields

### Q1 Header

| Field Name | Data Type | Constraints / Validation Rules | Notes |
|:-----------|:----------|:-------------------------------|:------|
| `quarterly_report_id` | UUID | Required. Recommended PK for a draft snapshot table. | Needed if the app supports saved draft review before export. |
| `report_type` | ENUM | Required. Must be `Q1`. | Fixed value. |
| `quarter_number` | INTEGER | Required. 1-4. | Derived from source months. |
| `quarter_year` | INTEGER | Required. Four-digit year. | |
| `source_mct_month_1_id` | UUID | Required. FK to `monthly_consolidation_tables.id`. | First month of the quarter. |
| `source_mct_month_2_id` | UUID | Required. FK to `monthly_consolidation_tables.id`. | Second month of the quarter. |
| `source_mct_month_3_id` | UUID | Required. FK to `monthly_consolidation_tables.id`. | Third month of the quarter. |
| `compiled_by_user_id` | UUID | Required. FK to `user_profiles.id`. | Must belong to role `nurse_phn`. |
| `compiled_at` | TIMESTAMPTZ | Required. | Timestamp of quarter aggregation run. |
| `submission_deadline` | DATE | Required. | In Project LINK flow, Wednesday of the 2nd week of the 1st month of the succeeding quarter. |
| `status` | ENUM | Required. `DRAFT`, `READY_FOR_EXPORT`, `SUBMITTED_TO_PHIS`, `EXPORTED`. | Recommended workflow states for the quarter package. |

### Q1 Indicator Rows

| Field Name | Data Type | Constraints / Validation Rules | Notes |
|:-----------|:----------|:-------------------------------|:------|
| `indicator_row_id` | UUID | Required. | Recommended child-row PK. |
| `indicator_code` | VARCHAR(100) | Required. Exact DOH code. | No local renaming. |
| `indicator_name` | VARCHAR(255) | Required. | Standard label. |
| `program_cluster` | ENUM | Required. `family_health`, `infectious_disease`, `ncd`, `environmental_health`, `mortality_natality`. | Mirrors MOP Q1 sections. |
| `month_1_numerator_total` | INTEGER | Required when indicator exists in month 1. Must be >= 0. | Source snapshot from first MCT. |
| `month_2_numerator_total` | INTEGER | Required when indicator exists in month 2. Must be >= 0. | Source snapshot from second MCT. |
| `month_3_numerator_total` | INTEGER | Required when indicator exists in month 3. Must be >= 0. | Source snapshot from third MCT. |
| `quarter_numerator_total` | INTEGER | Required. Must equal month 1 + month 2 + month 3 for additive indicators. | Auto-computed. |
| `quarter_denominator_total` | INTEGER | Required when the indicator uses a denominator. | Follow the DOH indicator formula for quarterly reporting. |
| `quarter_rate_or_coverage` | DECIMAL(8,2) | Required when applicable. | Auto-computed. |
| `interpretation_text` | TEXT | Required for Q1 review completeness. | MOP Q1 sections include interpretation. |
| `recommended_action_text` | TEXT | Required for Q1 review completeness. | MOP Q1 sections include actions to be taken. |

### Quarterly Mortality and Natality Rows

| Field Name | Data Type | Constraints / Validation Rules | Notes |
|:-----------|:----------|:-------------------------------|:------|
| `mortality_indicator_code` | VARCHAR(100) | Required for mortality section rows. | Example: total deaths, maternal deaths, infant deaths. |
| `male_count` | INTEGER | Required for mortality rows. Must be >= 0. | Mortality rows are sex-disaggregated. |
| `female_count` | INTEGER | Required for mortality rows. Must be >= 0. | |
| `total_count` | INTEGER | Required. Must equal `male_count + female_count` for mortality rows. | |
| `rate_value` | DECIMAL(10,4) | Required where defined by the MOP. | Uses quarterly denominator rules. |
| `natality_age_10_14_count` | INTEGER | Required for natality row. Must be >= 0. | Live births by mother's age group. |
| `natality_age_15_19_count` | INTEGER | Required for natality row. Must be >= 0. | |
| `natality_age_20_49_count` | INTEGER | Required for natality row. Must be >= 0. | |
| `natality_total_count` | INTEGER | Required. Must equal age-group sum. | |

## Optional / Conditional Fields

| Field Name | Data Type | Condition for Display | Notes |
|:-----------|:----------|:----------------------|:------|
| `nhts_quarter_total` | INTEGER | Show when the Q1 layout preserves NHTS split for the indicator. | Project LINK should preserve this even where paper reports summarize totals. |
| `non_nhts_quarter_total` | INTEGER | Show when NHTS split is preserved. | Helps maintain drill-down traceability. |
| `source_month_variance_note` | TEXT | Show when one source month materially deviates from the other two. | Useful for PHN narrative before export. |
| `local_indicator_extension_flag` | BOOLEAN | Show only if the city adds non-DOH local indicators. | Any local fields must never overwrite the standard DOH template. |
| `supporting_chart_config_json` | JSONB | Show if the UI renders analysis charts for PHN use. | Internal analytic aid, not part of exported DOH form. |

## Enums / Controlled Vocabularies

- `report_type`: `Q1`
- `status`: `DRAFT`, `READY_FOR_EXPORT`, `SUBMITTED_TO_PHIS`, `EXPORTED`
- `program_cluster`:
  - `family_health`
  - `infectious_disease`
  - `ncd`
  - `environmental_health`
  - `mortality_natality`

## UX / Clinical Safety Concerns

- Quarter compilation must clearly show which three months are being used; prevent accidental cross-quarter mixing.
- The PHN should not have to manually re-key monthly numbers. Q1 is a review and interpretation step, not a second encoding step.
- Interpretation and recommended actions deserve first-class fields because the MOP explicitly includes them in the quarterly form structure.
- Missing source months must block quarter compilation unless there is an explicit governance override path approved by the client.
- The UI should show any unresolved monthly DQC concerns inherited from the source MCTs so the PHN knows whether the quarter package rests on shaky monthly data.
- Mortality/natality sections should highlight denominator-sensitive metrics such as MMR, IMR, NMR, and PMR because a bad livebirth denominator corrupts multiple quarterly outputs at once.
- The quarter review screen should preserve the distinction between count indicators and rate/coverage indicators; these should not be presented as visually identical numbers.

## Database Schema Notes

- Current repo schema only tracks exported files in `report_exports`. That is enough for a final artifact, but weak for PHN draft-review workflows.
- Recommended draft table:
  - `quarterly_report_snapshots(id, quarter_number, quarter_year, compiled_by_user_id, compiled_at, status, source_mct_month_1_id, source_mct_month_2_id, source_mct_month_3_id, payload_json, submitted_to_phis_at)`
- Recommended child rows:
  - `quarterly_report_indicator_rows(id, quarterly_report_id, indicator_code, indicator_name, program_cluster, month_1_numerator_total, month_2_numerator_total, month_3_numerator_total, quarter_numerator_total, quarter_denominator_total, quarter_rate_or_coverage, interpretation_text, recommended_action_text)`
- Export linkage:
  - once the PHIS Coordinator produces the official file, store it in `report_exports(mct_id, exported_by, report_type, file_url, exported_at)` or extend `report_exports` to allow a quarter snapshot FK.
- No hard delete for quarterly artifacts; quarter reports are official historical records.

## Reports and Exports (if this form feeds a report)

- Export formats expected downstream: Excel and PDF.
- Source data:
  - three approved monthly city consolidations
  - quarterly mortality/natality aggregates
  - required interpretation and recommended actions
- Approval handoff:
  - PHN submits to PHIS Coordinator for export/DQC
  - PHIS Coordinator produces final Q1 output and routes it for sign-off
