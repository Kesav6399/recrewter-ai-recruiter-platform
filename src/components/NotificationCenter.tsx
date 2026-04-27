import React, { useEffect, useRef } from 'react';
import { X, Bell, CheckCircle2, Clock, AlertCircle, Trash2, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAppContext } from '../context/AppContext';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const { notifications, markNotificationRead, theme } = useAppContext();
  const panelRef = useRef<HTMLDivElement>(null);
  const isDark = theme === 'dark';

  // --- Auto-close when clicking outside ---
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const unreadNotifications = notifications.filter(n => n.status === 'Unread');

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] animate-in fade-in duration-300" />

      <div 
        ref={panelRef}
        className={cn(
          "fixed right-0 top-0 h-screen w-full max-w-sm z-[101] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300",
          isDark ? "bg-slate-900 border-l border-slate-800" : "bg-white border-l border-slate-200"
        )}
      >
        <div className="p-6 border-b dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-lg font-black dark:text-white flex items-center gap-2">
            <Bell size={20} className="text-blue-600" /> Recruiter Alerts
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <div className="px-6 py-3 border-b dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{unreadNotifications.length} Unread</span>
          <button 
            onClick={() => unreadNotifications.forEach(n => markNotificationRead(n.id))} 
            className="text-[10px] font-black text-blue-600 hover:underline uppercase tracking-widest"
          >
            Mark all as read
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {notifications.length > 0 ? (
            notifications.map((notif) => (
              <div 
                key={notif.id} 
                className={cn(
                  "p-4 rounded-2xl border transition-all relative group", 
                  notif.status === 'Unread' 
                    ? (isDark ? "bg-blue-600/5 border-blue-500/20" : "bg-blue-50/50 border-blue-100") 
                    : (isDark ? "bg-slate-800/50 border-slate-800" : "bg-white border-slate-100")
                )}
              >
                <div className="flex justify-between items-start mb-1">
                  <h4 className="text-sm font-bold dark:text-white pr-6">{notif.title}</h4>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3">{notif.message}</p>
                <button 
                  onClick={() => { markNotificationRead(notif.id); onClose(); }} 
                  className="text-[10px] font-black text-blue-600 uppercase flex items-center gap-1 hover:gap-2 transition-all"
                >
                  Take Action <ArrowRight size={12} />
                </button>
                {notif.status === 'Unread' && (
                  <div className="absolute top-4 right-10 w-1.5 h-1.5 bg-blue-600 rounded-full" />
                )}
              </div>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-40 py-20">
              <Bell size={48} className="mb-4" />
              <p className="text-sm font-bold uppercase tracking-widest">Inbox is Empty</p>
            </div>
          )}
        </div>

        <div className="p-4 border-t dark:border-slate-800">
          <button 
            onClick={() => { alert("Opening full notification log..."); onClose(); }} 
            className="w-full py-3 bg-blue-600 text-white text-xs font-black rounded-xl uppercase tracking-widest shadow-lg shadow-blue-600/20"
          >
            View All Notifications
          </button>
        </div>
      </div>
    </>
  );
}