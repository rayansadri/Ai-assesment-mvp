export type ModuleCategory = 'Cognitive' | 'Soft Skills' | 'Case Study' | 'Technical' | 'Administrative' | 'Ethical Reasoning'

export interface AssessmentModule {
  id: string
  name: string
  category: ModuleCategory
  description: string
  duration: string    // e.g. "10–15 min"
  format: string      // e.g. "Video Response", "Multiple Choice"
  isPremium?: boolean
  icon: 'video' | 'text' | 'scenario' | 'mc' | 'doc' | 'code' | 'collab' | 'analytics'
}

export const MODULES: AssessmentModule[] = [
  {
    id: 'mod-video-comm',
    name: 'Video Response: Communication Skills',
    category: 'Soft Skills',
    description: 'Capture authentic non-verbal cues and articulation abilities through an AI-analyzed video prompt focusing on professional presence.',
    duration: '8–12 min',
    format: 'Video Response',
    icon: 'video',
  },
  {
    id: 'mod-ethical-reasoning',
    name: 'Open Text: Ethical Reasoning',
    category: 'Ethical Reasoning',
    description: 'Evaluate deep-thought processing and moral judgment through open-ended essay responses to complex professional dilemmas.',
    duration: '15–20 min',
    format: 'Open Text',
    icon: 'text',
  },
  {
    id: 'mod-scenario-pressure',
    name: 'Scenario: High-Pressure Decision Making',
    category: 'Case Study',
    description: 'A branching narrative experience that tests the candidate\'s ability to prioritize resources under simulated crisis conditions.',
    duration: '20–25 min',
    format: 'Scenario Simulation',
    isPremium: true,
    icon: 'scenario',
  },
  {
    id: 'mod-mc-logic',
    name: 'Multiple Choice: Logic & Reasoning',
    category: 'Cognitive',
    description: 'Standardized assessments for analytical thinking, pattern recognition, and quantitative problem-solving skills.',
    duration: '12–18 min',
    format: 'Multiple Choice',
    icon: 'mc',
  },
  {
    id: 'mod-doc-verify',
    name: 'Document Verification: Credential Check',
    category: 'Administrative',
    description: 'Automated workflow for candidates to upload and verify educational certificates, professional licenses, and identity proofs.',
    duration: '5–10 min',
    format: 'Document Upload',
    icon: 'doc',
  },
  {
    id: 'mod-tech-coding',
    name: 'Technical: Coding Challenge',
    category: 'Technical',
    description: 'Live coding environment with language-specific challenges. Evaluates problem-solving approach, code quality, and efficiency.',
    duration: '30–45 min',
    format: 'Live Coding',
    isPremium: true,
    icon: 'code',
  },
  {
    id: 'mod-collab-group',
    name: 'Collaborative: Group Problem Solving',
    category: 'Soft Skills',
    description: 'Asynchronous group discussion module that evaluates teamwork, active listening, and leadership potential under ambiguity.',
    duration: '20–30 min',
    format: 'Group Discussion',
    isPremium: true,
    icon: 'collab',
  },
  {
    id: 'mod-mc-verbal',
    name: 'Multiple Choice: Verbal Comprehension',
    category: 'Cognitive',
    description: 'Reading comprehension and language processing assessments calibrated for professional-level written communication requirements.',
    duration: '10–15 min',
    format: 'Multiple Choice',
    icon: 'mc',
  },
  {
    id: 'mod-case-business',
    name: 'Case Study: Business Analysis',
    category: 'Case Study',
    description: 'Present a real-world business scenario with data sets. Candidates provide structured written analysis and recommendations.',
    duration: '25–35 min',
    format: 'Written Analysis',
    icon: 'text',
  },
  {
    id: 'mod-video-situational',
    name: 'Video Response: Situational Judgement',
    category: 'Soft Skills',
    description: 'Candidates respond to recorded workplace situations via video, demonstrating judgment, professionalism, and interpersonal awareness.',
    duration: '10–15 min',
    format: 'Video Response',
    icon: 'video',
  },
  {
    id: 'mod-analytics-data',
    name: 'Technical: Data Interpretation',
    category: 'Technical',
    description: 'Evaluate data literacy and analytical reasoning using real-world datasets. Tests chart reading, trend identification, and inference.',
    duration: '15–20 min',
    format: 'Interactive Charts',
    icon: 'analytics',
  },
  {
    id: 'mod-opentext-motivation',
    name: 'Open Text: Motivation & Fit',
    category: 'Ethical Reasoning',
    description: 'Structured open-ended questions assessing alignment with program goals, personal motivation, and long-term career intent.',
    duration: '10–15 min',
    format: 'Open Text',
    icon: 'text',
  },
]

export const CATEGORIES: ModuleCategory[] = ['Cognitive', 'Soft Skills', 'Case Study', 'Technical', 'Administrative', 'Ethical Reasoning']

export const CATEGORY_COLORS: Record<ModuleCategory, { bg: string; text: string }> = {
  'Cognitive':        { bg: 'var(--accent-light2)', text: 'var(--accent)' },
  'Soft Skills':      { bg: 'var(--green-bg)',       text: 'var(--green)' },
  'Case Study':       { bg: 'var(--amber-bg)',        text: 'var(--amber)' },
  'Technical':        { bg: 'var(--purple-bg)',       text: 'var(--purple)' },
  'Administrative':   { bg: 'var(--teal-bg)',         text: 'var(--teal)' },
  'Ethical Reasoning':{ bg: '#FDF2F8',                text: '#9D174D' },
}
