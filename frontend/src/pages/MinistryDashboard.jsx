import { useEffect, useState } from 'react';
import api from '../api';
import StatusBadge from '../components/StatusBadge';
import { Link } from 'react-router-dom';
import { Search, CheckCircle, XCircle } from 'lucide-react';
import StressTestPanel from '../components/StressTestPanel';
import SkeletonLoader from '../components/SkeletonLoader';
import { useTranslation } from 'react-i18next';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";

export default function MinistryDashboard() {
  const [systems, setSystems] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vendorsLoading, setVendorsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('registry'); // 'registry' or 'vendors'
  const { t } = useTranslation();
  const { user } = useAuth();
  
  const isAdmin = user?.role === 'ministry' || user?.role === 'admin';

  useEffect(() => {
    api.get('/registry/')
      .then(res => setSystems(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (activeTab === 'vendors' && isAdmin) {
      setVendorsLoading(true);
      api.get('/auth/vendors/pending')
        .then(res => setVendors(res.data))
        .catch(err => console.error(err))
        .finally(() => setVendorsLoading(false));
    }
  }, [activeTab, isAdmin]);

  const handleApprove = async (userId) => {
    try {
      await api.post(`/auth/vendors/${userId}/approve`);
      toast.success("Vendor approved successfully");
      setVendors(vendors.filter(v => v.id !== userId));
    } catch (err) {
      toast.error("Failed to approve vendor");
    }
  };

  const handleReject = async (userId) => {
    try {
      await api.delete(`/auth/vendors/${userId}`);
      toast.success("Vendor application rejected");
      setVendors(vendors.filter(v => v.id !== userId));
    } catch (err) {
      toast.error("Failed to reject vendor");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-semibold text-slate-900">{t('dashboard.title')}</h1>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input 
              type="text" 
              placeholder={t('dashboard.search')} 
              className="pl-9 w-64"
            />
          </div>
        </div>
      </div>

      {isAdmin && (
        <div className="flex space-x-1 border-b border-slate-200">
          <button
            className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${activeTab === 'registry' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            onClick={() => setActiveTab('registry')}
          >
            AI Systems Registry
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 flex items-center gap-2 ${activeTab === 'vendors' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            onClick={() => setActiveTab('vendors')}
          >
            Pending Vendors
            {vendors.length > 0 && activeTab !== 'vendors' && (
              <span className="bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5">
                {vendors.length}
              </span>
            )}
          </button>
        </div>
      )}

      {activeTab === 'registry' && <StressTestPanel />}

      <Card className="overflow-hidden flex flex-col max-h-[600px] p-0">
        <CardContent className="p-0 flex-1 overflow-auto">
          {activeTab === 'registry' ? (
            loading ? (
              <SkeletonLoader rows={5} />
            ) : (
              <div className="w-full">
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto border-0 w-full">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="sticky top-0 bg-white z-10 w-[250px] whitespace-nowrap">{t('dashboard.systemName')}</TableHead>
                        <TableHead className="sticky top-0 bg-white z-10 w-[100px]">Version</TableHead>
                        <TableHead className="sticky top-0 bg-white z-10 w-[150px] whitespace-nowrap">{t('dashboard.riskLevel')}</TableHead>
                        <TableHead className="sticky top-0 bg-white z-10 w-[150px]">{t('dashboard.status')}</TableHead>
                        <TableHead className="sticky top-0 bg-white z-10 text-right">{t('dashboard.action')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {systems.map(sys => (
                        <TableRow key={sys.id}>
                          <TableCell className="font-medium whitespace-nowrap">{sys.system_name}</TableCell>
                          <TableCell className="text-slate-500">{sys.system_version}</TableCell>
                          <TableCell>
                            <span className="text-sm font-medium px-2 py-1 bg-slate-100 rounded-md text-slate-700 whitespace-nowrap">{sys.risk_classification}</span>
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={sys.lifecycle_status} />
                          </TableCell>
                          <TableCell className="text-right">
                            <Link to={`/system/${sys.id}`} className="text-primary font-medium underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary rounded-sm min-h-[44px] flex items-center justify-end whitespace-nowrap">
                              {t('dashboard.viewDetails')}
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                      {systems.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-slate-500 h-24">
                            No systems registered yet.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                
                {/* Mobile Cards */}
                <div className="md:hidden flex flex-col gap-4 p-4">
                  {systems.map(sys => (
                    <div key={sys.id} className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col gap-3 shadow-sm">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <p className="font-bold text-slate-900 leading-tight">{sys.system_name}</p>
                          <p className="text-sm text-slate-500 mt-1">v{sys.system_version}</p>
                        </div>
                        <StatusBadge status={sys.lifecycle_status} />
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-semibold text-slate-500 uppercase">Risk Level:</span>
                        <span className="text-xs font-bold px-2 py-0.5 bg-slate-100 rounded-md text-slate-700">{sys.risk_classification}</span>
                      </div>
                      <Link 
                        to={`/system/${sys.id}`} 
                        className="mt-2 w-full flex items-center justify-center bg-slate-100 text-slate-900 hover:bg-slate-200 min-h-[44px] rounded-md font-medium text-sm transition-colors"
                      >
                        {t('dashboard.viewDetails')}
                      </Link>
                    </div>
                  ))}
                  {systems.length === 0 && (
                    <div className="text-center text-slate-500 p-8 border border-dashed rounded-lg">
                      No systems registered yet.
                    </div>
                  )}
                </div>
              </div>
            )
          ) : (
            vendorsLoading ? (
              <SkeletonLoader rows={3} />
            ) : (
              <div className="w-full">
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto border-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="sticky top-0 bg-white z-10">Organization</TableHead>
                        <TableHead className="sticky top-0 bg-white z-10">Username</TableHead>
                        <TableHead className="sticky top-0 bg-white z-10">Email</TableHead>
                        <TableHead className="sticky top-0 bg-white z-10 text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {vendors.map(v => (
                        <TableRow key={v.id}>
                          <TableCell className="font-medium">{v.organization || 'N/A'}</TableCell>
                          <TableCell>{v.username}</TableCell>
                          <TableCell>{v.email}</TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button variant="outline" size="sm" onClick={() => handleReject(v.id)} className="text-destructive border-destructive hover:bg-destructive/10 hover:text-destructive min-h-[44px]">
                              <XCircle className="w-4 h-4 mr-1.5" /> Reject
                            </Button>
                            <Button size="sm" onClick={() => handleApprove(v.id)} className="min-h-[44px]">
                              <CheckCircle className="w-4 h-4 mr-1.5" /> Approve
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {vendors.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-slate-500 h-24">
                            No pending vendors awaiting approval.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                
                {/* Mobile Cards */}
                <div className="md:hidden flex flex-col gap-4 p-4">
                  {vendors.map(v => (
                    <div key={v.id} className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col gap-3 shadow-sm">
                      <div>
                        <p className="font-semibold text-slate-900">{v.organization || 'N/A'}</p>
                        <p className="text-sm text-slate-500">{v.username} • {v.email}</p>
                      </div>
                      <div className="flex flex-col gap-2 mt-2">
                        <Button onClick={() => handleApprove(v.id)} className="w-full min-h-[44px]">
                          <CheckCircle className="w-4 h-4 mr-1.5" /> Approve Vendor
                        </Button>
                        <Button variant="outline" onClick={() => handleReject(v.id)} className="w-full text-destructive border-destructive hover:bg-destructive/10 min-h-[44px]">
                          <XCircle className="w-4 h-4 mr-1.5" /> Reject Vendor
                        </Button>
                      </div>
                    </div>
                  ))}
                  {vendors.length === 0 && (
                    <div className="text-center text-slate-500 p-8 border border-dashed rounded-lg">
                      No pending vendors awaiting approval.
                    </div>
                  )}
                </div>
              </div>
            )
          )}
        </CardContent>
      </Card>
    </div>
  );
}
