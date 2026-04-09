import type { Team, PolicyDocument, AssessmentDraft } from '@/types'

class Store {
  private teams: Map<string, Team> = new Map()
  private documents: Map<string, PolicyDocument> = new Map()
  private drafts: Map<string, AssessmentDraft> = new Map()
  private initialized = false

  initialize(data: {
    teams: Team[]
    documents: PolicyDocument[]
    drafts: AssessmentDraft[]
  }) {
    if (this.initialized) return
    data.teams.forEach((t) => this.teams.set(t.id, t))
    data.documents.forEach((d) => this.documents.set(d.id, d))
    data.drafts.forEach((d) => this.drafts.set(d.id, d))
    this.initialized = true
  }

  // Teams
  getTeams(): Team[] {
    return Array.from(this.teams.values())
  }

  getTeam(id: string): Team | undefined {
    return this.teams.get(id)
  }

  // Documents
  getDocumentsByTeam(teamId: string): PolicyDocument[] {
    return Array.from(this.documents.values()).filter(
      (d) => d.team_id === teamId
    )
  }

  getDocument(id: string): PolicyDocument | undefined {
    return this.documents.get(id)
  }

  addDocument(doc: PolicyDocument): void {
    this.documents.set(doc.id, doc)
  }

  // Drafts
  getDraftsByTeam(teamId: string): AssessmentDraft[] {
    return Array.from(this.drafts.values())
      .filter((d) => d.team_id === teamId)
      .sort(
        (a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      )
  }

  getDraft(id: string): AssessmentDraft | undefined {
    return this.drafts.get(id)
  }

  saveDraft(draft: AssessmentDraft): void {
    draft.updated_at = new Date().toISOString()
    this.drafts.set(draft.id, draft)
  }

  updateDraft(id: string, updates: Partial<AssessmentDraft>): AssessmentDraft | undefined {
    const existing = this.drafts.get(id)
    if (!existing) return undefined
    const updated = { ...existing, ...updates, updated_at: new Date().toISOString() }
    this.drafts.set(id, updated)
    return updated
  }

  deleteDraft(id: string): void {
    this.drafts.delete(id)
  }
}

// Singleton
const store = new Store()
export default store
