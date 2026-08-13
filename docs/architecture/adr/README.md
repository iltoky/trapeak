# Architecture Decision Records

Каждое существенное решение оформляется отдельным ADR: контекст, варианты, принятое решение и последствия.

## Принятые решения

- [ADR-0001: частичное использование Open Wearables](0001-open-wearables.md) — принято для PoC; Open Wearables используется только как закрытый слой ingestion и нормализации.
- [ADR-0002: Clerk и provider-neutral adapter boundary](0002-auth-and-provider-boundary.md) — Clerk изолирован как identity/session provider, wearable API подключаются через единый server-only контракт.
- [ADR-0003: Neon PostgreSQL и зашифрованные provider connections](0003-provider-connections-storage.md) — serverless PostgreSQL, versioned migrations и AES-256-GCM для provider tokens.

Следующие ADR должны зафиксировать workout ingestion deployment и повторно оценить ORM перед расширением модели данных.
