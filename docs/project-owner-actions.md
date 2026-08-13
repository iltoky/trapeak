# Что требуется от владельца проекта

## Принятые решения

- GitHub-репозиторий: `iltoky/trapeak`.
- Авторизация MVP: Clerk с регистрацией и входом по `email + password`.
- Домен продукта: `trapeak.com`.
- Итоговый технический стек должен проверить, обосновать и зафиксировать Claude в TRP-001 через ADR.
- Приоритет MVP: самое быстрое и простое решение без создания собственной auth/session-инфраструктуры.
- Первая fitness-интеграция: Wahoo; Garmin отображается как `soon` до получения API-доступа.

## Нужно сейчас

1. Открыть [Wahoo Developer Portal](https://developers.wahooligan.com/) и своё одобренное Cloud API application.
2. Зарегистрировать Preview callback URL, который будет выдан после подготовки стабильного Preview-домена. Production callback: `https://trapeak.com/api/integrations/wahoo/callback`.
3. Добавить `WAHOO_CLIENT_ID` и `WAHOO_CLIENT_SECRET` только в Preview environment Vercel.
4. Подключить Neon PostgreSQL через Vercel Marketplace, применить миграции и добавить `TOKEN_ENCRYPTION_KEY`.
5. Выполнить реальное тестовое подключение Wahoo в Preview.
6. Garmin оставить отложенным до возобновления программы и получения API-доступа.

## Для Wahoo integration

- создать production application/окружение Wahoo;
- зарегистрировать callback URL для Preview, а перед релизом — production callback на домене `trapeak.com`;
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
