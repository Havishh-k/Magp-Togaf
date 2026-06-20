import { Clock, CheckCircle2, XCircle, AlertTriangle, ShieldAlert, Activity, Play, FileEdit, Eye } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export default function StatusBadge({ status, className }) {
  const config = {
    DRAFT: { icon: FileEdit, text: 'Draft', color: 'bg-muted text-muted-foreground border-muted-foreground/20' },
    PENDING_REVIEW: { icon: Clock, text: 'Pending Review', color: 'bg-warning/10 text-warning-700 border-warning/20' },
    UNDER_REVIEW: { icon: Eye, text: 'Under Review', color: 'bg-primary/10 text-primary border-primary/20' },
    APPROVED: { icon: CheckCircle2, text: 'Approved', color: 'bg-success/10 text-success-700 border-success/20' },
    REJECTED: { icon: XCircle, text: 'Rejected', color: 'bg-destructive/10 text-destructive border-destructive/20' },
    SUSPENDED: { icon: ShieldAlert, text: 'Suspended', color: 'bg-destructive text-destructive-foreground border-destructive' },
    SHADOW_MODE: { icon: Activity, text: 'Shadow Mode', color: 'bg-primary/10 text-primary border-primary/20' },
    CANARY_MODE: { icon: AlertTriangle, text: 'Canary Mode', color: 'bg-warning/10 text-warning-700 border-warning/20' },
    PRODUCTION: { icon: Play, text: 'Production', color: 'bg-success/20 text-success-800 border-success/30 font-bold' }
  };

  const { icon: Icon, text, color } = config[status] || config.DRAFT;

  return (
    <span className={twMerge(clsx("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border", color), className)}>
      <Icon className="w-3.5 h-3.5" />
      {text}
    </span>
  );
}
