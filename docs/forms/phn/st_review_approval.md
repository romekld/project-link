# ST Review and Approval Workspace - Admin / Workflow

**Role:** phn
**Purpose:** Review each BHS Summary Table before city consolidation, flag anomalous indicator rows, return the ST to the Midwife when correction is needed, or approve it for inclusion in the Monthly Consolidation Table.
**FHSIS Reference:** FHSIS MOP 2018, Chapter 2 (Table 2 monthly submission flow and local coordinator role), Chapter 9.1 (validation within and across data sets)
**Who fills it:** PHN
**Who reviews/approves it:** No separate reviewer inside this step; PHN is the approving city-level reviewer for the ST. Returned items go back to the Midwife for correction.
**Frequency:** Monthly per submitted ST, with re-open on every re-submission after a return.
**Storage location:** `summary_tables`, recommended child table `summary_table_review_flags`, `audit_logs`

## Required Fields

### Review Header

| Field Name | Data Type | Constraints / Validation Rules | Notes |
|:-----------|:----------|:-------------------------------|:------|
| `summary_table_id` | UUID | Required. FK to `summary_tables.id`. | Identifies the submitted ST under review. |
| `health_station_id` | UUID | Required. FK to `health_stations.id`. | Auto-filled from the ST record. |
| `health_station_name` | VARCHAR(150) | Required. Read-only in PHN UI. | Display label for the 32-BHS status grid. |
| `period_month` | INTEGER | Required. 1-12. | Must match the underlying ST period. |
| `period_year` | INTEGER | Required. Four-digit year. | Must match the underlying ST period. |
| `st_status` | ENUM | Required. Must be one of `SUBMITTED`, `RETURNED`, `APPROVED`. | `DRAFT` should never appear in the PHN review queue. |
| `submitted_at` | TIMESTAMPTZ | Required when status is `SUBMITTED` or later. | Used for timeliness monitoring. |
| `review_started_at` | TIMESTAMPTZ | Required once PHN opens the record for review. | Separate from final decision timestamp. |
| `reviewed_by_user_id` | UUID | Required. FK to `user_profiles.id`. | Must belong to role `nurse_phn`. |
| `comparison_baseline_type` | ENUM | Required. `city_average`, `prior_bhs_period`, `fixed_rule_set`, `none`. | Makes anomaly highlighting explainable and auditable. |
| `unresolved_flag_count` | INTEGER | Required. Must be >= 0. | Auto-computed from child review-flag rows. |
| `decision` | ENUM | Required on close. `APPROVE`, `RETURN`, `SAVE_IN_PROGRESS`. | `APPROVE` blocked while unresolved flags exist unless override policy is enabled. |
| `decision_recorded_at` | TIMESTAMPTZ | Required when `decision` is `APPROVE` or `RETURN`. | Audit field. |

### Indicator Review Rows

| Field Name | Data Type | Constraints / Validation Rules | Notes |
|:-----------|:----------|:-------------------------------|:------|
| `review_flag_id` | UUID | Required per flagged row. | Recommended child-table primary key. |
| `indicator_code` | VARCHAR(100) | Required. Must match the ST indicator key exactly. | Do not rename DOH indicator codes. |
| `indicator_name` | VARCHAR(255) | Required. Read-only from ST snapshot. | Human-readable label for review. |
| `program_cluster` | ENUM | Required. `family_health`, `infectious_disease`, `ncd`, `environmental_health`, `mortality_natality`. | Keeps review filters aligned with FHSIS clusters. |
| `numerator_nhts` | INTEGER | Required when indicator is NHTS-disaggregated. Must be >= 0. | Source value from ST. |
| `numerator_non_nhts` | INTEGER | Required when indicator is NHTS-disaggregated. Must be >= 0. | Source value from ST. |
| `numerator_total` | INTEGER | Required. Must equal `numerator_nhts + numerator_non_nhts` where applicable. | Auto-validated. |
| `denominator` | INTEGER | Required for rate/coverage indicators. Must be >= 0. | Zero denominator requires explicit `NA` handling rule when indicator is not applicable. |
| `coverage_percent` | DECIMAL(6,2) | Required for coverage indicators. | Auto-computed; PHN should not edit directly. |
| `city_average_percent` | DECIMAL(6,2) | Optional display field but required when `comparison_baseline_type = city_average`. | Used for outlier comparison. |
| `deviation_percent` | DECIMAL(6,2) | Required when comparison exists. | Positive or negative delta from baseline. |
| `flag_status` | ENUM | Required when a row is flagged. `open`, `resolved_by_midwife`, `overridden_by_phn`. | Governs whether the ST can be approved. |
| `flag_reason_code` | ENUM | Required when flagged. `over_100_percent`, `subtotal_mismatch`, `denominator_mismatch`, `outlier`, `missing_required_value`, `cross_dataset_inconsistency`, `other`. | Maps directly to Chapter 9.1 rule types. |
| `flag_comment` | TEXT | Required when flagged. Minimum meaningful explanation. | Example: "Facility-based deliveries exceed SBA-attended deliveries; verify numerator source." |
| `flagged_at` | TIMESTAMPTZ | Required when flagged. | Audit timestamp. |

