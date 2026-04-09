import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

const TMP_DIR = path.join('/tmp', 'pa-media')

export async function POST(req: NextRequest) {
  try {
    if (!existsSync(TMP_DIR)) {
      await mkdir(TMP_DIR, { recursive: true })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

    const ext = file.name.split('.').pop() || 'webm'
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
    const filepath = path.join(TMP_DIR, filename)

    const arrayBuffer = await file.arrayBuffer()
    await writeFile(filepath, Buffer.from(arrayBuffer))

    return NextResponse.json({ ok: true, url: `/api/media/${filename}`, filename })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
