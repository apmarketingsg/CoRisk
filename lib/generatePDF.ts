// =============================================================================
// *** STUB — PDF generation to be implemented ***
//
// Recommended approaches (pick one):
//
// Option A — Puppeteer + @sparticuz/chromium (Vercel-compatible):
//   npm install puppeteer-core @sparticuz/chromium
//   Render the HTML report URL and print to PDF.
//
// Option B — LibreOffice headless (self-hosted / Railway / Fly.io):
//   exec `soffice --headless --convert-to pdf --outdir /tmp <file.pptx>`
//   Read the resulting PDF from /tmp.
//
// See: https://github.com/Sparticuz/chromium for Option A setup.
// =============================================================================

export async function generatePDF(_pptxBuffer: Buffer): Promise<Buffer> {
  // TODO: implement PDF generation
  throw new Error(
    'PDF generation is not yet implemented. ' +
    'See lib/generatePDF.ts for implementation options.'
  )
}
