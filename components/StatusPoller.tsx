'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface StatusResponse {
  id: string
  companyName: string
  status: 'generating' | 'complete' | 'failed'
  progress: string | null
  pptxUrl: string | null
  pdfUrl: string | null
  htmlUrl: string | null
  errorMessage: string | null
  createdAt: string
}

const STEPS = [
  { key: 'research',  label: 'Researching company',       desc: 'Gathering public data via web search' },
  { key: 'generate',  label: 'Generating report content',  desc: 'Analysing findings with AI' },
  { key: 'pptx',      label: 'Building presentation',      desc: 'Assembling 16-slide PPTX deck' },
  { key: 'pdf',       label: 'Exporting PDF',              desc: 'Rendering PDF version' },
  { key: 'upload',    label: 'Uploading files',            desc: 'Saving to cloud storage' },
]

function progressToStep(progress: string | null): number {
  if (!progress) return 0
  const p = progress.toLowerCase()
  if (p.includes('upload')) return 4
  if (p.includes('pdf')) return 3
  if (p.includes('pptx') || p.includes('build')) return 2
  if (p.includes('generat') || p.includes('analys')) return 1
  return 0
}

export default function StatusPoller({ reportId }: { reportId: string }) {
  const [data, setData] = useState<StatusResponse | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const router = useRouter()

  const poll = useCallback(async () => {
    try {
      const res = await fetch(`/api/reports/${reportId}/status`)
      if (!res.ok) return
      const json: StatusResponse = await res.json()
      setData(json)
      setCurrentStep(progressToStep(json.progress))

      if (json.status === 'complete') {
        // Brief pause so user sees "complete" state, then redirect
        setTimeout(() => router.push(`/reports/${reportId}`), 1200)
      }
    } catch {
      // Network blip — continue polling
    }
  }, [reportId, router])

  useEffect(() => {
    poll() // immediate first call
    const interval = setInterval(poll, 3000)
    return () => clearInterval(interval)
  }, [poll])

  // Loading skeleton
  if (!data) {
    return (
      <div className="flex flex-col items-center gap-6 py-16 animate-pulse">
        <div className="w-16 h-16 rounded-full bg-[#1A2340]" />
        <div className="h-4 w-48 rounded bg-[#1A2340]" />
        <div className="h-3 w-32 rounded bg-[#111827]" />
      </div>
    )
  }

  if (data.status === 'failed') {
    return (
      <div className="flex flex-col items-center gap-4 py-16">
        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-white">Generation failed</h3>
        <p className="text-sm text-[#9CA3AF] max-w-sm text-center">
          {data.errorMessage || 'An unexpected error occurred. Please try again.'}
        </p>
        <a href="/" className="btn-primary mt-2">Try again</a>
      </div>
    )
  }

  const isComplete = data.status === 'complete'

  return (
    <div className="flex flex-col items-center gap-8 py-10 animate-fade-in w-full max-w-lg mx-auto">
      {/* Spinner / Complete icon */}
      <div className="relative">
        {isComplete ? (
          <div className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
            <svg className="w-10 h-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        ) : (
          <div className="w-20 h-20">
            <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="34" stroke="#1E2D4D" strokeWidth="4" fill="none" />
              <circle
                cx="40" cy="40" r="34"
                stroke="#2563EB" strokeWidth="4" fill="none"
                strokeLinecap="round"
                strokeDasharray={`${(currentStep / (STEPS.length - 1)) * 213.6} 213.6`}
                style={{ transition: 'stroke-dasharray 0.6s ease' }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="animate-spin w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Company + status */}
      <div className="text-center">
        <h3 className="text-xl font-semibold text-white mb-1">{data.companyName}</h3>
        <p className="text-sm text-[#9CA3AF]">
          {isComplete ? 'Report ready — redirecting…' : (data.progress || 'Starting generation…')}
        </p>
      </div>

      {/* Steps */}
      <div className="w-full space-y-2">
        {STEPS.map((step, i) => {
          const done = isComplete || i < currentStep
          const active = !isComplete && i === currentStep
          return (
            <div
              key={step.key}
              className={`flex items-center gap-4 p-3.5 rounded-xl border transition-all duration-300 ${
                active
                  ? 'border-accent/40 bg-accent/5'
                  : done
                  ? 'border-[#1E2D4D] bg-[#0F1629]'
                  : 'border-[#1A2340] bg-transparent'
              }`}
            >
              {/* Step indicator */}
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                  done
                    ? 'bg-green-500/20 border border-green-500/30'
                    : active
                    ? 'bg-accent/20 border border-accent/30'
                    : 'bg-[#1A2340] border border-[#1E2D4D]'
                }`}
              >
                {done ? (
                  <svg className="w-3.5 h-3.5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : active ? (
                  <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                ) : (
                  <span className="text-xs text-[#4B5563] font-medium">{i + 1}</span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${active || done ? 'text-white' : 'text-[#4B5563]'}`}>
                  {step.label}
                </p>
                {(active || done) && (
                  <p className="text-xs text-[#9CA3AF] mt-0.5">{step.desc}</p>
                )}
              </div>

              {active && (
                <svg className="animate-spin w-4 h-4 text-accent flex-shrink-0" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
              )}
            </div>
          )
        })}
      </div>

      <p className="text-xs text-[#4B5563] text-center">
        This usually takes 2–5 minutes. You can safely close this tab — the report will be saved to your dashboard.
      </p>
    </div>
  )
}
