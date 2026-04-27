import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import NotificationCenter from './NotificationCenter';
import { cn } from '../lib/utils';
import { Bell, Search, User, Sun, Moon } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function Layout() {
  const { user, theme, toggleTheme } = useAppContext();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const isDark = theme === 'dark';

  return (
    <div className={cn(
      "min-h-screen transition-colors duration-300 flex",
      isDark ? "bg-slate-950 text-slate-100" : "bg-[#f8fafc] text-slate-900"
    )}>
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      
      <main 
        className={cn(
          "flex-1 transition-all duration-300 ease-in-out flex flex-col min-h-screen",
          isCollapsed ? "ml-20" : "ml-64"
        )}
      >
        {/* Top Header */}
        <header className={cn(
          "h-16 border-b flex items-center justify-between px-8 sticky top-0 z-40 transition-colors duration-300",
          isDark ? "bg-slate-900/80 backdrop-blur-md border-slate-800" : "bg-white/80 backdrop-blur-md border-slate-200"
        )}>
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <div className="relative w-full group">
              <Search className={cn(
                "absolute left-3 top-1/2 -translate-y-1/2 transition-colors",
                isDark ? "text-slate-500 group-focus-within:text-blue-400" : "text-slate-400 group-focus-within:text-blue-500"
              )} size={18} />
              <input 
                type="text" 
                placeholder="Search candidates, requirements, or talent pool..." 
                className={cn(
                  "w-full pl-10 pr-4 py-2 border rounded-xl focus:outline-none focus:ring-4 transition-all text-sm",
                  isDark 
                    ? "bg-slate-800 border-slate-700 text-white focus:ring-blue-500/10 focus:border-blue-500/50" 
                    : "bg-slate-50 border-slate-200 text-slate-900 focus:ring-blue-500/10 focus:border-blue-500"
                )}
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={toggleTheme}
              className={cn(
                "p-2 rounded-xl transition-all",
                isDark ? "text-slate-400 hover:bg-slate-800 hover:text-yellow-400" : "text-slate-500 hover:bg-slate-100 hover:text-blue-600"
              )}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <button 
              onClick={() => setIsNotifOpen(true)}
              className={cn(
                "relative p-2 rounded-xl transition-all",
                isDark ? "text-slate-400 hover:bg-slate-800 hover:text-blue-400" : "text-slate-500 hover:bg-slate-100 hover:text-blue-600"
              )}
            >
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
            </button>
            
            <div className={cn("h-8 w-px mx-2", isDark ? "bg-slate-800" : "bg-slate-200")}></div>
            
            <div className="flex items-center gap-3 cursor-pointer group p-1 pr-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
              <div className="w-9 h-9 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold shadow-lg shadow-blue-500/20">
                {user?.displayName?.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="text-left hidden sm:block">
                <p className={cn("text-xs font-bold leading-none", isDark ? "text-white" : "text-slate-900")}>{user?.displayName}</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">{user?.role}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8 max-w-[1600px] mx-auto w-full flex-1">
          <Outlet />
        </div>
      </main>

      <NotificationCenter isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
    </div>
  );
}
