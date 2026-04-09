# CHO (City Health Officer) User Flow — Project LINK (Validated Against FHSIS)

## Purpose

This document defines the end-to-end user flow for the City Health Officer (CHO) in Project LINK, based on the updated digital process flowchart and aligned with official FHSIS governance responsibilities.

It positions the CHO as the city-level oversight and decision authority for performance monitoring, planning, GIS intelligence, and predictive analytics, while preserving the formal reporting validation chain.

## Scope and Role Boundary

- Role: `cho` (City Health Officer)
- Primary surface: internal executive dashboard (web)
- Data scope: city-wide aggregated and validated reporting outputs, surveillance views, and planning intelligence
- Responsibility: monitor city performance, timeliness, completeness, and risk signals; use GIS/analytics/predictive outputs for planning and decision-making
- Not allowed: direct field-level record encoding, Midwife validation actions, PHN consolidation actions, or PHIS data-quality gate decisions

The CHO is the strategic oversight layer. The CHO consumes validated outputs for governance and planning, and does not replace PHN or PHIS workflow gates.

## Canonical CHO Workflow

## 1) Open Executive Monitoring Dashboard

1. CHO signs in to the city executive dashboard.
2. Dashboard shows city-wide reporting health indicators:
   - timeliness of submissions
   - completeness status
   - return/correction trends
   - summary performance per barangay
3. CHO reviews current reporting cycle risks and priority areas.

Expected behavior:
- CHO has full oversight visibility of city-level reporting performance.
- CHO actions are planning/governance decisions, not data-entry edits.

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

## 5) Consume Final PHIS Submission Outcome

1. PHIS completes data-quality review and submits reports through official reporting tools.
2. In the updated digital flowchart, `phis_submit` transitions to CHO workflow closure (`cho_end`).
3. CHO records the submission outcome and closes the cycle for strategic monitoring.

Operational interpretation:
- CHO receives and monitors final submission status for governance accountability.
- Submission execution remains PHIS-controlled in the workflow.

## 6) Drive Planning and Resource Decisions

1. CHO uses validated outputs, GIS, and predictive insights to define city actions.
2. CHO sets priorities for program implementation and support across barangays.
3. CHO tracks follow-through outcomes in subsequent cycles.

Examples of CHO decisions:
- targeted supervision in delayed barangays
- resource redistribution for high-risk zones
- escalation of recurring data-quality or service-coverage gaps

## Reporting Timeline Oversight (FHSIS Context)

CHO oversight is tied to official reporting cadence at city level:

- Monthly cycle monitoring before city monthly submission closes
- Quarterly cycle monitoring before Q1 submission deadlines
- Annual cycle monitoring before A1 submission deadlines

For Dasmariñas as HUC:
- quarterly and annual higher-level routing follows HUC pathway (direct to DOH-CHD for Q1/A1), while CHO continues city-level oversight.

## Status Model for CHO Oversight

Executive monitoring statuses:

- `CYCLE_IN_PROGRESS` : current reporting cycle active
- `RISK_FLAGGED` : timeliness/completeness or quality risk detected
- `UNDER_CORRECTION` : active return/discrepancy loops in PHN/PHIS stages
- `SUBMISSION_CONFIRMED` : PHIS submission completed for cycle
- `CYCLE_CLOSED` : cycle closed in CHO monitoring layer

Recommended UI constraints:
- CHO can annotate, escalate, and issue directives, but cannot mutate validated source records
- high-risk flags should persist until explicitly resolved
- every executive directive should be audit-logged with rationale

## FHSIS Validation Mapping

This CHO role mapping is aligned with official FHSIS local-level governance functions and the updated digital flowchart:

1. CHO-level oversight emphasizes monitoring implementation status, data availability, timeliness, and feedback mechanisms.
2. PHN and PHIS remain responsible for consolidation and quality gates before final submission.
3. CHO uses consolidated and validated data for planning, policy direction, and decision support.
4. Updated flowchart explicitly places surveillance, GIS, and predictive dashboards in the CHO lane.
5. Workflow closure after PHIS submission is reflected in CHO endpoint monitoring.

## Data Quality and Compliance Guards

- CHO cannot bypass PHN/PHIS validation and approval gates.
- CHO cannot directly alter field-level clinical records.
- CHO directives and monitoring actions must be audit-traceable.
- Preserve official DOH indicators and disaggregations in all executive views.
- No hard delete actions at CHO layer; reporting history must remain reviewable.

## Edge Cases and Handling

1. Persistent delayed submissions from specific barangays:
- raise executive risk flag and track repeated delays
- issue targeted follow-up directives

2. Repeated PHIS return cycles in same reporting period:
- maintain correction trend visibility for governance action
- require documented root-cause notes for recurring discrepancies

3. Surveillance hotspot without corresponding reporting deterioration:
- support proactive planning action even if submission metrics remain on time

4. Conflicting signals between predictive output and current indicators:
- preserve confidence labels and decision notes
- require periodic model/output review before major policy shifts

5. Submission complete but unresolved high-risk operational alerts:
- allow cycle closure for reporting while keeping risk alerts open for action tracking

## Acceptance Criteria for CHO User Flow

1. CHO can view city-wide timeliness, completeness, and reporting performance indicators.
2. CHO can use surveillance, GIS, and predictive dashboards for planning decisions.
3. CHO receives final submission outcome visibility after PHIS submission.
4. CHO can issue governance directives without directly modifying source records.
5. Risk and directive history is fully auditable.
6. CHO role does not bypass PHN consolidation or PHIS DQC gates.
7. CHO cycle monitoring can be closed while preserving unresolved operational risk tracking.

## Primary Source Alignment

- `docs/diagrams/flowcharts/digital-fhsis-process-flowchart.md`
- `docs/references/research/fhsis_mop/02_fhsis_system_overview.md`
- `docs/references/research/fhsis_current_process.md`
- `AGENTS.md`
