# TRP-012 — Wahoo workout ingestion

Статус: **Done**

## Описание

Получать разрешённые Wahoo profile/workout data на сервере, сохранять исходные records и нормализованные поля для будущего read-only MCP. Первый вертикальный срез — ручная идемпотентная синхронизация 30 последних workout records из dashboard.

## Acceptance criteria

- Wahoo adapter получает профиль и paginated workout list только с server-side access token.
- Planned workout без `workout_summary` не считается завершённой активностью.
- Профиль и завершённые активности сохраняются одновременно с sync state.
- Повторная синхронизация обновляет activity по `(user_id, provider, provider_activity_id)` без дублей.
- Нормализованы базовые поля времени, типа, длительности, дистанции, высоты, калорий, пульса, каденса, скорости и мощности.
- Raw provider payload остаётся только в серверной БД и не возвращается dashboard.
- Истёкший access token обновляется непосредственно перед API-вызовом; rotating refresh token сохраняется вместе с новым access token.
- Dashboard показывает только статус синхронизации и количество сохранённых тренировок, без аналитической визуализации.
- Disconnect пытается отозвать Wahoo permissions и всегда удаляет локальные токены, если provider access уже недоступен.

## Release actions

- Применить `db/migrations/0002_provider_data.sql` к рабочей Neon database до публикации кода.
- После production deployment выполнить ручную синхронизацию под подключённым Wahoo account.
- Проверить ownership и отсутствие дублей повторным запуском sync.
- Публиковать напрямую в `main` после обязательных typecheck, tests, production build и подготовки production Wahoo callback/secrets.

## Testing recommendations

- Mock Wahoo profile/workout responses в unit tests.
- Проверить decimal strings, nullable summary и некорректные provider responses.
- Проверить refresh safety window и rotating token replacement.
- Не логировать access token, refresh token, Wahoo response body или полный raw payload.

## QA e2e tests

1. [x] Открыть dashboard с уже подключённым Wahoo.
2. [x] Нажать `Sync Wahoo data` и дождаться success notice.
3. [x] Проверить profile, sync state и число завершённых activities в БД.
4. [x] Повторить sync и убедиться, что число записей не удвоилось.
5. [x] Проверить refresh истёкшего access token в автоматическом тесте.
6. [x] Отключить и повторно подключить Wahoo, затем снова выполнить sync.

Production-проверка завершена 13 августа 2026 года: Wahoo вернул две активности, в `fitness_activities` сохранились две уникальные записи, duplicate groups — `0`.
