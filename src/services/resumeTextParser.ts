import { ResumeParsedPreview } from "../types";

// ═══════════════════════════════════════════════════════════════════════════════
// RAW TEXT → ResumeParsedPreview FALLBACK PARSER
//
// When Gemini resume parsing fails, this extracts structured data from
// the raw resume text using pattern matching and keyword detection.
// Each resume gets DIFFERENT output based on its actual text content.
// ═══════════════════════════════════════════════════════════════════════════════

const KNOWN_SKILLS = [
  // Languages
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust', 'Ruby', 'PHP', 'Swift', 'Kotlin', 'Scala', 'R', 'MATLAB', 'Perl', 'Dart',
  // Frontend
  'React', 'Angular', 'Vue', 'Vue.js', 'Next.js', 'Nuxt', 'Svelte', 'HTML', 'HTML5', 'CSS', 'CSS3', 'SASS', 'SCSS', 'LESS', 'Tailwind', 'Bootstrap', 'Material UI', 'Chakra UI', 'jQuery', 'Redux', 'MobX', 'GraphQL',
  // Backend
  'Node.js', 'Express', 'Express.js', 'Django', 'Flask', 'FastAPI', 'Spring', 'Spring Boot', 'Laravel', 'Ruby on Rails', '.NET', 'ASP.NET', 'NestJS', 'Fastify',
  // Databases
  'SQL', 'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Cassandra', 'DynamoDB', 'Elasticsearch', 'Oracle', 'MariaDB', 'Firebase', 'Supabase', 'Neo4j',
  // Cloud & DevOps
  'AWS', 'Azure', 'GCP', 'Google Cloud', 'Docker', 'Kubernetes', 'K8s', 'Terraform', 'Ansible', 'Jenkins', 'CI/CD', 'GitHub Actions', 'GitLab CI', 'CircleCI', 'Prometheus', 'Grafana', 'Datadog',
  // Data & AI
  'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'Pandas', 'NumPy', 'Scikit-learn', 'NLP', 'Computer Vision', 'Data Science', 'Data Engineering', 'ETL', 'Apache Spark', 'Kafka', 'Airflow',
  // Testing
  'Jest', 'Mocha', 'Cypress', 'Selenium', 'Playwright', 'JUnit', 'Pytest', 'TestNG', 'Postman',
  // Tools
  'Git', 'GitHub', 'GitLab', 'Bitbucket', 'JIRA', 'Confluence', 'Figma', 'Agile', 'Scrum',
  // Mobile
  'React Native', 'Flutter', 'iOS', 'Android', 'Xcode', 'Android Studio',
  // Architecture
  'Microservices', 'REST', 'REST API', 'RESTful', 'API', 'gRPC', 'WebSocket', 'OAuth', 'JWT', 'SAML',
  'System Design', 'Design Patterns', 'SOLID', 'MVC', 'MVVM',
];

const ROLE_TITLES = [
  'Software Engineer', 'Software Developer', 'Full Stack Developer', 'Full-Stack Developer',
  'Frontend Developer', 'Front-End Developer', 'Backend Developer', 'Back-End Developer',
  'React Developer', 'Angular Developer', 'Node.js Developer', 'Python Developer',
  'Java Developer', 'DevOps Engineer', 'SRE', 'Site Reliability Engineer',
  'Data Engineer', 'Data Scientist', 'Data Analyst', 'ML Engineer', 'Machine Learning Engineer',
  'Cloud Engineer', 'Cloud Architect', 'Solutions Architect', 'System Architect',
  'QA Engineer', 'SDET', 'Test Engineer', 'Automation Engineer',
  'Product Manager', 'Project Manager', 'Scrum Master', 'Tech Lead', 'Engineering Manager',
  'CTO', 'VP Engineering', 'Staff Engineer', 'Principal Engineer',
  'UI Developer', 'UX Developer', 'UI/UX Designer',
  'Database Administrator', 'DBA', 'Security Engineer', 'Network Engineer',
  'Technical Writer', 'Support Engineer', 'Consultant',
];

function normalize(s: string): string {
  return (s || '').toLowerCase().trim();
}

