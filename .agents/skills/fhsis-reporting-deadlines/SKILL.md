---
name: fhsis-reporting-deadlines
description: >
  Research and document FHSIS reporting deadlines for each health system role (BHW, RHM/Midwife,
  PHN, PHIS Coordinator, etc.) and add a standardized "Reporting Deadlines" section to each
  role's userflow .md in project-link/docs/userflows/. Use this skill whenever you need to add,
  update, or verify submission schedule/deadline information in any role's userflow document, or
  when someone asks what reports a specific role (BHW, RHM, PHN, PHIS Coordinator) is expected
  to submit and by when. Also use when generating or reviewing userflow documentation for any
  Project LINK health role.
---

# FHSIS Reporting Deadlines — Skill

## What This Skill Does

Given the official FHSIS Manual of Operations 2018 (DOH DM 2024-0007), this skill extracts
the exact submission deadlines per health system role and writes a canonical
`## Reporting Deadlines` section into each role's userflow `.md` file in
`project-link/docs/userflows/`.

---

## Primary Sources

All deadline data is sourced from:

1. `project-link/docs/references/research/fhsis_mop/02_fhsis_system_overview.md`
   — Table 2 (pp. 22–23): "Summary of FHSIS Profiling, Recording, Consolidation and Reporting
   Forms at Various Levels of Administration with Respective Timelines of Submission"
2. `project-link/docs/references/research/fhsis_current_process.md`
   — Step-by-step process summaries with submission deadlines
3. `project-link/docs/references/research/cho2_current_process.md`
   — CHO2-specific operational context (Dasmariñas City, 32 BHS)

> Always re-read Table 2 from source (1) before writing. The table is the authoritative
> reference — the data below is pre-extracted for convenience, but the source file wins if
> there is ever a discrepancy.

---

## Pre-Extracted Deadline Data by Role

### BHW — Barangay Health Worker

**FHSIS tier:** Community / Field Level
**Folder:** `project-link/docs/userflows/bhw/`
**Supervised by:** RHM / Midwife at the BHS

| Task | Form / Output | Frequency | Deadline |
|---|---|---|---|
| Household profiling (house-to-house visits) | HH Profile Form | Quarterly | Completed within the **first month of every quarter**; submitted to supervising Midwife by the **3rd week of January** (annual baseline) and equivalent first month of each succeeding quarter |
| Quarterly HH profile updates | Updated HH Profile Form | Quarterly | Updated within the **first month** of Q2, Q3, Q4 |

**Important:** BHW has **no direct submission to government tiers**. All BHW-captured data
flows upward through the supervising Midwife. The BHW's deadline obligation is to the
Midwife, not to the M/CHO or higher levels.

---

### RHM — Rural Health Midwife / Midwife

**FHSIS tier:** Barangay Health Station (BHS) Level
**Folder:** `project-link/docs/userflows/rhm/`
**Submits to:** M/CHO (Municipal / City Health Office)

| Report | Form | Frequency | Deadline |
|---|---|---|---|
| Monthly Program Accomplishment / Service Coverage | **M1** | Monthly | **Monday of the 1st week** of the succeeding month |
| Monthly Morbidity / Disease Report | **M2** | Monthly | **Monday of the 1st week** of the succeeding month |
| Annual Barangay Report (nutrition, deworming, infectious disease, demographics) | **Annual Form A-Barangay** | Annual | **Wednesday of the 1st week of January** of the succeeding year |

**Operational note:** M1 and M2 preparation requires a 4–5 working-day manual tally of all
TCL entries at the end of each month. In the Project LINK digital system, auto-aggregation
of validated records replaces this manual tally, but the submission deadlines remain the same.

---

### PHN — Public Health Nurse

**FHSIS tier:** Municipal / City Health Office (M/CHO) Level
**Folder:** `project-link/docs/userflows/phn/`
**Submits to:** PHO / CHO (Provincial / City Health Office) — or directly to DOH-CHD for HUCs

| Report | Form | Frequency | Deadline |
|---|---|---|---|
| City-wide Morbidity Report | **M2 Consolidated** | Monthly | **Friday of the 1st week** of the succeeding month |
| Quarterly Program Accomplishment / Service Coverage | **Q1** | Quarterly | **Wednesday of the 2nd week** of the 1st month of the succeeding quarter |
| Annual Report | **A1** | Annual | **Wednesday of the 2nd week of January** of the succeeding year |

**HUC note:** Dasmariñas City is a Highly Urbanized City (HUC). Q1 and A1 reports are
submitted **directly to DOH-CHD Region IV-A**, bypassing the PHO level.

**Prerequisite:** PHN cannot finalize Q1/A1 until all BHS M1/M2 submissions have been
received and the Monthly Consolidation Table (MCT) has been completed and validated.

---

### PHIS Coordinator — Public Health Information System Coordinator

**FHSIS tier:** Municipal / City Health Office (M/CHO) Level — data quality oversight
**Folder:** `project-link/docs/userflows/phis-coordinator/`
**Works alongside:** PHN; oversees data completeness and quality before city-level submission