## Optional / Conditional Fields

| Field Name | Data Type | Condition for Display | Notes |
|:-----------|:----------|:----------------------|:------|
| `midwife_resolution_comment` | TEXT | Show when a previously returned ST is re-submitted. | Captures the Midwife's explanation of what changed. |
| `phn_override_justification` | TEXT | Show only if policy allows PHN override of unresolved flags. | Must be required if `flag_status = overridden_by_phn`. |
| `overall_return_reason` | TEXT | Show only when `decision = RETURN`. | Required for returning an ST. Not just per-row comments. |
| `supporting_attachment_url` | TEXT | Show only if the PHN can attach evidence/screenshots. | Useful for audit or coaching. |
| `prior_period_value` | DECIMAL(10,2) | Show when comparison baseline is prior BHS period. | Helps distinguish sudden trend change from one-off anomaly. |
| `notification_recipient_user_id` | UUID | Show on `RETURN` action. | Defaults to submitting Midwife. |

## Enums / Controlled Vocabularies

- `st_status`: `SUBMITTED`, `RETURNED`, `APPROVED`
- `decision`: `APPROVE`, `RETURN`, `SAVE_IN_PROGRESS`
- `comparison_baseline_type`: `city_average`, `prior_bhs_period`, `fixed_rule_set`, `none`
- `flag_status`: `open`, `resolved_by_midwife`, `overridden_by_phn`
- `flag_reason_code`:
  - `over_100_percent`
  - `subtotal_mismatch`
  - `denominator_mismatch`
  - `outlier`
  - `missing_required_value`
  - `cross_dataset_inconsistency`
  - `other`

## UX / Clinical Safety Concerns

- The 32-BHS queue should make station status visible at a glance: `NOT_SUBMITTED`, `SUBMITTED`, `RETURNED`, `APPROVED`.
- Approval must be a confirmation-gated action because it directly affects city-wide reporting; once approved, the ST becomes part of the MCT source set.
- Returning an ST must require an overall reason plus at least one actionable row-level comment.
- Any Chapter 9.1 logic failure should be visually separated from soft statistical outliers; a hard validation failure is not the same as an unusual but plausible value.
- The PHN should be able to see trend context without editing the source ST values directly.
- An unresolved-flag banner should persist at the top of the review screen and block approval unless every flag is resolved or a governed override path exists.
- The UI should distinguish `0`, `no data`, and `NA`; empty cells are not acceptable.
- Because flagged rows trigger work for another role, comments must be instructional and unambiguous rather than shorthand.

## Database Schema Notes

- `summary_tables.status` should support at least `DRAFT`, `SUBMITTED`, `RETURNED`, `APPROVED` as already described in `project_spec.md`.
- Recommended child table:
  - `summary_table_review_flags(id, summary_table_id, indicator_code, flag_reason_code, flag_status, flag_comment, midwife_resolution_comment, phn_override_justification, flagged_at, resolved_at, flagged_by_user_id)`
- `summary_tables.reviewed_by` and `summary_tables.approved_at` should be populated on approval.
- `summary_tables.remarks` can store per-indicator comments, but a normalized child table is preferable because resolution state and timestamps need first-class columns.
- Indexes:
  - `summary_tables(status, period_year, period_month)`
  - `summary_table_review_flags(summary_table_id, flag_status)`
- Every `RETURN` and `APPROVE` action should generate `audit_logs` entries without storing patient PII in the log payload.

## Reports and Exports (if this form feeds a report)

- Approved STs feed the city-wide MCT generation set.
- Returned STs do not feed the MCT until corrected and re-approved.
- Review metadata should be available in audit-friendly export or admin views, even if it is not part of the official DOH form.
