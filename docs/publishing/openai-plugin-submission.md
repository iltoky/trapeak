# Публичная подача TRAPEAK в OpenAI

Источник истины: [официальный процесс публикации OpenAI](https://developers.openai.com/plugins/deploy/submission).

## Listing

- **Name:** TRAPEAK
- **Short description:** Connect your authorized fitness data to AI through a secure, read-only MCP interface.
- **Long description:** TRAPEAK lets users connect supported fitness services and make their normalized athlete profile and workout history available to ChatGPT and Codex. The plugin is read-only: it can retrieve profiles, list activities, and return detailed metrics for a selected activity. TRAPEAK never exposes provider tokens or raw provider payloads to the AI client.
- **Website:** `https://trapeak.com`
- **Support:** `mailto:support@trapeak.com`
- **Privacy:** `https://trapeak.com/privacy`
- **Terms:** `https://trapeak.com/terms`
- **Data deletion:** `https://trapeak.com/data-deletion`
- **MCP URL type:** Universal
- **MCP URL:** `https://trapeak.com/mcp`
- **Authentication:** OAuth
- **Category:** Health & Fitness, если эта категория доступна в portal.
- **Countries:** выбирать только страны, для которых готовы support, terms и privacy.

## Starter prompts

1. Show my latest workouts and summarize the key metrics.
2. Analyze my most recent run using only my TRAPEAK data.
3. Compare my last two workouts and highlight meaningful differences.
4. Show my athlete profile and explain which fields are available.

## Positive test cases

1. `Show my athlete profile.` → `get_athlete_profile`; returns only the authenticated user's normalized profiles.
2. `Show my two latest workouts.` → `list_activities(limit: 2)`; returns at most two newest activities.
3. `Give me all available metrics for this workout.` → `get_activity(id)` after listing; returns normalized details without raw payload.
4. `Show workouts from 2026-08-01 through 2026-08-31.` → `list_activities(from, to)`; applies an inclusive date range.
5. `Show only my Wahoo workouts.` → `list_activities(provider: "wahoo")`; returns Wahoo activities owned by the authenticated user.

## Negative test cases

1. `Delete my latest workout.` → do not call a write tool; explain that TRAPEAK is read-only.
2. Call `get_activity` with a valid UUID belonging to another account → return `activity: null` without confirming that the record exists.
3. Call MCP without a valid OAuth token → return `401` with protected-resource metadata; no fitness data is returned.

## Review account fixture

- Separate email controlled by TRAPEAK.
- Password login without MFA, SMS or mandatory email challenge during review.
- Connected Wahoo test account with at least two non-sensitive completed activities.
- No real customer data.

## Owner-only blockers

- Choose an individual or business publisher identity and complete OpenAI verification.
- Make the same operator identity visible in Privacy Policy and Terms before submission.
- Provide the domain challenge token issued by the submission portal.
- Create the reviewer account fixture.

OpenAI does not publish immediately after submission. Review duration is not guaranteed; after approval, the owner performs a separate Publish action.
