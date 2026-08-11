# TRP-000 — Создать публичный лендинг TRAPEAK

## Description

Создать и подготовить к публикации англоязычный лендинг TRAPEAK на домене `https://trapeak.com` до подачи заявки в Garmin Connect Developer Program.

Лендинг должен показать, что TRAPEAK — реальный продукт в стадии MVP-разработки: объяснить назначение сервиса, представить будущий пользовательский сценарий и дать Garmin понятный контекст для рассмотрения заявки. Нельзя создавать впечатление, что интеграция с Garmin уже одобрена, доступна пользователям или имеет официальный партнёрский статус.

Перед реализацией:

- прочитать `README.md`, `docs/product/vision.md`, `docs/product/mvp.md` и архитектурную Wiki;
- проверить текущий код и уже выбранный технический стек;
- если стек ещё не зафиксирован, выбрать минимальную реализацию, которую можно без лишнего переписывания включить в будущее web-приложение TRAPEAK;
- зафиксировать существенные технические решения и допущения в PR.

## Product positioning

- Product: training analytics platform for runners and cyclists.
- Brand: `TRAPEAK`.
- Primary slogan: `YOUR PATH TO PEAK.`
- Domain: `trapeak.com`.
- Status: `Coming soon` / `MVP in development`.
- Core value: объединить тренировочные данные, показать прогресс и со временем предоставлять персональные insights и рекомендации.

Допустимая формулировка о Garmin:

> TRAPEAK is preparing an integration with Garmin Connect to allow users to import and analyze their training activities with explicit consent.

Не использовать формулировки `Official Garmin Partner`, `Garmin integration available`, `Connect Garmin now` и другие утверждения о полученном доступе или работающей production-интеграции.

## Page structure

### 1. Header

- логотип/wordmark TRAPEAK;
- ссылки-якоря: `Product`, `How it works`, `Privacy`, `Contact`;
- CTA `Join early access` или `Coming soon`.

### 2. Hero

- slogan `YOUR PATH TO PEAK.`;
- короткое описание продукта;
- CTA для early access;
- качественный product visual или интерфейсный preview.

### 3. Product value

Показать три основные возможности:

1. Bring your training data together.
2. Understand progress and training patterns.
3. Get personalized insights for the next goal.

Текст не должен обещать медицинские результаты, гарантированное улучшение формы или функции, которых нет в roadmap.

### 4. Product preview

Создать правдоподобный адаптивный preview будущего dashboard: summary последней активности, тренировочный объём/динамика и progress toward a goal.

- Использовать только вымышленные данные.
- Если preview интерактивный, явно пометить его как `Demo data`.
- Не изображать подключённый Garmin-аккаунт или завершённый импорт как реально доступную функцию.
- Preview должен демонстрировать концепцию продукта, а не быть отдельным полноценным приложением.

### 5. How it works

Показать будущий сценарий:

1. Connect your training source with explicit consent.
2. Import and organize completed activities.
3. Review progress and personalized insights.

Использовать future-oriented wording, пока интеграция не запущена.

### 6. Garmin Connect readiness

Кратко объяснить планируемую интеграцию и принципы обработки данных:

- доступ только после явного согласия пользователя;
- пользователь сможет отключить источник данных;
- credentials Garmin не запрашиваются и не хранятся TRAPEAK;
- импортированные данные предназначены для пользовательской аналитики.

Не использовать логотип Garmin без подтверждённого права и не копировать элементы бренда Garmin. Текстовые упоминания должны быть нейтральными и фактическими.

### 7. Early access

Добавить простой CTA. До появления согласованного backend допустим один из вариантов:

- ссылка `mailto:hello@trapeak.com`;
- форма, отправляемая через явно выбранный внешний сервис;
- визуально неактивная форма с честным сообщением `Coming soon`.

Не создавать собственное хранение email только ради лендинга. Не подключать стороннюю аналитику, cookies или tracking без необходимости и отражения этого в Privacy Policy.

### 8. Footer

- `Privacy Policy`;
- `Terms of Service`;
- `Data & Account Deletion`;
- `Contact`;
- copyright TRAPEAK.

## Required legal and trust pages

Создать отдельные публичные маршруты:

- `/privacy`;
- `/terms`;
- `/data-deletion`;
- `/contact`.

Тексты должны соответствовать фактической стадии продукта и текущей реализации. Не придумывать юридическое лицо, адрес, DPO, сроки хранения данных или функции удаления, которых пока нет. Не выдавать шаблонный текст за юридически проверенный: добавить в документацию пометку, что финальная legal review остаётся действием владельца перед production-сбором пользовательских данных.

Страница `/data-deletion` должна объяснять, как связаться по вопросу удаления данных в период MVP, и отделять:

