CREATE TABLE IF NOT EXISTS provider_connections (
  id UUID PRIMARY KEY,
  user_id TEXT NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('wahoo', 'garmin', 'suunto')),
  provider_user_id TEXT NOT NULL,
  provider_display_name TEXT,
  status TEXT NOT NULL CHECK (
    status IN ('connected', 'reconnect_required', 'disconnected', 'error')
  ),
  access_token_ciphertext TEXT,
  refresh_token_ciphertext TEXT,
  token_expires_at TIMESTAMPTZ,
  scopes TEXT[] NOT NULL DEFAULT '{}',
  last_error_code TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  disconnected_at TIMESTAMPTZ,
  CONSTRAINT provider_connections_user_provider_unique UNIQUE (user_id, provider),
  CONSTRAINT provider_connections_provider_account_unique UNIQUE (provider, provider_user_id),
  CONSTRAINT provider_connections_connected_tokens CHECK (
    status <> 'connected' OR access_token_ciphertext IS NOT NULL
  )
);

-- statement-breakpoint
CREATE INDEX IF NOT EXISTS provider_connections_user_id_idx
  ON provider_connections (user_id);
