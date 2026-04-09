import { NextRequest, NextResponse } from 'next/server'
import { store, Submission } from '@/lib/server-store'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const sub: Submission = {
      id: body.id || Math.random().toString(36).slice(2, 10),
      assessmentId: body.assessmentId,
      assessmentTitle: body.assessmentTitle || 'Untitled',
      studentName: body.studentName || 'Anonymous',
      studentEmail: body.studentEmail || '',
      programName: body.programName || '',
      startedAt: body.startedAt || new Date().toISOString(),
      submittedAt: body.submittedAt,
      status: body.status || 'submitted',
      totalScore: body.totalScore,
      responses: body.responses || [],
    }
    store.add(sub)
    return NextResponse.json({ ok: true, id: sub.id })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const assessmentId = searchParams.get('assessmentId')
  const subs = assessmentId ? store.getByAssessment(assessmentId) : store.getAll()
  return NextResponse.json({ submissions: subs, total: subs.length })
}
