# CHO (City Health Officer) User Flow - Project LINK (Validated Against FHSIS)

## Purpose

This document defines the end-to-end user flow for the City Health Officer (CHO) in Project LINK, based on the updated digital process flowchart and aligned with official FHSIS governance responsibilities.

The CHO is now the city-level oversight and final reporting authority. This role owns strategic monitoring, surveillance, GIS intelligence, final data-quality review, report export, and submission workflow closure after PHN city-level consolidation.

## Scope and Role Boundary

- Role: `cho` (City Health Officer)
- Primary surface: internal executive dashboard (web)
- Data scope: city-wide aggregated reporting outputs, DQC packages, surveillance views, and planning intelligence
- Responsibility: monitor city performance, timeliness, completeness, risk signals, final DQC, discrepancy returns, report approval, export, submission, and executive planning
- Not allowed: direct field-level record encoding, Midwife validation actions, PHN consolidation ownership, or direct mutation of validated source records

The CHO consumes validated outputs for governance and planning, and performs the final reporting gate. PHN remains the city consolidation owner; CHO is the final quality, export, and submission authority.

## Canonical CHO Workflow

## 1) Open Executive Monitoring Dashboard

1. CHO signs in to the city executive dashboard.
2. Dashboard shows city-wide reporting health indicators:
   - timeliness of submissions
   - completeness status
   - return/correction trends
   - pending DQC packages
   - export-ready packages
   - summary performance per barangay
3. CHO reviews current reporting cycle risks and priority areas.

Expected behavior:
- CHO has full oversight visibility of city-level reporting performance.
- CHO can act on final reporting packages without directly editing source clinical records.

## 2) Monitor Real-Time Surveillance Stream

1. CHO opens the Real-Time Surveillance Dashboard.
2. CHO reviews real-time health records with status context.
3. CHO identifies emerging risks requiring policy or operational response.

Flowchart alignment:
- CHO swimlane includes real-time surveillance and status monitoring as a dedicated capability.

## 3) Use GIS Map and Predictive Analytics

1. CHO maps records and cases geographically.
2. CHO reviews hotspot and service-gap patterns across barangays.
3. CHO uses predictive analytics outputs to prioritize interventions and resource planning.

Decision support focus:
- risk-based targeting
- barangay-level prioritization
- program planning and escalation

## 4) Review Reporting Throughput and Timeliness

1. CHO tracks whether reporting milestones are on schedule.
2. CHO monitors lagging barangays and recurring correction patterns.
3. CHO issues management directives for follow-up where needed.

Official alignment:
- FHSIS local-level governance emphasizes timeliness, data quality monitoring, feedback, and implementation oversight.

## 5) Run Final Data Quality Check

1. CHO opens the data-quality review queue for PHN-validated city report packages.
2. CHO launches the automated DQC process.
3. System checks report package integrity and consistency.
4. CHO reviews results for issues such as:
   - missing barangays or report sections
   - inconsistent totals or denominators
   - unresolved return comments
   - invalid or incomplete indicator disaggregation

Gate behavior:
- DQC is a distinct approval gate after PHN consolidation.
- Returns from CHO go back to PHN for correction.
- Nothing can be exported until DQC is explicitly approved.

## 6) Approve or Return the Report Package

1. CHO makes one of two decisions:
   - Approve -> package becomes `DQC_APPROVED`
   - Return -> package becomes `DQC_RETURNED`
2. If returned, CHO issues a discrepancy report for correction.
3. PHN receives the discrepancy report, corrects the package, and resubmits.
4. CHO re-runs DQC on the corrected package.

Required behavior:
- Every return must include a clear correction reason.
- Returned packages should preserve version history and prior approved/returned states.

## 7) Export and Submit Reports

1. After DQC approval, CHO exports the report package.
2. System supports export formats aligned with the flowchart:
   - Excel
   - PDF
3. Exported artifacts are stored as signed or traceable report outputs.
4. CHO submits the approved report package to the next administrative level via official DOH reporting tools.
5. System records the submission outcome and closes the cycle for monitoring.

Project LINK requirement:
- The export step should preserve the official report version used for submission.
- Submission destination follows configured administrative routing and city classification.

HUC note:
- For Dasmarinas City as a Highly Urbanized City, quarterly and annual reporting routes bypass the PHO layer and go directly to DOH-CHD.

## 8) Drive Planning and Resource Decisions

1. CHO uses validated outputs, GIS, and predictive insights to define city actions.
2. CHO sets priorities for program implementation and support across barangays.
3. CHO tracks follow-through outcomes in subsequent cycles.

Examples of CHO decisions:
- targeted supervision in delayed barangays
- resource redistribution for high-risk zones
- escalation of recurring data-quality or service-coverage gaps

## 9) Maintain DQC and Submission Audit Trail

