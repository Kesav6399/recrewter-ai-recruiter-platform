import { Requirement, Candidate, MatchResult, PipelineStage, Interview, Communication, Notification, EmailTemplate } from './types';

export const mockEmailTemplates: EmailTemplate[] = [
  {
    id: 'temp-1',
    name: 'Interview Invite',
    subject: 'Interview Invitation: [Role] at [Client]',
    body: 'Hi [Candidate Name],\n\nWe are pleased to invite you for an interview for the [Role] position at [Client].\n\nDetails:\nDate: [Date]\nTime: [Time]\nMode: [Mode]\nLink/Location: [Link]\n\nPlease confirm your availability.',
    purpose: 'Interview Scheduling'
  },
  {
    id: 'temp-2',
    name: 'Interview Reminder',
    subject: 'Reminder: Interview for [Role] at [Client]',
    body: 'Hi [Candidate Name],\n\nThis is a friendly reminder for your interview today at [Time].\n\nLink: [Link]\n\nGood luck!',
    purpose: 'Reminder'
  },
  {
    id: 'temp-3',
    name: 'Rejection Mail',
    subject: 'Update regarding your application for [Role]',
    body: 'Hi [Candidate Name],\n\nThank you for your interest in the [Role] position at [Client]. After careful consideration, we have decided to move forward with other candidates at this time.\n\nWe wish you the best in your job search.',
    purpose: 'Rejection'
  }
];

export const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    userId: 'user-1',
    title: 'Upcoming Interview',
    message: 'Interview with Arjun Mehta starts in 1 hour.',
    type: 'Interview',
    status: 'Unread',
    link: '/candidate-details',
    createdAt: new Date().toISOString()
  },
  {
    id: 'notif-2',
    userId: 'user-1',
    title: 'Feedback Pending',
    message: 'Client feedback is pending for Priya Sharma.',
    type: 'Feedback',
    status: 'Unread',
    link: '/pipeline',
    createdAt: new Date().toISOString()
  }
];

export const mockInterviews: Interview[] = [
  {
    id: 'int-1',
    candidateId: 'cand-1',
    requirementId: 'req-1',
    round: 'Technical Round 1',
    interviewerName: 'Suresh Kumar',
    date: '2026-03-27',
    time: '14:00',
    timeZone: 'IST',
    mode: 'Video',
    locationOrLink: 'https://meet.google.com/abc-defg-hij',
    status: 'Scheduled',
    createdAt: new Date().toISOString()
  }
];

export const mockCommunications: Communication[] = [
  {
    id: 'comm-1',
    candidateId: 'cand-1',
    type: 'Email',
    subject: 'Interview Invitation: Senior Full Stack Developer',
    body: 'Hi Arjun, we are pleased to invite you...',
    status: 'Sent',
    sentAt: new Date().toISOString(),
    createdBy: 'user-1'
  }
];

export const mockRequirements: Requirement[] = [
  {
    id: 'req-1',
    clientName: 'TechCorp Solutions',
    roleTitle: 'Senior Full Stack Developer',
    jdText: 'We are looking for a Senior Full Stack Developer with 5+ years of experience in React and Node.js...',
    mandatorySkills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL'],
    goodToHaveSkills: ['AWS', 'Docker', 'GraphQL'],
    minExperience: 5,
    maxExperience: 10,
    location: 'Remote / Bangalore',
    noticePeriod: 'Immediate to 30 days',
    employmentType: 'Full-time',
    budget: '25 - 35 LPA',
    priority: 'High',
    status: 'Active',
    remarks: 'Urgent requirement for the core product team.',
    createdBy: 'user-1',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'req-2',
    clientName: 'FinLeap Systems',
    roleTitle: 'Backend Engineer (Java)',
    jdText: 'Looking for strong Java developers with Spring Boot experience...',
    mandatorySkills: ['Java', 'Spring Boot', 'Microservices'],
    goodToHaveSkills: ['Kafka', 'Redis'],
    minExperience: 3,
    maxExperience: 7,
    location: 'Hyderabad',
    noticePeriod: '60 days',
    employmentType: 'Full-time',
    budget: '18 - 25 LPA',
    priority: 'Medium',
    status: 'Active',
    remarks: 'Replacement hire.',
    createdBy: 'user-1',
    createdAt: new Date().toISOString(),
  }
];

