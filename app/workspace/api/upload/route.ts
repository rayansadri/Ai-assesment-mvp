import { initializeStore } from '@/lib/seed'
import store from '@/lib/store'
import { generateId } from '@/lib/utils'
import type { PolicyDocument } from '@/types'

initializeStore()

export async function GET(request: Request) {
  const url = new URL(request.url)
  const teamId = url.searchParams.get('teamId')
  if (!teamId) {
    return Response.json({ error: 'teamId is required' }, { status: 400 })
  }
  const docs = store.getDocumentsByTeam(teamId)
  return Response.json(docs)
}

export async function POST(request: Request) {
  const formData = await request.formData()
  const file = formData.get('file') as File | null
  const teamId = formData.get('teamId') as string | null

  if (!file || !teamId) {
    return Response.json({ error: 'file and teamId are required' }, { status: 400 })
  }

  const rawText = await file.text()
  const id = generateId()
  const now = new Date().toISOString()

  const doc: PolicyDocument = {
    id,
    team_id: teamId,
    title: file.name.replace(/\.[^/.]+$/, ''), // strip extension
    raw_text: rawText,
    uploaded_at: now,
  }

  store.addDocument(doc)

  return Response.json({
    success: true,
    document: {
      id: doc.id,
      title: doc.title,
      team_id: doc.team_id,
      uploaded_at: doc.uploaded_at,
      preview: rawText.slice(0, 200),
    },
  })
}
