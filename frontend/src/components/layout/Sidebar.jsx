import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Shield, LayoutDashboard, FileText, LogOut, X } from 'lucide-react';

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavClick = () => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  if (!user) return null;

  return (
    <aside className={`bg-primary text-primary-foreground flex flex-col transition-all duration-300 fixed inset-y-0 h-[100dvh] z-50 
      ${sidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0 md:w-20'}
    `}>
      <div className="h-16 flex items-center justify-between px-4 border-b border-primary/20">
        {(sidebarOpen || window.innerWidth < 768) ? (
          <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap animate-in fade-in flex-1">
            <Shield className="w-6 h-6 shrink-0" />
            <span className="font-bold tracking-tight">Equalyze AI</span>
          </div>
        ) : (
          <Shield className="w-6 h-6 mx-auto shrink-0" />
        )}
        {/* Mobile Close Button */}
        <button 
          className="md:hidden p-1 text-primary-foreground/80 hover:text-white"
          onClick={() => setSidebarOpen(false)}
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
        <Link 
          to="/dashboard" 
          onClick={handleNavClick}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-md min-h-[44px] transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary ${location.pathname === '/dashboard' ? 'bg-primary-foreground text-primary' : 'hover:bg-primary-foreground/10'}`}
          title={t('nav.dashboard')}
        >
          <LayoutDashboard className={`w-5 h-5 shrink-0 ${location.pathname === '/dashboard' ? 'fill-current' : ''}`} />
          {(sidebarOpen || window.innerWidth < 768) && <span className="font-medium whitespace-nowrap">{t('nav.dashboard')}</span>}
        </Link>
        
        {user.role === 'ministry' && (
          <Link 
            to="/audit" 
            onClick={handleNavClick}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-md min-h-[44px] transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary ${location.pathname === '/audit' ? 'bg-primary-foreground text-primary' : 'hover:bg-primary-foreground/10'}`}
            title={t('nav.auditLog')}
          >
            <FileText className={`w-5 h-5 shrink-0 ${location.pathname === '/audit' ? 'fill-current' : ''}`} />
            {(sidebarOpen || window.innerWidth < 768) && <span className="font-medium whitespace-nowrap">{t('nav.auditLog')}</span>}
          </Link>
        )}
      </nav>

      <div className="p-4 border-t border-primary/20">
        <div className={`flex items-center gap-3 mb-4 px-2 ${(!sidebarOpen && window.innerWidth >= 768) && 'justify-center'}`}>
          <div className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center font-bold shrink-0">
            {user.username.charAt(0).toUpperCase()}
          </div>
          {(sidebarOpen || window.innerWidth < 768) && (
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{user.username}</p>
              <p className="text-xs opacity-80 truncate capitalize">{user.role}</p>
            </div>
          )}
        </div>
        <button
          onClick={handleLogout}
          className={`w-full flex items-center min-h-[44px] gap-3 px-3 py-2 rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-destructive ${(!sidebarOpen && window.innerWidth >= 768) && 'justify-center'}`}
          title={t('nav.logout')}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {(sidebarOpen || window.innerWidth < 768) && <span className="font-medium whitespace-nowrap">{t('nav.logout')}</span>}
        </button>
      </div>
    </aside>
  );
}
