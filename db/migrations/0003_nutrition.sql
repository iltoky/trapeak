CREATE TABLE IF NOT EXISTS nutrition_entries (
  id UUID PRIMARY KEY,
  user_id TEXT NOT NULL,
  consumed_at TIMESTAMPTZ NOT NULL,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 1 AND 120),
  calories_kilocalories DOUBLE PRECISION NOT NULL CHECK (calories_kilocalories >= 0 AND calories_kilocalories <= 20000),
  protein_grams DOUBLE PRECISION NOT NULL CHECK (protein_grams >= 0 AND protein_grams <= 2000),
  carbohydrates_grams DOUBLE PRECISION NOT NULL CHECK (carbohydrates_grams >= 0 AND carbohydrates_grams <= 2000),
  fat_grams DOUBLE PRECISION NOT NULL CHECK (fat_grams >= 0 AND fat_grams <= 2000),
  notes TEXT CHECK (notes IS NULL OR char_length(notes) <= 1000),
  source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- statement-breakpoint
CREATE INDEX IF NOT EXISTS nutrition_entries_user_consumed_at_idx
  ON nutrition_entries (user_id, consumed_at DESC);
