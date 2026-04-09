import { anthropic, MODEL } from './claude'
import store from './store'
import { generateId } from './utils'
import type { AssessmentDraft, Dimension, IntegrityCheck, Question, ScoringRule } from '@/types'

type ToolInput = Record<string, unknown>

export async function handleToolCall(
  toolName: string,
  toolInput: ToolInput
): Promise<string> {
  try {
    switch (toolName) {
      case 'parse_policy':
        return await parsePolicy(toolInput)
      case 'generate_assessment':
        return await generateAssessment(toolInput)
      case 'improve_questions':
        return await improveQuestions(toolInput)
      case 'generate_scoring':
        return await generateScoring(toolInput)
      case 'generate_integrity_checks':
        return await generateIntegrityChecks(toolInput)
      case 'save_assessment_draft':
        return await saveAssessmentDraft(toolInput)
      case 'load_assessment_draft':
        return await loadAssessmentDraft(toolInput)
      case 'list_team_workspaces':
        return await listTeamWorkspaces(toolInput)
      case 'compare_versions':
        return await compareVersions(toolInput)
      default:
        return JSON.stringify({ error: `Unknown tool: ${toolName}` })
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return JSON.stringify({ error: message })
  }
}

async function parsePolicy(input: ToolInput): Promise<string> {
  const documentId = input.document_id as string
  const focus = input.focus as string | undefined

  const doc = store.getDocument(documentId)
  if (!doc) {
    return JSON.stringify({ error: `Document ${documentId} not found` })
  }

  const focusInstruction = focus ? `Focus specifically on: ${focus}` : ''

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 2048,
    system: `You are an assessment design expert. Extract structured information from policy documents. Return only valid JSON.`,
    messages: [
      {
        role: 'user',
        content: `Parse this policy document and extract key information in JSON format. ${focusInstruction}

Document Title: ${doc.title}
Document Content:
${doc.raw_text}

Return JSON with this structure:
{
  "themes": ["theme1", "theme2"],
  "dimensions": ["dimension1", "dimension2"],
  "evaluation_criteria": ["criterion1", "criterion2"],
  "scoring_signals": ["signal1", "signal2"],
  "integrity_concerns": ["concern1", "concern2"],
  "summary": "brief summary of what this policy is evaluating"
}`,
      },
    ],
  })

  const content = response.content[0]
  if (content.type !== 'text') return JSON.stringify({ error: 'No text response' })

  try {
    const jsonMatch = content.text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      return JSON.stringify({ document_id: documentId, title: doc.title, ...parsed })
    }
  } catch {
    // fall through to return raw
  }

  return JSON.stringify({
    document_id: documentId,
    title: doc.title,
    summary: content.text.slice(0, 500),
  })
}

