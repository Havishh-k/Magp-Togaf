import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Menu, ChevronRight, Globe, Bell, User as UserIcon, Settings, LogOut } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import api from '../../api';

export default function TopBar({ sidebarOpen, setSidebarOpen }) {
  const { user, logout } = useAuth();
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

          <div className="relative">
            <button 
              onClick={() => {
                const el = document.getElementById('user-dropdown');
                if (el) el.classList.toggle('hidden');
              }}
              onBlur={() => {
                setTimeout(() => {
                  const el = document.getElementById('user-dropdown');
                  if (el) el.classList.add('hidden');
                }, 200);
              }}
              className="flex items-center gap-2 p-1.5 pl-3 rounded-full hover:bg-slate-100 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary border border-transparent"
            >
              <span className="text-sm font-medium text-slate-700 hidden sm:block">{user.username}</span>
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary pointer-events-none">
                <UserIcon className="w-4 h-4" />
              </div>
            </button>
            
            <div 
              id="user-dropdown" 
              className="hidden absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg z-50 py-1"
            >
              <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800">
                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user.username}</p>
                <p className="text-xs text-slate-500 truncate mt-0.5">{user.organization || user.role}</p>
              </div>
              <div className="p-1">
                <Link 
                  to="/settings" 
                  className="flex w-full items-center px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
                <button 
                  onClick={logout} 
                  className="flex w-full items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors mt-1"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
