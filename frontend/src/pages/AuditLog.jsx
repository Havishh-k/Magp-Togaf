import React, { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, ShieldAlert, Key, AlignJustify, List } from 'lucide-react';
import SkeletonLoader from '../components/SkeletonLoader';

export default function AuditLogViewer() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifyStatus, setVerifyStatus] = useState(null); // 'checking', 'valid', 'invalid'
  const [tamperedSeq, setTamperedSeq] = useState(null);
  const [density, setDensity] = useState('comfortable');
  const [expandedRow, setExpandedRow] = useState(null);
  const { user } = useAuth();

  const fetchLogs = () => {
    if (user?.role === 'ministry') {
      api.get('/audit/')
        .then(res => setLogs(res.data))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [user]);

  // Hidden trigger for sabotage
  useEffect(() => {
    const handleKeyDown = async (e) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        try {
          await api.post('/audit/sabotage');
          fetchLogs();
          verifyChain();
        } catch (err) {
          console.error("Sabotage failed", err);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [user]);

  const verifyChain = async () => {
    setVerifyStatus('checking');
    setTamperedSeq(null);
    try {
      const res = await api.post('/audit/verify');
      if (res.data.valid) {
        setVerifyStatus('valid');
      } else {
        setVerifyStatus('invalid');
        setTamperedSeq(res.data.first_tampered_sequence);
      }
    } catch (err) {
      setVerifyStatus('invalid');
    }
  };

  if (user?.role !== 'ministry') {
    return <div className="p-8 text-center">Unauthorized. Ministry access only.</div>;
  }

  const getRowClass = (log) => {
    const isExpanded = expandedRow === log.id;
    let baseClass = isExpanded ? "bg-neutral-100 shadow-inner" : "hover:bg-neutral-50 cursor-pointer";
    if (verifyStatus !== 'invalid' || !tamperedSeq) return baseClass;
    if (log.sequence_number === tamperedSeq) return baseClass + " bg-danger-100 border-l-4 border-danger-600";
    if (log.sequence_number > tamperedSeq) return baseClass + " bg-amber-50 border-l-4 border-amber-500";
    return baseClass;
  };

  const toggleRow = (id) => {
    setExpandedRow(prev => prev === id ? null : id);
  };

  const tdClass = density === 'compact' ? 'px-4 py-2' : 'px-6 py-4';
  const thClass = density === 'compact' ? 'px-4 py-2 text-xs font-semibold text-neutral-600 uppercase sticky top-0 bg-neutral-50 shadow-sm z-10' : 'px-6 py-3 text-xs font-semibold text-neutral-600 uppercase sticky top-0 bg-neutral-50 shadow-sm z-10';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Cryptographic Audit Log</h1>
          <p className="text-sm text-neutral-500">Immutable hash-chain ledger of all system events. Click a row to view details.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex bg-neutral-100 rounded-lg p-1 border border-neutral-200">
            <button 
              onClick={() => setDensity('comfortable')}
              className={`p-1.5 rounded-md transition-colors ${density === 'comfortable' ? 'bg-white shadow-sm text-primary-700' : 'text-neutral-500 hover:text-neutral-700'}`}
              title="Comfortable Density"
            >
              <AlignJustify className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setDensity('compact')}
              className={`p-1.5 rounded-md transition-colors ${density === 'compact' ? 'bg-white shadow-sm text-primary-700' : 'text-neutral-500 hover:text-neutral-700'}`}
              title="Compact Density"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          <button 
            onClick={verifyChain}
            disabled={verifyStatus === 'checking'}
            className="flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Key className="w-4 h-4" />
            {verifyStatus === 'checking' ? 'Verifying...' : 'Verify Chain Integrity'}
          </button>
        </div>
      </div>

      {verifyStatus === 'valid' && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-lg flex items-center gap-3">
          <ShieldCheck className="w-5 h-5" />
          <div>
            <p className="font-bold">Chain Integrity Verified</p>
            <p className="text-sm">All cryptographic hashes line up perfectly. No tampering detected.</p>
          </div>
        </div>
      )}

      {verifyStatus === 'invalid' && (
        <div className="bg-danger-50 border border-danger-200 text-danger-800 p-4 rounded-lg flex items-center gap-3 animate-pulse">
          <ShieldAlert className="w-8 h-8 text-danger-600" />
          <div>
            <p className="font-bold text-lg">CRITICAL ALERT: Integrity Violation Detected</p>
            <p className="text-sm font-medium">The cryptographic chain is broken. This indicates data tampering starting at sequence #{tamperedSeq}.</p>
          </div>
        </div>
      )}

      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden flex flex-col max-h-[600px]">
        {loading ? (
          <SkeletonLoader rows={10} />
        ) : (
          <div className="overflow-auto flex-1 relative">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr>
                  <th className={thClass}>Seq</th>
                  <th className={thClass}>Timestamp</th>
                  <th className={thClass}>Event</th>
                  <th className={thClass}>System ID</th>
                  <th className={thClass}>Actor</th>
                  <th className={thClass}>Hash Fragment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {logs.map(log => (
                  <React.Fragment key={log.id}>
                    <tr onClick={() => toggleRow(log.id)} className={`font-mono text-sm transition-colors ${getRowClass(log)}`}>
                      <td className={`${tdClass} text-neutral-500`}>#{log.sequence_number}</td>
                      <td className={`${tdClass} text-neutral-600`}>{new Date(log.timestamp).toLocaleString()}</td>
                      <td className={`${tdClass} font-bold text-neutral-900`}>{log.event_type}</td>
                      <td className={`${tdClass} text-neutral-600`}>{log.system_id ? log.system_id.substring(0, 8) + '...' : 'N/A'}</td>
                      <td className={`${tdClass} text-neutral-600`}>{log.actor_type}</td>
                      <td className={`${tdClass} text-neutral-400`}>
                        {log.entry_hash ? log.entry_hash.substring(0, 16) + '...' : 'N/A'}
                      </td>
                    </tr>
                    {expandedRow === log.id && (
                      <tr className="bg-neutral-50 border-b border-neutral-200">
                        <td colSpan="6" className="px-6 py-4">
                          <div className="bg-white border border-neutral-200 rounded-lg p-4 font-sans shadow-sm">
                            <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Event Payload Summary</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {Object.entries(log.event_data || {}).map(([key, value]) => (
                                <div key={key} className="flex flex-col">
                                  <span className="text-xs text-neutral-500 capitalize">{key.replace(/_/g, ' ')}</span>
                                  <span className="text-sm font-medium text-neutral-900 truncate" title={String(value)}>
                                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
