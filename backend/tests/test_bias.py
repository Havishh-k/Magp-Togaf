import pytest
from services.bias_service import run_bias_check

def test_run_bias_check():
    results = run_bias_check()
    assert 'overall_status' in results
    assert 'min_disparate_impact_ratio' in results
    assert 'failed_subgroups' in results
    
    # Assert specific fields
    assert isinstance(results['min_disparate_impact_ratio'], float)
    
    # Since dataset is rigged for Rural+Basic to fail, 
    # we expect DIR < 0.8 for location_type or equipment_tier
    assert results['overall_status'] == "FAIL"
    assert len(results['failed_subgroups']) > 0
    assert 'human_readable_summary' in results
