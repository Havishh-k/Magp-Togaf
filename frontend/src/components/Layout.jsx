import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { LogOut, Shield, Bell, Menu, X, LayoutDashboard, FileText, ChevronRight, Globe } from 'lucide-react';
import Sidebar from './layout/Sidebar';

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
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

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
