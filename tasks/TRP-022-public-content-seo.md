# TRP-022 — Актуализация публичных материалов и SEO

Статус: **Published; public production verification passed; authenticated e2e deferred**

## Description

Привести лендинг, public AI-facing content и пользовательские инструкции к фактическому production MVP перед внешними review Wahoo и OpenAI. Зафиксировать текущее позиционирование и проверить техническое SEO без обещаний неподдерживаемых функций.

## Acceptance Criteria

- Лендинг отражает работающие Nutrition, Labs, Profile, weight history, automatic Wahoo sync и исторический training context.
- Лендинг показывает portable history, работу с несколькими AI, планирование тренировок в выбранном AI или с тренером и delegated access.
- Текущие публичные категории ограничены `training`, `nutrition`, `health`; recovery не рекламируется до подключения измеряемого источника.
- На лендинге и в AI guides явно раскрыты сценарии «Записывайте там, где удобно. Анализируйте там, где лучше» и «AI меняются — ваша история остаётся».
- Добавлен копируемый стартовый onboarding prompt и пример запроса тренировки на сегодня с учётом предыдущих нагрузок.
- `public/llms.txt`, MCP instructions, AI guides, FAQ и public MCP page описывают одинаковый набор возможностей и ограничений.
- Удалено устаревшее утверждение, что automatic webhook sync ещё требует настройки владельца.
- Privacy, Terms и Data Deletion перечисляют фактически обрабатываемые группы: workouts, nutrition, labs, Profile, medications и weight history.
- Появляется публичный support/contact URL, пригодный для listing; publisher/operator согласован с verified OpenAI identity.
- У каждой индексируемой страницы проверены уникальные title, description и canonical; sitemap, robots, Open Graph и structured data соответствуют production URL.
- Проверены broken links, mobile layout, accessibility, Lighthouse и отсутствие индексируемых preview/private URLs.
- Dashboard разделён на Overview, Training, Nutrition, Health, Shared access и Connections; питание сгруппировано по дням.
- Зафиксированы базовые поисковые запросы и проверка Google Search Console/Bing Webmaster Tools после deployment.

## Initial audit findings

- Главный лендинг не показывает Profile, weight history и `get_training_context`, а текст всё ещё говорит, что automatic webhook sync требует настройки владельца.
- Privacy и Terms всё ещё содержат placeholder оператора, а отдельного публичного support URL нет.
- Root metadata задаёт canonical `/`; страницы без собственного metadata могут унаследовать неправильный canonical главной.
- Legal pages не имеют уникальных title/description, а dashboard и auth pages нужно явно исключить из индексации.
- Sitemap использует фиксированный `lastModified` от 12 августа 2026 года и не содержит будущую support/contact page.
- Structured data есть в AI guide templates, но отсутствует на главной; перед добавлением publisher markup нужно утвердить публичную identity.
- Delegated access уже опубликован, но лендинг, guides и roadmap его не отражают.
- Статус Google Search Console и Bing Webmaster Tools нельзя подтвердить из репозитория — это owner action после deployment.

## Release Actions

1. Утвердить publisher/operator и legal details, которые можно публично показать.
2. Обновить public pages, `llms.txt`, instructions и submission materials одним docs/content release.
3. Прогнать build, link/metadata checks и Lighthouse для ключевых страниц.
4. После deployment отправить sitemap в search consoles и проверить индексирование.

## Testing Recommendations

- Сверять каждое capability-утверждение с MCP schema и production feature status.
- Проверять canonical и metadata не только на `/`, но и на каждой AI guide/legal page.
- Не использовать формулировки об официальном партнёрстве Wahoo, Garmin, OpenAI или Claude.

## QA e2e tests

1. [ ] Новый пользователь понимает путь registration → source → AI → onboarding → first result.
2. [ ] Все public instructions воспроизводятся в новом AI-диалоге.
3. [ ] Landing, `llms.txt`, Privacy, Terms и plugin listing не противоречат друг другу.
4. [ ] Lighthouse SEO/Accessibility для основных public pages не ниже согласованного порога.
5. [ ] Sitemap и canonical URLs указывают только на `https://trapeak.com`.
