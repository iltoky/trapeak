# TRP-009 — Создать UI интеграций и отключение Garmin

## Description

Создать приватную страницу интеграций со статусами Garmin и действиями Connect, Reconnect, Disconnect. Disconnect должен требовать подтверждения, использовать официальный revoke/deauthorization при наличии и безопасно инвалидировать локальные токены.

## Acceptance Criteria

- UI показывает disconnected, pending, connected, reconnect required и temporary error.
- Статус сохраняется после reload и поступает с backend.
- Технические ошибки, scopes и tokens не показываются пользователю.
- Disconnect идемпотентен и недоступен другому пользователю.
- После disconnect token использовать нельзя, повторное подключение возможно.
- Отключение не маскируется под удаление аккаунта или тренировок.
- Текст сообщает, какие данные планируется получать.

## Release Actions

Проверить соответствие логотипа и текстов Garmin branding requirements.

## Testing Recommendations

Проверить все состояния UI, двойной клик, reload, потерю сети и ownership.

## QA e2e tests

1. Connect → connected.
2. Consent denied → понятная ошибка.
3. Connected → disconnect → disconnected.
4. Reconnect после отзыва доступа.

