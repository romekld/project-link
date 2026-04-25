# Machine Learning Strategy — Project LINK

> **Scope:** Disease outbreak prediction, patient risk scoring/identification, and optional prescriptive resource allocation.
> **Compliance:** FHSIS 2018 MOP (DOH DM 2024-0007), RA 10173, RA 11332.
> **Tech stack context:** Next.js 16 + FastAPI + Supabase.
>
> **Status Note:** This document is a draft planning reference only. Model choices and implementation details here are proposed, not final or official decisions, and require formal CHO/Project governance approval before adoption.

---

## 1. ML Use Cases

| Use Case | Type | Priority |
|:---|:---|:---|
| Disease Outbreak Prediction | Time-series forecasting + classification | Primary |
| Patient Risk Scoring / Identification | Multi-class classification | Primary |
| Prescriptive Resource Allocation | Clustering + optimization | Optional (future) |

---

## 2. Recommended Models by Use Case

### 2.1 Disease Outbreak Prediction

| Priority | Model | Rationale |
|:---|:---|:---|
| **1st** | **Prophet (Meta)** | Handles weekly/monthly FHSIS time-series natively. Built-in seasonality (dengue peaks, school calendars), holiday effects, and missing data tolerance. Best fit for sparse barangay-level case counts. |
| **2nd** | **XGBoost / LightGBM** | Tabular epidemiological features (prior case counts, vaccination rates, weather). Handles missing data, excellent benchmark performance on public health datasets. |
| **3rd** | **SARIMA** | Classic epidemiological baseline. Required in public health manuscripts as a comparison model. Works well with limited historical data. |
| **4th** | **LSTM** | If 3+ years of weekly FHSIS data per barangay is available. Superior for learning long-term epidemic cycles but data-hungry. |
| **5th** | **Random Forest Classifier** | Binary outbreak/no-outbreak flag. Interpretable via feature importance. Useful when explaining to CHO what features triggered an alert. |

> **Manuscript stack:** Prophet as primary + XGBoost as ensemble + SARIMA as baseline. This three-model structure is standard in DOH-Philippines aligned epidemiological studies.

---

### 2.2 Patient Risk Scoring / Identification

| Priority | Model | Rationale |
|:---|:---|:---|
| **1st** | **XGBoost** | State-of-the-art on tabular EHR/clinical data. Handles mixed types (BP, age, categorical comorbidities). SHAP integration for explainability — critical for clinical trust. |
| **2nd** | **Logistic Regression** | Clinically validated, interpretable, mirrors how DOH already defines risk thresholds (e.g., BP > 140/90 = hypertension, Framingham-style NCD scoring). Required baseline in health informatics papers. |
| **3rd** | **Random Forest** | Feature importance maps well to clinical reasoning. Effective for multi-class risk levels (Low / Moderate / High). |
| **4th** | **Decision Tree (CART)** | Produces a human-readable rule tree that CHOs and PHNs can verify. Important for regulatory and clinical credibility. |
| **5th** | **MLP (Neural Network)** | Only viable if dataset exceeds ~10,000 patient records. Overfits on smaller FHSIS-scale data without strong regularization. |

> **Manuscript stack:** Logistic Regression as baseline, XGBoost as primary, with SHAP explanations. Standard publishable pattern for health informatics journals.

---

### 2.3 Prescriptive Resource Allocation (Optional)

| Model | Application |
|:---|:---|
| **K-Means / DBSCAN Clustering** | Group barangays by disease burden + demographics → identify underserved clusters |
| **Linear Programming (PuLP / SciPy)** | Optimize BHW scheduling and medicine distribution under budget constraints |
| **Multi-Objective Optimization** | Balance equity (coverage) vs. efficiency (cost-per-case) across 32 BHS |
| **Reinforcement Learning (PPO/DQN)** | Long-term allocation policy learning — advanced, best positioned as future work |

---

## 3. Recommended Manuscript Model Summary

| Use Case | Proposed Model | Baseline | Explainability Method |
|:---|:---|:---|:---|
| Disease Outbreak Prediction | Prophet + XGBoost ensemble | SARIMA | Feature importance + forecast confidence intervals |
| Patient Risk Scoring | XGBoost | Logistic Regression | SHAP values |
| Resource Allocation (optional) | K-Means + Linear Programming | Rule-based CHO allocation | Cluster map visualization |

---

## 4. Tech Stack Requirements

### 4.1 FastAPI (`apps/api`) — ML Inference Layer

