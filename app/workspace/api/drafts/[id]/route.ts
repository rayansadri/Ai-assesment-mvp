import { initializeStore } from '@/lib/seed'
import store from '@/lib/store'

initializeStore()

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const draft = store.getDraft(id)
  if (!draft) {
    return Response.json({ error: 'Draft not found' }, { status: 404 })
  }
  return Response.json(draft)
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const updates = await request.json()
  const updated = store.updateDraft(id, updates)
  if (!updated) {
    return Response.json({ error: 'Draft not found' }, { status: 404 })
  }
  return Response.json(updated)
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  store.deleteDraft(id)
  return Response.json({ success: true })
}
