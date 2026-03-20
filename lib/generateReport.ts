/**
 * Core generation orchestrator.
 *
 * Two-phase approach:
 *   1. RESEARCH  — Claude uses web_search to gather live company intelligence.
 *   2. GENERATE  — Claude calls generate_report tool with the ReportData schema,
 *                  forcing a structured JSON output that maps to 16 slides.
 *
 * The model used is claude-sonnet-4-20250514 as specified in the project brief.
 * The MASTER_PROMPT from lib/masterPrompt.ts is injected into phase 2.
 */

import Anthropic from '@anthropic-ai/sdk'
import { MASTER_PROMPT } from './masterPrompt'
import { buildPPTX, SLIDE_TITLES } from './generatePPTX'
import { generatePDF } from './generatePDF'
import { uploadToBlob } from './uploadToBlob'
import { supabase } from './supabase'
import type { ReportData, SlideContent } from '@/types/report'

// ─── Anthropic client ──────────────────────────────────────────────────────────

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const MODEL = 'claude-sonnet-4-20250514'

// ─── JSON schema for the generate_report tool ─────────────────────────────────

const slideContentSchema = {
  type: 'object',
  properties: {
    title:     { type: 'string', description: 'Slide title' },
    subtitle:  { type: 'string', description: 'Optional slide subtitle or tagline' },
    bullets: {
      type: 'array',
      items: { type: 'string' },
      description: 'Key bullet points (4–6 items recommended)',
    },
    body: {
      type: 'string',
      description: 'Short paragraph text for slides that use prose instead of bullets',
    },
    stats: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          label: { type: 'string' },
          value: { type: 'string' },
          unit:  { type: 'string', description: 'e.g. USD, %, employees' },
        },
        required: ['label', 'value'],
        additionalProperties: false,
      },
      description: 'Key metrics / KPIs displayed as stat blocks',
    },
    tableData: {
      type: 'object',
      properties: {
        headers: { type: 'array', items: { type: 'string' } },
        rows: {
          type: 'array',
          items: { type: 'array', items: { type: 'string' } },
        },
      },
      required: ['headers', 'rows'],
      additionalProperties: false,
      description: 'Optional data table for comparison or benchmarking slides',
    },
    notes: {
      type: 'string',
      description: 'Presenter notes — additional context not shown on the slide',
    },
  },
  required: ['title'],
  additionalProperties: false,
}

const generateReportTool: Anthropic.Tool = {
  name: 'generate_report',
  description:
    'Generate a complete 16-slide insurance pitch deck as structured JSON. ' +
    'Call this once with all 16 slides populated.',
  input_schema: {
    type: 'object' as const,
    properties: {
      companyName: {
        type: 'string',
        description: 'The exact company name as given by the user',
      },
      companyDescription: {
        type: 'string',
        description: '1–2 sentence plain-English summary of what the company does',
      },
      generatedAt: {
        type: 'string',
        description: 'ISO 8601 timestamp of generation (set to current time)',
      },
      slides: {
        type: 'array',
        items: slideContentSchema,
        description: `Array of exactly 16 slides in this order: ${SLIDE_TITLES.join(', ')}`,
        minItems: 16,
        maxItems: 16,
      },
    },
    required: ['companyName', 'companyDescription', 'generatedAt', 'slides'],
    additionalProperties: false,
  },
}

// ─── Helper: update Supabase progress ─────────────────────────────────────────

async function updateProgress(id: string, progress: string) {
  await supabase
    .from('reports')
    .update({ progress, updated_at: new Date().toISOString() })
    .eq('id', id)
}

// ─── Phase 1: Research ────────────────────────────────────────────────────────

async function researchCompany(companyName: string): Promise<string> {
  /**
   * Use Claude with the web_search_20260209 tool to gather live intelligence
   * about the company. We run a streaming call and collect the full message.
   *
   * The web_search_20260209 variant includes dynamic filtering — Claude filters
   * search results before they enter the context window for efficiency.
   */

  const systemPrompt = [
    'You are a senior insurance market analyst preparing background research for a pitch deck.',
    'Your goal is to gather comprehensive, factual intelligence about the target company.',
    'Focus on: company overview, revenue/financials, headcount, sector, geographic footprint,',
    'key risks, existing insurance arrangements (if public), regulatory environment,',
    'recent news, M&A activity, and any ESG or litigation issues.',
    'Search thoroughly — use multiple queries to build a complete picture.',
    'Summarise your findings in well-structured prose (not bullet points).',
    'Be specific with numbers, dates, and sources.',
  ].join(' ')

  const userPrompt =
    `Research the following company for an insurance pitch deck: "${companyName}". ` +
    `Search for their latest financials, business description, headcount, major risks, ` +
    `industry sector, geography of operations, and any insurance-relevant news. ` +
    `Provide a detailed research summary.`

  const stream = anthropic.messages.stream({
    model: MODEL,
    max_tokens: 8000,
    system: systemPrompt,
    tools: [
      { type: 'web_search_20260209', name: 'web_search' } as unknown as Anthropic.Tool,
    ],
    messages: [{ role: 'user', content: userPrompt }],
  })

  const finalMessage = await stream.finalMessage()

  // Extract all text blocks from the response (Claude summarises after searching)
  const researchText = finalMessage.content
    .filter((block): block is Anthropic.TextBlock => block.type === 'text')
    .map((block) => block.text)
    .join('\n\n')

  return researchText || `Research conducted for ${companyName}. (No text summary returned.)`
}

