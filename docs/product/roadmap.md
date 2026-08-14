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
| 11. Profile data cleanup | Work context без дублирования wearable-метрик и полный каталог таблиц/источников | Published; production migration applied; authenticated MCP e2e pending |
| 12. Public content and SEO | Актуальный лендинг, AI-facing тексты, инструкции, legal/support readiness и SEO-аудит | Published; production verified |
| 13. Wahoo Production approval | Перевод Wahoo developer application из Sandbox в Production после внешнего review | Next; external approval required |
| 14. OpenAI public plugin | Подача MCP-backed plugin в общий Plugins Directory ChatGPT и Codex | Planned; depends on 12–13 |
| 15. Delegated data access | Read-only доступ тренера, врача или диетолога к выбранным группам данных с consent, expiry, revoke и audit | Published; production migration applied; authenticated e2e pending |
| 16. AI client permissions | Отдельные разрешения для каждого подключённого AI по категориям `training`, `nutrition`, `health` и операциям `read/write` | Planned; security design next |
| После MVP | Sleep, daily activity, provider stress, HRV и recovery sources; Garmin после API approval | Backlog |

## Ближайший порядок работ

1. Закрыть отложенные authenticated e2e для Profile cleanup, training context, weight history и [делегированного доступа](../../tasks/TRP-024-delegated-data-access.md).
2. Спроектировать [разрешения для каждого подключённого AI](../../tasks/TRP-025-ai-client-permissions.md): серверную матрицу категорий и операций, безопасный default для новых и уже подключённых клиентов и пересечение с human grant.
3. Продолжить [Wahoo Production approval](../../tasks/TRP-023-wahoo-production-approval.md), затем подготовить reviewer fixture, выполнить OpenAI Scan Tools и отправить [TRP-015](../../tasks/TRP-015-public-openai-plugin.md) на review.

## Что из продуктовых идей можно использовать уже сейчас

| Идея | Фактическое состояние | Решение |
|---|---|---|
| История не зависит от AI-провайдера | Уже реализовано архитектурой TRAPEAK | Сразу вынести в лендинг, listing и инструкции |
| Запись через один AI, анализ и графики через другой | Уже поддерживается единым MCP и хранилищем | Добавить публичный сценарий и starter prompts |
| Тренировка на сегодня с учётом прошлых нагрузок | `get_training_context` реализован | Закрыть e2e и показать как основной use case |
| Короткий onboarding через один промпт | Profile и completeness реализованы | Упростить инструкции и дать копируемый стартовый промпт |
| Доступ тренеру, врачу или диетологу | Реализованы grants по email и трём категориям | Закрыть authenticated e2e и наблюдать audit в production |
| Разные разрешения для каждого AI | `clientId` уже фиксируется в audit, но пока не ограничивает данные | Реализовать отдельные client policies по [TRP-025](../../tasks/TRP-025-ai-client-permissions.md) |
| Сон, дневная активность, stress, HRV и recovery | Нет активного provider source | Оставить backlog до выбора и одобрения источника |
| Reusable-шаблон подключения новых интеграций | Ранее отложен | Не включать в ближайший цикл |

## Wahoo и Open Wearables

Wahoo подключается напрямую через Wahoo Cloud API и общий server-only provider adapter. Это текущий путь MVP.

Аудит Open Wearables завершён. Решение `partial reuse` сохраняется для будущего Garmin-ingestion после получения официального доступа. Собственные auth, публичный API и remote MCP остаются в TRAPEAK.

Условия использования, обязательные меры безопасности и критерии PoC зафиксированы в [ADR-0001](../architecture/adr/0001-open-wearables.md). Production-использование зависит от успешного выполнения PoC и требований безопасности из ADR.

OAuth-задача Wahoo описана в [`TRP-011`](../../tasks/TRP-011-wahoo-oauth.md), ingestion — в [`TRP-012`](../../tasks/TRP-012-wahoo-ingestion.md). Историческая декомпозиция Garmin сохранена в [`tasks/stage-1-auth-and-garmin`](../../tasks/stage-1-auth-and-garmin/README.md) и возобновится после API approval.

Первый remote MCP описан в [`TRP-013`](../../tasks/TRP-013-read-only-mcp.md). Он использует существующую Clerk identity через OAuth 2.1 и не вводит отдельные API keys или собственную систему аккаунтов.

Автоматическая синхронизация описана в [`TRP-014`](../../tasks/TRP-014-wahoo-webhooks.md), публичная подача OpenAI — в [`TRP-015`](../../tasks/TRP-015-public-openai-plugin.md), а внешний Wahoo Production review — в [`TRP-023`](../../tasks/TRP-023-wahoo-production-approval.md).

Исторический контекст для рекомендации тренировки описан в [`TRP-018`](../../tasks/TRP-018-training-context.md). Собственный Profile с целями, здоровьем, препаратами и progressive onboarding декомпозирован в [`TRP-019`](../../tasks/TRP-019-user-profile.md), история веса — в [`TRP-020`](../../tasks/TRP-020-weight-history.md), а граница между Profile и wearable-данными — в [`TRP-021`](../../tasks/TRP-021-profile-daily-context.md). Делегированный доступ реализован по [`TRP-024`](../../tasks/TRP-024-delegated-data-access.md), а отдельные ограничения для каждого AI запланированы в [`TRP-025`](../../tasks/TRP-025-ai-client-permissions.md). Публичная подача больше не paused: content/legal/SEO readiness опубликован, далее идут Wahoo Production approval и OpenAI review.
