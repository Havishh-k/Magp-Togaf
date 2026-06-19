# Product Requirements Document (PRD)
## Maliba AI Governance Platform — Prototype
### Version 1.0 | The Open Group INITIATE 2026 — Team Trident

---

## 1. Document Overview

| Field | Details |
|---|---|
| Product Name | Maliba AI Governance Platform (MAGP) |
| Version | 1.0 — Prototype |
| Competition | The Open Group INITIATE Enterprise Architecture Competition for Students 2026 |
| Team | Team Trident |
| Mentor | Bhumika Udani |
| Primary User | Ministry of Health (MoH), Republic of Maliba |
| Last Updated | June 2026 |

---

## 2. Executive Summary

The Maliba AI Governance Platform (MAGP) is a lightweight, browser-based web application designed to give the Ministry of Health of the Republic of Maliba — a resource-constrained, low-income country — full visibility and control over every AI system operating in its health network. The platform automates the enforcement of WHO AI ethics principles through policy-as-code, replacing manual paper checklists and ad hoc oversight with a deterministic, tamper-evident governance pipeline that requires zero AI expertise from Ministry staff to operate.

The prototype specifically demonstrates five automated governance mechanics: vendor submission, automated bias checking, policy evaluation, immutable audit logging, and a live Ministry dashboard. These mechanics map directly onto the WHO's six ethical principles and transform them from aspirational language into machine-enforceable gates.

---

## 3. Problem Statement

The Republic of Maliba's Ministry of Health faces a governance crisis on four simultaneous fronts:

**3.1 Zero Governance Capacity.** The Ministry has no staff with AI, ML, or data science expertise. No budget exists for AI governance infrastructure. National regulatory frameworks do not address adaptive AI systems. Ethics committees have no frameworks for reviewing AI deployment.

**3.2 Algorithmic Digital Divide.** AI diagnostic tools trained on Western populations produce inaccurate results for Maliba's rural population, different disease presentations, and aging imaging equipment. No local validation datasets exist.

**3.3 Uncontrolled AI Proliferation.** NGOs, donors, and vendors deploy overlapping, uncoordinated AI pilots without Ministry knowledge. No central registry exists. Conflicting AI recommendations confuse health workers. Pilot projects extract data and leave without technology transfer.

**3.4 Data Colonialism.** Foreign entities collect patient data under no domestic data-protection law, train commercial models on it, and sell the results back to Maliba. Communities see no benefit from their own data.

The WHO's six AI ethics principles provide ethical direction but offer no operational implementation guidance for countries without regulatory capacity, AI budgets, or technical staff. The platform solves this by encoding WHO principles as automated policy gates that enforce themselves.

---

## 4. Goals and Non-Goals

### 4.1 Goals

- Provide a single, authoritative registry of every AI system operating in Maliba's health network
- Automate bias detection against Maliba-specific population demographics before any model reaches patients
- Enforce WHO ethics compliance through deterministic policy evaluation, not manual review
- Produce a tamper-evident audit trail of every governance decision
- Guide AI systems through a safe Shadow → Canary → Production lifecycle
- Require zero AI expertise from Ministry program managers to operate day-to-day
- Run entirely on free, open-source tooling hosted on infrastructure Maliba already has
- Deliver actionable vendor feedback on failures rather than opaque rejections

### 4.2 Non-Goals

- This is NOT a full production deployment; it is a prototype demonstrating governance mechanics
- This does NOT replace the Ministry's existing HTA committee — it augments it with one additional checklist gate
- This does NOT require a new government directorate, new budget line, or specialist hires
- This does NOT process real Protected Health Information (PHI); the prototype uses synthetic/proxy demographic datasets
- This does NOT implement the full Federated Learning infrastructure (that is a Phase 2 infrastructure build)

---

## 5. Target Users and Personas

### 5.1 Primary Users

**Persona 1 — Ministry Program Manager (Amara)**
- Non-technical health administrator; manages HTA workflows
- Needs to understand which AI systems are registered, their status, and whether governance is current
- Pain point: currently has no visibility into what AI systems are operating in facilities
- Uses: Dashboard, Registry View, Compliance Status

