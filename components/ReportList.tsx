'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Report {
  id: string
  company_name: string
  status: 'generating' | 'complete' | 'failed'
  progress: string | null
  created_at: string
}

interface Props {
  reports: Report[]
}

function StatusBadge({ status }: { status: Report['status'] }) {
  if (status === 'generating') {
    return (
      <span className="status-badge-generating">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
        Generating
      </span>
    )
  }
  if (status === 'complete') {
    return (
      <span className="status-badge-complete">
        <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
        Complete
      </span>
    )
  }
  return (
    <span className="status-badge-failed">
      <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
      Failed
    </span>
  )
}

export default function ReportList({ reports }: Props) {
  const [search, setSearch] = useState('')

  const filtered = reports.filter((r) =>
    r.company_name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      {/* Search bar */}
      <div className="relative mb-6">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg className="w-4 h-4 text-[#4B5563]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by company name…"
          className="input-field pl-11 h-11 text-sm"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4B5563] hover:text-[#9CA3AF] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          {search ? (
            <>
              <p className="text-[#9CA3AF] font-medium mb-1">No results for "{search}"</p>
              <p className="text-sm text-[#4B5563]">Try a different search term.</p>
            </>
          ) : (
            <>
              <div className="w-14 h-14 rounded-xl bg-[#111827] border border-[#1E2D4D] flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-[#4B5563]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-[#9CA3AF] font-medium mb-1">No reports yet</p>
              <p className="text-sm text-[#4B5563]">Generate your first pitch deck to get started.</p>
              <Link href="/" className="btn-primary mt-5 text-sm">Generate a report</Link>
            </>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-[#1E2D4D]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1E2D4D] bg-[#0F1629]">
                <th className="text-left px-5 py-3.5 text-xs font-medium text-[#4B5563] uppercase tracking-wider">Company</th>
                <th className="text-left px-5 py-3.5 text-xs font-medium text-[#4B5563] uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3.5 text-xs font-medium text-[#4B5563] uppercase tracking-wider hidden sm:table-cell">Generated</th>
                <th className="text-right px-5 py-3.5 text-xs font-medium text-[#4B5563] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2D4D]">
              {filtered.map((report) => {
                const date = new Date(report.created_at).toLocaleDateString('en-GB', {
                  day: 'numeric', month: 'short', year: 'numeric',
                })
                const href = report.status === 'generating'
                  ? `/reports/${report.id}/status`
                  : `/reports/${report.id}`

                return (
                  <tr
                    key={report.id}
                    className="bg-[#111827] hover:bg-[#0F1629] transition-colors duration-150 group"
                  >
                    <td className="px-5 py-4">
                      <Link href={href} className="font-medium text-white group-hover:text-accent transition-colors">
                        {report.company_name}
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={report.status} />
                    </td>
                    <td className="px-5 py-4 text-[#9CA3AF] hidden sm:table-cell">{date}</td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={href}
                        className="text-xs text-[#4B5563] hover:text-accent transition-colors inline-flex items-center gap-1"
                      >
                        {report.status === 'generating' ? 'View progress' : 'Open report'}
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {filtered.length > 0 && (
        <p className="text-xs text-[#4B5563] mt-4 text-right">
          {filtered.length} {filtered.length === 1 ? 'report' : 'reports'}
          {search && ` matching "${search}"`}
        </p>
      )}
    </div>
  )
}
