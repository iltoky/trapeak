ALTER TABLE nutrition_entries
  ADD COLUMN IF NOT EXISTS description TEXT;

-- statement-breakpoint
UPDATE nutrition_entries
   SET description = title
 WHERE description IS NULL;

-- statement-breakpoint
ALTER TABLE nutrition_entries
  ADD COLUMN IF NOT EXISTS estimated BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS estimation_notes TEXT,
  ADD COLUMN IF NOT EXISTS idempotency_key TEXT;

-- statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
     WHERE conname = 'nutrition_entries_description_length_check'
  ) THEN
    ALTER TABLE nutrition_entries
      ADD CONSTRAINT nutrition_entries_description_length_check
      CHECK (description IS NULL OR char_length(description) BETWEEN 1 AND 2000);
  END IF;
END
$$;

-- statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
     WHERE conname = 'nutrition_entries_estimation_notes_length_check'
  ) THEN
    ALTER TABLE nutrition_entries
      ADD CONSTRAINT nutrition_entries_estimation_notes_length_check
      CHECK (estimation_notes IS NULL OR char_length(estimation_notes) <= 1000);
  END IF;
END
$$;

-- statement-breakpoint
ALTER TABLE nutrition_entries
  DROP CONSTRAINT IF EXISTS nutrition_entries_source_check;

-- statement-breakpoint
ALTER TABLE nutrition_entries
  ADD CONSTRAINT nutrition_entries_source_check
  CHECK (source IN ('manual', 'ai'));

-- statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS nutrition_entries_user_idempotency_key_idx
  ON nutrition_entries (user_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL;
