import { GoogleGenAI, Type } from "@google/genai";
import { JDParsedPreview, ResumeParsedPreview, AIEvaluation } from "../types";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';

if (!apiKey) {
  console.warn('[Gemini] VITE_GEMINI_API_KEY is missing. Gemini calls will fail; fallback evaluation will be used.');
} else {
  console.log('[Gemini] API key loaded (length:', apiKey.length, ')');
}

const ai = new GoogleGenAI({ apiKey });

const GEMINI_CONFIG = { responseMimeType: "application/json" } as const;

// ─── Retry wrapper ───────────────────────────────────────────────────────────

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1500;

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function isRetryableError(err: any): boolean {
  const msg = (err?.message || err?.toString || '').toString().toLowerCase();
  return (
    msg.includes('429') ||
    msg.includes('resource_exhausted') ||
    msg.includes('quota') ||
    msg.includes('rate limit') ||
    msg.includes('overloaded') ||
    msg.includes('503') ||
    msg.includes('500') ||
    msg.includes('timeout') ||
    msg.includes('network') ||
    msg.includes('fetch failed')
  );
}

async function withRetry<T>(fn: () => Promise<T>, label: string): Promise<T> {
  let lastErr: any;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      if (attempt > 0) {
        console.log(`[Gemini] ${label} - Retry attempt ${attempt}/${MAX_RETRIES} after ${RETRY_DELAY_MS}ms delay`);
        await sleep(RETRY_DELAY_MS * attempt);
      }
      return await fn();
    } catch (err: any) {
      lastErr = err;
      console.warn(`[Gemini] ${label} - Attempt ${attempt + 1} failed:`, err.message || err);
      if (!isRetryableError(err)) {
        throw err;
      }
    }
  }
  throw lastErr;
}

// ─── Schemas ─────────────────────────────────────────────────────────────────

const JD_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    role: { type: Type.STRING },
    must_have_skills: { type: Type.ARRAY, items: { type: Type.STRING } },
    optional_skills: { type: Type.ARRAY, items: { type: Type.STRING } },
    tools: { type: Type.ARRAY, items: { type: Type.STRING } },
    seniority: { type: Type.STRING },
    domain: { type: Type.STRING },
    certifications: { type: Type.ARRAY, items: { type: Type.STRING } },
    communication_expectations: { type: Type.STRING },
    stakeholder_expectations: { type: Type.STRING },
    location: { type: Type.STRING },
    notice_period: { type: Type.STRING },
    shift: { type: Type.STRING },
    client_specific_filters: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: [
    "role", "must_have_skills", "optional_skills", "tools", "seniority",
    "domain", "certifications", "communication_expectations", "stakeholder_expectations",
    "location", "notice_period", "shift", "client_specific_filters"
  ],
};

const RESUME_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    candidate_name: { type: Type.STRING },
    email: { type: Type.STRING },
    phone: { type: Type.STRING },
    current_role: { type: Type.STRING },
    current_company: { type: Type.STRING },
    total_experience: { type: Type.STRING },
    relevant_experience: { type: Type.STRING },
    location: { type: Type.STRING },
    notice_period: { type: Type.STRING },
    skills: { type: Type.ARRAY, items: { type: Type.STRING } },
    certifications: { type: Type.ARRAY, items: { type: Type.STRING } },
    projects: { type: Type.ARRAY, items: { type: Type.STRING } },
    domain_exposure: { type: Type.ARRAY, items: { type: Type.STRING } },
    real_skill_depth: { type: Type.STRING },
    years_per_skill: { type: Type.STRING },
    project_evidence: { type: Type.STRING },
    responsibility_evidence: { type: Type.STRING },
    role_consistency: { type: Type.STRING },
    leadership_exposure: { type: Type.STRING },
    education: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: [
    "candidate_name", "email", "phone", "current_role", "current_company",
    "total_experience", "relevant_experience", "location", "notice_period", "skills",
    "certifications", "projects", "domain_exposure", "real_skill_depth",
    "years_per_skill", "project_evidence", "responsibility_evidence",
    "role_consistency", "leadership_exposure", "education"
  ],
};

const EVALUATION_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    candidate_name: { type: Type.STRING },
    current_role: { type: Type.STRING },
    total_experience: { type: Type.STRING },
    location: { type: Type.STRING },
    notice_period: { type: Type.STRING },
    overall_rating_out_of_5: { type: Type.NUMBER },
    recommendation: {
      type: Type.STRING,
      enum: ["Strong Shortlist", "Shortlist", "Consider", "Risky", "Reject"]
    },
    short_summary: { type: Type.STRING },
    comparison_table: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          requirement: { type: Type.STRING },
          client_need: { type: Type.STRING },
          candidate_evidence: { type: Type.STRING },
          match_level: {
            type: Type.STRING,
            enum: ["Strong", "Partial", "Weak", "Missing"]
          },
        },
        required: ["requirement", "client_need", "candidate_evidence", "match_level"],
      },
    },
    strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
    gaps: { type: Type.ARRAY, items: { type: Type.STRING } },
    optional_red_flags: { type: Type.ARRAY, items: { type: Type.STRING } },
    suggested_screening_questions: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: [
    "candidate_name", "current_role", "total_experience", "location",
    "notice_period", "overall_rating_out_of_5", "recommendation",
    "short_summary", "comparison_table", "strengths", "gaps",
    "optional_red_flags", "suggested_screening_questions"
  ],
};

