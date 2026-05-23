# Sjoh Agent Notes

## Project Context

Sjoh is a South African marketplace for local service providers. Launch-critical notes live in `docs/launch-board.md` and `docs/launch-readiness.md`.
Antigravity memory and handoff instructions live in `docs/ANTIGRAVITY_MEMORY.md` and `docs/ANTIGRAVITY_HANDOFF.md`, and reusable parallel-agent prompts live in `docs/agent-prompt-bank.md`.

Use conservative, repo-native changes. For code work, run the smallest relevant verification first, then broaden checks when shared behavior changes.

## Hermes Workflow

When the user asks for Hermes, "Hermes agent", Hermes agents, lead sourcing, prospect research, source checking, outreach hygiene, POPIA-aware consent triage, or concierge lead drafts, use the Hermes workflow in `docs/hermes-agent.md`.

Codex is the main system and orchestrator. Hermes agents are bounded research workers deployed by Codex for Sjoh lead-finding missions. Hermes is an operations/research role, not app runtime code. It should:

- Gather source-backed South African service-provider prospects or customer job leads.
- Preserve source name, source URL, checked date, and uncertainty notes.
- Treat public contact details as evidence, not marketing consent.
- Return reviewed rows, JSON drafts, or recommendations for the user/Codex to approve before data is persisted.
- Avoid editing app code unless the user explicitly asks for product changes.
