# Technical Requirements Document (TRD)
## Maliba AI Governance Platform — Prototype
### Version 1.0 | The Open Group INITIATE 2026 — Team Trident

---

## 1. Document Overview

| Field | Details |
|---|---|
| Product Name | Maliba AI Governance Platform (MAGP) |
| Document Type | Technical Requirements Document (TRD) |
| Version | 1.0 — Prototype |
| IDE | Antigravity |
| Primary Stack | React (Frontend) + Python FastAPI (Backend) + SQLite (Data) |
| Deployment | Single-server, self-hosted, open-source only |
| Last Updated | June 2026 |

---

## 2. System Architecture Overview

```
┌────────────────────────────────────────────────────────────────┐
│                     BROWSER (React SPA)                        │
│  Vendor Portal │ Ministry Dashboard │ Registry │ Audit Viewer  │
└───────────────────────────┬────────────────────────────────────┘
                            │ HTTPS / REST API
┌───────────────────────────▼────────────────────────────────────┐
│                   FastAPI Application Server                    │
│                                                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  Submission  │  │  Bias Check  │  │   Policy Evaluator   │  │
│  │   Service    │  │   Service    │  │   (OPA-equivalent)   │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘  │
│         │                 │                      │              │
│  ┌──────▼─────────────────▼──────────────────────▼───────────┐  │
│  │                Audit Log Service                          │  │
│  │        (Hash-Chained Append-Only Store)                   │  │
│  └──────────────────────────┬────────────────────────────────┘  │
│                             │                                  │
│  ┌──────────────────────────▼────────────────────────────────┐  │
│  │                    SQLite Database                         │  │
│  │  submissions │ bias_results │ policy_results │ audit_log  │  │
│  │  registry    │ documents    │ notifications  │ users      │  │
│  └────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

---

## 3. Technology Stack

### 3.1 Frontend

| Component | Technology | Version | Justification |
|---|---|---|---|
| UI Framework | React | 18.x | Industry standard, large open-source ecosystem |
| Build Tool | Vite | 5.x | Fast dev server, lightweight bundle |
| Routing | React Router | 6.x | SPA navigation |
| State Management | Zustand | 4.x | Lightweight alternative to Redux; minimal boilerplate |
| UI Component Library | shadcn/ui + Tailwind CSS | Latest | Clean, accessible, composable; no licensing fees |
| Data Visualization | Recharts | 2.x | Open-source, React-native chart library |
| Form Management | React Hook Form + Zod | Latest | Type-safe form validation |
| HTTP Client | Axios | 1.x | Promise-based HTTP with interceptors |
| Icons | Lucide React | Latest | Open-source icon set |
| Notifications/Toast | Sonner | Latest | Lightweight toast library |

### 3.2 Backend

| Component | Technology | Version | Justification |
|---|---|---|---|
| API Framework | Python FastAPI | 0.111.x | Async, auto-generates OpenAPI docs, minimal overhead |
| ASGI Server | Uvicorn | 0.29.x | Production-grade ASGI server |
| Data Validation | Pydantic v2 | 2.x | Type-safe request/response models |
| ORM | SQLAlchemy | 2.x | Mature, open-source ORM |
| Database | SQLite | 3.x | Zero-config, file-based; suitable for LMIC single-server |
| Bias Detection | Fairlearn | 0.10.x | Microsoft open-source fairness library |
| ML Support | scikit-learn | 1.4.x | Required by Fairlearn; standard ML utilities |
| Data Manipulation | pandas + numpy | Latest stable | Standard data science stack |
| Cryptography (audit log) | Python hashlib (stdlib) | — | SHA-256 hash chaining; no external dependency |
| Authentication | python-jose + passlib | Latest | JWT-based auth; bcrypt password hashing |
| File Handling | python-multipart | Latest | Multipart form/file upload support |
| Task Queue | FastAPI BackgroundTasks | Built-in | Lightweight async task runner for bias checks |
| CORS | FastAPI CORSMiddleware | Built-in | Cross-origin support for React dev server |

### 3.3 Development Tools

| Tool | Purpose |
|---|---|
| Antigravity IDE | Primary development environment |
| ESLint + Prettier | Frontend code quality |
| Black + Ruff | Python code formatting and linting |
| pytest | Backend unit and integration testing |
| Vitest | Frontend unit testing |

---

## 4. Database Schema

### 4.1 Core Tables

```sql
-- Users and roles
CREATE TABLE users (
    id TEXT PRIMARY KEY,                    -- UUID
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL,                     -- 'ministry_reviewer' | 'vendor' | 'admin'
    organization TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- AI System Registry (master record per AI system)
CREATE TABLE ai_systems (
    id TEXT PRIMARY KEY,                    -- UUID
    submission_id TEXT UNIQUE NOT NULL,     -- Human-readable e.g. "SUB-2026-0042"
    system_name TEXT NOT NULL,
    system_version TEXT NOT NULL,
    vendor_id TEXT NOT NULL REFERENCES users(id),
    intended_use_case TEXT NOT NULL,
    risk_classification TEXT NOT NULL,      -- 'HIGH' | 'MEDIUM' | 'LOW'
    target_population TEXT NOT NULL,
    developer_organization TEXT NOT NULL,
    deployment_timeline TEXT,
    training_data_documentation TEXT,
    local_validation_evidence TEXT,
    override_mechanism_documented BOOLEAN DEFAULT FALSE,
    lifecycle_status TEXT DEFAULT 'PENDING_REVIEW',
    -- 'PENDING_REVIEW' | 'BIAS_CHECK_RUNNING' | 'POLICY_EVALUATION_RUNNING'
    -- | 'SHADOW_MODE' | 'CANARY_MODE' | 'PRODUCTION' | 'SUSPENDED' | 'EXPIRED' | 'REJECTED'
    shadow_mode_approved_at TIMESTAMP,
    canary_mode_approved_at TIMESTAMP,
    production_approved_at TIMESTAMP,
    suspended_at TIMESTAMP,
    suspension_reason TEXT,
    registration_expires_at TIMESTAMP,      -- Annual re-registration deadline
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Legal Documents (CBA and SCC)
CREATE TABLE legal_documents (
    id TEXT PRIMARY KEY,
    system_id TEXT NOT NULL REFERENCES ai_systems(id),
    document_type TEXT NOT NULL,            -- 'CBA' | 'SCC'
    status TEXT NOT NULL,                   -- 'SIGNED' | 'PENDING' | 'NOT_APPLICABLE' | 'MISSING'
    file_path TEXT,                         -- Local storage path
    file_name TEXT,
    uploaded_at TIMESTAMP,
    technology_transfer_obligation_present BOOLEAN DEFAULT FALSE,
    notes TEXT
);

-- Explainability Artifacts (LIME/SHAP)
CREATE TABLE explainability_artifacts (
    id TEXT PRIMARY KEY,
    system_id TEXT NOT NULL REFERENCES ai_systems(id),
    artifact_type TEXT NOT NULL,            -- 'LIME' | 'SHAP' | 'OTHER'
    file_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    artifact_date DATE NOT NULL,            -- Date the artifact was generated
    is_current BOOLEAN DEFAULT TRUE         -- FALSE if superseded by newer artifact
);

-- Bias Check Results
CREATE TABLE bias_check_results (
    id TEXT PRIMARY KEY,
    system_id TEXT NOT NULL REFERENCES ai_systems(id),
    check_run_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    overall_status TEXT NOT NULL,           -- 'PASS' | 'FAIL'
    -- Subgroup results stored as JSON
    subgroup_results JSON NOT NULL,
    -- Aggregate metrics
    min_disparate_impact_ratio REAL,
    max_equalized_odds_difference REAL,
    max_demographic_parity_difference REAL,
    failed_subgroups JSON,                  -- Array of failing subgroup names
    human_readable_summary TEXT NOT NULL,
    full_report_json JSON NOT NULL
);

-- Policy Evaluation Results
CREATE TABLE policy_evaluation_results (
    id TEXT PRIMARY KEY,
    system_id TEXT NOT NULL REFERENCES ai_systems(id),
    bias_check_id TEXT REFERENCES bias_check_results(id),
    evaluated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    overall_verdict TEXT NOT NULL,          -- 'PASS' | 'CONDITIONAL_PASS' | 'FAIL'
    policy_version TEXT NOT NULL DEFAULT '1.0',
    -- Per-rule results stored as JSON array
    rule_results JSON NOT NULL,
    failed_critical_rules JSON,             -- Array of critical rule IDs that failed
    failed_non_critical_rules JSON,         -- Array of non-critical rule IDs that failed
    remediation_guidance TEXT,
    reviewed_by TEXT REFERENCES users(id),  -- If HTA manual review happened
    review_notes TEXT
);

-- Immutable Audit Log (append-only; no UPDATE or DELETE ever issued on this table)
CREATE TABLE audit_log (
    id TEXT PRIMARY KEY,                    -- UUID
    sequence_number INTEGER UNIQUE NOT NULL, -- Monotonically increasing
    event_type TEXT NOT NULL,
    -- 'SUBMISSION_RECEIVED' | 'BIAS_CHECK_STARTED' | 'BIAS_CHECK_COMPLETED'
    -- | 'POLICY_EVALUATION_COMPLETED' | 'STATUS_CHANGED' | 'DOCUMENT_UPLOADED'
    -- | 'HTA_OVERRIDE' | 'REREGISTRATION_SUBMITTED' | 'SYSTEM_EXPIRED'
    -- | 'HASH_CHAIN_VERIFIED' | 'SYSTEM_SUSPENDED' | 'SYSTEM_PROMOTED'
    system_id TEXT REFERENCES ai_systems(id),
    actor_id TEXT REFERENCES users(id),     -- Who triggered the event (NULL for automated)
    actor_type TEXT NOT NULL,               -- 'VENDOR' | 'MINISTRY' | 'SYSTEM' | 'ADMIN'
    event_data JSON NOT NULL,               -- Full event payload
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    entry_hash TEXT NOT NULL,               -- SHA-256(sequence + event_type + system_id + event_data + timestamp + prev_hash)
    previous_hash TEXT NOT NULL             -- Hash of the (sequence_number - 1) entry; genesis entry uses '0'*64
);

-- Notifications
CREATE TABLE notifications (
    id TEXT PRIMARY KEY,
    recipient_id TEXT REFERENCES users(id),
    recipient_role TEXT,                    -- Broadcast to role if no specific recipient
    notification_type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    system_id TEXT REFERENCES ai_systems(id),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP
);
```

### 4.2 Indexes

```sql
CREATE INDEX idx_ai_systems_lifecycle_status ON ai_systems(lifecycle_status);
CREATE INDEX idx_ai_systems_vendor ON ai_systems(vendor_id);
CREATE INDEX idx_audit_log_sequence ON audit_log(sequence_number);
CREATE INDEX idx_audit_log_system ON audit_log(system_id);
CREATE INDEX idx_audit_log_timestamp ON audit_log(timestamp);
CREATE INDEX idx_notifications_recipient ON notifications(recipient_id, is_read);
CREATE INDEX idx_bias_results_system ON bias_check_results(system_id);
CREATE INDEX idx_policy_results_system ON policy_evaluation_results(system_id);
```

---

## 5. API Specification

Base URL: `/api/v1`

### 5.1 Authentication

```
POST   /auth/login                  → { access_token, token_type, user }
POST   /auth/register               → { user_id, message }   [Admin only for Ministry users]
POST   /auth/logout                 → { message }
GET    /auth/me                     → { user }
```

### 5.2 Submissions

```
POST   /submissions                 → Submit new AI system for registration
GET    /submissions                 → List all submissions [Ministry only]
GET    /submissions/{id}            → Get submission details
PATCH  /submissions/{id}/status     → Update lifecycle status [Ministry only]
POST   /submissions/{id}/documents  → Upload CBA/SCC/Explainability documents
GET    /submissions/{id}/documents  → List uploaded documents
```

### 5.3 Bias Check

```
POST   /bias-check/{system_id}/run  → Trigger bias check [auto-called after submission]
GET    /bias-check/{system_id}      → Get latest bias check result
GET    /bias-check/{system_id}/history → Get all historical bias check runs
```

### 5.4 Policy Evaluation

```
POST   /policy/{system_id}/evaluate → Trigger policy evaluation [auto-called after bias check]
GET    /policy/{system_id}          → Get latest policy evaluation result
GET    /policy/{system_id}/rules    → Get full rule-by-rule breakdown
GET    /policy/rules                → Get all policy rules and current thresholds [Ministry only]
PATCH  /policy/thresholds           → Update threshold values [Admin only]
```

### 5.5 Registry / Dashboard

```
GET    /registry                    → Get all registered AI systems (with filters)
GET    /registry/{system_id}        → Get full system record with all checks
GET    /registry/stats              → Dashboard summary statistics
GET    /registry/expiring           → Systems expiring within N days
POST   /registry/{system_id}/promote    → Promote lifecycle stage [Ministry only]
POST   /registry/{system_id}/suspend    → Suspend system [Ministry only]
POST   /registry/{system_id}/reactivate → Reactivate suspended system [Ministry only]
```

### 5.6 Audit Log

```
GET    /audit                       → Get paginated audit log (filters: system_id, event_type, date range)
GET    /audit/{system_id}           → Get audit log for a specific system
POST   /audit/verify-integrity      → Verify hash chain integrity
GET    /audit/export                → Export full audit log as JSON
```

### 5.7 Notifications

```
GET    /notifications               → Get notifications for current user
PATCH  /notifications/{id}/read     → Mark notification as read
POST   /notifications/read-all      → Mark all as read
```

---

## 6. Bias Detection Service — Technical Specification

### 6.1 Synthetic Maliba Demographic Dataset

The prototype uses a static synthetic dataset (`maliba_proxy_dataset.csv`) representing a proxy Maliba health population. This dataset is bundled with the application and is NOT real patient data.

**Dataset Structure:**
```csv
patient_id, age_band, location_type, equipment_tier, gender, condition_label, model_prediction, model_confidence
P0001, ADULT, RURAL, AGING, FEMALE, POSITIVE, POSITIVE, 0.82
P0002, ELDERLY, URBAN, HIGH_QUALITY, MALE, NEGATIVE, NEGATIVE, 0.91
...
```

**Dataset Parameters:**
- Total records: 2,000 synthetic patients
- Location distribution: 65% RURAL, 35% URBAN (approximating Maliba demographics)
- Equipment tier: AGING (rural facilities), HIGH_QUALITY (urban hospitals)
- Age bands: PAEDIATRIC (0-17), ADULT (18-59), ELDERLY (60+)
- Gender: FEMALE, MALE, OTHER
- Condition labels: Ground truth labels for the prototype's generic "diagnostic" model scenario
- Model prediction: Pre-populated vendor prediction column (vendors submit their model's output against this dataset as part of the submission)

### 6.2 Bias Metrics Computed

```python
# For each subgroup (e.g., RURAL patients), compute:

# 1. Disparate Impact Ratio (DIR)
# DIR = P(Ŷ=1 | subgroup) / P(Ŷ=1 | overall)
# Threshold: DIR < 0.8 → HARD BLOCK

# 2. Equalized Odds Difference
# EOD = |TPR(subgroup) - TPR(overall)| + |FPR(subgroup) - FPR(overall)|
# Threshold: EOD > 0.15 → WARNING (not hard block in prototype)

# 3. Demographic Parity Difference
# DPD = P(Ŷ=1 | subgroup) - P(Ŷ=1 | overall)
# Threshold: |DPD| > 0.1 → WARNING
```

### 6.3 Bias Check Service Pseudocode

```python
# POST /bias-check/{system_id}/run

async def run_bias_check(system_id: str, vendor_predictions: list):
    """
    1. Load synthetic Maliba proxy dataset
    2. Merge vendor predictions by patient_id
    3. For each subgroup dimension (location_type, equipment_tier, age_band, gender):
       a. Compute DIR, EOD, DPD using Fairlearn MetricFrame
       b. Identify any DIR < 0.8 (HARD_BLOCK)
    4. Compile full subgroup_results JSON
    5. Generate human_readable_summary
    6. Determine overall_status: PASS | FAIL
    7. Store in bias_check_results table
    8. Write to audit_log
    9. Trigger policy evaluation (if PASS)
    10. Notify vendor and Ministry of result
    """
    
    dataset = load_maliba_proxy_dataset()
    merged = merge_predictions(dataset, vendor_predictions)
    
    subgroup_results = {}
    hard_blocks = []
    
    for dimension in ['location_type', 'equipment_tier', 'age_band', 'gender']:
        metric_frame = MetricFrame(
            metrics={
                'accuracy': accuracy_score,
                'selection_rate': selection_rate,
                'true_positive_rate': true_positive_rate,
                'false_positive_rate': false_positive_rate,
            },
            y_true=merged['condition_label'],
            y_pred=merged['model_prediction'],
            sensitive_features=merged[dimension]
        )
        
        for subgroup, metrics in metric_frame.by_group.iterrows():
            dir_value = metrics['selection_rate'] / metric_frame.overall['selection_rate']
            subgroup_results[f"{dimension}:{subgroup}"] = {
                'dir': dir_value,
                'eod': abs(metrics['true_positive_rate'] - metric_frame.overall['true_positive_rate']),
                'dpd': metrics['selection_rate'] - metric_frame.overall['selection_rate'],
                'status': 'FAIL' if dir_value < 0.8 else 'PASS'
            }
            if dir_value < 0.8:
                hard_blocks.append(f"{dimension}:{subgroup}")
    
    overall_status = 'FAIL' if hard_blocks else 'PASS'
    summary = generate_human_readable_summary(subgroup_results, hard_blocks)
    
    return BiasCheckResult(
        system_id=system_id,
        overall_status=overall_status,
        subgroup_results=subgroup_results,
        failed_subgroups=hard_blocks,
        human_readable_summary=summary
    )
```

---

## 7. Policy Evaluation Engine — Technical Specification

### 7.1 Policy Rules Definition

The policy engine is implemented as a Python module with 12 deterministic rule functions. Each rule function takes a `SubmissionBundle` object and returns a `RuleResult`.

```python
# policy_engine.py

POLICY_RULES = [
    {
        "id": "POL-001",
        "name": "Explainability Artifact Present",
        "principle": "Human Autonomy",
        "is_critical": True,
        "description": "A valid LIME or SHAP explainability artifact must be present and not older than 90 days",
    },
    {
        "id": "POL-002",
        "name": "Override Mechanism Documented",
        "principle": "Human Autonomy",
        "is_critical": True,
        "description": "The submission must document a clinician override mechanism",
    },
    {
        "id": "POL-003",
        "name": "Local Validation Evidence",
        "principle": "Safety & Well-Being",
        "is_critical": True,
        "description": "Evidence of validation on Maliba-representative population data must be provided",
    },
    {
        "id": "POL-004",
        "name": "Bias Check Passed",
        "principle": "Safety & Well-Being",
        "is_critical": True,
        "description": "The automated bias check must have passed with no hard-blocked subgroups",
    },
    {
        "id": "POL-005",
        "name": "Training Data Documentation",
        "principle": "Transparency",
        "is_critical": False,
        "description": "Training data sources, demographic coverage, and known limitations must be documented",
    },
    {
        "id": "POL-006",
        "name": "Model Version History",
        "principle": "Transparency",
        "is_critical": False,
        "description": "Model version and update history must be documented",
    },
    {
        "id": "POL-007",
        "name": "CBA Signed",
        "principle": "Responsibility & Accountability",
        "is_critical": True,
        "description": "A signed Community Benefit Agreement must be uploaded",
    },
    {
        "id": "POL-008",
        "name": "SCC Status Declared",
        "principle": "Responsibility & Accountability",
        "is_critical": True,
        "description": "Standard Contractual Clauses applicability must be declared (foreign vendors must sign)",
    },
    {
        "id": "POL-009",
        "name": "All Demographic Subgroups Tested",
        "principle": "Inclusiveness & Equity",
        "is_critical": True,
        "description": "Bias report must cover all four demographic dimensions: location, equipment tier, age, gender",
    },
    {
        "id": "POL-010",
        "name": "No Subgroup Disparate Impact Below Threshold",
        "principle": "Inclusiveness & Equity",
        "is_critical": True,
        "description": "No subgroup may have a Disparate Impact Ratio below 0.8",
    },
    {
        "id": "POL-011",
        "name": "Technology Transfer Obligation",
        "principle": "Responsiveness & Sustainability",
        "is_critical": True,
        "description": "The CBA must contain an explicit technology transfer and training obligation",
    },
    {
        "id": "POL-012",
        "name": "Registration Token Valid",
        "principle": "Responsiveness & Sustainability",
        "is_critical": True,
        "description": "The registration token must not be expired (annual re-registration enforced)",
    },
]
```

### 7.2 Policy Evaluation Function

```python
def evaluate_policy(submission_bundle: SubmissionBundle, bias_result: BiasCheckResult) -> PolicyEvaluationResult:
    
    rule_results = []
    failed_critical = []
    failed_non_critical = []
    
    for rule in POLICY_RULES:
        result = evaluate_single_rule(rule['id'], submission_bundle, bias_result)
        rule_results.append(result)
        if not result.passed:
            if rule['is_critical']:
                failed_critical.append(rule['id'])
            else:
                failed_non_critical.append(rule['id'])
    
    if failed_critical:
        verdict = 'FAIL'
        remediation = generate_remediation_guidance(failed_critical, failed_non_critical)
    elif failed_non_critical:
        verdict = 'CONDITIONAL_PASS'
        remediation = generate_remediation_guidance([], failed_non_critical)
    else:
        verdict = 'PASS'
        remediation = None
    
    return PolicyEvaluationResult(
        verdict=verdict,
        rule_results=rule_results,
        failed_critical_rules=failed_critical,
        failed_non_critical_rules=failed_non_critical,
        remediation_guidance=remediation
    )
```

### 7.3 Remediation Guidance Messages

```python
REMEDIATION_MESSAGES = {
    "POL-001": "Upload a LIME or SHAP explainability artifact generated within the last 90 days. "
               "The artifact should show feature importance scores for your model's predictions. "
               "Free tools: SHAP (pip install shap) or LIME (pip install lime).",
    
    "POL-003": "Provide evidence that your model has been validated against a dataset representative "
               "of Maliba's population (rural patients, aging equipment tiers). "
               "If no local validation has been done, this is a hard block — the Ministry cannot "
               "approve deployment without evidence of local performance.",
    
    "POL-007": "A signed Community Benefit Agreement (CBA) is mandatory. "
               "Download the Ministry's standard CBA template from the Resources section, "
               "complete and sign it, and re-upload with your submission.",
    
    "POL-010": "Your bias report shows one or more population subgroups have a Disparate Impact "
               "Ratio below 0.80 — meaning that subgroup receives significantly worse outcomes "
               "from your model than the general population. "
               "You must retrain or adjust your model to reduce this disparity before resubmission.",
    
    # ... etc for all 12 rules
}
```

---

## 8. Audit Log Service — Technical Specification

### 8.1 Hash Chain Algorithm

```python
import hashlib
import json

def compute_entry_hash(
    sequence_number: int,
    event_type: str,
    system_id: str,
    event_data: dict,
    timestamp: str,
    previous_hash: str
) -> str:
    """
    Produces a deterministic SHA-256 hash of all entry fields + previous hash.
    Tampering with any field or with any prior entry invalidates all subsequent hashes.
    """
    canonical = json.dumps({
        "sequence_number": sequence_number,
        "event_type": event_type,
        "system_id": system_id,
        "event_data": event_data,
        "timestamp": timestamp,
        "previous_hash": previous_hash
    }, sort_keys=True, separators=(',', ':'))
    
    return hashlib.sha256(canonical.encode('utf-8')).hexdigest()


def verify_chain_integrity(db_session) -> ChainVerificationResult:
    """
    Walk the entire audit log in sequence order.
    For each entry, recompute the expected hash and compare to stored hash.
    Return first tampered entry (if any) or PASS.
    """
    entries = db_session.query(AuditLog).order_by(AuditLog.sequence_number).all()
    
    if not entries:
        return ChainVerificationResult(status='EMPTY', message='No audit entries exist')
    
    prev_hash = '0' * 64  # Genesis hash
    
    for entry in entries:
        expected_hash = compute_entry_hash(
            sequence_number=entry.sequence_number,
            event_type=entry.event_type,
            system_id=entry.system_id,
            event_data=entry.event_data,
            timestamp=str(entry.timestamp),
            previous_hash=prev_hash
        )
        
        if expected_hash != entry.entry_hash:
            return ChainVerificationResult(
                status='TAMPERED',
                message=f'Hash mismatch at sequence #{entry.sequence_number}',
                first_tampered_sequence=entry.sequence_number
            )
        
        prev_hash = entry.entry_hash
    
    return ChainVerificationResult(
        status='INTACT',
        message=f'Chain verified: {len(entries)} entries, all hashes valid',
        total_entries=len(entries)
    )
```

### 8.2 Append-Only Enforcement

```python
# In SQLAlchemy model, disable update and delete at ORM level:
class AuditLog(Base):
    __tablename__ = 'audit_log'
    
    # ... columns ...
    
    def __init_subclass__(cls, **kwargs):
        super().__init_subclass__(**kwargs)
    
    # Prevent updates
    @staticmethod
    def before_update(mapper, connection, target):
        raise Exception("AUDIT LOG IS IMMUTABLE: update operations are not permitted")
    
    @staticmethod
    def before_delete(mapper, connection, target):
        raise Exception("AUDIT LOG IS IMMUTABLE: delete operations are not permitted")

# Register the event listeners
from sqlalchemy import event
event.listen(AuditLog, 'before_update', AuditLog.before_update)
event.listen(AuditLog, 'before_delete', AuditLog.before_delete)
```

---

## 9. Frontend Architecture

### 9.1 Application Routes

```
/                           → Redirect to /dashboard (if authenticated) or /login
/login                      → Login page (Ministry users)
/vendor/login               → Vendor login page
/dashboard                  → Ministry dashboard (summary stats, alerts)
/registry                   → Full AI systems registry with filters
/registry/:systemId         → Individual system detail view
/registry/:systemId/audit   → Audit log for specific system
/submissions/new            → Multi-step vendor submission form
/submissions/:id            → Vendor submission tracker
/audit                      → Full audit log viewer (Ministry only)
/audit/verify               → Hash chain integrity verifier
/notifications              → Notification center
/admin/thresholds           → Policy threshold configuration (Admin only)
```

### 9.2 Component Architecture

```
src/
├── components/
│   ├── layout/
│   │   ├── AppShell.jsx          # Main layout with nav, sidebar, header
│   │   ├── Sidebar.jsx           # Navigation sidebar
│   │   ├── TopBar.jsx            # Header with notifications, user menu
│   │   └── PageWrapper.jsx       # Consistent page padding/title
│   │
│   ├── dashboard/
│   │   ├── SummaryStats.jsx      # 4-card grid: Total / Shadow / Production / Expiring
│   │   ├── SystemStatusChart.jsx # Recharts pie/donut: systems by lifecycle stage
│   │   ├── RecentActivity.jsx    # Last 10 audit events
│   │   ├── AlertPanel.jsx        # Expiring registrations, failed checks
│   │   └── ComplianceGauge.jsx   # % of active systems fully compliant
│   │
│   ├── registry/
│   │   ├── SystemsTable.jsx      # Filterable, sortable table of all AI systems
│   │   ├── SystemCard.jsx        # Single-system summary card
│   │   ├── SystemDetail.jsx      # Full system detail with all checks
│   │   ├── LifecycleBadge.jsx    # Colored badge: Shadow/Canary/Production/etc
│   │   ├── BiasReport.jsx        # Bias check result visualization
│   │   ├── PolicyReport.jsx      # 12-rule policy evaluation results
│   │   ├── DocumentsList.jsx     # CBA/SCC/Explainability artifacts
│   │   └── LifecycleActions.jsx  # Promote/Suspend/Reactivate buttons
│   │
│   ├── submission/
│   │   ├── SubmissionWizard.jsx  # Multi-step form shell
│   │   ├── Step1SystemInfo.jsx   # Basic metadata
│   │   ├── Step2RiskClass.jsx    # Risk classification
│   │   ├── Step3LegalDocs.jsx    # CBA/SCC upload
│   │   ├── Step4TechEvidence.jsx # Explainability + local validation
│   │   ├── Step5Review.jsx       # Summary before submit
│   │   └── SubmissionTracker.jsx # Status tracking for vendor
│   │
│   ├── audit/
│   │   ├── AuditLogTable.jsx     # Paginated, filterable audit log
│   │   ├── AuditEventRow.jsx     # Single log entry with event detail
│   │   ├── HashChainVerifier.jsx # Integrity verification UI
│   │   └── AuditExporter.jsx     # JSON export button
│   │
│   └── common/
│       ├── StatusBadge.jsx       # Generic status badge (pass/fail/warning)
│       ├── PolicyRuleRow.jsx     # Single policy rule result row
│       ├── UploadDropzone.jsx    # File upload with validation
│       ├── ConfirmationModal.jsx # For Promote/Suspend actions
│       ├── LoadingSpinner.jsx
│       ├── EmptyState.jsx
│       └── ErrorBoundary.jsx
│
├── pages/
│   ├── LoginPage.jsx
│   ├── DashboardPage.jsx
│   ├── RegistryPage.jsx
│   ├── SystemDetailPage.jsx
│   ├── SubmissionPage.jsx
│   ├── AuditPage.jsx
│   └── NotificationsPage.jsx
│
├── store/
│   ├── authStore.js              # Zustand auth state
│   ├── registryStore.js          # AI systems registry state
│   ├── notificationStore.js      # Notifications state
│   └── uiStore.js                # UI state (sidebar open, etc.)
│
├── api/
│   ├── client.js                 # Axios instance with auth interceptors
│   ├── auth.js                   # Auth API calls
│   ├── registry.js               # Registry API calls
│   ├── submissions.js            # Submission API calls
│   ├── biasCheck.js              # Bias check API calls
│   ├── policyEval.js             # Policy evaluation API calls
│   └── audit.js                  # Audit log API calls
│
├── utils/
│   ├── statusColors.js           # Central status → color mapping
│   ├── formatters.js             # Date, number, status label formatters
│   └── validators.js             # Form validation helpers
│
└── constants/
    ├── policyRules.js            # Policy rule metadata
    ├── riskClassification.js     # Risk level definitions
    └── lifecycleStates.js        # Lifecycle stage definitions and transitions
```

### 9.3 Design System

**Color Palette (Tailwind custom config):**
```javascript
// Conveys professionalism and institutional trust; accessible for health workers
colors: {
  primary: {
    50: '#EFF6FF',
    500: '#2563EB',    // Ministry blue — primary actions
    700: '#1D4ED8',    // Hover states
    900: '#1E3A8A',    // Dark accent
  },
  success: {
    100: '#DCFCE7',
    600: '#16A34A',    // PASS, PRODUCTION, compliant
    800: '#166534',
  },
  warning: {
    100: '#FEF3C7',
    600: '#D97706',    // CONDITIONAL_PASS, CANARY, approaching deadline
    800: '#92400E',
  },
  danger: {
    100: '#FEE2E2',
    600: '#DC2626',    // FAIL, SUSPENDED, EXPIRED, hard block
    800: '#991B1B',
  },
  shadow: {
    100: '#F0F9FF',
    600: '#0284C7',    // SHADOW_MODE (distinct blue)
  },
  neutral: {
    50: '#F8FAFC',     // Page background
    100: '#F1F5F9',    // Card background
    200: '#E2E8F0',    // Borders
    600: '#475569',    // Secondary text
    900: '#0F172A',    // Primary text
  }
}
```

**Typography:**
- Font family: Inter (Google Fonts, free)
- Page heading: 24px / 600 weight
- Section heading: 18px / 600 weight
- Body: 14px / 400 weight
- Labels/captions: 12px / 500 weight

**Spacing system:** 4px base unit (Tailwind default spacing scale)

**Component principles:**
- Every status indicator uses both color AND text label AND icon (never color alone — accessibility)
- All destructive actions (Suspend, Reject) require a confirmation modal with mandatory reason field
- All loading states show a skeleton loader, not a blank screen
- Error states include a specific error message and a "Try again" action

---

## 10. Backend Structure

```
backend/
├── main.py                       # FastAPI app entrypoint, CORS, router registration
├── config.py                     # Settings (DB path, secret key, thresholds)
├── database.py                   # SQLAlchemy engine and session
├── models/                       # SQLAlchemy ORM models
│   ├── user.py
│   ├── ai_system.py
│   ├── legal_document.py
│   ├── explainability_artifact.py
│   ├── bias_check_result.py
│   ├── policy_evaluation_result.py
│   ├── audit_log.py
│   └── notification.py
├── schemas/                      # Pydantic request/response schemas
│   ├── submission.py
│   ├── bias_check.py
│   ├── policy_eval.py
│   ├── audit.py
│   └── auth.py
├── routers/                      # FastAPI route handlers
│   ├── auth.py
│   ├── submissions.py
│   ├── registry.py
│   ├── bias_check.py
│   ├── policy_eval.py
│   ├── audit.py
│   └── notifications.py
├── services/                     # Business logic
│   ├── auth_service.py
│   ├── submission_service.py
│   ├── bias_check_service.py     # Fairlearn integration
│   ├── policy_engine.py          # 12-rule policy evaluator
│   ├── audit_service.py          # Hash-chain append + verify
│   ├── notification_service.py
│   └── file_storage_service.py   # Local file storage for uploads
├── data/
│   ├── maliba_proxy_dataset.csv  # Synthetic demographic dataset (bundled)
│   └── seed_data.py              # Database seed script for demo
├── tests/
│   ├── test_bias_check.py
│   ├── test_policy_engine.py
│   ├── test_audit_chain.py
│   └── test_api_submission.py
└── requirements.txt
```

### 10.1 Requirements.txt

```
fastapi==0.111.0
uvicorn[standard]==0.29.0
pydantic==2.7.1
sqlalchemy==2.0.30
fairlearn==0.10.0
scikit-learn==1.4.2
pandas==2.2.2
numpy==1.26.4
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.9
aiofiles==23.2.1
python-dotenv==1.0.1
```

---

## 11. Security Requirements

### 11.1 Authentication and Authorization

```python
# Role-based access control matrix
RBAC = {
    "admin": [
        "all_endpoints",
        "manage_users",
        "update_policy_thresholds"
    ],
    "ministry_reviewer": [
        "read:all_systems",
        "write:lifecycle_status",          # Promote, Suspend, Reactivate
        "read:full_audit_log",
        "write:audit_log_verify",
        "read:all_submissions",
        "write:hta_override"
    ],
    "vendor": [
        "write:submit_system",             # Own submissions only
        "read:own_submissions",
        "write:upload_documents",          # Own systems only
        "read:own_bias_results",
        "read:own_policy_results",
        "read:notifications"               # Own notifications only
    ]
}
```

### 11.2 File Upload Security

- Allowed MIME types: `application/pdf`, `application/json`, `text/csv`
- Maximum file size: 10 MB per upload
- Files stored with UUID-based filenames (not original names) to prevent path traversal
- Virus scanning: noted as a production requirement; not implemented in prototype
- Files stored outside the web root; served through authenticated API endpoint only

### 11.3 API Security

- All endpoints require JWT Bearer token except `/auth/login` and `/auth/register`
- JWT expiry: 8 hours (configurable)
- Rate limiting: 100 requests/minute per IP (not implemented in prototype; noted for production)
- Input validation: all inputs validated through Pydantic schemas before processing
- SQL injection: prevented by SQLAlchemy ORM parameterized queries
- XSS: React default escaping + Content-Security-Policy header
- CORS: restricted to known frontend origins only

---

## 12. Deployment Configuration

### 12.1 Single-Server Deployment (Maliba Target Environment)

```
# Project structure on server
/opt/magp/
├── frontend/           # Built React SPA (Vite build output)
├── backend/            # FastAPI application
├── data/               # SQLite database file + uploaded documents
│   ├── magp.db
│   └── uploads/
└── logs/               # Application logs

# Nginx configuration (reverse proxy)
server {
    listen 80;
    server_name magp.maliba-moh.gov;
    
    # React SPA
    location / {
        root /opt/magp/frontend/dist;
        try_files $uri $uri/ /index.html;
    }
    
    # API
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    # Uploaded documents (authenticated API only; not served directly)
    location /uploads/ {
        deny all;
    }
}
```

### 12.2 Environment Variables

```bash
# .env
SECRET_KEY=<256-bit-random-key>
DATABASE_URL=sqlite:///./data/magp.db
UPLOAD_DIR=./data/uploads
ALLOWED_ORIGINS=http://localhost:5173,https://magp.maliba-moh.gov
BIAS_CHECK_DIR_THRESHOLD=0.80
REGISTRATION_VALIDITY_DAYS=365
EXPLAINABILITY_ARTIFACT_MAX_AGE_DAYS=90
REREGISTRATION_WARNING_DAYS=30
```

### 12.3 Startup Commands

```bash
# Backend
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000

# Frontend (development)
cd frontend
npm run dev

# Frontend (production build)
cd frontend
npm run build
# Output in frontend/dist/ — serve with Nginx
```

---

## 13. Demo / Seed Data

The prototype ships with seed data covering four illustrative AI systems to demonstrate all lifecycle stages and governance outcomes:

| System Name | Vendor | Risk | Status | Scenario Demonstrated |
|---|---|---|---|---|
| TuberculoScan AI v2.1 | MedTech NGO Alpha | HIGH | PRODUCTION | Fully compliant, all checks passed, in live use |
| MalariaPredict Pro | DataHealth Corp | HIGH | SHADOW_MODE | New submission, passed bias check and policy evaluation, now in Shadow Mode |
| ChildVax Supply Optimizer | WHO Pilot | MEDIUM | CANARY_MODE | Passed all checks; in limited rollout at 3 facilities |
| ChestXray Analyzer v1.0 | VisionMed Inc | HIGH | REJECTED | Hard-blocked due to failing rural equipment-tier subgroup (DIR = 0.54) |

Seed data also includes:
- 50 pre-populated audit log entries demonstrating the hash chain
- Sample bias reports for each system
- Sample policy evaluation reports with per-rule breakdown

---

## 14. Testing Requirements

### 14.1 Backend Tests

```python
# Key test cases

# test_bias_check.py
def test_bias_check_fails_on_low_dir():
    """A model with DIR < 0.8 for rural subgroup must return FAIL"""
    
def test_bias_check_passes_balanced_model():
    """A model with all DIRs >= 0.8 must return PASS"""
    
def test_all_four_subgroup_dimensions_tested():
    """Bias check must cover location, equipment_tier, age_band, gender"""

# test_policy_engine.py
def test_missing_cba_is_critical_fail():
    """Missing CBA must result in FAIL verdict (not CONDITIONAL_PASS)"""
    
def test_failed_bias_check_blocks_policy_pass():
    """A FAIL bias result must cause POL-004 to fail and overall verdict FAIL"""
    
def test_all_12_rules_evaluated():
    """Policy evaluation must return exactly 12 rule results"""

# test_audit_chain.py
def test_hash_chain_intact_after_100_entries():
    """Chain verification must pass after inserting 100 sequential entries"""
    
def test_tampered_entry_detected():
    """Modifying any entry's event_data must cause chain verification to fail"""
    
def test_audit_log_rejects_update():
    """Attempting to update an audit log entry must raise an exception"""
```

### 14.2 Frontend Tests (Vitest)

- SubmissionWizard: validates that incomplete forms cannot be submitted
- PolicyReport: correctly renders PASS, CONDITIONAL_PASS, and FAIL states
- BiasReport: displays hard-blocked subgroups in red
- LifecycleActions: Promote button is disabled if system is not in eligible state
- HashChainVerifier: displays INTACT / TAMPERED result correctly

---

## 15. Antigravity IDE — Development Notes

Since development is in Antigravity IDE, the following conventions apply:

- **Frontend entry point:** `frontend/src/main.jsx`
- **Backend entry point:** `backend/main.py`
- **Run frontend:** `npm run dev` (Vite serves on port 5173)
- **Run backend:** `uvicorn main:app --reload` (hot reload on port 8000)
- **Vite proxy config:** Add API proxy in `vite.config.js` to route `/api` → `localhost:8000` during development, eliminating CORS issues in dev
- **Database init:** Run `python backend/data/seed_data.py` once to create tables and load demo data
- **Fairlearn import:** Fairlearn requires Python 3.9+; ensure Antigravity's Python environment meets this
- **File uploads in dev:** Set `UPLOAD_DIR=./data/uploads` in `.env`; ensure the directory exists before first run

---

## 16. Master Prompt for Implementation

See the companion `MASTER_PROMPT.md` file for the full master prompt to use with an AI coding assistant to generate the complete implementation plan and initial codebase from this TRD and the PRD.
