# EA Help v3: AI Layer Implementation Plan

Source: _EA Help — AI-Native Player Support PRD (v3)_, Oct 21 2026.
Goal: retrofit the PRD's agentic AI layer onto the v1 app as a working portfolio prototype,
and produce every image the case-study page needs.

## Status

- **Phase 0 (foundations): done.** Feature flag + prototype dock, mock EA APIs + persisted
  store, event protocol, rules engine (autonomy, eligibility, recovery risk), scenario
  registry + router + scripted engine, Help Agent panel shell (greeting with context,
  narrated status, talk to a person / handoff), launcher, `?scenario=` deep links, `/demo`
  hub. AI-off build is pixel-identical to production v1 (32/32 route × viewport checks).

## Decisions (confirmed)

| Decision     | Choice                                                                                                                                                                                                 |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Agent engine | **Hybrid.** A live Claude agent runs through a Vercel function and calls mock EA APIs as tools. A scripted **demo engine** drives the same UI with no API key, and also serves as the fallback.        |
| v1 vs AI     | **Feature flag.** One site with the AI layer on by default. A header toggle or `?ai=off` shows the untouched v1, mirroring the PRD's flagged rollout.                                                  |
| Game data    | **Keep current titles.** Scenarios use Madden NFL 23, Battlefield 2042, FIFA 23 and others already in `src/data`. Portfolio copy is adjusted to match (e.g. "Checking your Madden NFL 23 purchases…"). |

## Architecture

```
src/features/flags/        useAiLayer(): ?ai=on|off + localStorage, header toggle
src/services/ea-api/       Mock "EA Help APIs" (pure TS, shared by browser + /api)
  player.ts                profile: owned games, platform (PS5), region, language
  commerce.ts              purchases, entitlements, grantEntitlement(), refreshEntitlements()
  incidents.ts             active incidents per game (status, ETA)
  cases.ts                 cases + unified timeline (ai | chat | email | receipt entries)
  security.ts              sign-in history, risk signals, identity checks
  store.ts                 in-memory + localStorage state, "Reset demo" button
src/agent/
  protocol.ts              event stream both engines emit (see below)
  policy/                  deterministic rules engine: autonomy levels, eligibility, risk caps
  tools.ts                 tool registry: name, schema, autonomy level L0–L3, handler
  diagnostics/*.json       authored decision trees (AI picks the path, never invents steps)
  demo/                    intent router + scripted scenarios with timed status lines
  live/client.ts           SSE client for /api/agent, falls back to demo on error/429/no key
api/agent.ts               Vercel Node function: Claude tool loop → protocol events (SSE)
src/features/agent/        Help Agent UI (panel, composer, messages, cards)
```

### Event protocol (single contract for both engines)

`status` (narrated step, e.g. "Checking your Madden NFL 23 purchases…") ·
`message` (text + citations to article ids, purchase records or policies) ·
`card` (`restore_preview` | `receipt` | `diagnostic_step` | `case_draft` | `security_checklist` | `incident`) ·
`handoff` (advisor greeting + summary) · `error` · `done`.

### Guardrails as code (from PRD "Trust, safety, and guardrails")

| Level               | Engine behavior                                                                                                                                                                                                                                | UI                                   |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| L0 Inform           | Read-only tools run automatically                                                                                                                                                                                                              | Cited answer                         |
| L1 Suggest          | Returns step cards. Nothing changes until the player acts                                                                                                                                                                                      | `DiagnosticStepCard`                 |
| L2 Act with confirm | The tool **never executes from the model**. It returns a _proposed action_. On the player's tap, the browser calls `executeAction(id)`, which **re-checks the rules engine** before applying and writes a receipt with a reference ID and undo | `RestorePreviewCard` → `ReceiptCard` |
| L3 Human required   | Gathers context and drafts the case. No account change                                                                                                                                                                                         | `CaseDraftCard` → `HandoffCard`      |

- **Policy before model:** eligibility, grant caps (per player and per day) and value
  thresholds live in `policy/` as pure, unit-tested functions.
