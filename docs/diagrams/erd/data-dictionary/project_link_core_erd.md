# Project LINK Core ERD Data Dictionary

Source: `project_link_core_erd`  
Database: PostgreSQL  
Scope: Core tables mapped to DFD datastores D1-D7

## Core Tables

### user_profiles
System user account and role assignment.

| Attribute | Data Type | Description | Key Type |
|---|---|---|---|
| id | uuid | Unique user identifier. | PK, NN |
| email | varchar(255) | User email address. | UK, NN |
| role | user_role | Assigned system role. | NN |
| full_name | varchar(150) | Display name of the user. | NN |
| phone | varchar(30) | Contact number. | NULL |
| bhs_code | varchar(20) | Assigned BHS code, if any. | NULL |
| is_active | boolean | Active login flag. | NN, default true |
| created_at | timestamptz | Row creation timestamp. | NN, default now() |
| updated_at | timestamptz | Last update timestamp. | NN, default now() |
| deleted_at | timestamptz | Soft delete timestamp. | NULL |

### resident_profiles
Master resident identity and residence record.

| Attribute | Data Type | Description | Key Type |
|---|---|---|---|
| id | uuid | Unique resident identifier. | PK, NN |
| household_code | varchar(40) | Household grouping code. | NN |
| resident_code | varchar(40) | Unique resident code. | UK, NN |
| last_name | varchar(100) | Resident surname. | NN |
| first_name | varchar(100) | Resident given name. | NN |
| middle_name | varchar(100) | Resident middle name. | NULL |
| sex | sex | Recorded sex. | NN |
| birth_date | date | Date of birth. | NN |
| address_line1 | varchar(255) | Primary address line. | NN |
| barangay_code | varchar(20) | Barangay code for residence. | NN |
| city_municipality | varchar(120) | City or municipality name. | NN, default 'Dasmarinas' |
| province | varchar(120) | Province name. | NN, default 'Cavite' |
| latitude | numeric(10,7) | Latitude coordinate. | NULL |
| longitude | numeric(10,7) | Longitude coordinate. | NULL |
| geo_location | geography(Point,4326) | GIS point location. | NULL |
| residency_validated | boolean | Residency verification flag. | NN, default false |
| residency_validated_at | timestamptz | Residency validation timestamp. | NULL |
| residency_validated_by | uuid | User who validated residency. | FK -> user_profiles.id, NULL |
| created_by | uuid | User who created the record. | FK -> user_profiles.id, NULL |
| created_at | timestamptz | Row creation timestamp. | NN, default now() |
| updated_at | timestamptz | Last update timestamp. | NN, default now() |
| deleted_at | timestamptz | Soft delete timestamp. | NULL |

### patients
Patient profile linked to a resident record.

| Attribute | Data Type | Description | Key Type |
|---|---|---|---|
| id | uuid | Unique patient identifier. | PK, NN |
| resident_profile_id | uuid | Linked resident profile. | FK -> resident_profiles.id, UK, NN |
| patient_code | varchar(40) | Unique patient code. | UK, NN |
| philhealth_no | varchar(30) | PhilHealth number. | NULL |
| blood_type | varchar(5) | Blood type. | NULL |
| chronic_conditions | text | Known chronic conditions. | NULL |
| is_high_risk | boolean | High-risk flag. | NN, default false |
| patient_status | patient_status | Patient lifecycle state. | NN, default active |
| last_visit_date | date | Most recent visit date. | NULL |
| assigned_rhm_user_id | uuid | Assigned rural health midwife. | FK -> user_profiles.id, NULL |
| created_at | timestamptz | Row creation timestamp. | NN, default now() |
| updated_at | timestamptz | Last update timestamp. | NN, default now() |
| deleted_at | timestamptz | Soft delete timestamp. | NULL |

### health_program_records
Clinical encounter and program service record.

| Attribute | Data Type | Description | Key Type |
|---|---|---|---|
| id | uuid | Unique program record identifier. | PK, NN |
| patient_id | uuid | Linked patient. | FK -> patients.id, NN |
| program_code | varchar(30) | Program or service code. | NN |
| encounter_date | date | Date of service encounter. | NN |
| diagnosis_code | varchar(20) | Diagnosis code, if available. | NULL |
| diagnosis_text | text | Diagnosis description. | NULL |
| service_provided | text | Service rendered. | NULL |
| follow_up_date | date | Planned follow-up date. | NULL |
| record_status | record_status | Record validation state. | NN, default pending_validation |
| clinical_payload | jsonb | Additional structured clinical data. | NULL |
| validated_by | uuid | User who validated the record. | FK -> user_profiles.id, NULL |
| validated_at | timestamptz | Validation timestamp. | NULL |
| created_by | uuid | User who created the record. | FK -> user_profiles.id, NN |
| created_at | timestamptz | Row creation timestamp. | NN, default now() |
| updated_at | timestamptz | Last update timestamp. | NN, default now() |
| deleted_at | timestamptz | Soft delete timestamp. | NULL |

