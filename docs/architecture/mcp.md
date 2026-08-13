# Remote MCP

Статус: **Implemented / awaiting production OAuth configuration**

## Назначение

Remote MCP — основной интерфейс MVP TRAPEAK для AI assistants. Он предоставляет только нормализованные пользовательские данные и не заменяет dashboard аналитикой.

Production endpoint: `https://trapeak.com/mcp`.

## Аутентификация и ownership

Clerk выступает OAuth 2.1 authorization server. ChatGPT или другой MCP-клиент запускает OAuth flow, пользователь входит в TRAPEAK и подтверждает доступ. Каждый MCP request содержит Clerk-issued bearer token. Сервер проверяет token и извлекает `userId`; параметры инструментов не могут переопределить identity.

OAuth discovery endpoints:

- `/.well-known/oauth-protected-resource/mcp`;
- `/.well-known/oauth-authorization-server`.

Все SQL-запросы MCP обязательно фильтруются по проверенному `user_id`. `get_activity` дополнительно связывает внутренний activity UUID с тем же владельцем. Неавторизованный request получает RFC 9728-compatible `WWW-Authenticate` challenge.

## Инструменты v0.3.0

| Tool | Назначение | Изменяет данные |
|---|---|---|
| `get_athlete_profile` | Нормализованные поля профиля из подключённых providers | Нет |
| `list_activities` | Список тренировок с provider/date/type/limit filters | Нет |
| `get_activity` | Все доступные нормализованные поля одной тренировки | Нет |

Все инструменты имеют `readOnlyHint: true`, `destructiveHint: false` и `openWorldHint: false`.

## Граница данных

MCP не возвращает:

- OAuth access/refresh tokens;
- Clerk user ID;
- Wahoo user ID и provider activity ID;
- raw provider payload;
- данные другого пользователя;
- значения, которых нет в нормализованной БД TRAPEAK.

Для связи между `list_activities` и `get_activity` используется внутренний TRAPEAK UUID.

## Следующие срезы

- production-проверка в ChatGPT Developer mode;
- golden prompt tests;
- MCP-compatible подключение Claude;
- webhooks и автоматическое обновление Wahoo data;
- расширение нормализованной модели при появлении более детальных provider data.
