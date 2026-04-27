import React, { useState, useMemo } from 'react';
import { 
  MoreHorizontal, 
  Plus, 
  Search, 
  Filter, 
  ChevronRight, 
  User, 
  Clock, 
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  GripVertical,
  Calendar,
  Mail,
  ArrowLeft
} from 'lucide-react';
import { PipelineStage, Candidate } from '../types';
import { cn } from '../lib/utils';
import { useAppContext } from '../context/AppContext';
import ScheduleInterviewModal from '../components/ScheduleInterviewModal';
import CommunicationModal from '../components/CommunicationModal';
import AddCandidateModal from '../components/AddCandidateModal';
import { useNavigate } from 'react-router-dom';

const STAGES: PipelineStage[] = [
  'New',
  'Screening',
  'Shortlisted for Submission',
  'Submitted to Client',
  'Shortlisted for Interview',
  'Interview Scheduled',
  'Offered',
  'Hired'
];

export default function Pipeline() {
  const navigate = useNavigate();
  const { candidates, addCandidate, updateCandidateStage, addInterview, addCommunication } = useAppContext();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isCommModalOpen, setIsCommModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const filteredCandidates = useMemo(() => {
    return candidates.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.currentRole.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [candidates, searchQuery]);

  const handleSchedule = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setIsScheduleModalOpen(true);
  };

  const handleComm = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setIsCommModalOpen(true);
  };

  const moveCandidate = (candidateId: string, direction: 'next' | 'prev') => {
    const candidate = candidates.find(c => c.id === candidateId);
    if (!candidate) return;

    const currentIndex = STAGES.indexOf(candidate.stage);
    let nextIndex = currentIndex;

    if (direction === 'next' && currentIndex < STAGES.length - 1) {
      nextIndex = currentIndex + 1;
    } else if (direction === 'prev' && currentIndex > 0) {
      nextIndex = currentIndex - 1;
    }

    if (nextIndex !== currentIndex) {
      updateCandidateStage(candidateId, STAGES[nextIndex]);
    }
  };

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col space-y-4 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Recruitment Pipeline</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage candidate flow across submission and interview stages.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input 
              type="text" 
              placeholder="Search pipeline..." 
              className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-bold">
            <Filter size={14} />
            Filter
          </button>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="btn btn-primary"
          >
            <Plus size={16} className="mr-1.5" />
            Add Candidate
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex gap-4 h-full min-w-max">
          {STAGES.map(stage => (
            <div key={stage} className="w-72 flex flex-col bg-slate-50/50 rounded-xl border border-slate-200/60">
              <div className="p-3 border-b border-slate-200/60 flex items-center justify-between bg-white rounded-t-xl">
                <div className="flex items-center gap-2">
                  <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{stage}</h3>
                  <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-md">
                    {filteredCandidates.filter(c => c.stage === stage).length}
                  </span>
                </div>
                <button className="p-1 text-slate-400 hover:bg-slate-50 rounded-md">
                  <MoreHorizontal size={14} />
                </button>
              </div>
              
              <div className="flex-1 p-2 space-y-2 overflow-y-auto custom-scrollbar">
                {filteredCandidates.filter(c => c.stage === stage).map(candidate => (
                  <div key={candidate.id} className="card p-3 hover:border-blue-300 transition-all cursor-grab active:cursor-grabbing group">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-slate-100 text-slate-600 rounded-lg flex items-center justify-center font-bold text-xs">
                          {candidate.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="cursor-pointer" onClick={() => navigate(`/candidate-details/${candidate.id}`)}>
                          <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{candidate.name}</h4>
                          <p className="text-[10px] text-slate-500">{candidate.currentRole}</p>
                        </div>
                      </div>
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        (candidate.aiEvaluation?.overall_rating_out_of_5 || 0) >= 4.5 ? "bg-emerald-500" : 
                        (candidate.aiEvaluation?.overall_rating_out_of_5 || 0) >= 4.0 ? "bg-blue-500" : "bg-amber-500"
                      )} />
                    </div>
                    
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                        <Clock size={10} />
                        Active
                      </div>
                      <div className="flex items-center gap-1.5">
                        {candidate.isDuplicate && <AlertTriangle size={12} className="text-amber-500" />}
                        <button 
                          onClick={() => handleComm(candidate)}
                          className="p-1 text-slate-300 hover:text-blue-600 transition-colors"
                          title="Send Email"
                        >
                          <Mail size={12} />
                        </button>
                        <button 
                          onClick={() => handleSchedule(candidate)}
                          className="p-1 text-slate-300 hover:text-indigo-600 transition-colors"
                          title="Schedule Interview"
                        >
                          <Calendar size={12} />
                        </button>
                        <div className="flex items-center gap-0.5 ml-1">
                          <button 
                            onClick={() => moveCandidate(candidate.id, 'prev')}
                            disabled={STAGES.indexOf(candidate.stage) === 0}
                            className="p-1 text-slate-300 hover:text-blue-600 disabled:opacity-30"
                          >
                            <ArrowLeft size={12} />
                          </button>
                          <button 
                            onClick={() => moveCandidate(candidate.id, 'next')}
                            disabled={STAGES.indexOf(candidate.stage) === STAGES.length - 1}
                            className="p-1 text-slate-300 hover:text-blue-600 disabled:opacity-30"
                          >
                            <ArrowRight size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {filteredCandidates.filter(c => c.stage === stage).length === 0 && (
                  <div className="h-24 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center">
                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Empty</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
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

          <AddCandidateModal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            onAdd={(data) => {
              addCandidate(data as any);
              setIsAddModalOpen(false);
            }}
          />
        </>
      )}
    </div>
  );
}
