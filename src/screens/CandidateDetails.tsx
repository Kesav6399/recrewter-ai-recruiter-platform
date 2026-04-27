import React, { useState, useMemo } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Linkedin, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert,
  Clock,
  Briefcase,
  GraduationCap,
  MessageSquare,
  HelpCircle,
  ChevronRight,
  Download,
  Printer,
  Share2,
  MoreVertical,
  Star,
  Zap,
  Plus,
  Calendar,
  Send,
  Video,
  CheckCircle,
  ArrowLeft,
  StickyNote
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { cn, formatDate } from '../lib/utils';
import ScheduleInterviewModal from '../components/ScheduleInterviewModal';
import CommunicationModal from '../components/CommunicationModal';

export default function CandidateDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { candidates, addInterview, addCommunication, updateCandidateStage, addCandidateNote, theme } = useAppContext();
  
  const candidate = useMemo(() => candidates.find(c => c.id === id), [candidates, id]);
  
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isCommModalOpen, setIsCommModalOpen] = useState(false);
  const [newNote, setNewNote] = useState('');

  const isDark = theme === 'dark';

  if (!candidate) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <p className="text-slate-500">Candidate not found.</p>
        <button onClick={() => navigate(-1)} className="btn btn-secondary flex items-center gap-2">
          <ArrowLeft size={16} /> Go Back
        </button>
      </div>
    );
  }

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    addCandidateNote(candidate.id, { text: newNote });
    setNewNote('');
  };

  const getMatchLevelColor = (level: string) => {
    switch (level) {
      case 'High': return isDark ? 'text-emerald-400 bg-emerald-900/20' : 'text-emerald-600 bg-emerald-50';
      case 'Medium': return isDark ? 'text-blue-400 bg-blue-900/20' : 'text-blue-600 bg-blue-50';
      case 'Low': return isDark ? 'text-amber-400 bg-amber-900/20' : 'text-amber-600 bg-amber-50';
      default: return isDark ? 'text-slate-400 bg-slate-800' : 'text-slate-600 bg-slate-50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Scheduled': return isDark ? 'text-blue-400 bg-blue-900/20 border-blue-800' : 'text-blue-600 bg-blue-50 border-blue-100';
      case 'Completed': return isDark ? 'text-emerald-400 bg-emerald-900/20 border-emerald-800' : 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case 'Cancelled': return isDark ? 'text-red-400 bg-red-900/20 border-red-800' : 'text-red-600 bg-red-50 border-red-100';
      case 'Rescheduled': return isDark ? 'text-amber-400 bg-amber-900/20 border-amber-800' : 'text-amber-600 bg-amber-50 border-amber-100';
      case 'Awaiting Feedback': return isDark ? 'text-purple-400 bg-purple-900/20 border-purple-800' : 'text-purple-600 bg-purple-50 border-purple-100';
      default: return isDark ? 'text-slate-400 bg-slate-800 border-slate-700' : 'text-slate-600 bg-slate-50 border-slate-100';
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star 
            key={star} 
            size={14} 
            className={cn(
              "transition-all",
              star <= rating 
                ? "fill-amber-400 text-amber-400" 
                : isDark ? "text-slate-700" : "text-slate-200"
            )} 
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <button onClick={() => navigate(-1)} className={cn(
            "p-2.5 rounded-full transition-all",
            isDark ? "hover:bg-slate-800 text-slate-400" : "hover:bg-slate-100 text-slate-500"
          )}>
            <ArrowLeft size={24} />
          </button>
          <div className="w-20 h-20 bg-blue-600 text-white rounded-3xl flex items-center justify-center font-black text-3xl shadow-xl shadow-blue-600/20">
            {candidate.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <div className="flex items-center gap-4">
              <h1 className={cn("text-3xl font-black tracking-tight", isDark ? "text-white" : "text-slate-900")}>{candidate.name}</h1>
              <span className={cn(
                "px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full border",
                isDark ? "bg-emerald-900/20 text-emerald-400 border-emerald-800" : "bg-emerald-50 text-emerald-700 border-emerald-100"
              )}>
                {candidate.aiEvaluation?.recommendation || candidate.stage}
              </span>
            </div>
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mt-1">{candidate.currentRole} • {candidate.experience} Exp</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsCommModalOpen(true)}
            className="btn btn-secondary flex items-center gap-2 px-4 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl"
          >
            <Mail size={18} />
            Email
          </button>
          <button 
            onClick={() => setIsScheduleModalOpen(true)}
            className="btn btn-secondary flex items-center gap-2 px-4 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl"
          >
            <Calendar size={18} />
            Interview
          </button>
          <div className={cn("h-10 w-px mx-2", isDark ? "bg-slate-800" : "bg-slate-200")} />
          <select 
            className={cn(
              "border rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:ring-4 transition-all",
              isDark ? "bg-slate-800 border-slate-700 text-white focus:ring-blue-500/10" : "bg-white border-slate-200 text-slate-900 focus:ring-blue-500/10"
            )}
            value={candidate.stage}
            onChange={(e) => updateCandidateStage(candidate.id, e.target.value as any)}
          >
            <option value="New">New</option>
            <option value="Screening">Screening</option>
            <option value="Shortlisted">Shortlisted</option>
            <option value="Interviewing">Interviewing</option>
            <option value="Offered">Offered</option>
            <option value="Rejected">Rejected</option>
            <option value="Hired">Hired</option>
          </select>
          <button 
            className="btn btn-primary px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-blue-600/20"
            onClick={() => {
              updateCandidateStage(candidate.id, 'Submitted to Client');
              console.log(`Candidate ${candidate.name} submitted to client successfully!`);
            }}
          >
            Submit
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Profile & Contact */}
        <div className="space-y-8">
          <div className="card p-6">
            <h2 className={cn("text-xs font-black uppercase tracking-widest mb-6 flex items-center gap-2", isDark ? "text-white" : "text-slate-900")}>
              <User size={18} className="text-blue-600" />
              Contact Information
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-sm font-bold text-slate-600 dark:text-slate-400">
                <Mail size={18} className="text-slate-400" />
                {candidate.email}
              </div>
              <div className="flex items-center gap-4 text-sm font-bold text-slate-600 dark:text-slate-400">
                <Phone size={18} className="text-slate-400" />
                {candidate.phone}
              </div>
              <div className="flex items-center gap-4 text-sm font-bold text-slate-600 dark:text-slate-400">
                <MapPin size={18} className="text-slate-400" />
                {candidate.location}
              </div>
              <div className="flex items-center gap-4 text-sm font-bold text-blue-600 hover:underline cursor-pointer">
                <Linkedin size={18} className="text-blue-400" />
                linkedin.com/in/{candidate.name.toLowerCase().replace(' ', '')}
              </div>
            </div>
          </div>

          {/* Interview History */}
          <div className="card p-6">
            <h2 className={cn("text-xs font-black uppercase tracking-widest mb-6 flex items-center gap-2", isDark ? "text-white" : "text-slate-900")}>
              <Calendar size={18} className="text-blue-600" />
              Interview History
            </h2>
            <div className="space-y-4">
              {candidate.interviews?.map((interview) => (
                <div key={interview.id} className={cn(
                  "p-4 rounded-2xl border space-y-3 transition-all",
                  isDark ? "bg-slate-800/50 border-slate-800 hover:border-blue-500/50" : "bg-slate-50 border-slate-100 hover:border-blue-500/50"
                )}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{interview.round}</span>
                    <span className={cn(
                      "px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border",
                      getStatusColor(interview.status)
                    )}>
                      {interview.status}
                    </span>
                  </div>
                  <div className={cn("flex items-center gap-2 text-xs font-black", isDark ? "text-slate-300" : "text-slate-700")}>
                    <Clock size={14} className="text-slate-400" />
                    {interview.date} at {interview.time}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                    <User size={14} className="text-slate-400" />
                    Interviewer: {interview.interviewerName}
                  </div>
                  <div 
                    onClick={() => {
                      if (interview.locationOrLink.startsWith('http')) {
                        window.open(interview.locationOrLink, '_blank');
                      } else {
                        alert(`Location: ${interview.locationOrLink}`);
                      }
                    }}
                    className="flex items-center gap-2 text-[10px] font-black text-blue-600 hover:underline cursor-pointer uppercase tracking-widest"
                  >
                    <Video size={14} className="text-blue-400" />
                    Join Interview
                  </div>
                </div>
              ))}
              {(!candidate.interviews || candidate.interviews.length === 0) && (
                <div className="text-center py-8">
                  <Calendar size={32} className="mx-auto text-slate-200 dark:text-slate-800 mb-3" />
                  <p className="text-xs text-slate-400 font-bold italic">No interviews scheduled yet.</p>
                </div>
              )}
            </div>
          </div>

          <div className="card p-6">
            <h2 className={cn("text-xs font-black uppercase tracking-widest mb-6 flex items-center gap-2", isDark ? "text-white" : "text-slate-900")}>
              <Star size={18} className="text-blue-600" />
              AI Evaluation Metrics
            </h2>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-3">
                  <span className="text-slate-400">Overall Rating</span>
                  <span className={isDark ? "text-white" : "text-slate-900"}>{candidate.aiEvaluation?.overall_rating_out_of_5 || 0}/5</span>
                </div>
                <div className="mb-4">
                  {renderStars(candidate.aiEvaluation?.overall_rating_out_of_5 || 0)}
                </div>
                <div className={cn("h-2 rounded-full overflow-hidden", isDark ? "bg-slate-800" : "bg-slate-100")}>
                  <div className="h-full bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/20" style={{ width: `${((candidate.aiEvaluation?.overall_rating_out_of_5 || 0) / 5) * 100}%` }}></div>
                </div>
              </div>
              <div className="pt-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Candidate Context</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className={cn("p-3 rounded-xl border", isDark ? "bg-slate-800/50 border-slate-800" : "bg-slate-50 border-slate-100")}>
                    <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest">Experience</p>
                    <p className={cn("text-xs font-black mt-1", isDark ? "text-slate-300" : "text-slate-700")}>{candidate.aiEvaluation?.total_experience || candidate.experience + ' Years'}</p>
                  </div>
                  <div className={cn("p-3 rounded-xl border", isDark ? "bg-slate-800/50 border-slate-800" : "bg-slate-50 border-slate-100")}>
                    <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest">Notice Period</p>
                    <p className={cn("text-xs font-black mt-1", isDark ? "text-slate-300" : "text-slate-700")}>{candidate.aiEvaluation?.notice_period || 'Immediate'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className={cn("text-xs font-black uppercase tracking-widest mb-6 flex items-center gap-2", isDark ? "text-white" : "text-slate-900")}>
              <FileText size={18} className="text-blue-600" />
              Documents
            </h2>
            <div className="space-y-3">
              <div className={cn(
                "flex items-center justify-between p-3 rounded-xl border group transition-all",
                isDark ? "bg-slate-800/50 border-slate-800 hover:border-blue-500/50" : "bg-slate-50 border-slate-100 hover:border-blue-500/50"
              )}>
                <div className="flex items-center gap-3">
                  <FileText size={18} className="text-red-500" />
                  <span className={cn("text-xs font-bold", isDark ? "text-slate-300" : "text-slate-700")}>Resume_{candidate.name.replace(' ', '_')}.pdf</span>
                </div>
                <Download size={16} className="text-slate-400 hover:text-blue-500 cursor-pointer transition-colors" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: AI Evaluation & Workflow */}
        <div className="lg:col-span-2 space-y-8">
          {/* Duplicate Warning */}
          {candidate.isDuplicate && (
            <div className={cn(
              "card p-6 border-l-4 border-l-amber-500 animate-in slide-in-from-right duration-700",
              isDark ? "bg-amber-900/10" : "bg-amber-50/50"
            )}>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-2xl">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h4 className={cn("text-sm font-black uppercase tracking-widest", isDark ? "text-amber-400" : "text-amber-900")}>Potential Duplicate Detected</h4>
                  <p className={cn("text-xs font-bold mt-2 leading-relaxed", isDark ? "text-amber-300/70" : "text-amber-700")}>
                    This candidate has a high semantic similarity (94%) with <strong>{candidate.duplicateOf}</strong>. 
                    Please review both profiles to ensure they are unique.
                  </p>
                  <button className="mt-4 text-[10px] font-black text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-2 uppercase tracking-widest">
                    Compare Profiles <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* AI Summary */}
          {candidate.aiEvaluation?.short_summary && (
            <div className={cn(
              "card p-6 border-l-4 border-l-blue-500",
              isDark ? "bg-blue-900/10" : "bg-blue-50/30"
            )}>
              <h2 className={cn("text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2", isDark ? "text-white" : "text-slate-900")}>
                <Zap size={18} className="text-blue-600" />
                AI Executive Summary
              </h2>
              <p className={cn("text-sm font-bold leading-relaxed italic", isDark ? "text-slate-300" : "text-slate-700")}>
                "{candidate.aiEvaluation.short_summary}"
              </p>
            </div>
          )}

          {/* Recruiter Notes */}
          <div className="card p-6">
            <h2 className={cn("text-xs font-black uppercase tracking-widest mb-6 flex items-center gap-2", isDark ? "text-white" : "text-slate-900")}>
              <StickyNote size={18} className="text-blue-600" />
              Recruiter Notes
            </h2>
            <div className="space-y-6">
              <div className="flex gap-3">
                <textarea 
                  className={cn(
                    "flex-1 border rounded-2xl p-4 text-sm font-bold focus:outline-none focus:ring-4 transition-all min-h-[100px]",
                    isDark ? "bg-slate-800 border-slate-700 text-white focus:ring-blue-500/10" : "bg-white border-slate-200 text-slate-900 focus:ring-blue-500/10"
                  )}
                  placeholder="Add a private note about this candidate..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                />
                <button 
                  onClick={handleAddNote}
                  className="btn btn-primary self-end px-6 py-4 rounded-2xl shadow-lg shadow-blue-600/20"
                >
                  <Send size={18} />
                </button>
              </div>
              <div className="space-y-4">
                {candidate.notes?.slice().reverse().map((note) => (
                  <div key={note.id} className={cn(
                    "p-5 rounded-2xl border",
                    isDark ? "bg-slate-800/30 border-slate-800" : "bg-white border-slate-100"
                  )}>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{note.author}</span>
                      <span className="text-[10px] font-bold text-slate-400">{formatDate(note.createdAt)}</span>
                    </div>
                    <p className={cn("text-sm font-bold leading-relaxed", isDark ? "text-slate-300" : "text-slate-600")}>{note.text}</p>
                  </div>
                ))}
                {(!candidate.notes || candidate.notes.length === 0) && (
                  <p className="text-xs text-slate-400 font-bold italic text-center py-8">No notes yet. Add your first impression!</p>
                )}
              </div>
            </div>
          </div>

          {/* Communication Timeline */}
          <div className="card p-6">
            <h2 className={cn("text-xs font-black uppercase tracking-widest mb-6 flex items-center gap-2", isDark ? "text-white" : "text-slate-900")}>
              <MessageSquare size={18} className="text-blue-600" />
              Communication Timeline
            </h2>
            <div className="relative pl-8 space-y-8 before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 dark:before:bg-slate-800">
              {candidate.communications?.slice().reverse().map((comm) => (
                <div key={comm.id} className="relative">
                  <div className={cn(
                    "absolute -left-[29px] top-1 w-4 h-4 rounded-full border-4",
                    isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100",
                    comm.type === 'Email' ? 'border-blue-500' : 'border-emerald-500'
                  )} />
                  <div className="flex justify-between items-center mb-2">
                    <span className={cn("text-[10px] font-black uppercase tracking-widest", isDark ? "text-white" : "text-slate-900")}>{comm.type} - {comm.subject}</span>
                    <span className="text-[10px] font-bold text-slate-400">{comm.sentAt ? formatDate(comm.sentAt) : 'Pending'}</span>
                  </div>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 leading-relaxed">{comm.body}</p>
                </div>
              ))}
              <div className="relative pl-0">
                <div className={cn(
                  "absolute -left-[29px] top-1 w-4 h-4 rounded-full border-4 border-emerald-500",
                  isDark ? "bg-slate-900" : "bg-white"
                )} />
                <div className="flex justify-between items-center mb-2">
                  <span className={cn("text-[10px] font-black uppercase tracking-widest", isDark ? "text-white" : "text-slate-900")}>Candidate Profile Created</span>
                  <span className="text-[10px] font-bold text-slate-400">{new Date(candidate.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Comparison Table */}
          {candidate.aiEvaluation?.comparison_table && (
            <div className="card p-6">
              <h2 className={cn("text-xs font-black uppercase tracking-widest mb-6 flex items-center gap-2", isDark ? "text-white" : "text-slate-900")}>
                <Briefcase size={18} className="text-blue-600" />
                Evidence-Based Match Analysis
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={cn("border-b", isDark ? "border-slate-800" : "border-slate-100")}>
                      <th className="text-left py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Requirement</th>
                      <th className="text-left py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Client Need</th>
                      <th className="text-left py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Candidate Evidence</th>
                      <th className="text-center py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Match</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {candidate.aiEvaluation.comparison_table.map((row, i) => (
                      <tr key={i} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="py-4 pr-4">
                          <p className={cn("text-xs font-black", isDark ? "text-slate-300" : "text-slate-700")}>{row.requirement}</p>
                        </td>
                        <td className="py-4 pr-4">
                          <p className="text-xs font-bold text-slate-500 dark:text-slate-400">{row.client_need}</p>
                        </td>
                        <td className="py-4 pr-4">
                          <p className="text-xs font-bold text-slate-500 dark:text-slate-400">{row.candidate_evidence}</p>
                        </td>
                        <td className="py-4 text-center">
                          <span className={cn(
                            "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                            getMatchLevelColor(row.match_level)
                          )}>
                            {row.match_level}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Strengths, Gaps, Red Flags */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={cn("card p-6 border-l-4 border-l-emerald-500", isDark ? "bg-emerald-900/5" : "bg-emerald-50/30")}>
              <h3 className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <CheckCircle2 size={16} />
                Key Strengths
              </h3>
              <ul className="space-y-3">
                {candidate.aiEvaluation?.strengths.map((s, i) => (
                  <li key={i} className="text-xs font-bold text-slate-600 dark:text-slate-400 flex gap-2">
                    <span className="text-emerald-500 mt-0.5">•</span>
                    {s}
                  </li>
                )) || <p className="text-xs text-slate-400 font-bold italic">No data available</p>}
              </ul>
            </div>
            <div className={cn("card p-6 border-l-4 border-l-amber-500", isDark ? "bg-amber-900/5" : "bg-amber-50/30")}>
              <h3 className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <ShieldAlert size={16} />
                Identified Gaps
              </h3>
              <ul className="space-y-3">
                {candidate.aiEvaluation?.gaps.map((g, i) => (
                  <li key={i} className="text-xs font-bold text-slate-600 dark:text-slate-400 flex gap-2">
                    <span className="text-amber-500 mt-0.5">•</span>
                    {g}
                  </li>
                )) || <p className="text-xs text-slate-400 font-bold italic">No data available</p>}
              </ul>
            </div>
            <div className={cn("card p-6 border-l-4 border-l-red-500", isDark ? "bg-red-900/5" : "bg-red-50/30")}>
              <h3 className="text-[10px] font-black text-red-600 dark:text-red-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <AlertTriangle size={16} />
                Red Flags
              </h3>
              <ul className="space-y-3">
                {candidate.aiEvaluation?.optional_red_flags?.map((r, i) => (
                  <li key={i} className="text-xs font-bold text-slate-600 dark:text-slate-400 flex gap-2">
                    <span className="text-red-500 mt-0.5">•</span>
                    {r}
                  </li>
                )) || <p className="text-xs text-slate-400 font-bold italic">None identified</p>}
              </ul>
            </div>
          </div>

          {/* Screening Questions */}
          {candidate.aiEvaluation?.suggested_screening_questions && (
            <div className="card p-6">
              <h2 className={cn("text-xs font-black uppercase tracking-widest mb-6 flex items-center gap-2", isDark ? "text-white" : "text-slate-900")}>
                <MessageSquare size={18} className="text-blue-600" />
                Recommended Screening Questions
              </h2>
              <div className="space-y-4">
                {candidate.aiEvaluation.suggested_screening_questions.map((q, i) => (
                  <div key={i} className={cn(
                    "flex items-start gap-4 p-5 rounded-2xl border transition-all",
                    isDark ? "bg-slate-800/50 border-slate-800 hover:border-blue-500/50" : "bg-slate-50 border-slate-100 hover:border-blue-500/50"
                  )}>
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-xl flex items-center justify-center text-[10px] font-black shrink-0 shadow-lg shadow-blue-600/20">
                      Q{i+1}
                    </div>
                    <p className={cn("text-sm font-black leading-relaxed", isDark ? "text-slate-300" : "text-slate-700")}>{q}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <ScheduleInterviewModal 
        isOpen={isScheduleModalOpen} 
        onClose={() => setIsScheduleModalOpen(false)} 
        candidate={candidate}
        onSchedule={(data) => {
          addInterview(data as any);
          setIsScheduleModalOpen(false);
        }}
      />

      <CommunicationModal
        isOpen={isCommModalOpen}
        onClose={() => setIsCommModalOpen(false)}
        candidate={candidate}
        onSend={(data) => {
          addCommunication(data as any);
          setIsCommModalOpen(false);
        }}
      />
    </div>
  );
}
