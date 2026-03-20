'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function NavBar() {
  const pathname = usePathname()

  return (
    <header className="border-b border-[#1E2D4D] bg-[#05091A]/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 1L14 4.5V11.5L8 15L2 11.5V4.5L8 1Z" stroke="white" strokeWidth="1.5" fill="none"/>
              <path d="M8 5L11 6.75V10.25L8 12L5 10.25V6.75L8 5Z" fill="white"/>
            </svg>
          </div>
          <span className="font-semibold text-white tracking-tight text-lg">CoRisk</span>
        </Link>

        {/* Nav links */}
        <nav className="flex items-center gap-1">
          <Link
            href="/"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
              pathname === '/'
                ? 'bg-[#1A2340] text-white'
                : 'text-[#9CA3AF] hover:text-white hover:bg-[#111827]'
            }`}
          >
            New Report
          </Link>
          <Link
            href="/dashboard"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
              pathname === '/dashboard'
                ? 'bg-[#1A2340] text-white'
                : 'text-[#9CA3AF] hover:text-white hover:bg-[#111827]'
            }`}
          >
            Dashboard
          </Link>
        </nav>

        {/* Sign out */}
        <form action="/api/auth/signout" method="POST">
          <button
            type="submit"
            className="text-sm text-[#4B5563] hover:text-[#9CA3AF] transition-colors duration-200"
          >
            Sign out
          </button>
        </form>
      </div>
    </header>
  )
}
