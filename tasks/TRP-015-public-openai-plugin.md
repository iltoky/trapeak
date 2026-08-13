# TRP-015 — публикация TRAPEAK в каталоге плагинов OpenAI

Статус: **Preparation in progress**

## Описание

Подать существующий production MCP TRAPEAK на публичную проверку OpenAI и после одобрения опубликовать его в общем каталоге ChatGPT и Codex.

## Acceptance criteria

- Production MCP доступен по стабильному URL `https://trapeak.com/mcp`.
- Все инструменты read-only и имеют корректные `readOnlyHint`, `openWorldHint`, `destructiveHint`.
- OAuth поддерживает `openid`, `profile`, `email`; UserInfo возвращает подтверждённый email.
- Публичные website, support, privacy, terms и data-deletion URLs описывают фактический beta-сервис.
- Определён и верифицирован publisher — физическое лицо или компания.
- Подготовлены listing copy, starter prompts, пять positive и три negative test cases.
- Создан review account без MFA, SMS или email confirmation на этапе проверки.
- Домен подтверждён через `/.well-known/openai-apps-challenge`.
- Плагин прошёл Scan Tools, review и опубликован владельцем после approval.

## Release actions

1. Выбрать publisher identity и завершить verification в OpenAI Platform.
2. Использовать OpenAI project с global data residency.
3. Добавить portal challenge в `OPENAI_APPS_CHALLENGE`.
4. Создать MCP submission с Universal URL `https://trapeak.com/mcp`.
5. Добавить demo account и материалы из `docs/publishing/openai-plugin-submission.md`.
6. Выполнить Scan Tools, исправить замечания и отправить на review.

## QA e2e tests

1. [x] Developer-mode OAuth и три MCP tools работают на production-данных.
2. [ ] Reviewer account проходит OAuth без дополнительного подтверждения.
3. [ ] Все восемь submission test cases воспроизводимы.
4. [ ] Tool scan не сообщает ошибок metadata или annotations.
5. [ ] После approval плагин находится по точному имени `TRAPEAK`.
