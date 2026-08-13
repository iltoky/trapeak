# Roadmap

| Этап | Результат | Статус |
|---|---|---|
| 0. Product foundation | Лендинг, Clerk auth, dashboard и provider-neutral adapter boundary | Done |
| 1. Auth + Wahoo connection | Безопасное подключение и отключение аккаунта Wahoo | In progress |
| 2. Wahoo workout ingestion | История и новые Wahoo-тренировки в БД TRAPEAK | Planned |
| 3. MCP | Доступ Claude и ChatGPT к данным пользователя | Planned |
| После MVP | Garmin после API approval, recovery и другие health-источники | Backlog |

## Wahoo и Open Wearables

Wahoo подключается напрямую через Wahoo Cloud API и общий server-only provider adapter. Это текущий путь MVP.

Аудит Open Wearables завершён. Решение `partial reuse` сохраняется для будущего Garmin-ingestion после получения официального доступа. Собственные auth, публичный API и remote MCP остаются в TRAPEAK.

Условия использования, обязательные меры безопасности и критерии PoC зафиксированы в [ADR-0001](../architecture/adr/0001-open-wearables.md). Production-использование зависит от успешного выполнения PoC и требований безопасности из ADR.

Текущая задача Wahoo описана в [`TRP-011`](../../tasks/TRP-011-wahoo-oauth.md). Историческая декомпозиция Garmin сохранена в [`tasks/stage-1-auth-and-garmin`](../../tasks/stage-1-auth-and-garmin/README.md) и возобновится после API approval.
