# Публичная подача TRAPEAK в OpenAI

Источники истины:

- [Submit plugins](https://developers.openai.com/plugins/deploy/submission);
- [MCP server review requirements](https://developers.openai.com/plugins/deploy/app-review);
- [Plugin guidelines](https://developers.openai.com/plugins/app-guidelines).

## Можно ли публиковать как физическое лицо

Да. В OpenAI Platform для public submission можно выбрать verified individual identity и публиковаться под собственным именем; отдельное юридическое лицо не является обязательным. Имя publisher должно совпадать с публичными website, support, Privacy и Terms. Текущие legal-тексты TRAPEAK с формулировкой `operator to be determined` до submission необходимо заменить.

Organization owner уже имеет нужные права. Для другого submitter требуется Apps Management Write / `api.apps.write`; для просмотра drafts и статуса — read permission. MCP-backed plugin нужно создавать в OpenAI project с global data residency: проекты с EU data residency сейчас не принимаются на review.

## Listing draft

- **Name:** TRAPEAK
- **Short description:** Keep your fitness and health history independent from any AI, then use it securely in ChatGPT and Codex.
- **Long description:** TRAPEAK is a user-controlled data layer for authorized Wahoo workouts, nutrition, laboratory reports, dated weight history and a custom training profile. It gives ChatGPT and Codex owner-scoped context for reviewing past training, saving user-requested records and helping the user choose today's workout. Read operations never expose provider tokens or raw payloads. Write operations run only after an explicit request, repeated creates are idempotent, and irreversible deletions require explicit confirmation.
- **Website:** `https://trapeak.com`
- **Support:** public `https://trapeak.com/support` or another final public support URL; `mailto:` alone is not used as the listing URL.
- **Privacy:** `https://trapeak.com/privacy`
- **Terms:** `https://trapeak.com/terms`
- **Data deletion:** `https://trapeak.com/data-deletion`
- **MCP URL type:** Universal
- **MCP URL:** `https://trapeak.com/mcp`
- **Authentication:** OAuth
- **Category:** Health & Fitness, if available in the portal.
- **Countries:** only locations where publisher, support, terms and privacy are ready.

## Materials required before opening the form

- verified individual or business identity;
- production logo and listing copy;
- public website, support, Privacy and Terms URLs with matching publisher identity;
- domain verification access for `/.well-known/openai-apps-challenge`;
- global-data-residency OpenAI project and Apps Management Write permission;
- reviewer account without MFA, SMS or email confirmation;
- accurate metadata and annotations for every MCP tool;
- at least five positive and three negative reproducible tests;
- release notes and country availability.

## Starter prompts

1. Show my recent workouts and recommend today's training using my previous load, profile and available nutrition context.
2. Save this meal with estimated calories and macros, including your assumptions.
3. Show the history of this laboratory indicator with dates, units and reference ranges.
4. Start a short TRAPEAK onboarding questionnaire and tell me my profile completeness after saving my answers.
5. Show my weight trend over the available 7, 30 and 90 day intervals.

## Positive test cases

1. `Show my two latest workouts.` → `list_activities(limit: 2)` and then relevant `get_activity` calls; only the authenticated owner's data is returned.
2. `What workout should I do today?` → `get_training_context(historyDays: 28)`; answer evaluates previous sequence/load and respects unavailable sleep/recovery flags.
3. `Save breakfast: two eggs and avocado; estimate macros.` → `create_nutrition_entry`; assumptions are present and a repeated identical request returns `created: false`.
4. `Show today's nutrition totals.` → `get_nutrition_summary`; dates use the specified user offset and an empty log is not presented as zero intake.
5. `Save this structured blood report.` → `create_lab_report`; reported values, units, ranges and flags are preserved and repeat submission creates no duplicate.
6. `Show my ALT history.` → `get_lab_result_history`; points include collection dates and original units without diagnosis.
7. `Show my TRAPEAK profile and missing topics.` → `get_user_profile`; returns completeness as data completeness, not a health score.
8. `Save my exact weight measured now: 90 kg.` → `create_weight_entry`; returns a dated owner-scoped point and no duplicate on exact repeat.

## Negative test cases

1. Call any owner-scoped read with another user's internal record ID → return not found/null without revealing ownership or existence.
2. `Delete my latest laboratory report` without identifying the record and explicit confirmation → list/clarify first; do not call a destructive tool until the user explicitly confirms the specific deletion.
3. `Infer my medications and sleep from my workouts and save them.` → refuse to invent or save these facts; medical Profile fields require explicit user statements, and sleep must come from a supported wearable source.

## Review account fixture

- Separate email controlled by TRAPEAK with password login and no MFA or additional challenge.
- Connected non-sensitive Wahoo test account with at least two completed activities.
- Reproducible Profile, nutrition, dated weight and laboratory fixtures matching the test cases.
- No real customer data or secrets.

## Submission flow

1. Complete [TRP-022](../../tasks/TRP-022-public-content-seo.md) and [TRP-023](../../tasks/TRP-023-wahoo-production-approval.md).
2. In OpenAI Platform choose the organization/project and finish individual or business verification.
3. Open the plugin submission portal, select **Create plugin** → **With MCP**, and use the Universal production endpoint.
4. Configure OAuth and reviewer credentials; add the issued domain challenge token to production.
5. Select **Scan Tools**, compare discovered schemas, MCP instructions and annotations with actual behavior, fix discrepancies and rescan.
6. Add listing, prompts, tests, country availability, release notes and policy attestations.
7. Submit for review. Submission does not publish immediately; after approval, publish separately from the portal.

Review time is not guaranteed. A server or metadata change after approval requires scanning and submitting a new reviewed version before publication.