// ─── Phase 2: Generate structured report ──────────────────────────────────────

async function generateStructuredReport(
  companyName: string,
  researchText: string
): Promise<ReportData> {
  /**
   * Second Claude call — no web search tools, only the generate_report tool.
   * tool_choice: any forces Claude to call the tool (structured output).
   *
   * If MASTER_PROMPT is still "PLACEHOLDER", a fallback instruction is used
   * so the scaffold works end-to-end even before the prompt is filled in.
   */

  const effectivePrompt =
    MASTER_PROMPT === 'PLACEHOLDER'
      ? [
          'You are an expert insurance broker and pitch deck writer.',
          'Using the research provided, create a comprehensive 16-slide insurance pitch deck.',
          'Each slide should contain specific, substantiated content derived from the research.',
          'Slides must cover: company overview, risk profile, financial exposure, sector benchmarks,',
          'proposed insurance programme, premium modelling, and recommendations.',
          'Be precise, professional, and tailored to the specific company.',
        ].join(' ')
      : MASTER_PROMPT

  const userContent =
    `${effectivePrompt}\n\n` +
    `--- RESEARCH FINDINGS ---\n${researchText}\n` +
    `--- END RESEARCH ---\n\n` +
    `Now call the generate_report tool to produce the complete 16-slide pitch deck for: ${companyName}. ` +
    `Slides must appear in exactly this order: ${SLIDE_TITLES.join(', ')}. ` +
    `Populate every slide with specific, substantiated content from the research above.`

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 16000,
    tools: [generateReportTool],
    tool_choice: { type: 'any' },
    messages: [{ role: 'user', content: userContent }],
  })

  // Extract the generate_report tool call
  const toolUseBlock = response.content.find(
    (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use'
  )

  if (!toolUseBlock || toolUseBlock.name !== 'generate_report') {
    throw new Error('Model did not call the generate_report tool as expected')
  }

  const reportData = toolUseBlock.input as ReportData

  // Validate we have 16 slides
  if (!reportData.slides || reportData.slides.length !== 16) {
    throw new Error(
      `Expected 16 slides, got ${reportData.slides?.length ?? 0}. ` +
      'The model may have truncated output — increase max_tokens.'
    )
  }

  return reportData
}

// ─── HTML report builder ───────────────────────────────────────────────────────