**Persona 2 — Ethics Committee Reviewer (Dr. Kofi)**
- Clinician on the HTA/ethics committee; not an AI expert
- Needs to confirm CBA/SCC legal gate is cleared before technical gates run
- Pain point: no standardized AI review checklist exists
- Uses: Submission Review, Policy Evaluation Results, Audit Log

**Persona 3 — AI Vendor / NGO Representative (External)**
- Wants to register an AI system for use in Maliba's health facilities
- Needs deterministic, transparent requirements rather than an opaque approval process
- Pain point: currently no formal registration pathway exists
- Uses: Vendor Submission Portal, Feedback on Failed Criteria

**Persona 4 — Community Health Worker / Facility Staff (Fatou)**
- Frontline health worker who may use AI-assisted tools
- Needs confidence that AI recommendations have been validated for her patient population
- Pain point: no way to verify whether an AI tool is appropriate for local context
- Uses: (Indirect) — benefits from the governance pipeline that validates tools before they reach her

### 5.2 User Constraints

- Primary users have limited digital literacy; interfaces must be simple, icon-supported, and English-language (with future localization considered in design)
- Users operate on low-bandwidth connections; the application must be performant on slow networks
- Some users access the system from shared computers at health facilities
- The system must not require any local software installation beyond a modern browser

---

## 6. Core Features (Prototype Scope)

### Feature 1 — Vendor Submission Portal

**Description:** A structured form through which any vendor, NGO, researcher, or donor submits an AI system for Ministry registration.

**Required Inputs:**
- Basic system metadata (name, version, intended use case, target population, developer/organization name, deployment timeline)
- Risk classification (auto-suggested based on use case: High / Medium / Low, based on EU AI Act categories adapted for health context)
- CBA (Community Benefit Agreement) status — signed/unsigned with upload capability
- SCC (Standard Contractual Clauses) status — applicable/not applicable with upload capability
- Explainability artifact upload — LIME or SHAP output file
- Training data documentation — description of training data sources, demographic coverage
- Local validation evidence — whether the model has been validated on Maliba-representative data

**Outputs:**
- Submission confirmation with unique submission ID
- Automatic queuing for bias check and policy evaluation
- Status tracking visible to vendor

**Acceptance Criteria:**
- Form is completable by a non-technical vendor representative without external guidance
- Incomplete submissions are rejected with specific field-level error messages
- Uploaded files are validated for format (PDF/JSON for explainability artifacts)
- Submission ID is generated and displayed immediately on completion

---

### Feature 2 — Automated Bias Detection Pipeline

**Description:** Automated fairness analysis run against every submission using an open-source Fairlearn-equivalent bias detection engine applied to a synthetic/proxy Maliba demographic test dataset.

**Population Subgroups Tested:**
- Rural vs. Urban patient population
- Equipment quality tier (High-quality hospital equipment / Aging rural facility equipment)
- Age band (Paediatric / Adult / Elderly)
- Gender

**Metrics Computed:**
- Disparate Impact Ratio (per subgroup vs. overall population)
- Equalized Odds (false positive and false negative rate differentials)
- Demographic Parity Difference

**Threshold Logic:**
- Disparate Impact Ratio below 0.8 (i.e., a subgroup receives favorable outcomes less than 80% as often as the overall population) → HARD BLOCK
- Fairness delta above configurable Ministry-set threshold → HARD BLOCK with specific subgroup callout

**Outputs:**
- Full bias report per submission (subgroup breakdown, metric scores, pass/fail per subgroup)
- Human-readable summary for non-technical reviewers ("The model performs 34% worse on rural patients using aging equipment than the overall population — this exceeds the acceptable threshold")
- Detailed JSON report for audit log ingestion

