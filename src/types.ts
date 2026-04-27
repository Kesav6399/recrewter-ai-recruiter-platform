export type UserRole = 'Recruiter' | 'Team Lead' | 'Admin';

export interface UserAccount {
  id: string;
  email: string;
  password: string;
  displayName: string;
  role: UserRole;
  status: 'Active' | 'Deactivated';
  createdAt: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  createdAt: string;
}

export interface Requirement {
  id: string;
  clientName: string;
  roleTitle: string;
  jdText: string;
  mandatorySkills: string[];
  goodToHaveSkills: string[];
  minExperience: number;
  maxExperience: number;
  location: string;
  noticePeriod: string;
  employmentType: string;
  budget: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Active' | 'On Hold' | 'Closed';
  remarks: string;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ComparisonRow {
  requirement: string;
  client_need: string;
  candidate_evidence: string;
  match_level: 'Strong' | 'Partial' | 'Weak' | 'Missing';
}

export interface AIEvaluation {
  candidate_name: string;
  current_role: string;
  total_experience: string;
  location: string;
  notice_period: string;
  overall_rating_out_of_5: number;
  recommendation: 'Strong Shortlist' | 'Shortlist' | 'Consider' | 'Risky' | 'Reject';
  short_summary: string;
  comparison_table: ComparisonRow[];
  strengths: string[];
  gaps: string[];
  optional_red_flags: string[];
  suggested_screening_questions: string[];
  sub_scores?: {
    technical_match: number;
    role_alignment: number;
    stability_score: number;
  };
}

export interface JDParsedPreview {
  role: string;
  must_have_skills: string[];
  optional_skills: string[];
  tools: string[];
  seniority: string;
  domain: string;
  certifications: string[];
  communication_expectations: string;
  stakeholder_expectations: string;
  location: string;
  notice_period: string;
  shift: string;
  client_specific_filters: string[];
}

export interface ResumeParsedPreview {
  candidate_name: string;
  email: string;
  phone: string;
  total_experience: string;
  relevant_experience: string;
  current_role: string;
  current_company: string;
  location: string;
  notice_period: string;
  skills: string[];
  certifications: string[];
  projects: string[];
  domain_exposure: string[];
  real_skill_depth: string;
  years_per_skill: string;
  project_evidence: string;
  responsibility_evidence: string;
  role_consistency: string;
  leadership_exposure: string;
  education: string[];
}

export interface Interview {
  id: string;
  candidateId: string;
  requirementId: string;
  round: string;
  interviewerName: string;
  date: string;
  time: string;
  timeZone: string;
  mode: 'Video' | 'In-Person' | 'Phone';
  locationOrLink: string;
  notes?: string;
  status: 'Scheduled' | 'Rescheduled' | 'Completed' | 'Cancelled' | 'Awaiting Feedback';
  createdAt: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  purpose: string;
}

export interface Communication {
  id: string;
  candidateId: string;
  type: 'Email' | 'Reminder';
  subject: string;
  body: string;
  status: 'Sent' | 'Scheduled' | 'Failed';
  scheduledFor?: string;
  sentAt?: string;
  templateId?: string;
  createdBy: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'Interview' | 'Feedback' | 'Duplicate' | 'Submission' | 'Reminder';
  status: 'Unread' | 'Read';
  link?: string;
  createdAt: string;
}

export interface CandidateNote {
  id: string;
  text: string;
  author: string;
  createdAt: string;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  experience: number;
  skills: string[];
  location: string;
  currentCompany: string;
  currentRole: string;
  resumeUrl?: string;
  parsedData?: ResumeParsedPreview;
  stage: PipelineStage;
  requirementId?: string;
  createdAt: string;
  matchScore?: number; // percentage
  aiEvaluation?: AIEvaluation;
  isDuplicate?: boolean;
  duplicateOf?: string;
  interviews?: Interview[];
  communications?: Communication[];
  notes?: CandidateNote[];
}

export type PipelineStage = 
  | 'New' 
  | 'Screening' 
  | 'Internal Review' 
  | 'Shortlisted for Submission'
  | 'Submitted to Client'
  | 'Awaiting Feedback'
  | 'Client Rejected'
  | 'Shortlisted for Interview'
  | 'Interview Scheduled'
  | 'L1' 
  | 'Client L1' 
  | 'Client L2' 
  | 'Offer' 
  | 'Offered'
  | 'Selected' 
  | 'Hired'
  | 'Joined' 
  | 'Rejected' 
  | 'Hold';

export interface MatchResult {
  id: string;
  candidateId: string;
  requirementId: string;
  score: number;
  summary: string;
  strengths: string[];
  gaps: string[];
  redFlags: string[];
  createdAt: string;
}

export interface PipelineHistory {
  id: string;
  candidateId: string;
  stage: PipelineStage;
  updatedBy: string;
  timestamp: string;
  notes: string;
}
