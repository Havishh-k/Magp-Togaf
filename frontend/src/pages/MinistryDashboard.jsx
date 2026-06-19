import { useEffect, useState } from 'react';
import api from '../api';
import StatusBadge from '../components/StatusBadge';
import { Link } from 'react-router-dom';
import { Search, List, AlignJustify } from 'lucide-react';
import StressTestPanel from '../components/StressTestPanel';
import SkeletonLoader from '../components/SkeletonLoader';
import { useTranslation } from 'react-i18next';

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

  const tdClass = density === 'compact' ? 'px-4 py-2' : 'px-6 py-4';
  const thClass = density === 'compact' ? 'px-4 py-2 text-xs font-semibold text-neutral-600 uppercase sticky top-0 bg-neutral-50 shadow-sm z-10' : 'px-6 py-3 text-xs font-semibold text-neutral-600 uppercase sticky top-0 bg-neutral-50 shadow-sm z-10';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-neutral-900">{t('dashboard.title')}</h1>
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
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input 
              type="text" 
              placeholder={t('dashboard.search')} 
              className="pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm w-64"
            />
          </div>
        </div>
      </div>

      <StressTestPanel />

      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden flex flex-col max-h-[600px]">
        {loading ? (
          <SkeletonLoader rows={5} />
        ) : (
          <div className="overflow-auto flex-1 relative">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className={thClass}>{t('dashboard.systemName')}</th>
                  <th className={thClass}>Version</th>
                  <th className={thClass}>{t('dashboard.riskLevel')}</th>
                  <th className={thClass}>{t('dashboard.status')}</th>
                  <th className={thClass}>{t('dashboard.action')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {systems.map(sys => (
                  <tr key={sys.id} className="hover:bg-neutral-50 transition-colors">
                    <td className={`${tdClass} font-medium text-neutral-900`}>{sys.system_name}</td>
                    <td className={`${tdClass} text-neutral-600`}>{sys.system_version}</td>
                    <td className={tdClass}>
                      <span className="text-sm font-medium px-2 py-1 bg-neutral-100 rounded text-neutral-700">{sys.risk_classification}</span>
                    </td>
                    <td className={tdClass}>
                      <StatusBadge status={sys.lifecycle_status} />
                    </td>
                    <td className={`${tdClass} text-sm`}>
                      <Link to={`/system/${sys.id}`} className="text-primary-600 hover:text-primary-800 font-medium underline-offset-2 hover:underline">{t('dashboard.viewDetails')}</Link>
                    </td>
                  </tr>
                ))}
                {systems.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-neutral-500">No systems registered yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