**Acceptance Criteria:**
- Bias check runs automatically on every submission; no manual trigger required
- Results are returned within a reasonable time for a prototype (< 30 seconds for synthetic dataset)
- Results are stored and linked to the submission record permanently
- Hard blocks cannot be overridden by the vendor; only the Ministry HTA committee can grant a conditional waiver (logged separately)

---

### Feature 3 — Policy Evaluation Engine

**Description:** Deterministic policy evaluation gate that assesses the full submission bundle against WHO-principle-mapped Rego-equivalent policy rules. All six WHO principles are represented by at least one policy rule.

**Policy Checks:**

| WHO Principle | Policy Rule ID | Check Description |
|---|---|---|
| Human Autonomy | POL-001 | Explainability artifact present and current (not older than 90 days) |
| Human Autonomy | POL-002 | Override/escalation mechanism documented in submission |
| Safety & Well-Being | POL-003 | Local validation evidence provided (Maliba population data) |
| Safety & Well-Being | POL-004 | Bias check result: PASS (no hard-blocked subgroup) |
| Transparency | POL-005 | Training data documentation complete (sources, demographics, coverage) |
| Transparency | POL-006 | Model version and update history documented |
| Responsibility & Accountability | POL-007 | CBA signed and uploaded |
| Responsibility & Accountability | POL-008 | SCC applicable status declared (required for foreign vendors) |
| Inclusiveness & Equity | POL-009 | All four demographic subgroups tested in bias report |
| Inclusiveness & Equity | POL-010 | No subgroup disparate impact ratio below 0.8 |
| Responsiveness & Sustainability | POL-011 | Technology transfer obligation documented in CBA |
| Responsiveness & Sustainability | POL-012 | Registration token not expired (annual re-registration enforced) |

**Evaluation Outcomes:**
- PASS: All 12 policy checks pass → Model status flips to "Shadow Mode — Approved"
- CONDITIONAL PASS: Non-critical checks fail (POL-005, POL-006) → Model is flagged for review; HTA committee must review before progression
- FAIL: Any of POL-003, POL-004, POL-007, POL-008, POL-010 fail → Hard rejection; vendor receives specific failed criteria and guidance to remediate

**Outputs:**
- Policy evaluation report (per-rule pass/fail with reason)
- Overall verdict (PASS / CONDITIONAL PASS / FAIL)
- Actionable remediation guidance for each failed rule
- Audit log entry (immutable)

**Acceptance Criteria:**
- Policy evaluation runs automatically after bias check completes
- Each failed policy check returns a specific, actionable error message — not a generic rejection
- Evaluation logic is transparent and visible to Ministry reviewers (no black box)
- Every evaluation, including PASS results, is written to the immutable audit log

---

### Feature 4 — Immutable Audit Log

**Description:** A hash-chained, append-only audit log recording every governance event in the system. Provides tamper-evident accountability without requiring expensive managed cloud infrastructure.

**Events Logged:**
- Every vendor submission (timestamp, vendor, system name, submission ID)
- Every bias check result (timestamp, subgroup scores, pass/fail)
- Every policy evaluation (timestamp, per-rule results, verdict, policy version)
- Every status change (Shadow Mode → Canary → Production → Suspended)
- Every HTA committee override or waiver (timestamp, reviewer identity, justification)
- Every annual re-registration event (pass or sunset)

**Hash-Chain Mechanism:**
- Each log entry includes a SHA-256 hash of (entry content + hash of previous entry)
- Tampering with any historical entry invalidates all subsequent hashes, making alteration detectable
- Log entries are append-only; no delete or edit operations are exposed in the UI

**Outputs:**
- Viewable audit log in the Ministry dashboard (filterable by system, date, event type)
- Exportable as JSON for external audit
- Chain integrity verification tool (Ministry can verify the hash chain has not been tampered with at any time)

**Acceptance Criteria:**
- Every governance event in the system is captured in the audit log automatically
- The hash chain is verifiable by the Ministry at any time with a single button click
- Log entries cannot be deleted or modified through the UI
- Export function produces a complete, self-contained JSON file

---

### Feature 5 — AI System Registry and Dashboard

