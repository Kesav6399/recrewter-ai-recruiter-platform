import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { Download, Calendar, TrendingUp, Users, Target, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAppContext } from '../context/AppContext';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function Reports() {
  const { candidates, requirements, interviews } = useAppContext();

  const stats = useMemo(() => {
    const total = candidates.length;
    const shortlisted = candidates.filter(c => c.stage === 'Shortlisted for Submission' || c.stage === 'Interview Scheduled' || c.stage === 'Offered' || c.stage === 'Hired').length;
    const hired = candidates.filter(c => c.stage === 'Hired').length;
    const interviewing = candidates.filter(c => c.stage === 'Interview Scheduled').length;
    const offered = candidates.filter(c => c.stage === 'Offered' || c.stage === 'Hired').length;

    return {
      total,
      shortlistedRatio: total > 0 ? Math.round((shortlisted / total) * 100) : 0,
      hired,
      interviewing,
      offerAcceptance: offered > 0 ? Math.round((hired / offered) * 100) : 85
    };
  }, [candidates]);

  const funnelData = useMemo(() => {
    const stages = [
      { name: 'New', color: '#3b82f6' },
      { name: 'Screening', color: '#6366f1' },
      { name: 'Shortlisted', color: '#8b5cf6' },
      { name: 'Interviewing', color: '#ec4899' },
      { name: 'Offered', color: '#f43f5e' },
      { name: 'Hired', color: '#10b981' },
    ];

    return stages.map(s => ({
      name: s.name,
      value: candidates.filter(c => c.stage === s.name).length,
      color: s.color
    }));
  }, [candidates]);

  const distributionData = useMemo(() => {
    const skills: Record<string, number> = {};
    candidates.forEach(c => {
      c.skills.forEach(s => {
        skills[s] = (skills[s] || 0) + 1;
      });
    });

    return Object.entries(skills)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [candidates]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Recruitment Reports</h1>
          <p className="text-slate-500 mt-1">Analyze your team's performance and hiring trends.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-all font-bold text-sm">
            <Calendar size={18} />
            Last 30 Days
          </button>
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-bold text-sm shadow-lg shadow-blue-200"
          >
            <Download size={20} />
            Export PDF
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <ReportCard icon={Users} label="Total Candidates" value={stats.total.toString()} trend="+12%" positive />
        <ReportCard icon={Target} label="Shortlisted Ratio" value={`${stats.shortlistedRatio}%`} trend="+5%" positive />
        <ReportCard icon={CheckCircle2} label="Active Interviews" value={stats.interviewing.toString()} trend="+2" positive />
        <ReportCard icon={TrendingUp} label="Offer Acceptance" value={`${stats.offerAcceptance}%`} trend="-3%" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Hiring Funnel */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-8">Hiring Funnel Efficiency</h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600, fill: '#64748b' }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Skill Distribution */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-8">Top Skills in Talent Pool</h2>
          <div className="h-80 w-full flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReportCard({ icon: Icon, label, value, trend, positive }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-slate-50 text-slate-600 rounded-lg">
          <Icon size={20} />
        </div>
        <span className={cn(
          "text-xs font-bold px-2 py-0.5 rounded-full",
          positive ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
        )}>
          {trend}
        </span>
      </div>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
    </div>
  );
}
