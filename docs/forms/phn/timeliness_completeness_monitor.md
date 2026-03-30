# Timeliness and Completeness Monitor - Admin / Monitoring

**Role:** phn
**Purpose:** Track whether all reporting BHS units submitted required monthly data on time and whether each submission is complete across the expected FHSIS program clusters.
**FHSIS Reference:** FHSIS MOP 2018, Chapter 9.4 - Form 1 monitoring template; Chapter 2 Table 2 submission schedule
**Who fills it:** PHN or delegated city-level FHSIS point person
**Who reviews/approves it:** Internal governance tool; may be viewed by PHIS Coordinator and CHO leadership
**Frequency:** Monthly for ST/M2 monitoring, quarterly for Q1 monitoring, annual if the same module expands to A1
**Storage location:** recommended table `report_submission_monitoring`, derived from `summary_tables`, city morbidity submissions, `monthly_consolidation_tables`, and export events

## Required Fields

### Monitor Header

| Field Name | Data Type | Constraints / Validation Rules | Notes |
|:-----------|:----------|:-------------------------------|:------|
| `monitor_id` | UUID | Required. PK. | Recommended monitoring record ID. |
| `monitor_level` | ENUM | Required. `bhs_to_city`, `city_to_phis`. | PHN primarily uses `bhs_to_city`. |
| `report_type` | ENUM | Required. `ST`, `M2`, `MCT`, `Q1`, `A1`. | Project LINK may start with ST, MCT, Q1. |
| `reporting_period_label` | VARCHAR(30) | Required. Example: `2026-03`, `2026-Q1`. | Human-readable period identifier. |
| `due_date` | DATE | Required. | Pulled from the schedule rules. |
| `point_person_user_id` | UUID | Required. FK to `user_profiles.id`. | Usually the PHN. |
| `created_at` | TIMESTAMPTZ | Required. | |
| `updated_at` | TIMESTAMPTZ | Required. | |

### Per-Unit Monitoring Rows

| Field Name | Data Type | Constraints / Validation Rules | Notes |
|:-----------|:----------|:-------------------------------|:------|
| `monitor_row_id` | UUID | Required. | Recommended child-row PK. |
| `reporting_unit_id` | UUID | Required. FK to `health_stations.id` for BHS rows. | For city-to-PHIS rows this may represent the city submission itself. |
| `reporting_unit_name` | VARCHAR(150) | Required. | BHS name or city unit label. |
| `received_report_flag` | BOOLEAN | Required. | Mirrors MOP checkmark/X logic. |
| `date_report_received` | DATE | Conditional. Required when `received_report_flag = true`. | |
| `timeliness_status` | ENUM | Required. `on_time`, `delayed`, `not_submitted`. | Computed from due date and receipt date. |
| `completeness_status` | ENUM | Required. `complete`, `partial`, `not_applicable`, `not_submitted`. | Based on expected clusters for the report type. |
| `family_health_cluster_ratio` | VARCHAR(10) | Conditional. Required for M1/Q1-style completeness checks. | Example: `4/4`, `3/4`. |
| `infectious_disease_cluster_ratio` | VARCHAR(10) | Conditional. Required when that cluster is expected. | |
| `ncd_cluster_ratio` | VARCHAR(10) | Conditional. Required when that cluster is expected. | |
| `environmental_health_cluster_ratio` | VARCHAR(10) | Conditional. Required for Q1/A1 where applicable. | |
| `mortality_natality_cluster_ratio` | VARCHAR(10) | Conditional. Required for M2/Q1 where applicable. | |
| `remarks` | TEXT | Required as nullable field. | Used for follow-up action, issue summary, or assistance provided. |
| `follow_up_required_flag` | BOOLEAN | Required. | `true` for delayed, missing, or partial submissions. |
| `follow_up_completed_flag` | BOOLEAN | Required. | Tracks whether the PHN already acted. |

### Totals / Summary Fields

