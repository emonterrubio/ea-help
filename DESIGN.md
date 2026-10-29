# EA Help: Design System & Architecture

This document describes the visual language, component inventory and front-end
architecture of the EA Help prototype. Read it before adding UI. Agent-facing
working rules live in [AGENTS.md](AGENTS.md).

---

## 1. Principles

1. **Visual parity first.** The refactor reproduced the legacy UI pixel-for-pixel.
   New work should extend the existing tokens and component classes, not invent
   one-off styles.
2. **Semantic HTML before ARIA.** Use `<button>` for actions, `<a>`/`<Link>` for
   navigation, real headings, lists and labels. Add ARIA only when HTML can't express it
   (`aria-expanded`, `aria-current`, `aria-pressed`, combobox wiring).
3. **Small, single-purpose components.** Pages compose sections. Sections compose
   cards and UI primitives. Data and pure logic stay out of components.
4. **Typed data.** Every data record has a TypeScript type in `src/types/domain.ts`.

---

## 2. Design tokens

Defined as CSS custom properties in [`src/styles/tokens.css`](src/styles/tokens.css).

| Family        | Tokens                         | Typical use                                                                           |
| ------------- | ------------------------------ | ------------------------------------------------------------------------------------- |
| Coral (brand) | `--nova-color-coral10 … 90`    | Primary buttons (`coral60`/`70`), red chips                                           |
| Gray          | `--nova-color-gray05 … 90`     | Text, tertiary buttons, table stripes (`gray05`)                                      |
| EA Blue       | `--ea-color-blue05 … 90`       | Secondary buttons (`blue60`/`70`), links, ghost buttons (`blue50`), banner (`blue60`) |
| EA Yellow     | `--ea-color-yellow10 … 90`     | Suspension chips (`yellow50`)                                                         |
| EA Green      | `--ea-color-green10 … 90`      | "Open" status chips (`green50`)                                                       |
| Warning       | `--nova-color-warning10 … 90`  | Warning alerts                                                                        |
| Utility       | `--black`, `--white`, `--link` |                                                                                       |

Tailwind's default palette (`gray-*`, `slate-*`, `blue-*`, `red-*`, `zinc-*`) is also used
for layout-level styling (borders, backgrounds, nav underline `red-600`). Keep brand
colors in tokens. Use Tailwind colors for neutral scaffolding.

## 3. Typography