function buildHTMLReport(reportData: ReportData): string {
  const slidesHTML = reportData.slides
    .map((slide: SlideContent, i: number) => {
      const bulletsHTML = slide.bullets?.length
        ? `<ul>${slide.bullets.map((b) => `<li>${escapeHTML(b)}</li>`).join('')}</ul>`
        : ''

      const bodyHTML = slide.body ? `<p>${escapeHTML(slide.body)}</p>` : ''

      const statsHTML = slide.stats?.length
        ? `<div class="stats">${slide.stats
            .map(
              (s) =>
                `<div class="stat"><span class="stat-value">${escapeHTML(s.value)}${s.unit ? `<span class="stat-unit"> ${escapeHTML(s.unit)}</span>` : ''}</span><span class="stat-label">${escapeHTML(s.label)}</span></div>`
            )
            .join('')}</div>`
        : ''

      const tableHTML = slide.tableData
        ? `<table><thead><tr>${slide.tableData.headers.map((h) => `<th>${escapeHTML(h)}</th>`).join('')}</tr></thead><tbody>${slide.tableData.rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeHTML(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table>`
        : ''

      return `
      <section class="slide" id="slide-${i + 1}">
        <div class="slide-number">${i + 1} / 16</div>
        <h2>${escapeHTML(slide.title)}</h2>
        ${slide.subtitle ? `<h3>${escapeHTML(slide.subtitle)}</h3>` : ''}
        ${statsHTML}
        ${bulletsHTML}
        ${bodyHTML}
        ${tableHTML}
        ${slide.notes ? `<div class="notes"><strong>Notes:</strong> ${escapeHTML(slide.notes)}</div>` : ''}
      </section>`
    })
    .join('')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHTML(reportData.companyName)} — Insurance Pitch Deck</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --navy: #0A0F1E; --surface: #111827; --card: #141C35;
      --border: #1E2D4D; --accent: #2563EB; --text: #F9FAFB; --muted: #9CA3AF;
    }
    body { font-family: Inter, system-ui, sans-serif; background: var(--navy); color: var(--text);
           min-height: 100vh; padding: 2rem; }
    header { max-width: 860px; margin: 0 auto 3rem; border-bottom: 1px solid var(--border); padding-bottom: 1.5rem; }
    header h1 { font-size: 2rem; font-weight: 700; }
    header p { color: var(--muted); margin-top: 0.5rem; }
    .slides { max-width: 860px; margin: 0 auto; display: flex; flex-direction: column; gap: 1.5rem; }
    .slide { background: var(--surface); border: 1px solid var(--border); border-radius: 16px;
             padding: 2.5rem; position: relative; }
    .slide-number { position: absolute; top: 1.25rem; right: 1.5rem;
                    font-size: 0.7rem; color: var(--muted); font-variant-numeric: tabular-nums; }
    .slide h2 { font-size: 1.4rem; font-weight: 700; margin-bottom: 0.5rem; }
    .slide h3 { font-size: 1rem; color: var(--accent); margin-bottom: 1.25rem; font-weight: 500; }
    .slide p { color: var(--muted); line-height: 1.75; }
    .slide ul { margin-top: 1rem; padding-left: 1.5rem; }
    .slide ul li { color: var(--muted); line-height: 1.8; }
    .stats { display: flex; flex-wrap: wrap; gap: 1rem; margin: 1.25rem 0; }
    .stat { background: var(--card); border: 1px solid var(--border); border-radius: 10px;
            padding: 1rem 1.5rem; min-width: 120px; }
    .stat-value { display: block; font-size: 1.5rem; font-weight: 700; }
    .stat-unit { font-size: 1rem; font-weight: 400; color: var(--muted); }
    .stat-label { display: block; font-size: 0.75rem; color: var(--muted); margin-top: 0.25rem;
                  text-transform: uppercase; letter-spacing: 0.05em; }
    table { width: 100%; border-collapse: collapse; margin-top: 1.25rem; font-size: 0.875rem; }
    th { text-align: left; padding: 0.6rem 1rem; color: var(--muted); font-weight: 600;
         font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.05em;
         border-bottom: 1px solid var(--border); }
    td { padding: 0.7rem 1rem; border-bottom: 1px solid var(--border); color: var(--muted); }
    .notes { margin-top: 1.5rem; padding: 1rem; background: var(--card);
             border-radius: 8px; font-size: 0.8rem; color: var(--muted); line-height: 1.6; }
  </style>
</head>
<body>
  <header>
    <h1>${escapeHTML(reportData.companyName)}</h1>
    <p>Insurance Pitch Deck · Generated ${new Date(reportData.generatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
    <p style="margin-top:0.25rem; font-size:0.85rem;">${escapeHTML(reportData.companyDescription)}</p>
  </header>
  <main class="slides">${slidesHTML}</main>
</body>
</html>`
}

function escapeHTML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

// ─── Main export: background job ──────────────────────────────────────────────

export async function generateReport(id: string, companyName: string): Promise<void> {
  try {
    // ── Phase 1: Research ──
    await updateProgress(id, 'Researching company…')
    const researchText = await researchCompany(companyName)

    // ── Phase 2: Generate structured report ──
    await updateProgress(id, 'Generating report content…')
    const reportData = await generateStructuredReport(companyName, researchText)

    // ── Phase 3: Build PPTX ──
    await updateProgress(id, 'Building PPTX presentation…')
    const pptxBuffer = await buildPPTX(reportData)

    // ── Phase 4: Build PDF ──
    await updateProgress(id, 'Generating PDF…')
    let pdfBuffer: Buffer | null = null
    try {
      pdfBuffer = await generatePDF(pptxBuffer)
    } catch {
      // PDF generation is a stub — proceed without it
      pdfBuffer = null
    }

    // ── Phase 5: Build HTML report ──
    await updateProgress(id, 'Building HTML preview…')
    const htmlContent = buildHTMLReport(reportData)

    // ── Phase 6: Upload to Vercel Blob ──
    await updateProgress(id, 'Uploading files…')
    const [pptxUrl, htmlUrl] = await Promise.all([
      uploadToBlob(
        `reports/${id}.pptx`,
        pptxBuffer,
        'application/vnd.openxmlformats-officedocument.presentationml.presentation'
      ),
      uploadToBlob(`reports/${id}.html`, Buffer.from(htmlContent, 'utf-8'), 'text/html'),
    ])

    // Upload PDF only if generated
    const pdfUrl = pdfBuffer
      ? await uploadToBlob(`reports/${id}.pdf`, pdfBuffer, 'application/pdf')
      : null

    // ── Phase 7: Mark complete ──
    await supabase
      .from('reports')
      .update({
        status: 'complete',
        progress: 'Done',
        pptx_url: pptxUrl,
        pdf_url: pdfUrl,
        html_url: htmlUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err)
    console.error(`[generateReport] Job ${id} failed:`, errorMessage)

    await supabase
      .from('reports')
      .update({
        status: 'failed',
        error_message: errorMessage,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
  }
}
