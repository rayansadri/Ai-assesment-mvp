import { initializeStore } from '@/lib/seed'
import store from '@/lib/store'
import type { NextRequest } from 'next/server'

initializeStore()

export async function GET(request: NextRequest) {
  const teamId = request.nextUrl.searchParams.get('teamId')
  if (!teamId) {
    return Response.json({ error: 'teamId is required' }, { status: 400 })
  }
  const drafts = store.getDraftsByTeam(teamId)
  return Response.json(drafts)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { draft } = body
  if (!draft) {
    return Response.json({ error: 'draft is required' }, { status: 400 })
  }
  store.saveDraft(draft)
  return Response.json({ success: true, draft_id: draft.id })
}
