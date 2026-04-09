// ─── Program Catalog & Assessment Seeds ──────────────────────────────────────

export interface Program {
  id: string
  name: string
  school: string
  credential: string
  location: string
  duration: string
  category: 'healthcare' | 'tech' | 'skilled-trades' | 'business'
  loanAvailable: boolean
  hasAssessment: boolean
  assessmentId?: string
  gradient: string
  iconPath: string
  description: string
  tuition: string
  livingCosts: string
  intakes: string[]
  pgwpEligible: boolean
  trending?: boolean
}

export const PROGRAMS: Program[] = [
  {
    id: 'prog-001',
    name: 'Practical Nursing',
    school: 'George Brown College',
    credential: 'Ontario College Diploma',
    location: 'Toronto, Ontario',
    duration: '2 years',
    category: 'healthcare',
    loanAvailable: true,
    hasAssessment: true,
    assessmentId: 'mkt-assess-001',
    gradient: 'linear-gradient(145deg, #0891B2 0%, #0C4A6E 100%)',
    iconPath: 'M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18',
    description: 'The Practical Nursing program prepares graduates to provide safe, compassionate, and evidence-based care across diverse healthcare settings including hospitals, long-term care, and community health. You will develop clinical judgment, patient communication, and the technical skills needed for modern nursing practice.',
    tuition: 'CA$8,170 / year',
    livingCosts: 'CA$18,000 / year',
    intakes: ['September 2025', 'January 2026'],
    pgwpEligible: true,
    trending: true,
  },
  {
    id: 'prog-002',
    name: 'Pre-Health Sciences Pathway',
    school: 'Niagara College',
    credential: 'Ontario College Certificate',
    location: 'Welland, Ontario',
    duration: '1 year',
    category: 'healthcare',
    loanAvailable: true,
    hasAssessment: false,
    gradient: 'linear-gradient(145deg, #059669 0%, #065F46 100%)',
    iconPath: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z',
    description: 'Gain the academic foundation needed to enter health science diploma and degree programs. Covers biology, chemistry, anatomy, and academic skills. Ideal for students who need bridging before entering clinical programs.',
    tuition: 'CA$5,840 / year',
    livingCosts: 'CA$14,000 / year',
    intakes: ['September 2025'],
    pgwpEligible: true,
  },
  {
    id: 'prog-003',
    name: 'Early Childhood Education',
    school: 'Humber College',
    credential: 'Ontario College Diploma',
    location: 'Toronto, Ontario',
    duration: '2 years',
    category: 'healthcare',
    loanAvailable: true,
    hasAssessment: true,
    assessmentId: 'mkt-assess-002',
    gradient: 'linear-gradient(145deg, #F59E0B 0%, #92400E 100%)',
    iconPath: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
    description: 'Develop the skills to design and implement developmentally appropriate learning for children from birth to age 12. Graduates work in childcare centres, schools, and family resource programs. High demand across Ontario.',
    tuition: 'CA$7,400 / year',
    livingCosts: 'CA$18,500 / year',
    intakes: ['September 2025', 'January 2026'],
    pgwpEligible: true,
    trending: true,
  },
  {
    id: 'prog-004',
    name: 'Cybersecurity Technician',
    school: 'George Brown College',
    credential: 'Graduate Certificate',
    location: 'Toronto, Ontario',
    duration: '1 year',
    category: 'tech',
    loanAvailable: true,
    hasAssessment: true,
    assessmentId: 'mkt-assess-003',
    gradient: 'linear-gradient(145deg, #4F46E5 0%, #1E1B4B 100%)',
    iconPath: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
    description: 'Develop expertise in network security, ethical hacking, digital forensics, and threat analysis. Graduates work in cybersecurity operations, IT security consulting, and compliance roles. One of the fastest-growing sectors in Canada.',
    tuition: 'CA$9,250 / year',
    livingCosts: 'CA$19,000 / year',
    intakes: ['September 2025'],
    pgwpEligible: true,
    trending: true,
  },
  {
    id: 'prog-005',
    name: 'Computer Programming',
    school: 'Seneca Polytechnic',
    credential: 'Ontario College Diploma',
    location: 'North York, Ontario',
    duration: '3 years',
    category: 'tech',
    loanAvailable: true,
    hasAssessment: false,
    gradient: 'linear-gradient(145deg, #7C3AED 0%, #4C1D95 100%)',
    iconPath: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4',
    description: 'Learn software development, database design, web technologies, and agile methodologies. Graduates work as developers, systems analysts, and software designers across industries. Strong co-op placement record.',
    tuition: 'CA$7,850 / year',
    livingCosts: 'CA$19,000 / year',
    intakes: ['September 2025', 'January 2026'],
    pgwpEligible: true,
  },
  {
    id: 'prog-006',
    name: 'Welding Technician',
    school: 'Niagara College',
    credential: 'Ontario College Diploma',
    location: 'Welland, Ontario',
    duration: '2 years',
    category: 'skilled-trades',
    loanAvailable: true,
    hasAssessment: true,
    assessmentId: 'mkt-assess-001',
    gradient: 'linear-gradient(145deg, #DC2626 0%, #7F1D1D 100%)',
    iconPath: 'M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z',
    description: 'Master shielded metal arc, MIG, TIG, and plasma arc cutting. Hands-on shop training with industry-standard equipment. Graduates enter manufacturing, construction, and industrial fabrication with in-demand skills.',
    tuition: 'CA$6,100 / year',
    livingCosts: 'CA$13,500 / year',
    intakes: ['September 2025'],
    pgwpEligible: true,
    trending: true,
  },
  {
    id: 'prog-007',
    name: 'Carpentry and Renovation Technician',
    school: 'George Brown College',
    credential: 'Ontario College Diploma',
    location: 'Toronto, Ontario',
    duration: '2 years',
    category: 'skilled-trades',
    loanAvailable: false,
    hasAssessment: false,
    gradient: 'linear-gradient(145deg, #92400E 0%, #451A03 100%)',
    iconPath: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
    description: 'Develop hands-on skills in framing, finishing, cabinetry, and renovation. Graduates work with contractors, renovation companies, and residential building firms. Strong demand across Ontario\'s booming construction sector.',
    tuition: 'CA$5,980 / year',
    livingCosts: 'CA$18,000 / year',
    intakes: ['September 2025'],
    pgwpEligible: false,
  },
  {
    id: 'prog-008',
    name: 'Business Administration',
    school: 'Sheridan College',
    credential: 'Ontario College Diploma',
    location: 'Brampton, Ontario',
    duration: '3 years',
    category: 'business',
    loanAvailable: true,
    hasAssessment: true,
    assessmentId: 'mkt-assess-002',
    gradient: 'linear-gradient(145deg, #374151 0%, #111827 100%)',
    iconPath: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    description: 'Build a foundation in accounting, marketing, HR, and operations management. The program includes practical simulations, case studies, and a co-op placement. Graduates pursue careers in finance, consulting, and corporate management.',
    tuition: 'CA$7,200 / year',
    livingCosts: 'CA$17,000 / year',
    intakes: ['September 2025', 'January 2026'],
    pgwpEligible: true,
  },
]

