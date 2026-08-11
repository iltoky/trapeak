# TRP-002 — Создать основу проекта

## Description

Инициализировать приложение по TRP-001: strict TypeScript, структура модулей, lint, formatter, typecheck, unit test runner, build, `.gitignore`, `.env.example`, PostgreSQL через Docker Compose, health endpoint и локальный setup.

Не добавлять функциональность Garmin и пользовательскую авторизацию.

## Acceptance Criteria

- Новый разработчик запускает приложение и БД по README.
- Health endpoint отвечает успешно при готовом приложении.
- Lint, format check, typecheck, tests и build проходят.
- `.env.example` не содержит значений секретов.
- `.env*` с реальными значениями исключены из Git.
- Структура соответствует ADR либо расхождение документировано новым решением.

## Release Actions

Настроить переменные окружения только при появлении deployment environment.

## Testing Recommendations

Проверить чистую установку и запуск с новой БД.

## QA e2e tests

1. Запустить БД.
2. Запустить приложение.
3. Проверить health endpoint и стартовую страницу.

