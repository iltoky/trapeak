# ADR-0003: Neon PostgreSQL и зашифрованные provider connections

- Статус: принято
- Дата: 2026-08-13

## Контекст

Wahoo OAuth требует постоянного multi-tenant хранения provider account ID, статуса подключения, scopes, срока действия и access/refresh tokens. Токены нельзя хранить в Clerk metadata, cookies, environment variables или открытом виде в БД.

## Решение

- PostgreSQL предоставляется Neon через Vercel Marketplace.
- Приложение использует serverless HTTP driver `@neondatabase/serverless` и ленивое создание клиента, чтобы production build не зависел от наличия `DATABASE_URL`.
- На текущем минимальном объёме схемы используется типизированный repository и versioned SQL migrations без ORM. ORM будет повторно оценён перед моделью workout ingestion.
- Access и refresh tokens шифруются AES-256-GCM до записи. Ключи назначения выводятся из `TOKEN_ENCRYPTION_KEY` через HKDF; контекст шифрования привязан к provider, TRAPEAK user ID и типу токена.
- Ограничения БД обеспечивают одно подключение provider на пользователя и запрещают привязку одного provider account к разным пользователям.

## Последствия

- Для запуска OAuth нужны `DATABASE_URL` и случайный base64-encoded 32-byte `TOKEN_ENCRYPTION_KEY`.
- Миграции выполняются командой `npm run db:migrate` до включения маршрутов новой версии.
- Ротация master key потребует отдельной контролируемой re-encryption процедуры.
- Provider tokens расшифровываются только непосредственно перед server-side API-вызовом.