**Description:** A Ministry-facing command center providing full visibility into every registered AI system, its current lifecycle stage, compliance status, last bias score, and re-registration due date.

**Dashboard Views:**

**Summary View:**
- Total registered AI systems (count by status: Shadow / Canary / Production / Suspended / Expired)
- Systems due for re-registration within 30 days (alert panel)
- Recent governance events (last 10 entries from audit log)
- Systems currently in Shadow Mode awaiting promotion decision
- Overall compliance health score (% of active systems fully compliant)

**Registry View (per system):**
- System name, vendor, use case, risk classification
- Current lifecycle status (Shadow / Canary / Production / Suspended / Expired)
- Last bias check date and result summary
- Policy evaluation status (all 12 checks: green/amber/red)
- CBA and SCC status
- Annual re-registration due date
- Full audit trail for that system (link to filtered audit log)

**Lifecycle Management:**
- Ministry reviewer can promote a model from Shadow → Canary → Production (with logged confirmation)
- Ministry reviewer can suspend a model (with mandatory justification, logged)
- System auto-flags models as "Expired" when annual re-registration deadline passes without a new submission

**Acceptance Criteria:**
- Dashboard loads within 3 seconds on a standard connection
- All registered systems are visible regardless of status
- Status changes are reflected in real time (no page refresh required)
- Every promotion, suspension, and expiry event is written to the audit log
- Dashboard is usable by a non-technical program manager without training documentation

---

### Feature 6 — Notification and Alert System

**Description:** In-app notification system alerting relevant Ministry staff to governance events requiring attention.

**Alert Types:**
- New vendor submission awaiting review
- Bias check failed (hard block) — vendor notified, Ministry alerted
- Policy evaluation failed — vendor receives detailed feedback
- System approaching re-registration deadline (30-day and 7-day warnings)
- System auto-suspended due to missed re-registration
- Hash chain integrity anomaly detected

**Delivery:**
- In-app notification panel (bell icon in navigation)
- Dashboard alert banner for critical items

---

## 7. Non-Functional Requirements

### 7.1 Usability
- All core workflows must be completable without reading any documentation
- Error messages must be written in plain English, not technical jargon
- UI must support users with limited digital literacy; icons must accompany text labels
- Color coding (green/amber/red) must be consistent across all status indicators
- Mobile-responsive design required (many facility staff access via phone)

### 7.2 Performance
- Dashboard must load within 3 seconds on a 3G connection
- Bias check must complete within 30 seconds for prototype synthetic dataset
- Policy evaluation must complete within 5 seconds
- The system must support at least 50 concurrent users (Ministry scale)

### 7.3 Security
- All data transmission must use HTTPS
- Role-based access control (Ministry Reviewer vs. Vendor vs. Admin)
- Audit log entries must be read-only for all roles including Admin
- No PHI in the prototype; synthetic/proxy demographic data only

### 7.4 Accessibility
- WCAG 2.1 AA compliance
- High-contrast mode supported
- Keyboard navigable

### 7.5 Localizability
- All UI strings externalized into a translation file for future French/local language support
- Date and number formats configurable for Maliba locale

### 7.6 Sustainability / Operational Cost
- Must run on free, open-source tooling only
- Must be hostable on the same server infrastructure that hosts Maliba's existing OpenMRS/HIS systems
- No dependency on paid cloud services, SaaS APIs, or licensed software

---

## 8. User Flows

### 8.1 Vendor Submission Flow
1. Vendor navigates to the Submission Portal
2. Vendor selects "New AI System Registration"
3. Vendor completes multi-step form (System Info → Risk Classification → Legal Documents → Technical Evidence)
4. System validates form completeness; shows field-level errors if incomplete
5. On successful submission, system generates a unique Submission ID and queues bias check
6. Vendor sees status "Pending Bias Check" on their submission tracker
7. Bias check runs automatically; vendor is notified of result
8. If bias check passes, policy evaluation runs automatically
9. Vendor receives detailed report: PASS, CONDITIONAL PASS, or FAIL with per-rule breakdown
10. On PASS: status updates to "Shadow Mode — Approved"; Ministry dashboard reflects the new registration
11. On FAIL: vendor receives specific failed criteria and remediation guidance; can resubmit after remediation

