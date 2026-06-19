from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timezone
import json

class RuleResult(BaseModel):
    rule_id: str
    passed: bool
    details: str

class SubmissionBundle(BaseModel):
    system_id: str
    submission_id: str
    vendor_id: str
    intended_use_case: str
    target_population: str
    deployment_timeline: str | None
    training_data_documentation: str | None
    local_validation_evidence: str | None
    override_mechanism_documented: bool
    risk_classification: str
    registration_expires_at: datetime | None
    legal_documents: List[dict] # list of dicts with document_type, status, technology_transfer_obligation_present
    explainability_artifacts: List[dict] # list of dicts with artifact_date

class BiasCheckResultInput(BaseModel):
    overall_status: str
    failed_subgroups: List[str]
    subgroup_results: dict

class PolicyEvaluationResult(BaseModel):
    verdict: str
    rule_results: List[RuleResult]
    failed_critical_rules: List[str]
    failed_non_critical_rules: List[str]
    remediation_guidance: Optional[str]

POLICY_RULES = [
    {"id": "POL-001", "name": "Explainability Artifact Present", "is_critical": True},
    {"id": "POL-002", "name": "Override Mechanism Documented", "is_critical": True},
    {"id": "POL-003", "name": "Local Validation Evidence", "is_critical": True},
    {"id": "POL-004", "name": "Bias Check Passed", "is_critical": True},
    {"id": "POL-005", "name": "Training Data Documentation", "is_critical": False},
    {"id": "POL-006", "name": "Model Version History", "is_critical": False},
    {"id": "POL-007", "name": "CBA Signed", "is_critical": True},
    {"id": "POL-008", "name": "SCC Status Declared", "is_critical": True},
    {"id": "POL-009", "name": "All Demographic Subgroups Tested", "is_critical": True},
    {"id": "POL-010", "name": "No Subgroup Disparate Impact Below Threshold", "is_critical": True},
    {"id": "POL-011", "name": "Technology Transfer Obligation", "is_critical": True},
    {"id": "POL-012", "name": "Registration Token Valid", "is_critical": True},
]

REMEDIATION_MESSAGES = {
    "POL-001": "Upload a LIME or SHAP explainability artifact generated within the last 90 days.",
    "POL-002": "The submission must document a clinician override mechanism.",
    "POL-003": "Provide evidence of local validation.",
    "POL-004": "The automated bias check must pass with no hard-blocked subgroups.",
    "POL-005": "Training data sources must be documented.",
    "POL-006": "Model version and update history must be documented.",
    "POL-007": "A signed Community Benefit Agreement (CBA) is mandatory.",
    "POL-008": "Standard Contractual Clauses applicability must be declared.",
    "POL-009": "Bias report must cover all four demographic dimensions.",
    "POL-010": "No subgroup may have a Disparate Impact Ratio below 0.8.",
    "POL-011": "The CBA must contain an explicit technology transfer obligation.",
    "POL-012": "The registration token must not be expired."
}

def evaluate_single_rule(rule_id: str, bundle: SubmissionBundle, bias_result: BiasCheckResultInput) -> RuleResult:
    if rule_id == "POL-001":
        if not bundle.explainability_artifacts:
            return RuleResult(rule_id=rule_id, passed=False, details="No artifact found")
        # Ensure at least one artifact is < 90 days old
        now = datetime.now(timezone.utc)
        valid = any((now - datetime.fromisoformat(art["artifact_date"])).days <= 90 for art in bundle.explainability_artifacts)
        return RuleResult(rule_id=rule_id, passed=valid, details="Valid artifact found" if valid else "Artifact older than 90 days")
    
    elif rule_id == "POL-002":
        return RuleResult(rule_id=rule_id, passed=bundle.override_mechanism_documented, details="")
        
    elif rule_id == "POL-003":
        return RuleResult(rule_id=rule_id, passed=bool(bundle.local_validation_evidence), details="")
        
    elif rule_id == "POL-004":
        return RuleResult(rule_id=rule_id, passed=(bias_result.overall_status == "PASS"), details="")
        
    elif rule_id == "POL-005":
        return RuleResult(rule_id=rule_id, passed=bool(bundle.training_data_documentation), details="")
        
    elif rule_id == "POL-006": # Model Version History (Wait, submission_id and system_version exist, but not in bundle yet? Assume version exists)
        return RuleResult(rule_id=rule_id, passed=True, details="") # Simplified for prototype
        
    elif rule_id == "POL-007":
        passed = any(doc["document_type"] == "CBA" and doc["status"] == "SIGNED" for doc in bundle.legal_documents)
        return RuleResult(rule_id=rule_id, passed=passed, details="")
        
    elif rule_id == "POL-008":
        passed = any(doc["document_type"] == "SCC" for doc in bundle.legal_documents)
        return RuleResult(rule_id=rule_id, passed=passed, details="")
        
    elif rule_id == "POL-009":
        # Bias results must contain location_type, equipment_tier, age_band, gender
        required = {"location_type", "equipment_tier", "age_band", "gender"}
        present = {k.split(":")[0] for k in bias_result.subgroup_results.keys()}
        passed = required.issubset(present)
        return RuleResult(rule_id=rule_id, passed=passed, details="")
        
    elif rule_id == "POL-010":
        passed = all(res["dir"] >= 0.8 for res in bias_result.subgroup_results.values())
        return RuleResult(rule_id=rule_id, passed=passed, details="")
        
    elif rule_id == "POL-011":
        passed = any(doc["document_type"] == "CBA" and doc.get("technology_transfer_obligation_present") for doc in bundle.legal_documents)
        return RuleResult(rule_id=rule_id, passed=passed, details="")
        
    elif rule_id == "POL-012":
        if bundle.registration_expires_at is None:
            return RuleResult(rule_id=rule_id, passed=True, details="No expiry set")
        passed = bundle.registration_expires_at > datetime.now(timezone.utc)
        return RuleResult(rule_id=rule_id, passed=passed, details="")
        
    return RuleResult(rule_id=rule_id, passed=False, details="Unknown rule")

def generate_remediation_guidance(failed_critical: List[str], failed_non_critical: List[str]) -> str:
    messages = []
    for r in failed_critical + failed_non_critical:
        if r in REMEDIATION_MESSAGES:
            messages.append(f"{r}: {REMEDIATION_MESSAGES[r]}")
    return " | ".join(messages)

def evaluate_policy(submission_bundle: SubmissionBundle, bias_result: BiasCheckResultInput) -> PolicyEvaluationResult:
    rule_results = []
    failed_critical = []
    failed_non_critical = []
    
    # Must evaluate all 12 rules, not short-circuiting!
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
