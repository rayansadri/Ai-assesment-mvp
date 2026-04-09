import 'server-only'
import fs from 'fs'
import path from 'path'
import store from './store'
import type { AssessmentDraft, PolicyDocument, Team } from '@/types'

function readSeedFile(filename: string): string {
  try {
    return fs.readFileSync(
      path.join(process.cwd(), 'data', 'seed', filename),
      'utf-8'
    )
  } catch {
    return ''
  }
}

const teams: Team[] = JSON.parse(readSeedFile('teams.json') || '[]')

const financePolicy = readSeedFile('finance-policy.txt')
const admissionsPolicy = readSeedFile('admissions-policy.txt')
const healthcarePolicy = readSeedFile('healthcare-policy.txt')

const documents: PolicyDocument[] = [
  {
    id: 'doc-finance-1',
    team_id: 'team-finance',
    title: 'IB Analyst Hiring Rubric',
    raw_text: financePolicy,
    uploaded_at: '2026-03-15T09:00:00.000Z',
  },
  {
    id: 'doc-admissions-1',
    team_id: 'team-admissions',
    title: 'MBA Admissions Evaluation Rubric',
    raw_text: admissionsPolicy,
    uploaded_at: '2026-03-18T10:30:00.000Z',
  },
  {
    id: 'doc-healthcare-1',
    team_id: 'team-healthcare',
    title: 'Clinical Nursing Hiring Rubric',
    raw_text: healthcarePolicy,
    uploaded_at: '2026-03-20T14:00:00.000Z',
  },
]

