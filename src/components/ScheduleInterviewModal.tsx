import React, { useState } from 'react';
import { X, Calendar, Clock, MapPin, Video, User, FileText, Globe } from 'lucide-react';
import { Candidate, Requirement, Interview } from '../types';
import { cn } from '../lib/utils';

interface ScheduleInterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: Candidate;
  requirement?: Requirement;
  onSchedule: (interview: Partial<Interview>) => void;
  initialData?: Partial<Interview>;
}

export default function ScheduleInterviewModal({ 
  isOpen, 
  onClose, 
  candidate, 
  requirement,
  onSchedule,
  initialData
}: ScheduleInterviewModalProps) {
  const [formData, setFormData] = useState<Partial<Interview>>({
    round: initialData?.round || 'Technical Round 1',
    interviewerName: initialData?.interviewerName || '',
    date: initialData?.date || new Date().toISOString().split('T')[0],
    time: initialData?.time || '10:00',
    timeZone: initialData?.timeZone || 'IST',
    mode: initialData?.mode || 'Video',
    locationOrLink: initialData?.locationOrLink || '',
    notes: initialData?.notes || '',
    status: initialData?.status || 'Scheduled'
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSchedule({
      ...formData,
      candidateId: candidate.id,
      requirementId: requirement?.id || candidate.requirementId || 'general'
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {initialData?.id ? 'Reschedule Interview' : 'Schedule Interview'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              For {candidate.name} • {requirement?.roleTitle || 'General Role'}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Round & Interviewer */}
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Interview Round</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <select 
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    value={formData.round}
                    onChange={(e) => setFormData({...formData, round: e.target.value})}
                    required
                  >
                    <option>Screening Round</option>
                    <option>Technical Round 1</option>
                    <option>Technical Round 2</option>
                    <option>Managerial Round</option>
                    <option>HR Round</option>
                    <option>Client Interview</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Interviewer Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="text"
                    placeholder="e.g. Suresh Kumar"
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    value={formData.interviewerName}
                    onChange={(e) => setFormData({...formData, interviewerName: e.target.value})}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Date & Time */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      type="date"
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Time</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      type="time"
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      value={formData.time}
                      onChange={(e) => setFormData({...formData, time: e.target.value})}
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Time Zone</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <select 
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    value={formData.timeZone}
                    onChange={(e) => setFormData({...formData, timeZone: e.target.value})}
                  >
                    <option>IST (UTC+5:30)</option>
                    <option>EST (UTC-5:00)</option>
                    <option>PST (UTC-8:00)</option>
                    <option>GMT (UTC+0:00)</option>
                    <option>SGT (UTC+8:00)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Mode & Link */}
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Interview Mode</label>
                <div className="flex gap-2">
                  {(['Video', 'In-Person', 'Phone'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setFormData({...formData, mode: m})}
                      className={cn(
                        "flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2",
                        formData.mode === m 
                          ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200" 
                          : "bg-white border-slate-200 text-slate-600 hover:border-blue-300"
                      )}
                    >
                      {m === 'Video' && <Video size={14} />}
                      {m === 'In-Person' && <MapPin size={14} />}
                      {m === 'Phone' && <Clock size={14} />}
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  {formData.mode === 'Video' ? 'Meeting Link' : formData.mode === 'In-Person' ? 'Location' : 'Phone Number'}
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="text"
                    placeholder={formData.mode === 'Video' ? 'https://meet.google.com/...' : 'Office Address or Phone'}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    value={formData.locationOrLink}
                    onChange={(e) => setFormData({...formData, locationOrLink: e.target.value})}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Notes / Instructions</label>
              <textarea 
                rows={4}
                placeholder="Add any specific instructions for the candidate or interviewer..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20" defaultChecked />
                <span className="text-xs text-slate-500 group-hover:text-slate-700">Send Candidate Email</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20" defaultChecked />
                <span className="text-xs text-slate-500 group-hover:text-slate-700">Send Interviewer Invite</span>
              </label>
            </div>
            <div className="flex items-center gap-3">
              <button 
                type="button"
                onClick={onClose}
                className="px-6 py-2 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="btn btn-primary px-8"
              >
                {initialData?.id ? 'Update Interview' : 'Schedule Interview'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
