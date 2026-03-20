import StatusPoller from '@/components/StatusPoller'
import Link from 'next/link'

interface Props {
  params: { id: string }
}

export default function StatusPage({ params }: Props) {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-lg">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-[#4B5563] mb-8">
          <Link href="/" className="hover:text-[#9CA3AF] transition-colors">Home</Link>
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-[#9CA3AF]">Generating Report</span>
        </div>

        {/* Card */}
        <div className="bg-[#111827] border border-[#1E2D4D] rounded-2xl p-8">
          <StatusPoller reportId={params.id} />
        </div>

        {/* ID reference */}
        <p className="text-center text-xs text-[#4B5563] mt-4">
          Report ID: <code className="font-mono text-[#9CA3AF]">{params.id}</code>
        </p>
      </div>
    </div>
  )
}
