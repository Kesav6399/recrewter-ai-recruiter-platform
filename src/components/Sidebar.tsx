import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Briefcase, 
  Upload, 
  Target, 
  UserCircle, 
  Database, 
  GitFork, 
  BarChart3, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  LogOut,
  Zap
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAppContext } from '../context/AppContext';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Briefcase, label: 'Client Requirements', path: '/requirements' },
  { icon: Upload, label: 'Upload JD & Resume', path: '/upload' },
  { icon: Target, label: 'AI Match Results', path: '/match-results' },
  { icon: UserCircle, label: 'Candidate Details', path: '/candidate-details' },
  { icon: Database, label: 'Talent Pool', path: '/talent-pool' },
  { icon: GitFork, label: 'Pipeline', path: '/pipeline' },
  { icon: BarChart3, label: 'Reports', path: '/reports' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export default function Sidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
  const { logout, theme } = useAppContext();
  const isDark = theme === 'dark';

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 h-screen transition-all duration-300 ease-in-out z-50 flex flex-col",
        isDark ? "bg-slate-900 text-slate-300 border-r border-slate-800" : "bg-white text-slate-600 border-r border-slate-200",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Header */}
      <div className={cn(
        "h-16 flex items-center px-6 shrink-0",
        isDark ? "border-b border-slate-800" : "border-b border-slate-100"
      )}>
        <div className="flex items-center gap-3 overflow-hidden w-full">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
            <Zap size={20} className="text-white fill-white" />
          </div>
          {!isCollapsed && (
            <span className={cn(
              "font-bold text-lg tracking-tight whitespace-nowrap",
              isDark ? "text-white" : "text-slate-900"
            )}>RECREWTER</span>
          )}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn(
              "p-1 rounded-md transition-colors ml-auto",
              isDark ? "hover:bg-slate-800" : "hover:bg-slate-100",
              isCollapsed && "hidden"
            )}
          >
            <ChevronLeft size={20} />
          </button>
        </div>
        {isCollapsed && (
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-3 top-20 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 transition-colors z-50"
          >
            <ChevronRight size={14} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
              isActive 
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
                : isDark ? "hover:bg-slate-800 hover:text-white" : "hover:bg-slate-50 hover:text-slate-900"
            )}
          >
            <item.icon size={20} className={cn("shrink-0", isCollapsed && "mx-auto")} />
            {!isCollapsed && (
              <span className="text-sm font-medium tracking-wide">{item.label}</span>
            )}
            {isCollapsed && (
              <div className={cn(
                "absolute left-full ml-4 px-2 py-1 text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50",
                isDark ? "bg-slate-800 text-white" : "bg-slate-900 text-white"
              )}>
                {item.label}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className={cn(
        "p-3 shrink-0",
        isDark ? "border-t border-slate-800" : "border-t border-slate-100"
      )}>
        <button 
          onClick={logout}
          className={cn(
            "flex items-center gap-3 w-full px-3 py-2.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all group relative",
            isCollapsed ? "justify-center" : ""
          )}
        >
          <LogOut size={20} className="shrink-0" />
          {!isCollapsed && <span className="text-sm font-medium tracking-wide">Logout</span>}
          {isCollapsed && (
            <div className="absolute left-full ml-4 px-2 py-1 bg-red-500 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
              Logout
            </div>
          )}
        </button>
      </div>
    </aside>
  );
}
