'use client'
import { useState, useRef, useEffect } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────
type ProgramId = 'graduate-certs' | 'stem' | 'healthcare'
type TabId = 'questions' | 'scoring' | 'integrity' | 'nextsteps'
type QType = 'Behavioral' | 'Technical' | 'Situational'
type Severity = 'hard-stop' | 'flag' | 'note'

interface PillarWeight { pillar: string; weight: string; color: string; passing: string }
interface Question { id: string; pillar: string; type: QType; text: string; intent: string; followUp?: string }
interface ScoringRule { pillar: string; weight: string; passing: string; s1: string; s3: string; s5: string; note: string }
interface IntegrityCheck { id: string; name: string; severity: Severity; rule: string; trigger: string; action: string }
interface Draft {
  programId: ProgramId; programLabel: string; version: string
  duration: string; passingThreshold: string
  pillars: PillarWeight[]; questions: Question[]
  scoring: ScoringRule[]; integrity: IntegrityCheck[]; nextSteps: string[]
}
interface ChatMsg { id: string; role: 'user' | 'assistant'; content: string; ts: string; updatesTab?: TabId }
interface PromptTemplate {
  id: string; name: string; description: string
  category: 'Assessment Generation' | 'Question Refinement' | 'Integrity Checks' | 'Scoring Logic'
  program: string; content: string; author: string; updatedAt: string
}

// ─── Mock Assessment Data ─────────────────────────────────────────────────────
const PROGRAMS: { id: ProgramId; label: string; short: string }[] = [
  { id: 'graduate-certs', label: 'Graduate Certificates', short: 'Grad Certs' },
  { id: 'stem',           label: 'STEM',                   short: 'STEM' },
  { id: 'healthcare',     label: 'Healthcare / Trades / Diploma', short: 'Healthcare' },
]

