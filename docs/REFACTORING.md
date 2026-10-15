# Refactoring Report

Legacy Create React App prototype → React 19 + TypeScript + Vite. External behavior
is preserved: same routes, same rendered output, same interactions. Exceptions are
listed in §4.

## 1. Code overview

### What the legacy app does

A client-side prototype of the EA Help player-support site:

- **Home:** greeting with a random name, article type-ahead search, help-topic cards,
  8 randomly featured games, community banner, promo card, feedback prompt.
- **Game hub** (`/game/:id`): logo, search, featured articles, accordions (account /
  technical / in-game issues / payments), community card, contact card.
- **Catalogs:** `/games` (sortable, first 10) and `/eagames` (genre filter).
- **Topic hub** (`/topic/:topic`): featured articles and popular/community accordions.
- **My Cases:** active case cards, history table, and case details with a live
  conversation (open cases), a read-only thread (archived cases) or a "resume case"
  form (closed but resumable).
- **My Infractions:** dismissible notice, active cards, history table, details with
  a dispute form.
- **My Account:** grid of self-help tools.

All data is hard-coded in `src/data`.

### Anti-patterns found

| Area          | Problem                                                                                                                                                                                                                                                                                                                                          |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Build         | `react-scripts@2.1.3` with React 18. The project **did not build at all**: it relied on the automatic JSX runtime CRA 2 doesn't have, and an image (`ea-filled-black-logo.svg`) was missing. The dev server can't start on modern Node.                                                                                                          |
| `index.html`  | Loaded React 16 _development_ UMD, `babel-standalone@latest`, `@pusher/chatkit`, jQuery and a `text/babel` script pointing at a non-existent file. Tailwind ran from the Play CDN, compiling CSS in the browser on every load.                                                                                                                   |
| Dependencies  | 19 runtime deps, most unused: firebase, axios, jquery, styled-components, emotion, react-table, mode-sass, react-firebase-hooks, …                                                                                                                                                                                                               |
| Dead code     | `src/not used/` (19 files), 7 unused table components (one with TypeScript syntax in a `.jsx` file), unused alert/card/login/form/dropdown components, `accordiondata.js` referencing undefined variables.                                                                                                                                       |
| React         | DOM queried and mutated during render (`document.getElementById` + `classList` in `Search`). Side effects (`handleView()`) inside `.filter()`. `Array.map` used as a filter (returning `undefined`). Missing `key`s. Module-level mutable state. A class component next to hooks.                                                                |
| Correctness   | `if (el.category = 'featured')` (assignment) mutated shared data. Unknown URLs and several valid in-app links crashed the app (white screen). `onClick={'#'}` strings. A duplicate object key (`tag`) in game data.                                                                                                                              |
| Duplication   | `capitalizeFirstLetter` copied into 16 files. `NavLink` markup repeated 8 times. Two near-identical `GameTile`s. Conversation markup duplicated per author. Identical `useEffect(scrollTo)` in 13 components.                                                                                                                                    |
| Accessibility | Clickable `div`s and `li`s. `<button>` nested in `<button>`. `<a href="javascript:;">`. Labels pointing at the wrong ids (`htmlFor="message"` on the summary input). Duplicate element ids. Images without `alt`. Icon-only buttons without names. `<ul>` containing `<p>`. Mobile nav doing full page reloads via `window.location.pathname =`. |
| Type safety   | Plain JS. `PropTypes` imported but unused. No typed data.                                                                                                                                                                                                                                                                                        |
| Styling       | Hundreds of lines of unused CSS (Material Icons, dropdown, responsive table, IE gradient filters). References to undefined CSS variables (`--ea-color-red70`, `--nova-color-gray-90`).                                                                                                                                                           |

## 2. Refactoring changes

