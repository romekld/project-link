# PHIS Coordinator User Flow — Project LINK (Validated Against FHSIS)

## Purpose

This document defines the end-to-end user flow for the PHIS Coordinator in Project LINK, based on the digital process flowchart and validated against the official FHSIS Manual of Operations (2018, referenced by DOH DM 2024-0007).

It covers the final data-quality review gate, report export, and submission handoff after city-level consolidation, including workflow closure into the CHO lane endpoint shown in the updated flowchart.

## Scope and Role Boundary

- Role: `phis` (PHIS Coordinator)
- Primary surface: internal dashboard web
- Data scope: city-level consolidated outputs and data-quality review packages
- Responsibility: run final data-quality checks, return discrepancies for correction, approve validated reports, export final report packages, and submit for workflow closure
- Not allowed: field-level record capture, BHS validation, or city consolidation ownership before PHN approval

The PHIS Coordinator is the final quality gate before external submission in the Project LINK digital flow.

## Canonical PHIS Workflow

## 1) Open Data Quality Review Dashboard

1. PHIS Coordinator signs in and opens the data-quality review dashboard.
2. Dashboard lists city-level report packages awaiting final verification.
3. PHIS filters by:
   - pending DQC
   - returned packages
   - export-ready packages
   - deadline risk for monthly/quarterly/annual submission

Expected behavior:
- Nothing can be exported until DQC is explicitly approved.
- Returned packages remain auditable and traceable back to the PHN correction loop.

## 2) Run Automated Data Quality Check

1. PHIS launches the automated DQC process.
2. System checks report package integrity and consistency.
3. PHIS reviews results for issues such as:
   - missing barangays or report sections
   - inconsistent totals or denominators
   - unresolved return comments
   - invalid or incomplete indicator disaggregation

Digital flow alignment:
- PHIS DQC is a distinct approval gate after PHN consolidation.
- Returns from PHIS go back to PHN for correction.

## 3) Approve or Return the Report Package

1. PHIS makes one of two decisions:
   - Approve -> package becomes `DQC_APPROVED`
   - Return -> package becomes `DQC_RETURNED`
2. If returned, PHIS issues a discrepancy report for correction.
3. PHN receives the discrepancy report, corrects the package, and resubmits.
4. PHIS re-runs DQC on the corrected package.

Required behavior:
- Every return must include a clear correction reason.
- Returned packages should preserve version history and prior approved/returned states.

## 4) Export Reports

1. After DQC approval, PHIS exports the report package.
2. System supports export formats aligned with the flowchart:
   - Excel
   - PDF
3. Exported artifacts are stored as signed or traceable report outputs.

Project LINK requirement:
- The export step should preserve the official report version used for submission.

## 5) Submit to Higher Administrative Level

1. After export, PHIS submits the approved report package to the next administrative level via DOH e-tools.
2. Submission destination depends on the reporting pathway and local administrative arrangement.
3. In the digital flowchart, this is represented as submission via the same DOH Excel-based e-tools after approval.
4. In the updated flowchart, this submission transitions to the CHO lane endpoint (`cho_end`) as the visible workflow close.

HUC note:
- For Dasmariñas City as a Highly Urbanized City, quarterly and annual reporting routes bypass the PHO layer and go directly to DOH-CHD.

## 6) Handoff to CHO Workflow Endpoint

1. After PHIS submission, system marks the package as handed off to the CHO lane endpoint.
2. This transition represents completion of the reporting workflow path in the updated diagram.
3. The handoff event must be retained in the audit trail for traceability.

## 7) Maintain DQC and Submission Audit Trail

1. System records every DQC action.
2. Audit trail stores:
   - reviewer identity
   - package version
   - approval/return decision
   - discrepancy reason
   - export timestamp
   - submission timestamp
3. PHIS can review prior package history for traceability and audit support.

## Reporting Timeline Alignment (FHSIS)

PHIS Coordinator timing aligns with the reporting package lifecycle:

- Monthly report reviews must be completed before the monthly city submission path closes
- Quarterly DQC must be completed before `Q1` submission deadlines
- Annual DQC must be completed before `A1` submission deadlines

Reference timeline anchors used in Project LINK:
- `M2` monthly consolidated submission path: Friday, 1st week of succeeding month
- `Q1` quarterly: Wednesday, 2nd week of 1st month of succeeding quarter
- `A1` annual: Wednesday, 2nd week of January

Operational implication:
- PHIS dashboard must surface deadline risk and block export until DQC is approved.

## Status Model for PHIS-Controlled Workflow

Core statuses:

- `PENDING_DQC` : awaiting PHIS review
- `DQC_RETURNED` : returned for correction with discrepancy reason
- `DQC_APPROVED` : approved for export
- `EXPORTED` : export package generated
- `SUBMITTED` : package sent to the next administrative level
- `HANDED_OFF_CHO` : submission transition recorded to CHO lane endpoint
- `ARCHIVED` : final submitted version stored for audit

Recommended UI constraints:
- approval and export actions should be separate, explicit steps
- return action must not be possible without a reason
- preserve immutable history of all DQC iterations

## FHSIS Validation Mapping

This PHIS digital flow is aligned with official FHSIS process requirements:

1. PHIS performs the last quality review before external submission of consolidated reports.
2. PHIS checks the correctness and completeness of the city-level package before export.
3. PHIS returns discrepancies for correction when data quality criteria fail.
4. Final report submission follows the approved city package and official e-tools process.
5. In Project LINK, the PHIS gate does not replace PHN consolidation; it validates the final package produced from it.

## Data Quality and Compliance Guards

- No export from `PENDING_DQC` or `DQC_RETURNED` states.
- Every discrepancy must be traceable to a specific package version and indicator group.
- Maintain immutable audit logs for approve/return/export/submission events.
- Preserve exact DOH field names, indicator formulas, and section semantics.
- Do not hard-delete report packages; retain submitted and returned versions for compliance and audit.

## Edge Cases and Handling

1. Package returned close to deadline:
- show urgency flag and target correction window
- preserve previous approval notes for comparison

2. Multiple correction cycles on same package:
- stack version history instead of overwriting
- mark latest version as active for review

3. Missing export format support:
- fail closed and keep package in DQC state until available

4. Submission destination uncertainty for HUC/provincial routing:
- route according to configured administrative pathway and city classification

5. Upstream PHN changes after DQC approval:
- require revalidation before export

## Acceptance Criteria for PHIS User Flow

1. PHIS can run DQC on each consolidated report package.
2. PHIS can approve or return a package with a recorded reason.
3. Approved packages can be exported as Excel or PDF.
4. Exported packages can be submitted to the next administrative level with audit history.
5. Submitted packages register a CHO-lane handoff event as workflow closure.
6. Deadline risk is visible before monthly, quarterly, and annual cutoffs.
7. PHIS cannot export or submit packages that remain unapproved.
8. Version history remains intact across all DQC cycles.

## Primary Source Alignment

- `docs/diagrams/flowcharts/digital-fhsis-process-flowchart.md`
- `docs/diagrams/flowcharts/manual-fhsis-process-flowchart.md`
- `docs/references/research/fhsis_current_process.md`
- `docs/references/research/fhsis_mop/SECTIONS_REFERENCE.md`
- `docs/references/research/fhsis_mop/02_fhsis_system_overview.md`
