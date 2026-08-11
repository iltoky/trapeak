# TRP-010 — Добавить наблюдаемость, CI и итоговые e2e

## Description

Добавить структурированные безопасные события Garmin connection, request/correlation ID, secret redaction, CI и полный регрессионный набор первого этапа.

События: connection started/completed/failed, token refreshed, reconnect required, disconnected. Не логировать authorization code, tokens, client secret, cookies и auth headers.

## Acceptance Criteria

- По correlation ID диагностируется неуспешный flow без раскрытия secrets.
- Logger redaction протестирован.
- PR CI выполняет install, format check, lint, typecheck, unit/integration tests, migration check и build.
- Garmin полностью mock'ается в CI; реальные credentials не нужны.
- Secret scanning настроен, если доступен выбранному GitHub plan.
- Все QA-сценарии этапа автоматизированы либо явно отмечены manual с причиной.

## Release Actions

Настроить обязательные branch checks и production log retention/redaction.

## Testing Recommendations

Проверить логи намеренно неуспешных auth/OAuth сценариев и просканировать репозиторий на тестовые secrets.

## QA e2e tests

1. Регистрация/вход/logout и private route.
2. OAuth success, denial, invalid/expired/reused state.
3. Token expiry, transient failure и revoked access.
4. Disconnect/reconnect.
5. Попытка доступа к connection другого пользователя.

