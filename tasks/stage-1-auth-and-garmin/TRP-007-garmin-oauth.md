# TRP-007 — Реализовать Garmin adapter и подключение

## Description

По подтверждённой документации Garmin реализовать server-side adapter и flow подключения: start, callback, exchange, получение provider user ID и сохранение connection. До доступа Garmin допустим mock adapter за тем же интерфейсом, но задача остаётся заблокированной для real integration.

## Acceptance Criteria

- Только авторизованный пользователь начинает flow.
- `state` случайный, одноразовый, TTL-limited и привязан к пользователю.
- PKCE применяется, если требуется документацией.
- Callback URL/redirect allowlisted; code и tokens не попадают на frontend.
- Success создаёт/обновляет ровно одно подключение.
- Invalid/expired/reused state отклоняется.
- Consent denial и Garmin errors дают безопасные пользовательские ошибки.
- Реальные endpoints и параметры подтверждены ссылкой/ссылками на внутреннюю документацию.
- Unit/integration tests используют mock Garmin.

## Release Actions

Добавить Garmin application credentials и callback URL в secrets/config окружения.

## Testing Recommendations

Проверить CSRF, callback replay, open redirect, ownership, timeout и временные ошибки Garmin.

## QA e2e tests

1. Успешное реальное подключение в evaluation environment.
2. Отказ на consent screen.
3. Неверный, истёкший и повторный state.
4. Повторное подключение без дубля.

