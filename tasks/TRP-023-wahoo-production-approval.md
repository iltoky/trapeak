# TRP-023 — Wahoo Production approval

Статус: **Next; external approval required**

## Description

Перевести Wahoo Cloud developer application из Sandbox mode в Wahoo Production mode. Работоспособность собственного deployment не заменяет внешнее одобрение application со стороны Wahoo.

## Acceptance Criteria

- В Wahoo Developer Portal актуальны название, описание TRAPEAK, support contact, website, privacy URL и разрешённые integration URLs.
- Запрашиваются только `user_read`, `workouts_read` и `offline_data`; назначение каждого scope описано в заявке.
- В заявке объяснены OAuth, безопасное хранение авторизации, disconnect/revoke, user data access/deletion и защита от дублей.
- Проверены актуальные Wahoo API Agreement и ограничения на использование Wahoo names/marks.
- Application отправлено на Production review; статус и переписка Wahoo зафиксированы без секретов.
- После approval подтверждены OAuth, token refresh, automatic ingestion и disconnect/reconnect на тестовом аккаунте.
- Фактические rate-limit headers соответствуют доступу, выданному Wahoo.

## Release Actions

1. Проверить карточку приложения в [Wahoo Developer Portal](https://developers.wahooligan.com/).
2. Запросить Production approval и заполнить use case максимально подробно; если портал не показывает действие, обратиться через Wahoo API Support.
3. Ответить на вопросы review и внести только запрошенные изменения.
4. После approval выполнить production smoke test и обновить статус Wiki.

## Testing Recommendations

- До подачи повторить OAuth, refresh, revoke и automatic ingestion на отдельном test account.
- Не отправлять credentials или пользовательские tokens в тикетах, документации и screenshots.
- Не считать production-домен доказательством Production approval: источник истины — status application в Wahoo Developer Portal.

## QA e2e tests

1. [ ] Новый Wahoo user может дать consent через approved Production application.
2. [ ] Initial sync и automatic ingestion создают owner-scoped activity без дубля.
3. [ ] Refresh rotation не разрывает connection.
4. [ ] Disconnect отзывает разрешение, а reconnect работает повторно.
5. [ ] Rate-limit headers отражают Production access.
