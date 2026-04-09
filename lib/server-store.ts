import 'server-only'

export type BlockType =
  | 'section' | 'intro' | 'video' | 'multiple-choice' | 'open-text'
  | 'scenario' | 'case-study' | 'document-check' | 'file-upload' | 'scoring-rule'

export interface SubmissionResponse {
  blockId: string
  blockType: BlockType
  blockTitle?: string
  textResponse?: string
  choiceResponse?: number | number[]
  videoUrl?: string
  fileUrl?: string
  score?: number
  rubricNotes?: string
}

export interface Submission {
  id: string
  assessmentId: string
  assessmentTitle: string
  studentName: string
  studentEmail: string
  programName: string
  startedAt: string
  submittedAt?: string
  status: 'in-progress' | 'submitted' | 'reviewed'
  totalScore?: number
  responses: SubmissionResponse[]
}

// Global singleton - persists across requests in same Node.js process
const g = global as typeof global & { _paStore?: Map<string, Submission> }
if (!g._paStore) g._paStore = new Map()

export const store = {
  add(sub: Submission) { g._paStore!.set(sub.id, sub) },
  get(id: string) { return g._paStore!.get(id) },
  getByAssessment(aId: string) {
    return [...g._paStore!.values()]
      .filter(s => s.assessmentId === aId)
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
  },
  getAll() {
    return [...g._paStore!.values()]
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
  },
  update(id: string, patch: Partial<Submission>) {
    const s = g._paStore!.get(id)
    if (s) g._paStore!.set(id, { ...s, ...patch })
  },
  patchResponse(subId: string, blockId: string, patch: Partial<SubmissionResponse>) {
    const s = g._paStore!.get(subId)
    if (!s) return
    const idx = s.responses.findIndex(r => r.blockId === blockId)
    if (idx >= 0) s.responses[idx] = { ...s.responses[idx], ...patch }
    g._paStore!.set(subId, s)
  },
  size() { return g._paStore!.size }
}
