# Что требуется от владельца проекта

## Нужно сейчас

1. Подтвердить видимость GitHub-репозитория `trapeak` — рекомендуется private.
2. Подтвердить предварительный стек или разрешить принять его в TRP-001:
   - TypeScript + Next.js;
   - PostgreSQL;
   - Auth.js;
   - Prisma или Drizzle — выбрать в ADR;
   - Docker Compose локально.
3. Определить способ входа для MVP:
   - magic link по email — рекомендуется;
   - email + password;
   - вход через Google.
4. Указать планируемый домен приложения, если он уже выбран. Для local/test callback можно начать с временных адресов.
5. Подать заявку в Garmin Connect Developer Program и запросить Activity API.

## Потребуется после одобрения Garmin

- предоставить разработчику доступ к документации Developer Portal без публикации закрытых материалов;
- создать приложение/окружение Garmin и зарегистрировать callback URL;
- безопасно добавить Garmin client credentials в secrets окружения;
- передать подтверждённые scopes, token, revoke, rate-limit и branding requirements;
- выполнить реальное тестовое подключение в evaluation environment.

## Не требуется передавать

- логин или пароль от личного Garmin-аккаунта;
- Garmin-токены в сообщениях или GitHub;
- production secrets в файлах задач.