| #   | Change                                                                                                                                                                                                                                                                                                                                                | Why                                                                                                                                                               |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **CRA → Vite 7 + TypeScript (strict)** with `@/` alias, `tsc -b` in the build                                                                                                                                                                                                                                                                         | The old toolchain can't build or run on modern Node. Strict types catch data/prop errors at compile time (they found the duplicate `tag` key and unused imports). |
| 2   | **Tailwind Play CDN → compiled Tailwind 3.4** (PostCSS), with an explicit cascade order (DESIGN.md §6)                                                                                                                                                                                                                                                | No runtime CSS compiler, so a faster first paint and no CDN dependency. 3.4 matches the CDN version's defaults, so rendering is identical.                        |
| 3   | **Removed junk scripts** from `index.html` (React 16 UMD, Babel standalone, chatkit, jQuery). Kept Google Analytics. Real `<title>`, description and manifest names                                                                                                                                                                                   | Megabytes of unused JS, and a 404 on every load.                                                                                                                  |
| 4   | **React Router 6.3 → 7 data router** with route-level `lazy()` code splitting                                                                                                                                                                                                                                                                         | Smaller initial bundle. The built-in `NavLink end` replaces the hand-rolled `NavLink` (which crashed on unknown routes) and adds `aria-current`.                  |
| 5   | **Typed domain model** (`types/domain.ts`). Data files converted to `.ts` with no JSX (icons are `IconType` references, rendered by the component)                                                                                                                                                                                                    | Data is serializable and type-checked. Removes the React import from data.                                                                                        |
| 6   | **Shared helpers** in `lib/` (`text`, `date`, `random`, `sortGames`, `filters`) and hooks (`useScrollToTop`, `usePlaceholderAction`)                                                                                                                                                                                                                  | One tested implementation instead of 16 copies.                                                                                                                   |
| 7   | **Search rewritten with React state** (`isOpen`, derived matches, `useMemo`). Combobox/listbox ARIA, a real label, type-ahead logic extracted to `searchArticles.ts`                                                                                                                                                                                  | Removes DOM mutation during render. Same open/close semantics (verified).                                                                                         |
| 8   | **Small single-purpose components**: `PageHero` (replaces Header/HeaderGames/HeaderSearch), `PageContainer`, `SectionHeading`, `SectionTabs`, `GameTile`/`GameGrid`, `DataTable`, `MessageCard`, `TextField`, `DetailItem`, … Large pages (CaseDetails 259 lines, GamePage 188) split into named subcomponents                                        | Readability, reuse, testability.                                                                                                                                  |
| 9   | **Semantic HTML and ARIA**: `button`/`Link` instead of clickable `div`/`li`; `Accordion` with `aria-expanded`/`aria-controls`; `Chip` as `button[aria-pressed]` when interactive; skip link and `<main>`; drawer `inert` when closed; labelled controls via `useId`; `alt` text; icon `aria-hidden`; `focus-visible` outlines; reduced-motion support | WCAG 2.2 AA basics without visual change.                                                                                                                         |
| 10  | **Performance**: vendor chunk split, lazy routes, `loading="lazy"` on game tiles, WOFF2-only fonts with `font-display: swap`, unused CSS purged from `@layer components`, immutable cache headers for `/assets`                                                                                                                                       | Faster loads.                                                                                                                                                     |
| 11  | **Tooling**: ESLint 9 flat config (typescript-eslint strict, react-hooks, jsx-a11y, react-refresh), Prettier, Vitest + Testing Library (39 tests)                                                                                                                                                                                                     | Guards against regressions.                                                                                                                                       |
| 12  | **Deployment**: `vercel.json` (Vite framework, SPA rewrite, asset caching), `.nvmrc` (Node 22)                                                                                                                                                                                                                                                        | Ready for ea-help.vercel.app.                                                                                                                                     |
| 13  | **Dead code removed**: `not used/`, unused components, data, CSS and icon fonts, 4 runtime deps instead of 19. `geometry.psd` (77 MB) moved to a git-ignored `design/`                                                                                                                                                                                | Smaller, clearer codebase.                                                                                                                                        |

## 3. Refactored code

The full source is in `src/`. DESIGN.md §8 describes the structure. Representative
before/after, the home-page search:

