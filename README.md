# FitArc — Personal Fitness Tracker

FitArc is a responsive React dashboard for tracking nutrition, workouts, health metrics, sleep and recovery.

## Features

- Personal dashboard with seven-day calorie and sleep charts
- Meal logs with calories, protein, carbohydrates and fat
- Workout logs with duration, intensity, sets, reps and estimated calories burned
- Health metrics for heart rate, steps, temperature and weight
- Sleep duration/quality and recovery/hydration/stress logs
- Add and delete entries with local browser persistence
- Responsive navigation and accessible entry dialogs

## Requirements

- Node.js 20 LTS or newer (Node.js 22 LTS recommended)
- npm

## Run locally

Open a terminal in the project root — the directory containing `package.json` — then run:

```bash
npm install
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

To check a production build:

```bash
npm run build
npm run preview
```

## Data and privacy

This repository is configured to run without a remote database. Entries are saved in the current browser's `localStorage`, so they persist in that browser but do not automatically sync between devices or browsers. Clearing site data will remove those entries. Do not use this local-only setup for shared accounts or sensitive medical records.

## Environment variables

No environment variable is required for the current local-only tracker. Do not commit `.env`, `.env.local`, or API secrets. Vite variables prefixed with `VITE_` are included in client-side bundles and must be treated as public. If integrating a third-party API that requires a private secret, call it through a server-side endpoint instead of exposing the key in the browser.

## Deploy

Import this repository into Vercel or Netlify and use:

- Build command: `npm run build`
- Output directory: `dist`

The app uses client-side routing. Configure your host to rewrite application routes to `index.html` if deep links return 404.

## Dependency security

Run `npm audit` after installing dependencies. Review the proposed fixes and test the build before applying breaking upgrades. Keep dependencies current and enable Dependabot alerts/security updates in GitHub.
