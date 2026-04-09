export interface Team {
  id: string
  name: string
  description: string
  domain: string
}

export interface PolicyDocument {
  id: string
  team_id: string
  title: string
  raw_text: string
  uploaded_at: string
}

export interface Dimension {
  name: string
  description: string
  importance: 'high' | 'medium' | 'low'
  evidence_signals: string[]
}

export interface Question {
  id: string
  text: string
  type: 'behavioral' | 'situational' | 'technical' | 'values'
  dimension: string
  intent: string
  follow_up_notes: string
}

export interface ScoringRule {
  dimension: string
  score_1_definition: string
  score_3_definition: string
  score_5_definition: string
  required_evidence: string
}

export interface IntegrityCheck {
  name: string
  description: string
  trigger_condition: string
  response_action: string
}

export interface AssessmentDraft {
  id: string
  team_id: string
  title: string
  objective: string
  source_policy_ids: string[]
  dimensions: Dimension[]
  questions: Question[]
  scoring_logic: ScoringRule[]
  integrity_checks: IntegrityCheck[]
  notes: string
  created_at: string
  updated_at: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'tool'
  content: string
  toolName?: string
  toolStatus?: 'running' | 'done' | 'error'
  toolSummary?: string
  timestamp: string
}

export interface PromptItem {
  id: string
  category: 'Analysis' | 'Generation' | 'Refinement'
  text: string
}

export interface DraftVersion {
  draft_id: string
  timestamp: string
  changes: string[]
}
