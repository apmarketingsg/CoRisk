import { notFound } from 'next/navigation'
import Link from 'next/link'
import DownloadButtons from '@/components/DownloadButtons'
import { supabase } from '@/lib/supabase'

interface Props {
  params: { id: string }
}

export default async function ReportPage({ params }: Props) {
  const { data: report, error } = await supabase
    .from('reports')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !report) notFound()

  if (report.status === 'generating') {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-[#9CA3AF] mb-4">Report is still generating…</p>
          <Link href={`/reports/${params.id}/status`} className="btn-primary">
            View progress
          </Link>
        </div>
      </div>
    )
  }

  if (report.status === 'failed') {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-red-400 mb-2 font-medium">Generation failed</p>
          <p className="text-[#9CA3AF] text-sm mb-6">{report.error_message || 'Unknown error'}</p>
          <Link href="/" className="btn-primary">Try again</Link>
        </div>
      </div>
    )
  }

  const generatedDate = new Date(report.created_at).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <div className="min-h-[calc(100vh-4rem)] px-6 py-10">
      <div className="max-w-7xl mx-auto">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-[#4B5563] mb-8">
          <Link href="/dashboard" className="hover:text-[#9CA3AF] transition-colors">Dashboard</Link>
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-[#9CA3AF] truncate max-w-xs">{report.company_name}</span>
        </div>

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="status-badge-complete">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                Complete
              </span>
              <span className="text-xs text-[#4B5563]">{generatedDate}</span>
            </div>
            <h1 className="text-3xl font-bold text-white">{report.company_name}</h1>
            <p className="text-[#9CA3AF] mt-1.5">Insurance Pitch Deck · 16 slides</p>
          </div>

          {/* Downloads */}
          <div className="flex-shrink-0">
            <DownloadButtons
              pptxUrl={report.pptx_url}
              pdfUrl={report.pdf_url}
              companyName={report.company_name}
            />
          </div>
        </div>

        {/* HTML Preview */}
        <div className="bg-[#111827] border border-[#1E2D4D] rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#1E2D4D]">
            <div className="flex items-center gap-2.5">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#1E2D4D]" />
                <div className="w-3 h-3 rounded-full bg-[#1E2D4D]" />
                <div className="w-3 h-3 rounded-full bg-[#1E2D4D]" />
              </div>
              <span className="text-xs text-[#4B5563] font-mono">Report Preview</span>
            </div>
            {report.html_url && (
              <a
                href={report.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-accent hover:text-accent-light transition-colors flex items-center gap-1"
              >
                Open full view
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}
          </div>

          {report.html_url ? (
            <iframe
              src={report.html_url}
              className="w-full bg-white"
              style={{ height: '75vh' }}
              title={`${report.company_name} pitch deck preview`}
            />
          ) : (
            <div className="flex items-center justify-center h-64 text-[#4B5563] text-sm">
              HTML preview not available
            </div>
          )}
        </div>

        {/* Footer meta */}
        <div className="mt-6 flex items-center justify-between text-xs text-[#4B5563]">
          <span>Report ID: <code className="font-mono text-[#9CA3AF]">{params.id}</code></span>
          <Link href="/" className="text-accent hover:text-accent-light transition-colors">
            ← Generate another report
          </Link>
        </div>
      </div>
    </div>
  )
}