The base typeface is [Inter](https://fonts.google.com/specimen/Inter), loaded from Google
Fonts in `index.html`. [`src/styles/fonts.css`](src/styles/fonts.css) defines
`--font-family-sans`. Tailwind's `font-sans` uses the same stack. The `electronicArts*`
class names are legacy; Display and Text both resolve to Inter, and the suffix sets
`font-weight`.

| Class                          | Weight               | Use                               |
| ------------------------------ | -------------------- | --------------------------------- |
| `electronicArtsDisplayBold`    | 700                  | Section titles, card titles       |
| `electronicArtsDisplayRegular` | 400                  | Hero titles, banner titles, chips |
| `electronicArtsTextBold`       | 700                  | Labels, table headers, emphasis   |
| `electronicArtsTextRegular`    | 400                  | Form labels, hero subtitles       |
| `electronicArtsTextLight`      | 300                  | Light text                        |
| `electronicArtsDisplayLight`   | 300                  | Light display text                |

Font sizes use standard Tailwind utilities only. Don't add custom font-size classes.

| Role                    | Classes                                               |
| ----------------------- | ----------------------------------------------------- |
| Paragraph copy          | `text-base leading-5 tracking-wide`                   |
| Secondary copy, metadata | `text-sm tracking-wide`                              |
| Eyebrows                | `text-xs font-bold uppercase leading-6 tracking-wider` |

Headings use Tailwind sizes too (`text-xl`, `sm:text-6xl` …). Elements without a type class
use Inter through the reset.

## 4. Layout

- **Content column:** `lg:max-w-5xl md:max-w-4xl max-w-2xl`, centered, with
  `sm:px-10 px-4` gutters ([`PageContainer`](src/components/layout/PageContainer.tsx)).
- **Fixed header:** 64px (`h-16`). Pages start with `mt-16`.
- **Breakpoints:** Tailwind defaults (`sm` 640, `md` 768, `lg` 1024). The desktop
  top nav shows at `md` and up. Below `md` the mobile header and drawer
  ([`Sidebar`](src/components/navigation/Sidebar.tsx)) are used.
- **Grids:** topics `1/2/4` columns, games `2/3/4`, case/infraction cards `1/2/3`.

## 5. Components

### Primitives (`src/components/ui`)

| Component         | Variants / props                                                                                                                                                                                                                                                                                | Notes                                                                                        |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `Button`          | `buttonStyle`: `btn-primary-solid`, `btn-secondary-solid`, `btn-secondary-outline`, `btn-terciary-solid`, `btn-terciary-outline`, `btn-ghost-solid`, `btn-white-outline`, `btn-alert-info`, `btn-link` · `buttonSize`: `btn-sm`/`md`/`lg` · `buttonWidth`: `w-full`/`w-auto`/`w-full sm:w-auto` | Defaults to `type="button"`. "terciary" spelling is legacy and kept for class compatibility. |
| `Chip`            | `chipStyle`: `chip-gray`/`blue`/`green`/`yellow`/`red` · `chipSize`: `chip-sm`/`md`/`lg`                                                                                                                                                                                                        | Renders `<span>`; renders `<button aria-pressed>` when `onClick` is given.                   |
| `Accordion`       | `header`, children                                                                                                                                                                                                                                                                              | Disclosure button with `aria-expanded`/`aria-controls`.                                      |
| `BackButton`      | none                                                                                                                                                                                                                                                                                            | `navigate(-1)`.                                                                              |
| `Divider`         | `className`                                                                                                                                                                                                                                                                                     | `<hr>` styled as a 1px gray rule.                                                            |
| `PlaceholderLink` | `className`                                                                                                                                                                                                                                                                                     | Focusable link with no destination yet; click does nothing.                                  |

### Composites

- **Cards** (`components/cards`): `CardTopics` (icon + title + CTA), `CardArticles`
  (eyebrow + title + preview), `CardGenericVertical` (case/infraction summary),
  `CardMediaHorizontal` (promo with image).
- **Layout** (`components/layout`): `PageHero` (decorative full-bleed image + title),
  `PageContainer`, `SectionHeading`.
- **Navigation** (`components/navigation`): `TopNav`, `Sidebar`, `SectionTabs`,
  `Footer`, `UserAvatarButton`.
- **Sections** (`components/sections`): home and help-hub blocks (`Topics`,
  `FeaturedGames`, `Banner`, `ContactUs`, `PageHelpful`, `MoreHelp`, …).
- **Tables** (`components/tables`): `DataTable` shell + `CasesTable`,
  `InfractionsTable`. Columns collapse into a stacked `<dl>` below `lg`.
- **Forms** (`components/forms`): `TextField` (label is always associated via
  `useId`), `Upload`, `RecordNotice`.

## 6. Cascade order (important)

The legacy app loaded Tailwind from the Play CDN, which injected its `<style>` after
the app CSS. Tailwind therefore won every equal-specificity conflict. To reproduce
that cascade, [`src/styles/index.css`](src/styles/index.css) is ordered:

1. `fonts.css`, `tokens.css`, `reset.css`: element-level rules that **Tailwind
   preflight overrides**.
2. `components/*.css`, each wrapped in `@layer components`: **after preflight,
   before utilities**. Utilities still beat component classes. Component classes beat
   preflight, which matters because preflight resets `[type='button']` backgrounds to
   transparent.
3. `@tailwind base; @tailwind components; @tailwind utilities;`

Rules of thumb:

- Put new component classes inside `@layer components { … }`.
- Utilities override component classes. Don't add `!important` to "fix" that.
  Remove the conflicting utility instead.
- Classes in `@layer components` are purged when unused, so write class names as
  literal strings (no `` `chip-${color}` `` concatenation).

## 7. Accessibility conventions

- One `<main id="main-content">` with a skip link in `AppShell`.
- Primary nav uses React Router `NavLink` with `end`, which sets `aria-current="page"`.
- Every form control has a `<label>` (visually hidden with `sr-only` when the design
  has none).
- Decorative images use `alt=""`. Logos use the product/game name.
- Icon-only buttons have `aria-label`. Icons are `aria-hidden`.
- The mobile drawer is `inert` while closed, so off-screen links aren't focusable.
- Focus styles: buttons, chips and accordion headers show a `:focus-visible` outline.
- Respect `prefers-reduced-motion` for drawer transitions.

## 8. AI layer (v3) patterns

The Help Agent follows the PRD's agentic design principles. Reuse these pieces:

| Pattern           | Component                                             | Rule                                                                              |
| ----------------- | ----------------------------------------------------- | --------------------------------------------------------------------------------- |
| Identify as AI    | `AiBadge`, panel subtitle, first message              | Always visible; the agent never imitates an advisor                               |
| Show the work     | `StatusLine`                                          | One short present-tense line per tool call; spinner while active, check when done |
| Explain the why   | `AgentMessage` citations                              | Every answer or action cites an article, purchase record or policy                |
| Autonomy          | `AutonomyBadge` (L0 slate, L1 sky, L2 amber, L3 rose) | Shown on every agent response                                                     |
| Escape hatch      | "Talk to a person" in the panel header                | Never hidden or disabled except while a request is running                        |
| Warm handoff      | `HandoffNotice`                                       | States the advisor is a person and shows what they already know                   |
| Context pre-fill  | `ContextStrip`                                        | Shows what the agent already knows so the player never re-enters it               |
| Act with confirm  | `ActionPreviewCard`, `OneClickFixPanel` (amber)       | Lists exactly what will change; nothing happens until the player taps confirm     |
| Receipts & undo   | `ReceiptCard` (green), `ReceiptUndoPanel`             | Every L2 change shows a reference ID; reversible changes offer undo               |
| Verify, don't ask | `IdentityCheckCard`, `SecurityChecklistCard`          | Never ask for a password; EA checks the answers and the agent sees pass or fail   |
| Engine honesty    | Panel subtitle ("Live" / "Demo mode")                 | Says which engine is answering; switches to "Demo mode" on any fallback           |
| Show, don't type  | `AgentComposer` screenshot attach (live mode only)    | Attach, paste or drop a screenshot; the agent reads it instead of asking          |

The panel is a native `<dialog>` opened with `showModal()`: a side sheet ≥640px, full
screen below. Focus is contained, Esc closes it, and focus returns to the launcher.
The conversation is an `aria-live` log.

## 9. Front-end architecture

```
src/
  main.tsx            entry: StrictMode + RouterProvider
  routes.tsx          route table (home eager, everything else lazy)
  layouts/            AppShell, CasesLayout, InfractionsLayout (have <Outlet/>)
  pages/              one component per route
  components/         ui/ primitives → cards/, sections/, navigation/, tables/ …
  hooks/              useScrollToTop, usePlaceholderAction
  lib/                pure functions (text, date, random, sortGames, filters)
  data/               typed static fixtures (no JSX)
  types/domain.ts     domain types
  styles/             tokens, reset, component CSS, Tailwind entry
```

- **Routing:** React Router 7 data router (`createBrowserRouter`). URLs are unchanged
  from the legacy app. Vercel rewrites all paths to `index.html` (`vercel.json`).
- **Performance:** route-level code splitting, a long-term cached vendor chunk,
  lazy-loaded game tiles, WOFF2-only fonts, and no runtime Tailwind compiler or
  unused CDN scripts.
- **Placeholder behavior:** CTAs without a destination call `usePlaceholderAction()`
  (pushes `#` onto history, as before) or render `PlaceholderLink`. Replace these
  when real destinations exist.