async function generateAssessment(input: ToolInput): Promise<string> {
  const objective = input.objective as string
  const teamId = input.team_id as string
  const policyIds = (input.policy_ids as string[]) || []
  const focusAreas = (input.focus_areas as string[]) || []
  const title = (input.title as string) || `Assessment — ${new Date().toLocaleDateString()}`

  const team = store.getTeam(teamId)
  const teamDocs = store.getDocumentsByTeam(teamId)
  const referencedDocs = policyIds.length > 0
    ? policyIds.map((id) => store.getDocument(id)).filter(Boolean)
    : teamDocs

  const docContext = referencedDocs
    .map((d) => `## ${d!.title}\n${d!.raw_text.slice(0, 3000)}`)
    .join('\n\n')

  const focusContext = focusAreas.length > 0
    ? `Focus especially on these dimensions: ${focusAreas.join(', ')}.`
    : ''

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 4096,
    system: `You are an expert assessment designer. Generate complete, practical assessment drafts. Return only valid JSON matching the exact schema provided.`,
    messages: [
      {
        role: 'user',
        content: `Generate a complete assessment draft for this objective.

Team: ${team?.name || teamId} — ${team?.description || ''}
Objective: ${objective}
${focusContext}

Policy Documents:
${docContext || 'No specific policy documents provided. Use best practices for the domain.'}

Return JSON exactly matching this schema:
{
  "title": "string",
  "objective": "string",
  "dimensions": [
    {
      "name": "string",
      "description": "string",
      "importance": "high|medium|low",
      "evidence_signals": ["string"]
    }
  ],
  "questions": [
    {
      "id": "string (generate a short unique id like q-1)",
      "text": "string",
      "type": "behavioral|situational|technical|values",
      "dimension": "string (must match a dimension name)",
      "intent": "string",
      "follow_up_notes": "string"
    }
  ],
  "scoring_logic": [
    {
      "dimension": "string",
      "score_1_definition": "string",
      "score_3_definition": "string",
      "score_5_definition": "string",
      "required_evidence": "string"
    }
  ],
  "integrity_checks": [
    {
      "name": "string",
      "description": "string",
      "trigger_condition": "string",
      "response_action": "string"
    }
  ],
  "notes": "string"
}

Requirements:
- 3-5 dimensions
- 2-3 questions per dimension (8-15 total)
- Scoring rubric for each dimension
- 3-5 integrity checks
- Questions must be behavioral, specific, and tied to dimensions`,
      },
    ],
  })

  const content = response.content[0]
  if (content.type !== 'text') return JSON.stringify({ error: 'No text response' })

  try {
    const jsonMatch = content.text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON found')

    const parsed = JSON.parse(jsonMatch[0])
    const draftId = generateId()
    const now = new Date().toISOString()

    const draft: AssessmentDraft = {
      id: draftId,
      team_id: teamId,
      title: parsed.title || title,
      objective: parsed.objective || objective,
      source_policy_ids: policyIds,
      dimensions: parsed.dimensions || [],
      questions: (parsed.questions || []).map((q: Partial<Question>) => ({
        ...q,
        id: q.id || generateId(),
      })),
      scoring_logic: parsed.scoring_logic || [],
      integrity_checks: parsed.integrity_checks || [],
      notes: parsed.notes || '',
      created_at: now,
      updated_at: now,
    }

    store.saveDraft(draft)

    return JSON.stringify({
      success: true,
      draft_id: draftId,
      draft,
      summary: `Generated "${draft.title}" with ${draft.dimensions.length} dimensions, ${draft.questions.length} questions, ${draft.scoring_logic.length} scoring rules, and ${draft.integrity_checks.length} integrity checks.`,
    })
  } catch (err) {
    return JSON.stringify({ error: `Failed to parse generated assessment: ${err}` })
  }
}

async function improveQuestions(input: ToolInput): Promise<string> {
  const draftId = input.draft_id as string
  const dimension = input.dimension as string | undefined
  const feedback = input.feedback as string

  const draft = store.getDraft(draftId)
  if (!draft) return JSON.stringify({ error: `Draft ${draftId} not found` })

  const targetQuestions = dimension
    ? draft.questions.filter((q) => q.dimension === dimension)
    : draft.questions

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 3000,
    system: `You are an expert assessment designer specializing in behavioral interview questions. Improve questions to be more specific, behaviorally anchored, and effective. Return only valid JSON.`,
    messages: [
      {
        role: 'user',
        content: `Improve these interview questions based on this feedback.

Feedback: ${feedback}
${dimension ? `Focus on dimension: ${dimension}` : 'Improve all questions.'}

Current Questions:
${JSON.stringify(targetQuestions, null, 2)}

Assessment Context:
- Objective: ${draft.objective}
- Dimensions: ${draft.dimensions.map((d: Dimension) => d.name).join(', ')}

Return JSON array of improved questions with the same structure:
[
  {
    "id": "string (keep original id)",
    "text": "string (improved question)",
    "type": "behavioral|situational|technical|values",
    "dimension": "string",
    "intent": "string",
    "follow_up_notes": "string"
  }
]`,
      },
    ],
  })

  const content = response.content[0]
  if (content.type !== 'text') return JSON.stringify({ error: 'No text response' })

  try {
    const jsonMatch = content.text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) throw new Error('No JSON array found')

    const improvedQuestions: Question[] = JSON.parse(jsonMatch[0])

    // Merge improved questions back into draft
    const updatedQuestions = draft.questions.map((q) => {
      const improved = improvedQuestions.find((iq) => iq.id === q.id)
      return improved || q
    })

    store.updateDraft(draftId, { questions: updatedQuestions })
    const updatedDraft = store.getDraft(draftId)!

    return JSON.stringify({
      success: true,
      draft_id: draftId,
      draft: updatedDraft,
      improved_count: improvedQuestions.length,
      summary: `Improved ${improvedQuestions.length} question${improvedQuestions.length !== 1 ? 's' : ''}${dimension ? ` for the ${dimension} dimension` : ''}.`,
    })
  } catch (err) {
    return JSON.stringify({ error: `Failed to parse improved questions: ${err}` })
  }
}

