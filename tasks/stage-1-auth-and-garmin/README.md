# Этап 1 — авторизация и подключение Garmin

## Цель

Пользователь регистрируется в TRAPEAK, входит, подключает Garmin через официальный flow, видит статус и может отключить интеграцию. Получение тренировок не входит в этот этап.

## Зависимости и порядок

| ID | Задача | Зависит от | Исполнитель |
|---|---|---|---|
| TRP-001 | Архитектура и стек | — | Claude + owner decision |
| TRP-002 | Основа проекта | TRP-001 | Claude |
| TRP-003 | БД и пользователь | TRP-002 | Claude |
| TRP-004 | Авторизация TRAPEAK | TRP-003 | Claude |
| TRP-005 | Доступ Garmin | — | Владелец проекта |
| TRP-006 | Модель подключения | TRP-003 | Claude |
| TRP-007 | Garmin adapter и OAuth flow | TRP-004, TRP-005, TRP-006 | Claude |
| TRP-008 | Lifecycle токенов | TRP-007 | Claude |
| TRP-009 | UI интеграций и disconnect | TRP-007, TRP-008 | Claude |
| TRP-010 | Наблюдаемость, CI и e2e | TRP-004, TRP-009 | Claude |

TRP-005 запускается параллельно сразу. Без одобрения Garmin TRP-007 можно подготовить с mock adapter, но нельзя считать завершённой реальную интеграцию.

## Definition of Done этапа

- регистрация/вход и защищённая зона работают;
- реальный Garmin flow проверен в evaluation environment;
- подключение принадлежит конкретному пользователю;
- токены защищены и обслуживаются согласно документации Garmin;
- status, reconnect и disconnect работают;
- критические сценарии покрыты тестами;
- CI проходит, секретов в репозитории и логах нет.

## Задачи

- [TRP-001](TRP-001-architecture.md)
- [TRP-002](TRP-002-project-bootstrap.md)
- [TRP-003](TRP-003-users-and-database.md)
- [TRP-004](TRP-004-user-authentication.md)
- [TRP-005](TRP-005-garmin-access.md)
- [TRP-006](TRP-006-provider-connection.md)
- [TRP-007](TRP-007-garmin-oauth.md)
- [TRP-008](TRP-008-token-lifecycle.md)
- [TRP-009](TRP-009-integrations-ui.md)
- [TRP-010](TRP-010-quality-and-observability.md)

