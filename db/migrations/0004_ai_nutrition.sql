ALTER TABLE nutrition_entries
  ADD COLUMN description TEXT;

-- statement-breakpoint
ALTER TABLE nutrition_entries
  ADD CONSTRAINT nutrition_entries_description_length_check
  CHECK (description IS NULL OR char_length(description) BETWEEN 1 AND 2000);

-- statement-breakpoint
UPDATE nutrition_entries
   SET description = title
 WHERE description IS NULL;

-- statement-breakpoint
ALTER TABLE nutrition_entries
  ADD COLUMN estimated BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN estimation_notes TEXT,
  ADD COLUMN idempotency_key TEXT;

-- statement-breakpoint
ALTER TABLE nutrition_entries
  ADD CONSTRAINT nutrition_entries_estimation_notes_length_check
  CHECK (estimation_notes IS NULL OR char_length(estimation_notes) <= 1000);

-- statement-breakpoint
ALTER TABLE nutrition_entries
  DROP CONSTRAINT IF EXISTS nutrition_entries_source_check;

-- statement-breakpoint
ALTER TABLE nutrition_entries
  ADD CONSTRAINT nutrition_entries_source_check
  CHECK (source IN ('manual', 'ai'));

-- statement-breakpoint
CREATE UNIQUE INDEX nutrition_entries_user_idempotency_key_idx
  ON nutrition_entries (user_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL;
