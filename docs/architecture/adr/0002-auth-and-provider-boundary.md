# ADR-0002: Clerk и provider-neutral adapter boundary

- Статус: принято
- Дата: 2026-08-12

## Решение

Для пользовательской регистрации, email/password, восстановления пароля и серверных сессий используется Clerk. TRAPEAK не реализует собственное хранение паролей, hashing, reset tokens или session cookies.

Clerk изолирован модулем `lib/auth`: остальной backend получает только `AuthUser { id, email }`. Provider adapters не импортируют Clerk и не принимают пользовательский `user_id`; ownership устанавливается application/service-слоем из проверенной серверной сессии.

Интеграции Garmin, Suunto и Wahoo реализуют единый `WearableProviderAdapter`. Registry возвращает только явно зарегистрированные адаптеры и fail closed для ненастроенного провайдера.

## Последствия

- Email/password, reset и email verification настраиваются в Clerk Dashboard.
- Для production нужны `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` и `CLERK_SECRET_KEY` в Vercel.
- Пользовательская identity не зависит от availability конкретного wearable API.
- Замена auth-провайдера ограничивается реализацией `lib/auth`, а замена wearable ingestion — реализацией adapter interface.