### inventory
Inventory movement and stock tracking record.

| Attribute | Data Type | Description | Key Type |
|---|---|---|---|
| id | uuid | Unique inventory transaction identifier. | PK, NN |
| bhs_code | varchar(20) | BHS inventory owner code. | NN |
| item_code | varchar(40) | Item identifier. | NN |
| item_name | varchar(150) | Item name. | NN |
| unit | varchar(30) | Stock unit of measure. | NN |
| quantity_on_hand | numeric(12,2) | Current stock balance. | NN, default 0 |
| reorder_level | numeric(12,2) | Minimum stock threshold. | NN, default 0 |
| expiry_date | date | Item expiry date. | NULL |
| batch_no | varchar(50) | Batch or lot number. | NULL |
| txn_type | inventory_txn_type | Type of inventory movement. | NN |
| txn_qty | numeric(12,2) | Quantity moved in the transaction. | NN, default 0 |
| txn_reference | varchar(80) | External or internal transaction reference. | NULL |
| txn_at | timestamptz | Transaction timestamp. | NN, default now() |
| updated_by | uuid | User who last updated the row. | FK -> user_profiles.id, NULL |
| created_at | timestamptz | Row creation timestamp. | NN, default now() |
| updated_at | timestamptz | Last update timestamp. | NN, default now() |
| deleted_at | timestamptz | Soft delete timestamp. | NULL |

### bhs_records
BHS-level monthly or periodic summary report.

| Attribute | Data Type | Description | Key Type |
|---|---|---|---|
| id | uuid | Unique BHS report identifier. | PK, NN |
| bhs_code | varchar(20) | Reporting BHS code. | NN |
| reporting_year | int | Reporting year. | NN |
| reporting_month | int | Reporting month. | NN |
| report_type | report_type | Report period classification. | NN, default monthly |
| report_status | report_status | Report workflow state. | NN, default draft |
| total_patients | int | Total patients counted. | NN, default 0 |
| total_validated_encounters | int | Total validated encounters counted. | NN, default 0 |
| total_high_risk_patients | int | Total high-risk patients counted. | NN, default 0 |
| report_payload | jsonb | Report details and breakdown data. | NULL |
| generated_by | uuid | User who generated the report. | FK -> user_profiles.id, NN |
| submitted_by | uuid | User who submitted the report. | FK -> user_profiles.id, NULL |
| submitted_at | timestamptz | Submission timestamp. | NULL |
| approved_by | uuid | User who approved the report. | FK -> user_profiles.id, NULL |
| approved_at | timestamptz | Approval timestamp. | NULL |
| created_at | timestamptz | Row creation timestamp. | NN, default now() |
| updated_at | timestamptz | Last update timestamp. | NN, default now() |
| deleted_at | timestamptz | Soft delete timestamp. | NULL |

### city_health_records
City-level consolidation report across all BHS submissions.

| Attribute | Data Type | Description | Key Type |
|---|---|---|---|
| id | uuid | Unique city report identifier. | PK, NN |
| consolidation_year | int | Consolidation year. | NN |
| consolidation_month | int | Consolidation month. | NN |
| report_type | report_type | Report period classification. | NN, default monthly |
| report_status | report_status | Report workflow state. | NN, default draft |
| total_bhs_submissions | int | Number of BHS reports included. | NN, default 0 |
| total_city_patients | int | Total patients in the city-wide total. | NN, default 0 |
| total_city_encounters | int | Total city-wide encounters. | NN, default 0 |
| total_city_high_risk | int | Total city-wide high-risk patients. | NN, default 0 |
| analytics_payload | jsonb | Consolidated analytics details. | NULL |
| consolidated_by | uuid | User who consolidated the report. | FK -> user_profiles.id, NN |
| consolidated_at | timestamptz | Consolidation timestamp. | NULL |
| exported_by | uuid | User who exported the report. | FK -> user_profiles.id, NULL |
| exported_at | timestamptz | Export timestamp. | NULL |
| created_at | timestamptz | Row creation timestamp. | NN, default now() |
| updated_at | timestamptz | Last update timestamp. | NN, default now() |
| deleted_at | timestamptz | Soft delete timestamp. | NULL |

## Notes

- Soft deletes are represented by `deleted_at` on every table.
- Foreign keys shown here follow the explicit ERD references provided.
- `geo_location` uses PostGIS geography with SRID 4326.