```text
Core ML:
  scikit-learn          # LR, RF, Decision Trees, preprocessing, cross-validation
  xgboost               # Primary predictive model
  lightgbm              # Alternative gradient booster
  prophet               # Time-series outbreak forecasting
  statsmodels           # SARIMA, statistical hypothesis testing
  tensorflow / pytorch  # LSTM (optional, only if data is sufficient)

Explainability:
  shap                  # SHAP values for clinical explainability

Data processing:
  pandas
  numpy
  imbalanced-learn      # SMOTE for class imbalance in outbreak detection

MLOps:
  mlflow                # Model versioning + experiment tracking
  joblib                # Model serialization (.pkl / .joblib)
  APScheduler           # Scheduled retraining cron jobs within FastAPI
```

### 4.2 FastAPI Endpoints

```
POST /api/v1/ml/risk-score          # Real-time patient risk score
POST /api/v1/ml/outbreak-forecast   # Disease outbreak prediction per barangay
GET  /api/v1/ml/risk-flags          # Batch high-risk patient list for a BHS
GET  /api/v1/ml/forecast/{disease}  # Weekly forecast for dashboard chart
POST /api/v1/ml/retrain             # Admin-triggered model retraining
```

### 4.3 Supabase — Data + Feature Store

New tables required:

```sql
-- Cached patient risk scores
ml_risk_scores (
  id, patient_id, score FLOAT, risk_level TEXT,  -- Low / Moderate / High
  model_version TEXT, computed_at TIMESTAMPTZ
)

-- Disease outbreak forecasts per barangay
ml_outbreak_forecasts (
  id, barangay_id, disease_code TEXT,  -- FHSIS indicator code e.g. IND-DNG
  forecast_date DATE, predicted_cases FLOAT,
  lower_bound FLOAT, upper_bound FLOAT,
  alert_flag BOOLEAN, model_version TEXT, created_at TIMESTAMPTZ
)

-- Model artifact registry
ml_model_registry (
  id, model_name TEXT, version TEXT, use_case TEXT,
  accuracy FLOAT, auc_roc FLOAT, trained_at TIMESTAMPTZ,
  artifact_path TEXT  -- path in Supabase Storage
)

-- Pre-aggregated features for retraining pipeline
ml_feature_snapshots (
  id, snapshot_date DATE, entity_type TEXT,  -- patient / barangay
  entity_id UUID, features JSONB, created_at TIMESTAMPTZ
)
```

Model artifacts (`.pkl`, `.joblib`) stored in Supabase Storage bucket: `ml-models/`.

### 4.4 Next.js (`apps/web`) — Presentation Layer

```text
- TanStack Query fetches /api/v1/ml/* endpoints
- MapLibre GL JS renders outbreak probability as a heat map layer over barangay boundaries
- Risk score badges on patient TCL records (extends existing high-risk flag pattern)
- Dashboard widgets: outbreak trend chart, high-risk patient count per BHS
- Supabase Realtime WebSocket triggers TanStack Query re-fetch when new forecast is computed
```

---

## 5. Datasets

### 5.1 Primary — Internal (FHSIS-Aligned, from Project LINK)

| Dataset | Source in System | FHSIS Form |
|:---|:---|:---|
| Disease case counts by barangay/week | TCL → ST → MCT pipeline (validated records) | M1 Individual Morbidity, M2 Summary Morbidity |
| Patient demographics + vitals | TCL-NCD, TCL-Maternal (age, sex, BP, BMI, LMP) | NCD and Maternal TCL |
| Vaccination coverage rates | Immunization TCL | EPI forms |
| Malnutrition data | Operation Timbang records | NNS form |
| Visit frequency / adherence | Visit logs per patient | All TCL types |

> All internal data flows through Project LINK's Zero-Tally architecture. The ML pipeline consumes `VALIDATED` records from Supabase directly — no separate ETL from paper.

### 5.2 Supplementary — External

| Dataset | Source | Use |
|:---|:---|:---|
| Population by barangay | PSA 2020 Census (Dasmariñas City) | Incidence rate normalization |
| Weather data (rainfall, temperature) | PAGASA / Open-Meteo API | Dengue, leptospirosis seasonal features |
| Historical PIDSR morbidity reports | DOH Epidemiology Bureau (2015–2023) | Pre-system baseline for SARIMA training |
| Barangay boundary shapefiles | GADM / PhilGIS | Spatial features for clustering |
| DOH disease alert thresholds | PIDSR Manual | Outbreak labeling ground truth |

---

## 6. Training Strategy

### 6.1 Disease Outbreak Prediction

