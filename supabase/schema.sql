-- ============================================================
-- CoRisk — Supabase schema
-- Run this in your Supabase SQL editor to set up the database.
-- ============================================================

CREATE TABLE IF NOT EXISTS reports (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name  TEXT        NOT NULL,
  status        TEXT        NOT NULL DEFAULT 'generating'
                            CHECK (status IN ('generating', 'complete', 'failed')),
  progress      TEXT,
  pptx_url      TEXT,
  pdf_url       TEXT,
  html_url      TEXT,
  error_message TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for dashboard queries
CREATE INDEX IF NOT EXISTS idx_reports_created_at
  ON reports (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_reports_company_name
  ON reports USING gin (to_tsvector('english', company_name));

CREATE INDEX IF NOT EXISTS idx_reports_status
  ON reports (status);

-- Auto-update updated_at on row change
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at ON reports;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON reports
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- Row-Level Security: disable for service-role key usage (server-side only)
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS by default in Supabase — no policy needed.
-- If you want anon access, add policies here:
-- CREATE POLICY "service role only" ON reports USING (false);
