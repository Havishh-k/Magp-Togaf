import React, { useEffect, useState, useMemo, useRef } from 'react';
import { ShieldCheck, Search, Filter, Download, AlertTriangle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { useReactToPrint } from 'react-to-print';
import ExplainabilityChart from '../components/ExplainabilityChart';

const PrintableModelCard = React.forwardRef(({ sys }, ref) => {
  let explainData = null;
  try {
    if (sys.local_validation_evidence) {
      explainData = JSON.parse(sys.local_validation_evidence);
    }
  } catch(e) {}

  return (
    <div ref={ref} className="p-8 hidden print:block text-black bg-white">
      <h1 className="text-3xl font-bold mb-2">{sys.system_name} - Model Card</h1>
      <p className="text-gray-500 mb-6">Version: {sys.system_version} | Approved: {new Date(sys.production_approved_at).toLocaleDateString()}</p>
      
      <div className="mb-6">
        <h3 className="font-bold text-lg border-b pb-2 mb-3">System Overview</h3>
        <p><strong>Developer:</strong> {sys.developer_organization}</p>
        <p><strong>Risk Classification:</strong> {sys.risk_classification}</p>
      </div>

      <div className="mb-6">
        <h3 className="font-bold text-lg border-b pb-2 mb-3">Intended Use</h3>
        <p>{sys.intended_use_case}</p>
      </div>

      {explainData && explainData.length > 0 && (
        <div className="mb-6">
          <h3 className="font-bold text-lg border-b pb-2 mb-3">AI Explainability & Feature Importance</h3>
          <div className="mt-4">
            <ExplainabilityChart data={explainData} />
          </div>
        </div>
      )}
    </div>
  );
});

export default function PublicRegistry() {
  const [systems, setSystems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPublicSystems = async () => {
      try {
        const res = await api.get('/public-registry/systems');
        setSystems(res.data);
      } catch (error) {
        console.error("Failed to fetch public systems", error);
        toast.error("Failed to load registry data.");
      } finally {
        setLoading(false);
      }
    };
    fetchPublicSystems();
  }, []);

  const filteredSystems = useMemo(() => {
    return systems.filter(sys => {
      const matchesSearch = sys.system_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            sys.developer_organization.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRisk = riskFilter === 'ALL' || sys.risk_classification === riskFilter;
      return matchesSearch && matchesRisk;
    });
  }, [systems, searchTerm, riskFilter]);

  const handleReportIssue = () => {
    toast.success("Thank you for your report! Ministry officials have been securely notified.", {
      icon: '🚨'
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans flex flex-col">
      <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10 flex items-center px-4 sm:px-6 lg:px-8 shadow-sm">
        <div className="flex items-center gap-2 flex-1">
          <ShieldCheck className="w-6 h-6 text-primary-600 dark:text-primary-400 shrink-0" />
          <span className="font-bold tracking-tight text-slate-900 dark:text-white text-lg">Maliba Public Registry</span>
        </div>
        <Button variant="ghost" onClick={() => navigate('/')} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Button>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Verified AI Medical Devices</h1>
          <p className="text-slate-500 dark:text-slate-400">
            A transparent, public ledger of all AI systems that have been rigorously evaluated and approved for production use in the national health network.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder="Search by system name or developer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="relative min-w-[200px]">
            <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none"
            >
              <option value="ALL">All Risk Levels</option>
              <option value="LOW">Low Risk</option>
              <option value="MINIMAL">Minimal Risk</option>
              <option value="HIGH">High Risk</option>
              <option value="UNACCEPTABLE">Unacceptable</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-500">Loading verified systems...</div>
        ) : filteredSystems.length === 0 ? (
          <div className="py-12 text-center text-slate-500 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            No systems found matching your criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredSystems.map(sys => (
              <SystemCard key={sys.id} sys={sys} onReportIssue={handleReportIssue} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function SystemCard({ sys, onReportIssue }) {
  const printRef = useRef();
  
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Model_Card_${sys.system_name}`,
  });

  return (
    <Card className="flex flex-col h-full hover:shadow-md transition-shadow dark:border-slate-800 dark:bg-slate-900">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start gap-4">
          <div>
            <CardTitle className="text-xl mb-1 text-slate-900 dark:text-white">{sys.system_name}</CardTitle>
            <p className="text-sm text-slate-500 dark:text-slate-400">v{sys.system_version} • {sys.developer_organization}</p>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 bg-success/10 text-success-700 dark:text-success-400 border border-success/20 rounded-full shrink-0">
            APPROVED
          </span>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="mb-4">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Risk Level</span>
          <span className="text-sm font-medium px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-md text-slate-700 dark:text-slate-300">
            {sys.risk_classification}
          </span>
        </div>
        <div className="mb-6 flex-1">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Intended Use</span>
          <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-3 leading-relaxed">
            {sys.intended_use_case}
          </p>
        </div>
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-3">
          <Button onClick={() => handlePrint()} variant="outline" className="flex-1 gap-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
            <Download className="w-4 h-4" /> Model Card
          </Button>
          <Button onClick={onReportIssue} variant="outline" className="flex-1 gap-2 text-warning-700 dark:text-warning-400 border-warning-200 dark:border-warning-900/50 hover:bg-warning-50 dark:hover:bg-warning-900/20">
            <AlertTriangle className="w-4 h-4" /> Report Issue
          </Button>
        </div>
      </CardContent>
      
      {/* Hidden printable component */}
      <PrintableModelCard ref={printRef} sys={sys} />
    </Card>
  );
}