const drafts: AssessmentDraft[] = [
  {
    id: 'draft-finance-1',
    team_id: 'team-finance',
    title: 'Analyst Interview Assessment',
    objective:
      'Evaluate candidates for investment banking analyst roles across technical, communication, and integrity dimensions',
    source_policy_ids: ['doc-finance-1'],
    dimensions: [
      {
        name: 'Technical Aptitude',
        description: 'Financial modeling proficiency and analytical accuracy',
        importance: 'high',
        evidence_signals: [
          'Can build a three-statement model from scratch',
          'Identifies errors in financial statements independently',
          'Explains DCF assumptions clearly',
          'Handles quantitative edge cases without prompting',
        ],
      },
      {
        name: 'Communication',
        description: 'Clarity and precision in written and verbal communication',
        importance: 'high',
        evidence_signals: [
          'Explains complex topics to non-technical audiences',
          'Uses direct, specific language',
          'Structures answers with a clear beginning, middle, end',
          'Avoids excessive filler language',
        ],
      },
      {
        name: 'Client Orientation',
        description: 'Ability to understand and prioritize client needs',
        importance: 'medium',
        evidence_signals: [
          'Demonstrates empathy with client perspective',
          'Adapts communication style to audience',
          'Shows awareness of business context beyond the numbers',
        ],
      },
      {
        name: 'Integrity',
        description: 'Ethical judgment and professional accountability',
        importance: 'high',
        evidence_signals: [
          'Addresses ethical dilemmas directly and specifically',
          'Does not deflect responsibility',
          'Timeline and credentials are internally consistent',
          'Escalates appropriately under pressure',
        ],
      },
    ],
    questions: [
      {
        id: 'q-fin-1',
        text: 'Walk me through how you would build a DCF model for a company with negative near-term cash flows. What assumptions matter most?',
        type: 'technical',
        dimension: 'Technical Aptitude',
        intent: 'Assess depth of financial modeling knowledge and assumption clarity',
        follow_up_notes: 'Probe: How do you handle the terminal value when the business is unprofitable today?',
      },
      {
        id: 'q-fin-2',
        text: 'Describe a time you found a material error in financial analysis. How did you catch it and what did you do?',
        type: 'behavioral',
        dimension: 'Technical Aptitude',
        intent: 'Assess attention to detail and error-correction behavior under pressure',
        follow_up_notes: 'Probe: What was the downstream impact and how did you communicate the error?',
      },
      {
        id: 'q-fin-3',
        text: 'Tell me about a time you had to explain a complex financial concept to a client or stakeholder with no finance background.',
        type: 'behavioral',
        dimension: 'Communication',
        intent: 'Assess ability to adapt communication for non-expert audiences',
        follow_up_notes: 'Probe: How did you know they understood? What adjustments did you make?',
      },
      {
        id: 'q-fin-4',
        text: 'You are preparing a pitch book due in 6 hours. Your VP asks you to present assumptions you believe are too optimistic. What do you do?',
        type: 'situational',
        dimension: 'Integrity',
        intent: 'Assess ethical judgment under authority pressure and time constraints',
        follow_up_notes: 'Probe: Have you actually faced something like this? What happened?',
      },
      {
        id: 'q-fin-5',
        text: 'Describe the most demanding multi-deliverable period in your professional experience. How did you manage your output quality?',
        type: 'behavioral',
        dimension: 'Technical Aptitude',
        intent: 'Assess work ethic and resilience under sustained pressure',
        follow_up_notes: 'Probe: What specifically did you sacrifice and what did you protect?',
      },
    ],
    scoring_logic: [
      {
        dimension: 'Technical Aptitude',
        score_1_definition: 'Cannot construct or explain financial models. Makes basic arithmetic errors. Cannot identify issues in provided statements.',
        score_3_definition: 'Demonstrates standard modeling skills with some prompting. Can complete a DCF but misses nuance on assumptions.',
        score_5_definition: 'Builds models fluidly, articulates assumptions, catches errors independently, and explains underlying business logic.',
        required_evidence: 'Specific model examples with named companies or transactions',
      },
      {
        dimension: 'Communication',
        score_1_definition: 'Unclear, disorganized, or overly technical. Cannot adapt to audience. Heavy use of jargon without explanation.',
        score_3_definition: 'Adequately clear for most situations. Some reliance on buzzwords. Moderate ability to simplify.',
        score_5_definition: 'Concise, precise, and adaptable. Structures complex explanations intuitively. Strong written and verbal presence.',
        required_evidence: 'Observed during interview; can also reference specific examples of client-facing communication',
      },
      {
        dimension: 'Integrity',
        score_1_definition: 'Avoids ethical questions, gives vague answers, or shows willingness to misrepresent data under pressure.',
        score_3_definition: 'Recognizes ethical obligations but hesitates or gives formulaic answers without specificity.',
        score_5_definition: 'Directly addresses ethical dilemmas with specific examples. Demonstrates principled behavior under real pressure.',
        required_evidence: 'Specific past incident; situational answer must include what candidate actually did, not just what they would do',
      },
    ],
    integrity_checks: [
      {
        name: 'Deal Credit Inflation',
        description: 'Candidate claims primary responsibility for deals beyond their level',
        trigger_condition: 'Candidate uses "I" language for transactions unlikely for their role or seniority',
        response_action: 'Ask for specific contribution, what their team did separately, and who could corroborate',
      },
      {
        name: 'Credential Verification',
        description: 'Stated credentials or timeline inconsistency',
        trigger_condition: 'Dates, titles, or institutions on resume do not match interview narrative',
        response_action: 'Flag for background check. Do not hire before verification.',
      },
      {
        name: 'Ethical Deflection',
        description: 'Candidate gives generic or rehearsed ethics answers',
        trigger_condition: 'Answer contains no specific incident, only what candidate "would" do hypothetically',
        response_action: 'Press for a real example. If none exists, score integrity dimension at 2 or below.',
      },
    ],
    notes: 'Priority hire window closes end of Q2. Coordinate with campus recruiting. All scorecards must be submitted within 24 hours of interview.',
    created_at: '2026-03-20T08:00:00.000Z',
    updated_at: '2026-04-01T15:30:00.000Z',
  },
  {
    id: 'draft-admissions-1',
    team_id: 'team-admissions',
    title: 'MBA Applicant Interview Guide',
    objective:
      'Evaluate MBA applicants across academic readiness, leadership potential, and program fit',
    source_policy_ids: ['doc-admissions-1'],
    dimensions: [
      {
        name: 'Academic Readiness',
        description: 'Quantitative proficiency and intellectual capacity for rigorous coursework',
        importance: 'high',
        evidence_signals: [
          'Demonstrates comfort with quantitative reasoning',
          'Can learn new frameworks quickly',
          'Shows curiosity about ideas outside their domain',
        ],
      },
      {
        name: 'Leadership Potential',
        description: 'Demonstrated influence and ability to drive outcomes through others',
        importance: 'high',
        evidence_signals: [
          'Describes specific situations where they led (not just participated)',
          'Shows how they navigated disagreement or resistance',
          'Built something new or changed an existing system',
        ],
      },
      {
        name: 'Program Fit',
        description: 'Specific alignment between candidate goals and program offerings',
        importance: 'medium',
        evidence_signals: [
          'References specific courses, faculty, or clubs',
          'Can articulate what they want to achieve and why now',
          'Goals are realistic and well-reasoned',
        ],
      },
    ],
    questions: [
      {
        id: 'q-adm-1',
        text: 'Describe a situation where you had to learn something technically complex in a short period of time. How did you approach it?',
        type: 'behavioral',
        dimension: 'Academic Readiness',
        intent: 'Assess learning agility and approach to intellectual challenge',
        follow_up_notes: 'Probe: What did you specifically find hardest and how did you resolve it?',
      },
      {
        id: 'q-adm-2',
        text: 'Tell me about a time you led a team through disagreement. What was the outcome?',
        type: 'behavioral',
        dimension: 'Leadership Potential',
        intent: 'Assess conflict navigation and leadership style under pressure',
        follow_up_notes: 'Probe: What would the dissenting person say about how it was handled?',
      },
      {
        id: 'q-adm-3',
        text: 'Why this program specifically, and why now in your career?',
        type: 'situational',
        dimension: 'Program Fit',
        intent: 'Assess specificity of goals and quality of program research',
        follow_up_notes: 'Probe: What other programs did you consider and why did you choose this one?',
      },
      {
        id: 'q-adm-4',
        text: 'What is the most significant thing you have built or changed in your professional life so far?',
        type: 'behavioral',
        dimension: 'Leadership Potential',
        intent: 'Assess ambition, execution, and ownership of outcomes',
        follow_up_notes: 'Probe: What specifically did you build that would not have existed without you?',
      },
    ],
    scoring_logic: [
      {
        dimension: 'Academic Readiness',
        score_1_definition: 'Cannot demonstrate quantitative reasoning. No evidence of learning agility or intellectual curiosity.',
        score_3_definition: 'Shows adequate readiness for coursework. Some evidence of learning new skills, but not self-directed.',
        score_5_definition: 'Strong intellectual curiosity, clear quantitative comfort, and evidence of accelerated self-directed learning.',
        required_evidence: 'Specific learning episode with named subject matter and method',
      },
      {
        dimension: 'Leadership Potential',
        score_1_definition: 'Describes participation but not leadership. Uses "we" throughout without individual contribution.',
        score_3_definition: 'Shows some leadership with moderate specificity. Led a team but without significant challenge or learning.',
        score_5_definition: 'Led through real adversity, drove specific outcomes, and can articulate individual contribution vs. team contribution.',
        required_evidence: 'Named team, project, or initiative with verifiable details',
      },
      {
        dimension: 'Program Fit',
        score_1_definition: 'Generic answers about network and brand. No research into program specifics.',
        score_3_definition: 'References program broadly. Goals are reasonable but vague.',
        score_5_definition: 'Specific course names, faculty, or concentrations mentioned. Goals connect to program in a compelling and differentiated way.',
        required_evidence: 'At least two specific program references that are accurate',
      },
    ],
    integrity_checks: [
      {
        name: 'Contribution Fabrication',
        description: 'Candidate inflates their individual role in team outcomes',
        trigger_condition: 'Story changes between written materials and interview narrative',
        response_action: 'Note discrepancy in scorecard. Ask for alternate example with same dimension.',
      },
      {
        name: 'Research Depth Check',
        description: 'Candidate claims program fit without evidence of research',
        trigger_condition: 'Cannot name specific courses, faculty, or clubs when asked',
        response_action: 'Lower program fit score to 2. Note in assessment notes.',
      },
    ],
    notes: 'Round 2 interviews. All scorecards reviewed by admissions committee on rolling basis.',
    created_at: '2026-03-22T10:00:00.000Z',
    updated_at: '2026-04-02T11:00:00.000Z',
  },
  {
    id: 'draft-healthcare-1',
    team_id: 'team-healthcare',
    title: 'Clinical Nursing Assessment',
    objective:
      'Evaluate clinical nursing candidates for patient safety mindset, clinical competency, and communication under pressure',
    source_policy_ids: ['doc-healthcare-1'],
    dimensions: [
      {
        name: 'Clinical Competency',
        description: 'Accurate clinical knowledge and procedure execution',
        importance: 'high',
        evidence_signals: [
          'Can articulate clinical rationale, not just procedure steps',
          'Describes specific protocols by name',
          'Identifies error-prone situations proactively',
        ],
      },
      {
        name: 'Patient Safety Mindset',
        description: 'Default orientation toward safety in all clinical decisions',
        importance: 'high',
        evidence_signals: [
          'Escalates safety concerns regardless of hierarchy',
          'Does not accept workarounds as standard practice',
          'Describes specific safety incidents with clear action taken',
        ],
      },
      {
        name: 'Communication',
        description: 'Clarity and accuracy in interdisciplinary clinical communication',
        importance: 'high',
        evidence_signals: [
          'Uses SBAR or structured communication formats',
          'Demonstrates active listening under pressure',
          'Escalates clearly and without ambiguity',
        ],
      },
      {
        name: 'Resilience',
        description: 'Sustained composure and quality of care under emotional and physical stress',
        importance: 'medium',
        evidence_signals: [
          'Has specific coping strategies, not vague claims',
          'Continues functioning effectively after adverse events',
          'Reflects on impact without avoidance',
        ],
      },
    ],
    questions: [
      {
        id: 'q-hc-1',
        text: 'Describe a patient safety concern you identified that others had missed. What did you do and what was the outcome?',
        type: 'behavioral',
        dimension: 'Patient Safety Mindset',
        intent: 'Assess proactive safety identification and escalation behavior',
        follow_up_notes: 'Probe: What made you the one to catch it? What happened after you raised it?',
      },
      {
        id: 'q-hc-2',
        text: 'Walk me through your process for a medication administration check. What do you do specifically?',
        type: 'technical',
        dimension: 'Clinical Competency',
        intent: 'Assess clinical protocol knowledge and accuracy',
        follow_up_notes: 'Probe: What do you do when a patient questions the medication you are giving?',
      },
      {
        id: 'q-hc-3',
        text: 'Tell me about a situation where you had to communicate a critical finding to a physician who was dismissive. How did you handle it?',
        type: 'behavioral',
        dimension: 'Communication',
        intent: 'Assess assertiveness and escalation under authority pressure',
        follow_up_notes: 'Probe: What would you do if the same physician dismissed you again?',
      },
      {
        id: 'q-hc-4',
        text: 'Describe the most emotionally difficult clinical situation you have experienced. How did you get through it and continue providing care?',
        type: 'behavioral',
        dimension: 'Resilience',
        intent: 'Assess emotional resilience and coping strategies',
        follow_up_notes: 'Probe: What do you do after a hard shift before your next one?',
      },
      {
        id: 'q-hc-5',
        text: 'Describe a clinical error you made or witnessed. What happened and what did you do?',
        type: 'behavioral',
        dimension: 'Patient Safety Mindset',
        intent: 'Assess accountability and disclosure behavior',
        follow_up_notes: 'Probe: Was the error reported? What did you learn from it?',
      },
    ],
    scoring_logic: [
      {
        dimension: 'Clinical Competency',
        score_1_definition: 'Cannot articulate clinical rationale. Describes procedures at surface level or incorrectly.',
        score_3_definition: 'Accurate on standard procedures. Can explain rationale with prompting. Some gaps for complex scenarios.',
        score_5_definition: 'Fluent in clinical rationale. Proactively identifies complications and edge cases. Teaches others naturally.',
        required_evidence: 'Specific protocol or procedure name with step-by-step description',
      },
      {
        dimension: 'Patient Safety Mindset',
        score_1_definition: 'Describes workarounds as acceptable. Does not escalate safety concerns. Cannot provide specific safety example.',
        score_3_definition: 'Recognizes safety concerns and generally escalates. May defer to hierarchy in ambiguous cases.',
        score_5_definition: 'Escalates all safety concerns regardless of pressure. Has specific examples of catching missed risks and improving systems.',
        required_evidence: 'Named safety incident with specific action taken and outcome',
      },
      {
        dimension: 'Resilience',
        score_1_definition: 'No coping strategies. Avoids discussing emotional impact. Shows signs of burnout without self-awareness.',
        score_3_definition: 'Has some coping strategies. Can continue functioning after adverse events but may carry unresolved stress.',
        score_5_definition: 'Specific, healthy coping practices. Reflects openly on impact. Continues to perform at high level through sustained stress.',
        required_evidence: 'Specific example of adverse event + what they did afterward',
      },
    ],
    integrity_checks: [
      {
        name: 'Error Denial Pattern',
        description: 'Candidate claims to have never made a clinical error',
        trigger_condition: 'When asked Q5, candidate states they cannot recall an error',
        response_action: 'Score accountability at 1. Note in assessment. Candidates with no error history at scale are implausible.',
      },
      {
        name: 'Safety Protocol Evasion',
        description: 'Candidate describes skipping safety steps for efficiency',
        trigger_condition: 'Candidate references bypassing checklists or verification steps in Q2',
        response_action: 'Disqualify or escalate to clinical leadership for review.',
      },
      {
        name: 'Escalation Avoidance',
        description: 'Candidate does not escalate safety concerns due to hierarchy',
        trigger_condition: 'In Q3, candidate says they would defer to physician even if concern persists',
        response_action: 'Score patient safety mindset at 2 or below. Flag for committee review.',
      },
    ],
    notes: 'Prioritize candidates with ICU or ED experience for current openings. Coordinate with clinical education on onboarding timeline.',
    created_at: '2026-03-25T08:00:00.000Z',
    updated_at: '2026-04-03T09:45:00.000Z',
  },
]

export function initializeStore() {
  store.initialize({ teams, documents, drafts })
}
