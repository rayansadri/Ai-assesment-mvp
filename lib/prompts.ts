import type { PromptItem } from '@/types'

export const PROMPT_LIBRARY: PromptItem[] = [
  { id: 'p1', category: 'Analysis', text: 'Parse the uploaded policy and identify the top evaluation criteria' },
  { id: 'p2', category: 'Analysis', text: 'What signals from this policy should inform the integrity checks?' },
  { id: 'p3', category: 'Analysis', text: 'Summarize the key dimensions this policy is trying to evaluate' },
  { id: 'p4', category: 'Analysis', text: 'What gaps or ambiguities do you see in this rubric?' },
  { id: 'p5', category: 'Generation', text: 'Generate a complete assessment based on the uploaded policy' },
  { id: 'p6', category: 'Generation', text: 'Generate 3 behavioral questions for each dimension' },
  { id: 'p7', category: 'Generation', text: 'Generate a full scoring rubric with 1, 3, and 5 anchors for each dimension' },
  { id: 'p8', category: 'Generation', text: 'Generate integrity checks and anti-gaming measures for this assessment' },
  { id: 'p9', category: 'Refinement', text: 'Strengthen the integrity checks to catch misrepresentation' },
  { id: 'p10', category: 'Refinement', text: 'Add specific follow-up probe questions to each interview question' },
  { id: 'p11', category: 'Refinement', text: 'Make the scoring rubric more granular and evidence-specific' },
  { id: 'p12', category: 'Refinement', text: 'Rewrite the questions to be more behaviorally anchored' },
]
