# Validation Queue — Admin / Workflow

**Role:** Midwife (RHM)
**Purpose:** Daily review and approval/return of BHW-submitted ITR encounter records. This is the Digital Validation Gate — BHW entries never go directly into FHSIS reports.
**FHSIS Reference:** FHSIS MOP 2018, Chapter 2 — Roles and Responsibilities (Midwife validates BHW-recorded data before consolidation)
**Who fills it:** Midwife performs the validation action (approve or return)
**Who reviews/approves it:** N/A — the midwife is the approver. Audit log captures all actions.
**Frequency:** Daily (as BHW submissions arrive)
**Storage location:** `encounters` table (`record_status` column); `audit_logs` table for action history

---

## Required Fields

These are the fields displayed to the midwife for each record in the queue. The midwife does not enter these — they are read from the BHW submission.

| Field Name | Data Type | Constraints / Validation Rules | Notes |
|:-----------|:----------|:-------------------------------|:------|
| `encounter_id` | UUID | System-generated. Read-only. | Unique identifier of the BHW-submitted record |
| `patient_first_name` | String | Read-only display | From `patients` table |
| `patient_last_name` | String | Read-only display | From `patients` table |
| `patient_id` | String | Read-only display | Unified patient ID |
| `service_category` | Enum | Read-only display | `General`, `Maternal`, `EPI`, `FP`, `Nutrition`, `NCD`, `TB-DOTS`, `Infectious Disease` |
| `date_of_visit` | Date | Read-only display | Date the BHW recorded the encounter |
| `submitted_by` | String | Read-only display | BHW user ID / name (FK to `user_profiles`) |
| `submission_timestamp` | Timestamp | Read-only display | When the record was synced/submitted |
| `record_status` | Enum | Must be `PENDING_VALIDATION` to appear in queue | Current status |
| `is_high_risk` | Boolean | Read-only display | If true, display prominent high-risk badge |
| `high_risk_reason` | String | Read-only display | Auto-populated reason for the flag |

### Validation Action Fields (Midwife enters)

| Field Name | Data Type | Constraints / Validation Rules | Notes |
|:-----------|:----------|:-------------------------------|:------|
| `validation_action` | Enum | Required. `APPROVE` or `RETURN` | The midwife's decision |
| `return_reason` | Text | Required if `validation_action = RETURN`. Min 10 characters. | Free-text explanation sent back to BHW |
| `validated_by` | UUID | System-populated from session | Midwife user ID |
| `validated_at` | Timestamp | System-generated | Timestamp of the action |

---

## Optional / Conditional Fields

| Field Name | Data Type | Condition for Display | Notes |
|:-----------|:----------|:----------------------|:------|
| `return_reason` | Text | Only shown when `RETURN` is selected | Required when returning a record |
| `patient_history_context` | JSON/View | Always available via expand/drill-down | Prior visits for the same program — helps midwife assess correctness |

---

## Enums / Controlled Vocabularies

| Enum | Values |
|:-----|:-------|
| `validation_action` | `APPROVE`, `RETURN` |
| `record_status` (post-action) | `VALIDATED` (if approved), `RETURNED` (if returned) |
| `service_category` | `General`, `Maternal`, `EPI`, `FP`, `Nutrition`, `NCD`, `TB-DOTS`, `Infectious Disease` |

---

## UX / Clinical Safety Concerns

- **Approve and Return buttons must be visually separated** — never adjacent without clear spacing or color distinction. Approve = primary/green action. Return = secondary/amber action.
- **Explicit confirmation on state change** — both Approve and Return require a confirmation dialog before executing. "Are you sure you want to approve this record?" / "Are you sure you want to return this record?"
- **Return requires reason** — the text field must be non-empty (min 10 chars) before the Return action can be confirmed. The reason is sent as a notification to the BHW.
- **High-risk flag prominently displayed** — if the record has `is_high_risk = true`, the high-risk badge and reason must be visible at the top of the record detail view, not buried in fields.
- **Patient history context** — show prior visits for the same program (e.g., last 3 ANC visits for a maternal record) so the midwife can verify continuity.
- **Queue sorting** — default sort: submission date (oldest first), then by service type. Provide filters for service type, date range, and risk status.
- **Pending count badge** — dashboard must show a count badge for `PENDING_VALIDATION` records.
- **Keyboard navigation** — the validation queue is a desktop-heavy workflow. Support keyboard navigation: arrow keys to move between records, Enter to open, hotkeys for Approve (Ctrl+A?) and Return (Ctrl+R?).
- **Audit trail** — every validation action creates an `audit_logs` entry with the action, actor, timestamp, and (for returns) the reason. No PII in audit logs.

---

## Database Schema Notes

- **Table:** `encounters` — the `record_status` column transitions from `PENDING_VALIDATION` to `VALIDATED` or `RETURNED`.
- **Audit log:** INSERT into `audit_logs` on every validation action. Fields: `action` (APPROVE/RETURN), `actor_id`, `target_encounter_id`, `reason` (for RETURN only), `timestamp`.
- **Index:** `encounters(health_station_id, record_status)` — for fast queue queries filtering by BHS and pending status.
- **Soft delete:** N/A for validation actions themselves, but the underlying encounter records follow the `deleted_at` soft-delete rule.
- **RLS:** Midwife can only see/validate encounters where `health_station_id` matches her JWT claim.
- **Notification:** On RETURN, insert a notification record for the BHW (or use Supabase Realtime to push the return reason to the BHW's session).
- **TCL auto-update:** On APPROVE (`VALIDATED`), the corresponding TCL row is automatically updated by the auto-tally engine.
