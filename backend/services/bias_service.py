import pandas as pd
from fairlearn.metrics import MetricFrame, selection_rate, demographic_parity_difference, equalized_odds_difference
from sklearn.metrics import accuracy_score
import os
from main import settings

def load_proxy_data():
    filepath = os.path.join("data", "maliba_proxy_dataset.csv")
    if not os.path.exists(filepath):
        raise FileNotFoundError("Proxy dataset missing")
    return pd.read_csv(filepath)

def calculate_disparate_impact(y_true, y_pred, sensitive_features):
    mf = MetricFrame(metrics=selection_rate, y_true=y_true, y_pred=y_pred, sensitive_features=sensitive_features)
    rates = mf.by_group
    if rates.max() == 0:
        return 1.0
    return rates.min() / rates.max()

def run_bias_check(df=None, skip_llm=False):
    if df is None:
        df = load_proxy_data()
    y_true = df['condition_label']
    y_pred = df['model_prediction']
    
    subgroups = ['age_band', 'location_type', 'equipment_tier', 'gender', 'ethnicity']
    
    results = {
        'subgroup_results': {},
        'failed_subgroups': [],
        'min_disparate_impact_ratio': 1.0,
        'max_demographic_parity_difference': 0.0,
        'max_equalized_odds_difference': 0.0
    }
    
    overall_status = "PASS"
    human_readable = []
    
    for group in subgroups:
        sensitive_features = df[group]
        
        di = calculate_disparate_impact(y_true, y_pred, sensitive_features)
        dpd = demographic_parity_difference(y_true, y_pred, sensitive_features=sensitive_features)
        eod = equalized_odds_difference(y_true, y_pred, sensitive_features=sensitive_features)
        
        results['min_disparate_impact_ratio'] = min(results['min_disparate_impact_ratio'], di)
        results['max_demographic_parity_difference'] = max(results['max_demographic_parity_difference'], dpd)
        results['max_equalized_odds_difference'] = max(results['max_equalized_odds_difference'], eod)
        
        results['subgroup_results'][group] = {
            'disparate_impact_ratio': di,
            'demographic_parity_difference': dpd,
            'equalized_odds_difference': eod
        }
        
        if di < settings.BIAS_CHECK_DIR_THRESHOLD:
            overall_status = "FAIL"
            results['failed_subgroups'].append(group)
            human_readable.append(f"Failed disparate impact on {group}: {di:.2f} < {settings.BIAS_CHECK_DIR_THRESHOLD}")

    results['overall_status'] = overall_status
    
    if not skip_llm:
        from services.llm_service import explain_bias_report
        results['human_readable_summary'] = explain_bias_report(results['subgroup_results'])
    else:
        results['human_readable_summary'] = "Stress test simulation results."
        
    return results

def run_stress_test(weights: dict):
    """
    weights format: {'location_type': {'Rural': 5.0, 'Urban': 1.0}}
    """
    df = load_proxy_data()
    
    # Calculate row weights
    row_weights = pd.Series(1.0, index=df.index)
    for col, mapping in weights.items():
        if col in df.columns:
            mapped_weights = df[col].map(mapping).fillna(1.0)
            row_weights *= mapped_weights
            
    # Sample based on weights
    df_sampled = df.sample(n=len(df), replace=True, weights=row_weights, random_state=42)
    
    # Run bias check on sampled dataframe (skip LLM for speed in ephemeral testing)
    return run_bias_check(df=df_sampled, skip_llm=True)
