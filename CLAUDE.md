# CLAUDE.md

Guidance for Claude Code in this repository. The shared agent guide is imported below.
Keep project rules in AGENTS.md so every agent sees the same thing.

@AGENTS.md

## Claude-specific notes

- Run the verification sequence before you report a change as done:
  `npm run typecheck && npm run lint && npm test && npm run build`.
- For visual changes, run `npm run dev` and check the affected routes at both a
  desktop width (≥1024px) and a mobile width (375px). Header, nav and drawer
  differ between them.
- Read DESIGN.md before you add a component or a color, and reuse tokens and the
  existing `Button`/`Chip`/card components.
- Don't commit, push or deploy unless asked.