const DRAFTS: Record<ProgramId, Draft> = {
  'graduate-certs': {
    programId: 'graduate-certs', programLabel: 'Graduate Certificates',
    version: 'V1.0 Draft', duration: '40–50 min', passingThreshold: '3.2 / 5.0',
    pillars: [
      { pillar: 'Education Fit',        weight: '40%', color: '#1D4ED8', passing: '3.0' },
      { pillar: 'Industry Experience',  weight: '25%', color: '#16A34A', passing: '2.5' },
      { pillar: 'Statement of Purpose', weight: '35%', color: '#D97706', passing: '3.2' },
    ],
    questions: [
      { id: 'gc1', pillar: 'Education Fit', type: 'Behavioral',
        text: 'Walk me through your academic background and how it connects to this certificate program.',
        intent: 'Assess alignment between prior education and program requirements.',
        followUp: 'What specific skills gaps does this certificate address for you?' },
      { id: 'gc2', pillar: 'Education Fit', type: 'Technical',
        text: 'What is your GPA or academic standing from your most recent degree?',
        intent: 'Baseline academic fit check. Flags credential inflation risk.' },
      { id: 'gc3', pillar: 'Industry Experience', type: 'Behavioral',
        text: 'Describe your most recent professional role and how it relates to this program.',
        intent: 'Assess relevance and depth of professional experience.',
        followUp: 'How much of your day-to-day role used skills this program will build on?' },
      { id: 'gc4', pillar: 'Statement of Purpose', type: 'Behavioral',
        text: 'Why are you pursuing this certificate now, and what do you plan to do with it?',
        intent: 'Assess motivation clarity and career goal specificity.',
        followUp: 'Where do you want to be professionally in 3 years, and how does this fit?' },
      { id: 'gc5', pillar: 'Statement of Purpose', type: 'Situational',
        text: 'What would you do if the coursework turned out to be significantly more demanding than expected?',
        intent: 'Assess resilience and commitment signals.' },
    ],
    scoring: [
      { pillar: 'Education Fit', weight: '40%', passing: '3.0',
        s1: 'No relevant academic background. Degree unrelated to program area.',
        s3: 'Partial alignment. Related field but with notable gaps.',
        s5: 'Strong alignment. Degree directly relevant. Solid academic record.',
        note: 'Graduate Certificates require at least one completed post-secondary degree.' },
      { pillar: 'Industry Experience', weight: '25%', passing: '2.5',
        s1: 'No relevant experience. Career change with no prior field exposure.',
        s3: '1–2 years adjacent experience. Some transferable skills present.',
        s5: '3+ years directly relevant. Clear career trajectory toward program area.',
        note: 'Lower threshold — certificates are often pursued mid-career pivot.' },
      { pillar: 'Statement of Purpose', weight: '35%', passing: '3.2',
        s1: 'Vague or generic. No clear career connection. Reads like a form letter.',
        s3: 'Adequate motivation. Some career connection but goals are underdeveloped.',
        s5: 'Specific and compelling. Clear career problem. Certificate is the obvious solution.',
        note: 'SOP carries high weight given career-change profile of most applicants.' },
    ],
    integrity: [
      { id: 'igc1', name: 'Credential Inflation', severity: 'hard-stop',
        rule: 'Claimed degree not verifiable via transcript request.',
        trigger: "Candidate claims a degree whose timeline or institution cannot be verified.",
        action: 'Request official transcripts before advancing. Do not score Education Fit above 2 without verification.' },
      { id: 'igc2', name: 'GPA Fabrication', severity: 'flag',
        rule: 'Self-reported GPA significantly exceeds institutional averages.',
        trigger: 'Claims a GPA of 3.9+ without supporting context or documentation.',
        action: 'Cross-check with transcript. Score Education Fit at 2 if unverified.' },
      { id: 'igc3', name: 'Volunteer Discounting', severity: 'note',
        rule: 'Unpaid roles are not equivalent to paid professional experience.',
        trigger: 'Candidate presents volunteer work as primary professional experience.',
        action: 'Apply volunteer discounting — count at 50% weight toward Industry Experience.' },
    ],
    nextSteps: [
      'Review scoring thresholds with program coordinator before first use.',
      'Add 2 behavioral questions to strengthen Education Fit pillar coverage.',
      'Calibrate passing threshold using intake data from last 2 cohorts.',
      'Pilot with 3 reviewers and compare scores before full deployment.',
    ],
  },
  'stem': {
    programId: 'stem', programLabel: 'STEM',
    version: 'V1.0 Draft', duration: '50–60 min', passingThreshold: '3.5 / 5.0',
    pillars: [
      { pillar: 'Education Fit',        weight: '35%', color: '#1D4ED8', passing: '3.2' },
      { pillar: 'Industry Experience',  weight: '30%', color: '#16A34A', passing: '3.0' },
      { pillar: 'Statement of Purpose', weight: '35%', color: '#D97706', passing: '3.5' },
    ],
    questions: [
      { id: 'st1', pillar: 'Education Fit', type: 'Technical',
        text: 'Describe your technical background. What quantitative or computational coursework have you completed?',
        intent: 'Assess foundational technical skills required for STEM programs.',
        followUp: 'Can you describe a specific course or project involving quantitative problem-solving?' },
      { id: 'st2', pillar: 'Education Fit', type: 'Behavioral',
        text: 'Tell me about a technically challenging project you completed during your studies.',
        intent: 'Assess ability to apply technical knowledge to real problems.',
        followUp: "What was the hardest part? How did you get unstuck?" },
      { id: 'st3', pillar: 'Industry Experience', type: 'Technical',
        text: 'Describe a problem you solved professionally using technical or quantitative methods.',
        intent: 'Evaluate depth of applied technical experience.',
        followUp: 'What tools or methods did you use? What were the measurable outcomes?' },
      { id: 'st4', pillar: 'Industry Experience', type: 'Behavioral',
        text: 'Have you worked in a team with other technical professionals? What was your specific role?',
        intent: 'Assess collaboration and communication in technical environments.' },
      { id: 'st5', pillar: 'Statement of Purpose', type: 'Situational',
        text: 'How does this STEM program fit into your career trajectory? What specific problem are you trying to solve?',
        intent: 'Evaluate goal clarity and research or industry alignment.',
        followUp: 'What would you be doing in 5 years if you did not pursue this program?' },
    ],
    scoring: [
      { pillar: 'Education Fit', weight: '35%', passing: '3.2',
        s1: 'No technical coursework. Unrelated degree with no quantitative component.',
        s3: 'Some quantitative coursework. Minor in relevant field or self-taught with demonstrable skills.',
        s5: 'Strong technical degree (Math, CS, Engineering, Sciences). High academic standing.',
        note: 'Self-teaching counts if verifiable through projects, GitHub, or certifications.' },
      { pillar: 'Industry Experience', weight: '30%', passing: '3.0',
        s1: 'No professional technical experience. Academic projects only.',
        s3: '1–3 years in technical role. Limited applied problem-solving beyond coursework.',
        s5: '3+ years in technical or research role. Led or significantly contributed to complex work.',
        note: 'Research experience is equivalent to industry experience for STEM applicants.' },
      { pillar: 'Statement of Purpose', weight: '35%', passing: '3.5',
        s1: 'No clear technical focus. Vague or generic application with no specific interest.',
        s3: 'Has a technical interest but career path is unclear or underdeveloped.',
        s5: 'Specific technical problem identified. Program is clearly the right vehicle.',
        note: 'High passing threshold — STEM programs need motivated, self-directed learners.' },
    ],
    integrity: [
      { id: 'ist1', name: 'Research Credit Inflation', severity: 'flag',
        rule: "Claims lead researcher role at seniority level inconsistent with experience.",
        trigger: "Uses 'I led' or 'I designed' language for multi-year projects at junior level.",
        action: 'Probe specific contributions. Ask what the team did separately. Discount if vague.' },
      { id: 'ist2', name: 'Part-Time Normalization', severity: 'note',
        rule: 'Technical roles under 20 hours/week are not equivalent to full-time roles.',
        trigger: 'Candidate presents co-op, internship, or part-time research as primary experience.',
        action: 'Apply part-time normalization. Score Industry Experience at 60% weight.' },
      { id: 'ist3', name: 'Unverifiable Publication Claims', severity: 'hard-stop',
        rule: 'Claims published or peer-reviewed work without citation.',
        trigger: 'Mentions publications, conference papers, or patents without providing references.',
        action: 'Request documentation immediately. Do not advance without citation or proof.' },
    ],
    nextSteps: [
      'Add a take-home quantitative problem to validate technical claims before interview.',
      'Review passing threshold with STEM program director — 3.5 may be high for mature career changers.',
      'Add 1 question targeting research methodology and scientific communication.',
      'Calibrate thresholds with prior STEM cohort admission and completion data.',
    ],
  },
  'healthcare': {
    programId: 'healthcare', programLabel: 'Healthcare / Trades / Diploma',
    version: 'V1.0 Draft', duration: '45–55 min', passingThreshold: '3.4 / 5.0',
    pillars: [
      { pillar: 'Education Fit',        weight: '30%', color: '#1D4ED8', passing: '3.0' },
      { pillar: 'Industry Experience',  weight: '40%', color: '#16A34A', passing: '3.5' },
      { pillar: 'Statement of Purpose', weight: '30%', color: '#D97706', passing: '3.0' },
    ],
    questions: [
      { id: 'hc1', pillar: 'Education Fit', type: 'Technical',
        text: 'What prerequisite coursework or certifications do you hold relevant to this program?',
        intent: 'Confirm baseline eligibility and academic readiness.',
        followUp: 'Are there any prerequisites you have not yet completed?' },
      { id: 'hc2', pillar: 'Industry Experience', type: 'Behavioral',
        text: 'Describe your most relevant hands-on or clinical experience to date.',
        intent: 'Assess practical exposure and verified depth in the field.',
        followUp: 'How many supervised hours have you logged, and in what settings?' },
      { id: 'hc3', pillar: 'Industry Experience', type: 'Situational',
        text: 'A client or patient is uncooperative or distressed. How do you respond?',
        intent: 'Assess interpersonal judgment and ethical conduct under pressure.',
        followUp: 'Tell me about a specific time this happened. What did you do?' },
      { id: 'hc4', pillar: 'Industry Experience', type: 'Behavioral',
        text: 'Have you worked in a regulated or high-stakes environment? Describe a challenge you faced.',
        intent: 'Evaluate ability to operate within compliance and safety requirements.',
        followUp: 'What would you do differently if you faced it again?' },
      { id: 'hc5', pillar: 'Statement of Purpose', type: 'Behavioral',
        text: 'Why this field, and why now? What does success look like 2 years after completing this program?',
        intent: 'Assess genuine commitment and career clarity in a vocational context.',
        followUp: 'What aspect of the field are you most uncertain about?' },
    ],
    scoring: [
      { pillar: 'Education Fit', weight: '30%', passing: '3.0',
        s1: 'Missing core prerequisites. No relevant academic preparation in field.',
        s3: 'Has partial prerequisites. May need bridging courses to succeed.',
        s5: 'All prerequisites met. Strong academic record in relevant sciences or trades.',
        note: 'Some programs require prerequisite verification before the interview is scheduled.' },
      { pillar: 'Industry Experience', weight: '40%', passing: '3.5',
        s1: 'No hands-on experience. Theoretical or academic knowledge only.',
        s3: 'Some clinical or trades hours. Limited supervised practice experience.',
        s5: 'Substantial verified hours in regulated setting. Handles high-stakes situations confidently.',
        note: 'Highest weight pillar. Practical experience is the primary differentiator.' },
      { pillar: 'Statement of Purpose', weight: '30%', passing: '3.0',
        s1: 'Vague or financially motivated. No genuine commitment to field evident.',
        s3: 'Some interest but lacks specificity. Generic reasons for pursuing program.',
        s5: 'Compelling personal motivation. Specific career goal. Clear understanding of field demands.',
        note: 'Watch for rehearsed answers. Probe for concrete examples, not hypotheticals.' },
    ],
    integrity: [
      { id: 'ihc1', name: 'Clinical Hours Inflation', severity: 'hard-stop',
        rule: 'Claimed hours significantly exceed what is plausible for the given timeline.',
        trigger: 'Claims 1000+ hours in a 6-month period without institutional support.',
        action: 'Request documentation. Apply NA fallback if unverifiable. Do not advance.' },
      { id: 'ihc2', name: 'License / Certification Discrepancy', severity: 'hard-stop',
        rule: 'Claimed license or certification does not match provincial registry.',
        trigger: 'Claims active licensure not found in regulatory database.',
        action: 'Flag for compliance review. Verify before advancing. This is a hard stop.' },
      { id: 'ihc3', name: 'Volunteer Discounting', severity: 'note',
        rule: 'Unpaid clinical or community health hours require normalization.',
        trigger: 'Counts volunteer shifts as equivalent to supervised clinical practice.',
        action: 'Apply volunteer discounting — count at 60% weight. Normalize for part-time.' },
      { id: 'ihc4', name: 'NA Fallback', severity: 'note',
        rule: 'Non-standard background applicants default to interview evaluation only.',
        trigger: 'Applicant cannot meet standard education or experience benchmarks.',
        action: 'Apply NA fallback. Score on Statement of Purpose and live interview performance only.' },
    ],
    nextSteps: [
      'Verify all claimed clinical hours via institution or employer letter before interview.',
      'Add a clinical scenario question targeting ethical judgment in patient care.',
      'Align passing threshold with provincial licensing body requirements.',
      'Review integrity checks with compliance team before deployment.',
    ],
  },
}

