# Интеграция Wahoo

Статус: **Production verified**

TRAPEAK подключает Wahoo напрямую через Wahoo Cloud API и общий server-only provider adapter. Клиентский secret и пользовательские токены не передаются в браузер.

## OAuth flow

1. Авторизованный пользователь начинает подключение в TRAPEAK.
2. Сервер создаёт короткоживущий одноразовый `state`, привязанный к пользователю и callback.
3. Пользователь подтверждает доступ на стороне Wahoo.
4. Callback проверяет `state`, обменивает authorization code на токены и получает Wahoo user profile.
5. Токены сохраняются в БД только в зашифрованном виде.

Callback route:

- production: `https://trapeak.com/api/integrations/wahoo/callback`;
- Preview: тот же path на стабильном Preview-домене, указанном в `APP_URL`.

Используемые scopes: `user_read`, `workouts_read`, `offline_data`. `user_read` требуется для API-вызовов, а `offline_data` — для webhooks и фоновой синхронизации.

## Token lifecycle

- Access token действует примерно два часа.
- Refresh token ротируется при обновлении; новое значение сохраняется атомарно вместе с access token.
- С 1 января 2026 года Wahoo допускает не более 10 неотозванных access tokens на пользователя.
- Токен обновляется непосредственно перед требующим его API-вызовом, а не заранее: предыдущий токен отзывается после успешного вызова с новым.
- Отключение вызывает `DELETE /v1/permissions`, после чего локальные токены инвалидируются.

Если тот же Wahoo-профиль позднее авторизован из другого TRAPEAK account, старая связь может быть освобождена только в статусе `disconnected`. Удаление старой связи и создание новой выполняются атомарно после подтверждения Wahoo account ID. Активную связь другого TRAPEAK account перехватить нельзя.

## Workout ingestion

- список тренировок: `GET /v1/workouts`;
- сводка тренировки: `GET /v1/workouts/:id/workout_summary`;
- новые и изменённые тренировки могут поступать через webhooks.

Первый ingestion-срез запускается пользователем из dashboard и получает Wahoo profile вместе с первой страницей из 30 последних workout records. В `fitness_activities` попадают только завершённые записи с `workout_summary`; planned workouts остаются вне activity history. Повторный импорт обновляет запись по provider activity ID и не создаёт дубль.

Нормализуются основные поля, нужные будущему MCP: начало, тип, длительность, дистанция, набор высоты, калории, средний пульс, каденс, скорость, мощность, normalized power и TSS. Исходный workout JSON сохраняется в закрытой серверной БД для безопасного расширения модели без повторной загрузки.

Если access token истёк или истекает в течение минуты, refresh выполняется непосредственно перед синхронизацией, а новая rotating token pair атомарно заменяет предыдущую в зашифрованном connection record.

Защищённый webhook автоматически сохраняет новые и изменённые завершённые тренировки; production e2e проверен 14 августа 2026 года. Следующий срез ingestion: обработка удалений и фоновая догрузка истории старше первых 30 записей.

Wahoo Cloud API не возвращает завершённые тренировки, которые изначально поступили в Wahoo из сторонних приложений. Это ограничение нужно явно показывать пользователю и учитывать при оценке полноты истории.

## Источники

- [Wahoo Cloud overview](https://developers.wahooligan.com/cloud)
- [Wahoo Cloud API reference](https://cloud-api.wahooligan.com/)
- [Wahoo Developer Portal](https://developers.wahooligan.com/)
