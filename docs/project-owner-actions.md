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

## Выполнено для MCP

1. Dynamic client registration включён.
2. Default scopes: `openid`, `profile`, `email`.
3. `https://trapeak.com/mcp` подключён в ChatGPT Developer mode.
4. OAuth и три read-only tools проверены владельцем.

## Выполнено для Wahoo webhooks

1. `WAHOO_WEBHOOK_TOKEN` добавлен в Vercel Production secrets, production deployment обновлён.
2. В Wahoo Developer Portal настроен URL `https://trapeak.com/api/integrations/wahoo/webhook`, token и webhook включён.
3. Реальный webhook получил `200`; тренировка появилась в MCP без ручной синхронизации.
4. Неверный token вернул `401`; runtime errors не обнаружены.

## Нужно сейчас для Nutrition

1. [x] Применить production migration `0003_nutrition.sql`.
2. Войти в `https://trapeak.com/dashboard`, создать тестовый meal и удалить его.
3. Обновить schema или переподключить TRAPEAK в ChatGPT Developer mode.
4. Вызвать `list_nutrition_entries` и `get_nutrition_summary`.

## Нужно для публичного плагина OpenAI

1. Выбрать publisher: верифицированное физическое лицо или компания.
2. Указать этого же оператора в Privacy Policy и Terms.
3. Завершить identity verification в OpenAI Platform с global data residency.
4. Создать review account без MFA с двумя тестовыми Wahoo activities.
5. После создания submission добавить portal token в `OPENAI_APPS_CHALLENGE`.

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
