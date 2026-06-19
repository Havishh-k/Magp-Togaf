import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { LogOut, Shield, Bell, Menu, X, LayoutDashboard, FileText, ChevronRight, Globe } from 'lucide-react';

export default function Layout() {
  const { user, logout, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'fr' : 'en');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    return <Outlet />;
  }

  // Generate breadcrumbs based on path
  const pathnames = location.pathname.split('/').filter(x => x);
  
  return (
    <div className="min-h-screen flex bg-neutral-50 text-neutral-900 font-sans">
      {/* Sidebar */}
      <aside className={`bg-primary-900 text-white flex flex-col transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'} fixed inset-y-0 z-20`}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-primary-800">
          {sidebarOpen && (
            <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap animate-in fade-in">
              <Shield className="w-6 h-6 text-primary-400 shrink-0" />
              <span className="font-bold tracking-tight text-white">Maliba AI</span>
            </div>
          )}
          {!sidebarOpen && (
            <Shield className="w-6 h-6 text-primary-400 mx-auto shrink-0" />
          )}
        </div>
        
        <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
          <Link 
            to="/dashboard" 
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${location.pathname === '/dashboard' ? 'bg-primary-800 text-white' : 'text-primary-100 hover:bg-primary-800 hover:text-white'}`}
            title={t('nav.dashboard')}
          >
            <LayoutDashboard className="w-5 h-5 shrink-0" />
            {sidebarOpen && <span className="font-medium whitespace-nowrap">{t('nav.dashboard')}</span>}
          </Link>
          
          {user.role === 'ministry' && (
            <Link 
              to="/audit" 
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${location.pathname === '/audit' ? 'bg-primary-800 text-white' : 'text-primary-100 hover:bg-primary-800 hover:text-white'}`}
              title={t('nav.auditLog')}
            >
              <FileText className="w-5 h-5 shrink-0" />
              {sidebarOpen && <span className="font-medium whitespace-nowrap">{t('nav.auditLog')}</span>}
            </Link>
          )}
        </nav>

        <div className="p-4 border-t border-primary-800">
          <div className={`flex items-center gap-3 mb-4 px-2 ${!sidebarOpen && 'justify-center'}`}>
            <div className="w-8 h-8 rounded-full bg-primary-700 flex items-center justify-center text-primary-100 font-bold shrink-0">
              {user.username.charAt(0).toUpperCase()}
            </div>
            {sidebarOpen && (
              <div className="overflow-hidden">
                <p className="text-sm font-medium text-white truncate">{user.username}</p>
                <p className="text-xs text-primary-300 truncate capitalize">{user.role}</p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-danger-600 hover:bg-danger-700 text-white transition-colors ${!sidebarOpen && 'justify-center'}`}
            title={t('nav.logout')}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {sidebarOpen && <span className="font-medium whitespace-nowrap">{t('nav.logout')}</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {/* Sticky Top Nav */}
        <header className="h-16 bg-white border-b border-neutral-200 sticky top-0 z-10 flex items-center justify-between px-4 sm:px-6 shadow-sm">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 -ml-2 rounded-lg text-neutral-500 hover:bg-neutral-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            {/* Breadcrumbs */}
            <nav className="hidden sm:flex items-center text-sm font-medium text-neutral-500">
              <Link to="/dashboard" className="hover:text-primary-600 transition-colors">Home</Link>
              {pathnames.map((name, index) => {
                const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
                const isLast = index === pathnames.length - 1;
                return (
                  <React.Fragment key={name}>
                    <ChevronRight className="w-4 h-4 mx-1 text-neutral-400" />
                    {isLast ? (
                      <span className="text-neutral-900 capitalize">{name}</span>
                    ) : (
                      <Link to={routeTo} className="hover:text-primary-600 transition-colors capitalize">{name}</Link>
                    )}
                  </React.Fragment>
                );
              })}
            </nav>
          </div>
          
          <div className="flex items-center gap-6">
            {/* God Mode Pitch Switcher */}
            <div className="flex items-center gap-2 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-200 shadow-sm print:hidden">
              <span className="text-xs font-bold text-indigo-800 tracking-wider">{t('nav.currentView')}</span>
              <select 
                className="bg-transparent text-xs font-bold text-indigo-900 focus:outline-none cursor-pointer uppercase"
                value={user?.role}
                onChange={(e) => {
                  if (e.target.value === 'ministry') login('admin', 'password123');
                  else if (e.target.value === 'vendor') login('vendor', 'password123');
                }}
              >
                <option value="ministry">MINISTRY ADMIN</option>
                <option value="vendor">SYSTEM VENDOR</option>
              </select>
            </div>
          
            <div className="flex items-center gap-4">
              <button 
                onClick={toggleLanguage}
                className="flex items-center gap-1.5 p-2 text-neutral-500 hover:bg-neutral-100 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 font-medium text-sm"
              >
                <Globe className="w-4 h-4" />
                {i18n.language.toUpperCase()}
              </button>
              
              <Link to="/notifications" className="relative p-2 text-neutral-500 hover:bg-neutral-100 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500">
                <Bell className="w-5 h-5" />
                {/* Fake indicator for demo */}
                <span className="absolute top-1.5 right-2 w-2 h-2 bg-danger-500 rounded-full border-2 border-white"></span>
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
