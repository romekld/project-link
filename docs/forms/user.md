# Project LINK — Form Reference

This document provides a technical specification for all data entry forms within Project LINK, ensuring alignment between frontend interfaces, database schemas, and health reporting standards (FHSIS/PIDSR).

---

## 1. System User Creation (Staff)

This form is used by the **System Administrator** to provision and manage staff accounts.

| Category | Field Name | Data Type | Constraint / Standard |
| :--- | :--- | :--- | :--- |
| **Identity** | Full Name | String | Format: **Last, First, Middle** (Matches Gov ID) |
| | Date of Birth | Date | Required for age verification and legal liability. |
| | Sex | Enum | **Male / Female** (DOH/FHSIS Standard). |
| **Contact** | Official Email | String | Unique; used for OTP and system alerts. |
| | Mobile Number | String | Format: **+639XXXXXXXXX** |
| **Security** | Username | String | Unique slug (e.g., `s.redona_kld`). |
| | Initial Password | String | Bcrypt/Argon2 hashing; Min 12 chars. |
| | System Role | Dropdown | Admin, Health Officer, Nurse, Midwife, BHW. |
| **Scoping** | BHS Assignment | Reference | Required for BHW and Midwife roles. |
| **Management** | Account Status | Boolean | **Active / Inactive** (Toggle). |

