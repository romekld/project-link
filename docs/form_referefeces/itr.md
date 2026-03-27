# ITR Form Fields Reference (Revised Phase 1)

This document defines the standard data fields for Project LINK, ensuring alignment with DOH FHSIS 2024/2026 standards, Data Privacy Act (DPA) 2012, and HL7 FHIR compatibility.

## 1. Core Patient Registration (Demographics)

Captured once during initial enrollment; stored in the `patients` table.

| Field Name | Technical Data Type | Validation / Pattern |
| :--- | :--- | :--- |
| **Unique Patient ID** | String | Facility Code + Year + Serial (e.g., `KLD-2026-0001`) |
| **PhilHealth ID (PIN)** | Numeric (12) | Optional; Use `00-000000000-0` if Non-Member |
| **Last Name** | String | Required; Uppercase preferred |
| **First Name** | String | Required; Uppercase preferred |
| **Middle Name** | String | Use `N/A` if not applicable |
| **Suffix** | String | Jr., Sr., III, etc. |
| **Sex at Birth** | Enum | Male, Female |
| **Date of Birth** | Date | `YYYY-MM-DD` |
| **Civil Status** | Enum | Single, Married, Widow/er, Separated, Co-habiting |
| **Barangay** | String | e.g., Burol II, Salitran I |
| **Purok / Sub-Zone** | String | Required for GIS (Purok 1-7, Phase, or Sitio) |
| **Street / House No.** | String | Specific residence identifier |
| **Socio-Economic** | Boolean | NHTS-PR, 4Ps, Indigenous Person (IP) |

---

## 2. Clinical Encounter Data (The ITR Entry)

Captured every visit; stored in the `encounters` table linked to Patient ID.

### A. Administrative Metadata (System Generated)

| Field Name | Technical Data Type | Description |
| :--- | :--- | :--- |
| **Encounter ID** | UUID | Unique identifier for the specific visit |
| **Date & Time** | DateTime | ISO 8601 Timestamp |
| **Provider ID** | String | BHW/Midwife unique ID or License No. |
| **Facility Code** | String | DOH-standard Health Facility Code |

### B. Physical Vitals & Classification

| Field Name | Technical Data Type | Validation / Pattern |
| :--- | :--- | :--- |
| **Weight** | Decimal | Value in Kilograms (kg) |
| **Height** | Decimal | Value in Centimeters (cm) |
| **BP (Systolic)** | Integer | e.g., 120 |
| **BP (Diastolic)** | Integer | e.g., 80 |
| **Temperature** | Decimal | Value in Celsius (°C) |
| **BMI** | Decimal | Auto-calculated: $kg / (cm/100)^2$ |
| **Program Category** | Enum | General, Maternal, EPI, FP, Nutrition, NCD, TB |

### C. Clinical Notes & Legal

| Field Name | Technical Data Type | Validation / Pattern |
| :--- | :--- | :--- |
| **Consultation Type** | Enum | New Consultation vs. Follow-up |
| **Chief Complaint** | Text | Reason for visit (Free text) |
| **Clinical Notes** | Text | Physical Exam observations |
| **Diagnosis** | String | Generic text (Phase 1); ICD-10 Code (Phase 2) |
| **Consent Flag** | Boolean | Mandatory: DPA 2012 Patient Consent |