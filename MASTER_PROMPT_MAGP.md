# MASTER PROMPT — Maliba AI Governance Platform (MAGP)
## For Use in Antigravity IDE with an AI Coding Assistant

---

## HOW TO USE THIS PROMPT

Copy everything between the `=== BEGIN PROMPT ===` and `=== END PROMPT ===` markers below and paste it as the FIRST message in your AI coding session inside Antigravity IDE. Do not modify it before pasting — the prompt is self-contained and structured to produce a complete, prioritized implementation plan before any code is written.

---

=== BEGIN PROMPT ===

# MAGP Implementation Session — Context and Instructions

You are the lead developer building the **Maliba AI Governance Platform (MAGP)** — a web application for the Ministry of Health of the Republic of Maliba, a resource-constrained low-income country that needs to govern AI systems in its health network without AI expertise, budget, or a separate regulatory body.

You have two specification documents available in this workspace:

- `PRD_Maliba_AI_Governance_Platform.md` — Product Requirements Document (what the product does, for whom, and to what standard)
- `TRD_Maliba_AI_Governance_Platform.md` — Technical Requirements Document (exact stack, database schema, API spec, component architecture, bias detection logic, policy engine logic, audit log hash-chain algorithm)

**Your first task is to read both documents completely before writing a single line of code.** Do not assume you know the requirements from this prompt alone.

---

## PHASE 1: Read the Documents

1. Open and read `PRD_Maliba_AI_Governance_Platform.md` in full.
2. Open and read `TRD_Maliba_AI_Governance_Platform.md` in full.
3. Confirm you have read both by summarizing the following in 3–4 sentences each:
   - The core problem MAGP solves
   - The five prototype features and what they automate
   - The technology stack (frontend + backend)
   - The two most technically complex components (bias detection and audit log hash chain)

Do not proceed to Phase 2 until you have completed Phase 1 and confirmed your understanding.

---

## PHASE 2: Generate the Implementation Plan

Before writing any code, produce a **complete, detailed implementation plan** structured as follows:

### 2.1 Project Scaffolding Plan
List every file and directory you will create, organized by:
- Root project structure
- Frontend (`frontend/`) structure (matching TRD Section 9.2)
- Backend (`backend/`) structure (matching TRD Section 10)
- Data files needed (`backend/data/`)

### 2.2 Build Sequence (in dependency order)
Produce a numbered build sequence of 20–30 discrete tasks, ordered so each task depends only on previously completed tasks. For each task specify:
- Task number and name
- Files created or modified
- What it enables (what becomes testable after this task)

The sequence must follow this macro order:
1. Project scaffolding and environment setup
2. Database models and schema (all 8 tables from TRD Section 4)
3. Authentication (JWT, RBAC)
4. Audit log service (hash chain — this is a dependency of almost everything else)
5. Synthetic Maliba dataset creation
6. Bias check service (Fairlearn integration)
7. Policy evaluation engine (all 12 rules)
8. Submission API and service layer
9. Registry API and service layer
10. Notification service
11. Frontend: AppShell, routing, auth
12. Frontend: Vendor Submission Wizard (5 steps)
13. Frontend: Ministry Dashboard
14. Frontend: Registry and System Detail
15. Frontend: Audit Log Viewer and Hash Chain Verifier
16. Frontend: Notifications
17. Seed data script
18. End-to-end integration testing
19. Demo run-through

### 2.3 Critical Implementation Notes
Flag the following before coding:
- The audit log must be append-only — how you will enforce this at the ORM level (see TRD Section 8.2)
- The bias check must run automatically after submission — how you will trigger it without blocking the HTTP response (use FastAPI BackgroundTasks)
- The policy engine must evaluate all 12 rules, not just the ones that fail — confirm you will return results for all 12
- The frontend must use both color AND text AND icon for every status indicator — never color alone
- All destructive actions (Suspend, Reject) must show a confirmation modal with a mandatory reason field

### 2.4 What You Will NOT Build in the Prototype
List the features marked as out-of-scope in PRD Section 10 to confirm you are not planning to build them. This prevents scope creep.

---

## PHASE 3: Environment Setup

After Phase 2 is approved, set up the development environment:

1. Create the root project directory structure
2. Initialize the frontend with Vite + React:
   ```
   npm create vite@latest frontend -- --template react
   cd frontend && npm install
   ```
3. Install all frontend dependencies from TRD Section 3.1:
   - react-router-dom, zustand, tailwindcss, shadcn/ui, recharts, react-hook-form, zod, axios, lucide-react, sonner
4. Configure Tailwind with the custom color palette from TRD Section 9.3
5. Configure the Vite API proxy: `/api` → `http://localhost:8000`
6. Create the FastAPI backend:
   ```
   mkdir backend && cd backend
   python -m venv venv && source venv/bin/activate
   pip install -r requirements.txt
   ```
7. Create the `.env` file with all variables from TRD Section 12.2
8. Verify the environment works: `uvicorn main:app --reload` returns 200 on `GET /health`

---

