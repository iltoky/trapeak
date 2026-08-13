CREATE TABLE IF NOT EXISTS provider_profiles (
  id UUID PRIMARY KEY,
  user_id TEXT NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('wahoo', 'garmin', 'suunto')),
  provider_user_id TEXT NOT NULL,
  display_name TEXT,
  height_meters DOUBLE PRECISION,
  weight_kilograms DOUBLE PRECISION,
  birth_date DATE,
  gender_code INTEGER,
  provider_created_at TIMESTAMPTZ,
  provider_updated_at TIMESTAMPTZ,
  raw_payload JSONB NOT NULL,
  synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT provider_profiles_user_provider_unique UNIQUE (user_id, provider),
  CONSTRAINT provider_profiles_connection_fk
    FOREIGN KEY (user_id, provider)
    REFERENCES provider_connections (user_id, provider)
    ON DELETE CASCADE
);

-- statement-breakpoint
CREATE TABLE IF NOT EXISTS fitness_activities (
  id UUID PRIMARY KEY,
  user_id TEXT NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('wahoo', 'garmin', 'suunto')),
  provider_activity_id TEXT NOT NULL,
  name TEXT,
  activity_type_id TEXT,
  started_at TIMESTAMPTZ NOT NULL,
  duration_seconds DOUBLE PRECISION,
  active_duration_seconds DOUBLE PRECISION,
  paused_duration_seconds DOUBLE PRECISION,
  distance_meters DOUBLE PRECISION,
  elevation_gain_meters DOUBLE PRECISION,
  calories_kilocalories DOUBLE PRECISION,
  average_heart_rate_bpm DOUBLE PRECISION,
  average_cadence_rpm DOUBLE PRECISION,
  average_speed_meters_per_second DOUBLE PRECISION,
  average_power_watts DOUBLE PRECISION,
  normalized_power_watts DOUBLE PRECISION,
  training_stress_score DOUBLE PRECISION,
  work_joules DOUBLE PRECISION,
  time_zone TEXT,
  is_manual BOOLEAN,
  is_edited BOOLEAN,
  source_app_id TEXT,
  provider_created_at TIMESTAMPTZ,
  provider_updated_at TIMESTAMPTZ,
  raw_payload JSONB NOT NULL,
  synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fitness_activities_provider_id_unique
    UNIQUE (user_id, provider, provider_activity_id),
  CONSTRAINT fitness_activities_connection_fk
    FOREIGN KEY (user_id, provider)
    REFERENCES provider_connections (user_id, provider)
    ON DELETE CASCADE
);

-- statement-breakpoint
CREATE INDEX IF NOT EXISTS fitness_activities_user_started_at_idx
  ON fitness_activities (user_id, started_at DESC);

-- statement-breakpoint
CREATE TABLE IF NOT EXISTS provider_sync_state (
  user_id TEXT NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('wahoo', 'garmin', 'suunto')),
  last_synced_at TIMESTAMPTZ,
  provider_total INTEGER NOT NULL DEFAULT 0,
  last_imported_count INTEGER NOT NULL DEFAULT 0,
  last_error_code TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, provider),
  CONSTRAINT provider_sync_state_connection_fk
    FOREIGN KEY (user_id, provider)
    REFERENCES provider_connections (user_id, provider)
    ON DELETE CASCADE
);