// ─── Prompt Library Data ──────────────────────────────────────────────────────
const PROMPT_LIBRARY: PromptTemplate[] = [
  {
    id: 'pl1', name: 'Healthcare — Full Assessment Draft', program: 'Healthcare / Trades / Diploma',
    category: 'Assessment Generation', author: 'Rayan Sadri', updatedAt: 'Apr 3',
    description: 'Generates a complete assessment for Healthcare/Trades applicants. Includes clinical hours verification and hard stops for license discrepancies.',
    content: `Generate a complete assessment draft for Healthcare/Trades/Diploma applicants.

Program context:
- Industry Experience carries 40% weight — practical hours are the primary differentiator
- Minimum 200 supervised clinical hours required (hard requirement — verify documentation)
- Active certifications (CPR/First Aid) must be verified before interview
- Apply NA Fallback for international or non-standard backgrounds

Generate:
1. 5 behaviorally-anchored questions per pillar with follow-up probes
2. 1/3/5 scoring rubrics with observable behavioral anchors
3. Integrity checks: clinical hours inflation (hard stop), license discrepancy (hard stop), volunteer discounting
4. Next steps for pre-deployment review`,
  },
  {
    id: 'pl2', name: 'STEM — Full Assessment Draft', program: 'STEM',
    category: 'Assessment Generation', author: 'Rayan Sadri', updatedAt: 'Apr 3',
    description: 'STEM program assessment with technical verification questions. Flags research credit inflation and unverifiable publication claims.',
    content: `Generate a complete assessment draft for STEM program applicants.

Program context:
- Technical background required — verify quantitative coursework and applied projects
- Research experience counts as industry equivalent — but probe for specific contributions
- Passing threshold is highest at 3.5/5.0 — these are self-directed learners
- Self-taught skills count if verifiable via GitHub, publications, or portfolio

Generate:
1. 5 questions per pillar with technical verification probes
2. Scoring rubrics that distinguish research equivalency from direct industry experience
3. Integrity checks: research credit inflation (flag), publication claims (hard stop), part-time normalization
4. Recommendation to add take-home quantitative problem before interview`,
  },
  {
    id: 'pl3', name: 'Grad Certs — Full Assessment Draft', program: 'Graduate Certificates',
    category: 'Assessment Generation', author: 'Finance Team', updatedAt: 'Mar 28',
    description: 'Assessment generation for mid-career pivots. Higher SOP and Education Fit weighting. Credential inflation is the top integrity risk.',
    content: `Generate a complete assessment draft for Graduate Certificate applicants.

Program context:
- Typical profile: mid-career professional pivoting into a new field
- Education Fit (40%) and Statement of Purpose (35%) carry highest weight
- Industry Experience threshold is lower (2.5) — career changers are expected
- Watch for credential inflation — transcripts are required for all claimed degrees

Generate:
1. Questions that probe career transition motivation and goal clarity
2. SOP follow-ups that distinguish genuine goals from generic answers
3. Scoring rubrics that acknowledge career-change profiles at the 3-anchor
4. Integrity checks: credential inflation (hard stop), GPA fabrication (flag), volunteer discounting`,
  },
  {
    id: 'pl4', name: 'Add Integrity Checks — Any Program', program: 'All Programs',
    category: 'Integrity Checks', author: 'Finance Team', updatedAt: 'Mar 25',
    description: 'Identifies anti-gaming risks across all three pillars. Adds triggers, hard stops, and discounting rules.',
    content: `Review the current assessment draft and add comprehensive integrity checks.

For each pillar, identify:
1. Where applicants could inflate or fabricate credentials
2. Where generic or rehearsed answers would score well without real substance
3. Where part-time or volunteer experience could be misrepresented as full-time

For each risk, define:
- The rule (what is being checked)
- The trigger signal (what the reviewer watches for)
- The action (what to do when triggered)
- Severity: hard-stop (blocks advancement) / flag (escalate) / note (adjust scoring)

Apply the Program Fit integrity rules: unverifiable data hard stop, part-time normalization, volunteer discounting, NA fallback.`,
  },
  {
    id: 'pl5', name: 'Improve Behavioral Anchoring', program: 'All Programs',
    category: 'Question Refinement', author: 'Finance Team', updatedAt: 'Mar 20',
    description: 'Strengthens questions to require specific past examples instead of hypotheticals. Adds follow-up probes that catch vague answers.',
    content: `Review all current assessment questions and improve their behavioral anchoring.

For each question:
1. Identify if it can be answered with a hypothetical ("I would...") rather than a real example
2. Rewrite it to explicitly require a specific past experience
3. Add a follow-up probe that digs for detail and catches vague answers
4. Flag any question that is easy to rehearse or prepare generic answers for

Goal: after this refinement, every question should require a specific incident from the candidate's actual experience. Generic, coach-prepped answers should be immediately apparent to the reviewer.`,
  },
  {
    id: 'pl6', name: 'Custom Rubric — Paste and Generate', program: 'All Programs',
    category: 'Assessment Generation', author: 'Template', updatedAt: '',
    description: 'Paste your own rubric here. Design Brain will generate a fully customized assessment incorporating your criteria — making it very hard for applicants to predict or game.',
    content: `[PASTE YOUR CUSTOM RUBRIC BELOW]

Example:
- Applicants must have completed BIO 201 or equivalent anatomy coursework
- Minimum 1 year of supervised experience in a regulated healthcare setting
- Must provide two professional references, at least one from a licensed practitioner
- Current CPR/First Aid certification required before program start

[END RUBRIC]

Using the Finance Program Fit Methodology AND the custom rubric above, generate a complete assessment draft that:
1. Incorporates all custom rubric requirements as hard evaluation criteria
2. Adds questions that verify each custom requirement with behavioral probes
3. Flags any rubric item that is difficult to verify — add integrity checks for those
4. Generates scoring anchors that reflect both the methodology and the custom requirements

This produces an assessment specific to your program that applicants cannot predict from generic prep resources.`,
  },
]

// ─── Chat helpers ─────────────────────────────────────────────────────────────
function makeInitialMsg(program: ProgramId): ChatMsg {
  const d = DRAFTS[program]
  const weights = d.pillars.map(p => `${p.pillar} ${p.weight}`).join(' · ')
  const texts: Record<ProgramId, string> = {
    'graduate-certs': `Loaded **Finance Program Fit Methodology** for **Graduate Certificates**.\n\nPillar weights: ${weights}\nPassing threshold: ${d.passingThreshold}\n\nCertificate applicants skew toward mid-career transitions — Education Fit and SOP carry the most weight. Ready to generate a full assessment draft or work on a specific section.`,
    'stem': `Loaded **Finance Program Fit Methodology** for **STEM** programs.\n\nPillar weights: ${weights}\nPassing threshold: ${d.passingThreshold}\n\nSTEM applicants are evaluated heavily on technical background and research clarity. Passing threshold is the highest of the three programs. What would you like to generate or refine?`,
    'healthcare': `Loaded **Finance Program Fit Methodology** for **Healthcare / Trades / Diploma**.\n\nPillar weights: ${weights}\nPassing threshold: ${d.passingThreshold}\n\nFor Healthcare and Trades, **Industry Experience carries 40%** — the highest weight. Integrity checks include two hard stops: clinical hours inflation and license discrepancy. Ready when you are.`,
  }
  return { id: `init-${program}`, role: 'assistant', content: texts[program], ts: '10:14 AM' }
}

function makeContextSwitchMsg(program: ProgramId): ChatMsg {
  const d = DRAFTS[program]
  const label = PROGRAMS.find(p => p.id === program)!.label
  const weights = d.pillars.map(p => `${p.pillar} ${p.weight}`).join(' · ')
  return {
    id: `switch-${program}-${Date.now()}`,
    role: 'assistant',
    content: `Switched context to **${label}**.\n\nUpdated pillar weights: ${weights}\nPassing threshold: ${d.passingThreshold}\n\nThe Assessment Draft panel has been updated. Continue from here.`,
    ts: now(),
  }
}