## PHASE 4: Core Build (follow the sequence from Phase 2.2)

Begin building in task order. For each task:
1. Write the code
2. Verify it works (describe the test or verification step)
3. State "Task N complete — ready for Task N+1" before proceeding

**Never skip verification between tasks.** A broken database model will break every service built on top of it.

**Key implementation details to follow exactly:**

### Database
- Use SQLAlchemy 2.x with the exact schema from TRD Section 4
- Create all 8 tables: users, ai_systems, legal_documents, explainability_artifacts, bias_check_results, policy_evaluation_results, audit_log, notifications
- Create all indexes from TRD Section 4.2
- The audit_log table must register SQLAlchemy event listeners that raise exceptions on UPDATE and DELETE (TRD Section 8.2)

### Audit Log
- Every governance event must write to audit_log using the `compute_entry_hash` function from TRD Section 8.1 exactly
- Genesis entry uses `'0' * 64` as previous_hash
- The `verify_chain_integrity` function must walk ALL entries and recompute each hash
- Audit log entries must flow through a single `audit_service.py` — never insert directly in route handlers

### Bias Check
- Load `maliba_proxy_dataset.csv` from `backend/data/`
- Use Fairlearn's `MetricFrame` to compute metrics per subgroup dimension
- Hard block threshold: DIR < 0.80
- Run as a `BackgroundTask` triggered after successful submission
- Write PASS/FAIL result to `bias_check_results` table
- Write to audit log with full result as `event_data`
- Trigger policy evaluation as a subsequent background task on PASS

### Policy Engine
- Implement all 12 rules from TRD Section 7.1 as individual functions
- Return a result object for ALL 12 rules, including passed ones
- Verdict logic: any critical rule fail → FAIL; only non-critical failures → CONDITIONAL_PASS; all pass → PASS
- Return remediation guidance from TRD Section 7.3 for each failed rule
- Write to audit log with full rule_results as `event_data`
- On PASS: update ai_system lifecycle_status to 'SHADOW_MODE' and set registration_expires_at = now + 365 days

### Frontend Design Principles
- Use the color palette from TRD Section 9.3 throughout — do not invent new colors
- Every lifecycle status badge: colored background + text label + Lucide icon
  - SHADOW_MODE: blue + "Shadow Mode" + Clock icon
  - CANARY_MODE: amber + "Canary Mode" + Beaker icon  
  - PRODUCTION: green + "Production" + CheckCircle icon
  - SUSPENDED: red + "Suspended" + PauseCircle icon
  - EXPIRED: gray + "Expired" + XCircle icon
  - REJECTED: red + "Rejected" + Ban icon
  - PENDING_REVIEW: gray + "Pending Review" + Hourglass icon
- Policy rule results: green CheckCircle (PASS) / red XCircle (FAIL) / amber AlertTriangle (WARNING)
- All loading states: skeleton loaders (not spinners on blank pages)
- Mobile responsive: all pages usable on a 375px viewport

### Vendor Submission Wizard
- 5 steps matching PRD Feature 1: System Info → Risk Classification → Legal Documents → Technical Evidence → Review & Submit
- Progress indicator showing step number and name
- Each step validates before allowing progression to next step
- Step 3 (Legal Documents): File upload with drag-and-drop; shows CBA template download link
- Step 4 (Technical Evidence): Accepts LIME/SHAP artifact (JSON or PDF); shows validation status
- Step 5 (Review): Shows all entered data; "Edit" links for each section; Submit button disabled until all required fields confirmed
- After submission: show Submission ID prominently and explain the next steps (bias check running → policy evaluation → result notification)

### Ministry Dashboard
- Summary stats row: 4 cards with large numbers — Total Systems / In Production / Pending Review / Expiring Within 30 Days
- System status donut chart (Recharts) showing count by lifecycle stage
- Alert panel: shows all systems with registration_expires_at within 30 days and all REJECTED submissions in last 7 days
- Recent activity: last 10 audit log events with event type icon, system name, timestamp
- Compliance gauge: % of active systems (SHADOW/CANARY/PRODUCTION) with all policy checks passing

### Registry and System Detail
- Registry page: searchable, filterable table (by status, risk level, vendor, use case)
- System detail page: tabbed layout
  - Tab 1 "Overview": system metadata, lifecycle status, CBA/SCC status
  - Tab 2 "Bias Check": subgroup results table with DIR bar chart (Recharts), pass/fail per subgroup
  - Tab 3 "Policy Evaluation": all 12 rules with pass/fail icons, verdict banner, remediation panel if failed
  - Tab 4 "Documents": list of all uploaded documents with download links
  - Tab 5 "Audit Trail": filtered audit log for this system
- Lifecycle action bar: Promote button (if eligible), Suspend button — both open confirmation modal
- Promote modal: shows current stage → next stage, requires checkbox confirmation, writes to audit log
- Suspend modal: requires typed justification, writes to audit log

