import React, { useState, useEffect } from 'react';
import { X, Mail, Send, Calendar, FileText, ChevronDown, User, Info } from 'lucide-react';
import { Candidate, EmailTemplate, Communication } from '../types';
import { mockEmailTemplates } from '../mockData';
import { cn } from '../lib/utils';

interface CommunicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: Candidate;
  onSend: (communication: Partial<Communication>) => void;
  initialTemplate?: string;
}

export default function CommunicationModal({ 
  isOpen, 
  onClose, 
  candidate, 
  onSend,
  initialTemplate
}: CommunicationModalProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().split('T')[0]);
  const [scheduledTime, setScheduledTime] = useState('10:00');

  useEffect(() => {
    if (initialTemplate) {
      const template = mockEmailTemplates.find(t => t.name === initialTemplate);
      if (template) handleTemplateSelect(template);
    }
  }, [initialTemplate, isOpen]);

  const handleTemplateSelect = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    let processedSubject = template.subject
      .replace('[Role]', candidate.currentRole || 'Position')
      .replace('[Client]', 'Our Client')
      .replace('[Candidate Name]', candidate.name);
    
    let processedBody = template.body
      .replace('[Role]', candidate.currentRole || 'Position')
      .replace('[Client]', 'Our Client')
      .replace('[Candidate Name]', candidate.name)
      .replace('[Date]', 'TBD')
      .replace('[Time]', 'TBD')
      .replace('[Mode]', 'Video')
      .replace('[Link]', 'https://meet.google.com/...');

    setSubject(processedSubject);
    setBody(processedBody);
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSend({
      candidateId: candidate.id,
      type: 'Email',
      subject,
      body,
      status: isScheduled ? 'Scheduled' : 'Sent',
      scheduledFor: isScheduled ? `${scheduledDate}T${scheduledTime}:00Z` : undefined,
      templateId: selectedTemplate?.id,
      createdBy: 'user-1'
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <Mail size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Send Communication</h2>
              <p className="text-xs text-slate-500 mt-0.5">To: {candidate.name} ({candidate.email})</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Template Selection */}
            <div className="md:col-span-1 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Email Templates</label>
                <div className="space-y-2">
                  {mockEmailTemplates.map(template => (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => handleTemplateSelect(template)}
                      className={cn(
                        "w-full text-left p-3 rounded-xl border transition-all group",
                        selectedTemplate?.id === template.id 
                          ? "bg-blue-50 border-blue-200 text-blue-700 shadow-sm" 
                          : "bg-white border-slate-100 text-slate-600 hover:border-blue-200 hover:bg-slate-50"
                      )}
                    >
                      <p className="text-xs font-bold mb-0.5">{template.name}</p>
                      <p className="text-[10px] text-slate-400 group-hover:text-slate-500">{template.purpose}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                <div className="flex items-center gap-2 text-amber-600 mb-2">
                  <Info size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Pro Tip</span>
                </div>
                <p className="text-[10px] text-amber-700 leading-relaxed">
                  Templates automatically populate candidate and role details. You can still edit the final message before sending.
                </p>
              </div>
            </div>

            {/* Message Composition */}
            <div className="md:col-span-2 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Subject Line</label>
                <input 
                  type="text"
                  placeholder="Enter email subject..."
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Message Body</label>
                <textarea 
                  rows={10}
                  placeholder="Compose your message here..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none font-sans"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  required
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsScheduled(!isScheduled)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                      isScheduled 
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-200" 
                        : "bg-white border border-slate-200 text-slate-600 hover:border-blue-300"
                    )}
                  >
                    <Calendar size={14} />
                    {isScheduled ? 'Scheduled Send' : 'Schedule for Later'}
                  </button>
                </div>

                {isScheduled && (
                  <div className="flex items-center gap-2 animate-in slide-in-from-right-4 duration-300">
                    <input 
                      type="date"
                      className="px-2 py-1 bg-white border border-slate-200 rounded text-[10px] focus:outline-none"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                    />
                    <input 
                      type="time"
                      className="px-2 py-1 bg-white border border-slate-200 rounded text-[10px] focus:outline-none"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button 
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="btn btn-primary px-8 flex items-center gap-2"
            >
              <Send size={16} />
              {isScheduled ? 'Schedule Communication' : 'Send Now'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
