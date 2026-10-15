# EA Help

A React prototype of the EA Help player-support portal: help topics, game help hubs,
support cases, infractions and account tools.

**Live:** https://ea-help.vercel.app

## Stack

React 19 · TypeScript · Vite 7 · React Router 7 · Tailwind CSS 3.4 · Vitest

## Getting started

Requires Node 22 (`nvm use`).

```bash
npm install
npm run dev
```

Open http://localhost:5173.

## Scripts

| Script              | Description                        |
| ------------------- | ---------------------------------- |
| `npm run dev`       | Start the dev server               |
| `npm run build`     | Typecheck and build to `dist/`     |
| `npm run preview`   | Serve the production build         |
| `npm run typecheck` | TypeScript project check           |
| `npm run lint`      | ESLint (incl. accessibility rules) |
| `npm test`          | Run unit/component tests           |
| `npm run format`    | Format with Prettier               |

## Documentation

- [DESIGN.md](DESIGN.md): design tokens, components, cascade order, accessibility, architecture
- [AGENTS.md](AGENTS.md) / [CLAUDE.md](CLAUDE.md): contributor and AI-agent guide
- [docs/REFACTORING.md](docs/REFACTORING.md): legacy analysis and refactor report

## Deployment

Deployed on Vercel from the `main` branch (`vercel.json` handles SPA rewrites and
asset caching).