async function generateScoring(input: ToolInput): Promise<string> {
  const draftId = input.draft_id as string
  const targetDimensions = (input.dimensions as string[]) || []

  const draft = store.getDraft(draftId)
  if (!draft) return JSON.stringify({ error: `Draft ${draftId} not found` })

  const dims = targetDimensions.length > 0
    ? draft.dimensions.filter((d: Dimension) => targetDimensions.includes(d.name))
    : draft.dimensions

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 3000,
    system: `You are an expert in behavioral assessment and competency-based interviewing. Generate precise, behavioral scoring rubrics. Return only valid JSON.`,
    messages: [
      {
        role: 'user',
        content: `Generate scoring rubrics for these dimensions.

Assessment: ${draft.title}
Objective: ${draft.objective}

Dimensions to score:
${JSON.stringify(dims, null, 2)}

Return JSON array of scoring rules:
[
  {
    "dimension": "string (must match dimension name exactly)",
    "score_1_definition": "string (concrete behavioral description of inadequate performance)",
    "score_3_definition": "string (concrete behavioral description of adequate performance)",
    "score_5_definition": "string (concrete behavioral description of exceptional performance)",
    "required_evidence": "string (what specific evidence is required to score at 5)"
  }
]

Rules:
- Each definition must be behavioral and observable, not a general statement
- Score 1 should describe specific failure modes, not just "does not meet"
- Score 5 should describe behaviors that demonstrate mastery with examples`,
      },
    ],
  })

  const content = response.content[0]
  if (content.type !== 'text') return JSON.stringify({ error: 'No text response' })

  try {
    const jsonMatch = content.text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) throw new Error('No JSON array found')

    const newScoring: ScoringRule[] = JSON.parse(jsonMatch[0])

    // Merge: replace existing scoring for these dimensions, keep others
    const existingScoring = draft.scoring_logic.filter(
      (s: ScoringRule) => !newScoring.find((ns) => ns.dimension === s.dimension)
    )
    const updatedScoring = [...existingScoring, ...newScoring]

    store.updateDraft(draftId, { scoring_logic: updatedScoring })
    const updatedDraft = store.getDraft(draftId)!

    return JSON.stringify({
      success: true,
      draft_id: draftId,
      draft: updatedDraft,
      updated_dimensions: newScoring.map((s) => s.dimension),
      summary: `Generated scoring rubrics for ${newScoring.length} dimension${newScoring.length !== 1 ? 's' : ''}.`,
    })
  } catch (err) {
    return JSON.stringify({ error: `Failed to parse scoring: ${err}` })
  }
}

