CREATE TABLE IF NOT EXISTS weight_entries (
  id UUID PRIMARY KEY,
  user_id TEXT NOT NULL,
  measured_at TIMESTAMPTZ NOT NULL,
  weight_kg DOUBLE PRECISION NOT NULL CHECK (weight_kg >= 20 AND weight_kg <= 500),
  notes TEXT CHECK (notes IS NULL OR char_length(notes) <= 1000),
  source TEXT NOT NULL CHECK (source IN ('ai', 'manual', 'provider', 'profile_migration')),
  idempotency_key TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS weight_entries_user_idempotency_key_idx
  ON weight_entries (user_id, idempotency_key);

-- statement-breakpoint
CREATE INDEX IF NOT EXISTS weight_entries_user_measured_at_idx
  ON weight_entries (user_id, measured_at DESC);

-- statement-breakpoint
INSERT INTO weight_entries (
  id, user_id, measured_at, weight_kg, notes, source, idempotency_key
)
SELECT (
         substr(md5(user_id || ':profile-weight'), 1, 8) || '-' ||
         substr(md5(user_id || ':profile-weight'), 9, 4) || '-' ||
         '5' || substr(md5(user_id || ':profile-weight'), 14, 3) || '-' ||
         '8' || substr(md5(user_id || ':profile-weight'), 18, 3) || '-' ||
         substr(md5(user_id || ':profile-weight'), 21, 12)
       )::uuid,
       user_id,
       updated_at,
       (profile ->> 'weightKilograms')::double precision,
       'Migrated from Profile v1',
       'profile_migration',
       'profile-v1-' || md5(user_id || ':' || (profile ->> 'weightKilograms') || ':' || updated_at::text)
  FROM user_profiles
 WHERE profile ? 'weightKilograms'
   AND profile ->> 'weightKilograms' ~ '^[0-9]+([.][0-9]+)?$'
   AND (profile ->> 'weightKilograms')::double precision BETWEEN 20 AND 500
ON CONFLICT (user_id, idempotency_key) DO NOTHING;

-- statement-breakpoint
ALTER TABLE user_profiles
  DROP CONSTRAINT IF EXISTS user_profiles_profile_version_check;

-- statement-breakpoint
ALTER TABLE user_profiles
  ALTER COLUMN profile_version SET DEFAULT 2;

-- statement-breakpoint
UPDATE user_profiles
   SET profile = profile - 'ageYears' - 'weightKilograms',
       field_statuses = field_statuses - 'ageYears' - 'weightKilograms',
       profile_version = 2,
       updated_at = NOW();

-- statement-breakpoint
ALTER TABLE user_profiles
  ADD CONSTRAINT user_profiles_profile_version_check CHECK (profile_version = 2);