1. System records every DQC, approval, return, export, and submission action.
2. Audit trail stores:
   - reviewer identity
   - package version
   - approval/return decision
   - discrepancy reason
   - export timestamp
   - submission timestamp
3. CHO can review prior package history for traceability and audit support.

## Reporting Timeline Oversight (FHSIS Context)

CHO oversight and final reporting are tied to official reporting cadence at city level:

- Monthly report reviews must be completed before the monthly city submission path closes
- Quarterly DQC must be completed before `Q1` submission deadlines
- Annual DQC must be completed before `A1` submission deadlines

Reference timeline anchors used in Project LINK:
- `M2` monthly consolidated submission path: Friday, 1st week of succeeding month
- `Q1` quarterly: Wednesday, 2nd week of 1st month of succeeding quarter
- `A1` annual: Wednesday, 2nd week of January

Operational implication:
- CHO dashboard must surface deadline risk and block export until DQC is approved.

## Status Model for CHO-Controlled Workflow

Executive monitoring statuses:

- `CYCLE_IN_PROGRESS` : current reporting cycle active
- `RISK_FLAGGED` : timeliness/completeness or quality risk detected
- `UNDER_CORRECTION` : active return/discrepancy loops in PHN or CHO review stages
- `CYCLE_CLOSED` : cycle closed in CHO monitoring layer

Final reporting package statuses:

- `PENDING_DQC` : awaiting CHO review
- `DQC_RETURNED` : returned for correction with discrepancy reason
- `DQC_APPROVED` : approved for export
- `EXPORTED` : export package generated
- `SUBMITTED` : package sent to the next administrative level
- `ARCHIVED` : final submitted version stored for audit

Recommended UI constraints:
- approval and export actions should be separate, explicit steps
- return action must not be possible without a reason
- CHO can annotate, escalate, and issue directives, but cannot mutate validated source records
- high-risk flags should persist until explicitly resolved
- every executive directive should be audit-logged with rationale

## FHSIS Validation Mapping

This CHO role mapping is aligned with official FHSIS local-level governance and reporting functions:

1. CHO-level oversight emphasizes monitoring implementation status, data availability, timeliness, and feedback mechanisms.
2. PHN remains responsible for city-level consolidation before final DQC.
3. CHO performs the last quality review before external submission of consolidated reports.
4. CHO checks the correctness and completeness of the city-level package before export.
5. CHO returns discrepancies for correction when data quality criteria fail.
6. Final report submission follows the approved city package and official e-tools process.
7. CHO uses consolidated and validated data for planning, policy direction, and decision support.

## Data Quality and Compliance Guards

- No export from `PENDING_DQC` or `DQC_RETURNED` states.
- Every discrepancy must be traceable to a specific package version and indicator group.
- Maintain immutable audit logs for approve/return/export/submission events.
- Preserve official DOH indicators, field names, formulas, disaggregations, and section semantics.
- CHO cannot directly alter field-level clinical records.
- No hard delete actions at CHO layer; reporting history must remain reviewable.

## Edge Cases and Handling

1. Persistent delayed submissions from specific barangays:
- raise executive risk flag and track repeated delays
- issue targeted follow-up directives

2. Package returned close to deadline:
- show urgency flag and target correction window
- preserve previous approval notes for comparison

3. Multiple correction cycles on same package:
- stack version history instead of overwriting
- mark latest version as active for review

4. Surveillance hotspot without corresponding reporting deterioration:
- support proactive planning action even if submission metrics remain on time

5. Upstream PHN changes after DQC approval:
- require revalidation before export

6. Submission complete but unresolved high-risk operational alerts:
- allow cycle closure for reporting while keeping risk alerts open for action tracking

## Acceptance Criteria for CHO User Flow

1. CHO can view city-wide timeliness, completeness, and reporting performance indicators.
2. CHO can use surveillance, GIS, and predictive dashboards for planning decisions.
3. CHO can run DQC on each consolidated report package.
4. CHO can approve or return a package with a recorded reason.
5. Approved packages can be exported as Excel or PDF.
6. Exported packages can be submitted to the next administrative level with audit history.
7. Deadline risk is visible before monthly, quarterly, and annual cutoffs.
8. CHO cannot export or submit packages that remain unapproved.
9. Version history remains intact across all DQC cycles.
10. CHO can issue governance directives without directly modifying source records.

## Primary Source Alignment

- `docs/diagrams/flowcharts/digital-fhsis-process-flowchart.md`
- `docs/diagrams/flowcharts/manual-fhsis-process-flowchart.md`
- `docs/references/research/fhsis_current_process.md`
- `docs/references/research/fhsis_mop/SECTIONS_REFERENCE.md`
- `docs/references/research/fhsis_mop/02_fhsis_system_overview.md`
- `AGENTS.md`
