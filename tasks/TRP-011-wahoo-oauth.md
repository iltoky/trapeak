# TRP-011 — Wahoo OAuth и подключение

## Описание

Реализовать безопасное подключение Wahoo к авторизованному аккаунту TRAPEAK: start, callback, token exchange, получение provider user ID, зашифрованное хранение connection, refresh и disconnect/revoke.

## Acceptance criteria

- Wahoo adapter реализует общий provider contract и доступен только на сервере.
- OAuth `state` одноразовый, короткоживущий, привязан к текущему пользователю и защищает callback от replay/CSRF.
- Client secret, authorization code и токены не попадают в браузер, URL, логи или пользовательские ошибки.
- Access и refresh tokens хранятся с authenticated encryption; refresh rotation сохраняется атомарно.
- Один Wahoo account нельзя незаметно связать с несколькими TRAPEAK users.
- Dashboard показывает состояния `not_connected`, `connecting`, `connected`, `reconnect_required`, `error`.
- Disconnect вызывает Wahoo revoke/deauthorization и безопасно очищает локальное подключение.
- Unit/integration tests покрывают happy path, отказ consent, неверный/replayed state, token errors, refresh rotation и revoke.

## Release actions

- Добавить `WAHOO_CLIENT_ID`, `WAHOO_CLIENT_SECRET`, `APP_URL`, `DATABASE_URL` и `TOKEN_ENCRYPTION_KEY` в Preview secrets.
- Зарегистрировать точный Preview callback URL в Wahoo Developer Portal.
- Перед production-релизом отдельно зарегистрировать callback на `trapeak.com` и добавить Production secrets.

## Testing recommendations

- В CI полностью mock'ать Wahoo HTTP API; реальные credentials не требуются.
- В Preview проверить connect, consent denial, повторный callback, refresh, disconnect и повторное подключение.
- Убедиться, что в server/client logs и error tracking отсутствуют code, client secret и tokens.

## QA end-to-end

1. Войти в TRAPEAK и открыть integrations/dashboard.
2. Нажать `Connect Wahoo`, подтвердить consent и вернуться в TRAPEAK.
3. Проверить Wahoo user identity и статус `connected`.
4. Получить первую доступную тренировку и проверить ownership.
5. Отключить Wahoo, подтвердить revoke и отсутствие дальнейшего API-доступа.

