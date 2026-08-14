# Public Experience, SEO and AI Search Brief

Status: **Approved for implementation**

## Product truth

TRAPEAK is an AI-independent, permissioned data layer for fitness and health history. Users can:

1. keep their history when they change AI assistants;
2. record data by voice or text in one compatible AI;
3. analyze data and build visualizations in another AI;
4. use the same saved context to create or adjust a training plan with a chosen AI or a real coach;
5. grant temporary read-only access to selected categories to a coach, doctor or dietitian;
6. ensure neither an AI client nor a person receives more data than the user authorized.

TRAPEAK supplies structured data and permissions. Recommendations and plans are created by the user's chosen AI or human specialist.

## Public positioning

Primary line: **Your data. Any AI. People you trust.**

Supporting line: **Record where it is convenient. Analyze where it is best.**

The product is not positioned as another closed AI coach or a replacement for wearable applications. Its durable advantages are portable history, explicit permissions, multiple AI clients and delegated human access.

## Current public data categories

- `training`: workouts, training context, goals, experience, schedule and preferences;
- `nutrition`: meals, daily summaries and dated weight history;
- `health`: laboratory history, conditions, injuries, contraindications and medications.

`recovery` remains reserved in the server model but is not exposed as a current product category until a supported source provides dated sleep, HRV, stress, readiness and recovery measurements.

## Landing information architecture

1. Hero: product promise and direct registration CTA.
2. Independent data layer: sources → TRAPEAK → AI assistants or trusted people.
3. Three current data categories.
4. Realistic conversations: nutrition logging, today's training decision and cross-AI planning.
5. Delegated access with visible category selection, expiry and revoke.
6. AI independence and durable history.
7. Current integrations and honest source coverage.
8. Use-case guides, FAQ and CTA.

## Dashboard information architecture

- Overview
- Training
- Nutrition
- Health
- Shared access
- Connections and account

Overview contains summaries only. Nutrition entries are grouped by day and progressively disclosed. Training shows recent history and load context. Health combines laboratory reports with the user-provided medical context. Missing sources are shown as unavailable rather than zero or estimated.

## Public use-case pages

- AI workout recommendations from personal training context
- Logging nutrition with an AI assistant
- Tracking blood-test history with AI
- Using multiple AI assistants with one data history
- Sharing selected fitness and health data with a coach, doctor or dietitian

Each page must include a direct answer, actual production status, data used, a realistic example, a copyable starter request, limitations, privacy notes, FAQ and related internal links.

## Search principles

- Create useful, original, people-first pages rather than many keyword variants.
- Keep every capability claim aligned with production MCP tools and data sources.
- Give every indexable URL unique metadata and a canonical URL.
- Keep private account, invitation, API and MCP routes out of search indexes.
- Maintain crawlable internal links, accurate sitemap timestamps and public support details.
- Use visible, accurate JSON-LD only; never mark up roadmap capabilities as current.
- Allow OAI-SearchBot on public pages and measure ChatGPT referrals.
- Treat `llms.txt` as a factual secondary index, not a substitute for HTML content.
- Apply extra trust controls to health content: sources, review dates, limitations and no diagnosis claims.

## Visual direction

Preserve the current minimalist identity: white background, black controls, restrained lime-to-purple gradient, Geist typography, mountain and brace motifs, generous whitespace and no stock athlete photography. Prefer data-flow diagrams, permission cards and realistic AI conversations over invented analytics dashboards.

## Release gates

- capability truth review;
- responsive and keyboard-accessible UI;
- unique metadata, canonical and robots checks;
- sitemap and structured data validation;
- broken-link check;
- unit tests and TypeScript;
- production Next.js build;
- browser verification of public routes and dashboard auth boundary;
- Vercel preview before merge;
- production deployment and runtime error scan.