function now() {
  return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

function guessTab(text: string): TabId | undefined {
  const t = text.toLowerCase()
  if (t.includes('integrity') || t.includes('hard stop') || t.includes('gaming') || t.includes('discounting') || t.includes('verif')) return 'integrity'
  if (t.includes('scoring') || t.includes('rubric') || t.includes('anchor') || t.includes('threshold') || t.includes('1/3/5') || t.includes('1 =') || t.includes('5 =')) return 'scoring'
  if (t.includes('next step') || t.includes('before deploy') || t.includes('pilot') || t.includes('finaliz')) return 'nextsteps'
  if (t.includes('question') || t.includes('behavioral') || t.includes('follow-up') || t.includes('probe') || t.includes('ask')) return 'questions'
  return undefined
}

const QUICK_ACTIONS = [
  { id: 'draft',   label: 'Generate assessment draft',       prompt: 'Generate a full assessment draft for this program using the Program Fit Methodology.' },
  { id: 'improve', label: 'Improve reviewer questions',      prompt: 'Review and improve the reviewer questions to be more behaviorally anchored.' },
  { id: 'checks',  label: 'Add integrity checks',            prompt: 'Add integrity checks for this program including hard stops and discounting rules.' },
  { id: 'scoring', label: 'Suggest scoring logic',           prompt: 'Suggest detailed scoring logic with 1, 3, and 5 anchors for each pillar.' },
  { id: 'gaps',    label: 'Find weak or easy-to-game areas', prompt: 'Find weak or easy-to-game areas in the current assessment.' },
]

// ─── Icons ────────────────────────────────────────────────────────────────────
function Icon({ d, size = 16, color = 'currentColor', sw = 1.6 }: { d: string; size?: number; color?: string; sw?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  )
}
const ic = {
  assess:  'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
  brain:   'M12 2a4 4 0 014 4 4 4 0 01-1.16 2.76A4 4 0 0116 12a4 4 0 01-4 4 4 4 0 01-4-4 4 4 0 011.16-3.24A4 4 0 018 6a4 4 0 014-4zM8.5 18.5a3.5 3.5 0 007 0',
  library: 'M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5A2.5 2.5 0 016.5 22H20V2H6.5A2.5 2.5 0 004 4.5v15z',
  settings:'M12 15a3 3 0 100-6 3 3 0 000 6zm0 0v3m0-9V6m4.22 8.22l2.12 2.12M5.64 9.64L3.52 7.52M18.36 9.64l2.12-2.12M5.64 14.36L3.52 16.48',
  file:    'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6',
  draft:   'M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4 9.5-9.5z',
  chevron: 'M6 9l6 6 6-6',
  send:    'M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z',
  attach:  'M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48',
  warning: 'M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01',
  check:   'M20 6L9 17l-5-5',
  clock:   'M12 2a10 10 0 100 20A10 10 0 0012 2zm0 5v5l4 2',
  target:  'M22 12h-4m-2 0a6 6 0 11-12 0 6 6 0 0112 0zM2 12h4',
  arrow:   'M5 12h14M12 5l7 7-7 7',
  support: 'M18 20V10M12 20V4M6 20v-6',
  save:    'M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2zM17 21v-8H7v8M7 3v5h8',
  search:  'M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z',
  plus:    'M12 5v14M5 12h14',
  tag:     'M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82zM7 7h.01',
  use:     'M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3',
}

// Simple markdown renderer: **bold** and \n line breaks
function Md({ text, style }: { text: string; style?: React.CSSProperties }) {
  const lines = text.split('\n')
  return (
    <span style={style}>
      {lines.map((line, li) => {
        const parts = line.split('**')
        return (
          <span key={li}>
            {li > 0 && <br />}
            {parts.map((part, pi) =>
              pi % 2 === 1
                ? <strong key={pi} style={{ fontWeight: 600, color: 'var(--text)' }}>{part}</strong>
                : part
            )}
          </span>
        )
      })}
    </span>
  )
}

// ─── Sidebar (dark navy) ──────────────────────────────────────────────────────
const NAV = [
  { id: 'brain',       label: 'Design Brain', icon: ic.brain   },
  { id: 'assessments', label: 'Assessments',  icon: ic.assess  },
  { id: 'library',     label: 'Prompt Library', icon: ic.library },
  { id: 'settings',    label: 'Settings',     icon: ic.settings },
]
const SAVED_DRAFTS = [
  { id: 'd1', label: 'GC Assessment',   version: 'V1.0', program: 'Grad Certs', updated: 'Apr 3'  },
  { id: 'd2', label: 'STEM Assessment', version: 'V0.2', program: 'STEM',        updated: 'Mar 28' },
]

function Sidebar({ activeNav, onNav }: { activeNav: string; onNav: (id: string) => void }) {
  const sb = (opacity: number) => `rgba(255,255,255,${opacity})`
  return (
    <div style={{ width: 240, flexShrink: 0, background: 'var(--sb-bg)', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Logo */}
      <div style={{ padding: '16px 16px 12px', borderBottom: `1px solid ${sb(0.09)}`, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: '#1D4ED8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: sb(0.95), letterSpacing: '-0.02em', lineHeight: 1.1 }}>Passage</div>
            <div style={{ fontSize: 10, color: sb(0.35), letterSpacing: '0.06em', textTransform: 'uppercase' }}>Assessment</div>
          </div>
        </div>
      </div>

      {/* Team */}
      <div style={{ padding: '10px 10px 4px', flexShrink: 0 }}>
        <button style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '7px 9px', borderRadius: 8, background: sb(0.08), border: `1px solid ${sb(0.1)}`, cursor: 'pointer' }}>
          <div style={{ width: 22, height: 22, borderRadius: 6, background: '#1D4ED8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: 'white', flexShrink: 0 }}>FT</div>
          <span style={{ fontSize: 12, fontWeight: 500, color: sb(0.88), flex: 1, textAlign: 'left' }}>Finance Team</span>
          <Icon d={ic.chevron} size={12} color={sb(0.35)} />
        </button>
      </div>

      {/* Nav */}
      <div style={{ padding: '4px 8px', flexShrink: 0 }}>
        {NAV.map(item => {
          const active = activeNav === item.id
          return (
            <button key={item.id} onClick={() => onNav(item.id)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '7px 9px', borderRadius: 7, cursor: 'pointer', background: active ? sb(0.13) : 'transparent', border: 'none', marginBottom: 1, color: active ? sb(0.95) : sb(0.55), fontSize: 12, fontWeight: active ? 500 : 400, transition: 'background 0.1s' }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = sb(0.07) }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
            >
              <Icon d={item.icon} size={14} color={active ? sb(0.92) : sb(0.5)} />
              {item.label}
              {item.id === 'library' && <span style={{ marginLeft: 'auto', fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 8, background: sb(0.15), color: sb(0.6) }}>{PROMPT_LIBRARY.length}</span>}
            </button>
          )
        })}
      </div>

      <div style={{ height: 1, background: sb(0.08), margin: '4px 12px', flexShrink: 0 }} />

      {/* Scrollable workspace content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px' }}>
        <SbSection title="Uploaded Methodologies" color={sb(0.3)}>
          <SbFile name="Finance_Program_Fit_Methodology.pdf" size="84 KB" />
        </SbSection>
        <div style={{ height: 1, background: sb(0.07), margin: '6px 4px' }} />
        <SbSection title="Saved Drafts" color={sb(0.3)}>
          {SAVED_DRAFTS.map(d => (
            <SbDraft key={d.id} label={d.label} version={d.version} program={d.program} updated={d.updated} />
          ))}
        </SbSection>
      </div>

      {/* User */}
      <div style={{ borderTop: `1px solid ${sb(0.08)}`, padding: '10px 10px 12px', flexShrink: 0 }}>
        <button style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 7, padding: '6px 7px', borderRadius: 7, border: 'none', background: 'transparent', cursor: 'pointer', marginBottom: 6, color: sb(0.35), fontSize: 12 }}
          onMouseEnter={e => { e.currentTarget.style.background = sb(0.07); e.currentTarget.style.color = sb(0.65) }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = sb(0.35) }}
        >
          <Icon d={ic.support} size={13} />
          Support
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 9px', borderRadius: 8, background: sb(0.08), border: `1px solid ${sb(0.1)}` }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #1D4ED8, #16A34A)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: 'white', flexShrink: 0 }}>RS</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: sb(0.88), overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Rayan Sadri</div>
            <div style={{ fontSize: 10, color: sb(0.38) }}>Finance Team</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function SbSection({ title, children, color }: { title: string; children: React.ReactNode; color: string }) {
  return (
    <div style={{ marginBottom: 4 }}>
      <div style={{ fontSize: 9, fontWeight: 700, color, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '8px 5px 4px' }}>{title}</div>
      {children}
    </div>
  )
}

function SbFile({ name, size }: { name: string; size: string }) {
  const sb = (o: number) => `rgba(255,255,255,${o})`
  return (
    <button style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 7, padding: '5px 5px', borderRadius: 6, background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}
      onMouseEnter={e => e.currentTarget.style.background = sb(0.07)}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <div style={{ width: 22, height: 22, borderRadius: 5, background: 'rgba(29,78,216,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon d={ic.file} size={11} color="rgba(147,197,253,0.9)" />
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 11, color: sb(0.62), overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 148 }}>{name}</div>
        <div style={{ fontSize: 10, color: sb(0.32) }}>{size}</div>
      </div>
    </button>
  )
}

function SbDraft({ label, version, program, updated }: { label: string; version: string; program: string; updated: string }) {
  const sb = (o: number) => `rgba(255,255,255,${o})`
  return (
    <button style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 7, padding: '5px 5px', borderRadius: 6, background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}
      onMouseEnter={e => e.currentTarget.style.background = sb(0.07)}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <div style={{ width: 22, height: 22, borderRadius: 5, background: sb(0.08), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon d={ic.draft} size={11} color={sb(0.38)} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, color: sb(0.65), overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</div>
        <div style={{ fontSize: 10, color: sb(0.32) }}>{version} · {program} · {updated}</div>
      </div>
    </button>
  )
}

// ─── Context Bar ──────────────────────────────────────────────────────────────
function ContextBar({ selectedProgram, onProgramChange }: { selectedProgram: ProgramId; onProgramChange: (p: ProgramId) => void }) {
  return (
    <div style={{ height: 50, flexShrink: 0, background: 'var(--panel)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 20px', gap: 14 }}>
      <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em', flexShrink: 0 }}>Passage Assessment</span>
      <div style={{ width: 1, height: 18, background: 'var(--border2)', flexShrink: 0 }} />
      <span style={{ fontSize: 12, color: 'var(--text3)', flexShrink: 0 }}>Finance Team</span>
      <div style={{ width: 1, height: 18, background: 'var(--border2)', flexShrink: 0 }} />
      <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
        {PROGRAMS.map(p => {
          const active = selectedProgram === p.id
          return (
            <button key={p.id} onClick={() => onProgramChange(p.id)} style={{ padding: '4px 12px', borderRadius: 20, cursor: 'pointer', fontSize: 12, fontWeight: active ? 600 : 400, background: active ? 'var(--accent)' : 'var(--surface2)', color: active ? 'white' : 'var(--text2)', border: active ? 'none' : '1px solid var(--border2)', transition: 'all 0.12s' }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'var(--surface)'; e.currentTarget.style.borderColor = 'rgba(29,78,216,0.35)' } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'var(--surface2)'; e.currentTarget.style.borderColor = 'var(--border2)' } }}
            >{p.short}</button>
          )
        })}
      </div>
      <div style={{ flex: 1 }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px 4px 8px', borderRadius: 8, background: 'rgba(29,78,216,0.07)', border: '1px solid rgba(29,78,216,0.18)', flexShrink: 0 }}>
        <Icon d={ic.file} size={12} color="var(--accent)" />
        <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--accent)' }}>Finance_Program_Fit_Methodology.pdf</span>
      </div>
    </div>
  )
}

