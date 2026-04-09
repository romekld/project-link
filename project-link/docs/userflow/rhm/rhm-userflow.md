# RHM (Midwife) User Flow — Project LINK (Validated Against FHSIS)

## Purpose

This document defines the end-to-end user flow for the Rural Health Midwife (RHM) in Project LINK, based on the digital process flowchart and validated against the official FHSIS Manual of Operations (2018, referenced by DOH DM 2024-0007).

It specifies the Midwife's validation authority at BHS level, reporting obligations, and mandatory handoffs to CHO roles.

## Scope and Role Boundary

- Role: `rhm` (Midwife)
- Primary surface: dashboard web (with mobile-capable access as needed)
- Data scope: own BHS catchment and assigned submissions
- Responsibility: validate BHW submissions, maintain master lists/TCL/registries, approve and submit BHS summary outputs
- Not allowed: city-wide consolidation (MCT), final city-level DQC/export authority, provincial submission as PHIS

The Midwife is the accountable BHS reporting gatekeeper. No BHW submission can affect official consolidation before Midwife validation.

## Canonical RHM Workflow

## 1) Open Validation Queue

1. Midwife signs in and opens pending BHW submissions queue.
2. Queue shows records in `PENDING_VALIDATION`, prioritized by:
   - oldest submission first
   - overdue monthly cutoffs
   - records previously returned/resubmitted
3. Midwife checks household/encounter completeness and correctness.

Expected behavior:
- Midwife review is mandatory before downstream auto-generation.
- Returned records must carry explicit return reason.

## 2) Decide on Each BHW Submission (Approve/Return)

1. Midwife reviews each pending record.
2. Decision branch:
   - Approve -> record becomes `VALIDATED`
   - Return -> record becomes `RETURNED`
3. On return, Midwife provides correction reason and sends back to BHW.
4. Corrected resubmission returns to `PENDING_VALIDATION` for re-review.

FHSIS validation points:
- Completed HH profiles are submitted by BHW to Midwife for supervisor review/compilation.
- Midwife must ensure profile completeness and use updated profiles for target-client preparation.

## 3) Maintain Integrated Master Lists

After validation of profiling and service records, Midwife maintains integrated master lists to avoid duplicate parallel listings.

Core master lists include:
- WRA (FP)
- Pregnant and postpartum women
- Newborns/infants/under-5/SAC/adolescents
- Oral health clients
- Adults 20-59 (NCD)
- Senior citizens
- Environmental health/sanitation households
- Industrial establishments with sanitary permits
- Barangays by ZOD certification status

FHSIS rule:
- Master lists should be integrated so the same target cohort supports multiple relevant services.

## 4) Record Clinical Services and Update TCL/Registries

1. Midwife ensures consultation/encounter data is captured in ITR pathway.
2. Midwife updates corresponding TCL entries for targeted clients.
3. Midwife updates disease/program registries for positive/chronic cases where applicable.

FHSIS-aligned artifacts:
- ITR variants per program
- 5 TCL families (FP, Maternal, Child, Oral, NCD with sub-parts)
- registries (TB/ITIS, Malaria/PhilMIS, Leprosy, Rabies, Filariasis, STH, STI, LRD)

## 5) Monthly Aggregation to Summary Tables (BHS Level)

1. At period close, system auto-aggregates validated records to BHS summary data.
2. Midwife reviews auto-generated Summary Table outputs.
3. Midwife approves the Summary Table for submission.

Manual baseline preserved from FHSIS:
- Monthly summary reflects indicator-level totals previously derived from TCL tallying.
- Summary tools include:
  - ST on Program Accomplishment/Service Coverage
  - ST on Mortality and Natality

## 6) Submit BHS Outputs to CHO

1. Midwife submits approved BHS summary outputs to CHO review queue.
2. PHN reviews and either:
   - Approves
   - Returns with discrepancy/correction reason
3. If returned, Midwife corrects and resubmits.

Handoff integrity:
- Midwife submission is the formal BHS-to-CHO transition point.
- Returned summary tables must preserve audit trail of corrections and resubmission.