### 8.2 Ministry Review Flow
1. Ministry Program Manager logs into Dashboard
2. Dashboard shows summary: active systems, pending reviews, approaching re-registration deadlines
3. Manager reviews systems in "Shadow Mode" — can view bias report, policy evaluation, CBA/SCC documents
4. Manager promotes system to "Canary Mode" (with confirmation click, logged to audit)
5. After Canary observation period, Manager promotes to "Production" (with confirmation click, logged)
6. Manager can suspend any system at any time with a mandatory justification note (logged)

### 8.3 Annual Re-Registration Flow
1. System sends 30-day re-registration warning to vendor and Ministry
2. Vendor submits updated bias report, explainability artifact, and performance evidence
3. Automated policy check re-runs (same 12-rule evaluation)
4. On pass: registration renewed; re-registration due date resets to +12 months
5. On failure to submit or failure of re-check: system status auto-changes to "Expired"; Ministry alerted

---

## 9. Success Metrics

| Metric | Target |
|---|---|
| Time from submission to policy verdict | < 5 minutes (automated pipeline) |
| Proportion of governance decisions with full audit trail | 100% |
| Ministry staff able to use dashboard without training | ≥ 80% on usability test |
| Vendor satisfaction with feedback specificity (FAIL cases) | ≥ 70% find feedback actionable |
| Hash chain integrity test passing | 100% at all times |
| Zero AI systems operating in Maliba health network without registry entry | Target state post-rollout |

---

## 10. Out of Scope for Prototype (Future Phases)

- Full Federated Learning infrastructure (raw PHI stays on-premise)
- Differential Privacy implementation for gradient transmission
- Integration with live OpenMRS/HIS health information systems
- Automated adverse event monitoring from live clinical data
- Multi-language UI (French, local languages)
- Mobile native app
- Regional AI Expertise Network portal
- Community Advisory Board digital portal
- Integration with national data governance registry

---

## 11. Assumptions and Dependencies

- The synthetic/proxy Maliba demographic dataset is provided as a static fixture file for the prototype
- The Fairlearn bias detection logic is implemented as a Python service callable via REST API
- The OPA/Rego policy engine logic is implemented as a JavaScript equivalent policy evaluator for the prototype
- The hash-chained audit log is implemented as an in-memory/file-based append-only store for the prototype (upgradeable to a proper database in production)
- The application is deployed as a single-server web application (React frontend + Node.js/Python backend)
- All vendor document uploads are stored locally (no external cloud storage)

---

## 12. Glossary

| Term | Definition |
|---|---|
| CBA | Community Benefit Agreement — contract binding vendor to data residency, technology transfer, and community benefit obligations |
| SCC | Standard Contractual Clauses — GDPR Article 46-style clauses binding foreign vendors to Maliba-equivalent data protection |
| HTA | Health Technology Assessment — the Ministry committee that evaluates health technologies for approval |
| OPA | Open Policy Agent — open-source policy engine for expressing and enforcing compliance rules as code |
| Rego | Policy language used by OPA to express rules |
| LIME | Local Interpretable Model-agnostic Explanations — an explainability technique for AI models |
| SHAP | SHapley Additive exPlanations — another explainability technique producing feature importance scores |
| Fairlearn | Open-source Python library for assessing and improving fairness in AI systems |
| Shadow Mode | First deployment stage — model runs in parallel with zero patient-facing impact; predictions logged only |
| Canary Mode | Limited rollout to a subset of facilities with intensified monitoring |
| Disparate Impact Ratio | Ratio of favorable outcome rate for a subgroup vs. the overall population (threshold: 0.8) |
| PHI | Protected Health Information |
| LMIC | Low- and Middle-Income Country |
| MAGP | Maliba AI Governance Platform |