export function getProgramById(id: string): Program | undefined {
  return PROGRAMS.find(p => p.id === id)
}

export function getProgramByAssessmentId(assessmentId: string): Program | undefined {
  return PROGRAMS.find(p => p.assessmentId === assessmentId)
}

export const CATEGORY_CONFIG: { key: string; label: string; description: string }[] = [
  { key: 'trending', label: 'Trending on Passage', description: 'Most popular programs among international students' },
  { key: 'healthcare', label: 'Healthcare & Care Services', description: 'Nursing, health sciences, and patient care' },
  { key: 'tech', label: 'Technology & STEM', description: 'Cybersecurity, programming, and engineering technology' },
  { key: 'skilled-trades', label: 'Skilled Trades', description: 'Practical trade skills Canadian employers need' },
  { key: 'business', label: 'Business & Administration', description: 'Business administration, accounting, and management' },
  { key: 'loan', label: 'Loan Available', description: 'Programs eligible for Passage education financing' },
]

export const SCHOOLS = [
  'George Brown College',
  'Niagara College',
  'Humber College',
  'Seneca Polytechnic',
  'Sheridan College',
  'Vancouver Community College',
  'Douglas College',
  'Bow Valley College',
  'Northern Lights College',
  'Saskatchewan Polytechnic',
]

