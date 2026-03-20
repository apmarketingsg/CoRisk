import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CoRisk — Insurance Pitch Deck Generator',
  description: 'AI-powered insurance pitch deck generation for corporate clients.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-navy-900 text-[#F9FAFB] min-h-screen">
        {children}
      </body>
    </html>
  )
}