## 7) Reporting Deadlines (FHSIS Schedule Alignment)

Midwife reporting obligations remain aligned to official timelines:

- `M1` monthly: Monday, 1st week of succeeding month
- `M2` monthly: Monday, 1st week of succeeding month
- `A-Barangay` annual: Wednesday, 1st week of January

Operational implication for Project LINK:
- Midwife dashboard should surface deadline risk indicators and incomplete validation queues before cutoffs.

## Status Model for Midwife-Controlled Records

Submission/record statuses:

- `PENDING_VALIDATION` : awaiting Midwife decision
- `RETURNED` : sent back to BHW with required reason
- `VALIDATED` : accepted for BHS-level aggregation
- `RESUBMITTED` : corrected by BHW and awaiting re-validation

Summary/report statuses:

- `ST_DRAFT_AUTO` : system-generated draft summary from validated data
- `ST_APPROVED_BHS` : Midwife-approved summary
- `ST_RETURNED_CHO` : returned by PHN for correction
- `ST_RESUBMITTED_CHO` : corrected and re-submitted to CHO

Recommended UI constraints:
- block ST approval if unresolved high-priority validation items exist
- require confirmation on irreversible submission actions
- keep correction reason mandatory and visible in all return loops

## FHSIS Validation Mapping

This Midwife digital flow is aligned with official FHSIS process requirements:

1. Midwife compiles BHW-submitted HH profiles and maintains completed profile repository.
2. Midwife builds and maintains integrated target client master lists from HH profiles.
3. Midwife manages ITR/TCL/registry updates at BHS level.
4. Midwife is accountable for BHS summary preparation and monthly report submission timelines.
5. CHO-level consolidation and higher-level report generation remain outside Midwife authority.

## Data Quality and Compliance Guards

- Unvalidated BHW records are excluded from official BHS summary outputs.
- Every return action (record or summary) requires explicit reason.
- Maintain immutable audit logs for validation, approval, return, and resubmission events.
- Preserve DOH indicator names/formula semantics (DOH DM 2024-0007 alignment).
- Maintain NHTS/non-NHTS disaggregation where required by indicator metadata.
- No hard deletes for clinical/reporting records; use soft-delete/archival controls.

## Edge Cases and Handling

1. End-of-month backlog in pending validations:
- show queue aging and deadline breach warnings
- prioritize records tied to monthly indicator cutoffs

2. PHN returns ST near deadline:
- enable rapid correction workflow with highlighted discrepancy fields
- retain prior submitted version for audit trace

3. Conflicting duplicate client records:
- enforce de-duplication review before validation finalization

4. Quarterly household profile updates incomplete:
- trigger reminder tasks to BHW assignees and flag affected target cohorts

5. External registry systems unavailable (e.g., ITIS/PhilMIS link issues):
- allow temporary local staging with explicit pending-sync/pending-confirmation labels

## Acceptance Criteria for RHM User Flow

1. Midwife can review all pending BHW submissions and approve or return each one.
2. Return actions always include a reason visible to BHW.
3. Only `VALIDATED` records feed auto-generated target lists and summary tables.
4. Midwife can approve and submit BHS summary outputs to CHO.
5. Returned CHO summaries can be corrected and resubmitted with full audit trail.
6. Deadline tracking for M1/M2/A-Barangay is visible and actionable.
7. Midwife cannot perform PHN/PHIS-only actions (MCT-wide consolidation, final DQC/export submission).

## Primary Source Alignment

- `docs/diagrams/flowcharts/manual-fhsis-process-flowchart.md`
- `docs/diagrams/flowcharts/digital-fhsis-process-flowchart.md`
- `docs/references/research/fhsis_current_process.md`
- `docs/references/research/fhsis_mop/SECTIONS_REFERENCE.md`
- `docs/references/research/fhsis_mop/02_fhsis_system_overview.md`
- `docs/references/research/fhsis_mop/03_profiling_of_households.md`