```text
Step 1 — Data extraction
  Pull weekly case counts per barangay per disease from:
  - PIDSR historical reports (external baseline)
  - Project LINK validated ST/MCT records (system data)

Step 2 — Feature engineering
  - Lagged case counts: t-1, t-2, t-4 weeks
  - Month-of-year, week-of-year (seasonality encoding)
  - Rolling 4-week average
  - Rainfall / temperature from PAGASA/Open-Meteo
  - Vaccination coverage rate for the barangay
  - Population density (from PSA data)

Step 3 — Label creation
  - Use DOH PIDSR epidemic thresholds as ground truth
  - Binary label: 0 = normal, 1 = outbreak/alert

Step 4 — Temporal Cross-Validation (REQUIRED — never random split)
  - Walk-forward validation: train on years N to N+1, validate on year N+2
  - Prevents data leakage from future into training window

Step 5 — Class imbalance handling
  - SMOTE oversampling on minority (outbreak) class
  - Or class_weight="balanced" in XGBoost

Step 6 — Evaluation metrics (in order of priority)
  - Sensitivity/Recall — highest priority: missing an outbreak is worse than a false alarm
  - Specificity
  - AUC-ROC
  - F1-Score
  - MAE / RMSE for continuous case count prediction
```

### 6.2 Patient Risk Scoring

```text
Step 1 — Data extraction
  Pull validated TCL records from Supabase (VALIDATED status only)

Step 2 — Feature engineering
  - Age group (FHSIS standard bands: 0–<1, 1–4, 5–9, ..., 60+)
  - Sex
  - Latest systolic / diastolic BP + 3-reading trend
  - BMI (computed from height/weight in TCL)
  - Comorbidity flags (diabetes, hypertension history)
  - Visit adherence score (% of scheduled visits attended)
  - Pregnancy trimester (for maternal risk sub-model)

Step 3 — Label creation using DOH clinical thresholds
  - BP > 140/90 → hypertension stage (risk escalation)
  - BMI > 30 → obesity flag
  - High-risk pregnancy criteria from DOH MCH manual
  - Risk levels: Low / Moderate / High (3-class)

Step 4 — Stratified k-fold CV (5-fold, stratified by risk class)

Step 5 — SHAP value computation
  Required for clinical explainability — output must show which features
  drove the risk score for each patient

Step 6 — Evaluation metrics
  - AUC-ROC (per class)
  - Precision-Recall curve
  - Calibration curve (important for clinical probability scores)
  - Sensitivity / Specificity for High-risk class
```

### 6.3 Retraining Schedule

```text
- Monthly automated retraining triggered via APScheduler in FastAPI
- Retraining uses all VALIDATED records accumulated since last run
- New model version stored in ml_model_registry with performance metrics
- Model promoted to production only if AUC-ROC improves vs. current production model
- Previous model artifact retained in Supabase Storage for rollback
```

---

## 7. FHSIS 2018 MOP Compliance Alignment

| FHSIS Requirement | ML Alignment |
|:---|:---|
| **Category I diseases** (Dengue, Cholera, Measles, Typhoid, Meningococcemia) | Primary targets for outbreak prediction. Alert thresholds must match DOH PIDSR thresholds — not arbitrary model cutoffs. |
| **M1/M2 indicator codes** | Feature column names in the ML pipeline must map exactly to FHSIS indicator codes (e.g., `IND-DNG` for dengue). No renaming. |
| **Age-sex disaggregation** | Risk models must support age band features aligned with FHSIS standard bands. |
| **RA 10173 (Data Privacy)** | No PII in training data exports. Use `patient_id` (UUID) only — never names or addresses. Append-only audit logs for all ML predictions that affect patient records. |
| **RA 11332 (Notifiable Diseases)** | ML outbreak predictions above threshold must feed the `disease_alerts` insert + Supabase Realtime WebSocket broadcast — same pipeline as manual Category I case entry. |
| **DOH DM 2024-0007** | ML-generated risk flags must display alongside — and never replace — validated FHSIS clinical indicators on patient records. |

---

## 8. Integration Points with Existing Architecture

```text
disease_alerts table
  ← ML outbreak forecast (alert_flag = true) triggers insert
  ← Supabase Realtime broadcasts to CHO/PHN dashboard (ARIA live region)

patient TCL record view
  ← ml_risk_scores.risk_level displayed as persistent badge
  ← High-risk badge color-coded and survives list pagination (existing UX rule)

CHO analytics dashboard
  ← /api/v1/ml/forecast/{disease} feeds weekly trend chart
  ← MapLibre GL JS outbreak probability heat map layer over 32 barangays

BHS-scoped data access
  ← All ML feature extraction queries use RLS-enforced Supabase queries
  ← ML endpoints respect BHS scoping — never return cross-BHS data to RHM/BHW roles
```
