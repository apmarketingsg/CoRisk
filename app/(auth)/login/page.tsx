import { Suspense } from 'react'
import LoginForm from './LoginForm'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#0A0F1E] flex items-center justify-center p-6">
      {/* Background grid */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 0%, rgba(37,99,235,0.08) 0%, transparent 60%),
            linear-gradient(rgba(30,45,77,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(30,45,77,0.3) 1px, transparent 1px)`,
          backgroundSize: 'auto, 60px 60px, 60px 60px',
        }}
      />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent mb-5">
            <svg width="24" height="24" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 1L14 4.5V11.5L8 15L2 11.5V4.5L8 1Z" stroke="white" strokeWidth="1.5" fill="none"/>
              <path d="M8 5L11 6.75V10.25L8 12L5 10.25V6.75L8 5Z" fill="white"/>
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-white">CoRisk</h1>
          <p className="text-[#9CA3AF] text-sm mt-1">Insurance Pitch Deck Generator</p>
        </div>

        {/* Card */}
        <div className="bg-[#111827] border border-[#1E2D4D] rounded-2xl p-8">
          <h2 className="text-lg font-semibold text-white mb-1">Enter access code</h2>
          <p className="text-sm text-[#9CA3AF] mb-6">
            This application is invite-only. Enter your access code to continue.
          </p>
          {/* Suspense required because LoginForm uses useSearchParams */}
          <Suspense fallback={<div className="h-32 animate-pulse rounded-lg bg-[#0A0F1E]" />}>
            <LoginForm />
          </Suspense>
        </div>

        <p className="text-center text-xs text-[#4B5563] mt-6">
          Contact your administrator if you need access.
        </p>
      </div>
    </div>
  )
}
