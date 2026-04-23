# PHN (Public Health Nurse) User Flow — Project LINK (Validated Against FHSIS)

## Purpose

This document defines the end-to-end user flow for the Public Health Nurse (PHN) in Project LINK, based on the digital process flowchart and validated against the official FHSIS Manual of Operations (2018, referenced by DOH DM 2024-0007).

It specifies PHN responsibilities for BHS summary review, city-level consolidation, and handoff to CHO data-quality review.

## Scope and Role Boundary

- Role: `phn` (Public Health Nurse)
- Primary surface: CHO dashboard (desktop-first web)
- Data scope: all submitted BHS reports within city coverage
- Responsibility: review/approve returned BHS summaries, consolidate approved summaries into city-level outputs, and route outputs to CHO quality gate
- Not allowed: final CHO-level quality approval and final export submission authority reserved for City Health Officer

PHN is the city-level consolidation authority for approved BHS summaries and the operational bridge between Midwife submissions and CHO quality clearance.

## Canonical PHN Workflow

## 1) Open CHO Review Dashboard

1. PHN signs in and opens the pending BHS submissions dashboard.
2. Dashboard lists all barangay summary submissions awaiting CHO review.
3. PHN filters by:
   - pending review
   - returned/resubmitted batches
   - deadline risk and missing barangays

Expected behavior:
- Every submitted BHS summary table is reviewed before inclusion in city consolidation.
- Return loops must be explicit and auditable.

## 2) Review BHS Summary Tables (Approve/Return)

1. PHN opens each submitted BHS summary package.
2. Decision branch:
   - Approve -> Summary Table status becomes `APPROVED`
   - Return -> Summary Table status becomes `RETURNED`
3. If returned, PHN sends discrepancy reason to Midwife for correction.
4. Midwife corrects and resubmits; PHN re-reviews.

Digital flow alignment:
- PHN has a formal return path to Midwife before city-level consolidation.
- Consolidation waits until required BHS summaries are approved.

## 3) Check Completeness Across Barangays

1. PHN verifies whether all required barangay summaries are approved.
2. If not complete:
   - system remains in waiting state
   - PHN tracks missing/late submissions
3. If complete:
   - PHN proceeds to city-wide consolidation.

Gate rule:
- Auto-consolidation starts only when required approvals are complete.

## 4) Run City Consolidation (MCT Layer)

1. System consolidates approved BHS summaries into city-level monthly consolidation outputs.
2. PHN reviews consolidated indicators and consistency checks.
3. PHN validates city-level outputs for downstream reporting.

FHSIS validation points:
- MCT is the core M/CHO output table containing indicators by barangay.
- MCT is the basis for quarterly reporting outputs.

## 5) Integrate External Data Inputs (Official Process Requirement)

PHN/FHSIS consolidation at city level includes integration of:

- Local Civil Registry (live births, mortality)
- Hospital/private clinic service data where applicable
- School and day care data for relevant immunization/MDA indicators

Data quality checks include:
- subtotal/grand-total consistency
- denominator and percentage plausibility
- cross-dataset consistency
- clear distinction of zero vs missing vs not-applicable

## 6) Generate and Route City Outputs

1. From validated city consolidation, PHN produces city-level reporting artifacts.
2. In Project LINK digital flow, city outputs are routed to CHO dashboard for quality check gate.
3. CHO may:
   - approve for export/submission
   - return discrepancy report to PHN correction loop
4. If returned, PHN corrects consolidation/report package and resubmits to CHO.

## 7) Reporting Timeline Alignment (FHSIS)

PHN/FHSIS coordinator city-level schedule alignment:

- `M2` monthly (city consolidated): Friday, 1st week of succeeding month
- `Q1` quarterly: Wednesday, 2nd week of 1st month of succeeding quarter
- `A1` annual: Wednesday, 2nd week of January

Project implication:
- dashboard must expose deadline risk for missing approvals or unresolved discrepancies before these cutoffs.

## Status Model for PHN-Controlled Workflow

BHS summary review statuses:

- `PENDING_CHO_REVIEW` : submitted by Midwife, awaiting PHN review
- `RETURNED_TO_BHS` : sent back to Midwife with discrepancy reason
- `APPROVED_BHS_SUMMARY` : PHN-approved for consolidation

City consolidation statuses:

- `WAITING_BHS_APPROVALS` : one or more barangays not yet approved
- `MCT_DRAFT_AUTO` : auto-generated city consolidation draft
- `MCT_VALIDATED` : PHN-validated city package ready for final DQC

Final DQC handoff statuses:

- `PENDING_DQC` : submitted to CHO quality check
- `DQC_RETURNED` : discrepancy return to PHN
- `DQC_APPROVED` : cleared for export/submission

Recommended UI constraints:
- prevent consolidation finalization while required barangays remain unapproved
- require discrepancy reason on every return action
- preserve full version history for corrected resubmissions

## FHSIS Validation Mapping

This PHN digital flow is aligned with official FHSIS process requirements:

1. PHN consolidates BHS reports at city level using MCT as core consolidation tool.
2. PHN/FHSIS functions include validation and quality checks before higher-level reporting.
3. Quarterly and annual city reporting outputs derive from consolidated monthly data.
4. Timelines for city-level reporting remain strict and deadline-bound.
5. In Project LINK, PHN consolidation is followed by CHO quality gate before final export/submission.

## Data Quality and Compliance Guards

- No city-level reporting from unapproved BHS summaries.
- All return loops require explicit discrepancy reasons.
- Maintain immutable audit trail of approvals, returns, corrections, and re-submissions.
- Preserve exact DOH indicator naming/formula semantics (DOH DM 2024-0007 alignment).
- Ensure required disaggregations (sex/age/NHTS where applicable) remain intact through consolidation.
- No hard deletes for clinical/reporting data; use soft-delete or archival controls.

## Edge Cases and Handling

1. Missing barangay submissions near deadline:
- show blocked-consolidation alert with missing barangay list
- prioritize follow-up with specific station owners

2. CHO discrepancy returned after PHN validation:
- keep discrepancy report attached to affected indicators
- require targeted correction and resubmission, not silent overwrite

3. External source data delay (LCR/hospital/school):
- flag affected indicators with source-lag status
- prevent false zeroing of not-yet-arrived datasets

4. Conflicting denominator sources across facilities:
- enforce denominator consistency checks before CHO submission

5. Large correction wave across multiple barangays:
- support batch tracking with per-barangay correction state and due dates

## Acceptance Criteria for PHN User Flow

1. PHN can review every BHS submission and explicitly approve or return it.
2. Consolidation starts only after required BHS approvals are complete.
3. PHN can validate city-level consolidated outputs and send them to CHO.
4. CHO-returned discrepancies can be corrected and resubmitted with traceable history.
5. M2/Q1/A1 deadline risks are visible and actionable in PHN dashboard.
6. External data integrations (LCR/hospital/school) are reflected in consolidation workflow.
7. PHN cannot bypass CHO final quality gate in the Project LINK digital flow.

## Primary Source Alignment

- `docs/diagrams/flowcharts/manual-fhsis-process-flowchart.md`
- `docs/diagrams/flowcharts/digital-fhsis-process-flowchart.md`
- `docs/references/research/fhsis_current_process.md`
- `docs/references/research/fhsis_mop/SECTIONS_REFERENCE.md`
- `docs/references/research/fhsis_mop/02_fhsis_system_overview.md`
