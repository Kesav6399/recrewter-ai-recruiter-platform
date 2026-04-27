import { JDParsedPreview, ResumeParsedPreview, AIEvaluation, ComparisonRow } from "../types";

// ═══════════════════════════════════════════════════════════════════════════════
// UTILITY HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

function normalizeText(s: string): string {
  return (s || '').toLowerCase().trim();
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function wordMatch(haystack: string, needle: string): boolean {
  if (!haystack || !needle) return false;
  const h = normalizeText(haystack);
  const n = normalizeText(needle);
  if (!n) return false;
  try {
    return new RegExp(`\\b${escapeRegex(n)}\\b`, 'i').test(h);
  } catch {
    return h.includes(n);
  }
}

function extractYears(s: string): number {
  if (!s) return 0;
  const m = s.match(/(\d+(?:\.\d+)?)/);
  return m ? parseFloat(m[1]) : 0;
}

function extractMaxNumber(s: string): number {
  if (!s) return 0;
  const nums = s.match(/\d+(?:\.\d+)?/g);
  if (!nums || nums.length === 0) return 0;
  return Math.max(...nums.map(Number));
}

// ═══════════════════════════════════════════════════════════════════════════════
// EVIDENCE SCORING
// ═══════════════════════════════════════════════════════════════════════════════

interface SkillEvidence {
  inSkills: boolean;
  inProjects: boolean;
  inResponsibilities: boolean;
  inDepth: boolean;
  confidence: 'Strong' | 'Partial' | 'Missing';
  sources: string[];
}

function findSkillEvidence(
  skill: string,
  resumeSkills: string[],
  projectTexts: string[],
  responsibilityText: string,
  skillDepth: string
): SkillEvidence {
  const inSkills = resumeSkills.some(rs => {
    const r = normalizeText(rs);
    const s = normalizeText(skill);
    return r === s || r.includes(s) || s.includes(r);
  });

  const inProjects = projectTexts.some(pt => wordMatch(pt, skill));
  const inResponsibilities = wordMatch(responsibilityText, skill);
  const inDepth = wordMatch(skillDepth, skill);

  const sources: string[] = [];
  if (inSkills) sources.push('skills list');
  if (inProjects) sources.push('projects');
  if (inResponsibilities) sources.push('responsibilities');
  if (inDepth) sources.push('skill depth evidence');

  const count = sources.length;
  let confidence: 'Strong' | 'Partial' | 'Missing';
  if (count >= 2) confidence = 'Strong';
  else if (count === 1) confidence = 'Partial';
  else confidence = 'Missing';

  return { inSkills, inProjects, inResponsibilities, inDepth, confidence, sources };
}

function describeEvidence(skill: string, ev: SkillEvidence): string {
  if (ev.sources.length === 0) return `No evidence of ${skill} found in resume.`;
  return `${skill} — supported by: ${ev.sources.join(', ')}.`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROLE SIMILARITY
// ═══════════════════════════════════════════════════════════════════════════════

function roleSimilarity(jdRole: string, currentRole: string, projectEvidence: string, responsibilityEvidence: string): number {
  const jr = normalizeText(jdRole);
  const cr = normalizeText(currentRole);
  if (!jr) return 0.5;

  if (cr && (cr.includes(jr) || jr.includes(cr))) return 1.0;

  const jdWords = jr.split(/[\s/,]+&/).filter(w => w.length > 2);
  const crWords = cr.split(/[\s/,]+/).filter(w => w.length > 2);

  if (jdWords.length === 0) return 0.5;

  const overlap = jdWords.filter(jw => crWords.some(cw => cw.includes(jw) || jw.includes(cw)));
  const keywordScore = overlap.length / jdWords.length;

  const evidenceText = `${projectEvidence} ${responsibilityEvidence}`;
  const evidenceHits = jdWords.filter(jw => wordMatch(evidenceText, jw));
  const evidenceScore = evidenceHits.length / jdWords.length * 0.3;

  return Math.min(keywordScore * 0.7 + evidenceScore + 0.1, 1.0);
}

// ═══════════════════════════════════════════════════════════════════════════════
// DOMAIN / CERT / LOCATION / CONSISTENCY
// ═══════════════════════════════════════════════════════════════════════════════

function domainScore(jdDomain: string, domainExposure: string[], projectTexts: string[]): number {
  const dd = normalizeText(jdDomain);
  if (!dd || dd === 'general' || dd === 'not specified') return 0.7;

  if (domainExposure.some(de => normalizeText(de).includes(dd) || dd.includes(normalizeText(de)))) return 1.0;
  if (projectTexts.some(pt => wordMatch(pt, jdDomain))) return 0.75;
  return 0.3;
}

function certificationScore(jdCerts: string[], resumeCerts: string[]): number {
  if (jdCerts.length === 0) return 0.8;
  if (resumeCerts.length === 0) return 0.2;

  let hits = 0;
  for (const jc of jdCerts) {
    if (resumeCerts.some(rc => {
      const rn = normalizeText(rc);
      const jn = normalizeText(jc);
      return rn.includes(jn) || jn.includes(rn);
    })) hits++;
  }
  return hits / jdCerts.length;
}

function locationNoticeScore(
  jdLoc: string, candLoc: string,
  jdNotice: string, candNotice: string
): { score: number; locationGap: string | null; noticeGap: string | null } {
  let locationGap: string | null = null;
  let noticeGap: string | null = null;

  const jl = normalizeText(jdLoc);
  const cl = normalizeText(candLoc);

  let locScore = 0.7;
  if (!jl || jl === 'remote' || jl === 'any' || jl === 'flexible') {
    locScore = 1.0;
  } else if (!cl || cl === 'n/a' || cl === 'not specified') {
    locScore = 0.6;
  } else if (cl.includes(jl) || jl.includes(cl)) {
    locScore = 1.0;
  } else {
    locScore = 0.3;
    locationGap = `Location mismatch: candidate is in ${candLoc}, role requires ${jdLoc}`;
  }

  const jn = extractYears(jdNotice);
  const cn = extractYears(candNotice);
  let noticeScore = 0.7;
  if (jn === 0) {
    noticeScore = 0.8;
  } else if (cn === 0) {
    noticeScore = 0.6;
  } else if (cn <= jn) {
    noticeScore = 1.0;
  } else {
    noticeScore = Math.max(0.3, 1 - (cn - jn) * 0.15);
    if (cn - jn > 1) noticeGap = `Notice period (${candNotice}) may exceed preferred ${jdNotice}`;
  }

  return { score: (locScore + noticeScore) / 2, locationGap, noticeGap };
}

function consistencyScore(resume: ResumeParsedPreview): number {
  let score = 0.5;

  if (resume.skills.length > 0 && resume.projects.length > 0) {
    const projText = resume.projects.join(' ');
    const backed = resume.skills.filter(s => wordMatch(projText, s));
    score += (backed.length / resume.skills.length) * 0.2;
  }

  if (resume.responsibility_evidence && normalizeText(resume.responsibility_evidence) !== 'n/a') score += 0.1;
  if (resume.project_evidence && normalizeText(resume.project_evidence) !== 'n/a') score += 0.1;

  if (resume.role_consistency && normalizeText(resume.role_consistency) !== 'n/a') {
    const rc = normalizeText(resume.role_consistency);
    if (rc.includes('consistent') || rc.includes('strong') || rc.includes('good')) score += 0.1;
    else if (rc.includes('inconsistent') || rc.includes('weak') || rc.includes('poor')) score -= 0.1;
  }

  if (resume.real_skill_depth && normalizeText(resume.real_skill_depth) !== 'n/a') {
    const sd = normalizeText(resume.real_skill_depth);
    if (sd.includes('deep') || sd.includes('strong') || sd.includes('expert')) score += 0.05;
  }

  return Math.min(Math.max(score, 0.1), 1.0);
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN FALLBACK FUNCTION
// ═══════════════════════════════════════════════════════════════════════════════

export function evaluateCandidateFallback(
  parsedJD: JDParsedPreview,
  parsedResume: ResumeParsedPreview
): AIEvaluation {
  console.log('[Fallback] Evaluating:', parsedResume.candidate_name);

  const projectTexts = parsedResume.projects || [];
  const responsibilityText = parsedResume.responsibility_evidence || '';
  const projectEvidenceText = parsedResume.project_evidence || '';
  const skillDepth = parsedResume.real_skill_depth || '';

  // ── 1. Mandatory skills (30%) ──────────────────────────────────────────────
  const mustHaveResults = parsedJD.must_have_skills.map(skill => ({
    skill,
    evidence: findSkillEvidence(skill, parsedResume.skills, projectTexts, `${responsibilityText} ${projectEvidenceText}`, skillDepth),
  }));
  const mustHitCount = mustHaveResults.filter(r => r.evidence.confidence !== 'Missing').length;
  const mustStrongCount = mustHaveResults.filter(r => r.evidence.confidence === 'Strong').length;
  const mustHaveScore = parsedJD.must_have_skills.length > 0
    ? (mustHitCount * 0.6 + mustStrongCount * 0.4) / parsedJD.must_have_skills.length
    : 0.5;

  // ── Optional skills for comparison table ───────────────────────────────────
  const allOptional = [...(parsedJD.optional_skills || []), ...(parsedJD.tools || [])];
  const optionalResults = allOptional.map(skill => ({
    skill,
    evidence: findSkillEvidence(skill, parsedResume.skills, projectTexts, `${responsibilityText} ${projectEvidenceText}`, skillDepth),
  }));

  // ── 2. Project / responsibility evidence (20%) ────────────────────────────
  let evidenceScore = 0.3;
  if (parsedResume.projects.length >= 3) evidenceScore += 0.25;
  else if (parsedResume.projects.length >= 1) evidenceScore += 0.15;

  if (projectEvidenceText && normalizeText(projectEvidenceText) !== 'n/a') evidenceScore += 0.15;
  if (responsibilityText && normalizeText(responsibilityText) !== 'n/a') evidenceScore += 0.15;

  const skillsInProjects = mustHaveResults.filter(r => r.evidence.inProjects).length;
  if (parsedJD.must_have_skills.length > 0) {
    evidenceScore += (skillsInProjects / parsedJD.must_have_skills.length) * 0.15;
  }
  evidenceScore = Math.min(evidenceScore, 1.0);

  // ── 3. Experience fit (15%) ───────────────────────────────────────────────
  const candidateExp = extractYears(parsedResume.total_experience);
  const relevantExp = extractYears(parsedResume.relevant_experience);
  const requiredExp = extractMaxNumber(parsedJD.seniority);

  let expScore = 0.5;
  if (requiredExp > 0) {
    const ratio = candidateExp / requiredExp;
    if (ratio >= 1.0 && ratio <= 2.0) expScore = 1.0;
    else if (ratio >= 0.8) expScore = 0.85;
    else if (ratio >= 0.6) expScore = 0.65;
    else if (ratio >= 0.4) expScore = 0.45;
    else expScore = 0.25;

    if (relevantExp >= requiredExp * 0.8) expScore = Math.min(expScore + 0.1, 1.0);
  } else {
    expScore = candidateExp > 0 ? 0.7 : 0.4;
  }

  // ── 4. Role / seniority alignment (10%) ───────────────────────────────────
  const roleScore = roleSimilarity(parsedJD.role, parsedResume.current_role, projectEvidenceText, responsibilityText);

  // ── 5. Domain fit (10%) ───────────────────────────────────────────────────
  const domScore = domainScore(parsedJD.domain, parsedResume.domain_exposure || [], projectTexts);

  // ── 6. Location / notice period (5%) ──────────────────────────────────────
  const locNotice = locationNoticeScore(
    parsedJD.location, parsedResume.location,
    parsedJD.notice_period, parsedResume.notice_period
  );

  // ── 7. Certifications / tools (5%) ────────────────────────────────────────
  const certSc = certificationScore(parsedJD.certifications || [], parsedResume.certifications || []);
  // Also check tools match
  const allTools = parsedJD.tools || [];
  const toolsMatchCount = allTools.filter(tool =>
    parsedResume.skills.some(rs => normalizeText(rs).includes(normalizeText(tool)) || normalizeText(tool).includes(normalizeText(rs)))
  ).length;
  const toolsScore = allTools.length > 0 ? toolsMatchCount / allTools.length : 0.5;
  const certToolsScore = (certSc + toolsScore) / 2;

  // ── 8. Consistency / confidence (5%) ──────────────────────────────────────
  const confScore = consistencyScore(parsedResume);

  // ═══════════════════════════════════════════════════════════════════════════
  // WEIGHTED TOTAL
  // Mandatory skills — 30%, Project evidence — 20%, Experience — 15%,
  // Role alignment — 10%, Domain — 10%, Location/notice — 5%,
  // Certifications/tools — 5%, Consistency — 5%
  // ═══════════════════════════════════════════════════════════════════════════
  const weighted =
    mustHaveScore * 0.30 +
    evidenceScore * 0.20 +
    expScore * 0.15 +
    roleScore * 0.10 +
    domScore * 0.10 +
    locNotice.score * 0.05 +
    certToolsScore * 0.05 +
    confScore * 0.05;

  const rating = Math.round(Math.min(Math.max(weighted * 5, 1.0), 5.0) * 10) / 10;

  // ═══════════════════════════════════════════════════════════════════════════
  // RECOMMENDATION
  // ═══════════════════════════════════════════════════════════════════════════
  let recommendation: AIEvaluation['recommendation'];
  if (rating >= 4.6) recommendation = 'Strong Shortlist';
  else if (rating >= 4.0) recommendation = 'Shortlist';
  else if (rating >= 3.2) recommendation = 'Consider';
  else if (rating >= 2.5) recommendation = 'Risky';
  else recommendation = 'Reject';

  // ═══════════════════════════════════════════════════════════════════════════
  // COMPARISON TABLE
  // ═══════════════════════════════════════════════════════════════════════════
  const comparison_table: ComparisonRow[] = [];

  for (const r of mustHaveResults) {
    comparison_table.push({
      requirement: r.skill,
      client_need: 'Must-have skill',
      candidate_evidence: describeEvidence(r.skill, r.evidence),
      match_level: r.evidence.confidence,
    });
  }

  for (const r of optionalResults) {
    comparison_table.push({
      requirement: r.skill,
      client_need: allOptional.includes(parsedJD.tools?.find(t => normalizeText(t) === normalizeText(r.skill)) || '') ? 'Tool' : 'Nice-to-have skill',
      candidate_evidence: describeEvidence(r.skill, r.evidence),
      match_level: r.evidence.confidence,
    });
  }

  const expMatchLevel: ComparisonRow['match_level'] =
    requiredExp > 0 && candidateExp >= requiredExp ? 'Strong' :
    requiredExp > 0 && candidateExp >= requiredExp * 0.7 ? 'Partial' :
    requiredExp > 0 ? 'Weak' : 'Partial';
  comparison_table.push({
    requirement: `${parsedJD.seniority} experience`,
    client_need: `Required: ${parsedJD.seniority}`,
    candidate_evidence: `${candidateExp}y total, ${relevantExp}y relevant. Current: ${parsedResume.current_role} at ${parsedResume.current_company}.`,
    match_level: expMatchLevel,
  });

  const roleMatchLevel: ComparisonRow['match_level'] =
    roleScore >= 0.8 ? 'Strong' : roleScore >= 0.5 ? 'Partial' : roleScore >= 0.3 ? 'Weak' : 'Missing';
  comparison_table.push({
    requirement: `Role: ${parsedJD.role}`,
    client_need: 'Role alignment',
    candidate_evidence: `Currently ${parsedResume.current_role} at ${parsedResume.current_company}. ${projectEvidenceText ? `Project evidence: ${projectEvidenceText.substring(0, 120)}` : 'No project evidence provided.'}`,
    match_level: roleMatchLevel,
  });

  if (parsedJD.domain && normalizeText(parsedJD.domain) !== 'general') {
    const domMatchLevel: ComparisonRow['match_level'] =
      domScore >= 0.8 ? 'Strong' : domScore >= 0.5 ? 'Partial' : 'Weak';
    comparison_table.push({
      requirement: `Domain: ${parsedJD.domain}`,
      client_need: 'Domain expertise',
      candidate_evidence: parsedResume.domain_exposure.length > 0
        ? `Domain exposure: ${parsedResume.domain_exposure.join(', ')}`
        : 'No domain exposure listed.',
      match_level: domMatchLevel,
    });
  }

  if (parsedJD.certifications.length > 0) {
    const certMatchLevel: ComparisonRow['match_level'] =
      certSc >= 0.8 ? 'Strong' : certSc >= 0.4 ? 'Partial' : 'Missing';
    comparison_table.push({
      requirement: 'Certifications',
      client_need: `Required: ${parsedJD.certifications.join(', ')}`,
      candidate_evidence: parsedResume.certifications.length > 0
        ? `Candidate has: ${parsedResume.certifications.join(', ')}`
        : 'No certifications listed.',
      match_level: certMatchLevel,
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STRENGTHS (only from real evidence)
  // ═══════════════════════════════════════════════════════════════════════════
  const strengths: string[] = [];

  const strongSkills = mustHaveResults.filter(r => r.evidence.confidence === 'Strong');
  if (strongSkills.length > 0) {
    const names = strongSkills.map(r => r.skill).slice(0, 4).join(', ');
    const ev = strongSkills[0].evidence;
    const how = ev.inProjects && ev.inSkills ? 'listed in skills and used in projects'
              : ev.inProjects ? 'used in project work'
              : ev.inResponsibilities ? 'supported by responsibility evidence'
              : 'listed in skills with depth evidence';
    strengths.push(`Strong ${names} — ${how}`);
  }

  if (requiredExp > 0 && candidateExp >= requiredExp) {
    strengths.push(`${candidateExp}y experience meets the ${parsedJD.seniority} requirement`);
  } else if (candidateExp >= 3) {
    strengths.push(`${candidateExp}y of professional experience`);
  }

  if (parsedResume.projects.length >= 3) {
    strengths.push(`${parsedResume.projects.length} projects demonstrating hands-on delivery`);
  } else if (parsedResume.projects.length >= 1) {
    strengths.push(`Project experience: ${parsedResume.projects[0].substring(0, 80)}`);
  }

  if (roleScore >= 0.8) {
    strengths.push(`Strong role alignment — ${parsedResume.current_role} maps well to ${parsedJD.role}`);
  }

  const strongOpt = optionalResults.filter(r => r.evidence.confidence !== 'Missing');
  if (strongOpt.length >= 2) {
    strengths.push(`Additional value: ${strongOpt.map(r => r.skill).slice(0, 3).join(', ')}`);
  }

  if (domScore >= 0.8) {
    strengths.push(`Relevant domain exposure in ${parsedJD.domain}`);
  }

  if (certSc >= 0.8 && parsedResume.certifications.length > 0) {
    strengths.push(`Certification support: ${parsedResume.certifications.slice(0, 2).join(', ')}`);
  }

  if (parsedResume.leadership_exposure && normalizeText(parsedResume.leadership_exposure) !== 'n/a') {
    const le = normalizeText(parsedResume.leadership_exposure);
    if (le.includes('lead') || le.includes('manage') || le.includes('architect') || le.includes('mentor')) {
      strengths.push(`Leadership evidence: ${parsedResume.leadership_exposure.substring(0, 80)}`);
    }
  }

  if (strengths.length === 0) {
    strengths.push('Candidate profile is available for detailed review');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GAPS (only from actual mismatch)
  // ═══════════════════════════════════════════════════════════════════════════
  const gaps: string[] = [];

  const missingMust = mustHaveResults.filter(r => r.evidence.confidence === 'Missing');
  if (missingMust.length > 0) {
    gaps.push(`Missing must-have skills: ${missingMust.map(r => r.skill).join(', ')}`);
  }

  const partialMust = mustHaveResults.filter(r => r.evidence.confidence === 'Partial');
  if (partialMust.length > 0) {
    gaps.push(`Limited evidence for: ${partialMust.map(r => r.skill).join(', ')} — found in only one source`);
  }

  if (requiredExp > 0 && candidateExp < requiredExp * 0.7) {
    gaps.push(`Experience (${candidateExp}y) is significantly below the ${parsedJD.seniority} requirement`);
  }

  if (parsedResume.projects.length === 0 && mustHaveResults.some(r => r.evidence.inSkills && !r.evidence.inProjects)) {
    gaps.push('No project descriptions to verify hands-on skill application');
  }

  if (roleScore < 0.4) {
    gaps.push(`Role mismatch: candidate is ${parsedResume.current_role}, JD requires ${parsedJD.role}`);
  }

  if (domScore < 0.4 && parsedJD.domain && normalizeText(parsedJD.domain) !== 'general') {
    gaps.push(`No clear ${parsedJD.domain} domain experience demonstrated`);
  }

  if (certSc < 0.3 && parsedJD.certifications.length > 0) {
    gaps.push(`Missing required certifications: ${parsedJD.certifications.join(', ')}`);
  }

  if (locNotice.locationGap) gaps.push(locNotice.locationGap);
  if (locNotice.noticeGap) gaps.push(locNotice.noticeGap);

  if (confScore < 0.4) {
    gaps.push('Low evidence consistency — skills listed but not supported by project or responsibility details');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RED FLAGS (only when justified)
  // ═══════════════════════════════════════════════════════════════════════════
  const redFlags: string[] = [];

  const mustMissingRate = parsedJD.must_have_skills.length > 0
    ? missingMust.length / parsedJD.must_have_skills.length : 0;
  if (mustMissingRate >= 0.6 && parsedJD.must_have_skills.length >= 2) {
    redFlags.push(`${missingMust.length} of ${parsedJD.must_have_skills.length} must-have skills have no evidence — high risk of skill gap`);
  }

  if (roleScore < 0.25 && parsedJD.role && parsedResume.current_role) {
    redFlags.push(`Significant role mismatch: "${parsedResume.current_role}" vs required "${parsedJD.role}"`);
  }

  if (confScore < 0.3) {
    redFlags.push('Low confidence in resume evidence — skills may be buzzwords without real depth');
  }

  if (candidateExp < 2 && roleScore > 0.7 && mustMissingRate > 0.5) {
    redFlags.push('Junior experience level but claims senior-level role alignment — verify during screening');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SCREENING QUESTIONS (based on actual weak areas)
  // ═══════════════════════════════════════════════════════════════════════════
  const screening: string[] = [];

  for (const r of missingMust.slice(0, 2)) {
    screening.push(`Can you describe your hands-on experience with ${r.skill}? Have you used it in production?`);
  }

  for (const r of partialMust.slice(0, 1)) {
    screening.push(`You list ${r.skill} — can you walk through a specific project where you applied it?`);
  }

  if (roleScore < 0.6 && parsedJD.role) {
    screening.push(`Your current role is ${parsedResume.current_role}. How does your experience map to a ${parsedJD.role} position?`);
  }

  if (requiredExp > 0 && candidateExp < requiredExp) {
    screening.push(`This role requires ${parsedJD.seniority} experience. You have ${candidateExp}y — can you highlight your most relevant experience?`);
  }

  if (domScore < 0.5 && parsedJD.domain && normalizeText(parsedJD.domain) !== 'general') {
    screening.push(`Do you have specific experience in the ${parsedJD.domain} domain? Can you give examples?`);
  }

  if (parsedResume.projects.length === 0) {
    screening.push('Can you walk me through your most impactful project and your specific contribution?');
  }

  if (screening.length === 0) {
    screening.push('What is your most relevant project for this role and what was your specific contribution?');
    screening.push('What is your availability and preferred notice period?');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SUMMARY
  // ═══════════════════════════════════════════════════════════════════════════
  const mustPct = parsedJD.must_have_skills.length > 0
    ? Math.round(mustHitCount / parsedJD.must_have_skills.length * 100) : 0;

  const summaryParts: string[] = [
    `${mustHitCount}/${parsedJD.must_have_skills.length} must-have skills matched (${mustPct}%)`,
    `${candidateExp}y experience vs ${parsedJD.seniority} required`,
    `role alignment: ${Math.round(roleScore * 100)}%`,
  ];

  if (missingMust.length > 0) {
    summaryParts.push(`gaps in ${missingMust.map(r => r.skill).slice(0, 2).join(', ')}`);
  }
  if (strongSkills.length > 0) {
    summaryParts.push(`strong evidence in ${strongSkills.map(r => r.skill).slice(0, 2).join(', ')}`);
  }

  const short_summary = `Evidence-based scoring: ${summaryParts.join(' | ')}. Overall: ${rating}/5 — ${recommendation}.`;

  console.log(`[Fallback] ${parsedResume.candidate_name}: ${rating}/5 (${recommendation}) — ${mustHitCount}/${parsedJD.must_have_skills.length} skills`);

  const technicalMatch = Math.round((mustHaveScore * 0.6 + evidenceScore * 0.25 + certToolsScore * 0.15) * 100);
  const roleAlignmentPct = Math.round(roleScore * 100);
  const stabilityPct = Math.round((locNotice.score * 0.4 + confScore * 0.3 + (candidateExp >= 3 ? 0.3 : candidateExp / 3 * 0.3)) * 100);

  return {
    candidate_name: parsedResume.candidate_name,
    current_role: parsedResume.current_role,
    total_experience: parsedResume.total_experience,
    location: parsedResume.location,
    notice_period: parsedResume.notice_period,
    overall_rating_out_of_5: rating,
    recommendation,
    short_summary,
    comparison_table,
    strengths,
    gaps,
    optional_red_flags: redFlags,
    suggested_screening_questions: screening,
    sub_scores: {
      technical_match: technicalMatch,
      role_alignment: roleAlignmentPct,
      stability_score: stabilityPct,
    },
  };
}