async function generateIntegrityChecks(input: ToolInput): Promise<string> {
  const draftId = input.draft_id as string
  const context = (input.context as string) || ''

  const draft = store.getDraft(draftId)
  if (!draft) return JSON.stringify({ error: `Draft ${draftId} not found` })

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 2000,
    system: `You are an expert in assessment integrity and anti-gaming. Generate specific, actionable integrity checks. Return only valid JSON.`,
    messages: [
      {
        role: 'user',
        content: `Generate integrity checks for this assessment.

Assessment: ${draft.title}
Objective: ${draft.objective}
${context ? `Direction: ${context}` : ''}

Current Questions:
${draft.questions.map((q: Question) => `- [${q.dimension}] ${q.text}`).join('\n')}

Return JSON array of integrity checks:
[
  {
    "name": "string (short name for this check)",
    "description": "string (what this check is designed to catch)",
    "trigger_condition": "string (specific observable condition that triggers this check)",
    "response_action": "string (specific action the interviewer should take)"
  }
]

Requirements:
- 4-6 integrity checks
- Each check should have a specific, observable trigger — not a generic "if they seem dishonest"
- Response actions should be concrete steps, not generic escalation language
- Cover: fabrication detection, credential verification, attribution inflation, ethical deflection`,
      },
    ],
  })

  const content = response.content[0]
  if (content.type !== 'text') return JSON.stringify({ error: 'No text response' })

  try {
    const jsonMatch = content.text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) throw new Error('No JSON array found')

    const checks: IntegrityCheck[] = JSON.parse(jsonMatch[0])
    store.updateDraft(draftId, { integrity_checks: checks })
    const updatedDraft = store.getDraft(draftId)!

    return JSON.stringify({
      success: true,
      draft_id: draftId,
      draft: updatedDraft,
      summary: `Generated ${checks.length} integrity check${checks.length !== 1 ? 's' : ''}.`,
    })
  } catch (err) {
    return JSON.stringify({ error: `Failed to parse integrity checks: ${err}` })
  }
}

async function saveAssessmentDraft(input: ToolInput): Promise<string> {
  const draftId = input.draft_id as string
  const draft = store.getDraft(draftId)
  if (!draft) return JSON.stringify({ error: `Draft ${draftId} not found` })

  store.saveDraft(draft)
  return JSON.stringify({
    success: true,
    draft_id: draftId,
    draft,
    summary: `Draft "${draft.title}" saved successfully.`,
  })
}

async function loadAssessmentDraft(input: ToolInput): Promise<string> {
  const draftId = input.draft_id as string
  const draft = store.getDraft(draftId)
  if (!draft) return JSON.stringify({ error: `Draft ${draftId} not found` })

  return JSON.stringify({
    success: true,
    draft_id: draftId,
    draft,
    summary: `Loaded draft "${draft.title}".`,
  })
}

async function listTeamWorkspaces(input: ToolInput): Promise<string> {
  const teamId = input.team_id as string
  const drafts = store.getDraftsByTeam(teamId)
  const team = store.getTeam(teamId)

  return JSON.stringify({
    team_id: teamId,
    team_name: team?.name || teamId,
    drafts: drafts.map((d) => ({
      id: d.id,
      title: d.title,
      objective: d.objective,
      updated_at: d.updated_at,
      question_count: d.questions.length,
      dimension_count: d.dimensions.length,
    })),
    total: drafts.length,
  })
}

async function compareVersions(input: ToolInput): Promise<string> {
  const draftIdA = input.draft_id_a as string
  const draftIdB = input.draft_id_b as string

  const draftA = store.getDraft(draftIdA)
  const draftB = store.getDraft(draftIdB)

  if (!draftA) return JSON.stringify({ error: `Draft ${draftIdA} not found` })
  if (!draftB) return JSON.stringify({ error: `Draft ${draftIdB} not found` })

  const changes: string[] = []

  if (draftA.title !== draftB.title) {
    changes.push(`Title: "${draftA.title}" → "${draftB.title}"`)
  }
  if (draftA.objective !== draftB.objective) {
    changes.push(`Objective changed`)
  }
  if (draftA.dimensions.length !== draftB.dimensions.length) {
    changes.push(`Dimensions: ${draftA.dimensions.length} → ${draftB.dimensions.length}`)
  }
  if (draftA.questions.length !== draftB.questions.length) {
    changes.push(`Questions: ${draftA.questions.length} → ${draftB.questions.length}`)
  }
  if (draftA.integrity_checks.length !== draftB.integrity_checks.length) {
    changes.push(
      `Integrity checks: ${draftA.integrity_checks.length} → ${draftB.integrity_checks.length}`
    )
  }

  return JSON.stringify({
    draft_a: { id: draftIdA, title: draftA.title, updated_at: draftA.updated_at },
    draft_b: { id: draftIdB, title: draftB.title, updated_at: draftB.updated_at },
    changes: changes.length > 0 ? changes : ['No structural changes detected'],
    summary: changes.length > 0 ? changes.join('; ') : 'Drafts are structurally identical',
  })
}