**Before:** DOM mutation in render, a side effect inside `filter`, a debug `console.log`:

```jsx
const list = document.getElementById('resultList');
// …
{
  articlesdata
    .filter((post) => {
      if (query === '') {
        postCount = 0;
        return null;
      } else if (post.title.toLowerCase().includes(query.toLowerCase())) {
        postCount += 1;
        handleView();
        return post; // mutates DOM during render
      }
    })
    .slice(0, 10)
    .map((post, index) => <li key={index}>…</li>);
}
```

**After** ([`Search.tsx`](../src/components/search/Search.tsx)):

```tsx
const matches = useMemo(() => findMatchingArticles(articles, query), [query]);
const visibleMatches = matches.slice(0, MAX_SEARCH_RESULTS);

const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
  const nextQuery = event.target.value;
  setQuery(nextQuery);
  if (findMatchingArticles(articles, nextQuery).length > 0) setIsOpen(true);
};
```

## 4. Intentional deviations

Everything else was verified identical (§5). These changes are deliberate:

| Legacy behavior                                                                                                                                  | Now                                                                    | Reason                                                                 |
| ------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Project failed to build (missing `ea-filled-black-logo.svg`)                                                                                     | Added the black EA logo (the coral logo recolored)                     | Required to build. **Replace with the official asset if you have it.** |
| `/topic/password`, `/topic/email`, `/topic/orders`, `/topic/redeem`, `/topic/security` (the My Account "Learn more" buttons) **crashed the app** | Topic page renders with the topic name and empty lists                 | Crash fix. Identical output for topics that have articles.             |
| Unknown URL or unknown id → white screen                                                                                                         | "Page not found" page / "We couldn't find that …" message              | Crash fix                                                              |
| `GamePage` assigned `category = 'featured'` to shared data on every render, so re-visiting a game dropped items from "In-game issues"            | No mutation. Every visit renders like the legacy first visit           | Bug fix                                                                |
| Search clear (×) and Enter submitted the form, reloading the page with `?search=`                                                                | Clear (×) no longer reloads. Enter/search button still submit natively | Bug fix (clear button)                                                 |
| Mobile drawer links did a full page reload                                                                                                       | Client-side navigation                                                 | Performance. Same destinations.                                        |
| Home greeting name re-randomized whenever the app re-rendered on that page                                                                       | Picked once per visit                                                  | Stability                                                              |
| `chip-red:hover` used an undefined variable (background vanished)                                                                                | Hover uses `--nova-color-coral70`                                      | Bug fix (hover only)                                                   |
| `<input type="file" accept="/image/*">` (invalid, so any file was accepted)                                                                      | `accept="image/*"`, matching the "PNG, JPG, GIF" hint                  | Bug fix                                                                |
| Page title "React App"                                                                                                                           | "EA Help" + meta description                                           | SEO/a11y                                                               |
| —                                                                                                                                                | Skip link, `focus-visible` outlines, screen-reader labels              | Accessibility (invisible unless focused or using AT)                   |

Data quirks were kept as-is: two NHL articles typed `genre` instead of `category` and
stay uncategorized, as before.

## 5. Verification

- The legacy source was built unmodified (plus the missing logo) with a throwaway
  Vite config as a baseline, then compared against the refactor in headless Chrome:
  17 routes × desktop (1280px) and mobile (375px). Every route is pixel-identical
  (0%) or differs by at most 0.003% (sub-pixel icon antialiasing from react-icons 5).
  The exception is the home page, whose random game picks differ.
- 17 scripted interaction flows produced identical results on both apps: search
  open/close/no-results/backspace, accordions, alert dismiss, "Learn more" history
  push, sort sequences, genre filter, resume-case form, tile/card/table navigation,
  nav active states and the mobile drawer.
- No console errors on any route in the refactor. The legacy app threw on the 4
  crash routes above.
- `npm run typecheck`, `npm run lint`, `npm test` (39 tests) and `npm run build` all pass.
