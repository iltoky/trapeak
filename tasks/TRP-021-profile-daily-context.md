# TRP-021 — Упрощение Profile и каталог данных

Статус: **Implemented; production migration and authenticated MCP e2e pending**

## Description

Убрать из постоянного Profile изменяющиеся lifestyle-показатели, которые должны поступать от wearable, оставить только недоступный часам контекст работы и документировать назначение и источники всех таблиц TRAPEAK.

## Acceptance Criteria

- Profile больше не принимает и не возвращает `sleepSchedule`, `dailyActivityLevel`, `stressLevel`, `caffeineUse` и `alcoholUse`.
- Legacy `workPattern` переносится без потери данных в `workActivityContext`.
- Сон, дневная активность, provider stress и recovery явно отмечаются как динамические wearable-данные и `unavailable`, пока ingestion не реализован.
- Кофеин и алкоголь не являются постоянными Profile-полями; конкретный напиток может быть частью питания по явной команде.
- Completeness пересчитан на 100 баллов без удалённых полей.
- Wiki описывает каждую таблицу, источники заполнения, чтение, ownership, idempotency и удаление.

## Release Actions

1. Применить migration `0009_profile_daily_context.sql` после `0008_weight_history.sql`.
2. Опубликовать MCP `0.9.2` и открыть новый AI-диалог для обновления schema.
3. Проверить Profile и `get_training_context` на production account.

## Testing Recommendations

- Проверить backward-compatible чтение `workPattern` до migration.
- Проверить перенос значения и field status в `workActivityContext`.
- Убедиться, что удалённые поля отсутствуют в MCP schema и не влияют на completeness.
- Проверить четыре availability flags динамических health-источников.

## QA e2e tests

1. [ ] Применить migration `0009_profile_daily_context.sql`.
2. [ ] Открыть новый AI-диалог и вызвать `get_user_profile`.
3. [ ] Убедиться, что старый work context сохранён под новым именем.
4. [ ] Убедиться, что AI не предлагает постоянные вопросы о сне, стрессе, кофеине и алкоголе.
5. [ ] Вызвать `get_training_context` и проверить `sleepAvailable`, `dailyActivityAvailable`, `stressAvailable` и `recoveryAvailable`.
