import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { waitUntil } from '@vercel/functions'
import { v4 as uuidv4 } from 'uuid'
import { authOptions } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { generateReport } from '@/lib/generateReport'

export async function POST(req: NextRequest) {
  // ── Auth check ──────────────────────────────────────────────────────────────
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ── Parse body ──────────────────────────────────────────────────────────────
  let companyName: string
  try {
    const body = await req.json()
    companyName = typeof body.companyName === 'string' ? body.companyName.trim() : ''
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!companyName) {
    return NextResponse.json({ error: 'companyName is required' }, { status: 400 })
  }

  if (companyName.length > 200) {
    return NextResponse.json({ error: 'companyName too long (max 200 chars)' }, { status: 400 })
  }

  // ── Create DB row ───────────────────────────────────────────────────────────
  const id = uuidv4()
  const { error: dbError } = await supabase.from('reports').insert({
    id,
    company_name: companyName,
    status: 'generating',
    progress: 'Starting…',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })

  if (dbError) {
    console.error('[POST /api/generate] DB insert failed:', dbError)
    return NextResponse.json({ error: 'Failed to create report record' }, { status: 500 })
  }

  // ── Fire background job ─────────────────────────────────────────────────────
  // waitUntil() from @vercel/functions tells Vercel to keep the serverless
  // function alive until the promise resolves, even after the HTTP response
  // has been sent. Supports up to 300s on Vercel Pro.
  waitUntil(generateReport(id, companyName))

  // ── Return job ID immediately ────────────────────────────────────────────────
  return NextResponse.json({ id }, { status: 202 })
}
