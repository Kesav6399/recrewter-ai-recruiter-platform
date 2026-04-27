import React, { useState, useMemo } from 'react';
import { Plus, Search, Filter, MoreVertical, MapPin, Clock, Briefcase, IndianRupee, X, Trash2, Edit2, CheckCircle2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { formatDate, cn } from '../lib/utils';
import { Requirement, PipelineStage } from '../types';

export default function Requirements() {
  const { requirements, addRequirement, updateRequirement, deleteRequirement, activeRequirementId, setActiveRequirementId, theme } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReq, setEditingReq] = useState<Requirement | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [clientFilter, setClientFilter] = useState('All Clients');

  const isDark = theme === 'dark';

  const [formData, setFormData] = useState<Partial<Requirement>>({
    roleTitle: '',
    clientName: '',
    location: '',
    minExperience: 0,
    maxExperience: 0,
    budget: '',
    noticePeriod: '',
    employmentType: 'Full-time',
    priority: 'Medium',
    mandatorySkills: [],
    goodToHaveSkills: [],
    jdText: ''
  });

  const filteredRequirements = useMemo(() => {
    return requirements.filter(req => {
      const matchesSearch = req.roleTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          req.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          req.mandatorySkills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesClient = clientFilter === 'All Clients' || req.clientName === clientFilter;
      return matchesSearch && matchesClient;
    });
  }, [requirements, searchQuery, clientFilter]);

  const uniqueClients = useMemo(() => {
    return ['All Clients', ...new Set(requirements.map(r => r.clientName))];
  }, [requirements]);

  const handleOpenModal = (req?: Requirement) => {
    if (req) {
      setEditingReq(req);
      setFormData(req);
    } else {
      setEditingReq(null);
      setFormData({
        roleTitle: '',
        clientName: '',
        location: '',
        minExperience: 0,
        maxExperience: 0,
        budget: '',
        noticePeriod: '',
        employmentType: 'Full-time',
        priority: 'Medium',
        mandatorySkills: [],
        goodToHaveSkills: [],
        jdText: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingReq) {
      updateRequirement({ ...editingReq, ...formData } as Requirement);
    } else {
      const newReq: Requirement = {
        ...formData,
        id: Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'Active'
      } as Requirement;
      addRequirement(newReq);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className={cn("text-3xl font-black tracking-tight", isDark ? "text-white" : "text-slate-900")}>Client Requirements</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage and track all open job positions.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="btn btn-primary px-6 py-3 text-sm flex items-center gap-2 rounded-xl shadow-lg shadow-blue-600/20"
        >
          <Plus size={20} />
          Add New Requirement
        </button>
      </div>

      {/* Filters & Search */}
      <div className="card p-4 flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full group">
          <Search className={cn(
            "absolute left-3 top-1/2 -translate-y-1/2 transition-colors",
            isDark ? "text-slate-500 group-focus-within:text-blue-400" : "text-slate-400 group-focus-within:text-blue-500"
          )} size={18} />
          <input 
            type="text" 
            placeholder="Search by role, client, or skills..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              "w-full pl-10 pr-4 py-2.5 border rounded-xl focus:outline-none focus:ring-4 transition-all text-sm",
              isDark 
                ? "bg-slate-800 border-slate-700 text-white focus:ring-blue-500/10 focus:border-blue-500/50" 
                : "bg-slate-50 border-slate-200 text-slate-900 focus:ring-blue-500/10 focus:border-blue-500"
            )}
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button className="btn btn-secondary px-4 py-2.5 text-xs flex items-center gap-2 rounded-xl">
            <Filter size={18} />
            Filters
          </button>
          <select 
            value={clientFilter}
            onChange={(e) => setClientFilter(e.target.value)}
            className={cn(
              "flex-1 md:flex-none px-4 py-2.5 border rounded-xl text-xs font-bold outline-none transition-all",
              isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-200 text-slate-700"
            )}
          >
            {uniqueClients.map(client => (
              <option key={client} value={client}>{client}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Requirements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filteredRequirements.map((req) => (
          <div 
            key={req.id} 
            className={cn(
              "card transition-all group overflow-hidden relative",
              activeRequirementId === req.id 
                ? (isDark ? "border-blue-500 ring-2 ring-blue-500/20" : "border-blue-500 ring-2 ring-blue-500/20 shadow-xl shadow-blue-500/5") 
                : (isDark ? "border-slate-800 hover:border-slate-700" : "border-slate-100 hover:border-slate-200 shadow-sm hover:shadow-xl")
            )}
          >
            {activeRequirementId === req.id && (
              <div className="absolute top-4 right-12 bg-blue-600 text-white p-1.5 rounded-full shadow-lg z-10 animate-in zoom-in duration-300">
                <CheckCircle2 size={16} />
              </div>
            )}
            <div className="p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={cn(
                      "px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border",
                      req.priority === 'High' 
                        ? (isDark ? "bg-red-900/20 text-red-400 border-red-800" : "bg-red-50 text-red-600 border-red-100") : 
                      req.priority === 'Medium' 
                        ? (isDark ? "bg-blue-900/20 text-blue-400 border-blue-800" : "bg-blue-50 text-blue-600 border-blue-100") 
                        : (isDark ? "bg-slate-800 text-slate-400 border-slate-700" : "bg-slate-100 text-slate-600 border-slate-200")
                    )}>
                      {req.priority} Priority
                    </span>
                    <span className={cn(
                      "px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border",
                      isDark ? "bg-slate-800 text-slate-400 border-slate-700" : "bg-slate-50 text-slate-500 border-slate-100"
                    )}>
                      {req.employmentType}
                    </span>
                  </div>
                  <h3 className={cn("text-2xl font-black tracking-tight group-hover:text-blue-600 transition-colors", isDark ? "text-white" : "text-slate-900")}>{req.roleTitle}</h3>
                  <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mt-1">{req.clientName}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleOpenModal(req)}
                    className={cn(
                      "p-2 rounded-xl transition-all",
                      isDark ? "text-slate-500 hover:bg-slate-800 hover:text-blue-400" : "text-slate-400 hover:bg-blue-50 hover:text-blue-600"
                    )}
                  >
                    <Edit2 size={20} />
                  </button>
                  <button 
                    onClick={() => deleteRequirement(req.id)}
                    className={cn(
                      "p-2 rounded-xl transition-all",
                      isDark ? "text-slate-500 hover:bg-slate-800 hover:text-red-400" : "text-slate-400 hover:bg-red-50 hover:text-red-600"
                    )}
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                  <div className={cn("p-2 rounded-lg", isDark ? "bg-slate-800" : "bg-slate-50")}>
                    <MapPin size={16} className="text-blue-500" />
                  </div>
                  <span className="text-xs font-bold">{req.location}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                  <div className={cn("p-2 rounded-lg", isDark ? "bg-slate-800" : "bg-slate-50")}>
                    <Clock size={16} className="text-amber-500" />
                  </div>
                  <span className="text-xs font-bold">{req.noticePeriod}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                  <div className={cn("p-2 rounded-lg", isDark ? "bg-slate-800" : "bg-slate-50")}>
                    <Briefcase size={16} className="text-emerald-500" />
                  </div>
                  <span className="text-xs font-bold">{req.minExperience}-{req.maxExperience} yrs</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                  <div className={cn("p-2 rounded-lg", isDark ? "bg-slate-800" : "bg-slate-50")}>
                    <IndianRupee size={16} className="text-purple-500" />
                  </div>
                  <span className="text-xs font-bold">{req.budget}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-8">
                {req.mandatorySkills.slice(0, 4).map(skill => (
                  <span key={skill} className={cn(
                    "px-3 py-1.5 text-[10px] font-black rounded-lg border uppercase tracking-wider",
                    isDark ? "bg-slate-800 border-slate-700 text-slate-400" : "bg-slate-50 border-slate-100 text-slate-600"
                  )}>
                    {skill}
                  </span>
                ))}
                {req.mandatorySkills.length > 4 && (
                  <span className={cn(
                    "px-3 py-1.5 text-[10px] font-black rounded-lg border uppercase tracking-wider",
                    isDark ? "bg-slate-800 border-slate-700 text-slate-500" : "bg-slate-50 border-slate-100 text-slate-400"
                  )}>
                    +{req.mandatorySkills.length - 4} more
                  </span>
                )}
              </div>

              <div className={cn("flex items-center justify-between pt-8 border-t", isDark ? "border-slate-800" : "border-slate-100")}>
                <button 
                  onClick={() => setActiveRequirementId(activeRequirementId === req.id ? null : req.id)}
                  className={cn(
                    "px-6 py-2.5 text-xs font-black rounded-xl transition-all uppercase tracking-widest",
                    activeRequirementId === req.id 
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
                      : (isDark ? "bg-slate-800 text-slate-400 hover:bg-slate-700" : "bg-slate-100 text-slate-700 hover:bg-slate-200")
                  )}
                >
                  {activeRequirementId === req.id ? 'Selected' : 'Select for Match'}
                </button>
                <button className={cn(
                  "px-6 py-2.5 text-xs font-black rounded-xl transition-all uppercase tracking-widest",
                  isDark ? "bg-white text-slate-900 hover:bg-slate-100" : "bg-slate-900 text-white hover:bg-slate-800"
                )}>
                  View Candidates
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className={cn(
            "rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl animate-in zoom-in duration-300 border",
            isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"
          )}>
            <div className={cn(
              "px-8 py-6 border-b flex items-center justify-between",
              isDark ? "bg-slate-800/50 border-slate-800" : "bg-slate-50/50 border-slate-100"
            )}>
              <h2 className={cn("text-2xl font-black tracking-tight", isDark ? "text-white" : "text-slate-900")}>
                {editingReq ? 'Edit Requirement' : 'Add New Requirement'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className={cn(
                "p-2 rounded-xl transition-all",
                isDark ? "hover:bg-slate-700 text-slate-400" : "hover:bg-slate-200 text-slate-500"
              )}>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 overflow-y-auto max-h-[calc(90vh-140px)] space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Role Title</label>
                  <input 
                    required
                    value={formData.roleTitle}
                    onChange={(e) => setFormData({...formData, roleTitle: e.target.value})}
                    className={cn(
                      "w-full px-4 py-3 border rounded-xl text-sm font-bold focus:outline-none focus:ring-4 transition-all",
                      isDark 
                        ? "bg-slate-800 border-slate-700 text-white focus:ring-blue-500/10 focus:border-blue-500/50" 
                        : "bg-slate-50 border-slate-200 text-slate-900 focus:ring-blue-500/10 focus:border-blue-500"
                    )}
                    placeholder="e.g. Senior Full Stack Developer"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Client Name</label>
                  <input 
                    required
                    value={formData.clientName}
                    onChange={(e) => setFormData({...formData, clientName: e.target.value})}
                    className={cn(
                      "w-full px-4 py-3 border rounded-xl text-sm font-bold focus:outline-none focus:ring-4 transition-all",
                      isDark 
                        ? "bg-slate-800 border-slate-700 text-white focus:ring-blue-500/10 focus:border-blue-500/50" 
                        : "bg-slate-50 border-slate-200 text-slate-900 focus:ring-blue-500/10 focus:border-blue-500"
                    )}
                    placeholder="e.g. TechCorp Solutions"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</label>
                  <input 
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className={cn(
                      "w-full px-4 py-3 border rounded-xl text-sm font-bold focus:outline-none focus:ring-4 transition-all",
                      isDark 
                        ? "bg-slate-800 border-slate-700 text-white focus:ring-blue-500/10 focus:border-blue-500/50" 
                        : "bg-slate-50 border-slate-200 text-slate-900 focus:ring-blue-500/10 focus:border-blue-500"
                    )}
                    placeholder="e.g. Bangalore, India"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Budget / Salary</label>
                  <input 
                    value={formData.budget}
                    onChange={(e) => setFormData({...formData, budget: e.target.value})}
                    className={cn(
                      "w-full px-4 py-3 border rounded-xl text-sm font-bold focus:outline-none focus:ring-4 transition-all",
                      isDark 
                        ? "bg-slate-800 border-slate-700 text-white focus:ring-blue-500/10 focus:border-blue-500/50" 
                        : "bg-slate-50 border-slate-200 text-slate-900 focus:ring-blue-500/10 focus:border-blue-500"
                    )}
                    placeholder="e.g. 25 - 35 LPA"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Experience Range (Min - Max)</label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="number"
                      value={formData.minExperience}
                      onChange={(e) => setFormData({...formData, minExperience: parseInt(e.target.value)})}
                      className={cn(
                        "w-full px-4 py-3 border rounded-xl text-sm font-bold focus:outline-none focus:ring-4 transition-all",
                        isDark 
                          ? "bg-slate-800 border-slate-700 text-white focus:ring-blue-500/10 focus:border-blue-500/50" 
                          : "bg-slate-50 border-slate-200 text-slate-900 focus:ring-blue-500/10 focus:border-blue-500"
                      )}
                    />
                    <span className="text-slate-400 font-black">-</span>
                    <input 
                      type="number"
                      value={formData.maxExperience}
                      onChange={(e) => setFormData({...formData, maxExperience: parseInt(e.target.value)})}
                      className={cn(
                        "w-full px-4 py-3 border rounded-xl text-sm font-bold focus:outline-none focus:ring-4 transition-all",
                        isDark 
                          ? "bg-slate-800 border-slate-700 text-white focus:ring-blue-500/10 focus:border-blue-500/50" 
                          : "bg-slate-50 border-slate-200 text-slate-900 focus:ring-blue-500/10 focus:border-blue-500"
                      )}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Notice Period</label>
                  <input 
                    value={formData.noticePeriod}
                    onChange={(e) => setFormData({...formData, noticePeriod: e.target.value})}
                    className={cn(
                      "w-full px-4 py-3 border rounded-xl text-sm font-bold focus:outline-none focus:ring-4 transition-all",
                      isDark 
                        ? "bg-slate-800 border-slate-700 text-white focus:ring-blue-500/10 focus:border-blue-500/50" 
                        : "bg-slate-50 border-slate-200 text-slate-900 focus:ring-blue-500/10 focus:border-blue-500"
                    )}
                    placeholder="e.g. Immediate, 30 Days"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mandatory Skills (Comma separated)</label>
                <input 
                  value={formData.mandatorySkills?.join(', ')}
                  onChange={(e) => setFormData({...formData, mandatorySkills: e.target.value.split(',').map(s => s.trim()).filter(s => s)})}
                  className={cn(
                    "w-full px-4 py-3 border rounded-xl text-sm font-bold focus:outline-none focus:ring-4 transition-all",
                    isDark 
                      ? "bg-slate-800 border-slate-700 text-white focus:ring-blue-500/10 focus:border-blue-500/50" 
                      : "bg-slate-50 border-slate-200 text-slate-900 focus:ring-blue-500/10 focus:border-blue-500"
                  )}
                  placeholder="e.g. React, Node.js, AWS"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Job Description Text</label>
                <textarea 
                  rows={6}
                  value={formData.jdText}
                  onChange={(e) => setFormData({...formData, jdText: e.target.value})}
                  className={cn(
                    "w-full px-4 py-3 border rounded-xl text-sm font-bold focus:outline-none focus:ring-4 transition-all resize-none",
                    isDark 
                      ? "bg-slate-800 border-slate-700 text-white focus:ring-blue-500/10 focus:border-blue-500/50" 
                      : "bg-slate-50 border-slate-200 text-slate-900 focus:ring-blue-500/10 focus:border-blue-500"
                  )}
                  placeholder="Paste the full job description here..."
                />
              </div>

              <div className="flex items-center justify-end gap-4 pt-6">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className={cn(
                    "px-8 py-3 text-sm font-black uppercase tracking-widest rounded-xl transition-all",
                    isDark ? "text-slate-400 hover:bg-slate-800" : "text-slate-600 hover:bg-slate-100"
                  )}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="btn btn-primary px-8 py-3 text-sm font-black uppercase tracking-widest rounded-xl shadow-lg shadow-blue-600/20"
                >
                  {editingReq ? 'Update Requirement' : 'Save Requirement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
