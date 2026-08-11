# TRP-008 — Реализовать lifecycle Garmin-токенов

## Description

Реализовать expiry, refresh/rotation, revoke detection и reconnect строго согласно Garmin docs. Если протокол не использует refresh token, отразить фактический механизм и не добавлять вымышленную логику.

## Acceptance Criteria

- Валидность проверяется до обращения к Garmin.
- Обновление токена защищено от параллельной гонки.
- Rotation сохраняется атомарно.
- Временная ошибка не помечается как отзыв доступа.
- Неустранимая ошибка переводит connection в `reconnect_required` либо подтверждённый эквивалент.
- Токены и ответы token endpoint не логируются.
- Mock tests покрывают success, concurrency, transient failure и revoked access.

## Release Actions

Нет дополнительных, если secrets уже настроены.

## Testing Recommendations

Проверить параллельные запросы и сбой между получением и сохранением нового токена.

## QA e2e tests

1. Истечение с успешным восстановлением доступа.
2. Отозванный доступ требует reconnect.
3. Временный сбой сохраняет подключение.

