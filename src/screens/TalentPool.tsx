import React, { useState, useMemo } from 'react';
import { Search, Filter, Folder, Database, MapPin, Briefcase, MoreVertical, Plus, Download, UserPlus, Mail, Calendar, Trash2, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Candidate } from '../types';
import ScheduleInterviewModal from '../components/ScheduleInterviewModal';
import CommunicationModal from '../components/CommunicationModal';
import AddCandidateModal from '../components/AddCandidateModal';

export default function TalentPool() {
  const navigate = useNavigate();
  const { 
    candidates, 
    updateCandidate, 
    deleteCandidate, 
    addCandidate, 
    addInterview, 
    addCommunication, 
    sendEmailReminder,
    theme 
  } = useAppContext();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStage, setSelectedStage] = useState<string>('All');
  const [activeFolder, setActiveFolder] = useState<string>('All');
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isCommModalOpen, setIsCommModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const [folders, setFolders] = useState([
    { id: 'f1', name: 'Java Developers', icon: 'bg-blue-500' },
    { id: 'f2', name: 'AWS Architects', icon: 'bg-indigo-500' },
    { id: 'f3', name: 'Data Engineers', icon: 'bg-emerald-500' },
    { id: 'f4', name: 'Immediate Joiners', icon: 'bg-amber-500' },
    { id: 'f5', name: 'Hyderabad Profiles', icon: 'bg-purple-500' },
  ]);

  const isDark = theme === 'dark';

  const handleCreateFolder = () => {
    const name = prompt("Enter new folder name:");
    if (name && name.trim() !== "") {
      setFolders([...folders, { id: `f-${Date.now()}`, name: name.trim(), icon: 'bg-slate-500' }]);
    }
  };

  const filteredCandidates = useMemo(() => {
    return candidates.filter(c => {
      const matchesSearch = 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.currentRole.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesStage = selectedStage === 'All' || c.stage === selectedStage;
      const matchesFolder = activeFolder === 'All' || (c as any).folder === activeFolder;

      return matchesSearch && matchesStage && matchesFolder;
    });
  }, [candidates, searchQuery, selectedStage, activeFolder]);

  const handleMoveToFolder = (candidate: Candidate, folderName: string) => {
    updateCandidate({ ...candidate, folder: folderName } as any);
    setOpenMenuId(null);
  };

  const getStageColor = (stage: string) => {
    const base = "px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ";
    switch (stage) {
      case 'Shortlisted': return base + (isDark ? "bg-emerald-900/20 text-emerald-400 border-emerald-800" : "bg-emerald-50 text-emerald-700 border-emerald-100");
      case 'Rejected': return base + (isDark ? "bg-red-900/20 text-red-400 border-red-800" : "bg-red-50 text-red-700 border-red-100");
      case 'New': return base + (isDark ? "bg-blue-900/20 text-blue-400 border-blue-800" : "bg-blue-50 text-blue-700 border-blue-100");
      default: return base + (isDark ? "bg-slate-800 text-slate-400 border-slate-700" : "bg-slate-50 text-slate-600 border-slate-200");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className={cn("text-3xl font-black tracking-tight", isDark ? "text-white" : "text-slate-900")}>Talent Pool</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Smart Search & Evidence-Based Candidate Management</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setIsAddModalOpen(true)} className="btn btn-primary px-6 py-2.5 text-xs flex items-center gap-2 rounded-xl shadow-lg shadow-blue-600/20">
            <UserPlus size={16} /> Add Candidate
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="space-y-6">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Folders</h3>
              <button onClick={handleCreateFolder} className="p-1.5 hover:bg-blue-50 dark:hover:bg-slate-800 text-blue-600 rounded-lg transition-all"><Plus size={16} /></button>
            </div>
            <div className="space-y-1">
              <button onClick={() => setActiveFolder('All')} className={cn("flex items-center justify-between w-full px-3 py-2.5 rounded-xl transition-all", activeFolder === 'All' ? "bg-blue-600 text-white" : "hover:bg-slate-50 dark:hover:bg-slate-800")}>
                <div className="flex items-center gap-3"><Database size={18} /> <span className="text-xs font-bold">All Resumes</span></div>
                <span className="text-[10px] opacity-70">{candidates.length}</span>
              </button>
              {folders.map(f => (
                <button key={f.id} onClick={() => setActiveFolder(f.name)} className={cn("flex items-center justify-between w-full px-3 py-2.5 rounded-xl transition-all", activeFolder === f.name ? "bg-blue-600 text-white" : "hover:bg-slate-50 dark:hover:bg-slate-800")}>
                  <div className="flex items-center gap-3"><Folder size={18} /> <span className="text-xs font-bold">{f.name}</span></div>
                  <span className="text-[10px] opacity-70">{candidates.filter(c => (c as any).folder === f.name).length}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <div className="card p-4 flex flex-col md:flex-row items-center gap-4">
            <div className="relative flex-1 w-full group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Skills, Roles, or Names..." 
                className={cn("w-full pl-10 pr-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2", isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200")}
              />
            </div>
            <select value={selectedStage} onChange={(e) => setSelectedStage(e.target.value)} className={cn("border rounded-xl px-4 py-2.5 text-xs font-bold", isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200")}>
              <option value="All">All Stages</option>
              {['New', 'Shortlisted', 'Interviewing', 'Offered', 'Rejected'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* ADDED overflow-visible HERE TO PREVENT CLIPPING */}
          <div className="card overflow-visible">
            <div className="divide-y dark:divide-slate-800">
              {filteredCandidates.map((candidate, index) => (
                /* ADDED overflow-visible HERE TOO */
                <div key={candidate.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-all group relative overflow-visible">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black shadow-lg shadow-blue-600/20">
                      {candidate.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h4 className="text-base font-black dark:text-white">{candidate.name}</h4>
                        <span className={getStageColor(candidate.stage)}>{candidate.stage}</span>
                      </div>
                      <div className="flex gap-4 text-xs text-slate-500 mt-1 font-medium">
                        <span className="flex items-center gap-1"><Briefcase size={14}/> {candidate.currentRole}</span>
                        <span className="flex items-center gap-1"><MapPin size={14}/> {candidate.location}</span>
                        <span className="text-blue-500 font-bold">{candidate.experience} Exp</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="hidden xl:flex gap-2 mr-4">
                      {candidate.skills.slice(0, 2).map(s => (
                        <span key={s} className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-[10px] font-bold rounded-lg">{s}</span>
                      ))}
                    </div>
                    
                    <button onClick={() => sendEmailReminder(candidate.id, 'FollowUp')} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all" title="Send Email/Reminder">
                      <Mail size={18}/>
                    </button>
                    
                    <button onClick={() => { setSelectedCandidate(candidate); setIsScheduleModalOpen(true); }} className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-all" title="Schedule Interview">
                      <Calendar size={18}/>
                    </button>

                    <button onClick={() => navigate(`/candidate-details/${candidate.id}`)} className="btn btn-secondary px-4 py-2 text-xs font-bold rounded-xl">View Details</button>
                    
                    <div className="relative">
                      <button onClick={() => setOpenMenuId(openMenuId === candidate.id ? null : candidate.id)} className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                        <MoreVertical size={18}/>
                      </button>

                      {openMenuId === candidate.id && (
                        <div className={cn(
                          "absolute right-0 w-48 rounded-xl shadow-2xl z-[100] border p-2 animate-in zoom-in-95",
                          // FIX: Open upwards if this is the last item in the filtered list
                          index === filteredCandidates.length - 1 && filteredCandidates.length > 2 ? "bottom-full mb-2" : "top-10",
                          isDark ? "bg-slate-900 border-slate-800 shadow-black" : "bg-white border-slate-100 shadow-slate-200"
                        )}>
                          <button onClick={() => { alert('Downloading CV...'); setOpenMenuId(null); }} className="flex items-center gap-2 w-full px-3 py-2 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg">
                            <Download size={14}/> Download Resume
                          </button>
                          <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />
                          <p className="px-3 py-1 text-[10px] uppercase font-black text-slate-400">Move to Folder</p>
                          <div className="max-h-32 overflow-y-auto">
                            {folders.map(f => (
                              <button key={f.id} onClick={() => handleMoveToFolder(candidate, f.name)} className="flex items-center gap-2 w-full px-3 py-2 text-xs hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all">
                                <Folder size={14} className="text-slate-400"/> {f.name}
                              </button>
                            ))}
                          </div>
                          <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />
                          <button onClick={() => { deleteCandidate(candidate.id); setOpenMenuId(null); }} className="flex items-center gap-2 w-full px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                            <Trash2 size={14}/> Delete Candidate
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {filteredCandidates.length === 0 && (
              <div className="p-20 text-center">
                <Search size={40} className="mx-auto text-slate-300 mb-4" />
                <p className="text-slate-500 font-bold">No candidates found matching your criteria.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedCandidate && isScheduleModalOpen && (
        <ScheduleInterviewModal 
          isOpen={isScheduleModalOpen} 
          onClose={() => setIsScheduleModalOpen(false)} 
          candidate={selectedCandidate}
          onSchedule={(data) => {
            addInterview(data as any);
            setIsScheduleModalOpen(false);
            sendEmailReminder(selectedCandidate.id, 'Interview');
          }}
        />
      )}

      {selectedCandidate && isCommModalOpen && (
        <CommunicationModal
          isOpen={isCommModalOpen}
          onClose={() => setIsCommModalOpen(false)}
          candidate={selectedCandidate}
          onSend={(data) => {
            addCommunication(data as any);
            setIsCommModalOpen(false);
          }}
        />
      )}

      <AddCandidateModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={(data) => {
          addCandidate(data as any);
          setIsAddModalOpen(false);
        }}
      />
    </div>
  );
}