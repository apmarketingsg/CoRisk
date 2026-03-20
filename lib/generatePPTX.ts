// =============================================================================
// *** STUB — Slide content to be built out separately ***
//
// This file receives the structured ReportData from the AI and produces a
// binary PPTX buffer using pptxgenjs.
//
// Currently: creates a skeleton deck with slide titles only.
// TODO: implement per-slide layouts, charts, tables, and brand styling.
// =============================================================================

import pptxgen from 'pptxgenjs'
import type { ReportData } from '@/types/report'

export const SLIDE_TITLES = [
  'Cover',
  'Executive Summary',
  'Company Overview',
  'Market Position',
  'Financial Highlights',
  'Risk Profile',
  'Insurance Needs Assessment',
  'Proposed Coverage Structure',
  'Premium Modelling',
  'Claims History',
  'Sector Benchmarking',
  'Regulatory Environment',
  'Key Risks & Mitigation',
  'Recommended Programme',
  'Next Steps',
  'Appendix',
] as const

export async function buildPPTX(reportData: ReportData): Promise<Buffer> {
  const pptx = new pptxgen()

  // Presentation-level defaults
  pptx.layout = 'LAYOUT_WIDE'  // 13.33" × 7.5"
  pptx.author = 'CoRisk AI'
  pptx.company = 'CoRisk'
  pptx.subject = `Insurance Pitch Deck — ${reportData.companyName}`
  pptx.title = `${reportData.companyName} — Insurance Pitch Deck`

  const slides = reportData.slides.length === 16
    ? reportData.slides
    : SLIDE_TITLES.map((title) => ({ title }))

  for (const slideData of slides) {
    const slide = pptx.addSlide()

    // Dark navy background
    slide.background = { color: '0A0F1E' }

    // Slide title
    slide.addText(slideData.title, {
      x: 0.5, y: 0.4, w: '90%', h: 0.6,
      fontSize: 28,
      bold: true,
      color: 'FFFFFF',
      fontFace: 'Inter',
    })

    // ── TODO: implement per-slide content layouts ──────────────────────────
    // Each slide type (bullets, stats, table, chart) needs a dedicated layout.
    // Reference types/report.ts SlideContent for the available data fields.
    //
    // Example (bullets):
    // if (slideData.bullets?.length) {
    //   slide.addText(
    //     slideData.bullets.map((b) => ({ text: b, options: { bullet: true } })),
    //     { x: 0.5, y: 1.2, w: '90%', h: 4, fontSize: 16, color: '9CA3AF' }
    //   )
    // }
    // ──────────────────────────────────────────────────────────────────────
  }

  // pptxgenjs write() returns different types depending on outputType
  const output = await pptx.write({ outputType: 'nodebuffer' })
  return Buffer.from(output as unknown as ArrayBuffer)
}
