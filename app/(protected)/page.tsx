import CompanyForm from '@/components/CompanyForm'
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col">
      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-20">
        {/* Background glow */}
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 50% 30%, rgba(37,99,235,0.06) 0%, transparent 60%)`,
          }}
        />

        <div className="relative w-full max-w-2xl">
          {/* Eyebrow */}
          <div className="flex items-center justify-center mb-8">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium
                           bg-accent/10 text-accent border border-accent/20">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-slow" />
              AI-Powered · 2–5 minutes
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl font-bold text-center mb-4 leading-tight">
            <span className="text-white">Generate an</span>
            <br />
            <span className="bg-gradient-to-r from-[#2563EB] to-[#60A5FA] bg-clip-text text-transparent">
              Insurance Pitch Deck
            </span>
          </h1>

          <p className="text-center text-[#9CA3AF] text-lg mb-10 max-w-lg mx-auto leading-relaxed">
            Enter a company name. Our AI researches the business and generates a
            full 16-slide pitch deck — ready to download as PPTX and PDF.
          </p>

          {/* Form */}
          <div className="bg-[#111827] border border-[#1E2D4D] rounded-2xl p-6 shadow-2xl">
            <CompanyForm />
          </div>

          {/* Features */}
          <div className="mt-10 grid grid-cols-3 gap-4 text-center">
            {[
              { icon: '🔍', label: 'AI Research', desc: 'Live web search' },
              { icon: '📊', label: '16 Slides', desc: 'Structured output' },
              { icon: '📥', label: 'PPTX + PDF', desc: 'Instant download' },
            ].map((f) => (
              <div key={f.label} className="flex flex-col items-center gap-1.5">
                <span className="text-2xl">{f.icon}</span>
                <span className="text-sm font-medium text-[#F9FAFB]">{f.label}</span>
                <span className="text-xs text-[#4B5563]">{f.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent reports link */}
      <div className="border-t border-[#1E2D4D] px-6 py-4">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <span className="text-sm text-[#4B5563]">Past reports are saved automatically.</span>
          <Link
            href="/dashboard"
            className="text-sm text-accent hover:text-accent-light transition-colors duration-200 flex items-center gap-1"
          >
            View dashboard
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  )
}
