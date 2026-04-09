import { NextRequest, NextResponse } from 'next/server'
import { store } from '@/lib/server-store'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const sub = store.get(id)
  if (!sub) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(sub)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  // Support: update totalScore, status, rubric notes on individual responses
  if (body.responseUpdate) {
    store.patchResponse(id, body.responseUpdate.blockId, {
      score: body.responseUpdate.score,
      rubricNotes: body.responseUpdate.rubricNotes,
    })
  } else {
    store.update(id, {
      ...(body.totalScore !== undefined && { totalScore: body.totalScore }),
      ...(body.status && { status: body.status }),
    })
  }
  return NextResponse.json({ ok: true })
}
