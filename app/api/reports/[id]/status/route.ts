import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

interface Params {
  params: { id: string }
}

export async function GET(_req: NextRequest, { params }: Params) {
  // ── Auth check ──────────────────────────────────────────────────────────────
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ── Validate ID format ──────────────────────────────────────────────────────
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(params.id)) {
    return NextResponse.json({ error: 'Invalid report ID' }, { status: 400 })
  }

  // ── Fetch from DB ───────────────────────────────────────────────────────────
  const { data: report, error } = await supabase
    .from('reports')
    .select('id, company_name, status, progress, pptx_url, pdf_url, html_url, error_message, created_at')
    .eq('id', params.id)
    .single()

  if (error || !report) {
    return NextResponse.json({ error: 'Report not found' }, { status: 404 })
  }

  // ── Return status ───────────────────────────────────────────────────────────
  return NextResponse.json(
    {
      id:           report.id,
      companyName:  report.company_name,
      status:       report.status,
      progress:     report.progress,
      pptxUrl:      report.pptx_url,
      pdfUrl:       report.pdf_url,
      htmlUrl:      report.html_url,
      errorMessage: report.error_message,
      createdAt:    report.created_at,
    },
    {
      status: 200,
      headers: {
        // No caching — status pages poll for live updates
        'Cache-Control': 'no-store',
      },
    }
  )
}