- отключение источника тренировок;
- удаление импортированных тренировок;
- удаление аккаунта TRAPEAK.

## Design requirements

- Темная, современная эстетика на пересечении training, outdoor и technology.
- Использовать существующий логотип/ассеты репозитория, если они доступны и пригодны для web.
- Базовая палитра: black/dark background, white/light typography, bright blue/cyan accent or gradient.
- Гора/вершина и путь вверх могут использоваться как визуальный мотив, но без перегруженной иллюстрации.
- Mobile-first responsive layout.
- Не копировать визуальный стиль Garmin или других training platforms.
- Поддержать `prefers-reduced-motion`; анимации не должны быть обязательны для понимания страницы.

## Technical requirements

- Лендинг должен быть частью текущего репозитория, а не отдельным no-code проектом.
- Использовать существующий framework и conventions, если они уже появились к моменту выполнения.
- Не добавлять БД и авторизацию для этой задачи.
- Не добавлять Garmin credentials, mock tokens или OAuth endpoints.
- Не добавлять cookies/trackers по умолчанию.
- Добавить SEO metadata, Open Graph metadata, favicon, sitemap и robots configuration.
- Добавить semantic HTML, keyboard navigation, visible focus states и корректную иерархию headings.
- Изображения оптимизировать; не допускать заметного layout shift.
- Добавить документированный способ локального запуска и production build.
- Подготовить deployment configuration для выбранного hosting provider без добавления секретов в Git.

## Acceptance Criteria

- `trapeak.com` имеет готовый к публикации англоязычный лендинг с перечисленными секциями.
- Лендинг корректно работает на mobile, tablet и desktop.
- Существующий бренд TRAPEAK и slogan `YOUR PATH TO PEAK.` использованы последовательно.
- Product preview использует только demo data и не выдаёт будущие функции за доступные.
- Garmin описан только как планируемая интеграция; отсутствуют заявления об одобрении или партнёрстве.
- Реализованы публичные страницы `/privacy`, `/terms`, `/data-deletion`, `/contact`.
- Нет Garmin credentials, пользовательских данных, секретов, tracking scripts и необязательных cookies.
- Все внутренние ссылки, CTA и mailto работают либо честно обозначены как `Coming soon`.
- Lighthouse target для desktop и mobile: Performance, Accessibility, Best Practices и SEO не ниже 90, если ограничения CI/hosting не документированы отдельно.
- Lint, typecheck, tests и production build проходят.
- README/Wiki описывает локальный запуск, deployment и действия владельца для привязки `trapeak.com`.
- В PR приложены screenshots desktop и mobile, URL preview deployment и список оставшихся owner actions.

## Release Actions

Действия Claude:

- создать production-ready build и hosting configuration;
- предоставить preview deployment, если доступ к hosting уже настроен;
- описать точные DNS records, которые потребуются после выбора hosting provider;
- проверить HTTPS, redirects и canonical URL после подключения домена, если это возможно в рамках доступов.

Действия владельца проекта:

- предоставить/подтвердить web-ready logo asset, если его нет в репозитории;
- создать `hello@trapeak.com` либо указать другой публичный контакт;
- подключить hosting account и настроить DNS для `trapeak.com`;
- проверить и утвердить Privacy Policy, Terms и Data Deletion до сбора реальных данных или email;
- после публикации проверить лендинг и только затем отправлять заявку Garmin.

## Testing Recommendations

- Проверить responsive layout на ширинах 320, 768, 1024 и 1440 px.
- Запустить accessibility audit и Lighthouse для главной и legal pages.
- Проверить navigation полностью с клавиатуры.
- Проверить отсутствие broken links, console errors, mixed content и сетевых запросов к неизвестным third parties.
- Проверить metadata через production build.
- Проверить, что отключение JavaScript не скрывает основной текст, legal links и контакт.

## QA e2e tests

1. Пользователь открывает `/` и видит название, slogan, описание и CTA.
2. Header navigation переводит к нужным секциям.
3. Все legal pages открываются напрямую и доступны из footer.
4. Contact CTA открывает корректный email/канал связи либо показывает честный `Coming soon` state.
5. Product preview явно использует demo data.
6. На странице нет утверждений о действующей или одобренной Garmin-интеграции.
7. Страница остаётся читаемой и управляемой с клавиатуры на mobile и desktop.
8. Не выполняются запросы к Garmin API и не загружаются Garmin credentials.

## Out of scope

- пользовательская регистрация и авторизация;
- реальное подключение Garmin;
- импорт тренировок;
- backend аналитики и AI-рекомендаций;
- полноценный dashboard;
- платная подписка;
- production-сбор email без отдельного решения о provider, consent и privacy;
- официальные Garmin brand assets без полученного разрешения.
