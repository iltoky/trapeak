CREATE TABLE IF NOT EXISTS lab_reports (
  id UUID PRIMARY KEY,
  user_id TEXT NOT NULL,
  collected_at TIMESTAMPTZ NOT NULL,
  test_type TEXT NOT NULL
    CHECK (test_type IN ('blood', 'urine', 'stool', 'saliva', 'other')),
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 1 AND 200),
  laboratory TEXT CHECK (laboratory IS NULL OR char_length(laboratory) <= 200),
  notes TEXT CHECK (notes IS NULL OR char_length(notes) <= 2000),
  source TEXT NOT NULL DEFAULT 'ai' CHECK (source IN ('ai')),
  idempotency_key TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS lab_reports_user_idempotency_key_idx
  ON lab_reports (user_id, idempotency_key);

-- statement-breakpoint
CREATE INDEX IF NOT EXISTS lab_reports_user_collected_at_idx
  ON lab_reports (user_id, collected_at DESC);

-- statement-breakpoint
CREATE TABLE IF NOT EXISTS lab_results (
  id UUID PRIMARY KEY,
  report_id UUID NOT NULL REFERENCES lab_reports(id) ON DELETE CASCADE,
  analyte_name TEXT NOT NULL CHECK (char_length(analyte_name) BETWEEN 1 AND 200),
  value_text TEXT NOT NULL CHECK (char_length(value_text) BETWEEN 1 AND 200),
  value_numeric DOUBLE PRECISION,
  unit TEXT CHECK (unit IS NULL OR char_length(unit) <= 100),
  reference_range TEXT CHECK (reference_range IS NULL OR char_length(reference_range) <= 200),
  reference_min DOUBLE PRECISION,
  reference_max DOUBLE PRECISION,
  flag TEXT NOT NULL DEFAULT 'unknown'
    CHECK (flag IN ('low', 'normal', 'high', 'abnormal', 'unknown')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- statement-breakpoint
CREATE INDEX IF NOT EXISTS lab_results_report_id_idx
  ON lab_results (report_id);

-- statement-breakpoint
CREATE INDEX IF NOT EXISTS lab_results_analyte_name_idx
  ON lab_results (LOWER(analyte_name));