function findInText(text: string, keyword: string): boolean {
  if (!text || !keyword) return false;
  const t = text.toLowerCase();
  const k = keyword.toLowerCase().trim();
  if (!k) return false;
  // word boundary match
  try {
    return new RegExp(`\\b${k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(t);
  } catch {
    return t.includes(k);
  }
}

function extractEmail(text: string): string {
  const m = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  return m ? m[0] : 'N/A';
}

function extractPhone(text: string): string {
  const m = text.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/);
  return m ? m[0].trim() : 'N/A';
}

function extractLocation(text: string): string {
  const cityPatterns = [
    /(?:location|based in|located in|city)[:\s]*([A-Za-z\s,]+?)(?:\n|\.|,|$)/i,
    /(?:address)[:\s]*([A-Za-z\s,]+?)(?:\n|\.|,|$)/i,
  ];
  for (const p of cityPatterns) {
    const m = text.match(p);
    if (m && m[1] && m[1].trim().length > 2 && m[1].trim().length < 50) {
      return m[1].trim();
    }
  }
  // Look for common city names
  const cities = [
    'Bangalore', 'Bengaluru', 'Mumbai', 'Delhi', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata',
    'New York', 'San Francisco', 'Seattle', 'Austin', 'Boston', 'Chicago', 'London', 'Berlin',
    'Singapore', 'Tokyo', 'Sydney', 'Toronto', 'Dublin', 'Remote',
  ];
  for (const city of cities) {
    if (findInText(text, city)) return city;
  }
  return 'N/A';
}

function extractExperience(text: string): string {
  // Look for patterns like "5 years", "3+ years", "10+ yrs"
  const patterns = [
    /(\d+)\+?\s*(?:years?|yrs?)\s*(?:of\s+)?(?:experience|exp)/i,
    /(?:experience|exp)[:\s]*(\d+)\+?\s*(?:years?|yrs?)/i,
    /(\d+)\+?\s*(?:years?|yrs?)\s*(?:of\s+)?(?:professional|total|overall)/i,
    /total\s*(?:of\s+)?(\d+)\+?\s*(?:years?|yrs?)/i,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m && m[1]) return m[1];
  }
  // Infer from date ranges
  const yearMatches = text.match(/\b(19|20)\d{2}\b/g);
  if (yearMatches && yearMatches.length >= 2) {
    const years = yearMatches.map(Number).filter(y => y >= 2000 && y <= 2026);
    if (years.length >= 2) {
      const min = Math.min(...years);
      const max = Math.max(...years);
      const diff = max - min;
      if (diff > 0 && diff <= 40) return String(diff);
    }
  }
  return '0';
}

function extractNoticePeriod(text: string): string {
  const patterns = [
    /notice\s*(?:period)?[:\s]*(\d+)\s*(?:days?|months?|weeks?)/i,
    /(?:available|join)\s*(?:in|from)?[:\s]*(\d+)\s*(?:days?|months?|weeks?)/i,
    /(\d+)\s*(?:days?|months?)\s*notice/i,
    /immediate\s*(?:joiner|join|availability)/i,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) {
      if (m[0].toLowerCase().includes('immediate')) return 'Immediate';
      if (m[1]) return `${m[1]} Days`;
    }
  }
  return 'N/A';
}

function extractSkills(text: string): string[] {
  const found: string[] = [];
  for (const skill of KNOWN_SKILLS) {
    if (findInText(text, skill)) {
      found.push(skill);
    }
  }
  // Deduplicate (e.g., "React" and "React.js" → keep both but avoid exact dupes)
  return [...new Set(found)];
}

function extractCertifications(text: string): string[] {
  const certKeywords = [
    'AWS Certified', 'Azure Certified', 'GCP Certified', 'Google Cloud Certified',
    'PMP', 'Scrum Master', 'CSM', 'CSPO', 'PSM',
    'OCI', 'Oracle Certified', 'Cisco Certified', 'CCNA', 'CCNP',
    'CompTIA', 'ITIL', 'CEH', 'CISSP', 'Security+',
    'Kubernetes Certified', 'CKA', 'CKAD',
    'TensorFlow Certified', 'Snowflake Certified',
    'Salesforce Certified', 'SAP Certified',
  ];
  const found: string[] = [];
  for (const cert of certKeywords) {
    if (findInText(text, cert)) found.push(cert);
  }
  return found;
}

function extractCurrentRole(text: string): string {
  // Look for role title near experience section or header
  const lines = text.split('\n');
  for (const line of lines.slice(0, 15)) { // check first 15 lines (header area)
    for (const role of ROLE_TITLES) {
      if (findInText(line, role)) return role;
    }
  }
  // Check in "experience" sections
  const expSection = text.match(/(?:experience|work history|employment)[\s\S]{0,500}/i);
  if (expSection) {
    for (const role of ROLE_TITLES) {
      if (findInText(expSection[0], role)) return role;
    }
  }
  return 'N/A';
}

function extractProjects(text: string): string[] {
  const projects: string[] = [];
  // Look for project-like patterns
  const projectPatterns = [
    /(?:project|built|developed|created|designed|implemented)[:\s]*([\w\s\-,.()]+?)(?:\n|\.)/gi,
    /(?:^|\n)\s*[-•*]\s*([A-Z][\w\s\-,.()]{10,80})(?:\n|$)/gm,
  ];
  for (const p of projectPatterns) {
    let m;
    while ((m = p.exec(text)) !== null) {
      const proj = m[1].trim();
      if (proj.length > 10 && proj.length < 120 && !projects.includes(proj)) {
        projects.push(proj);
      }
      if (projects.length >= 5) break;
    }
  }
  // If no projects found, extract from sentences mentioning "developed", "built", etc.
  if (projects.length === 0) {
    const sentences = text.split(/[.!?\n]+/);
    for (const s of sentences) {
      const trimmed = s.trim();
      if (trimmed.length > 20 && trimmed.length < 150) {
        const lower = trimmed.toLowerCase();
        if (lower.includes('develop') || lower.includes('built') || lower.includes('implement') ||
            lower.includes('design') || lower.includes('architect') || lower.includes('deploy') ||
            lower.includes('lead') || lower.includes('manage')) {
          projects.push(trimmed);
          if (projects.length >= 3) break;
        }
      }
    }
  }
  return projects;
}

function extractDomainExposure(text: string): string[] {
  const domains = [
    'E-commerce', 'Fintech', 'Healthcare', 'Banking', 'Insurance', 'Retail',
    'Education', 'EdTech', 'Logistics', 'Supply Chain', 'Manufacturing',
    'Telecom', 'Media', 'Entertainment', 'Gaming', 'Travel', 'Hospitality',
    'Automotive', 'Real Estate', 'PropTech', 'Legal', 'GovTech', 'SaaS',
    'B2B', 'B2C', 'Marketplace', 'Social Media', 'AdTech', 'MarTech',
    'IoT', 'Blockchain', 'Cybersecurity', 'Energy', 'Agriculture',
  ];
  const found: string[] = [];
  for (const d of domains) {
    if (findInText(text, d)) found.push(d);
  }
  return found;
}

function extractCandidateName(text: string, fileName: string): string {
  // Try to find a name from the first few lines
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  for (const line of lines.slice(0, 5)) {
    // A name is typically 2-4 words, all capitalized or title case, no special chars
    if (/^[A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3}$/.test(line) && line.length < 40) {
      return line;
    }
    // Also check for "Name: xxx" pattern
    const nameMatch = line.match(/name[:\s]+([A-Za-z\s]+)/i);
    if (nameMatch && nameMatch[1].trim().length > 3) {
      return nameMatch[1].trim();
    }
  }
  // Fall back to filename without extension
  return fileName.replace(/\.[^.]+$/, '').replace(/[_-]/g, ' ');
}

function extractResponsibilityEvidence(text: string): string {
  // Extract sentences that sound like responsibilities
  const sentences = text.split(/[.!?\n]+/);
  const responsibilityWords = ['responsible', 'managed', 'led', 'owned', 'coordinated', 'oversaw', 'supervised', 'delivered'];
  const evidence: string[] = [];
  for (const s of sentences) {
    const lower = s.toLowerCase();
    if (responsibilityWords.some(w => lower.includes(w)) && s.trim().length > 20) {
      evidence.push(s.trim());
      if (evidence.length >= 3) break;
    }
  }
  return evidence.length > 0 ? evidence.join('. ') : 'N/A';
}

function extractProjectEvidence(text: string): string {
  const sentences = text.split(/[.!?\n]+/);
  const projectWords = ['developed', 'built', 'created', 'implemented', 'designed', 'architected', 'deployed'];
  const evidence: string[] = [];
  for (const s of sentences) {
    const lower = s.toLowerCase();
    if (projectWords.some(w => lower.includes(w)) && s.trim().length > 20) {
      evidence.push(s.trim());
      if (evidence.length >= 3) break;
    }
  }
  return evidence.length > 0 ? evidence.join('. ') : 'N/A';
}

function extractEducation(text: string): string[] {
  const education: string[] = [];
  const degreePatterns = [
    /(?:B\.?Tech|B\.?E\.?|Bachelor|B\.?S\.?|B\.?Sc|M\.?Tech|M\.?E\.?|Master|M\.?S\.?|M\.?Sc|MBA|PhD|Doctorate|Diploma)[^\n]{0,80}/gi,
    /(?:degree|graduated|university|college|institute)[^\n]{0,80}/gi,
  ];
  for (const p of degreePatterns) {
    let m;
    while ((m = p.exec(text)) !== null) {
      const entry = m[0].trim();
      if (entry.length > 5 && entry.length < 100 && !education.includes(entry)) {
        education.push(entry);
      }
      if (education.length >= 3) break;
    }
  }
  // Also look for education section
  const eduSection = text.match(/(?:education|academic|qualification)[\s\S]{0,500}/i);
  if (eduSection && education.length === 0) {
    const lines = eduSection[0].split('\n').map(l => l.trim()).filter(l => l.length > 5);
    for (const line of lines.slice(1, 5)) {
      if (line.length > 5 && line.length < 100 && !line.match(/^(education|academic|qualification)/i)) {
        education.push(line);
      }
      if (education.length >= 3) break;
    }
  }
  return education;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN EXPORT
// ═══════════════════════════════════════════════════════════════════════════════

export function parseResumeFromText(rawText: string, fileName: string): ResumeParsedPreview {
  console.log(`[TextParser] Extracting data from resume text (${rawText.length} chars) for: ${fileName}`);

  const skills = extractSkills(rawText);
  const projects = extractProjects(rawText);
  const experience = extractExperience(rawText);
  const currentRole = extractCurrentRole(rawText);
  const location = extractLocation(rawText);
  const noticePeriod = extractNoticePeriod(rawText);
  const certifications = extractCertifications(rawText);
  const domainExposure = extractDomainExposure(rawText);
  const responsibilityEvidence = extractResponsibilityEvidence(rawText);
  const projectEvidence = extractProjectEvidence(rawText);
  const education = extractEducation(rawText);

  console.log(`[TextParser] Extracted: ${skills.length} skills, ${projects.length} projects, ${experience}y exp, role=${currentRole}, loc=${location}, education=${education.length}`);

  return {
    candidate_name: extractCandidateName(rawText, fileName),
    email: extractEmail(rawText),
    phone: extractPhone(rawText),
    total_experience: experience,
    relevant_experience: experience,
    current_role: currentRole,
    current_company: 'N/A',
    location,
    notice_period: noticePeriod,
    skills,
    certifications,
    projects,
    domain_exposure: domainExposure,
    real_skill_depth: skills.length >= 5 ? 'Multiple skills listed' : skills.length > 0 ? 'Limited skills listed' : 'N/A',
    years_per_skill: 'N/A',
    project_evidence: projectEvidence,
    responsibility_evidence: responsibilityEvidence,
    role_consistency: currentRole !== 'N/A' ? 'Role identified from resume' : 'N/A',
    leadership_exposure: 'N/A',
    education,
  };
}
