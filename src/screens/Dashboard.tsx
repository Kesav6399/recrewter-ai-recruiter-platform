import React from 'react';
import { 
  Users, 
  Briefcase, 
  CheckCircle2, 
  TrendingUp, 
  Clock, 
  AlertCircle,
  Zap,
  ArrowUpRight,
  Target,
  Search,
  Calendar,
  ChevronRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { cn } from '../lib/utils';
import UpcomingInterviews from '../components/UpcomingInterviews';

export default function Dashboard() {
  const navigate = useNavigate();
  const { requirements, candidates, theme } = useAppContext();

  const stats = {
    activeRequirements: requirements.length,
    totalCandidates: candidates.length,
    aiMatchRate: 88,
    avgTimeToHire: 14
  };

  const recentMatches = candidates
    .filter(c => c.matchScore !== undefined)
    .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
    .slice(0, 4);

  const isDark = theme === 'dark';

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className={cn(
            "text-3xl font-black tracking-tight",
            isDark ? "text-white" : "text-slate-900"
          )}>
            Recruiter Intelligence Dashboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">AI-driven insights across your active requirements and candidate pipeline.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={cn(
            "px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all",
            isDark ? "bg-blue-900/20 text-blue-400 border-blue-800" : "bg-blue-50 text-blue-700 border-blue-100"
          )}>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            AI Engine: Active
          </div>
          <button 
            onClick={() => navigate('/requirements')}
            className="btn btn-primary px-6 py-2.5 text-xs flex items-center gap-2 rounded-xl shadow-lg shadow-blue-600/20"
          >
            <Briefcase size={16} />
            New Requirement
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Active Requirements', value: stats.activeRequirements, icon: Briefcase, color: 'blue', trend: '+12%', path: '/requirements' },
          { label: 'Total Candidates', value: stats.totalCandidates, icon: Users, color: 'indigo', trend: '+5%', path: '/talent-pool' },
          { label: 'AI Match Rate', value: `${stats.aiMatchRate}%`, icon: Target, color: 'emerald', trend: '+8%', path: '/match-results' },
          { label: 'Time to Hire', value: `${stats.avgTimeToHire} Days`, icon: Clock, color: 'amber', trend: '-2 Days', path: '/reports' },
        ].map((stat, i) => (
          <div 
            key={i} 
            onClick={() => navigate(stat.path)}
            className={cn(
              "card p-6 group transition-all cursor-pointer relative overflow-hidden",
              isDark ? "hover:border-blue-500/50" : "hover:border-blue-400"
            )}
          >
            <div className="flex items-start justify-between relative z-10">
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300",
                stat.color === 'blue' ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white" :
                stat.color === 'indigo' ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white" :
                stat.color === 'emerald' ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white" :
                "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 group-hover:bg-amber-600 group-hover:text-white"
              )}>
                <stat.icon size={24} />
              </div>
              <div className={cn(
                "text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1",
                stat.trend.startsWith('+') ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400" : "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
              )}>
                <TrendingUp size={12} />
                {stat.trend}
              </div>
            </div>
            <p className={cn("text-3xl font-black tracking-tight", isDark ? "text-white" : "text-slate-900")}>{stat.value}</p>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">{stat.label}</p>
            
            {/* Background Decoration */}
            <div className={cn(
              "absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-[0.03] transition-transform duration-500 group-hover:scale-150",
              stat.color === 'blue' ? "bg-blue-600" :
              stat.color === 'indigo' ? "bg-indigo-600" :
              stat.color === 'emerald' ? "bg-emerald-600" :
              "bg-amber-600"
            )}></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className={cn("text-lg font-bold", isDark ? "text-white" : "text-slate-900")}>Pipeline Velocity</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Candidate movement through stages over time.</p>
              </div>
              <select className={cn(
                "border rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none transition-all",
                isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
              )}>
                <option>Last 30 Days</option>
                <option>Last 90 Days</option>
              </select>
            </div>
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={[
                  { name: 'Week 1', value: 40 },
                  { name: 'Week 2', value: 30 },
                  { name: 'Week 3', value: 65 },
                  { name: 'Week 4', value: 45 },
                  { name: 'Week 5', value: 80 },
                  { name: 'Week 6', value: 55 },
                ]}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#1e293b" : "#f1f5f9"} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 600, fill: isDark ? '#94a3b8' : '#64748b' }}
                    dy={15}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 600, fill: isDark ? '#94a3b8' : '#64748b' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: isDark ? '#0f172a' : '#fff', 
                      borderRadius: '16px', 
                      border: isDark ? '1px solid #1e293b' : '1px solid #e2e8f0',
                      boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                      fontSize: '12px',
                      fontWeight: '700',
                      color: isDark ? '#f8fafc' : '#0f172a'
                    }} 
                    itemStyle={{ color: isDark ? '#f8fafc' : '#0f172a' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#2563eb" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorValue)" 
                    animationDuration={2000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Match Table */}
          <div className="card overflow-hidden">
            <div className={cn(
              "p-6 border-b flex items-center justify-between",
              isDark ? "border-slate-800" : "border-slate-100"
            )}>
              <div>
                <h2 className={cn("text-lg font-bold", isDark ? "text-white" : "text-slate-900")}>High-Potential AI Matches</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Top candidates identified by neural matching.</p>
              </div>
              <button 
                onClick={() => navigate('/match-results')}
                className="btn btn-secondary px-4 py-2 text-xs flex items-center gap-2 rounded-xl"
              >
                View All <ArrowUpRight size={14} />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className={isDark ? "bg-slate-800/50" : "bg-slate-50/50"}>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Candidate</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Requirement</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">AI Score</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                  </tr>
                </thead>
                <tbody className={cn("divide-y", isDark ? "divide-slate-800" : "divide-slate-100")}>
                  {recentMatches.map((candidate, i) => (
                    <tr 
                      key={i} 
                      onClick={() => navigate(`/candidate-details/${candidate.id}`)}
                      className={cn(
                        "transition-colors cursor-pointer group",
                        isDark ? "hover:bg-slate-800/50" : "hover:bg-slate-50/50"
                      )}
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-300",
                            isDark ? "bg-slate-800 text-slate-400 group-hover:bg-blue-900/30 group-hover:text-blue-400" : "bg-slate-100 text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-600"
                          )}>
                            {candidate.name.charAt(0)}
                          </div>
                          <span className={cn("text-sm font-bold", isDark ? "text-slate-300" : "text-slate-700")}>{candidate.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-sm font-medium text-slate-500 dark:text-slate-400">
                        {requirements.find(r => r.id === candidate.requirementId)?.roleTitle || 'General Pool'}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className={cn("flex-1 h-2 w-16 rounded-full overflow-hidden", isDark ? "bg-slate-800" : "bg-slate-100")}>
                            <div 
                              className={cn(
                                "h-full rounded-full transition-all duration-1000",
                                (candidate.matchScore || 0) >= 90 ? "bg-emerald-500" : (candidate.matchScore || 0) >= 75 ? "bg-blue-500" : "bg-amber-500"
                              )}
                              style={{ width: `${candidate.matchScore}%` }}
                            ></div>
                          </div>
                          <span className={cn("text-xs font-black", isDark ? "text-slate-300" : "text-slate-700")}>{candidate.matchScore}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                          isDark ? "bg-blue-900/30 text-blue-400" : "bg-blue-50 text-blue-600"
                        )}>
                          {candidate.stage}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar Insights */}
        <div className="space-y-6">
          <div className="card p-6 bg-blue-600 text-white border-none shadow-xl shadow-blue-600/20 relative overflow-hidden group">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
                  <Zap size={20} className="text-white fill-white" />
                </div>
                <h2 className="text-sm font-black uppercase tracking-widest">AI Recruiter Insight</h2>
              </div>
              <p className="text-sm text-blue-50 leading-relaxed mb-8 font-medium italic">
                "Semantic analysis shows a 15% increase in technical fit for the 'Senior Full Stack' role after refining the JD criteria. Recommend focusing on candidates with strong 'System Design' evidence."
              </p>
              <button 
                onClick={() => navigate('/reports')}
                className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border border-white/10"
              >
                View Detailed Report <ArrowUpRight size={16} />
              </button>
            </div>
            {/* Decoration */}
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
          </div>

          <UpcomingInterviews />

          <div className={cn(
            "card p-6 border-dashed",
            isDark ? "border-amber-900/50 bg-amber-900/5" : "border-amber-200 bg-amber-50/30"
          )}>
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500 mb-6">
              <AlertCircle size={20} />
              <h2 className="text-sm font-black uppercase tracking-widest">Action Required</h2>
            </div>
            <div className="space-y-4">
              <div 
                onClick={() => navigate('/talent-pool')}
                className={cn(
                  "p-4 rounded-xl border shadow-sm cursor-pointer transition-all hover:scale-[1.02]",
                  isDark ? "bg-slate-800 border-amber-900/30 hover:border-amber-500/50" : "bg-white border-amber-100 hover:border-amber-400"
                )}
              >
                <div className="flex items-center justify-between">
                  <p className={cn("text-xs font-bold", isDark ? "text-white" : "text-slate-900")}>3 Potential Duplicates</p>
                  <ChevronRight size={14} className="text-amber-500" />
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-medium">Detected in 'Backend Engineer' pipeline.</p>
              </div>
              <div 
                onClick={() => navigate('/requirements')}
                className={cn(
                  "p-4 rounded-xl border shadow-sm cursor-pointer transition-all hover:scale-[1.02]",
                  isDark ? "bg-slate-800 border-amber-900/30 hover:border-amber-500/50" : "bg-white border-amber-100 hover:border-amber-400"
                )}
              >
                <div className="flex items-center justify-between">
                  <p className={cn("text-xs font-bold", isDark ? "text-white" : "text-slate-900")}>JD Review Needed</p>
                  <ChevronRight size={14} className="text-amber-500" />
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-medium">'UI Designer' requirement has low match rate.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