// ─── JSON helper ─────────────────────────────────────────────────────────────

function parseJsonSafely<T>(raw: string, label: string): T {
  try {
    return JSON.parse(raw) as T;
  } catch (parseErr) {
    console.error(`[Gemini] JSON parse failed for ${label}:`, parseErr);
    console.error(`[Gemini] Raw response (${label}):`, raw.substring(0, 500));
    throw new Error(`Failed to parse ${label} response as JSON`);
  }
}

// ─── Gemini functions (with retry) ──────────────────────────────────────────

export const parseJD = async (jdText: string): Promise<JDParsedPreview> => {
  if (!apiKey) throw new Error('Gemini API key not configured');

  console.log('[Gemini] parseJD - Starting, text length:', jdText.length);

  const prompt = `Parse the following Job Description into structured recruiter-ready JSON.

Instructions:
- Read the full JD carefully.
- Extract hiring requirements in a practical recruiter format.
- Separate mandatory requirements from optional/preferred requirements.
- Capture screening/logistics details also.
- Keep the output concise, structured, and frontend-safe.
- Do not return markdown. Return strict JSON only.

Field extraction rules:
- "role": Extract the exact job title/role being hired for.
- "must_have_skills": Include ONLY clearly required/mandatory skills. Do not include tools, frameworks, or platforms here.
- "optional_skills": Include preferred, good-to-have, nice-to-have, or bonus skills.
- "tools": Include platforms, frameworks, cloud services, databases, CI/CD tools, monitoring tools, and software explicitly mentioned.
- "seniority": Use values like "Junior", "Mid-level", "Senior", "Lead", "Principal", or extract experience range like "4-6 Years", "8+ Years". Use "Not specified" if unclear.
- "domain": Infer industry/business domain from the JD context (e.g., "Fintech", "E-commerce", "Healthcare", "SaaS"). Use "General" if not inferable.
- "certifications": Extract any certifications mentioned as required or preferred.
- "communication_expectations": Capture collaboration, communication, client-facing, or cross-team communication expectations mentioned in the JD. Use "Standard professional communication" if not specified.
- "stakeholder_expectations": Capture client handling, business interaction, leadership, ownership, cross-team coordination, or stakeholder management expectations. Use "Not specified" if none mentioned.
- "location": Extract city, state, country, or "Remote" / "Hybrid" as specified.
- "notice_period": Extract if mentioned (e.g., "30 Days", "Immediate", "60 Days"). Use "Not specified" if not mentioned.
- "shift": Extract shift/timing info if mentioned. Use "General" if not specified.
- "client_specific_filters": Include screening filters such as "immediate joiner", "relocation required", "work authorization", specific industry experience, or any other hard filters mentioned.

Job Description:
${jdText}`;

  const response = await withRetry(async () => {
    return ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: { ...GEMINI_CONFIG, responseSchema: JD_SCHEMA },
    });
  }, 'parseJD');

  const text = response.text || '';
  console.log('[Gemini] parseJD - Response received, length:', text.length);
  return parseJsonSafely<JDParsedPreview>(text, 'JD');
};

export const parseResume = async (resumeText: string): Promise<ResumeParsedPreview> => {
  if (!apiKey) throw new Error('Gemini API key not configured');

  console.log('[Gemini] parseResume - Starting, text length:', resumeText.length);

  const prompt = `Parse the following resume into structured recruiter-ready JSON.

Instructions:
- Read the full resume carefully.
- Extract actual candidate information in a practical recruiter format.
- Do not rely only on keyword collection.
- Capture evidence from projects, responsibilities, and real work context.
- Keep the output concise, structured, and frontend-safe.
- Do not return markdown. Return strict JSON only.

Field extraction rules:
- "candidate_name": Extract the candidate's full name from the resume header.
- "email": Extract email address.
- "phone": Extract phone number.
- "current_role": Their most recent or current job title.
- "current_company": Their most recent or current employer name.
- "total_experience": Total years of professional experience as a string number (e.g., "5", "8").
- "relevant_experience": Years of experience relevant to their primary skill area as a string number.
- "location": City/country or "N/A".
- "notice_period": If mentioned (e.g., "30 Days", "Immediate"), else "Not specified".
- "skills": Include clearly supported professional skills — programming languages, frameworks, tools, platforms. Prioritize skills with project or responsibility evidence.
- "certifications": List any professional certifications mentioned.
- "projects": Summarize important project work briefly — one line per project capturing what was built and key technologies.
- "domain_exposure": Include industry/business domains if inferable from project context (e.g., "Fintech", "E-commerce", "Healthcare").
- "real_skill_depth": Describe whether the profile shows shallow, moderate, or strong practical depth based on project evidence, years, and responsibility level.
- "years_per_skill": Estimate skill duration where resume evidence supports it (e.g., "React: 4y, Node.js: 3y, AWS: 2y"). Use "Not specified" if not available.
- "project_evidence": Summarize which important skills are supported by actual project work (e.g., "React supported by 3 frontend projects; AWS used in deployment pipeline").
- "responsibility_evidence": Summarize which skills or ownership areas are supported by role responsibilities (e.g., "Owned API design; Led frontend architecture; Managed CI/CD pipeline").
- "role_consistency": Comment briefly on whether the work history aligns with the claimed role direction (e.g., "Consistent full-stack progression", "Mixed backend and DevOps roles").
- "leadership_exposure": Capture mentoring, ownership, client handling, stakeholder interaction, team lead responsibility, or architecture ownership if present. Use "Not specified" if none.
- "education": List degrees, institutions, and graduation years if available (e.g., "B.Tech in Computer Science, IIT Delhi, 2018").

Resume Text:
${resumeText}`;

  const response = await withRetry(async () => {
    return ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: { ...GEMINI_CONFIG, responseSchema: RESUME_SCHEMA },
    });
  }, 'parseResume');

  const text = response.text || '';
  console.log('[Gemini] parseResume - Response received, length:', text.length);
  return parseJsonSafely<ResumeParsedPreview>(text, 'Resume');
};

