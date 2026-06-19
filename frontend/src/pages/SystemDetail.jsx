import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import ConfirmModal from '../components/ConfirmModal';
import { ArrowLeft, Download } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';

import BiasReport from '../components/BiasReport';
import ExplainabilityChart from '../components/ExplainabilityChart';

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
        // Assume rejection sets status to REJECTED. Currently our promote endpoint just takes a string.
        await api.post(`/registry/${id}/promote?new_status=REJECTED`);
        // We'd ideally send the reason to the backend too, but our TRD only specified reason for suspend
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
      fetchSystem();
    } catch (err) {
      console.error(err);
      alert('Fast-forward failed');
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (!sys) return null;

  const isExpired = sys.registration_expires_at && new Date(sys.registration_expires_at) < new Date();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center print:hidden">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-neutral-900">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex gap-2">
          {user?.role === 'ministry' && (
            <button onClick={handleFastForward} className="flex items-center gap-2 text-sm font-medium text-warning-700 hover:text-warning-800 bg-warning-50 hover:bg-warning-100 px-3 py-1.5 rounded-lg transition-colors border border-warning-200 shadow-sm">
              ⏩ Fast-Forward 12 Months
            </button>
          )}
          <button onClick={() => handlePrint()} className="flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-800 bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-lg transition-colors">
            <Download className="w-4 h-4" /> Download Model Card
          </button>
        </div>
      </div>

      <div ref={componentRef} className="bg-white rounded-xl shadow border border-neutral-200 p-8 print:shadow-none print:border-none print:p-0">
        <div className="flex justify-between items-start mb-6 pb-6 border-b border-neutral-200">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">{sys.system_name}</h1>
            <p className="text-neutral-500 mt-1">Version {sys.system_version} • ID: {sys.submission_id}</p>
          </div>
          <StatusBadge status={sys.lifecycle_status} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-3">System Details</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex"><span className="text-neutral-500 w-32 shrink-0">Organization:</span> <span className="font-medium text-neutral-900">{sys.developer_organization}</span></li>
              <li className="flex"><span className="text-neutral-500 w-32 shrink-0">Risk Level:</span> <span className="font-medium text-neutral-900">{sys.risk_classification}</span></li>
              <li className="flex"><span className="text-neutral-500 w-32 shrink-0">Vendor ID:</span> <span className="font-medium font-mono text-xs mt-0.5 text-neutral-900">{sys.vendor_id}</span></li>
              <li className="flex"><span className="text-neutral-500 w-32 shrink-0">Submitted:</span> <span className="font-medium text-neutral-900">{new Date(sys.created_at).toLocaleDateString()}</span></li>
              {sys.registration_expires_at && (
                <li className="flex"><span className="text-neutral-500 w-32 shrink-0">Expires:</span> <span className="font-medium text-neutral-900">{new Date(sys.registration_expires_at).toLocaleDateString()}</span></li>
              )}
            </ul>
          </div>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-2">Scope & Safety</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex flex-col">
                  <span className="text-neutral-500 mb-1">Intended Use Case:</span> 
                  <span className="text-neutral-900 bg-neutral-50 p-2 rounded border border-neutral-100">{sys.intended_use_case}</span>
                </li>
                <li className="flex flex-col">
                  <span className="text-neutral-500 mb-1">Target Population:</span> 
                  <span className="text-neutral-900 bg-neutral-50 p-2 rounded border border-neutral-100">{sys.target_population}</span>
                </li>
                <li className="flex items-center gap-2 mt-2">
                  <span className="text-neutral-500">Human Override Mechanism:</span> 
                  {sys.override_mechanism_documented ? (
                     <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-xs font-bold">DOCUMENTED</span>
                  ) : (
                     <span className="px-2 py-0.5 bg-danger-100 text-danger-800 rounded text-xs font-bold">MISSING</span>
                  )}
                </li>
              </ul>
            </div>
            {isExpired && (
              <div className="bg-danger-50 p-4 rounded-lg border border-danger-200 shadow-sm animate-pulse">
                <h3 className="text-sm font-bold text-danger-800 mb-1">⚠️ Suspension Warning: Registration Expired</h3>
                <p className="text-sm text-danger-700 font-medium">This model's registration timeline has elapsed. Data Drift may have occurred. Immediate review required.</p>
              </div>
            )}
            {sys.suspended_at && (
              <div className="bg-danger-50 p-4 rounded-lg border border-danger-200">
                <h3 className="text-sm font-semibold text-danger-800 mb-1">Suspension Notice</h3>
                <p className="text-sm text-danger-700">{sys.suspension_reason}</p>
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
            <h2 className="text-xl font-bold text-neutral-900 mb-4">Bias & Fairness Report</h2>
            <BiasReport biasData={bias} />
          </div>
        )}

        {user?.role === 'ministry' && (
          <div className="pt-6 border-t border-neutral-200 flex gap-3 print:hidden">
            {sys.lifecycle_status === 'PENDING_REVIEW' && (
              <>
                <button onClick={() => handleAction('APPROVE')} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded font-medium text-sm">Approve</button>
                <button onClick={() => handleAction('REJECT')} className="bg-danger-600 hover:bg-danger-700 text-white px-4 py-2 rounded font-medium text-sm">Reject</button>
              </>
            )}
            {sys.lifecycle_status === 'APPROVED' && (
              <button onClick={() => handleAction('SHADOW_MODE')} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded font-medium text-sm">Promote to Shadow Mode</button>
            )}
            {sys.lifecycle_status !== 'SUSPENDED' && sys.lifecycle_status !== 'REJECTED' && (
              <button onClick={() => handleAction('SUSPEND')} className="ml-auto bg-danger-100 hover:bg-danger-200 text-danger-700 px-4 py-2 rounded font-medium text-sm border border-danger-300">Suspend System</button>
            )}
            {sys.lifecycle_status === 'SUSPENDED' && (
              <button onClick={() => handleAction('REACTIVATE')} className="bg-neutral-800 hover:bg-neutral-900 text-white px-4 py-2 rounded font-medium text-sm">Reactivate</button>
            )}
          </div>
        )}
      </div>

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
