# TRP-015 — публикация TRAPEAK в каталоге плагинов OpenAI

Статус: **Preparation in progress; depends on public-content readiness and Wahoo Production approval**

## Описание

Подать существующий production MCP TRAPEAK как MCP-backed plugin на публичную проверку OpenAI и после одобрения опубликовать его в общем Plugins Directory ChatGPT и Codex.

## Acceptance criteria

- Production MCP доступен по стабильному URL `https://trapeak.com/mcp`.
- Read tools не изменяют состояние; create/update tools сохраняют данные только по явной команде; delete tools требуют явного подтверждения.
- Каждый tool имеет фактически корректные `readOnlyHint`, `openWorldHint`, `destructiveHint` и output schema.
- OAuth поддерживает `openid`, `profile`, `email`; UserInfo возвращает подтверждённый email.
- Публичные website, support, privacy, terms и data-deletion URLs описывают workouts, nutrition, labs, Profile, medications и weight history, которые реально обрабатывает сервис.
- Определён и верифицирован publisher — физическое лицо или компания.
- Имя publisher совпадает с website, support contact, Privacy и Terms.
- Подготовлены актуальные listing copy, starter prompts, минимум пять positive и три negative test cases для текущего MCP.
- Создан review account без MFA, SMS или email confirmation с воспроизводимыми workouts, nutrition, labs, Profile и weight fixtures.
- Домен подтверждён через `/.well-known/openai-apps-challenge`.
- Плагин прошёл Scan Tools, review и опубликован владельцем после approval.

## Release actions

1. Завершить [TRP-022](TRP-022-public-content-seo.md) и получить Wahoo Production approval по [TRP-023](TRP-023-wahoo-production-approval.md).
2. Выбрать publisher identity и завершить individual либо business verification в OpenAI Platform.
3. Использовать OpenAI project с global data residency и правом Apps Management / `api.apps.write`.
4. Добавить portal challenge в `OPENAI_APPS_CHALLENGE`.
5. Создать submission типа With MCP с Universal URL `https://trapeak.com/mcp`.
6. Добавить demo account и актуальные материалы из `docs/publishing/openai-plugin-submission.md`.
7. Выполнить Scan Tools, исправить замечания и отправить на review.

## QA e2e tests

1. [x] Developer-mode OAuth и production MCP работают на owner-scoped данных.
2. [ ] Reviewer account проходит OAuth без дополнительного подтверждения.
3. [ ] Все восемь submission test cases воспроизводимы.
4. [ ] Tool scan не сообщает ошибок metadata или annotations.
5. [ ] После approval плагин находится по точному имени `TRAPEAK`.