- **Least privilege:** tools only take the signed-in demo player's id. Per-scenario
  tool allowlists.
- **Prompt-injection defense:** screenshots and pasted text are passed as data. The
  system prompt states that content inside them is never an instruction.
- **Safety triggers:** distress, harassment or repeated failure route straight to L3.
- **Always visible:** an "AI" badge in the panel chrome, an AI self-introduction in
  the first message, and a "Talk to a person" button at all times.

### Live engine (`api/agent.ts`)

- `@anthropic-ai/sdk`, model `claude-opus-5-5` (the default; see the cost note under
  Open items), adaptive thinking, `output_config.effort: "low"` for chat latency,
  streaming.
- Manual tool loop rather than Tool Runner, because L2 calls must be intercepted and
  turned into proposals. Tools use `strict: true`.
- `fallbacks: "default"` (server-side refusal fallback). Prompt caching on the frozen
  system prompt plus tool list.
- Vision: dropped screenshots are sent as base64 image blocks so the model can extract
  game, platform and error code.
- Abuse and cost controls: per-IP rate limit, max turns and tokens per conversation, a
  daily spend cap, and an `AGENT_LIVE` kill switch. Over any limit, the client falls
  back to demo mode silently and shows a "Demo mode" chip.
- Env: `ANTHROPIC_API_KEY`, `AGENT_LIVE`, `AGENT_DAILY_BUDGET_USD`, set in Vercel.

## Feature map (PRD capability → what gets built)

