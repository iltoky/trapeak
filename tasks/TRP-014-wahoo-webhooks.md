# TRP-014 — автоматическая синхронизация Wahoo через webhooks

Статус: **Production verified**

## Описание

Автоматически сохранять новую или обновлённую завершённую тренировку после `workout_summary` webhook от Wahoo. Ручная синхронизация остаётся fallback-механизмом.

## Acceptance criteria

- Endpoint `POST /api/integrations/wahoo/webhook` принимает только JSON ограниченного размера.
- `webhook_token` сравнивается безопасно с `WAHOO_WEBHOOK_TOKEN`; неверный токен отклоняется.
- Поддерживается только `workout_summary`; неизвестные аутентифицированные события подтверждаются без записи данных.
- Wahoo user ID сопоставляется только с активной записью `provider_connections`.
- Activity нормализуется тем же кодом, что и ручной импорт.
- Повторная доставка обновляет `(user_id, provider, provider_activity_id)` и не создаёт дубль.
- В raw payload activity не сохраняется `webhook_token`.
- Ошибка БД возвращает non-200, чтобы Wahoo выполнил документированные повторные доставки.

## Release actions

1. Создать случайный `WAHOO_WEBHOOK_TOKEN` и добавить его в Production secrets Vercel.
2. В Wahoo Developer Portal указать тот же token, URL `https://trapeak.com/api/integrations/wahoo/webhook` и включить webhook.
3. Создать или обновить тестовую тренировку и проверить автоматическое появление в TRAPEAK без ручной кнопки.
4. Повторно доставить тот же fixture и подтвердить отсутствие дублей.

## Testing recommendations

- Проверять корректный token, неверный token, malformed payload и неизвестный event type.
- Не логировать payload, `webhook_token`, provider tokens и FIT URL.
- Сохранять ручной sync как recovery path при временной недоступности webhook.

## QA e2e tests

1. [x] Wahoo получает `200` на корректный `workout_summary` webhook.
2. [x] Новая тренировка появляется в MCP без ручной синхронизации.
3. [ ] Повторная доставка не увеличивает число записей.
4. [ ] Изменение тренировки обновляет существующую запись.
5. [x] Неверный token получает `401` и не меняет БД.

## Production verification

14 августа 2026 года Production secret и Wahoo Developer Portal настроены. Реальный `workout_summary` webhook получил `200`, а тренировка появилась в MCP без ручной синхронизации. Запрос с неверным token вернул `401`; runtime errors не обнаружены. Повторная доставка того же webhook и обновление тренировки остаются отдельными e2e edge-case проверками.