The PHIS Coordinator does not independently submit FHSIS reports to higher tiers.
Their role is to ensure data quality and validate barangay reports before the PHN
finalizes city-level reports.

| Responsibility | Frequency | Timing |
|---|---|---|
| Validate barangay (BHS) M1/M2 data quality | Monthly | Before M2 Consolidated is submitted (i.e., before **Friday of the 1st week** of succeeding month) |
| Ensure completeness of quarterly barangay data | Quarterly | Before Q1 is submitted (i.e., before **Wednesday of the 2nd week** of 1st month of succeeding quarter) |
| Coordinate city-wide FHSIS reporting | Annual | Before A1 is submitted (i.e., before **Wednesday of the 2nd week of January**) |

**In Project LINK:** The PHIS Coordinator's data quality gate is enforced digitally. They
review and approve Summary Table exports before the PHN can submit Q1 or A1.

---

### ITR Workflow

**FHSIS tier:** Barangay Health Station (BHS) Level
**Folder:** `project-link/docs/userflows/itr/`

The ITR (Individual Treatment Record) is a recording tool managed by the RHM/Midwife.
It is not associated with a separate named FHSIS role. In Project LINK, the `itr` userflow
covers the RHM's ITR-specific operations: creating, updating, and linking ITR entries to
TCLs and the digital encounter record.

ITR entries have no independent submission deadlines — they feed into the RHM's M1/M2
through the TCL-to-Summary-Table pipeline. Apply the **RHM submission deadlines** for any
ITR-dependent reporting.

---

## Section Format to Add

For each role's userflow `.md`, append (or insert after the last `## ...` section) the
following section. Customize the content using the role-specific table above.

```markdown
## Reporting Deadlines

> **Source:** FHSIS Manual of Operations 2018, Table 2 (Chapter 2, p. 22–23) —
> DOH Department Memorandum 2024-0007.

### Reports Owned by This Role

| Report | Form | Frequency | Deadline |
|---|---|---|---|
| [report name] | [form code] | [frequency] | [deadline] |

### Deadline Notes

- [Role-specific notes, HUC exceptions, prerequisites, etc.]

### In Project LINK

- [How the digital system changes or preserves the deadline obligation]
- [Auto-generation, validation gates, or notifications relevant to this role]
```

---

## Execution Steps

1. **Read Table 2** from
   `project-link/docs/references/research/fhsis_mop/02_fhsis_system_overview.md`
   (offset ~700, limit ~200) to confirm deadlines before writing.

2. **Check each role's userflow folder** in `project-link/docs/userflows/`:
   - `bhw/bhw-userflow.md` — exists, append section
   - `rhm/` — folder exists but is empty; create `rhm-userflow.md` with the section
   - `phn/` — folder exists but is empty; create `phn-userflow.md` with the section
   - `phis-coordinator/` — folder exists but is empty; create `phis-coordinator-userflow.md`
   - `itr/` — folder exists but is empty; create `itr-userflow.md` with the section

3. **For `bhw/bhw-userflow.md`** (already has content):
   - Read the file first.
   - Check if a `## Reporting Deadlines` section already exists.
   - If not, append it at the end.
   - If it exists but is outdated, update it in-place using the Edit tool.

4. **For empty role folders** (rhm, phn, phis-coordinator, itr):
   - Create a minimal userflow `.md` with a header, a brief role description, and
     the `## Reporting Deadlines` section.
   - Use the BHW userflow as a structural reference for header and front matter style.

5. **Verify** each file was written correctly by reading it back.

---

## Minimal File Template for Empty Folders

Use this when no userflow file exists yet:

```markdown
# [ROLE NAME] User Flow — Project LINK (Validated Against FHSIS)

## Purpose

This document defines the user flow for the [Role] in Project LINK, validated against the
official FHSIS Manual of Operations (2018, DOH DM 2024-0007).

## Scope and Role Boundary

- Role: `[role-code]`
- FHSIS tier: [tier]
- Primary surface: [surface]
- Responsibility: [responsibility summary]

## Reporting Deadlines

> **Source:** FHSIS Manual of Operations 2018, Table 2 (Chapter 2, p. 22–23) —
> DOH Department Memorandum 2024-0007.

### Reports Owned by This Role

| Report | Form | Frequency | Deadline |
|---|---|---|---|
...

### Deadline Notes

...

### In Project LINK

...
```

---

## Compliance Reference

| Role | Key Deadline Type | Hardest Constraint |
|---|---|---|
| BHW | HH Profile submission to Midwife | 3rd week of January (annual); 1st month of each subsequent quarter |
| RHM | M1 + M2 to M/CHO | Monday, 1st week of succeeding month |
| PHN | Q1 to DOH-CHD (HUC) | Wednesday, 2nd week, 1st month of succeeding quarter |
| PHIS Coordinator | Internal data quality gate | Must clear before PHN can submit city reports |
| ITR workflow | Feeds into RHM M1/M2 | Same as RHM monthly deadline |