export const evaluateCandidate = async (
  parsedJD: JDParsedPreview,
  parsedResume: ResumeParsedPreview
): Promise<AIEvaluation> => {
  if (!apiKey) throw new Error('Gemini API key not configured');

  console.log('[Gemini] evaluateCandidate - Starting for:', parsedResume.candidate_name);

  const prompt = `Create a recruiter evaluation for the candidate against the job requirement.

Behavior rules:
- Read the full structured JD and full structured Resume semantically.
- Do not rely on keyword count only.
- Judge whether resume claims are supported by project evidence and role responsibilities.
- Evaluate fit across skills, experience, seniority, domain relevance, certifications, tools, and practical work.
- Use concise professional recruiter language.
- Keep the output clean and not too long.
- Do not return markdown. Return strict JSON only.

Scoring logic:
- Mandatory skills match — 30%
- Relevant project evidence — 20%
- Experience fit — 15%
- Role / seniority alignment — 10%
- Domain fit — 10%
- Location / notice period fit — 5%
- Certifications / tools — 5%
- Resume consistency / confidence — 5%

Recommendation logic:
- 4.6 to 5.0 = Strong Shortlist
- 4.0 to 4.5 = Shortlist
- 3.2 to 3.9 = Consider
- 2.5 to 3.1 = Risky
- below 2.5 = Reject

Comparison rules:
- "Strong" means requirement is clearly supported by skills + project/responsibility evidence.
- "Partial" means requirement is somewhat supported but not strongly proven.
- "Weak" means indirect or limited evidence only.
- "Missing" means no meaningful support found.
- Strengths must come only from actual evidence.
- Gaps must come only from actual mismatch or missing proof.
- Red flags should be included only if justified.
- Screening questions should focus on unclear or weak areas that a recruiter should validate.

Structured JD:
${JSON.stringify({
  role: parsedJD.role,
  must_have_skills: parsedJD.must_have_skills,
  optional_skills: parsedJD.optional_skills,
  tools: parsedJD.tools,
  seniority: parsedJD.seniority,
  domain: parsedJD.domain,
  certifications: parsedJD.certifications,
  communication_expectations: parsedJD.communication_expectations,
  stakeholder_expectations: parsedJD.stakeholder_expectations,
  location: parsedJD.location,
  notice_period: parsedJD.notice_period,
})}

Structured Resume:
${JSON.stringify({
  candidate_name: parsedResume.candidate_name,
  current_role: parsedResume.current_role,
  current_company: parsedResume.current_company,
  total_experience: parsedResume.total_experience,
  relevant_experience: parsedResume.relevant_experience,
  skills: parsedResume.skills,
  certifications: parsedResume.certifications,
  projects: parsedResume.projects,
  domain_exposure: parsedResume.domain_exposure,
  real_skill_depth: parsedResume.real_skill_depth,
  years_per_skill: parsedResume.years_per_skill,
  project_evidence: parsedResume.project_evidence,
  responsibility_evidence: parsedResume.responsibility_evidence,
  role_consistency: parsedResume.role_consistency,
  leadership_exposure: parsedResume.leadership_exposure,
  location: parsedResume.location,
  notice_period: parsedResume.notice_period,
})}`;

  const response = await withRetry(async () => {
    return ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: { ...GEMINI_CONFIG, responseSchema: EVALUATION_SCHEMA },
    });
  }, `evaluateCandidate(${parsedResume.candidate_name})`);

  const text = response.text || '';
  console.log('[Gemini] evaluateCandidate - Response received for:', parsedResume.candidate_name);
  return parseJsonSafely<AIEvaluation>(text, 'Evaluation');
};
