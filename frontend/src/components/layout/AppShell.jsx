import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import ScrollToTop from '../ScrollToTop';

export default function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false); // default closed on mobile

  // Auto-open on desktop
  useEffect(() => {
    if (window.innerWidth >= 768) {
      setSidebarOpen(true);
    }
  }, []);

  return (
    <div className="min-h-screen flex bg-background text-foreground font-sans">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden animate-in fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <div className={`flex-1 flex flex-col transition-all duration-300 md:${sidebarOpen ? 'ml-64' : 'ml-20'} w-full`}>
        <TopBar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        
        <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 pb-24 md:pb-8 animate-in fade-in duration-300">
          <Outlet />
        </main>
      </div>
      <ScrollToTop />
    </div>
  );
}
