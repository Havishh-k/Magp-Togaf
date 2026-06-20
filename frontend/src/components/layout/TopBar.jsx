import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Menu, ChevronRight, Globe, Bell } from 'lucide-react';

export default function TopBar({ sidebarOpen, setSidebarOpen }) {
  const { user, login } = useAuth();
  const location = useLocation();
  const { t, i18n } = useTranslation();

  if (!user) return null;

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'fr' : 'en');
  };

  const pathnames = location.pathname.split('/').filter(x => x);

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-10 flex items-center justify-between px-4 sm:px-6 shadow-sm">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 -ml-2 rounded-md text-slate-500 hover:bg-slate-100 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        {/* Breadcrumbs */}
        <nav className="hidden sm:flex items-center text-sm font-medium text-slate-500">
          <Link to="/dashboard" className="hover:text-primary transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary rounded-md">Home</Link>
          {pathnames.map((name, index) => {
            const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
            const isLast = index === pathnames.length - 1;
            return (
              <React.Fragment key={name}>
                <ChevronRight className="w-4 h-4 mx-1 text-slate-400" />
                {isLast ? (
                  <span className="text-slate-900 capitalize">{name}</span>
                ) : (
                  <Link to={routeTo} className="hover:text-primary transition-colors capitalize focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary rounded-md">{name}</Link>
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
            className="flex items-center gap-1.5 p-2 text-slate-500 hover:bg-slate-100 rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary font-medium text-sm"
          >
            <Globe className="w-4 h-4" />
            {i18n.language.toUpperCase()}
          </button>
          
          <Link to="/notifications" className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-2 w-2 h-2 bg-destructive rounded-full border-2 border-white"></span>
          </Link>
        </div>
      </div>
    </header>
  );
}