| #   | PRD capability                             | Build                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| --- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | **Help Agent**                             | `HelpAgentPanel` (side sheet on desktop, full screen on mobile, focus-trapped dialog), `AgentComposer` (text, Web Speech dictation, screenshot drop), `StatusLine` (`aria-live="polite"`), `AgentMessage` + `CitationChip`, `AutonomyBadge`, a persistent "Talk to a person" button. Context pre-fill: owned games, platform, open cases and incidents load before the first reply. Conversations attach to a case thread (resume from My Cases). Entry points: home hero CTA, floating launcher, game pages, search zero-results, case details. |
| 2   | **Instant Content Recovery**               | Tools: `find_purchase`, `check_entitlement` (L0) and `restore_entitlement` (L2). Eligibility engine outcomes: auto-eligible → preview card; needs confirmation; over threshold, refund or chargeback → L3 case with evidence attached (never asks for screenshots). `ReceiptCard` + receipt entry in My Cases with timestamp, reference ID and undo.                                                                                                                                                                                             |
| 3   | **Guided Diagnostics**                     | Authored trees: _Battlefield 2042 crash on PS5 (multiplayer)_ and _FIFA 23 connection drops_. 2–3 targeted questions, then `DiagnosticStepCard`s marked done, skipped or failed, with "That didn't work" branching. L2 one-click fixes (refresh entitlements, reset cloud save) behind confirm. The diagnostic log is attached to any escalation.                                                                                                                                                                                                |
| 4   | **Secure Account Recovery**                | Multi-signal verification (email, phone, purchase history, play history) → credential reset, 2FA check and sign-in review → `SecurityChecklistCard`. Risk signals (new device, region change, recent email change) cap autonomy: high risk means L3 handoff and **zero** changes applied. "Can't sign in?" entry on My Account.                                                                                                                                                                                                                  |
| 5   | **Answer-first Search & Proactive Status** | `AnswerCard` above the type-ahead list (cited, filtered to the player's game and platform). Zero results → "Ask the Help Agent: '…'" with the query pre-filled. `IncidentBanner` on Home and game pages for owned games, with status, ETA and **Follow this issue** (subscription + status-change toast).                                                                                                                                                                                                                                        |
| 6   | **Living Cases & Warm Handoff**            | Auto-drafted `CaseDraftCard` (issue, evidence, steps tried, sentiment) that the player edits and sends. `CaseTimeline` unifying AI, chat, email and receipts in Case Details. `PlainStatus` block (now / next / predicted resolution window). `HandoffCard`, where the advisor greets the player by name and continues from the summary. AI receipts and drafted cases appear in My Cases.                                                                                                                                                       |

With the AI layer **off**, every v1 surface renders exactly as today. The existing pixel
parity harness re-runs against `?ai=off` to prove it.

## Demo scenarios (deterministic, deep-linkable `?scenario=…`)

1. **quick-answer:** "How do I link my EA account to Twitch?" → L0 cited answer.
2. **content-recovery:** "I bought a Madden NFL 23 Ultimate Team pack but it's not
   showing up" → purchase found, entitlement missing → restore preview → receipt.
3. **content-review:** a high-value bundle → ineligible → auto-drafted case with
   evidence.
4. **diagnostics:** "Battlefield 2042 keeps crashing on my PS5 in multiplayer" →
   steps → one fails → case with diagnostic log.
5. **known-issue:** FIFA 23 matchmaking incident → banner answers before the player
   asks → Follow.
6. **account-recovery:** low risk → self-service + security checklist.
   **account-recovery-risky:** new device + region change → human, no changes applied.
7. **escalate:** distress or harassment → immediate warm handoff.

## Phases (mirrors the PRD rollout: read-only first, then earn the right to act)

| Phase                               | Scope                                                                                                                                                                                                                   | Done when                                                                                                                    |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **0 Foundations**                   | Feature flag + header toggle, mock EA APIs + store + reset, event protocol, rules-engine skeleton, `HelpAgentPanel` shell, demo-engine router, `/demo` scenario hub (unlisted)                                          | Toggle flips AI on/off. Parity harness passes with `?ai=off`. Panel opens and closes accessibly.                             |
| **1 Read-only (L0)**                | Help Agent answers with status lines and citations, answer-first search, zero-result recovery, incident banners + follow                                                                                                | Scenarios 1 and 5 run end to end. Citations only reference real article ids (test).                                          |
| **2 Understand & hand off (L1/L3)** | Guided diagnostics, auto-drafted cases, unified timeline, plain status, warm handoff, safety triggers                                                                                                                   | Scenarios 3, 4 and 7 run end to end. 100% of escalations carry the log or evidence (test).                                   |
| **3 Act with confirm (L2)**         | Content recovery + eligibility engine + receipts/undo, one-click fixes, secure account recovery with risk caps                                                                                                          | Scenarios 2 and 6 run end to end. The rules engine rejects ineligible or high-risk actions even when called directly (test). |
| **4 Live Claude**                   | `api/agent.ts`, tool schemas, system prompt, vision intake, rate/budget limits, demo fallback, golden-set eval (~20 top contact drivers → expected intent, tool and level)                                              | Live mode resolves the scenarios on the deployed preview. The eval passes. Fallback is verified by unsetting the key.        |
| **5 Portfolio & ship**              | `scripts/capture-portfolio.mjs` (Playwright) producing every case-study image at desktop and mobile; diagram pages for the autonomy levels and the old claim flow; DESIGN.md and AGENTS.md updates; Vercel env + deploy | All PRD image placeholders have a matching PNG. Checks pass. Deployed.                                                       |

Phases 1–3 each add Vitest coverage: rules engine and eligibility (exhaustive tables),
tool handlers, demo intent routing, card components queried by role/label, and the
L2 confirm → re-check → receipt path.

### Portfolio images produced (Phase 5)

Hero (Home with the agent open beside the games), old claim-flow timeline,
autonomy-level diagram (L0→L3), agent conversation with a status line and cited
answer, restore preview card, restore receipt, PS5 crash diagnostic steps,
auto-drafted case, My Cases timeline, known-issue banner, secure recovery checklist.

## Open items (decide when we reach them)

- **Model and cost for the live agent.** The plan uses `claude-opus-5-5` at low effort.
  A cheaper model (e.g. `claude-haiku-5-5`) would cut per-visitor cost; that's your call.
- **Rate-limit store.** Vercel KV/Upstash (durable) or best-effort in-memory per instance.
- **PRD open questions.** Whether the prototype visibly takes a position (e.g. a grant
  value threshold for L2→L3, or whether legacy/new boundaries are visible).
