# Forms & Fields Research Report - Public Health Nurse (PHN)

## Role Overview

The Public Health Nurse (PHN) in Project LINK is the city-level consolidation and oversight role operating on the web interface. The PHN does not encode frontline ITR data; instead, they review barangay submissions, validate whether each BHS Summary Table (ST) is fit for consolidation, generate the city-wide Monthly Consolidation Table (MCT), compile the quarter-end Q1 package, and monitor reporting timeliness/completeness across all 32 Barangay Health Stations.

In the local product flow, the PHN sits between the Midwife and the PHIS Coordinator:
- receives submitted STs from Midwives
- flags anomalies or returns an ST for correction
- approves STs for inclusion in the MCT
- generates the MCT from approved STs
- submits the MCT and quarter-end Q1 package to the PHIS Coordinator for DQC/export

Scope is city-wide. Unlike BHWs and Midwives, the PHN is not scoped to a single `health_station_id`; this role reads across all 32 BHS and is the first city-level reviewer of consolidated FHSIS data.

## Forms in This Directory

| Form Name | Category | FHSIS Reference | File |
|:----------|:---------|:----------------|:-----|
| ST Review and Approval Workspace | Admin / Workflow | FHSIS MOP 2018, Chapter 2 (roles and submission flow), Chapter 9.1 (data validation) | [st_review_approval.md](st_review_approval.md) |
| Monthly Consolidation Table (MCT) | Report / Consolidation | FHSIS MOP 2018, Chapter 2 Table 2; Chapters 4-8 MCT sections | [monthly_consolidation_table.md](monthly_consolidation_table.md) |
| Quarterly Program Accomplishment Report (Q1) | Report | FHSIS MOP 2018, Chapter 2 Table 2; Chapters 4-8 Q1 sections | [quarterly_program_accomplishment_report_q1.md](quarterly_program_accomplishment_report_q1.md) |
| Timeliness and Completeness Monitor | Admin / Monitoring | FHSIS MOP 2018, Chapter 9.4 - Form 1B monitoring template | [timeliness_completeness_monitor.md](timeliness_completeness_monitor.md) |

## Cross-Role Form Dependencies

| Direction | Form / Record | From Role | To Role | Status Transition |
|:----------|:--------------|:----------|:--------|:------------------|
| Receives | Summary Table (ST) | Midwife | PHN | `SUBMITTED` -> `APPROVED` or `RETURNED` |
| Receives | Per-indicator remarks on ST rows | Midwife | PHN | Read-only context for PHN review |
| Sends | ST return package with flagged rows and overall reason | PHN | Midwife | `SUBMITTED` -> `RETURNED` |
| Sends | Approved ST set into city MCT | PHN | PHIS Coordinator | MCT `DRAFT` -> `PENDING_DQC` |
| Sends | Quarter-end Q1 package derived from approved MCTs | PHN | PHIS Coordinator | Draft quarter package -> export queue |
| Shares | Timeliness/completeness follow-up notes | PHN | Midwife / CHO leadership | No clinical record transition; governance workflow |

## FHSIS Compliance Notes

- DOH indicator names, codes, and formulas must remain exact. PHN-facing consolidation screens may add helper labels in the UI, but stored/exported field names must still match the DOH standard.
- NHTS disaggregation is mandatory for program accomplishment indicators. The PHN review layer must verify that `nhts + non_nhts = total`.
- Chapter 9.1 validation rules must be enforced before city-level submission:
  - subtotals must equal grand totals
  - proportions over 100% must be flagged
  - higher/lower logical rules must hold (for example, facility-based deliveries cannot exceed SBA-attended deliveries)
  - identical denominators used across linked indicators must reconcile
  - blank cells must be explicitly classified as `0`, `no data`, or `NA`
- Chapter 9.4 completeness rules matter at the PHN layer because the PHN is the first city-wide FHSIS coordinator role in Project LINK:
  - Level 1 completeness: all BHS submitted
  - Level 2 completeness: all required program clusters are present
- Project LINK's workflow splits responsibilities slightly differently from the MOP:
  - PHN performs the first city-level review and consolidation
  - PHIS Coordinator performs downstream DQC, final approval, and official export

## Open Questions / Ambiguities

1. The MOP assigns RHU/MHC monthly M2 and quarterly Q1 preparation to the supervising nurse/FHSIS coordinator. Project LINK shifts final export to the PHIS Coordinator. Confirm whether the PHN should still see a dedicated M2 consolidation form or only the MCT plus Q1 preview.
2. The product flow allows MCT generation from "all 32 approved - or documented partial set." Confirm the exact minimum acceptable partial-submission policy and what approval/justification fields are mandatory before proceeding.
3. Confirm whether Environmental Health data is inside the same PHN MCT workflow in Phase 3, or staged separately because it often comes from Sanitary Inspector-owned sources.
4. Confirm whether mortality/natality quarterly figures should be editable by the PHN after LCR reconciliation, or always system-derived from a separate registry pipeline.
5. Clarify whether PHN row-level flags can be overridden directly by the PHN, or only by returning the ST to the Midwife and requiring a corrected re-submission.
6. Confirm which baseline is used for anomaly detection in the PHN review UI: current city average, prior-month BHS trend, prior-quarter average, or fixed threshold rules only.
