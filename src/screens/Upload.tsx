import React, { useMemo, useState } from 'react';
import { Upload as UploadIcon, CheckCircle2, Loader2, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import * as pdfjs from 'pdfjs-dist';
// @ts-ignore
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
import mammoth from 'mammoth';
import { Candidate, JDParsedPreview, Requirement, ResumeParsedPreview } from '../types';
import { useAppContext } from '../context/AppContext';
import { parseJD, parseResume, evaluateCandidate } from '../services/geminiService';
import { evaluateCandidateFallback } from '../services/fallbackEvaluation';
import { parseResumeFromText } from '../services/resumeTextParser';
import { parseJDFromText } from '../services/jdTextParser';

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

type PipelineStatus = 'idle' | 'parsing-jd' | 'jd-done' | 'parsing-resumes' | 'resumes-done' | 'evaluating' | 'done' | 'error';

export default function Upload() {
  const navigate = useNavigate();
  const { requirements, addRequirement, activeRequirementId, setActiveRequirementId, setMatchResults, user } = useAppContext();

  const [step, setStep] = useState(1);
  const [pipelineStatus, setPipelineStatus] = useState<PipelineStatus>('idle');
  const [matchProgress, setMatchProgress] = useState(0);
  const [jdData, setJdData] = useState<JDParsedPreview | null>(null);
  const [resumeFiles, setResumeFiles] = useState<File[]>([]);
  const [resumePreviews, setResumePreviews] = useState<ResumeParsedPreview[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [pipelineMessage, setPipelineMessage] = useState<string | null>(null);

  const selectedRequirement = useMemo(
    () => requirements.find((requirement) => requirement.id === activeRequirementId) ?? null,
    [requirements, activeRequirementId]
  );

  const buildJdPreviewFromRequirement = (requirement: Requirement): JDParsedPreview => ({
    role: requirement.roleTitle,
    must_have_skills: requirement.mandatorySkills,
    optional_skills: requirement.goodToHaveSkills,
    tools: [],
    seniority: `${requirement.minExperience}-${requirement.maxExperience} Years`,
    domain: requirement.clientName,
    certifications: [],
    communication_expectations: requirement.remarks || 'Standard professional communication',
    stakeholder_expectations: 'Not specified',
    location: requirement.location,
    notice_period: requirement.noticePeriod,
    shift: 'General',
    client_specific_filters: []
  });

  const extractText = async (file: File) => {
    try {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext === 'pdf') {
        const doc = await pdfjs.getDocument(await file.arrayBuffer()).promise;
        let text = '';
        for (let i = 1; i <= doc.numPages; i++) {
          const page = await doc.getPage(i);
          text += (await page.getTextContent()).items.map((item: any) => item.str).join(' ') + '\n';
        }
        return text;
      }

      if (ext === 'docx') {
        const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
        return result.value;
      }

      return `Content extracted from ${file.name}`;
    } catch (err) {
      console.error('[Upload] Text extraction failed for', file.name, err);
      return `Manual entry for ${file.name}`;
    }
  };

  const handleJDUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;

    const file = e.target.files[0];
    setErrorMsg(null);
    setPipelineStatus('parsing-jd');

    try {
      const text = await extractText(file);
      console.log('[Upload] JD text extracted, length:', text.length);

      try {
        const parsed = await parseJD(text);
        console.log('[Upload] Gemini JD parsed successfully:', parsed.role);
        setJdData(parsed);

        const experienceStart = Number.parseInt(parsed.seniority, 10) || 0;
        const newRequirement: Requirement = {
          id: `req-${Date.now()}`,
          clientName: parsed.domain || 'New Client',
          roleTitle: parsed.role || file.name,
          jdText: text,
          mandatorySkills: parsed.must_have_skills || [],
          goodToHaveSkills: parsed.optional_skills || [],
          minExperience: experienceStart,
          maxExperience: experienceStart + 5,
          location: parsed.location || 'Remote',
          noticePeriod: parsed.notice_period || '30 Days',
          employmentType: 'Full-time',
          budget: 'TBD',
          priority: 'Medium',
          status: 'Active',
          remarks: '',
          createdBy: user?.uid || 'system',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        addRequirement(newRequirement);
        setActiveRequirementId(newRequirement.id);
        setPipelineStatus('jd-done');
      } catch (err: any) {
        console.warn('[Upload] Gemini JD parsing failed, using text-based fallback:', err.message || err);
        const fallbackJD = parseJDFromText(text, file.name);
        console.log(`[JDParser fallback] role=${fallbackJD.role}, ${fallbackJD.must_have_skills.length} must-have skills: [${fallbackJD.must_have_skills.join(', ')}]`);
        setJdData(fallbackJD);

        const experienceStart = Number.parseInt(fallbackJD.seniority, 10) || 0;
        const newRequirement: Requirement = {
          id: `req-${Date.now()}`,
          clientName: fallbackJD.domain || 'New Client',
          roleTitle: fallbackJD.role || file.name,
          jdText: text,
          mandatorySkills: fallbackJD.must_have_skills || [],
          goodToHaveSkills: fallbackJD.optional_skills || [],
          minExperience: experienceStart,
          maxExperience: experienceStart + 5,
          location: fallbackJD.location || 'Remote',
          noticePeriod: fallbackJD.notice_period || '30 Days',
          employmentType: 'Full-time',
          budget: 'TBD',
          priority: 'Medium',
          status: 'Active',
          remarks: '',
          createdBy: user?.uid || 'system',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        addRequirement(newRequirement);
        setActiveRequirementId(newRequirement.id);
        setPipelineStatus('jd-done');
      }

      setStep(2);
    } catch (err: any) {
      console.error('[Upload] JD processing failed:', err);
      setErrorMsg(`Failed to process JD: ${err.message || 'Unknown error'}`);
      setPipelineStatus('error');
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files);
    setResumeFiles((prev) => [...prev, ...files]);
    setErrorMsg(null);
    setPipelineStatus('parsing-resumes');

    try {
      const previews: ResumeParsedPreview[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(`[Upload] Parsing resume ${i + 1}/${files.length}: ${file.name}`);
        const text = await extractText(file);
        console.log(`[Upload] Extracted ${text.length} chars from ${file.name}`);
        try {
          const profile = await parseResume(text);
          console.log(`[Upload] Gemini resume parsed: ${profile.candidate_name}`);
          previews.push(profile);
        } catch (err: any) {
          console.warn(`[Upload] Gemini resume parsing failed for ${file.name}, using text-based fallback:`, err.message || err);
          const fallbackProfile = parseResumeFromText(text, file.name);
          console.log(`[Upload] Text fallback parsed: ${fallbackProfile.candidate_name}, ${fallbackProfile.skills.length} skills, ${fallbackProfile.projects.length} projects`);
          previews.push(fallbackProfile);
        }
      }

      setResumePreviews((prev) => [...prev, ...previews]);
      setPipelineStatus('resumes-done');
    } catch (err: any) {
      console.error('[Upload] Resume upload failed:', err);
      setErrorMsg(`Resume processing failed: ${err.message || 'Unknown error'}`);
      setPipelineStatus('error');
    }
  };

  const runSmartMatch = async () => {
    const effectiveJdData = jdData ?? (selectedRequirement ? buildJdPreviewFromRequirement(selectedRequirement) : null);
    if (!effectiveJdData) {
      setErrorMsg('No job description data available. Please upload a JD or select a requirement first.');
      return;
    }
    if (resumePreviews.length === 0) {
      setErrorMsg('No resume data available. Please upload at least one resume.');
      return;
    }

    setErrorMsg(null);
    setPipelineMessage(null);
    setPipelineStatus('evaluating');
    setMatchProgress(0);

    try {
      const results: Candidate[] = [];
      let fallbackCount = 0;

      for (let i = 0; i < resumePreviews.length; i++) {
        const preview = resumePreviews[i];
        setMatchProgress(Math.round(((i + 1) / resumePreviews.length) * 100));

        let evaluation;

        try {
          evaluation = await evaluateCandidate(effectiveJdData, preview);
          console.log(`[Upload] Gemini evaluation success for ${preview.candidate_name}`);
        } catch (error: any) {
          console.warn(`[Upload] Gemini evaluation failed for ${preview.candidate_name}. Using fallback evaluation.`, error);
          evaluation = evaluateCandidateFallback(effectiveJdData, preview);
          fallbackCount++;
        }

        const candidate: Candidate = {
          id: `c-${Date.now()}-${i}`,
          name: preview.candidate_name || `Candidate ${i + 1}`,
          email: preview.email || 'N/A',
          phone: preview.phone || 'N/A',
          experience: parseFloat(preview.total_experience) || 0,
          skills: preview.skills || [],
          location: preview.location || 'N/A',
          currentCompany: preview.current_company || 'N/A',
          currentRole: preview.current_role || 'N/A',
          parsedData: preview,
          stage: 'New',
          requirementId: activeRequirementId || undefined,
          createdAt: new Date().toISOString(),
          matchScore: Math.round((evaluation.overall_rating_out_of_5 || 0) * 20),
          aiEvaluation: evaluation,
          interviews: [],
          communications: [],
        };

        results.push(candidate);
      }

      if (results.length === 0) {
        setErrorMsg('All candidate evaluations failed. Please try again.');
        setPipelineStatus('error');
        return;
      }

      if (fallbackCount > 0) {
        setPipelineMessage('Gemini quota/API is unavailable. Showing fallback recruiter scoring.');
      }

      const sorted = results.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
      console.log('[Upload] Setting match results:', sorted.length, 'candidates');
      setMatchResults(sorted);
      setPipelineStatus('done');
      navigate('/match-results');
    } catch (err: any) {
      console.error('[Upload] Smart match failed:', err);
      setErrorMsg(`Evaluation failed: ${err.message || 'Unknown error'}`);
      setPipelineStatus('error');
    } finally {
      setMatchProgress(0);
    }
  };

  const isProcessing = pipelineStatus === 'parsing-jd' || pipelineStatus === 'parsing-resumes' || pipelineStatus === 'evaluating';

  const getStatusMessage = () => {
    switch (pipelineStatus) {
      case 'parsing-jd': return 'Parsing Job Description with AI...';
      case 'parsing-resumes': return 'Parsing resumes with AI...';
      case 'evaluating': return `AI Evaluation in progress... ${matchProgress}%`;
      default: return null;
    }
  };

  const statusMsg = getStatusMessage();

  return (
    <div className="max-w-6xl mx-auto space-y-10 p-6">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white">Intelligence Pipeline</h1>
        <p className="text-slate-500 font-medium">Upload a job description or pick an existing requirement to begin matching candidates.</p>
      </div>

      {errorMsg && (
        <div className="max-w-xl mx-auto p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl flex items-start gap-3">
          <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800 dark:text-amber-300 font-medium">{errorMsg}</p>
        </div>
      )}

      {pipelineMessage && (
        <div className="max-w-xl mx-auto rounded-2xl border border-amber-200 bg-amber-50 text-amber-800 px-4 py-3 text-sm font-medium">
          {pipelineMessage}
        </div>
      )}

      {statusMsg && (
        <div className="max-w-xl mx-auto p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl flex items-center gap-3">
          <Loader2 size={20} className="text-blue-600 animate-spin shrink-0" />
          <p className="text-sm text-blue-800 dark:text-blue-300 font-medium">{statusMsg}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8">
        {step === 1 && (
          <div className="flex flex-col items-center">
            <div className="w-full max-w-xl border-4 border-dashed border-blue-100 rounded-[40px] p-20 text-center relative hover:bg-blue-50/50 transition-all cursor-pointer group">
              {pipelineStatus === 'parsing-jd'
                ? <Loader2 className="animate-spin text-blue-600 mx-auto" size={48} />
                : <UploadIcon className="text-blue-600 mx-auto mb-4" size={48} />
              }
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Upload Job Description</h3>
              <p className="text-sm text-slate-500 mt-2">Drop your JD file here to start the process</p>
              <input type="file" accept=".pdf,.docx,.txt" onChange={handleJDUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
            </div>

            {pipelineStatus === 'jd-done' && jdData && (
              <div className="mt-6 w-full max-w-xl p-6 bg-white dark:bg-slate-900 border rounded-2xl shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-emerald-600">
                  <CheckCircle2 size={18} />
                  <span className="text-sm font-black uppercase">JD Parsed Successfully</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400"><strong>Role:</strong> {jdData.role}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400"><strong>Must-have skills:</strong> {jdData.must_have_skills.join(', ') || 'None specified'}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400"><strong>Location:</strong> {jdData.location}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400"><strong>Seniority:</strong> {jdData.seniority}</p>
              </div>
            )}

            <div className="mt-10 w-full max-w-xl">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 text-center">Or Select Existing</p>
              <select
                onChange={(e) => {
                  const requirementId = e.target.value || null;
                  const requirement = requirements.find((item) => item.id === requirementId) ?? null;
                  setActiveRequirementId(requirementId);
                  const jdPreview = requirement ? buildJdPreviewFromRequirement(requirement) : null;
                  setJdData(jdPreview);
                  if (requirement) {
                    setPipelineStatus('jd-done');
                    setStep(2);
                  }
                }}
                className="w-full p-4 border rounded-2xl bg-white dark:bg-slate-900 outline-none font-bold text-slate-700 dark:text-slate-200 shadow-sm"
              >
                <option value="">Select from database...</option>
                {requirements.map((requirement) => (
                  <option key={requirement.id} value={requirement.id}>
                    {requirement.roleTitle}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col items-center space-y-8 animate-in fade-in duration-500">
            <div className="w-full max-w-xl border-4 border-dashed border-slate-100 rounded-[40px] p-20 text-center relative hover:bg-slate-50 dark:hover:bg-slate-900 transition-all cursor-pointer">
              {pipelineStatus === 'parsing-resumes'
                ? <Loader2 className="animate-spin text-blue-600 mx-auto" size={48} />
                : <UploadIcon className="text-blue-600 mx-auto mb-4" size={48} />
              }
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Upload Resumes</h3>
              <p className="text-sm text-slate-500 mt-2">Select up to 20 candidate files</p>
              <input type="file" multiple accept=".pdf,.docx,.txt" onChange={handleResumeUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
            </div>

            {resumeFiles.length > 0 && (
              <div className="w-full max-w-xl space-y-2">
                {resumeFiles.map((file, index) => {
                  const preview = resumePreviews[index];
                  return (
                    <div key={`${file.name}-${index}`} className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border rounded-2xl shadow-sm">
                      <div>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{file.name}</span>
                        {preview && (
                          <span className="text-[10px] text-slate-400 ml-2">- {preview.candidate_name}</span>
                        )}
                      </div>
                      <CheckCircle2 size={18} className="text-emerald-500" />
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex gap-4">
              <button onClick={() => setStep(1)} className="px-10 py-4 font-bold text-slate-400">
                Back
              </button>
              <button
                onClick={runSmartMatch}
                disabled={resumeFiles.length === 0 || isProcessing || (!jdData && !selectedRequirement)}
                className="btn btn-primary px-12 py-4 rounded-2xl font-black text-lg shadow-2xl shadow-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {pipelineStatus === 'evaluating'
                  ? `AI Evaluation... ${matchProgress}%`
                  : 'View Match Results'
                }
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
