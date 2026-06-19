import React, { useState } from 'react';
import api from '../api';
import { Activity, SlidersHorizontal, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import BiasReport from './BiasReport';

export default function StressTestPanel() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false); // Collapsed by default
  
  // Default weights: 1.0 means original distribution
  const [weights, setWeights] = useState({
    location_type: { Rural: 1.0, Urban: 1.0 },
    gender: { Male: 1.0, Female: 1.0 },
    ethnicity: { Mande: 1.0, Fula: 1.0, Voltaic: 1.0, Other: 1.0 }
  });

  const handleWeightChange = (category, valueKey, newValue) => {
    setWeights(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [valueKey]: parseFloat(newValue)
      }
    }));
  };

  const runSimulation = async () => {
    setLoading(true);
    setResults(null);
    try {
      const res = await api.post('/bias/stress-test', { weights });
      setResults(res.data);
    } catch (err) {
      console.error(err);
      alert("Simulation failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden mb-6 transition-all duration-300">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 border-b border-neutral-200 bg-neutral-50 flex items-center justify-between hover:bg-neutral-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-bold text-neutral-900">Ephemeral Stress Test Simulation</h2>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs font-semibold px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full">
            Sandboxed
          </span>
          {isExpanded ? <ChevronUp className="w-5 h-5 text-neutral-500" /> : <ChevronDown className="w-5 h-5 text-neutral-500" />}
        </div>
      </button>
      
      {isExpanded && (
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-neutral-100">
          {/* Controls */}
          <div className="col-span-1 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <SlidersHorizontal className="w-4 h-4 text-neutral-500" />
                <h3 className="font-semibold text-neutral-700">Demographic Weights</h3>
              </div>
              
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {Object.entries(weights).map(([category, vals]) => (
                  <div key={category} className="space-y-3 bg-neutral-50 p-4 rounded-lg border border-neutral-200">
                    <h4 className="text-sm font-bold text-neutral-800 capitalize">{category.replace('_', ' ')}</h4>
                    {Object.entries(vals).map(([k, v]) => (
                      <div key={k}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-neutral-600">{k}</span>
                          <span className="font-mono text-indigo-600">{v.toFixed(1)}x</span>
                        </div>
                        <input 
                          type="range" 
                          min="0.1" 
                          max="5.0" 
                          step="0.1" 
                          value={v}
                          onChange={(e) => handleWeightChange(category, k, e.target.value)}
                          className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            
            <button 
              onClick={runSimulation}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
              {loading ? 'Simulating...' : 'Run Simulation'}
            </button>
          </div>

          {/* Results */}
          <div className="col-span-1 md:col-span-2">
            {results ? (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <h3 className="font-semibold text-neutral-700 mb-4">Simulation Results (Delta)</h3>
                <BiasReport biasData={results} />
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-neutral-400 border-2 border-dashed border-neutral-200 rounded-xl p-8">
                <Activity className="w-12 h-12 mb-3 text-neutral-300" />
                <p>Adjust weights and run simulation to see ephemeral bias impact.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
