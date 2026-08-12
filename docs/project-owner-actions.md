# Что требуется от владельца проекта

## Принятые решения

- GitHub-репозиторий: `iltoky/trapeak`.
- Авторизация MVP: Clerk с регистрацией и входом по `email + password`.
- Домен продукта: `trapeak.com`.
- Итоговый технический стек должен проверить, обосновать и зафиксировать Claude в TRP-001 через ADR.
- Приоритет MVP: самое быстрое и простое решение без создания собственной auth/session-инфраструктуры.

## Нужно сейчас

1. Создать Clerk application для TRAPEAK или установить Clerk через Vercel Marketplace.
2. В Clerk включить email + password, email verification и password reset; social login для MVP не включать.
3. Добавить Clerk keys в Development, Preview и Production environment Vercel.
4. Дождаться результатов заявок Wahoo и Suunto; Garmin остаётся отложенным до возобновления программы.

## Потребуется после одобрения первого провайдера

- предоставить разработчику доступ к документации Developer Portal без публикации закрытых материалов;
- создать production application/окружение провайдера;
- зарегистрировать callback URL для используемых окружений, включая production на домене `trapeak.com`;
- безопасно добавить provider client credentials в secrets окружения;
- передать подтверждённые scopes, token, revoke, rate-limit и branding requirements;
- выполнить реальное тестовое подключение в evaluation environment.

## Потребуется перед production-запуском

- настроить DNS и HTTPS для `trapeak.com`;
- настроить production secrets вне GitHub-репозитория;
- настроить отправителя писем Clerk на домене TRAPEAK;
- определить обязательные юридические страницы и контакт поддержки.

## Не требуется передавать

- логин или пароль от личного аккаунта wearable-провайдера;
- provider tokens в сообщениях или GitHub;
- production secrets в файлах задач.
