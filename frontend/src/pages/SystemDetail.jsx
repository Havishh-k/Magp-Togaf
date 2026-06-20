import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import ConfirmModal from '../components/ConfirmModal';
import { ArrowLeft, Download } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'sonner';

import BiasReport from '../components/BiasReport';
import ExplainabilityChart from '../components/ExplainabilityChart';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';

export default function SystemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const componentRef = useRef(null);
  
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Model_Card_${id}`,
  });
  
  const [sys, setSys] = useState(null);
  const [bias, setBias] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalConfig, setModalConfig] = useState({ isOpen: false, action: null, title: '', requireReason: false });

  const fetchSystem = async () => {
    try {
      const res = await api.get(`/registry/${id}`);
      setSys(res.data);
      try {
        const biasRes = await api.get(`/registry/${id}/bias`);
        setBias(biasRes.data);
      } catch(e) {
        // no bias data yet
      }
    } catch (err) {
      console.error(err);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystem();
  }, [id]);

  const handleAction = (actionType) => {
    if (actionType === 'REJECT') {
      setModalConfig({ isOpen: true, action: 'REJECT', title: 'Reject System', requireReason: true });
    } else if (actionType === 'SUSPEND') {
      setModalConfig({ isOpen: true, action: 'SUSPEND', title: 'Suspend System', requireReason: true });
    } else if (actionType === 'APPROVE') {
      api.post(`/registry/${id}/promote?new_status=APPROVED`).then(fetchSystem);
    } else if (actionType === 'SHADOW_MODE') {
      api.post(`/registry/${id}/promote?new_status=SHADOW_MODE`).then(fetchSystem);
    } else if (actionType === 'REACTIVATE') {
      api.post(`/registry/${id}/reactivate`).then(fetchSystem);
    }
  };

  const handleModalConfirm = async (reason) => {
    try {
      if (modalConfig.action === 'REJECT') {
        await api.post(`/registry/${id}/promote?new_status=REJECTED`);
      } else if (modalConfig.action === 'SUSPEND') {
        await api.post(`/registry/${id}/suspend`, { reason });
      }
    } catch (err) {
      console.error(err);
      alert('Action failed');
    } finally {
      setModalConfig({ isOpen: false, action: null, title: '', requireReason: false });
      fetchSystem();
    }
  };

  const handleFastForward = async () => {
    try {
      await api.post(`/registry/${id}/fast-forward`);
      toast.success('⏱️ Time Travel Simulated! Expiration date moved backward by 12 months.');
      fetchSystem();
    } catch (err) {
      console.error(err);
      toast.error('Fast-forward failed');
    }
  };

  if (loading) return <div className="p-8 font-medium">Loading...</div>;
  if (!sys) return null;

  const isExpired = sys.registration_expires_at && new Date(sys.registration_expires_at) < new Date();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center print:hidden">
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2 text-slate-600">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <div className="flex gap-2">
          {user?.role === 'ministry' && (
            <Button onClick={handleFastForward} variant="outline" className="gap-2 text-warning-700 bg-warning/10 hover:bg-warning/20 border-warning/20">
              ⏩ Fast-Forward 12 Months
            </Button>
          )}
          <Button onClick={() => handlePrint()} className="gap-2">
            <Download className="w-4 h-4" /> Download Model Card
          </Button>
        </div>
      </div>

      <Card ref={componentRef} className="print:shadow-none print:border-none">
        <CardContent className="p-8 print:p-0">
          <div className="flex justify-between items-start mb-6 pb-6 border-b border-slate-200">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{sys.system_name}</h1>
              <p className="text-slate-500 mt-1">Version {sys.system_version} • ID: {sys.submission_id}</p>
            </div>
            <StatusBadge status={sys.lifecycle_status} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">System Details</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex"><span className="text-slate-500 w-32 shrink-0">Organization:</span> <span className="font-medium text-slate-900">{sys.developer_organization}</span></li>
                <li className="flex"><span className="text-slate-500 w-32 shrink-0">Risk Level:</span> <span className="font-medium text-slate-900">{sys.risk_classification}</span></li>
                <li className="flex"><span className="text-slate-500 w-32 shrink-0">Vendor ID:</span> <span className="font-medium font-mono text-xs mt-0.5 text-slate-900">{sys.vendor_id}</span></li>
                <li className="flex"><span className="text-slate-500 w-32 shrink-0">Submitted:</span> <span className="font-medium text-slate-900">{new Date(sys.created_at).toLocaleDateString()}</span></li>
                {sys.registration_expires_at && (
                  <li className="flex"><span className="text-slate-500 w-32 shrink-0">Expires:</span> <span className="font-medium text-slate-900">{new Date(sys.registration_expires_at).toLocaleDateString()}</span></li>
                )}
              </ul>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Scope & Safety</h3>
                <ul className="space-y-3 text-sm">
                  <li className="flex flex-col">
                    <span className="text-slate-500 mb-1">Intended Use Case:</span> 
                    <span className="text-slate-900 bg-slate-50 p-2 rounded-md border border-slate-200">{sys.intended_use_case}</span>
                  </li>
                  <li className="flex flex-col">
                    <span className="text-slate-500 mb-1">Target Population:</span> 
                    <span className="text-slate-900 bg-slate-50 p-2 rounded-md border border-slate-200">{sys.target_population}</span>
                  </li>
                  <li className="flex items-center gap-2 mt-2">
                    <span className="text-slate-500">Human Override Mechanism:</span> 
                    {sys.override_mechanism_documented ? (
                       <span className="px-2 py-0.5 bg-success/10 text-success-700 rounded-md text-xs font-bold border border-success/20">DOCUMENTED</span>
                    ) : (
                       <span className="px-2 py-0.5 bg-destructive/10 text-destructive rounded-md text-xs font-bold border border-destructive/20">MISSING</span>
                    )}
                  </li>
                </ul>
              </div>
              {isExpired && (
                <div className="bg-destructive/10 p-5 rounded-lg border-2 border-destructive/30 animate-pulse print:animate-none">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">⚠️</span>
                    <h3 className="text-base font-bold text-destructive uppercase tracking-wide">Suspension Warning: Registration Expired</h3>
                  </div>
                  <p className="text-sm text-destructive font-medium leading-relaxed">
                    This AI model's registration timeline has completely elapsed. <strong>Data Drift</strong> may have occurred in the real world since it was last evaluated. Immediate human review and re-validation is required before it can be used again.
                  </p>
                </div>
              )}
              {sys.suspended_at && (
                <div className="bg-destructive/10 p-4 rounded-md border border-destructive/20">
                  <h3 className="text-sm font-semibold text-destructive mb-1">Suspension Notice</h3>
                  <p className="text-sm text-destructive">{sys.suspension_reason}</p>
                </div>
              )}
            </div>
          </div>

          {/* Explainability Chart Section */}
          {(() => {
            let explainData = null;
            try {
              if (sys.local_validation_evidence) {
                explainData = JSON.parse(sys.local_validation_evidence);
              }
            } catch(e) {
              // not valid JSON or not array
            }
            if (Array.isArray(explainData) && explainData.length > 0) {
              return (
                <div className="mb-8">
                  <ExplainabilityChart data={explainData} />
                </div>
              );
            }
            return null;
          })()}

          {/* Bias Report Section */}
          {bias && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Bias & Fairness Report</h2>
              <BiasReport biasData={bias} />
            </div>
          )}

          {user?.role === 'ministry' && (
            <div className="pt-6 border-t border-slate-200 flex gap-3 print:hidden">
              {sys.lifecycle_status === 'PENDING_REVIEW' && (
                <>
                  <Button onClick={() => handleAction('APPROVE')} className="bg-success text-success-foreground hover:bg-success/90">Approve</Button>
                  <Button onClick={() => handleAction('REJECT')} variant="destructive">Reject</Button>
                </>
              )}
              {sys.lifecycle_status === 'APPROVED' && (
                <Button onClick={() => handleAction('SHADOW_MODE')} className="bg-primary text-primary-foreground hover:bg-primary/90">Promote to Shadow Mode</Button>
              )}
              {sys.lifecycle_status !== 'SUSPENDED' && sys.lifecycle_status !== 'REJECTED' && (
                <Button onClick={() => handleAction('SUSPEND')} variant="outline" className="ml-auto text-destructive border-destructive hover:bg-destructive/10">Suspend System</Button>
              )}
              {sys.lifecycle_status === 'SUSPENDED' && (
                <Button onClick={() => handleAction('REACTIVATE')} variant="secondary">Reactivate</Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmModal
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        requireReason={modalConfig.requireReason}
        onConfirm={handleModalConfirm}
        onCancel={() => setModalConfig({ isOpen: false, action: null })}
      />
    </div>
  );
}
