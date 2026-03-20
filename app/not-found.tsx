import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0A0F1E] flex items-center justify-center px-6">
      <div className="text-center">
        <p className="text-6xl font-bold text-[#1E2D4D] mb-4">404</p>
        <h1 className="text-xl font-semibold text-white mb-2">Page not found</h1>
        <p className="text-[#9CA3AF] mb-8">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link href="/" className="btn-primary">
          Go home
        </Link>
      </div>
    </div>
  )
}
