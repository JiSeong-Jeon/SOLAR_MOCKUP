# Solar Mockup (Solar Mockup)

A Vite + React prototype that turns the Mental Health Self-Care Figma design into an interactive mock application. It demonstrates CBT journaling flows, PHQ-9 screening, weekly progress reporting, and a supportive community feed tailored for Korean-speaking users.

## Tech Stack

- React 18 with functional components and hooks
- Vite 6 + SWC for fast dev/build
- TypeScript throughout the app logic
- shadcn/Radix UI primitives for accessible UI building blocks
- Tailwind-inspired utility classes and custom CSS (`src/styles/globals.css`)
- Context API (`src/context/AppContext.tsx`) for mock data/state

## Features

- **Home dashboard** with onboarding cards, quick links to records, and a mood sparkline.
- **CBT record hub** covering Thought Records, Behavior Activation planner, PHQ-9 wizard, and an archive.
- **Community board** showing anonymized shared stories and encouraging reactions.
- **Weekly reports** combining mood data, PHQ scores, and actionable insights.
- **Settings** for personalization, notification preferences, and access to archived content.
- Localization-ready copy written in Korean to match the original design tone.

## Getting Started

```bash
npm install
npm run dev
```

- Dev server opens on `http://localhost:3000/`.
- Build artifacts land in `build/` (`npm run build`).

## Useful Scripts

| Command         | Description                    |
| --------------- | ------------------------------ |
| `npm run dev`   | Start local development server |
| `npm run build` | Production build into `build/` |

## Project Structure (key folders)

```
src/
  components/       # Feature-specific UIs (home, CBT, report, etc.)
  components/ui/    # Reusable UI primitives (shadcn-r)
  context/          # Global mock data/state store
  types/            # Shared TypeScript types
  styles/           # Global styles
```

## Deployment (GitHub Pages example)

1. Set `base: '/REPO_NAME/'` inside `vite.config.ts`.
2. Enable GitHub Pages via Actions and use the workflow in this README (see “Git Setup & Deployment”).
3. After the workflow succeeds, GitHub Pages serves the contents of `build/`.

## Attributions

- Original design: [Figma – Mental Health Self-Care App](https://www.figma.com/design/VbIWllbT0Q8XiWJszloIEk/Mental-Health-Self-Care-App)
- Iconography: [Lucide](https://lucide.dev/)
- UI primitives: [Radix UI](https://www.radix-ui.com/), [shadcn/ui](https://ui.shadcn.com/)
