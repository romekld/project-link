# Context Diagram (Level 0 DFD) — Project LINK

> System boundary view. Shows all external actors and the data flows
> crossing into and out of the system as a whole.
> Last updated: 2026-04-26

---

## Diagram

```mermaid
---
config:
  theme: base
  themeVariables:
    primaryColor: "#f5f5f5"
    lineColor: "#555555"
    fontSize: "13px"
---
flowchart TD

    %% ── EXTERNAL ENTITIES ─────────────────────────────────
    BHW["BHW
    Barangay Health Worker"]

    RHM["RHM
    Rural Health Midwife"]

    PHN["PHN
    Public Health Nurse"]

    CHO_USER["CHO
    City Health Officer"]

    DSO["DSO / PHIS
    Disease Surveillance Officer"]

    DOH["DOH
    E-Tools Portal"]

    %% ── SYSTEM BOUNDARY ───────────────────────────────────
    SYSTEM(("PROJECT LINK
    Health Station
    Management System"))

    %% ── FLOWS INTO SYSTEM ─────────────────────────────────
    BHW     -->|"Household & Patient Data"| SYSTEM
    BHW     -->|"Field Visit & TCL Entries"| SYSTEM

    RHM     -->|"Validated Patient Records"| SYSTEM
    RHM     -->|"Validated TCL / ITR Entries"| SYSTEM
    RHM     -->|"Summary Table Submission"| SYSTEM
    RHM     -->|"Stock Transaction Records"| SYSTEM

    PHN     -->|"MCT Consolidation Request"| SYSTEM

    CHO_USER -->|"MCT Approval / Return"| SYSTEM

    %% ── FLOWS OUT OF SYSTEM ───────────────────────────────
    SYSTEM  -->|"Defaulter Alerts & Follow-up List"| BHW

    SYSTEM  -->|"Draft Summary Table for Review"| RHM

    SYSTEM  -->|"Pending BHS Summary Tables"| PHN

    SYSTEM  -->|"MCT & M1/M2 Reports"| CHO_USER
    SYSTEM  -->|"Real-time Disease Alerts"| CHO_USER
    SYSTEM  -->|"Outbreak Forecasts & Risk Flags"| CHO_USER

    SYSTEM  -->|"Category I Disease Alerts (RA 11332)"| DSO

    SYSTEM  -->|"M1/M2 Report Submission"| DOH

    %% ── STYLING ───────────────────────────────────────────
    classDef external fill:#dae8fc,stroke:#6c8ebf,stroke-width:2px,color:#000,font-weight:bold
    classDef system   fill:#d5e8d4,stroke:#82b366,stroke-width:3px,color:#000,font-weight:bold

    class BHW,RHM,PHN,CHO_USER,DSO,DOH external
    class SYSTEM system
```

---

## External Entities

| Entity | Role | Data Provided to System | Data Received from System |
|---|---|---|---|
| **BHW** | Barangay Health Worker | Household profiles, patient data, field visit records | Defaulter alerts, follow-up lists |
| **RHM** | Rural Health Midwife | Validated TCL/ITR entries, Summary Table, stock transactions | Draft ST for review |
| **PHN** | Public Health Nurse | MCT consolidation request | Pending BHS Summary Tables |
| **CHO** | City Health Officer | MCT approval or return decision | MCT, M1/M2 reports, disease alerts, ML forecasts |
| **DSO / PHIS** | Disease Surveillance Officer | — (receives only) | Category I disease alerts (RA 11332) |
| **DOH** | Department of Health — E-Tools | — (receives only) | M1/M2 monthly report submissions |

---

## Notes

- The system boundary encompasses all digital processes: patient registration,
  health program documentation, disease surveillance, report generation,
  supply chain management, and predictive analytics.
- BHW operates **offline-first** via PWA (IndexedDB). Data enters the system
  boundary when synced to the central server.
- All flows crossing the boundary are accounted for in the Level 1 DFD.
  See [`level1-dfd.md`](level1-dfd.md) for the decomposed view.