// ─── Design Brain Chat Panel ──────────────────────────────────────────────────
function DesignBrainPanel({ selectedProgram, onTabSwitch }: { selectedProgram: ProgramId; onTabSwitch: (t: TabId) => void }) {
  const [messages, setMessages] = useState<ChatMsg[]>(() => [makeInitialMsg(selectedProgram)])
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const prevProgram = useRef(selectedProgram)

  useEffect(() => {
    if (prevProgram.current !== selectedProgram) {
      prevProgram.current = selectedProgram
      setMessages(prev => [...prev, makeContextSwitchMsg(selectedProgram)])
    }
  }, [selectedProgram])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, thinking])

  const send = async (text?: string) => {
    const content = (text ?? input).trim()
    if (!content || thinking) return
    setInput('')

    const userMsg: ChatMsg = { id: `u-${Date.now()}`, role: 'user', content, ts: now() }
    // Build history for API — exclude UI-only init/switch messages
    const history = [...messages, userMsg]
      .filter(m => !m.id.startsWith('init-') && !m.id.startsWith('switch-'))
      .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }))

    setMessages(prev => [...prev, userMsg])
    setThinking(true)

    const aId = `a-${Date.now()}`
    try {
      const res = await fetch('/workspace/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history, programLabel: PROGRAMS.find(p => p.id === selectedProgram)!.label }),
      })
      if (!res.ok) throw new Error(`${res.status}`)

      setThinking(false)
      setMessages(prev => [...prev, { id: aId, role: 'assistant', content: '', ts: now() }])

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let full = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        full += decoder.decode(value, { stream: true })
        setMessages(prev => prev.map(m => m.id === aId ? { ...m, content: full } : m))
      }
      const tab = guessTab(full)
      if (tab) {
        setMessages(prev => prev.map(m => m.id === aId ? { ...m, updatesTab: tab } : m))
        onTabSwitch(tab)
      }
    } catch {
      setThinking(false)
      setMessages(prev => [...prev, { id: aId, role: 'assistant', content: 'Something went wrong connecting to the API. Check that your server is running and try again.', ts: now() }])
    }
  }

  return (
    <div style={{ width: 460, flexShrink: 0, display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--border)', overflow: 'hidden', background: 'var(--panel)' }}>
      <div style={{ padding: '14px 18px 10px', flexShrink: 0, borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
          <div style={{ width: 22, height: 22, borderRadius: 7, background: 'linear-gradient(135deg, #1D4ED8, #1e40af)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z"/></svg>
          </div>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Design Brain</span>
        </div>
        <p style={{ fontSize: 11, color: 'var(--text3)', lineHeight: 1.5 }}>Turn internal methodologies into assessment drafts for your team.</p>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 18px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {messages.map(msg => (
            msg.role === 'user'
              ? <UserBubble key={msg.id} msg={msg} />
              : <AssistantBubble key={msg.id} msg={msg} onViewTab={onTabSwitch} />
          ))}
          {thinking && <ThinkingBubble />}
          <div ref={bottomRef} />
        </div>
      </div>

      <div style={{ padding: '10px 18px 12px', flexShrink: 0, borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 8 }}>
          {QUICK_ACTIONS.map(qa => (
            <button key={qa.id} onClick={() => send(qa.prompt)} disabled={thinking} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 20, cursor: 'pointer', background: 'var(--surface2)', border: '1px solid var(--border2)', color: 'var(--text2)', whiteSpace: 'nowrap', opacity: thinking ? 0.5 : 1 }}
              onMouseEnter={e => { if (!thinking) { e.currentTarget.style.borderColor = 'rgba(29,78,216,0.4)'; e.currentTarget.style.color = 'var(--text)' } }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.color = 'var(--text2)' }}
            >{qa.label}</button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 11px', borderRadius: 10, background: 'var(--surface2)', border: '1px solid var(--border2)' }}>
          <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') send() }} disabled={thinking}
            placeholder={`Ask about ${PROGRAMS.find(p => p.id === selectedProgram)!.short} assessment…`}
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 13, color: 'var(--text)', opacity: thinking ? 0.5 : 1 }}
          />
          {thinking
            ? <div className="spinner" style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid var(--border2)', borderTopColor: 'var(--accent)', flexShrink: 0 }} />
            : <button onClick={() => send()} disabled={!input.trim()} style={{ width: 28, height: 28, borderRadius: 7, border: 'none', cursor: 'pointer', flexShrink: 0, background: input.trim() ? 'var(--accent)' : 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.1s' }}>
                <Icon d={ic.send} size={13} color={input.trim() ? 'white' : 'var(--text3)'} />
              </button>
          }
        </div>
      </div>
    </div>
  )
}

function UserBubble({ msg }: { msg: ChatMsg }) {
  return (
    <div className="fade-up" style={{ display: 'flex', justifyContent: 'flex-end' }}>
      <div style={{ maxWidth: '82%', padding: '9px 13px', borderRadius: '13px 13px 3px 13px', background: 'var(--surface2)', border: '1px solid var(--border2)', fontSize: 13, color: 'var(--text)', lineHeight: 1.55 }}>
        {msg.content}
        <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 3, textAlign: 'right' }}>{msg.ts}</div>
      </div>
    </div>
  )
}

function AssistantBubble({ msg, onViewTab }: { msg: ChatMsg; onViewTab: (t: TabId) => void }) {
  return (
    <div className="fade-up" style={{ display: 'flex', gap: 9 }}>
      <div style={{ width: 26, height: 26, borderRadius: 8, flexShrink: 0, background: 'linear-gradient(135deg, #1D4ED8, #1e40af)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z"/></svg>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)' }}>Design Brain</span>
          <span style={{ fontSize: 10, color: 'var(--text3)' }}>{msg.ts}</span>
        </div>
        <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.65 }}>
          {msg.content
            ? <Md text={msg.content} />
            : <span className="pulse" style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)' }} />
          }
        </div>
        {msg.updatesTab && (
          <button onClick={() => onViewTab(msg.updatesTab!)} style={{ marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 500, color: 'var(--accent)', background: 'rgba(29,78,216,0.07)', border: '1px solid rgba(29,78,216,0.2)', padding: '4px 9px', borderRadius: 7, cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(29,78,216,0.13)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(29,78,216,0.07)'}
          >
            <Icon d={ic.arrow} size={11} color="var(--accent)" />
            View in {msg.updatesTab.charAt(0).toUpperCase() + msg.updatesTab.slice(1)} tab
          </button>
        )}
      </div>
    </div>
  )
}

function ThinkingBubble() {
  return (
    <div style={{ display: 'flex', gap: 9, alignItems: 'flex-start' }}>
      <div style={{ width: 26, height: 26, borderRadius: 8, flexShrink: 0, background: 'linear-gradient(135deg, #1D4ED8, #1e40af)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z"/></svg>
      </div>
      <div style={{ paddingTop: 6, display: 'flex', gap: 4 }}>
        {[0, 1, 2].map(i => (
          <div key={i} className="pulse" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', animationDelay: `${i * 0.2}s` }} />
        ))}
      </div>
    </div>
  )
}

// ─── Assessment Draft Panel ───────────────────────────────────────────────────
const TYPE_COLORS: Record<string, string> = { Behavioral: '#16A34A', Technical: '#1D4ED8', Situational: '#D97706' }
const SEV: Record<Severity, { color: string; label: string }> = {
  'hard-stop': { color: '#DC2626', label: 'Hard Stop' },
  flag:        { color: '#D97706', label: 'Flag'      },
  note:        { color: '#64748B', label: 'Note'      },
}

function DraftPanel({ selectedProgram, activeTab, updatedTab, onTabChange }: { selectedProgram: ProgramId; activeTab: TabId; updatedTab: TabId | null; onTabChange: (t: TabId) => void }) {
  const [saved, setSaved] = useState(false)
  const d = DRAFTS[selectedProgram]
  const tabs: { id: TabId; label: string; count: number }[] = [
    { id: 'questions', label: 'Questions', count: d.questions.length },
    { id: 'scoring',   label: 'Scoring',   count: d.scoring.length   },
    { id: 'integrity', label: 'Integrity', count: d.integrity.length },
    { id: 'nextsteps', label: 'Next Steps',count: d.nextSteps.length },
  ]
  return (
    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--surface)' }}>
      <div style={{ flexShrink: 0, background: 'var(--panel)', borderBottom: '1px solid var(--border)', padding: '14px 22px 0' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em', margin: 0 }}>{d.programLabel} Assessment</h2>
              <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 20, background: 'rgba(29,78,216,0.1)', color: 'var(--accent)', border: '1px solid rgba(29,78,216,0.22)' }}>{d.version}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {d.pillars.map(p => (
                <div key={p.pillar} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: 'var(--text3)' }}>{p.pillar} <strong style={{ color: 'var(--text2)', fontWeight: 600 }}>{p.weight}</strong></span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <MetaChip icon={ic.clock} label="Duration" value={d.duration} />
            <MetaChip icon={ic.target} label="Passing" value={d.passingThreshold} />
            <button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2200) }} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 500, background: saved ? 'rgba(22,163,74,0.08)' : 'var(--surface2)', color: saved ? 'var(--green)' : 'var(--text2)', border: `1px solid ${saved ? 'rgba(22,163,74,0.28)' : 'var(--border2)'}`, transition: 'all 0.15s' }}>
              <Icon d={saved ? ic.check : ic.save} size={13} color={saved ? 'var(--green)' : 'var(--text2)'} sw={2} />
              {saved ? 'Saved' : 'Save Draft'}
            </button>
          </div>
        </div>
        <div style={{ display: 'flex' }}>
          {tabs.map(tab => {
            const active = activeTab === tab.id
            const updated = updatedTab === tab.id
            return (
              <button key={tab.id} onClick={() => onTabChange(tab.id)} style={{ padding: '8px 16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: active ? 600 : 400, color: active ? 'var(--text)' : 'var(--text3)', borderBottom: active ? '2px solid var(--accent)' : '2px solid transparent', display: 'flex', alignItems: 'center', gap: 5, transition: 'all 0.1s' }}>
                {tab.label}
                <span style={{ fontSize: 10, padding: '1px 5px', borderRadius: 6, background: active ? 'rgba(29,78,216,0.1)' : 'var(--surface2)', color: active ? 'var(--accent)' : 'var(--text3)' }}>{tab.count}</span>
                {updated && <span className="fade-up" style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--green)', display: 'inline-block' }} />}
              </button>
            )
          })}
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '18px 22px' }}>
        {activeTab === 'questions'  && <QuestionsTab questions={d.questions} />}
        {activeTab === 'scoring'    && <ScoringTab scoring={d.scoring} />}
        {activeTab === 'integrity'  && <IntegrityTab checks={d.integrity} />}
        {activeTab === 'nextsteps'  && <NextStepsTab steps={d.nextSteps} />}
      </div>
    </div>
  )
}

