import { supabase } from '@/lib/supabase'
import ReportList from '@/components/ReportList'
import Link from 'next/link'

export const revalidate = 0 // always fresh

export default async function DashboardPage() {
  const { data: reports, error } = await supabase
    .from('reports')
    .select('id, company_name, status, progress, created_at')
    .order('created_at', { ascending: false })
    .limit(100)

  const safeReports = reports ?? []

  // Stats
  const total = safeReports.length
  const complete = safeReports.filter((r) => r.status === 'complete').length
  const generating = safeReports.filter((r) => r.status === 'generating').length

  return (
    <div className="min-h-[calc(100vh-4rem)] px-6 py-10">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            <p className="text-[#9CA3AF] text-sm mt-0.5">All generated pitch decks</p>
          </div>
          <Link href="/" className="btn-primary flex items-center gap-2 self-start sm:self-auto">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New report
          </Link>
        </div>

        {/* Stats cards */}
        {total > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Total Reports', value: total },
              { label: 'Complete', value: complete },
              { label: 'In Progress', value: generating },
            ].map((stat) => (
              <div key={stat.label} className="bg-[#111827] border border-[#1E2D4D] rounded-xl px-5 py-4">
                <p className="text-xs text-[#4B5563] uppercase tracking-wider mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
            Failed to load reports. Check your Supabase configuration.
          </div>
        )}

        {/* Report list */}
        <div className="bg-[#111827] border border-[#1E2D4D] rounded-2xl p-6">
          <ReportList reports={safeReports} />
        </div>
      </div>
    </div>
  )
}
