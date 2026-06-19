import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Activity } from 'lucide-react';

export default function ExplainabilityChart({ data }) {
  if (!data || data.length === 0) return null;

  // Sort data by importance score descending for better visualization
  const sortedData = [...data].sort((a, b) => b.importance_score - a.importance_score);

  return (
    <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-neutral-200 bg-neutral-50 flex items-center gap-2">
        <Activity className="w-5 h-5 text-indigo-600" />
        <h3 className="text-base font-semibold text-neutral-900">Feature Importance (SHAP/LIME)</h3>
      </div>
      <div className="p-6">
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={sortedData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
              <XAxis type="number" stroke="#6b7280" fontSize={12} />
              <YAxis 
                dataKey="feature_name" 
                type="category" 
                stroke="#374151" 
                fontSize={12}
                tick={{ fill: '#374151' }}
              />
              <Tooltip 
                cursor={{ fill: '#f3f4f6' }}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="importance_score" radius={[0, 4, 4, 0]}>
                {sortedData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.importance_score > 0.5 ? '#dc2626' : '#16a34a'} // success-600 vs danger-600
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-4 text-sm text-neutral-500">
          * Red bars (score &gt; 0.5) indicate features that have an outsized, potentially risky influence on the model's predictions. Green bars indicate normal feature importance.
        </p>
      </div>
    </div>
  );
}
