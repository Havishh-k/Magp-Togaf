import React, { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, ShieldAlert, Key, AlignJustify, List } from 'lucide-react';
import SkeletonLoader from '../components/SkeletonLoader';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';

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
    return <div className="p-8 text-center font-medium">Unauthorized. Ministry access only.</div>;
  }

  const getRowClass = (log) => {
    const isExpanded = expandedRow === log.id;
    let baseClass = isExpanded ? "bg-slate-100 shadow-inner" : "cursor-pointer";
    if (verifyStatus !== 'invalid' || !tamperedSeq) return baseClass;
    if (log.sequence_number === tamperedSeq) return baseClass + " bg-destructive/10 border-l-4 border-destructive hover:bg-destructive/10";
    if (log.sequence_number > tamperedSeq) return baseClass + " bg-warning/10 border-l-4 border-warning-500 hover:bg-warning/10";
    return baseClass;
  };

  const toggleRow = (id) => {
    setExpandedRow(prev => prev === id ? null : id);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Cryptographic Audit Log</h1>
          <p className="text-sm text-slate-500">Immutable hash-chain ledger of all system events. Click a row to view details.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex bg-slate-100 rounded-md p-1 border border-slate-200">
            <button 
              onClick={() => setDensity('comfortable')}
              className={`p-1.5 rounded-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary ${density === 'comfortable' ? 'bg-white shadow-sm text-primary' : 'text-slate-500 hover:text-slate-700'}`}
              title="Comfortable Density"
            >
              <AlignJustify className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setDensity('compact')}
              className={`p-1.5 rounded-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary ${density === 'compact' ? 'bg-white shadow-sm text-primary' : 'text-slate-500 hover:text-slate-700'}`}
              title="Compact Density"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          <Button 
            onClick={verifyChain}
            disabled={verifyStatus === 'checking'}
            className="gap-2"
          >
            <Key className="w-4 h-4" />
            {verifyStatus === 'checking' ? 'Verifying...' : 'Verify Chain Integrity'}
          </Button>
        </div>
      </div>

      {verifyStatus === 'valid' && (
        <div className="bg-success/10 border border-success/20 text-success-800 p-4 rounded-md flex items-center gap-3">
          <ShieldCheck className="w-5 h-5" />
          <div>
            <p className="font-bold">Chain Integrity Verified</p>
            <p className="text-sm">All cryptographic hashes line up perfectly. No tampering detected.</p>
          </div>
        </div>
      )}

      {verifyStatus === 'invalid' && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-md flex items-center gap-3 animate-pulse">
          <ShieldAlert className="w-8 h-8 text-destructive" />
          <div>
            <p className="font-bold text-lg">CRITICAL ALERT: Integrity Violation Detected</p>
            <p className="text-sm font-medium">The cryptographic chain is broken. This indicates data tampering starting at sequence #{tamperedSeq}.</p>
          </div>
        </div>
      )}

      <Card className="overflow-hidden flex flex-col max-h-[600px] p-0">
        <CardContent className="p-0 flex-1 overflow-auto">
          {loading ? (
            <SkeletonLoader rows={10} />
          ) : (
            <Table className={`whitespace-nowrap ${density === 'compact' ? '[&_td]:py-2 [&_th]:py-2' : ''}`}>
              <TableHeader>
                <TableRow>
                  <TableHead className="sticky top-0 bg-white z-10">Seq</TableHead>
                  <TableHead className="sticky top-0 bg-white z-10">Timestamp</TableHead>
                  <TableHead className="sticky top-0 bg-white z-10">Event</TableHead>
                  <TableHead className="sticky top-0 bg-white z-10">System ID</TableHead>
                  <TableHead className="sticky top-0 bg-white z-10">Actor</TableHead>
                  <TableHead className="sticky top-0 bg-white z-10">Hash Fragment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map(log => (
                  <React.Fragment key={log.id}>
                    <TableRow onClick={() => toggleRow(log.id)} className={`font-mono text-sm ${getRowClass(log)}`}>
                      <TableCell className="text-slate-500">#{log.sequence_number}</TableCell>
                      <TableCell className="text-slate-600">{new Date(log.timestamp).toLocaleString()}</TableCell>
                      <TableCell className="font-bold text-slate-900">{log.event_type}</TableCell>
                      <TableCell className="text-slate-600">{log.system_id ? log.system_id.substring(0, 8) + '...' : 'N/A'}</TableCell>
                      <TableCell className="text-slate-600">{log.actor_type}</TableCell>
                      <TableCell className="text-slate-400">
                        {log.entry_hash ? log.entry_hash.substring(0, 16) + '...' : 'N/A'}
                      </TableCell>
                    </TableRow>
                    {expandedRow === log.id && (
                      <TableRow className="bg-slate-50 hover:bg-slate-50">
                        <TableCell colSpan={6} className="p-4">
                          <Card className="shadow-sm">
                            <CardContent className="p-4 font-sans">
                              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Event Payload Summary</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {Object.entries(log.event_data || {}).map(([key, value]) => (
                                  <div key={key} className="flex flex-col">
                                    <span className="text-xs text-slate-500 capitalize">{key.replace(/_/g, ' ')}</span>
                                    <span className="text-sm font-medium text-slate-900 truncate" title={String(value)}>
                                      {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
