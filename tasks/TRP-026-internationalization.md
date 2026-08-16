# TRP-026 — Internationalization and localized SEO

GitHub issue: [#7](https://github.com/iltoky/trapeak/issues/7)

## Outcome

Ship English, Brazilian Portuguese, Latin American Spanish, Indonesian, Vietnamese, Hindi, and Bengali across the public experience and authenticated product. English remains the fallback.

## Scope

- centralized, typed locale dictionaries;
- browser detection, locale cookie, account persistence, and selector;
- independent locale, time zone, and measurement-system preferences;
- localized authentication, dashboard, profile, integrations, shared access, messages, guides, legal pages, and SEO;
- static locale URLs, canonical, `hreflang`, OpenGraph, and sitemap;
- language-neutral MCP and API data contracts;
- desktop/mobile and performance verification.

## Acceptance record

- Seven locales are present in the registry and statically generated.
- Public copy, authenticated UI, validation/status copy, legal content, and Clerk authentication localization are centralized.
- Legacy public URLs redirect by saved locale or browser preference; unsupported values resolve to English.
- Locale persistence does not change time zone, measurement system, stored data, or AI conversation language.
- MCP/profile section labels use stable keys rather than localized prose.
- Architecture and the procedure for adding another locale are documented.

Final test, deployment, and production verification results are recorded in the release and pull request.
