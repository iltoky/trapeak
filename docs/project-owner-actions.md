# Что требуется от владельца проекта

## Принятые решения

- GitHub-репозиторий: `iltoky/trapeak`.
- Авторизация MVP: Clerk с регистрацией и входом по `email + password`.
- Домен продукта: `trapeak.com`.
- Итоговый технический стек должен проверить, обосновать и зафиксировать Claude в TRP-001 через ADR.
- Приоритет MVP: самое быстрое и простое решение без создания собственной auth/session-инфраструктуры.
- Первая fitness-интеграция: Wahoo; Garmin отображается как `soon` до получения API-доступа.

## Выполнено в Preview

1. Одобренное Wahoo Cloud API application настроено.
2. Стабильный Preview callback зарегистрирован.
3. Wahoo credentials, `APP_URL`, Neon и `TOKEN_ENCRYPTION_KEY` добавлены в Preview secrets.
4. Первая миграция `provider_connections` применена.
5. Реальное подключение Wahoo успешно проверено владельцем проекта 13 августа 2026 года.

## Нужно сейчас

1. В Wahoo Developer Portal заменить callback на `https://trapeak.com/api/integrations/wahoo/callback`.
2. В Vercel добавить Wahoo и token encryption secrets в Production environment; `APP_URL` для Production должен быть `https://trapeak.com`. Neon предоставляет приложению `POSTGRES_URL`, поэтому отдельный `DATABASE_URL` не требуется.
3. После этого агент применяет `db/migrations/0002_provider_data.sql`, публикует код через подключённый GitHub App и выполняет production smoke test.
4. В production выполнить первое подключение/синхронизацию Wahoo и проверить отсутствие дублей повторным sync.
5. Garmin оставить отложенным до возобновления программы и получения API-доступа.

## Для Wahoo integration

- использовать одобренное Wahoo application для текущего production-тестирования;
- зарегистрировать production callback на домене `trapeak.com`;
- безопасно добавить provider client credentials в secrets окружения;
- выполнить реальное тестовое подключение в evaluation environment.

Client secret и пользовательские токены нельзя передавать в сообщениях: они добавляются только в secrets соответствующего окружения.

`TOKEN_ENCRYPTION_KEY` создаётся локально командой `openssl rand -base64 32`; значение также нельзя передавать в сообщениях или сохранять в Git.

## Потребуется перед production-запуском

- настроить DNS и HTTPS для `trapeak.com`;
- настроить production secrets вне GitHub-репозитория;
- настроить отправителя писем Clerk на домене TRAPEAK;
- определить обязательные юридические страницы и контакт поддержки.

## Не требуется передавать

- логин или пароль от личного аккаунта wearable-провайдера;
- provider tokens в сообщениях или GitHub;
- production secrets в файлах задач.