function MetaChip({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div style={{ padding: '6px 11px', borderRadius: 8, background: 'var(--surface2)', border: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
        <Icon d={icon} size={11} color="var(--text3)" />
        <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
      </div>
      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{value}</div>
    </div>
  )
}

function QuestionsTab({ questions }: { questions: Question[] }) {
  const [expanded, setExpanded] = useState<string | null>(null)
  const byPillar: Record<string, Question[]> = {}
  questions.forEach(q => { (byPillar[q.pillar] ??= []).push(q) })
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {Object.entries(byPillar).map(([pillar, qs]) => (
        <div key={pillar}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>{pillar}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {qs.map(q => (
              <div key={q.id} onClick={() => setExpanded(expanded === q.id ? null : q.id)} style={{ padding: '11px 14px', borderRadius: 9, background: 'var(--panel)', border: `1px solid ${expanded === q.id ? 'rgba(29,78,216,0.3)' : 'var(--border)'}`, cursor: 'pointer', transition: 'border-color 0.12s' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                  <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.55, flex: 1, margin: 0 }}>{q.text}</p>
                  <span style={{ flexShrink: 0, fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 8, background: `${TYPE_COLORS[q.type]}10`, color: TYPE_COLORS[q.type], border: `1px solid ${TYPE_COLORS[q.type]}28`, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{q.type}</span>
                </div>
                {expanded === q.id && (
                  <div className="fade-up" style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <p style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.5, margin: 0 }}><span style={{ fontWeight: 600, color: 'var(--text3)' }}>Intent — </span>{q.intent}</p>
                    {q.followUp && <p style={{ fontSize: 12, color: 'var(--accent)', padding: '6px 10px', borderRadius: 7, background: 'rgba(29,78,216,0.05)', border: '1px solid rgba(29,78,216,0.14)', fontStyle: 'italic', lineHeight: 1.55, margin: 0 }}>{q.followUp}</p>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function ScoringTab({ scoring }: { scoring: ScoringRule[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {scoring.map((rule, i) => (
        <div key={i} style={{ borderRadius: 9, overflow: 'hidden', border: '1px solid var(--border)' }}>
          <div style={{ padding: '9px 14px', background: 'var(--panel)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{rule.pillar}</span>
            <div style={{ display: 'flex', gap: 10 }}>
              <span style={{ fontSize: 11, color: 'var(--text3)' }}>Weight: <strong style={{ color: 'var(--text2)' }}>{rule.weight}</strong></span>
              <span style={{ fontSize: 11, color: 'var(--text3)' }}>Passing: <strong style={{ color: 'var(--text2)' }}>{rule.passing}</strong></span>
            </div>
          </div>
          <div style={{ background: 'var(--surface)' }}>
            {[{ label: '1 — Insufficient', def: rule.s1, color: 'var(--red)' }, { label: '3 — Adequate', def: rule.s3, color: 'var(--amber)' }, { label: '5 — Exceptional', def: rule.s5, color: 'var(--green)' }].map(({ label, def, color }) => (
              <div key={label} style={{ padding: '8px 14px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color, marginBottom: 3 }}>{label}</div>
                <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.55 }}>{def}</div>
              </div>
            ))}
            <div style={{ padding: '7px 14px' }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent)' }}>Program note: </span>
              <span style={{ fontSize: 11, color: 'var(--text3)' }}>{rule.note}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function IntegrityTab({ checks }: { checks: IntegrityCheck[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {checks.map(c => (
        <div key={c.id} style={{ padding: '12px 14px', borderRadius: 9, background: 'var(--panel)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 9, marginBottom: 8 }}>
            <Icon d={ic.warning} size={14} color={SEV[c.severity].color} sw={2} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{c.name}</span>
                <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 8, background: `${SEV[c.severity].color}12`, color: SEV[c.severity].color, border: `1px solid ${SEV[c.severity].color}28`, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{SEV[c.severity].label}</span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.55, margin: 0 }}>{c.rule}</p>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <div style={{ fontSize: 12, padding: '5px 10px', borderRadius: 7, background: 'rgba(217,119,6,0.06)', border: '1px solid rgba(217,119,6,0.16)' }}>
              <span style={{ fontWeight: 600, color: 'var(--amber)' }}>Trigger: </span>
              <span style={{ color: 'var(--text2)' }}>{c.trigger}</span>
            </div>
            <div style={{ fontSize: 12, padding: '5px 10px', borderRadius: 7, background: 'rgba(29,78,216,0.05)', border: '1px solid rgba(29,78,216,0.14)' }}>
              <span style={{ fontWeight: 600, color: 'var(--accent)' }}>Action: </span>
              <span style={{ color: 'var(--text2)' }}>{c.action}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function NextStepsTab({ steps }: { steps: string[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      {steps.map((step, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 13px', borderRadius: 9, background: 'var(--panel)', border: '1px solid var(--border)' }}>
          <div style={{ width: 20, height: 20, borderRadius: 6, flexShrink: 0, background: 'rgba(29,78,216,0.08)', border: '1px solid rgba(29,78,216,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: 'var(--accent)' }}>{i + 1}</div>
          <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.55, margin: 0 }}>{step}</p>
        </div>
      ))}
    </div>
  )
}

// ─── Prompt Library View ──────────────────────────────────────────────────────
const CAT_COLORS: Record<string, string> = {
  'Assessment Generation': '#1D4ED8',
  'Question Refinement':   '#16A34A',
  'Integrity Checks':      '#DC2626',
  'Scoring Logic':         '#D97706',
}

function PromptLibraryView({ onUsePrompt }: { onUsePrompt: (content: string) => void }) {
  const [selected, setSelected] = useState<PromptTemplate>(PROMPT_LIBRARY[0])
  const [search, setSearch] = useState('')
  const [editContent, setEditContent] = useState(PROMPT_LIBRARY[0].content)
  const [saved, setSaved] = useState(false)

  const filtered = PROMPT_LIBRARY.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase()) ||
    p.program.toLowerCase().includes(search.toLowerCase())
  )

  const select = (p: PromptTemplate) => {
    setSelected(p)
    setEditContent(p.content)
    setSaved(false)
  }

  return (
    <div style={{ flex: 1, display: 'flex', overflow: 'hidden', background: 'var(--surface)' }}>
      {/* Left list */}
      <div style={{ width: 280, flexShrink: 0, background: 'var(--panel)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '16px 14px 10px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>Prompt Library</span>
            <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 10, background: 'rgba(29,78,216,0.1)', color: 'var(--accent)' }}>{PROMPT_LIBRARY.length}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 10px', borderRadius: 8, background: 'var(--surface2)', border: '1px solid var(--border2)' }}>
            <Icon d={ic.search} size={13} color="var(--text3)" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search prompts…" style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 12, color: 'var(--text)' }} />
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 8px' }}>
          {filtered.map(p => (
            <button key={p.id} onClick={() => select(p)} style={{ width: '100%', padding: '9px 10px', borderRadius: 8, textAlign: 'left', cursor: 'pointer', marginBottom: 2, background: selected.id === p.id ? 'rgba(29,78,216,0.07)' : 'transparent', border: `1px solid ${selected.id === p.id ? 'rgba(29,78,216,0.2)' : 'transparent'}`, transition: 'all 0.1s' }}
              onMouseEnter={e => { if (selected.id !== p.id) e.currentTarget.style.background = 'var(--surface2)' }}
              onMouseLeave={e => { if (selected.id !== p.id) e.currentTarget.style.background = 'transparent' }}
            >
              <div style={{ fontSize: 12, fontWeight: selected.id === p.id ? 600 : 400, color: 'var(--text)', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 10, fontWeight: 600, color: CAT_COLORS[p.category] || 'var(--text3)', background: `${CAT_COLORS[p.category]}10`, padding: '1px 6px', borderRadius: 6 }}>{p.category}</span>
                <span style={{ fontSize: 10, color: 'var(--text3)' }}>{p.program === 'All Programs' ? 'All' : p.program.split(' ')[0]}</span>
              </div>
            </button>
          ))}
          {filtered.length === 0 && <div style={{ padding: '20px 10px', fontSize: 12, color: 'var(--text3)', textAlign: 'center' }}>No prompts match "{search}"</div>}
        </div>
        <div style={{ padding: '10px 10px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
          <button style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '8px', borderRadius: 8, cursor: 'pointer', background: 'var(--accent)', color: 'white', border: 'none', fontSize: 12, fontWeight: 500 }}>
            <Icon d={ic.plus} size={13} color="white" sw={2.5} />
            New Prompt
          </button>
        </div>
      </div>

      {/* Right detail */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Detail header */}
        <div style={{ padding: '14px 24px', borderBottom: '1px solid var(--border)', background: 'var(--panel)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', margin: 0 }}>{selected.name}</h2>
              <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 10, background: `${CAT_COLORS[selected.category]}10`, color: CAT_COLORS[selected.category] || 'var(--text3)', border: `1px solid ${CAT_COLORS[selected.category]}25` }}>{selected.category}</span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text3)', margin: 0 }}>{selected.program} {selected.author !== 'Template' ? `· ${selected.author}` : ''}{selected.updatedAt ? ` · ${selected.updatedAt}` : ''}</p>
          </div>
          <button onClick={() => { onUsePrompt(editContent); setSaved(true); setTimeout(() => setSaved(false), 2200) }} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, cursor: 'pointer', background: 'var(--accent)', color: 'white', border: 'none', fontSize: 13, fontWeight: 600 }}>
            <Icon d={ic.use} size={14} color="white" sw={2} />
            Use in Design Brain
          </button>
        </div>

        {/* Editable content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '22px 24px' }}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Description</div>
            <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.65, margin: 0 }}>{selected.description}</p>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Prompt Content</div>
            <p style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 8 }}>Edit below to customize with your team's specific rubric before sending to Design Brain.</p>
            <textarea
              value={editContent}
              onChange={e => setEditContent(e.target.value)}
              style={{ width: '100%', minHeight: 340, padding: '14px', borderRadius: 10, border: '1px solid var(--border2)', background: 'var(--panel)', fontSize: 13, color: 'var(--text)', lineHeight: 1.7, fontFamily: 'inherit', resize: 'vertical', outline: 'none' }}
              onFocus={e => e.target.style.borderColor = 'rgba(29,78,216,0.4)'}
              onBlur={e => e.target.style.borderColor = 'var(--border2)'}
            />
            <div style={{ marginTop: 10, display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => { onUsePrompt(editContent); setSaved(true); setTimeout(() => setSaved(false), 2200) }} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px', borderRadius: 8, cursor: 'pointer', background: saved ? 'rgba(22,163,74,0.1)' : 'var(--accent)', color: saved ? 'var(--green)' : 'white', border: saved ? '1px solid rgba(22,163,74,0.3)' : 'none', fontSize: 13, fontWeight: 600, transition: 'all 0.15s' }}>
                <Icon d={saved ? ic.check : ic.use} size={14} color={saved ? 'var(--green)' : 'white'} sw={2} />
                {saved ? 'Sent to Design Brain' : 'Use in Design Brain'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function WorkspacePage() {
  const [activeNav, setActiveNav]             = useState('brain')
  const [selectedProgram, setSelectedProgram] = useState<ProgramId>('graduate-certs')
  const [activeTab, setActiveTab]             = useState<TabId>('questions')
  const [updatedTab, setUpdatedTab]           = useState<TabId | null>(null)
  const [pendingPrompt, setPendingPrompt]     = useState<string | null>(null)

  const switchTab = (tab: TabId) => {
    setActiveTab(tab)
    setUpdatedTab(tab)
    setTimeout(() => setUpdatedTab(null), 2200)
  }

  const handleProgramChange = (p: ProgramId) => {
    setSelectedProgram(p)
    setActiveTab('questions')
  }

  const handleUsePrompt = (content: string) => {
    setPendingPrompt(content)
    setActiveNav('brain') // Switch back to Design Brain
  }

  const showWorkspace = activeNav !== 'library'

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg)' }}>
      <Sidebar activeNav={activeNav} onNav={setActiveNav} />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {showWorkspace && <ContextBar selectedProgram={selectedProgram} onProgramChange={handleProgramChange} />}
        {!showWorkspace && (
          <div style={{ height: 50, flexShrink: 0, background: 'var(--panel)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 10 }}>
            <Icon d={ic.library} size={16} color="var(--text3)" />
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em' }}>Prompt Library</span>
            <span style={{ fontSize: 12, color: 'var(--text3)' }}>— Finance Team shared prompt templates</span>
          </div>
        )}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {showWorkspace
            ? <>
                <DesignBrainPanelWithPending
                  selectedProgram={selectedProgram}
                  onTabSwitch={switchTab}
                  pendingPrompt={pendingPrompt}
                  onPendingConsumed={() => setPendingPrompt(null)}
                />
                <DraftPanel
                  selectedProgram={selectedProgram}
                  activeTab={activeTab}
                  updatedTab={updatedTab}
                  onTabChange={setActiveTab}
                />
              </>
            : <PromptLibraryView onUsePrompt={handleUsePrompt} />
          }
        </div>
      </div>
    </div>
  )
}

// Wrapper that handles injecting a pending prompt from the library
function DesignBrainPanelWithPending({ selectedProgram, onTabSwitch, pendingPrompt, onPendingConsumed }: {
  selectedProgram: ProgramId; onTabSwitch: (t: TabId) => void
  pendingPrompt: string | null; onPendingConsumed: () => void
}) {
  const [messages, setMessages] = useState<ChatMsg[]>(() => [makeInitialMsg(selectedProgram)])
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const prevProgram = useRef(selectedProgram)

  useEffect(() => {
    if (prevProgram.current !== selectedProgram) {
      prevProgram.current = selectedProgram
      setMessages(prev => [...prev, makeContextSwitchMsg(selectedProgram)])
    }
  }, [selectedProgram])

  useEffect(() => {
    if (pendingPrompt) {
      setInput(pendingPrompt)
      onPendingConsumed()
    }
  }, [pendingPrompt, onPendingConsumed])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, thinking])

  const send = async (text?: string) => {
    const content = (text ?? input).trim()
    if (!content || thinking) return
    setInput('')

    const userMsg: ChatMsg = { id: `u-${Date.now()}`, role: 'user', content, ts: now() }
    const history = [...messages, userMsg]
      .filter(m => !m.id.startsWith('init-') && !m.id.startsWith('switch-'))
      .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }))

    setMessages(prev => [...prev, userMsg])
    setThinking(true)

    const aId = `a-${Date.now()}`
    try {
      const res = await fetch('/workspace/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history, programLabel: PROGRAMS.find(p => p.id === selectedProgram)!.label }),
      })
      if (!res.ok) throw new Error(`${res.status}`)

      setThinking(false)
      setMessages(prev => [...prev, { id: aId, role: 'assistant', content: '', ts: now() }])

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let full = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        full += decoder.decode(value, { stream: true })
        setMessages(prev => prev.map(m => m.id === aId ? { ...m, content: full } : m))
      }
      const tab = guessTab(full)
      if (tab) {
        setMessages(prev => prev.map(m => m.id === aId ? { ...m, updatesTab: tab } : m))
        onTabSwitch(tab)
      }
    } catch {
      setThinking(false)
      setMessages(prev => [...prev, { id: aId, role: 'assistant', content: 'Connection error — check the API and try again.', ts: now() }])
    }
  }

  return (
    <div style={{ width: 460, flexShrink: 0, display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--border)', overflow: 'hidden', background: 'var(--panel)' }}>
      <div style={{ padding: '14px 18px 10px', flexShrink: 0, borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
          <div style={{ width: 22, height: 22, borderRadius: 7, background: 'linear-gradient(135deg, #1D4ED8, #1e40af)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z"/></svg>
          </div>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Design Brain</span>
          <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 10, background: 'rgba(22,163,74,0.1)', color: 'var(--green)', border: '1px solid rgba(22,163,74,0.22)' }}>● Claude claude-opus-4-5</span>
        </div>
        <p style={{ fontSize: 11, color: 'var(--text3)', lineHeight: 1.5 }}>Turn internal methodologies into assessment drafts for your team.</p>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 18px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {messages.map(msg => (
            msg.role === 'user'
              ? <UserBubble key={msg.id} msg={msg} />
              : <AssistantBubble key={msg.id} msg={msg} onViewTab={onTabSwitch} />
          ))}
          {thinking && <ThinkingBubble />}
          <div ref={bottomRef} />
        </div>
      </div>

      <div style={{ padding: '10px 18px 12px', flexShrink: 0, borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 8 }}>
          {QUICK_ACTIONS.map(qa => (
            <button key={qa.id} onClick={() => send(qa.prompt)} disabled={thinking} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 20, cursor: 'pointer', background: 'var(--surface2)', border: '1px solid var(--border2)', color: 'var(--text2)', whiteSpace: 'nowrap', opacity: thinking ? 0.5 : 1 }}
              onMouseEnter={e => { if (!thinking) { e.currentTarget.style.borderColor = 'rgba(29,78,216,0.4)'; e.currentTarget.style.color = 'var(--text)' } }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.color = 'var(--text2)' }}
            >{qa.label}</button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 11px', borderRadius: 10, background: 'var(--surface2)', border: '1px solid var(--border2)' }}>
          <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) send() }} disabled={thinking}
            placeholder={`Ask about ${PROGRAMS.find(p => p.id === selectedProgram)!.short} assessment…`}
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 13, color: 'var(--text)', opacity: thinking ? 0.5 : 1 }}
          />
          {thinking
            ? <div className="spinner" style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid var(--border2)', borderTopColor: 'var(--accent)', flexShrink: 0 }} />
            : <button onClick={() => send()} disabled={!input.trim()} style={{ width: 28, height: 28, borderRadius: 7, border: 'none', cursor: 'pointer', flexShrink: 0, background: input.trim() ? 'var(--accent)' : 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.1s' }}>
                <Icon d={ic.send} size={13} color={input.trim() ? 'white' : 'var(--text3)'} />
              </button>
          }
        </div>
      </div>
    </div>
  )
}
