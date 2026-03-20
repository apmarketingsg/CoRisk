// Supabase DB row shape
export interface ReportRow {
  id: string
  company_name: string
  status: 'generating' | 'complete' | 'failed'
  progress: string | null
  pptx_url: string | null
  pdf_url: string | null
  html_url: string | null
  error_message: string | null
  created_at: string
  updated_at: string
}

// ─── Structured report output from the AI ────────────────────────────────────

export interface SlideContent {
  title: string
  subtitle?: string
  bullets?: string[]           // key bullet points
  body?: string                // paragraph text
  stats?: { label: string; value: string; unit?: string }[]
  tableData?: { headers: string[]; rows: string[][] }
  notes?: string               // presenter notes
}

export interface ReportData {
  companyName: string
  companyDescription: string   // 1–2 sentence summary
  generatedAt: string          // ISO timestamp
  slides: SlideContent[]       // exactly 16 slides
}
