import pytest
from datetime import datetime, timezone
from services.policy_engine import evaluate_policy, SubmissionBundle, BiasCheckResultInput

def test_evaluate_policy_all_pass():
    bundle = SubmissionBundle(
        system_id="sys1",
        submission_id="sub1",
        vendor_id="v1",
        intended_use_case="dx",
        target_population="adults",
        deployment_timeline="Q1",
        training_data_documentation="docs",
        local_validation_evidence="evidence",
        override_mechanism_documented=True,
        risk_classification="HIGH",
        registration_expires_at=None,
        legal_documents=[
            {"document_type": "CBA", "status": "SIGNED", "technology_transfer_obligation_present": True},
            {"document_type": "SCC", "status": "PENDING", "technology_transfer_obligation_present": False}
        ],
        explainability_artifacts=[{"artifact_date": datetime.now(timezone.utc).isoformat()}]
    )
    bias = BiasCheckResultInput(
        overall_status="PASS",
        failed_subgroups=[],
        subgroup_results={
            "location_type:Rural": {"dir": 0.9},
            "equipment_tier:Basic": {"dir": 0.95},
            "age_band:Adult": {"dir": 1.0},
            "gender:F": {"dir": 0.99}
        }
    )
    
    res = evaluate_policy(bundle, bias)
    assert res.verdict == "PASS"
    assert len(res.rule_results) == 12
    assert len(res.failed_critical_rules) == 0

def test_evaluate_policy_fail():
    bundle = SubmissionBundle(
        system_id="sys1",
        submission_id="sub1",
        vendor_id="v1",
        intended_use_case="dx",
        target_population="adults",
        deployment_timeline="Q1",
        training_data_documentation="docs",
        local_validation_evidence=None, # Fails POL-003
        override_mechanism_documented=True,
        risk_classification="HIGH",
        registration_expires_at=None,
        legal_documents=[
            {"document_type": "CBA", "status": "PENDING", "technology_transfer_obligation_present": False} # Fails POL-007, POL-011
        ],
        explainability_artifacts=[] # Fails POL-001
    )
    bias = BiasCheckResultInput(
        overall_status="FAIL", # Fails POL-004
        failed_subgroups=["location_type:Rural"],
        subgroup_results={
            "location_type:Rural": {"dir": 0.5}, # Fails POL-010
            "equipment_tier:Basic": {"dir": 0.95},
            "age_band:Adult": {"dir": 1.0},
            "gender:F": {"dir": 0.99}
        }
    )
    
    res = evaluate_policy(bundle, bias)
    assert res.verdict == "FAIL"
    assert len(res.rule_results) == 12
    assert "POL-001" in res.failed_critical_rules
    assert "POL-003" in res.failed_critical_rules
    assert "POL-004" in res.failed_critical_rules
    assert "POL-007" in res.failed_critical_rules
    assert "POL-010" in res.failed_critical_rules
    assert "POL-011" in res.failed_critical_rules
