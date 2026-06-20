import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Menu, ChevronRight, Globe, Bell } from 'lucide-react';
import api from '../../api';

export default function TopBar({ sidebarOpen, setSidebarOpen }) {
  const { user } = useAuth();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    
    const fetchUnread = async () => {
      try {
        const res = await api.get('/notifications/unread-count');
        setUnreadCount(res.data.unread);
      } catch (err) {
        console.error('Failed to fetch unread count', err);
      }
    };
    
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    
    return () => clearInterval(interval);
  }, [user]);

  if (!user) return null;

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'fr' : 'en');
  };

  const pathnames = location.pathname.split('/').filter(x => x);

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-10 flex items-center justify-between px-4 sm:px-6 shadow-sm">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setSidebarOpen(prev => !prev)}
          className="p-2 -ml-2 rounded-md text-slate-500 hover:bg-slate-100 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Toggle Menu"
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
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-2 w-2.5 h-2.5 bg-destructive rounded-full border-2 border-white"></span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
