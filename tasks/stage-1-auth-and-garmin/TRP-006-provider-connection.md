# TRP-006 — Создать модель Garmin-подключения

## Description

Создать модель подключения провайдера и server-only repository/service. Минимальные данные: `id`, `user_id`, `provider`, provider user ID, status, encrypted token fields, expiry/scopes при наличии, timestamps и безопасный код последней ошибки.

Реализовать шифрование через проверенную библиотеку с authenticated encryption. Не создавать универсальную платформу интеграций сверх потребности Garmin.

## Acceptance Criteria

- Не более одного активного Garmin connection на пользователя.
- Ограничения предотвращают незаметное связывание одного Garmin account с разными пользователями.
- Токены шифруются до записи и расшифровываются только server-side.
- Ключ шифрования находится вне БД.
- Повторное подключение обновляет запись предсказуемо и идемпотентно.
- Миграции и unit/integration tests проходят без реальных credentials.

## Release Actions

Добавить `TOKEN_ENCRYPTION_KEY` в secrets и применить миграцию.

## Testing Recommendations

Проверить ciphertext tampering, неверный ключ, уникальные ограничения и отсутствие plaintext в БД/логах.

## QA e2e tests

Не применимо до OAuth flow.

