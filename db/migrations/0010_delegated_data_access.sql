CREATE TABLE data_access_grants (
  id UUID PRIMARY KEY,
  owner_user_id TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  recipient_user_id TEXT,
  permissions TEXT[] NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  invitation_token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT data_access_grants_status_check
    CHECK (status IN ('pending', 'active', 'rejected', 'revoked')),
  CONSTRAINT data_access_grants_permissions_check
    CHECK (
      cardinality(permissions) BETWEEN 1 AND 4
      AND permissions <@ ARRAY['training', 'nutrition', 'health', 'recovery']::TEXT[]
    ),
  CONSTRAINT data_access_grants_not_self_check
    CHECK (recipient_user_id IS NULL OR recipient_user_id <> owner_user_id)
);

CREATE INDEX data_access_grants_owner_idx
  ON data_access_grants (owner_user_id, created_at DESC);

CREATE INDEX data_access_grants_recipient_idx
  ON data_access_grants (recipient_user_id, status, expires_at DESC)
  WHERE recipient_user_id IS NOT NULL;

CREATE INDEX data_access_grants_pending_email_idx
  ON data_access_grants (recipient_email, status, expires_at DESC)
  WHERE status = 'pending';

CREATE TABLE data_access_audit_events (
  id UUID PRIMARY KEY,
  grant_id UUID NOT NULL REFERENCES data_access_grants(id) ON DELETE CASCADE,
  actor_user_id TEXT NOT NULL,
  action TEXT NOT NULL,
  permission TEXT,
  resource_type TEXT,
  oauth_client_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT data_access_audit_action_check
    CHECK (action IN ('created', 'accepted', 'rejected', 'revoked', 'read')),
  CONSTRAINT data_access_audit_permission_check
    CHECK (
      permission IS NULL
      OR permission IN ('training', 'nutrition', 'health', 'recovery')
    )
);

CREATE INDEX data_access_audit_grant_idx
  ON data_access_audit_events (grant_id, created_at DESC);
