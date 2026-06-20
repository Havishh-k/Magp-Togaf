import { useEffect, useState } from 'react';
import api from '../api';
import StatusBadge from '../components/StatusBadge';
import { Link } from 'react-router-dom';
import { Search, List, AlignJustify } from 'lucide-react';
import StressTestPanel from '../components/StressTestPanel';
import SkeletonLoader from '../components/SkeletonLoader';
import { useTranslation } from 'react-i18next';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
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
  const [loading, setLoading] = useState(true);
  const [density, setDensity] = useState('comfortable'); // 'comfortable' or 'compact'
  const { t } = useTranslation();

  useEffect(() => {
    api.get('/registry/')
      .then(res => setSystems(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
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

      <StressTestPanel />

      <Card className="overflow-hidden flex flex-col max-h-[600px] p-0">
        <CardContent className="p-0 flex-1 overflow-auto">
          {loading ? (
            <SkeletonLoader rows={5} />
          ) : (
            <Table className={density === 'compact' ? '[&_td]:py-2 [&_th]:py-2' : ''}>
              <TableHeader>
                <TableRow>
                  <TableHead className="sticky top-0 bg-white z-10 w-[250px]">{t('dashboard.systemName')}</TableHead>
                  <TableHead className="sticky top-0 bg-white z-10 w-[100px]">Version</TableHead>
                  <TableHead className="sticky top-0 bg-white z-10 w-[150px]">{t('dashboard.riskLevel')}</TableHead>
                  <TableHead className="sticky top-0 bg-white z-10 w-[150px]">{t('dashboard.status')}</TableHead>
                  <TableHead className="sticky top-0 bg-white z-10 text-right">{t('dashboard.action')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {systems.map(sys => (
                  <TableRow key={sys.id}>
                    <TableCell className="font-medium">{sys.system_name}</TableCell>
                    <TableCell className="text-slate-500">{sys.system_version}</TableCell>
                    <TableCell>
                      <span className="text-sm font-medium px-2 py-1 bg-slate-100 rounded-md text-slate-700">{sys.risk_classification}</span>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={sys.lifecycle_status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Link to={`/system/${sys.id}`} className="text-primary font-medium underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary rounded-sm">
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