| Field Name | Data Type | Constraints / Validation Rules | Notes |
|:-----------|:----------|:-------------------------------|:------|
| `total_reporting_units_expected` | INTEGER | Required. Must be >= 1. | Normally 32 for BHS monitoring. |
| `total_reporting_units_received` | INTEGER | Required. Must be >= 0. | Count of received submissions. |
| `total_on_time_units` | INTEGER | Required. Must be >= 0. | |
| `total_complete_units` | INTEGER | Required. Must be >= 0. | |
| `percent_received` | DECIMAL(5,2) | Required. | Auto-computed. |
| `percent_on_time` | DECIMAL(5,2) | Required. | Auto-computed. |
| `percent_complete` | DECIMAL(5,2) | Required. | Auto-computed. |

## Optional / Conditional Fields

| Field Name | Data Type | Condition for Display | Notes |
|:-----------|:----------|:----------------------|:------|
| `assistance_provided` | TEXT | Show when the PHN has already intervened. | Mirrors Chapter 9.4 guidance to provide technical assistance. |
| `delay_reason_code` | ENUM | Show when `timeliness_status = delayed` or `not_submitted`. | Suggested values: connectivity, staffing, correction_cycle, pending_validation_backlog, other. |
| `escalated_to_user_id` | UUID | Show when the issue is elevated to PHIS/CHO leadership. | Useful for chronic lateness. |
| `next_follow_up_date` | DATE | Show when `follow_up_required_flag = true`. | Governance helper. |
| `source_record_url` | TEXT | Show when there is a clickable internal link to the actual ST/MCT/Q1 item. | Improves operational follow-up. |

## Enums / Controlled Vocabularies

- `monitor_level`: `bhs_to_city`, `city_to_phis`
- `report_type`: `ST`, `M2`, `MCT`, `Q1`, `A1`
- `timeliness_status`: `on_time`, `delayed`, `not_submitted`
- `completeness_status`: `complete`, `partial`, `not_applicable`, `not_submitted`
- Suggested `delay_reason_code`:
  - `connectivity`
  - `staffing`
  - `correction_cycle`
  - `pending_validation_backlog`
  - `other`

## UX / Clinical Safety Concerns

- The monitor should behave like an operational control panel, not a passive report; rows needing follow-up should be immediately obvious.
- Timeliness and completeness must be shown together, because a report can arrive on time but still be incomplete.
- The UI must explain what "complete" means for each report type:
  - monthly ST/MCT-style review
  - monthly morbidity completeness
  - quarterly Q1 completeness
- Follow-up notes should be easy to scan historically so recurring issues with one BHS are visible across periods.
- The dashboard should support sorting by overdue status and by missing cluster count.
- Because lateness often affects official deadlines, the PHN should be able to trigger or record notifications from the same workspace.

## Database Schema Notes

- Recommended table:
  - `report_submission_monitoring(id, monitor_level, report_type, reporting_period_label, due_date, point_person_user_id, total_reporting_units_expected, total_reporting_units_received, total_on_time_units, total_complete_units, percent_received, percent_on_time, percent_complete, created_at, updated_at)`
- Recommended child table:
  - `report_submission_monitoring_rows(id, monitor_id, reporting_unit_id, reporting_unit_name, received_report_flag, date_report_received, timeliness_status, completeness_status, family_health_cluster_ratio, infectious_disease_cluster_ratio, ncd_cluster_ratio, environmental_health_cluster_ratio, mortality_natality_cluster_ratio, remarks, follow_up_required_flag, follow_up_completed_flag, assistance_provided, delay_reason_code, next_follow_up_date, escalated_to_user_id)`
- Source derivation should be mostly automated from submission timestamps on actual report tables. The PHN should only add remarks, follow-up status, and assistance notes.
- Indexes:
  - `report_submission_monitoring(report_type, reporting_period_label)`
  - `report_submission_monitoring_rows(monitor_id, timeliness_status, completeness_status)`

## Reports and Exports (if this form feeds a report)

- Not an official DOH reporting form, but it is a governance artifact that supports:
  - PHN operational follow-up
  - PHIS/CHO management visibility
  - historical compliance analysis by BHS
