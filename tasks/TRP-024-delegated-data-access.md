# TRP-024 — Делегированный доступ к данным

Статус: **Discovery backlog; no development yet**

## Description

Спроектировать отзывный доступ другого зарегистрированного пользователя к выбранным данным владельца. Основные сценарии — спортсмен выдаёт доступ тренеру или пациент выдаёт доступ врачу. Роль служит понятной меткой, а фактические права всегда определяются явными data scopes.

## Acceptance Criteria для будущей декомпозиции

- Владелец выбирает конкретного TRAPEAK user, группы данных, срок действия и при необходимости исторический период.
- Минимальные группы доступа проектируются отдельно: workouts/training context, goals/schedule, nutrition, weight, labs, health conditions/contraindications/medications и будущие sleep/recovery metrics.
- Первый срез только read-only; изменение и удаление данных остаются у владельца.
- Медицинские данные, препараты и Labs требуют отдельного явного consent и не включаются автоматически в роль `coach`.
- Grant можно принять, отклонить и отозвать; expiry применяется сервером, а не AI-инструкцией.
- Каждый delegated read проверяет владельца, получателя и scopes; произвольный `user_id` никогда не становится параметром доступа.
- Владелец видит активные grants и audit trail: кто, когда и к какой группе обращался.
- AI получателя видит данные только в пределах grant и явно обозначает, данные какого спортсмена/пациента анализируются.
- Threat model покрывает invite hijacking, confused deputy, revoked/expired grants, account takeover и утечку чувствительных полей.

## Следующий шаг

Подготовить отдельный security/authorization design: UX приглашения, модели `data_access_grants` и scopes, audit events, MCP subject selection и правила удаления. До утверждения design schema и MCP tools не добавлять.
