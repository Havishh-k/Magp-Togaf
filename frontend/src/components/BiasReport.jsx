import React from 'react';
import { Sparkles, AlertTriangle, CheckCircle } from 'lucide-react';

export default function BiasReport({ biasData }) {
  if (!biasData) return null;

  const {
    overall_status,
    human_readable_summary,
    subgroup_results,
    failed_subgroups
  } = biasData;

  const isPass = overall_status === "PASS";

  return (
    <div className="space-y-6">
      {/* AI Summary Card */}
      <div className="bg-primary-50 border border-primary-200 rounded-xl p-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Sparkles className="w-24 h-24 text-primary-500" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1 bg-primary-100 text-primary-700 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3 h-3" />
              AI Summary
            </span>
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
              isPass ? 'bg-success-100 text-success-800' : 'bg-danger-100 text-danger-800'
            }`}>
              {isPass ? <CheckCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
              {overall_status}
            </span>
          </div>
          <p className="text-lg text-primary-900 font-medium leading-relaxed max-w-3xl">
            {human_readable_summary || "No summary available."}
          </p>
        </div>
      </div>

      {/* Subgroup Metrics */}
      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-neutral-200 bg-neutral-50">
          <h3 className="text-base font-semibold text-neutral-900">Subgroup Disparate Impact Ratios (DIR)</h3>
          <p className="text-sm text-neutral-500">Threshold for passing is &ge; 0.80</p>
        </div>
        <div className="divide-y divide-neutral-200">
          {Object.entries(subgroup_results || {}).map(([group, metrics]) => {
            const dir = metrics.disparate_impact_ratio;
            const hasFailed = failed_subgroups?.includes(group);
            
            return (
              <div key={group} className="px-6 py-4 flex items-center justify-between hover:bg-neutral-50 transition-colors">
                <div>
                  <div className="font-medium text-neutral-900 capitalize">{group.replace('_', ' ')}</div>
                  <div className="text-sm text-neutral-500">
                    Demographic Parity Diff: {metrics.demographic_parity_difference.toFixed(3)}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className={`text-lg font-bold ${hasFailed ? 'text-danger-600' : 'text-success-600'}`}>
                      {dir.toFixed(2)}
                    </div>
                    <div className="text-xs text-neutral-500">DIR Score</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
