import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Requirement,
  Candidate,
  Notification,
  Interview,
  Communication,
  UserProfile,
  PipelineStage,
  CandidateNote,
  UserAccount
} from '../types';
import {
  mockRequirements,
  mockCandidates,
  mockNotifications,
  mockInterviews
} from '../mockData';

// 1. Define Types
interface AppState {
  user: UserProfile | null;
  requirements: Requirement[];
  candidates: Candidate[];
  notifications: Notification[];
  interviews: Interview[];
  activeRequirementId: string | null;
  uploadedFiles: { id: string; name: string; type: 'JD' | 'Resume'; status: 'Pending' | 'Parsed' | 'Error' }[];
  matchResults: Candidate[];
  theme: 'light' | 'dark';
  users: UserAccount[];
}

interface AppContextType extends AppState {
  setUser: (user: UserProfile | null) => void;
  updateUserProfile: (updates: Partial<Pick<UserAccount, 'displayName' | 'email' | 'role'>>) => void;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  toggleTheme: () => void;
  addRequirement: (req: Requirement) => void;
  updateRequirement: (req: Requirement) => void;
  deleteRequirement: (id: string) => void;
  setActiveRequirementId: (id: string | null) => void;
  addCandidate: (candidate: Candidate) => void;
  updateCandidate: (candidate: Candidate) => void;
  deleteCandidate: (id: string) => void;
  sendEmailReminder: (candidateId: string, type: 'Interview' | 'FollowUp') => void;
  updateCandidateStage: (candidateId: string, stage: PipelineStage) => void;
  addNotification: (notif: Notification) => void;
  markNotificationRead: (id: string) => void;
  addInterview: (interview: Omit<Interview, 'id' | 'createdAt'>) => void;
  addCommunication: (comm: Omit<Communication, 'id' | 'sentAt'>) => void;
  addUploadedFile: (file: { name: string; type: 'JD' | 'Resume' }) => string;
  updateFileStatus: (id: string, status: 'Pending' | 'Parsed' | 'Error') => void;
  setMatchResults: (results: Candidate[]) => void;
  addCandidateNote: (candidateId: string, note: Omit<CandidateNote, 'id' | 'createdAt' | 'author'>) => void;
  addUser: (user: Omit<UserAccount, 'id' | 'createdAt'>) => void;
  updateUserStatus: (id: string, status: 'Active' | 'Deactivated') => void;
  resetUserPassword: (id: string, newPassword: string) => void;
}

// 2. Create Context
const AppContext = createContext<AppContextType | undefined>(undefined);

// 3. Constant Keys and Seed Data
const STORAGE_KEY = 'recrewter_app_state';

const seededUsers: UserAccount[] = [
  {
    id: 'admin-1',
    email: 'kesavradhakrishna2003@gmail.com',
    password: 'Admin@123',
    displayName: 'Kesav Radhakrishna',
    role: 'Admin',
    status: 'Active',
    createdAt: new Date().toISOString()
  },
  {
    id: 'lead-1',
    email: 'teamlead1@recrewter.com',
    password: 'TeamLead@123',
    displayName: 'Team Lead 1',
    role: 'Team Lead',
    status: 'Active',
    createdAt: new Date().toISOString()
  },
  {
    id: 'recruiter-1',
    email: 'recruiter1@recrewter.com',
    password: 'Recruiter@123',
    displayName: 'Recruiter 1',
    role: 'Recruiter',
    status: 'Active',
    createdAt: new Date().toISOString()
  }
];

const mergeSeededUsers = (storedUsers: UserAccount[] = []): UserAccount[] => {
  const map = new Map<string, UserAccount>();
  seededUsers.forEach((user) => map.set(user.email.toLowerCase(), user));
  storedUsers.forEach((user) => map.set(user.email.toLowerCase(), user));
  return Array.from(map.values());
};

