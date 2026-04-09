import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

const TMP_DIR = path.join('/tmp', 'pa-media')

const MIME: Record<string, string> = {
  webm: 'video/webm',
  mp4: 'video/mp4',
  mov: 'video/quicktime',
  pdf: 'application/pdf',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ filename: string }> }) {
  const { filename } = await params
  // Sanitize - no path traversal
  const safe = path.basename(filename)
  const filepath = path.join(TMP_DIR, safe)
  if (!existsSync(filepath)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  const ext = safe.split('.').pop() || ''
  const contentType = MIME[ext] || 'application/octet-stream'
  const buffer = await readFile(filepath)
  return new NextResponse(buffer, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
