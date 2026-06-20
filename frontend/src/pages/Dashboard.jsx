import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../api';
import MinistryDashboard from './MinistryDashboard';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import StatusBadge from '../components/StatusBadge';
import SkeletonLoader from '../components/SkeletonLoader';
import { useTranslation } from 'react-i18next';

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useTranslation();
  
  const [systems, setSystems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== 'ministry') {
      api.get('/registry/')
        .then(res => setSystems(res.data))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [user]);

  if (user?.role === 'ministry') {
    return <MinistryDashboard />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Vendor Dashboard</h1>
        <Button asChild className="w-full sm:w-auto min-h-[44px]">
          <Link to="/submit">Submit New System</Link>
        </Button>
      </div>

      <Card className="overflow-hidden flex flex-col p-0">
        <CardHeader className="bg-slate-50 border-b border-slate-100">
          <CardTitle>My AI Systems</CardTitle>
          <CardDescription>Track the regulatory status of your submitted models.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
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
                          You haven't submitted any AI systems yet.
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
                    You haven't submitted any AI systems yet.
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
