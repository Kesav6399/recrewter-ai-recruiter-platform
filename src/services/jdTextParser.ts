import { JDParsedPreview } from "../types";

// ═══════════════════════════════════════════════════════════════════════════════
// RAW JD TEXT → JDParsedPreview FALLBACK PARSER
//
// When Gemini JD parsing fails, this extracts structured data from
// the raw JD text so the evaluation engine has real skills/requirements to compare.
// ═══════════════════════════════════════════════════════════════════════════════

const SKILL_DICT = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust', 'Ruby', 'PHP', 'Swift', 'Kotlin', 'Scala',
  'React', 'Angular', 'Vue', 'Vue.js', 'Next.js', 'Nuxt', 'Svelte', 'HTML', 'CSS', 'SASS', 'Tailwind', 'Bootstrap', 'Redux',
  'Node.js', 'Express', 'Django', 'Flask', 'FastAPI', 'Spring', 'Spring Boot', 'Laravel', '.NET', 'ASP.NET', 'NestJS',
  'SQL', 'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Cassandra', 'DynamoDB', 'Elasticsearch', 'Firebase', 'Supabase',
  'AWS', 'Azure', 'GCP', 'Google Cloud', 'Docker', 'Kubernetes', 'Terraform', 'Ansible', 'Jenkins', 'CI/CD',
  'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'Pandas', 'NumPy', 'NLP', 'Computer Vision', 'Data Science',
  'Jest', 'Cypress', 'Selenium', 'Playwright', 'Git', 'JIRA', 'Agile', 'Scrum',
  'React Native', 'Flutter', 'Microservices', 'REST', 'REST API', 'GraphQL', 'gRPC', 'OAuth', 'JWT',
  'System Design', 'Design Patterns', 'SOLID', 'Kafka', 'RabbitMQ', 'Airflow', 'Spark',
];

const ROLE_KEYWORDS = [
  'Software Engineer', 'Software Developer', 'Full Stack', 'Frontend', 'Front-End', 'Backend', 'Back-End',
  'React Developer', 'Angular Developer', 'Node.js Developer', 'Python Developer', 'Java Developer',
  'DevOps', 'SRE', 'Data Engineer', 'Data Scientist', 'ML Engineer', 'Cloud Engineer', 'Architect',
  'QA', 'SDET', 'Tech Lead', 'Engineering Manager', 'Staff Engineer', 'Principal Engineer',
];

const DOMAIN_KEYWORDS = [
  'E-commerce', 'Fintech', 'Healthcare', 'Banking', 'Insurance', 'Retail', 'Education', 'EdTech',
  'Logistics', 'Supply Chain', 'Manufacturing', 'Telecom', 'Media', 'Entertainment', 'Gaming',
  'Travel', 'Hospitality', 'Automotive', 'Real Estate', 'Legal', 'SaaS', 'B2B', 'B2C',
];

const CERT_KEYWORDS = [
  'AWS Certified', 'Azure Certified', 'GCP Certified', 'PMP', 'Scrum Master', 'CSM', 'CSPO',
  'Oracle Certified', 'CCNA', 'CCNP', 'CISSP', 'CKA', 'CKAD', 'Security+',
];

const LOCATION_CITIES = [
  'Bangalore', 'Bengaluru', 'Mumbai', 'Delhi', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata',
  'New York', 'San Francisco', 'Seattle', 'Austin', 'Boston', 'London', 'Berlin',
  'Singapore', 'Tokyo', 'Sydney', 'Toronto', 'Dublin', 'Remote',
];

