# BHW User Flow — Project LINK (Validated Against FHSIS)

## Purpose

This document defines the end-to-end user flow for the Barangay Health Worker (BHW) in Project LINK, based on the digital process flowchart and validated against the official FHSIS Manual of Operations (2018, referenced by DOH DM 2024-0007).

It describes what the BHW can do directly, what is routed to the Midwife for approval, and which process rules are mandatory for FHSIS compliance.

## Scope and Role Boundary

- Role: `bhw`
- Primary surface: mobile-first PWA (offline-first)
- Data scope: assigned purok/households only
- Responsibility: field data capture, household profiling, and correction/resubmission of returned records
- Not allowed: final validation/approval of records, summary table approval, city-level consolidation, M1/M2/Q1/A1 submission

The BHW is a supervised field contributor. Official reporting authority remains with Midwife, PHN, and CHO roles.

## Canonical BHW Workflow

## 1) Start Field Session (Offline-First)

1. BHW signs in and opens the mobile PWA.
2. System shows:
   - connectivity status (online/offline)
   - pending sync count
   - records requiring correction/resubmission
3. BHW starts house-to-house operations in assigned catchment area.

Expected behavior:
- Field work must continue even without internet.
- Records are first persisted locally, then synced when connectivity returns.

## 2) Household Profiling (FHSIS Chapter 3)

1. BHW conducts household visit and asks permission to profile the household.
2. BHW captures Household Profile data in the app:
   - respondent and household metadata
   - household member roster
   - sex, age/date of birth, relationship to head
   - age/health-risk classification codes
   - NHTS/4Ps and PhilHealth information where applicable
3. BHW saves the profile locally.
4. If internet is available, background sync submits record to server as `PENDING_VALIDATION`.

FHSIS validation points:
- HH profiling is completed in January and updated quarterly.
- Updated HH profiles are expected within the first month of each quarter.
- Accomplished profiles are submitted to supervising Midwife not later than the 3rd week of January (and equivalent first-month quarterly updates).

## 3) Point-of-Care Service Recording

1. During/after visit, BHW records service interaction details via PWA encounter forms.
2. System creates/updates client encounter data mapped to the digital Individual Treatment Record pathway.
3. Record status remains `PENDING_VALIDATION` until Midwife review.

Project LINK behavior:
- Data captured by BHW contributes to target-client and summary generation only after Midwife validation.
- The digital flow preserves FHSIS paper intent while removing phone-notes-to-paper transcription.

## 4) Background Sync and Submission Queue

1. Sync worker retries unsent records when connectivity is restored.
2. Synced records appear in Midwife queue as pending submissions.
3. BHW dashboard displays per-record sync state:
   - `LOCAL_ONLY`
   - `PENDING_VALIDATION`
   - `RETURNED`
   - `VALIDATED`

Operational requirement:
- Sync must be idempotent (safe resubmission of the same client-side record ID).

## 5) Midwife Validation Gate (Return/Approve Loop)

1. Midwife reviews pending BHW submissions.
2. Midwife decision:
   - Approve -> record status becomes `VALIDATED`
   - Return -> record status becomes `RETURNED` with required reason
3. For returned records, BHW receives correction instructions and edits/resubmits.
4. Resubmitted record re-enters `PENDING_VALIDATION`.

Why this gate is mandatory:
- In FHSIS, the Midwife is accountable for compilation, master listing, TCL maintenance, and monthly reporting outputs.
- Therefore BHW-submitted records cannot directly affect official totals without Midwife confirmation.

## 6) Downstream Effects After Validation (Read-Only for BHW)

Once BHW records are validated:

1. Midwife-side processes can include those records in:
   - integrated Master Lists / Target Client Lists
   - auto-aggregation to barangay Summary Tables
2. PHN can review submitted barangay Summary Tables.
3. CHO performs final data quality checks before export/submission.

BHW visibility in this stage:
- can track status outcomes
- cannot approve summary tables or city-level reports

## Status Model for BHW Records

Core statuses visible to BHW:

- `DRAFT_LOCAL` : locally saved, not yet queued for sync
- `PENDING_SYNC` : queued for sync, awaiting network success
- `PENDING_VALIDATION` : submitted to server, awaiting Midwife review
- `RETURNED` : needs correction; Midwife reason required
- `RESUBMITTED` : corrected and sent again for validation
- `VALIDATED` : accepted by Midwife; eligible for downstream aggregation

Recommended UI constraints:
- show persistent status badge in list and detail views
- separate `RETURNED` records into a high-priority work queue
- prevent edits on `VALIDATED` records without formal amendment flow

## FHSIS Validation Mapping

This BHW digital flow is aligned with official FHSIS process requirements:

1. Household profiling is the first operational step for identifying service targets.
2. BHW/community volunteers perform household profiling under Midwife supervision.
3. HH profiles are periodic (January baseline, quarterly updates).
4. Midwife compiles completed HH profiles into integrated Master Lists.
5. Official reporting outputs are generated by authorized higher roles (Midwife/PHN/CHO), not by BHW.

## Data Quality and Compliance Guards

- No direct inclusion of unvalidated BHW records in ST/MCT outputs.
- Every return action must include explicit correction reason (auditable loop).
- Maintain audit trail for submissions, returns, and resubmissions.
- Preserve required indicator labels and semantics per DOH DM 2024-0007.
- Apply strict role-scoped access (BHW only sees assigned households and own submissions).
- No hard deletes on clinical records; use soft-delete/archive strategy where applicable.

## Edge Cases and Handling

1. No connectivity for extended period:
- allow continuous local capture
- show pending sync counter and oldest unsynced timestamp

2. Duplicate household profiling attempts:
- prompt merge/update flow if same household appears with active profile

3. Returned record with missing reason:
- block return action at Midwife side until reason is provided

4. Late quarterly updates:
- show overdue update indicator per assigned household

5. Household transfer/new residents:
- support profile update entries for moved-out and newly arrived households

## Acceptance Criteria for BHW User Flow

1. BHW can fully capture household and encounter data offline.
2. System syncs records automatically when online and marks them `PENDING_VALIDATION`.
3. Midwife can return or validate every submission.
4. BHW can view return reason, correct data, and resubmit.
5. Only `VALIDATED` records are used for downstream auto-generation.
6. Quarterly household profile update workflow is visible and trackable.
7. BHW cannot perform approval actions reserved for Midwife/PHN/CHO.

## Primary Source Alignment

- `docs/diagrams/flowcharts/manual-fhsis-process-flowchart.md`
- `docs/diagrams/flowcharts/digital-fhsis-process-flowchart.md`
- `docs/references/research/fhsis_current_process.md`
- `docs/references/research/fhsis_mop/02_fhsis_system_overview.md`
- `docs/references/research/fhsis_mop/03_profiling_of_households.md`
