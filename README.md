# Aster

Aster is a technology intelligence and discovery platform that helps developers understand what technologies do and how they connect.

## Project status

Phase 3: Explore uses a curated local seed collection, and each technology has a detail page with context, use cases, relationships, alternatives, and selected documentation links. Data remains local; a REST API and backend are not part of this phase.

## Technology

- React
- TypeScript
- Vite
- ESLint

## Getting started

Install a current Node.js release and npm, then run:

```sh
npm install
npm run dev
```

Vite prints the local development URL in the terminal.

## Explore

The Explore page supports case-insensitive search across technology names, descriptions, types, categories, and ecosystems. Category filters, name sorting, and client-side pagination work together. Search, category, sort, and page state are local to the page and are not stored in the URL. Changing a search, category, or sort resets the results to the first page.

The seed catalogue is maintained in `src/data/technologies.ts`. It is local application data, not a live API response.

Technology profiles use `/technologies/:slug`. Relationship fields point to other technology slugs in the same seed collection.

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server. |
| `npm run lint` | Check the project with ESLint. |
| `npm run typecheck` | Run TypeScript project checks. |
| `npm run build` | Type-check and create the production build in `dist/`. |
| `npm run preview` | Preview the production build locally. |

## Environment

The current frontend does not require environment variables or API credentials.

## License

This project is licensed under the [MIT License](LICENSE).