function findInText(text: string, keyword: string): boolean {
  if (!text || !keyword) return false;
  const t = text.toLowerCase();
  const k = keyword.toLowerCase().trim();
  if (!k) return false;
  try {
    return new RegExp(`\\b${k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(t);
  } catch {
    return t.includes(k);
  }
}

function extractRole(rawText: string): string {
  const lines = rawText.split('\n');
  // Check first 10 lines for role title
  for (const line of lines.slice(0, 10)) {
    for (const role of ROLE_KEYWORDS) {
      if (findInText(line, role)) return role;
    }
  }
  // Check for "role:" or "position:" or "title:" patterns
  const roleMatch = rawText.match(/(?:role|position|title|job\s*title)[:\s]*([^\n]{5,60})/i);
  if (roleMatch && roleMatch[1]) {
    return roleMatch[1].trim().replace(/[,.].*$/, '');
  }
  return 'Software Engineer';
}

function classifySkills(rawText: string): { mustHave: string[]; optional: string[]; tools: string[] } {
  const mustHave: string[] = [];
  const optional: string[] = [];
  const tools: string[] = [];
  const textLower = rawText.toLowerCase();

  // Split into sections to identify mandatory vs optional
  const mustHaveSection = rawText.match(/(?:required|must[\s-]?have|mandatory|qualifications|required\s*skills|essential)[:\s]*([\s\S]*?)(?:preferred|nice[\s-]?to[\s-]?have|optional|bonus|good[\s-]?to[\s-]?have|responsibilities|about|company|$)/i);
  const optionalSection = rawText.match(/(?:preferred|nice[\s-]?to[\s-]?have|optional|bonus|good[\s-]?to[\s-]?have|desired|plus)[:\s]*([\s\S]*?)(?:responsibilities|about|company|benefits|$)/i);

  for (const skill of SKILL_DICT) {
    const inMust = mustHaveSection ? findInText(mustHaveSection[1], skill) : false;
    const inOptional = optionalSection ? findInText(optionalSection[1], skill) : false;
    const inFull = findInText(rawText, skill);

    if (inMust) {
      mustHave.push(skill);
    } else if (inOptional) {
      optional.push(skill);
    } else if (inFull) {
      // If there's a "required" section, skills found elsewhere are optional
      if (mustHaveSection) {
        optional.push(skill);
      } else {
        mustHave.push(skill);
      }
    }
  }

  // Classify tools separately
  const toolKeywords = ['JIRA', 'Git', 'GitHub', 'GitLab', 'Docker', 'Kubernetes', 'Jenkins', 'Terraform', 'Ansible', 'Figma', 'Postman'];
  for (const tool of toolKeywords) {
    const idx = mustHave.indexOf(tool);
    if (idx >= 0) { mustHave.splice(idx, 1); tools.push(tool); }
    const idx2 = optional.indexOf(tool);
    if (idx2 >= 0) { optional.splice(idx2, 1); tools.push(tool); }
  }

  return { mustHave, optional, tools };
}

function extractExperience(rawText: string): { seniority: string; minYears: number; maxYears: number } {
  // Look for experience patterns
  const patterns = [
    /(\d+)\s*(?:to|-)\s*(\d+)\s*(?:years?|yrs?)/i,
    /(\d+)\+?\s*(?:years?|yrs?)\s*(?:of\s+)?(?:experience|exp)/i,
    /(?:minimum|at\s*least|min)\s*(\d+)\s*(?:years?|yrs?)/i,
    /(?:experience|exp)[:\s]*(\d+)\s*(?:to|-)\s*(\d+)\s*(?:years?|yrs?)/i,
    /(\d+)\+?\s*(?:years?|yrs?)/i,
  ];

  for (const p of patterns) {
    const m = rawText.match(p);
    if (m) {
      if (m[2]) return { seniority: `${m[1]}-${m[2]} Years`, minYears: parseInt(m[1]), maxYears: parseInt(m[2]) };
      if (m[1]) return { seniority: `${m[1]}+ Years`, minYears: parseInt(m[1]), maxYears: parseInt(m[1]) + 3 };
    }
  }

  // Infer from seniority keywords
  if (findInText(rawText, 'senior') || findInText(rawText, 'sr.')) return { seniority: '5-8 Years', minYears: 5, maxYears: 8 };
  if (findInText(rawText, 'lead') || findInText(rawText, 'staff') || findInText(rawText, 'principal')) return { seniority: '7-12 Years', minYears: 7, maxYears: 12 };
  if (findInText(rawText, 'junior') || findInText(rawText, 'jr.') || findInText(rawText, 'entry')) return { seniority: '0-2 Years', minYears: 0, maxYears: 2 };
  if (findInText(rawText, 'mid') || findInText(rawText, 'intermediate')) return { seniority: '3-5 Years', minYears: 3, maxYears: 5 };

  return { seniority: '3-5 Years', minYears: 3, maxYears: 5 };
}

function extractLocation(rawText: string): string {
  for (const city of LOCATION_CITIES) {
    if (findInText(rawText, city)) return city;
  }
  const locMatch = rawText.match(/(?:location|based\s*in|office)[:\s]*([^\n]{3,40})/i);
  if (locMatch && locMatch[1]) return locMatch[1].trim().replace(/[,.].*$/, '');
  return 'Remote';
}

function extractNoticePeriod(rawText: string): string {
  const m = rawText.match(/notice\s*(?:period)?[:\s]*(\d+)\s*(?:days?|months?)/i);
  if (m) return `${m[1]} Days`;
  if (findInText(rawText, 'immediate')) return 'Immediate';
  return '30 Days';
}

function extractDomain(rawText: string): string {
  for (const d of DOMAIN_KEYWORDS) {
    if (findInText(rawText, d)) return d;
  }
  return 'General';
}

function extractCertifications(rawText: string): string[] {
  const found: string[] = [];
  for (const c of CERT_KEYWORDS) {
    if (findInText(rawText, c)) found.push(c);
  }
  return found;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN EXPORT
// ═══════════════════════════════════════════════════════════════════════════════

export function parseJDFromText(rawText: string, fileName: string): JDParsedPreview {
  console.log(`[JDParser] Extracting data from JD text (${rawText.length} chars)`);

  const role = extractRole(rawText);
  const { mustHave, optional, tools } = classifySkills(rawText);
  const { seniority, minYears } = extractExperience(rawText);
  const location = extractLocation(rawText);
  const noticePeriod = extractNoticePeriod(rawText);
  const domain = extractDomain(rawText);
  const certs = extractCertifications(rawText);

  console.log(`[JDParser] Extracted: role=${role}, ${mustHave.length} must-have, ${optional.length} optional, ${tools.length} tools, seniority=${seniority}, location=${location}`);

  const hasStakeholder = findInText(rawText, 'stakeholder') || findInText(rawText, 'client-facing') || findInText(rawText, 'business interaction');
  const hasLeadership = findInText(rawText, 'lead') || findInText(rawText, 'ownership') || findInText(rawText, 'cross-team');

  return {
    role,
    must_have_skills: mustHave,
    optional_skills: optional,
    tools,
    seniority,
    domain,
    certifications: certs,
    communication_expectations: findInText(rawText, 'collaborate') || findInText(rawText, 'cross-functional')
      ? 'Cross-functional collaboration and communication expected'
      : findInText(rawText, 'client') || findInText(rawText, 'customer')
        ? 'Client-facing communication expected'
        : 'Standard professional communication',
    stakeholder_expectations: hasStakeholder
      ? 'Stakeholder management and client interaction expected'
      : hasLeadership
        ? 'Technical ownership and cross-team coordination expected'
        : 'Not specified',
    location,
    notice_period: noticePeriod,
    shift: findInText(rawText, 'shift') ? 'Shift-based' : 'General',
    client_specific_filters: [],
  };
}
