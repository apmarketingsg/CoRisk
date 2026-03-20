'use client'

interface Props {
  pptxUrl: string
  pdfUrl: string
  companyName: string
}

export default function DownloadButtons({ pptxUrl, pdfUrl, companyName }: Props) {
  const slug = companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-')

  return (
    <div className="flex flex-wrap gap-3">
      <a
        href={pptxUrl}
        download={`${slug}-pitch-deck.pptx`}
        className="btn-primary flex items-center gap-2.5"
        target="_blank"
        rel="noopener noreferrer"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Download PPTX
      </a>

      <a
        href={pdfUrl}
        download={`${slug}-pitch-deck.pdf`}
        className="btn-secondary flex items-center gap-2.5"
        target="_blank"
        rel="noopener noreferrer"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        Download PDF
      </a>
    </div>
  )
}
