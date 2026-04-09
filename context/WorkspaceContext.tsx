'use client'

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import type { AssessmentDraft, PolicyDocument, Team } from '@/types'

interface WorkspaceState {
  teams: Team[]
  activeTeam: Team | null
  uploadedDocs: PolicyDocument[]
  activeDraft: AssessmentDraft | null
  savedDrafts: AssessmentDraft[]
  isLoadingTeams: boolean
  isLoadingDrafts: boolean
  setActiveTeam: (team: Team | null) => void
  setActiveDraft: (draft: AssessmentDraft | null) => void
  refreshDrafts: () => Promise<void>
  refreshDocs: () => Promise<void>
  addDoc: (doc: PolicyDocument) => void
}

const WorkspaceContext = createContext<WorkspaceState | null>(null)

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [teams, setTeams] = useState<Team[]>([])
  const [activeTeam, setActiveTeamState] = useState<Team | null>(null)
  const [uploadedDocs, setUploadedDocs] = useState<PolicyDocument[]>([])
  const [activeDraft, setActiveDraftState] = useState<AssessmentDraft | null>(null)
  const [savedDrafts, setSavedDrafts] = useState<AssessmentDraft[]>([])
  const [isLoadingTeams, setIsLoadingTeams] = useState(true)
  const [isLoadingDrafts, setIsLoadingDrafts] = useState(false)

  // Load teams on mount
  useEffect(() => {
    fetch('/workspace/api/teams')
      .then((r) => r.json())
      .then((data: Team[]) => {
        setTeams(data)
        // Rehydrate active team from localStorage
        const savedTeamId = localStorage.getItem('passage-active-team')
        if (savedTeamId) {
          const team = data.find((t) => t.id === savedTeamId)
          if (team) setActiveTeamState(team)
        }
      })
      .catch(console.error)
      .finally(() => setIsLoadingTeams(false))
  }, [])

  const refreshDrafts = useCallback(async () => {
    if (!activeTeam) return
    setIsLoadingDrafts(true)
    try {
      const res = await fetch(`/workspace/api/drafts?teamId=${activeTeam.id}`)
      const data: AssessmentDraft[] = await res.json()
      setSavedDrafts(data)
      // Rehydrate active draft from localStorage
      const savedDraftId = localStorage.getItem('passage-active-draft')
      if (savedDraftId) {
        const draft = data.find((d) => d.id === savedDraftId)
        if (draft) setActiveDraftState(draft)
      } else if (data.length > 0 && !activeDraft) {
        // Auto-select most recent draft
        setActiveDraftState(data[0])
      }
    } catch (err) {
      console.error('Failed to load drafts:', err)
    } finally {
      setIsLoadingDrafts(false)
    }
  }, [activeTeam, activeDraft])

  const refreshDocs = useCallback(async () => {
    if (!activeTeam) return
    try {
      const res = await fetch(`/workspace/api/upload?teamId=${activeTeam.id}`)
      const data: PolicyDocument[] = await res.json()
      setUploadedDocs(data)
    } catch (err) {
      console.error('Failed to load docs:', err)
    }
  }, [activeTeam])

  // Load drafts and docs when team changes
  useEffect(() => {
    if (activeTeam) {
      setActiveDraftState(null)
      setSavedDrafts([])
      setUploadedDocs([])
      refreshDrafts()
      refreshDocs()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTeam?.id])

  const setActiveTeam = useCallback((team: Team | null) => {
    setActiveTeamState(team)
    if (team) {
      localStorage.setItem('passage-active-team', team.id)
    } else {
      localStorage.removeItem('passage-active-team')
    }
  }, [])

  const setActiveDraft = useCallback((draft: AssessmentDraft | null) => {
    setActiveDraftState(draft)
    if (draft) {
      localStorage.setItem('passage-active-draft', draft.id)
      // Also update savedDrafts list
      setSavedDrafts((prev) => {
        const exists = prev.find((d) => d.id === draft.id)
        if (exists) {
          return prev.map((d) => (d.id === draft.id ? draft : d))
        }
        return [draft, ...prev]
      })
    } else {
      localStorage.removeItem('passage-active-draft')
    }
  }, [])

  const addDoc = useCallback((doc: PolicyDocument) => {
    setUploadedDocs((prev) => [...prev, doc])
  }, [])

  return (
    <WorkspaceContext.Provider
      value={{
        teams,
        activeTeam,
        uploadedDocs,
        activeDraft,
        savedDrafts,
        isLoadingTeams,
        isLoadingDrafts,
        setActiveTeam,
        setActiveDraft,
        refreshDrafts,
        refreshDocs,
        addDoc,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  )
}

export function useWorkspace(): WorkspaceState {
  const ctx = useContext(WorkspaceContext)
  if (!ctx) throw new Error('useWorkspace must be used within WorkspaceProvider')
  return ctx
}
