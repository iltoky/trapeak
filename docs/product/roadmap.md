# Roadmap

| Этап | Результат | Статус |
|---|---|---|
| 0. Product foundation | Лендинг, Clerk auth, dashboard и provider-neutral adapter boundary | Done |
| 1. Auth + Wahoo connection | Безопасное подключение и отключение аккаунта Wahoo | Done |
| 2. Wahoo workout ingestion | Профиль и первая страница завершённых Wahoo-тренировок в БД TRAPEAK | Done |
| 3. MCP | Read-only доступ Claude и ChatGPT к данным пользователя | In progress |
| После MVP | Garmin после API approval, recovery и другие health-источники | Backlog |

## Wahoo и Open Wearables

Wahoo подключается напрямую через Wahoo Cloud API и общий server-only provider adapter. Это текущий путь MVP.

Аудит Open Wearables завершён. Решение `partial reuse` сохраняется для будущего Garmin-ingestion после получения официального доступа. Собственные auth, публичный API и remote MCP остаются в TRAPEAK.

Условия использования, обязательные меры безопасности и критерии PoC зафиксированы в [ADR-0001](../architecture/adr/0001-open-wearables.md). Production-использование зависит от успешного выполнения PoC и требований безопасности из ADR.

OAuth-задача Wahoo описана в [`TRP-011`](../../tasks/TRP-011-wahoo-oauth.md), ingestion — в [`TRP-012`](../../tasks/TRP-012-wahoo-ingestion.md). Историческая декомпозиция Garmin сохранена в [`tasks/stage-1-auth-and-garmin`](../../tasks/stage-1-auth-and-garmin/README.md) и возобновится после API approval.

Первый remote MCP описан в [`TRP-013`](../../tasks/TRP-013-read-only-mcp.md). Он использует существующую Clerk identity через OAuth 2.1 и не вводит отдельные API keys или собственную систему аккаунтов.
