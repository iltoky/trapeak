CREATE TABLE IF NOT EXISTS user_profiles (
  user_id TEXT PRIMARY KEY,
  profile JSONB NOT NULL DEFAULT '{}'::jsonb,
  field_statuses JSONB NOT NULL DEFAULT '{}'::jsonb,
  profile_version INTEGER NOT NULL DEFAULT 1 CHECK (profile_version = 1),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (jsonb_typeof(profile) = 'object'),
  CHECK (jsonb_typeof(field_statuses) = 'object')
);
