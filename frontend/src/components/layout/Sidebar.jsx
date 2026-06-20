import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Shield, LayoutDashboard, FileText, LogOut } from 'lucide-react';

export default function Sidebar({ sidebarOpen }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <aside className={`bg-primary text-primary-foreground flex flex-col transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'} fixed inset-y-0 z-20`}>
      <div className="h-16 flex items-center justify-between px-4 border-b border-primary/20">
        {sidebarOpen ? (
          <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap animate-in fade-in">
            <Shield className="w-6 h-6 shrink-0" />
            <span className="font-bold tracking-tight">Maliba AI</span>
          </div>
        ) : (
          <Shield className="w-6 h-6 mx-auto shrink-0" />
        )}
      </div>
      
      <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
        <Link 
          to="/dashboard" 
          className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary ${location.pathname === '/dashboard' ? 'bg-primary-foreground text-primary' : 'hover:bg-primary-foreground/10'}`}
          title={t('nav.dashboard')}
        >
          <LayoutDashboard className={`w-5 h-5 shrink-0 ${location.pathname === '/dashboard' ? 'fill-current' : ''}`} />
          {sidebarOpen && <span className="font-medium whitespace-nowrap">{t('nav.dashboard')}</span>}
        </Link>
        
        {user.role === 'ministry' && (
          <Link 
            to="/audit" 
            className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary ${location.pathname === '/audit' ? 'bg-primary-foreground text-primary' : 'hover:bg-primary-foreground/10'}`}
            title={t('nav.auditLog')}
          >
            <FileText className={`w-5 h-5 shrink-0 ${location.pathname === '/audit' ? 'fill-current' : ''}`} />
            {sidebarOpen && <span className="font-medium whitespace-nowrap">{t('nav.auditLog')}</span>}
          </Link>
        )}
      </nav>

      <div className="p-4 border-t border-primary/20">
        <div className={`flex items-center gap-3 mb-4 px-2 ${!sidebarOpen && 'justify-center'}`}>
          <div className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center font-bold shrink-0">
            {user.username.charAt(0).toUpperCase()}
          </div>
          {sidebarOpen && (
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{user.username}</p>
              <p className="text-xs opacity-80 truncate capitalize">{user.role}</p>
            </div>
          )}
        </div>
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-destructive ${!sidebarOpen && 'justify-center'}`}
          title={t('nav.logout')}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {sidebarOpen && <span className="font-medium whitespace-nowrap">{t('nav.logout')}</span>}
        </button>
      </div>
    </aside>
  );
}
