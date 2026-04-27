import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  MoreHorizontal, 
  Filter, 
  Download, 
  Share2, 
  Star, 
  ShieldAlert,
  Search,
  ChevronRight,
  Info,
  Calendar,
  Mail,
  Zap,
  MapPin,
  Briefcase,
  ArrowUpRight
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Candidate } from '../types';
import ScheduleInterviewModal from '../components/ScheduleInterviewModal';
import CommunicationModal from '../components/CommunicationModal';

export default function MatchResults() {
  const navigate = useNavigate();
  const { matchResults, activeRequirementId, requirements, updateCandidateStage, addInterview, addCommunication, theme } = useAppContext();
  
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isCommModalOpen, setIsCommModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [minScore, setMinScore] = useState(0);

  const isDark = theme === 'dark';

  const activeRequirement = useMemo(() => {
    return requirements.find(r => r.id === activeRequirementId);
  }, [requirements, activeRequirementId]);

  const filteredResults = useMemo(() => {
    return matchResults.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           c.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesScore = c.matchScore >= minScore;
      return matchesSearch && matchesScore;
    });
  }, [matchResults, searchQuery, minScore]);

  const handleSchedule = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setIsScheduleModalOpen(true);
  };

  const handleComm = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setIsCommModalOpen(true);
  };

  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case 'Strong Shortlist':
      case 'Strong Match': 
        return isDark ? 'text-emerald-400 bg-emerald-900/20 border-emerald-800' : 'text-emerald-700 bg-emerald-50 border-emerald-100';
      case 'Shortlist':
      case 'Good Match': 
        return isDark ? 'text-blue-400 bg-blue-900/20 border-blue-800' : 'text-blue-700 bg-blue-50 border-blue-100';
      case 'Consider':
      case 'Potential Match': 
        return isDark ? 'text-amber-400 bg-amber-900/20 border-amber-800' : 'text-amber-700 bg-amber-50 border-amber-100';
      case 'Risky':
        return isDark ? 'text-orange-400 bg-orange-900/20 border-orange-800' : 'text-orange-700 bg-orange-50 border-orange-100';
      case 'Reject':
        return isDark ? 'text-red-400 bg-red-900/20 border-red-800' : 'text-red-700 bg-red-50 border-red-100';
      default: 
        return isDark ? 'text-slate-400 bg-slate-800 border-slate-700' : 'text-slate-700 bg-slate-50 border-slate-100';
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star 
            key={star} 
            size={12} 
            className={cn(
              star <= rating ? "text-amber-400 fill-amber-400" : "text-slate-300 dark:text-slate-700"
            )} 
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-2">
            <Zap size={18} className="animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest">AI Semantic Match Analysis</span>
          </div>
          <h1 className={cn("text-3xl font-black tracking-tight", isDark ? "text-white" : "text-slate-900")}>
            {activeRequirement ? `Results for ${activeRequirement.roleTitle}` : 'AI Match Results'}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Semantic evaluation based on project evidence and role alignment.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className={cn(
            "p-2.5 border rounded-xl transition-all",
            isDark ? "bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
          )}>
            <Download size={20} />
          </button>
          <button 
            onClick={() => navigate('/upload')}
            className="btn btn-primary px-6 py-3 text-sm font-black uppercase tracking-widest rounded-xl shadow-lg shadow-blue-600/20"
          >
            Re-run Match
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="card p-4 flex flex-col md:flex-row items-center gap-6">
        <div className="relative flex-1 w-full group">
          <Search className={cn(
            "absolute left-3 top-1/2 -translate-y-1/2 transition-colors",
            isDark ? "text-slate-500 group-focus-within:text-blue-400" : "text-slate-400 group-focus-within:text-blue-500"
          )} size={18} />
          <input 
            type="text" 
            placeholder="Search by name, skills, or experience..." 
            className={cn(
              "w-full pl-10 pr-4 py-2.5 border rounded-xl focus:outline-none focus:ring-4 transition-all text-sm",
              isDark 
                ? "bg-slate-800 border-slate-700 text-white focus:ring-blue-500/10 focus:border-blue-500/50" 
                : "bg-slate-50 border-slate-200 text-slate-900 focus:ring-blue-500/10 focus:border-blue-500"
            )}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-6 w-full md:w-auto">
          <div className="flex items-center gap-4 shrink-0">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Min Score</span>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={minScore}
              onChange={(e) => setMinScore(parseInt(e.target.value))}
              className={cn(
                "w-32 h-1.5 rounded-full appearance-none cursor-pointer accent-blue-600",
                isDark ? "bg-slate-800" : "bg-slate-200"
              )}
            />
            <span className="text-sm font-black text-blue-600 w-10">{minScore}%</span>
          </div>
          <div className={cn("h-8 w-[1px] hidden md:block", isDark ? "bg-slate-800" : "bg-slate-100")} />
          <button className="btn btn-secondary px-4 py-2.5 text-xs flex items-center gap-2 rounded-xl">
            <Filter size={16} />
            More Filters
          </button>
        </div>
      </div>

      {/* Results List */}
      <div className="space-y-6">
        {filteredResults.length > 0 ? filteredResults.map((candidate, index) => (
          <div 
            key={candidate.id} 
            className="card group relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/5"
          >
            <div className="p-8">
              <div className="flex flex-col lg:flex-row lg:items-start gap-8">
                {/* Basic Info & Score */}
                <div className="lg:w-1/4 space-y-6">
                  <div className="flex items-center gap-5">
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl transition-all duration-300",
                      isDark ? "bg-slate-800 text-slate-400 group-hover:bg-blue-900/30 group-hover:text-blue-400" : "bg-slate-100 text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-600"
                    )}>
                      {candidate.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className={cn("text-lg font-black tracking-tight group-hover:text-blue-600 transition-colors", isDark ? "text-white" : "text-slate-900")}>{candidate.name}</h3>
                      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5">{candidate.currentRole}</p>
                      <div className="mt-1.5">
                        {renderStars(candidate.aiEvaluation?.overall_rating_out_of_5 || 0)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Overall Fit</span>
                      <span className={cn("text-base font-black", isDark ? "text-white" : "text-slate-900")}>{candidate.matchScore}%</span>
                    </div>
                    <div className={cn("h-2 w-full rounded-full overflow-hidden", isDark ? "bg-slate-800" : "bg-slate-100")}>
                      <div 
                        className={cn(
                          "h-full rounded-full transition-all duration-1000",
                          (candidate.matchScore || 0) >= 90 ? "bg-emerald-500 shadow-lg shadow-emerald-500/20" : 
                          (candidate.matchScore || 0) >= 75 ? "bg-blue-500 shadow-lg shadow-blue-500/20" : "bg-amber-500 shadow-lg shadow-amber-500/20"
                        )}
                        style={{ width: `${candidate.matchScore || 0}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className={cn(
                    "px-4 py-2 rounded-xl border text-center text-[10px] font-black uppercase tracking-widest",
                    getRecommendationColor(candidate.aiEvaluation?.recommendation || '')
                  )}>
                    {candidate.aiEvaluation?.recommendation}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className={cn("p-2 rounded-lg text-center", isDark ? "bg-slate-800/50" : "bg-slate-50")}>
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Exp</p>
                      <p className={cn("text-xs font-bold", isDark ? "text-slate-200" : "text-slate-700")}>{candidate.experience}y</p>
                    </div>
                    <div className={cn("p-2 rounded-lg text-center", isDark ? "bg-slate-800/50" : "bg-slate-50")}>
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Notice</p>
                      <p className={cn("text-xs font-bold", isDark ? "text-slate-200" : "text-slate-700")}>{candidate.parsedData?.notice_period || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Summary & Evidence */}
                <div className="flex-1 space-y-6">
                  <div className={cn(
                    "p-6 rounded-2xl border relative overflow-hidden",
                    isDark ? "bg-slate-800/30 border-slate-800" : "bg-slate-50/50 border-slate-100"
                  )}>
                    <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Zap size={16} className="text-blue-500" />
                      AI Match Reasoning
                    </h4>
                    <p className={cn("text-sm leading-relaxed italic font-medium relative z-10", isDark ? "text-slate-300" : "text-slate-700")}>
                      "{candidate.aiEvaluation?.short_summary}"
                    </p>
                    <div className="absolute -right-4 -bottom-4 opacity-[0.03] text-blue-500">
                      <Zap size={120} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                        <CheckCircle2 size={14} />
                        Key Strengths
                      </h4>
                      <div className="space-y-3">
                        {candidate.aiEvaluation?.strengths.slice(0, 3).map((s, i) => (
                          <div key={i} className="flex items-start gap-3 text-xs font-bold text-slate-600 dark:text-slate-400">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                            {s}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-2">
                        <ShieldAlert size={14} />
                        Gaps & Red Flags
                      </h4>
                      <div className="space-y-3">
                        {candidate.aiEvaluation?.gaps.slice(0, 2).map((g, i) => (
                          <div key={i} className="flex items-start gap-3 text-xs font-bold text-slate-600 dark:text-slate-400">
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                            {g}
                          </div>
                        ))}
                        {candidate.aiEvaluation?.optional_red_flags && candidate.aiEvaluation.optional_red_flags.length > 0 && (
                          <div className="flex items-start gap-3 text-xs font-bold text-red-500">
                            <AlertTriangle size={14} className="shrink-0" />
                            {candidate.aiEvaluation.optional_red_flags[0]}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {candidate.skills.slice(0, 6).map(skill => (
                      <span key={skill} className={cn(
                        "px-3 py-1 text-[10px] font-bold rounded-lg border",
                        isDark ? "bg-slate-800 border-slate-700 text-slate-400" : "bg-white border-slate-200 text-slate-600"
                      )}>
                        {skill}
                      </span>
                    ))}
                    {candidate.skills.length > 6 && (
                      <span className="text-[10px] font-bold text-slate-400 px-2 py-1">+{candidate.skills.length - 6} more</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="lg:w-56 flex flex-col gap-3">
                  <button 
                    onClick={() => navigate(`/candidate-details/${candidate.id}`)}
                    className="btn btn-primary w-full py-3 text-xs font-black uppercase tracking-widest rounded-xl shadow-lg shadow-blue-600/20 group/btn"
                  >
                    <span className="flex items-center justify-center gap-2">
                      Full Evaluation
                      <ArrowUpRight size={16} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                    </span>
                  </button>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => handleComm(candidate)}
                      className="btn btn-secondary flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest py-3 rounded-xl"
                    >
                      <Mail size={16} />
                      Email
                    </button>
                    <button 
                      onClick={() => handleSchedule(candidate)}
                      className="btn btn-secondary flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest py-3 rounded-xl"
                    >
                      <Calendar size={16} />
                      Interview
                    </button>
                  </div>
                  <button 
                    onClick={() => updateCandidateStage(candidate.id, 'Shortlisted for Submission')}
                    className={cn(
                      "w-full py-3 text-[10px] font-black uppercase tracking-widest rounded-xl border transition-all",
                      isDark ? "bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700" : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                    )}
                  >
                    Shortlist
                  </button>
                </div>
              </div>
            </div>
          </div>
        )) : (
          <div className="card p-20 text-center">
            <div className={cn(
              "w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8",
              isDark ? "bg-slate-800 text-slate-600" : "bg-slate-100 text-slate-400"
            )}>
              <Zap size={40} className="opacity-40" />
            </div>
            <h3 className={cn("text-xl font-black tracking-tight", isDark ? "text-white" : "text-slate-900")}>No match results found</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-xs mx-auto">Run AI Matching from the Upload tab to see candidate evaluations here.</p>
            <button 
              onClick={() => navigate('/upload')}
              className="btn btn-primary px-8 py-3 mt-8 text-xs font-black uppercase tracking-widest rounded-xl shadow-lg shadow-blue-600/20"
            >
              Go to Upload
            </button>
          </div>
        )}
      </div>

      {selectedCandidate && (
        <>
          <ScheduleInterviewModal 
            isOpen={isScheduleModalOpen} 
            onClose={() => setIsScheduleModalOpen(false)} 
            candidate={selectedCandidate}
            onSchedule={(data) => {
              addInterview(data as any);
              setIsScheduleModalOpen(false);
            }}
          />

          <CommunicationModal
            isOpen={isCommModalOpen}
            onClose={() => setIsCommModalOpen(false)}
            candidate={selectedCandidate}
            onSend={(data) => {
              addCommunication(data as any);
              setIsCommModalOpen(false);
            }}
          />
        </>
      )}
    </div>
  );
}