// ─── Marketplace Assessment Seed Data ────────────────────────────────────────

const MARKETPLACE_ASSESSMENTS = [
  {
    id: 'mkt-assess-001',
    name: 'Nursing & Trades Fit Check',
    programLabel: 'Practical Nursing — George Brown College',
    published: true,
    builderBlocks: [
      {
        id: 'mkt-001-b1',
        type: 'intro',
        cfg: { text: 'Welcome to the Practical Nursing fit assessment. This helps us understand how you communicate, handle pressure, and make decisions in healthcare settings. There are no trick questions — answer honestly and thoughtfully. The assessment takes approximately 15 minutes.' }
      },
      {
        id: 'mkt-001-b2',
        type: 'video',
        cfg: {
          question: 'A patient becomes increasingly agitated because they have been waiting for over two hours and feel ignored by the team. Walk us through how you would approach this situation and the steps you would take to de-escalate.',
          maxDuration: 90,
          attempts: 2,
          note: 'Speak naturally — we are looking for empathy, clarity, and professionalism.'
        }
      },
      {
        id: 'mkt-001-b3',
        type: 'scenario',
        cfg: {
          title: 'Medication Refusal',
          context: 'A patient has been prescribed a new medication but refuses to take it, citing distrust of the healthcare system. The medication is not life-threatening but is important for their long-term recovery. Your supervisor is aware but has left the decision to you.',
          question: 'How do you handle this situation while respecting patient autonomy and your professional responsibility?'
        }
      },
      {
        id: 'mkt-001-b4',
        type: 'multiple-choice',
        cfg: {
          question: 'You have three patients who all need attention simultaneously: one is in pain, one needs a scheduled dressing change, and one is showing early signs of respiratory distress. Who do you prioritize first?',
          options: [
            'The patient in pain — they asked for help first',
            'The patient needing the dressing change — to stay on schedule',
            'The patient showing signs of respiratory distress — most urgent clinical concern',
            'Delegate all three to colleagues while you assess the situation'
          ],
          correct: 2,
          multi: false
        }
      },
    ]
  },
  {
    id: 'mkt-assess-002',
    name: 'ECE & Business Fit Check',
    programLabel: 'Early Childhood Education — Humber College',
    published: true,
    builderBlocks: [
      {
        id: 'mkt-002-b1',
        type: 'intro',
        cfg: { text: 'Welcome to the fit assessment. We want to understand how you approach challenges, support others, and make decisions under pressure. This takes approximately 12 minutes.' }
      },
      {
        id: 'mkt-002-b2',
        type: 'video',
        cfg: {
          question: 'Describe a situation where you supported someone who was struggling — emotionally, in their learning, or with a difficult challenge. What did you do, and what did you learn from the experience?',
          maxDuration: 90,
          attempts: 2,
          note: 'Be specific. We value authentic stories over perfect answers.'
        }
      },
      {
        id: 'mkt-002-b3',
        type: 'open-text',
        cfg: {
          question: 'A child in your care has been withdrawn, tearful, and frequently pushing other children away for three weeks. You have not yet been able to connect with their family. What is your plan of action?',
          wordLimit: 400
        }
      },
      {
        id: 'mkt-002-b4',
        type: 'multiple-choice',
        cfg: {
          question: 'Which approach best supports a child\'s development of independence and confidence?',
          options: [
            'Provide detailed step-by-step instructions for every task',
            'Allow age-appropriate choices and let children experience natural consequences',
            'Praise every action the child takes regardless of the outcome',
            'Set identical expectations for all children to ensure fairness'
          ],
          correct: 1,
          multi: false
        }
      },
    ]
  },
  {
    id: 'mkt-assess-003',
    name: 'Cybersecurity Fit Check',
    programLabel: 'Cybersecurity Technician — George Brown College',
    published: true,
    builderBlocks: [
      {
        id: 'mkt-003-b1',
        type: 'intro',
        cfg: { text: 'Welcome to the Cybersecurity Technician fit assessment. This tests your logical thinking, ethical judgment, and approach to security problems. No technical background is required — we are looking for reasoning ability and integrity. Estimated time: 15 minutes.' }
      },
      {
        id: 'mkt-003-b2',
        type: 'video',
        cfg: {
          question: 'You discover that a colleague has been accessing sensitive company data outside of business hours for reasons that are not clear. You are not their manager. Walk us through exactly what you do next.',
          maxDuration: 90,
          attempts: 2,
          note: 'We are looking for judgment and professional responsibility — not just rules.'
        }
      },
      {
        id: 'mkt-003-b3',
        type: 'scenario',
        cfg: {
          title: 'The Urgent Patch Decision',
          context: 'A critical vulnerability has been found in your organization\'s web application. Patching it requires taking the system offline for 4 hours during peak business hours. Your manager says the business cannot afford downtime and asks you to delay the patch by two weeks.',
          question: 'What do you do? Walk through your reasoning, who you involve, and what your final recommendation is.'
        }
      },
      {
        id: 'mkt-003-b4',
        type: 'multiple-choice',
        cfg: {
          question: 'A user calls your IT helpdesk saying they cannot log in. They claim to be the VP of Finance and sound frustrated. What do you do?',
          options: [
            'Reset the password immediately — you don\'t want to cause problems for a senior executive',
            'Ask for their employee ID and reset the password if it matches',
            'Follow standard identity verification procedure regardless of their seniority, and explain why',
            'Escalate to your manager — you don\'t want to take responsibility for a VP\'s account'
          ],
          correct: 2,
          multi: false
        }
      },
    ]
  },
]

