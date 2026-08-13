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

## Выполнено в Production

1. Wahoo production callback и secrets настроены.
2. Миграции `provider_connections` и provider data применены.
3. Production OAuth, disconnect/reconnect и синхронизация Wahoo проверены.
4. Повторный sync двух тренировок не создал дублей.

## Нужно сейчас для MCP

1. В production instance Clerk открыть `OAuth applications`.
2. Для первого developer-mode теста включить `Dynamic client registration`.
3. Установить default scopes: `openid`, `profile`.
4. После production deployment подключить `https://trapeak.com/mcp` в ChatGPT Developer mode и завершить OAuth flow.

Dynamic Client Registration используется для быстрого MVP-теста. Перед публичным запуском нужно перейти на review-based CIMD/pre-registered clients или другой ограниченный OAuth client registration flow.

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
