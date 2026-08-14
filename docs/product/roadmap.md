# Roadmap

| Этап | Результат | Статус |
|---|---|---|
| 0. Product foundation | Лендинг, Clerk auth, dashboard и provider-neutral adapter boundary | Done |
| 1. Auth + Wahoo connection | Безопасное подключение и отключение аккаунта Wahoo | Done |
| 2. Wahoo workout ingestion | Профиль и первая страница завершённых Wahoo-тренировок в БД TRAPEAK | Done |
| 3. MCP | Read-only доступ Claude и ChatGPT к данным пользователя | Done |
| 4. Automatic ingestion | Wahoo workout summary webhooks без дублей | Production verified |
| 5. Nutrition | AI-first журнал питания, дневные итоги и MCP | Production verified |
| 6. Labs / Blood Tests | Структурированные лабораторные показатели и история | Production verified |
| 7. User-controlled deletion | Owner-scoped удаление питания и лабораторных отчётов через AI и dashboard | Published; authenticated deletion e2e pending |
| 8. Training context | История 14–56 дней, сравнение нагрузки, последовательность тренировок и питание для выбора сегодняшней тренировки | Published; authenticated MCP e2e pending |
| 9. User Profile | Цели, здоровье, препараты, долгоживущий контекст и progressive onboarding через AI | Published; authenticated MCP e2e passed |
| 10. Weight history | Дата рождения вместо возраста, датированные измерения веса, динамика и напоминания | Published; production migration applied; authenticated MCP e2e pending |
| 11. Profile data cleanup | Work context без дублирования wearable-метрик и полный каталог таблиц/источников | Implemented; production migration and authenticated MCP e2e pending |
| Public distribution | Публикация TRAPEAK в каталоге ChatGPT и Codex | Paused by product decision |
| После MVP | Garmin после API approval, recovery и другие health-источники | Backlog |

## Wahoo и Open Wearables

Wahoo подключается напрямую через Wahoo Cloud API и общий server-only provider adapter. Это текущий путь MVP.

Аудит Open Wearables завершён. Решение `partial reuse` сохраняется для будущего Garmin-ingestion после получения официального доступа. Собственные auth, публичный API и remote MCP остаются в TRAPEAK.

Условия использования, обязательные меры безопасности и критерии PoC зафиксированы в [ADR-0001](../architecture/adr/0001-open-wearables.md). Production-использование зависит от успешного выполнения PoC и требований безопасности из ADR.

OAuth-задача Wahoo описана в [`TRP-011`](../../tasks/TRP-011-wahoo-oauth.md), ingestion — в [`TRP-012`](../../tasks/TRP-012-wahoo-ingestion.md). Историческая декомпозиция Garmin сохранена в [`tasks/stage-1-auth-and-garmin`](../../tasks/stage-1-auth-and-garmin/README.md) и возобновится после API approval.

Первый remote MCP описан в [`TRP-013`](../../tasks/TRP-013-read-only-mcp.md). Он использует существующую Clerk identity через OAuth 2.1 и не вводит отдельные API keys или собственную систему аккаунтов.

Автоматическая синхронизация описана в [`TRP-014`](../../tasks/TRP-014-wahoo-webhooks.md), публичная подача OpenAI — в [`TRP-015`](../../tasks/TRP-015-public-openai-plugin.md).

Исторический контекст для рекомендации тренировки описан в [`TRP-018`](../../tasks/TRP-018-training-context.md). Собственный Profile с целями, здоровьем, препаратами и progressive onboarding декомпозирован в [`TRP-019`](../../tasks/TRP-019-user-profile.md), история веса — в [`TRP-020`](../../tasks/TRP-020-weight-history.md), а граница между Profile и wearable-данными — в [`TRP-021`](../../tasks/TRP-021-profile-daily-context.md). Следующий продуктовый срез — sleep, daily activity, provider stress, HRV и recovery sources. Публичная подача OpenAI остаётся подготовленной, но не запускается до отдельного решения владельца продукта.