export function seedMarketplaceAssessments(): void {
  if (typeof window === 'undefined') return
  try {
    const stored: { id: string }[] = JSON.parse(localStorage.getItem('pa-assessments') || '[]')
    let changed = false
    for (const assessment of MARKETPLACE_ASSESSMENTS) {
      if (!stored.find(a => a.id === assessment.id)) {
        stored.push(assessment as unknown as { id: string })
        changed = true
      }
    }
    if (changed) localStorage.setItem('pa-assessments', JSON.stringify(stored))
  } catch {
    // ignore
  }
}

// ─── Score computation ────────────────────────────────────────────────────────

interface SubmissionResponse {
  blockId: string
  blockType: string
  textResponse?: string
  videoUrl?: string
  choiceResponse?: number | number[]
}

export function computeFitScore(submissionId: string, responses: SubmissionResponse[]): number {
  const total = responses.length
  if (total === 0) return 71

  const filled = responses.filter(r =>
    (r.textResponse && r.textResponse.trim().length > 15) ||
    r.videoUrl ||
    r.choiceResponse !== undefined
  ).length

  const completeness = filled / total
  const base = Math.round(62 + completeness * 28)

  // Deterministic offset from submission ID (not random per render)
  const idSum = submissionId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const offset = (idSum % 7) - 2

  return Math.min(95, Math.max(60, base + offset))
}

export function getScoreLabel(score: number): { label: string; color: string; bg: string } {
  if (score >= 85) return { label: 'Strong Fit', color: '#065F46', bg: '#D1FAE5' }
  if (score >= 72) return { label: 'Good Fit', color: '#1E40AF', bg: '#DBEAFE' }
  return { label: 'Developing Fit', color: '#92400E', bg: '#FEF3C7' }
}

export const STRENGTHS_BY_CATEGORY: Record<string, string[]> = {
  healthcare: ['Empathy', 'Communication', 'Clinical Judgment', 'Professionalism', 'Adaptability'],
  tech: ['Analytical Thinking', 'Problem Solving', 'Technical Reasoning', 'Integrity', 'Attention to Detail'],
  'skilled-trades': ['Practical Judgment', 'Safety Mindset', 'Work Ethic', 'Attention to Detail', 'Grit'],
  business: ['Communication', 'Professionalism', 'Judgment', 'Adaptability', 'Critical Thinking'],
}