### Audit Log Viewer
- Paginated table: 25 entries per page
- Filters: system name, event type, date range, actor type (VENDOR / MINISTRY / SYSTEM)
- Each row expandable to show full `event_data` JSON
- "Verify Chain Integrity" button: calls `POST /audit/verify-integrity`; shows INTACT (green) or TAMPERED (red) result with first tampered sequence number if applicable
- "Export Audit Log" button: downloads complete JSON

---

## PHASE 5: Seed Data

After all features are built, run the seed data script to populate:
- 3 Ministry user accounts (admin, reviewer_1, reviewer_2)
- 4 Vendor user accounts (one per demo AI system)
- All 4 demo AI systems from TRD Section 13 (in their respective lifecycle stages)
- Full bias reports and policy evaluation results for each
- 50 audit log entries with a valid hash chain
- Sample notifications

Verify seed data by:
1. Logging in as ministry_reviewer_1
2. Confirming dashboard shows 4 systems
3. Confirming TuberculoScan shows PRODUCTION status
4. Confirming ChestXray Analyzer shows REJECTED with failing rural subgroup
5. Running hash chain verification — should return INTACT

---

## PHASE 6: Demo Walkthrough Script

Once the prototype is running, verify it can demonstrate all five prototype features from PRD Section 6 in this order:

1. **Vendor Submission (Feature 1):** Log in as a vendor; submit a new AI system through all 5 wizard steps; confirm Submission ID is displayed and status shows "Pending Bias Check"
2. **Automated Bias Check (Feature 2):** Wait for background task to complete; refresh submission tracker; confirm bias report is generated with subgroup results
3. **Policy Evaluation (Feature 3):** Confirm policy evaluation ran automatically after bias check; view 12-rule breakdown; confirm verdict is displayed
4. **Immutable Audit Log (Feature 4):** Log in as ministry_reviewer; navigate to Audit Log; find the submission events; run hash chain verification; confirm INTACT
5. **Ministry Dashboard (Feature 5):** View dashboard summary; find the new system in "Shadow Mode"; use the Promote button to move it to Canary Mode; confirm audit log entry is created

If all five steps complete without errors, the prototype is demo-ready.

---

## CRITICAL CONSTRAINTS — Never Violate

1. **Open-source only.** No paid APIs, no commercial SaaS, no licensed libraries. Every dependency must be free.
2. **No PHI.** The synthetic dataset is the only patient-related data. Never create endpoints that accept or store real patient records.
3. **Audit log is append-only.** There must be no endpoint, no UI control, and no ORM path that modifies or deletes an audit log entry.
4. **All 12 policy rules must evaluate.** Never short-circuit the evaluation after the first failure; all rules run and all results are returned.
5. **Hard blocks cannot be overridden by vendors.** Only a Ministry Admin can grant a conditional waiver, and it must be logged.
6. **Every status must show color + text + icon.** Never rely on color alone to convey status — this is both an accessibility requirement and a usability requirement for users with limited digital literacy.

---

## START COMMAND

Begin with Phase 1. Read both specification documents, then respond with your Phase 2 implementation plan. Do not write any code until I confirm the implementation plan looks correct.

=== END PROMPT ===

---

## SUPPLEMENTARY CONTEXT (for your reference — do not paste into the AI session)

### What the prototype proves

The competition judges need to see these five things working end-to-end:

1. **Zero-Trust is real.** A vendor cannot self-declare their model is fair. The bias check runs automatically on Maliba-specific demographic data and produces a hard block the vendor cannot dismiss.

2. **Zero-Bureaucracy is real.** A Ministry program manager with no AI expertise can view all registered systems, see their compliance status, promote a model through lifecycle stages, and generate a tamper-evident audit trail — without understanding a single line of the underlying code.

3. **WHO principles are code, not PDF.** The 12-rule policy engine directly maps each WHO ethical principle to a concrete, machine-enforced gate. Section 4 of the PRD and Section 7 of the TRD show this mapping explicitly.

4. **Accountability is structural.** Every governance decision — including automated ones — is in the hash-chained audit log. The Ministry can verify at any time that the log has not been tampered with.

5. **This can run in Maliba.** The entire stack is free, open-source, and runs on a single server. No cloud dependency. No AI expertise required to operate it. The Fairlearn library replaces the data science team.

### Connection to Equalyze (team internal note)

The bias detection pipeline, the audit log hash-chain pattern, and the override-logging concept are directly reusable from what was built for Equalyze:
- Equalyze's Counterfactual Twin Engine's fairness-testing logic → maps to the Fairlearn MetricFrame integration in `bias_check_service.py`
- Equalyze's audit log design → maps directly to the `audit_log` table + `audit_service.py` hash chain
These are not from-scratch builds; they are adaptations of proven components.

### Antigravity IDE tips

- Set up the Vite API proxy immediately (Phase 3 step 5) — this eliminates the most common development friction (CORS errors in dev)
- Run backend and frontend in separate terminal panes simultaneously
- Use the `.env` file from the start — hardcoding secrets is a common mistake that causes deployment issues
- SQLite is fine for the prototype; the file-based nature means the whole database is a single file you can inspect, back up, and reset trivially
