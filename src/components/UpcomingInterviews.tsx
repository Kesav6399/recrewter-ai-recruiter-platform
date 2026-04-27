import React from 'react';
import { Calendar, Clock, Video, MapPin, User, ChevronRight, MoreHorizontal } from 'lucide-react';
import { Interview, Candidate } from '../types';
import { useAppContext } from '../context/AppContext';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';

export default function UpcomingInterviews() {
  const navigate = useNavigate();
  const { interviews, candidates, theme } = useAppContext();

  const isDark = theme === 'dark';

  const getCandidate = (id: string) => candidates.find(c => c.id === id);

  // Filter for today's interviews (mocking today as the date of the first few interviews if needed, 
  // but for now just showing the first 5)
  const todayInterviews = interviews.slice(0, 5);

  return (
    <div className="card overflow-hidden h-full flex flex-col">
      <div className={cn(
        "p-4 border-b flex items-center justify-between",
        isDark ? "border-slate-800 bg-slate-800/50" : "border-slate-100 bg-slate-50/50"
      )}>
        <div className="flex items-center gap-2">
          <Calendar className="text-blue-600 dark:text-blue-400" size={18} />
          <h2 className={cn("text-sm font-bold", isDark ? "text-white" : "text-slate-900")}>Today's Interviews</h2>
        </div>
        <button className={cn(
          "p-1.5 rounded-lg transition-colors",
          isDark ? "text-slate-500 hover:bg-slate-800" : "text-slate-400 hover:bg-slate-100"
        )}>
          <MoreHorizontal size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {todayInterviews.map((interview) => {
          const candidate = getCandidate(interview.candidateId);
          if (!candidate) return null;

          return (
            <div 
              key={interview.id}
              onClick={() => navigate(`/candidate-details/${candidate.id}`)}
              className={cn(
                "p-3 rounded-xl border transition-all cursor-pointer group",
                isDark 
                  ? "border-slate-800 bg-slate-900/50 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/5" 
                  : "border-slate-100 bg-white hover:border-blue-200 hover:shadow-sm"
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm transition-colors",
                  isDark 
                    ? "bg-slate-800 text-slate-400 group-hover:bg-blue-900/30 group-hover:text-blue-400" 
                    : "bg-slate-100 text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-600"
                )}>
                  {candidate.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <h3 className={cn("text-xs font-bold truncate", isDark ? "text-slate-200" : "text-slate-900")}>{candidate.name}</h3>
                    <span className={cn(
                      "text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider",
                      isDark ? "text-blue-400 bg-blue-900/30" : "text-blue-600 bg-blue-50"
                    )}>
                      {interview.time}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mb-2">{interview.round}</p>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-[9px] text-slate-400 dark:text-slate-500 font-medium">
                      <User size={10} />
                      {interview.interviewerName}
                    </div>
                    <div className="flex items-center gap-1 text-[9px] text-slate-400 dark:text-slate-500 font-medium">
                      {interview.mode === 'Video' ? <Video size={10} /> : <MapPin size={10} />}
                      {interview.mode}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {todayInterviews.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center mb-3",
              isDark ? "bg-slate-800 text-slate-600" : "bg-slate-50 text-slate-300"
            )}>
              <Calendar size={20} />
            </div>
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500">No interviews today</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-600 mt-1">Enjoy your free time!</p>
          </div>
        )}
      </div>

      <div className={cn(
        "p-3 border-t",
        isDark ? "border-slate-800 bg-slate-800/50" : "border-slate-100 bg-slate-50/50"
      )}>
        <button className="w-full py-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all flex items-center justify-center gap-1">
          View Full Calendar
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
