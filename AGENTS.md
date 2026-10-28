# AGENTS.md

Working guide for AI coding agents (and humans) in this repository.
Design details: [DESIGN.md](DESIGN.md). Refactor history: [docs/REFACTORING.md](docs/REFACTORING.md).

## Project

EA Help: a client-side React prototype of a player-support portal (help topics,
game help hubs, support cases, infractions, account tools). All data is static
fixtures in `src/data`. There is no backend.

- **Stack:** React 19, TypeScript (strict), Vite 7, React Router 7 (data router),
  Tailwind CSS 3.4, react-icons 5, Vitest + Testing Library (happy-dom).
- **Node:** 22 (see `.nvmrc`; `>=20.19` is required by Vite 7).
- **Deploy:** Vercel (`vercel.json`), production URL https://ea-help.vercel.app.
- **Repo:** https://github.com/emonterrubio/ea-help

## Commands

```bash
npm install          # install dependencies
npm run dev          # dev server at http://localhost:5173
npm run build        # typecheck (tsc -b) + production build to dist/
npm run preview      # serve dist/
npm run typecheck    # tsc -b only
npm run lint         # ESLint (typescript-eslint strict, react-hooks, jsx-a11y)
npm test             # Vitest, single run
npm run format       # Prettier write
```

Before you finish a change, run `npm run typecheck && npm run lint && npm test && npm run build`.
All four must pass.

## Layout

```
src/routes.tsx       route table: add routes here, lazy-load anything not on the home page
src/layouts/         route shells with <Outlet/>
src/pages/           one component per route
src/components/      ui/ primitives, then cards/, sections/, navigation/, tables/, forms/, …
src/hooks/           small reusable hooks
src/lib/             pure, unit-tested helpers
src/data/            typed fixtures (no JSX, no React imports; icons are IconType refs)
src/types/domain.ts  all domain types
src/styles/          tokens, reset, component CSS (in @layer components), Tailwind entry

# v3 AI layer (docs/AI_LAYER_PLAN.md)
src/features/flags/      useAiLayer(): ?ai=on|off + localStorage; off = untouched v1
src/features/agent/      Help Agent UI: provider/reducer, <dialog> panel, launcher, cards
src/features/demo-controls/  prototype-only toggle/reset dock (data-demo-chrome)
src/agent/protocol.ts    event contract shared by the demo and live engines
src/agent/policy/        deterministic rules: autonomy levels L0–L3, eligibility, risk
src/agent/demo/          scenario registry, intent router, scripted demo engine
src/services/ea-api/     mock EA Help APIs + persisted demo store (reset from the dock)
```

Import with the `@/` alias (maps to `src/`).

## Conventions

- **Components:** function components with named exports, typed props interfaces,
  one responsibility each. Keep data shaping in `lib/` or at the top of the page,
  not inside JSX.
- **No default exports**, except `src/data/*` fixtures.
- **Styling:** Tailwind utilities for layout. Design-system classes (`btn-*`, `chip-*`,
  `card`, typography classes) for branded pieces. Write class names as literals so
  Tailwind can detect them. Don't use inline `style`.
- **Buttons vs links:** navigation is `<Link>`/`NavLink`; actions are `<Button>`.
  Never put an `onClick` on a `div`.
- **Accessibility is required:** labelled form controls (`useId`), `alt` text
  (`""` for decorative), `aria-label` on icon-only buttons, `aria-hidden` on icons.
  `eslint-plugin-jsx-a11y` enforces most of this.
- **Types:** no `any`, no non-null assertions (`!`). Narrow with guards instead.
- **Tests:** colocate `*.test.ts(x)` next to the code. Pure helpers get unit tests.
  Interactive components get Testing Library tests that query by role or label.

## AI layer rules

- With the AI layer **off**, the app must stay pixel-identical to v1. Gate every new
  surface behind `useAiLayer()`. Prototype-only UI carries `data-demo-chrome`.
- The UI renders only `AgentEvent`s (`src/agent/protocol.ts`). New agent behavior goes
  into an engine, never into components.
- Eligibility and risk decisions live in `src/agent/policy/` as pure, tested functions.
  The model never decides whether an account change is allowed, and L2 actions always
  need a player tap.
- Demo scenarios are deep-linkable (`/?scenario=<id>`). Every scenario's sample prompt
  must route to itself (enforced by `router.test.ts`). `/demo` lists them (unlisted route).

## Gotchas

1. **CSS cascade order is load-bearing.** See DESIGN.md §6. Component CSS must stay
   in `@layer components`. If you move it before preflight, every `type="button"`
   loses its background.
2. **Behavior was preserved on purpose.** Some odd-looking things are intentional
   legacy behavior:
   - `usePlaceholderAction()` pushes `#` to history (legacy `navigate('#')`).
   - The search list stays open with "No results found" until it is cleared.
   - `sortGames` sorts the _currently displayed_ list (stable sort), and "All"
     compares ids as strings.
   - Featured home games are picked once per page load (module scope).
   - The "Active Cases" view scans only the first 6 cases.
   - The legacy class name `btn-terciary-*` and copy typos ("helpul",
     "possbile") are unchanged.
     Don't "fix" these silently. Raise them first.
3. **Large images.** `src/assets/images` holds multi-MB hero JPGs. Prefer
   optimizing them over adding more.
4. `design/` (the PSD source) is git-ignored.

## Deployment

Pushing to `main` deploys to production on Vercel once the GitHub repo is linked.
Every PR gets a preview deployment. SPA routing works through the rewrite in
`vercel.json`. Build output is `dist/`.
