# TRP-005 — Получить официальный доступ Garmin

## Description

Организационная задача владельца проекта. Подать заявку в Garmin Connect Developer Program для TRAPEAK и запросить Activity API. Получить Developer Portal, evaluation environment, credentials и закрытую документацию.

## Acceptance Criteria

- Заявка отправлена, статус и контакт Garmin зафиксированы.
- После одобрения создано тестовое приложение.
- Зарегистрированы допустимые callback URL.
- Зафиксированы scopes, protocol/endpoints, token lifetime/rotation, revoke/deauthorization, rate limits, branding и production approval.
- Credentials сохранены в secrets, а не в Git или задаче.

## Release Actions

Для production отдельно зарегистрировать production callback и credentials.

## Testing Recommendations

Провести smoke test в evaluation environment только после реализации TRP-007.

## QA e2e tests

Проверить согласие, отказ, повторное подключение и отзыв доступа с тестовым Garmin-пользователем.