// 4. Provider Component
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [activeRequirementId, setActiveRequirementId] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<AppState['uploadedFiles']>([]);
  const [matchResults, setMatchResultsState] = useState<Candidate[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [users, setUsers] = useState<UserAccount[]>([]);

  const setInitialState = () => {
    setUser(null);
    setRequirements(mockRequirements);
    setCandidates(mockCandidates);
    setNotifications(mockNotifications);
    setInterviews(mockInterviews);
    setActiveRequirementId(null);
    setUploadedFiles([]);
    setMatchResultsState([]);
    setTheme('light');
    setUsers(seededUsers);
  };

  useEffect(() => {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        setUser(parsed.user || null);
        setRequirements(parsed.requirements || mockRequirements);
        setCandidates(parsed.candidates || mockCandidates);
        setNotifications(parsed.notifications || mockNotifications);
        setInterviews(parsed.interviews || mockInterviews);
        setActiveRequirementId(parsed.activeRequirementId || null);
        setUploadedFiles(parsed.uploadedFiles || []);
        setMatchResultsState(parsed.matchResults || []);
        setTheme(parsed.theme || 'light');
        setUsers(mergeSeededUsers(parsed.users || []));
      } catch (e) {
        setInitialState();
      }
    } else {
      setInitialState();
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    const stateToSave = {
      user, requirements, candidates, notifications, interviews,
      activeRequirementId, uploadedFiles, matchResults, theme, users
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isLoaded, user, requirements, candidates, notifications, interviews, activeRequirementId, uploadedFiles, matchResults, theme, users]);

  const login = (email: string, password: string): boolean => {
    const normalizedEmail = email.trim().toLowerCase();
    const foundUser = users.find(u => u.email.toLowerCase() === normalizedEmail && u.password === password);
    if (!foundUser) return false;
    const newUser: UserProfile = {
      uid: foundUser.id,
      email: foundUser.email,
      displayName: foundUser.displayName,
      role: foundUser.role,
      createdAt: foundUser.createdAt
    };
    setUser(newUser);
    return true;
  };

  const logout = () => setUser(null);
  const toggleTheme = () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  const updateUserProfile = (updates: Partial<Pick<UserAccount, 'displayName' | 'email' | 'role'>>) => {
    if (!user) return;

    setUser({
      ...user,
      ...updates
    });
    setUsers((prev) =>
      prev.map((account) =>
        account.id === user.uid
          ? {
              ...account,
              ...updates
            }
          : account
      )
    );
  };

  const deleteCandidate = (id: string) => {
    setCandidates((prev) => prev.filter((c) => c.id !== id));
    addNotification({
      id: `notif-${Date.now()}`,
      userId: user?.uid || '1',
      title: 'Candidate Removed',
      message: `Profile deleted from talent pool.`,
      type: 'Feedback',
      status: 'Unread',
      createdAt: new Date().toISOString()
    });
  };

  const sendEmailReminder = (candidateId: string, type: 'Interview' | 'FollowUp') => {
    const candidate = candidates.find(c => c.id === candidateId);
    if (candidate) {
      addNotification({
        id: `notif-${Date.now()}`,
        userId: user?.uid || '1',
        title: `${type} Alert Sent`,
        message: `Professional notification sent to ${candidate.name}.`,
        type: 'Reminder',
        status: 'Unread',
        createdAt: new Date().toISOString()
      });
    }
  };

  const setMatchResults = (results: Candidate[]) => setMatchResultsState(results);
  const addRequirement = (req: Requirement) => setRequirements((prev) => [req, ...prev]);
  const updateRequirement = (req: Requirement) => setRequirements((prev) => prev.map((r) => (r.id === req.id ? req : r)));
  const deleteRequirement = (id: string) => setRequirements((prev) => prev.filter((r) => r.id !== id));
  const addCandidate = (candidate: Candidate) => setCandidates((prev) => [candidate, ...prev]);
  const updateCandidate = (candidate: Candidate) => setCandidates((prev) => prev.map((e) => (e.id === candidate.id ? candidate : e)));
  const updateCandidateStage = (candidateId: string, stage: PipelineStage) => {
    setCandidates((prev) => prev.map((c) => c.id === candidateId ? { ...c, stage } : c));
    setMatchResultsState((prev) => prev.map((c) => c.id === candidateId ? { ...c, stage } : c));
  };
  const addNotification = (notif: Notification) => setNotifications((prev) => [notif, ...prev]);
  const markNotificationRead = (id: string) => setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, status: 'Read' } : n));
  const addInterview = (data: any) => setInterviews((prev) => [{ ...data, id: `int-${Date.now()}`, createdAt: new Date().toISOString() }, ...prev]);
  const addCommunication = (data: any) => setCandidates((prev) => prev.map((c) => c.id === data.candidateId ? { ...c, communications: [data, ...(c.communications || [])] } : c));
  const addUploadedFile = (file: any) => {
    const id = Math.random().toString(36).slice(2, 11);
    setUploadedFiles((prev) => [...prev, { id, ...file, status: 'Pending' }]);
    return id;
    
  };
  const updateFileStatus = (id: string, status: any) => setUploadedFiles((prev) => prev.map((f) => (f.id === id ? { ...f, status } : f)));
  const addCandidateNote = (candidateId: string, noteData: any) => setCandidates((prev) => prev.map((c) => c.id === candidateId ? { ...c, notes: [noteData, ...(c.notes || [])] } : c));
  const addUser = (userData: any) =>
    setUsers((prev) =>
      mergeSeededUsers([
        ...prev,
        {
          ...userData,
          id: `user-${Date.now()}`,
          createdAt: new Date().toISOString()
        }
      ])
    );
  const updateUserStatus = (id: string, status: any) => setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status } : u)));
  const resetUserPassword = (id: string, newPassword: string) => setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, password: newPassword } : u)));

  if (!isLoaded) return null;

  return (
    <AppContext.Provider
      value={{
        user, requirements, candidates, notifications, interviews,
        activeRequirementId, uploadedFiles, matchResults, theme, users,
        setUser, updateUserProfile, login, logout, toggleTheme, addRequirement, updateRequirement,
        deleteRequirement, setActiveRequirementId, addCandidate, updateCandidate,
        deleteCandidate, sendEmailReminder, updateCandidateStage, addNotification,
        markNotificationRead, addInterview, addCommunication, addUploadedFile,
        updateFileStatus, setMatchResults, addCandidateNote, addUser,
        updateUserStatus, resetUserPassword
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

// 5. Export Hook
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) throw new Error('useAppContext must be used within an AppProvider');
  return context;
};
