# Roadmap

| Этап | Результат | Статус |
|---|---|---|
| 0. Architecture audit | Решение `partial reuse` по Open Wearables зафиксировано; остаются решения по auth, deployment и финальному стеку | In progress |
| 1. Auth + Garmin connection | Безопасное подключение аккаунта Garmin | Planned |
| 2. Workout ingestion | История и новые тренировки в БД TRAPEAK | Planned |
| 3. MCP | Доступ Claude и ChatGPT к данным пользователя | Planned |
| После MVP | Recovery, другие wearable- и health-источники | Backlog |

## Open Wearables

Аудит Open Wearables завершён. Принято решение `partial reuse`: использовать Open Wearables как закрытый внутренний слой Garmin-ingestion и нормализации, сохранив собственные auth, публичный API и remote MCP в TRAPEAK.

Условия использования, обязательные меры безопасности и критерии PoC зафиксированы в [ADR-0001](../architecture/adr/0001-open-wearables.md). Production-использование зависит от успешного выполнения PoC и требований безопасности из ADR.

Подробная декомпозиция первого этапа находится в [`tasks/stage-1-auth-and-garmin`](../../tasks/stage-1-auth-and-garmin/README.md).
