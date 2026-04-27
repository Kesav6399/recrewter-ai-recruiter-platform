import React, { useState } from 'react';
import { User, Bell, Shield, Globe, Mail, Save, Users, Plus, Power, Search, Zap, CheckCircle2, Smartphone, Edit3, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAppContext } from '../context/AppContext';
import { UserRole } from '../types';

export default function Settings() {
  const { user, updateUserProfile, users, addUser, updateUserStatus, theme } = useAppContext();
  const [activeTab, setActiveTab] = useState('Profile');
  const [isSaved, setIsSaved] = useState(false);
  const [connectingId, setConnectingId] = useState<string | null>(null);

  // --- Real-time States for working Tabs ---
  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    email: user?.email || '',
    role: user?.role || 'Recruiter',
    location: 'Hyderabad, India'
  });

  const [integrationStates, setIntegrationStates] = useState<Record<string, boolean>>({
    'Google Calendar': true,
    'LinkedIn Recruiter': false,
    'Microsoft Outlook': false,
    'Slack': false
  });

  const [templates, setTemplates] = useState([
    { id: '1', name: "Interview Invite", subject: "Interview Invitation: [Job Title]", body: "Dear Candidate, we would like to invite you..." },
    { id: '2', name: "Rejection Mail", subject: "Update on your application", body: "Thank you for your interest, but we have decided..." },
    { id: '3', name: "Offer Letter", subject: "Job Offer: RECREWTER", body: "We are pleased to offer you the position..." }
  ]);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);

  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    displayName: '',
    role: 'Recruiter' as UserRole
  });

  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [userSearch, setUserSearch] = useState('');

  const isDark = theme === 'dark';

  // --- Handlers ---
  const handleSave = () => {
    if (user) {
      updateUserProfile({
        displayName: formData.displayName,
        email: formData.email,
        role: formData.role as UserRole
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    }
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (newUser.email && newUser.password && newUser.displayName) {
      addUser({ ...newUser, status: 'Active' });
      setNewUser({ email: '', password: '', displayName: '', role: 'Recruiter' });
      setIsAddUserModalOpen(false);
      alert('User created successfully!');
    }
  };

  const toggleIntegration = (name: string) => {
    setConnectingId(name);
    setTimeout(() => {
      setIntegrationStates(prev => ({ ...prev, [name]: !prev[name] }));
      setConnectingId(null);
    }, 1200);
  };

  const handleTemplateUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setTemplates(prev => prev.map(t => t.id === editingTemplate.id ? editingTemplate : t));
    setEditingTemplate(null);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  if (!user) return <div className="p-8 text-center font-bold">Please log in.</div>;

  const filteredUsers = users.filter(u => 
    u.displayName.toLowerCase().includes(userSearch.toLowerCase()) || 
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h1 className={cn("text-3xl font-black tracking-tight", isDark ? "text-white" : "text-slate-900")}>Settings</h1>
          <p className={cn("mt-1 text-sm", isDark ? "text-slate-400" : "text-slate-500")}>Configure your recruitment workspace and preferences.</p>
        </div>
        {activeTab !== 'Access' && (
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-bold text-sm shadow-lg shadow-blue-500/20"
          >
            {isSaved ? <CheckCircle2 size={18} /> : <Save size={18} />}
            {isSaved ? 'All Changes Saved' : 'Save Changes'}
          </button>
        )}
      </div>

      <div className={cn(
        "rounded-2xl border shadow-sm overflow-hidden",
        isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
      )}>
        <div className="flex flex-col md:flex-row min-h-[600px]">
          <div className={cn(
            "w-full md:w-64 border-r p-4 space-y-1",
            isDark ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"
          )}>
            <SettingsNavItem icon={User} label="Profile" active={activeTab === 'Profile'} onClick={() => setActiveTab('Profile')} />
            <SettingsNavItem icon={Bell} label="Notifications" active={activeTab === 'Notifications'} onClick={() => setActiveTab('Notifications')} />
            <SettingsNavItem icon={Shield} label="Security" active={activeTab === 'Security'} onClick={() => setActiveTab('Security')} />
            {user.role === 'Admin' && (
              <SettingsNavItem icon={Users} label="Access Management" active={activeTab === 'Access'} onClick={() => setActiveTab('Access')} />
            )}
            <SettingsNavItem icon={Globe} label="Integrations" active={activeTab === 'Integrations'} onClick={() => setActiveTab('Integrations')} />
            <SettingsNavItem icon={Mail} label="Email Templates" active={activeTab === 'Templates'} onClick={() => setActiveTab('Templates')} />
          </div>

          <div className="flex-1 p-8 overflow-y-auto">
            {/* --- Profile Tab --- */}
            {activeTab === 'Profile' && (
              <div className="space-y-8 animate-in fade-in">
                <section className="space-y-6">
                  <h2 className="text-xl font-black dark:text-white">Public Profile</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</label>
                      <input type="text" value={formData.displayName} onChange={e => setFormData({...formData, displayName: e.target.value})} className={cn("w-full px-4 py-3 border rounded-xl outline-none text-sm", isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-200")} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Login Email</label>
                      <input type="email" value={formData.email} disabled className={cn("w-full px-4 py-3 border rounded-xl text-sm opacity-60", isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200")} />
                    </div>
                  </div>
                </section>
              </div>
            )}

            {/* --- Notifications Tab --- */}
            {activeTab === 'Notifications' && (
              <div className="space-y-6 animate-in fade-in">
                <h2 className="text-xl font-black dark:text-white">Notification Preferences</h2>
                <div className="space-y-4">
                  {['New Candidate Uploads', 'Interview Reminders', 'Direct Messages', 'System Updates'].map(item => (
                    <div key={item} className="flex items-center justify-between p-4 border dark:border-slate-800 rounded-2xl">
                      <span className="text-sm font-bold dark:text-white">{item}</span>
                      <div className="w-10 h-5 bg-blue-600 rounded-full relative p-1 cursor-pointer"><div className="w-3 h-3 bg-white rounded-full ml-auto" /></div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* --- Security Tab --- */}
            {activeTab === 'Security' && (
              <div className="space-y-8 animate-in fade-in">
                <h2 className="text-xl font-black dark:text-white">Security & Password</h2>
                <div className="max-w-sm space-y-4">
                  <input type="password" placeholder="Current Password" className={cn("w-full p-3 border rounded-xl text-sm", isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-200")} />
                  <input type="password" placeholder="New Password" className={cn("w-full p-3 border rounded-xl text-sm", isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-200")} />
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl flex gap-3">
                    <Smartphone className="text-blue-600" />
                    <div>
                      <p className="text-xs font-bold dark:text-white">Two-Factor Authentication</p>
                      <p className="text-[10px] text-slate-500 mt-1">Status: Disabled</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* --- Integrations Tab --- */}
            {activeTab === 'Integrations' && (
              <div className="space-y-6 animate-in fade-in">
                <h2 className="text-xl font-black dark:text-white">Connected Apps</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(integrationStates).map(([name, isConnected]) => (
                    <div key={name} className={cn("p-5 border rounded-2xl flex items-center justify-between", isDark ? "border-slate-800 bg-slate-800/20" : "border-slate-100 bg-white")}>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-600">
                          {name === 'Slack' ? <Zap size={20} /> : <Globe size={20} />}
                        </div>
                        <p className="text-sm font-bold dark:text-white">{name}</p>
                      </div>
                      <button onClick={() => toggleIntegration(name)} disabled={connectingId === name} className={cn("text-[10px] font-black uppercase px-4 py-2 rounded-xl transition-all min-w-[90px]", isConnected ? "bg-emerald-100 text-emerald-600" : "bg-blue-600 text-white")}>
                        {connectingId === name ? <Loader2 className="animate-spin mx-auto" size={14} /> : (isConnected ? 'Manage' : 'Connect')}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* --- Templates Tab --- */}
            {activeTab === 'Templates' && (
              <div className="space-y-6 animate-in fade-in">
                <h2 className="text-xl font-black dark:text-white">Email Templates</h2>
                <div className="space-y-4">
                  {templates.map(t => (
                    <div key={t.id} className="p-4 border dark:border-slate-800 rounded-2xl flex items-center justify-between group hover:border-blue-500 transition-all">
                      <div>
                        <p className="text-sm font-bold dark:text-white">{t.name}</p>
                        <p className="text-xs text-slate-500 italic mt-1">Subject: {t.subject}</p>
                      </div>
                      <button onClick={() => setEditingTemplate(t)} className="p-2 text-slate-400 hover:text-blue-600"><Edit3 size={18} /></button>
                    </div>
                  ))}
                </div>
                {editingTemplate && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className={cn("w-full max-w-xl p-8 rounded-3xl border shadow-2xl animate-in zoom-in-95", isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200")}>
                      <h2 className="text-xl font-bold mb-6">Edit {editingTemplate.name}</h2>
                      <form onSubmit={handleTemplateUpdate} className="space-y-4">
                        <input type="text" value={editingTemplate.subject} onChange={e => setEditingTemplate({...editingTemplate, subject: e.target.value})} className={cn("w-full p-3 border rounded-xl outline-none", isDark ? "bg-slate-800 border-slate-700" : "bg-white")} />
                        <textarea rows={5} value={editingTemplate.body} onChange={e => setEditingTemplate({...editingTemplate, body: e.target.value})} className={cn("w-full p-3 border rounded-xl outline-none resize-none", isDark ? "bg-slate-800 border-slate-700" : "bg-white")} />
                        <div className="flex gap-3 pt-4">
                          <button type="button" onClick={() => setEditingTemplate(null)} className="flex-1 py-3 text-slate-500 font-bold">Cancel</button>
                          <button type="submit" className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold">Save Changes</button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* --- Access Management Tab --- */}
            {activeTab === 'Access' && user.role === 'Admin' && (
              <div className="space-y-6 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <h2 className={cn("text-xl font-bold", isDark ? "text-white" : "text-slate-900")}>Access Management</h2>
                  <button onClick={() => setIsAddUserModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-bold text-xs shadow-lg shadow-blue-500/20">
                    <Plus size={16} /> Create User
                  </button>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input type="text" placeholder="Search users..." value={userSearch} onChange={(e) => setUserSearch(e.target.value)} className={cn("w-full pl-10 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none text-sm", isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-200")} />
                </div>
                <div className={cn("border rounded-2xl overflow-hidden", isDark ? "border-slate-800" : "border-slate-200")}>
                  <table className="w-full text-left text-sm">
                    <thead className={isDark ? "bg-slate-800/50" : "bg-slate-50"}><tr className="text-[10px] font-black uppercase text-slate-400"><th className="px-6 py-4">User</th><th className="px-6 py-4">Role</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-right">Actions</th></tr></thead>
                    <tbody className={cn("divide-y", isDark ? "divide-slate-800" : "divide-slate-100")}>
                      {filteredUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                          <td className="px-6 py-4"><p className={cn("font-bold", isDark ? "text-white" : "text-slate-900")}>{u.displayName}</p><p className="text-xs text-slate-500">{u.email}</p></td>
                          <td className="px-6 py-4"><span className="px-2 py-1 rounded-lg text-[10px] font-black uppercase bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">{u.role}</span></td>
                          <td className="px-6 py-4"><span className={cn("text-xs font-bold", u.status === 'Active' ? "text-emerald-500" : "text-red-500")}>{u.status}</span></td>
                          <td className="px-6 py-4 text-right"><button onClick={() => updateUserStatus(u.id, u.status === 'Active' ? 'Deactivated' : 'Active')} className="p-2 text-slate-400 hover:text-red-500"><Power size={16} /></button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm">
          <div className={cn("w-full max-w-md p-8 rounded-3xl border shadow-2xl", isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200")}>
            <h2 className={cn("text-2xl font-bold mb-6", isDark ? "text-white" : "text-slate-900")}>Create New User</h2>
            <form onSubmit={handleAddUser} className="space-y-4">
              <input type="text" required value={newUser.displayName} onChange={e => setNewUser({...newUser, displayName: e.target.value})} placeholder="Full Name" className={cn("w-full p-3 border rounded-xl outline-none text-sm", isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-white")} />
              <input type="email" required value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} placeholder="Email" className={cn("w-full p-3 border rounded-xl outline-none text-sm", isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-white")} />
              <input type="password" required value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} placeholder="Temporary Password" className={cn("w-full p-3 border rounded-xl outline-none text-sm", isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-white")} />
              <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value as any})} className={cn("w-full p-3 border rounded-xl outline-none text-sm", isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-white")}>
                <option value="Recruiter">Recruiter</option><option value="Team Lead">Team Lead</option><option value="Admin">Admin</option>
              </select>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsAddUserModalOpen(false)} className="flex-1 py-3 font-bold text-slate-500">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function SettingsNavItem({ icon: Icon, label, active, onClick }: any) {
  return (
    <button onClick={onClick} className={cn("flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-bold transition-all", active ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "text-slate-500 hover:bg-blue-600/10 hover:text-blue-600")}>
      <Icon size={18} /> {label}
    </button>
  );
}
