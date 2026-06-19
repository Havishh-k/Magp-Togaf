import { Clock, CheckCircle2, XCircle, AlertTriangle, ShieldAlert, Activity, Play, FileEdit, Eye } from 'lucide-react';
import clsx from 'clsx';

export default function StatusBadge({ status }) {
  const config = {
    DRAFT: { icon: FileEdit, text: 'Draft', color: 'bg-neutral-100 text-neutral-800 border-neutral-300' },
    PENDING_REVIEW: { icon: Clock, text: 'Pending Review', color: 'bg-yellow-50 text-yellow-800 border-yellow-200' },
    UNDER_REVIEW: { icon: Eye, text: 'Under Review', color: 'bg-blue-50 text-blue-800 border-blue-200' },
    APPROVED: { icon: CheckCircle2, text: 'Approved', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
    REJECTED: { icon: XCircle, text: 'Rejected', color: 'bg-red-50 text-red-800 border-red-200' },
    SUSPENDED: { icon: ShieldAlert, text: 'Suspended', color: 'bg-rose-100 text-rose-900 border-rose-300' },
    SHADOW_MODE: { icon: Activity, text: 'Shadow Mode', color: 'bg-indigo-50 text-indigo-800 border-indigo-200' },
    CANARY_MODE: { icon: AlertTriangle, text: 'Canary Mode', color: 'bg-orange-50 text-orange-800 border-orange-200' },
    PRODUCTION: { icon: Play, text: 'Production', color: 'bg-green-100 text-green-900 border-green-300' }
  };

  const { icon: Icon, text, color } = config[status] || config.DRAFT;

  return (
    <span className={clsx("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border", color)}>
      <Icon className="w-3.5 h-3.5" />
      {text}
    </span>
  );
}
