# TRP-013 — read-only remote MCP

Статус: **Done**

## Описание

Предоставить ChatGPT, Claude и другим совместимым MCP-клиентам безопасный read-only доступ к нормализованным данным авторизованного пользователя TRAPEAK. Первый вертикальный срез остаётся data-only: без собственного AI-чата, аналитического dashboard и MCP UI.

## Acceptance criteria

- Stable Streamable HTTP endpoint доступен по `https://trapeak.com/mcp`.
- MCP использует Clerk как OAuth 2.1 authorization server.
- Каждый tool call получает `user_id` только из проверенного Clerk OAuth token.
- Неавторизованный MCP request получает `401` и ссылку на protected resource metadata.
- Публично доступны OAuth protected resource и authorization server metadata.
- `get_athlete_profile` возвращает только нормализованные поля профиля пользователя.
- `list_activities` возвращает последние активности пользователя и поддерживает безопасные фильтры по provider, датам, типу и limit.
- `get_activity` принимает только внутренний activity ID и дополнительно проверяет ownership.
- Все инструменты отмечены `readOnlyHint: true`.
- Raw provider payload, provider activity ID, OAuth tokens и внутренний Clerk user ID не возвращаются клиенту.
- Поведение проверено typecheck, unit tests, production build и MCP HTTP smoke test.

## Release actions

- В production Clerk включить Dynamic Client Registration для первого developer-mode теста либо заранее зарегистрировать поддерживаемый CIMD client.
- Настроить default OAuth scopes: `openid`, `profile`, `email`.
- Опубликовать проверенный релиз напрямую в `main`.
- Проверить metadata endpoints и `401 WWW-Authenticate` на production.
- Подключить `https://trapeak.com/mcp` в ChatGPT Developer mode и вызвать все три инструмента.

## Testing recommendations

- Проверять identity extraction отдельно от HTTP transport.
- Проверять inclusive date filters и ownership для неизвестного activity ID.
- Не использовать production raw payload в unit tests.
- Не логировать bearer token, Clerk user ID и MCP tool results с fitness data.

## QA e2e tests

1. [x] Подключить TRAPEAK как developer-mode app в ChatGPT.
2. [x] Завершить Clerk OAuth под production TRAPEAK account.
3. [x] Запросить профиль спортсмена.
4. [x] Запросить две последние тренировки.
5. [x] Получить детали одной тренировки по ID из предыдущего ответа.
6. [ ] Убедиться, что неизвестный ID не возвращает чужие данные.