export const mockCandidates: Candidate[] = [
  {
    id: 'cand-1',
    name: 'Arjun Mehta',
    email: 'arjun.mehta@example.com',
    phone: '+91 98765 43210',
    experience: 6,
    skills: ['React', 'Node.js', 'TypeScript', 'AWS'],
    location: 'Mumbai',
    currentCompany: 'InnovateSoft',
    currentRole: 'Software Engineer II',
    stage: 'Interview Scheduled',
    requirementId: 'req-1',
    createdAt: new Date().toISOString(),
    matchScore: 92,
    interviews: [mockInterviews[0]],
    communications: [mockCommunications[0]],
    aiEvaluation: {
      candidate_name: 'Arjun Mehta',
      current_role: 'Software Engineer II',
      total_experience: '6 Years',
      location: 'Mumbai',
      notice_period: '60 Days',
      overall_rating_out_of_5: 4.6,
      recommendation: 'Strong Shortlist',
      short_summary: 'Arjun is a high-confidence match for the Senior Full Stack role. His Java and React experience is supported by 3 major project descriptions and a recent lead role at InnovateSoft. He has hands-on evidence of scaling microservices and leading a team of 4.',
      comparison_table: [
        { requirement: 'AWS Solution Architecture', client_need: 'Mandatory', candidate_evidence: 'Strong AWS architect experience in 2 projects', match_level: 'Strong' },
        { requirement: 'React/TypeScript', client_need: 'Mandatory', candidate_evidence: '6 years hands-on with complex state management', match_level: 'Strong' },
        { requirement: 'Node.js Microservices', client_need: 'Mandatory', candidate_evidence: 'Built 12+ services from scratch', match_level: 'Strong' },
        { requirement: 'GraphQL', client_need: 'Preferred', candidate_evidence: 'Limited evidence, mentioned in 1 project', match_level: 'Partial' },
        { requirement: 'Stakeholder Handling', client_need: 'Mandatory', candidate_evidence: 'Lead / client-facing work for 2 years', match_level: 'Strong' }
      ],
      strengths: [
        'Strong cloud architecture exposure',
        'Relevant project experience with high-scale apps',
        'Hands-on evidence of leading technical teams',
        'Excellent TypeScript/React proficiency'
      ],
      gaps: [
        'Limited GraphQL production experience',
        'Notice period is 60 days (Client prefers 30)'
      ],
      optional_red_flags: [
        'Role title is "SE II" but responsibilities suggest Senior level - needs validation'
      ],
      suggested_screening_questions: [
        'Can you explain your approach to microservices orchestration on AWS?',
        'How do you handle state management in large-scale React applications?'
      ]
    }
  },
  {
    id: 'cand-2',
    name: 'Priya Sharma',
    email: 'priya.s@example.com',
    phone: '+91 91234 56789',
    experience: 4,
    skills: ['Java', 'Spring Boot', 'MySQL'],
    location: 'Bangalore',
    currentCompany: 'GlobalTech',
    currentRole: 'Backend Developer',
    stage: 'Screening',
    requirementId: 'req-2',
    createdAt: new Date().toISOString(),
    matchScore: 85,
    interviews: [],
    communications: [],
    aiEvaluation: {
      candidate_name: 'Priya Sharma',
      current_role: 'Backend Developer',
      total_experience: '4 Years',
      location: 'Bangalore',
      notice_period: '30 Days',
      overall_rating_out_of_5: 4.2,
      recommendation: 'Shortlist',
      short_summary: 'Priya shows strong Java/Spring Boot fundamentals. Her experience at GlobalTech involves high-volume transaction processing, which fits the FinLeap requirement well.',
      comparison_table: [
        { requirement: 'Java/Spring Boot', client_need: 'Mandatory', candidate_evidence: '4 years of core backend development', match_level: 'Strong' },
        { requirement: 'Microservices', client_need: 'Mandatory', candidate_evidence: 'Worked on 5+ microservices', match_level: 'Strong' },
        { requirement: 'Kafka', client_need: 'Preferred', candidate_evidence: 'Used for basic messaging', match_level: 'Partial' }
      ],
      strengths: [
        'Solid Java fundamentals',
        'Experience with high-volume systems',
        'Good problem-solving evidence'
      ],
      gaps: [
        'Limited Kafka/Redis depth',
        'No cloud deployment experience'
      ],
      optional_red_flags: [],
      suggested_screening_questions: [
        'Explain a complex transaction handling scenario you solved.',
        'How do you ensure microservices consistency?'
      ]
    }
  },
  {
    id: 'cand-3',
    name: 'Rahul Verma',
    email: 'rahul.v@example.com',
    phone: '+91 88888 77777',
    experience: 8,
    skills: ['React', 'Node.js', 'Docker', 'Kubernetes'],
    location: 'Pune',
    currentCompany: 'CloudNative Inc',
    currentRole: 'Senior Developer',
    stage: 'Client L1',
    requirementId: 'req-1',
    createdAt: new Date().toISOString(),
    matchScore: 88,
    isDuplicate: true,
    duplicateOf: 'cand-1',
    interviews: [],
    communications: [],
    aiEvaluation: {
      candidate_name: 'Rahul Verma',
      current_role: 'Senior Developer',
      total_experience: '8 Years',
      location: 'Pune',
      notice_period: '60 Days',
      overall_rating_out_of_5: 4.4,
      recommendation: 'Shortlist',
      short_summary: 'Rahul is a seasoned developer with strong infra/devops knowledge alongside full-stack skills. His 8 years of experience align well with the seniority needed.',
      comparison_table: [
        { requirement: 'React/Node.js', client_need: 'Mandatory', candidate_evidence: '8 years experience, lead developer', match_level: 'Strong' },
        { requirement: 'Docker/K8s', client_need: 'Preferred', candidate_evidence: 'Strong hands-on evidence in 3 projects', match_level: 'Strong' }
      ],
      strengths: [
        'Seniority and leadership',
        'Infrastructure knowledge',
        'Broad tech stack'
      ],
      gaps: [
        'Recent experience is more infra-focused than coding',
        'Higher budget expectations'
      ],
      optional_red_flags: [
        'Job hopping: 3 companies in 4 years'
      ],
      suggested_screening_questions: [
        'Why the frequent job changes?',
        'How do you balance infra vs coding in your current role?'
      ]
    }
  }
];

export const mockStats = {
  activeRequirements: 12,
  newCandidates: 45,
  shortlisted: 28,
  submitted: 15,
  interviews: 8,
  selected: 4,
  rejected: 12,
};

export const dashboardStats = {
  activeRequirements: 12,
  totalCandidates: 154,
  aiMatchRate: 82,
  avgTimeToHire: 18,
};

export const recentMatches = [
  { candidateName: 'Arjun Mehta', requirementTitle: 'Senior Full Stack Developer', score: 92, status: 'Shortlisted' },
  { candidateName: 'Priya Sharma', requirementTitle: 'Backend Engineer (Java)', score: 85, status: 'Screening' },
  { candidateName: 'Rahul Verma', requirementTitle: 'Senior Full Stack Developer', score: 88, status: 'Client L1' },
  { candidateName: 'Siddharth Rao', requirementTitle: 'UI/UX Designer', score: 78, status: 'New' },
];
