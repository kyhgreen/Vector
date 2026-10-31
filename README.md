# Vector

Vector is a financial literacy app built for the Congressional App Challenge. It teaches money skills through short lessons, quizzes, practical tools, and a game-style progression system.

This repository contains the application source, lesson content, assets, tests, build scripts, and Windows desktop wrapper from the Vector submission.

## Upload to GitHub

1. Extract `Vector-GitHub.zip` on your computer.
2. Create an empty GitHub repository.
3. Upload the extracted files and folders into the repository's root. `README.md`, `package.json`, and `src/` should appear directly on the repository's main page.
4. Include `.github/`, `.gitignore`, `.gitattributes`, and `.nvmrc`. Some file browsers hide names that begin with a dot.
5. Commit the files to the `main` branch.

Extract the archive before uploading. Uploading the ZIP itself stores an archive instead of making the source files available as a working repository. If the browser rejects a large batch, upload smaller batches or use Git.

To upload with Git, open a terminal in the extracted project folder and run these commands. Replace the example URL with your empty repository's URL.

```bash
git init
git add .
git commit -m "Add Vector source"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
git push -u origin main
```

## Features

- Two learning paths: Money Basics for ages 11–14 and Real-World Money for ages 15–18.
- Thirteen units covering budgeting, saving, banking, shopping, scams, paychecks, credit, loans, investing, and other everyday money decisions.
- Interactive lessons, unit quizzes, guidebooks, and practice for missed questions.
- XP, daily goals, streaks, hearts, coins, badges, avatars, and a shop.
- Weekly leagues with simulated rivals generated on the device.
- Eight tools for budgeting, savings goals, paychecks, credit, debt, compound growth, spending habits, and simulated investing.
- Light and dark themes, sound and haptic settings, and a demo mode.
- An installable web app, a self-contained HTML build, and an Electron desktop app.

## Run locally

Use Node.js 24 and npm. The `.nvmrc` file records the Node version used by the GitHub workflows. An internet connection is needed to install dependencies.

```bash
npm ci
npm run dev
```

Open the local address printed by Vite. The development server also prints a network address for testing on another device connected to the same network.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server. |
| `npm test` | Run the existing automated tests. |
| `npm run typecheck` | Check TypeScript without writing output files. |
| `npm run build` | Check TypeScript and build the web app into `dist/`. |
| `npm run preview` | Serve an existing `dist/` build locally. |
| `npm run build:file` | Build the self-contained app at `submission/Vector.html`. |
| `npm run desktop` | Build and open the app in Electron. |
| `npm run build:desktop` | Package the Windows desktop app into `release/`. |

## Windows desktop app

On a Windows development computer, install dependencies and build the app:

```bash
npm ci
npm run build:desktop
```

The build creates `release/Vector.exe`, a portable executable, and `release/Vector-Setup.exe`, an installer. These packages target 64-bit Windows. People running the finished executable do not need Node.js.

The desktop app loads the same self-contained build used by the HTML version. Its local data is stored in Electron's user-data directory, normally `%APPDATA%\Vector` on Windows.

The project does not include a code-signing certificate. Packaging the app does not make it a signed Windows application.

## Self-contained HTML version

```bash
npm run build:file
```

Open `submission/Vector.html` directly in a browser. The build includes the app code, styles, lesson content, and font, so it can run without a server or internet connection. Local-file storage behavior depends on the browser; progress may not follow the file if it is moved or opened in another browser.

The root `index.html` is the development entry point. Use the generated `submission/Vector.html` when you need a file that opens directly.

## GitHub checks and optional website

The `Check source` workflow runs on pushes to `main`, pull requests, and manual runs. It installs the locked dependencies, runs the tests, checks TypeScript through the web build, and builds both the web and single-file versions. It skips the Electron binary download because these checks do not launch the desktop app.

To publish the web version with GitHub Pages:

1. Open the repository's **Settings > Pages**.
2. Set the build source to **GitHub Actions**.
3. Open **Actions > Deploy to GitHub Pages > Run workflow** and select `main`.
4. Open the website URL shown by the completed deployment.

Deployment runs only when manually requested. Uploading or pushing the project runs its checks without publishing a website. Repeat the deployment workflow after changes you want to publish.

The app uses relative asset paths and hash-based routing so it can be hosted under a repository subdirectory. Other static hosts can serve the contents of `dist/`.

When supported by the browser, the hosted web app can be installed from the browser's install menu. Its service worker caches the app after an online visit for later offline use.

## Project structure

| Path | Contents |
| --- | --- |
| `src/App.tsx` | Routes and shared application effects. |
| `src/main.tsx` | React entry point, bundled fonts, styles, and service-worker registration. |
| `src/content/` | Lesson types, content registry, validation, and unit content. |
| `src/screens/` | Onboarding, learning, lessons, tools, leagues, shop, and profile screens. |
| `src/tools/` | The eight financial tools and their calculation models. |
| `src/state/` | Saved progress, rewards, streaks, leagues, and badges. |
| `src/components/` | Shared interface components, charts, and icons. |
| `src/lib/` | Formatting, dates, finance helpers, randomness, sound, and haptics. |
| `src/styles/` | Global styles and design tokens. |
| `public/` | Application logo used by the web and PWA builds. |
| `desktop/` | Electron entry point, package metadata, and desktop icons. |
| `scripts/` | Scripts that prepare the HTML submission and desktop app. |
| `.github/workflows/` | Source checks and manual GitHub Pages deployment. |
| `vite.config.ts` | Web, offline, single-file, and test configuration. |
| `electron-builder.yml` | Windows packaging settings. |
| `package-lock.json` | Locked dependency versions for reproducible installs. |

Tests live next to the code they cover in files ending in `.test.ts` or `.test.tsx`.

## Technology and third-party packages

The application is written in TypeScript, TSX, CSS, HTML, and JavaScript. React renders the interface, Zustand stores app state, React Router handles navigation, and Vite builds the web app. Electron supplies the desktop window. Vitest and Testing Library run the automated checks.

| Package | Use | License recorded in the lockfile |
| --- | --- | --- |
| React and React DOM | Interface rendering | MIT |
| React Router | Navigation | MIT |
| Zustand | State and local persistence | MIT |
| Motion | Interface animation | MIT |
| Lucide React | Interface icons | ISC |
| canvas-confetti | Celebration effects | ISC |
| M PLUS Rounded 1c via Fontsource | Bundled font | OFL-1.1 |
| Vite | Development and production builds | MIT |
| Electron | Desktop runtime | MIT |
| TypeScript | Type checking | Apache-2.0 |

Dependencies are installed from `package.json` and `package-lock.json`; their original license files remain part of their packages.

## Data and simulations

Vector has no app accounts, backend database, or cloud sync. Progress and tool settings are saved in local browser storage. Clearing that storage or switching devices can remove or separate saved progress. The desktop app and browser versions maintain separate saves.

League opponents are simulated. The investing tool uses a simulated market, and credit and paycheck tools use educational models. These features do not connect to bank, brokerage, credit bureau, or payroll accounts. External reference links open outside the app and require an internet connection.

For demonstrations, enable **Me > Settings > Demo mode** to access lessons without completing their prerequisites.

## Repository contents

This repository includes the original source and assets, with GitHub configuration and this README prepared for upload. Generated HTML, Windows executables, installed dependencies, build output, and local machine files are excluded. The `.gitignore` keeps these generated files out of later commits. Build the app locally when you need a runnable copy, and attach packaged downloads to a GitHub Release if you want to distribute them.

## Validation

This upload package was checked with Node.js 24.22.1 and npm 11.9.0:

- Dependency installation completed using `npm ci` with the Electron binary download skipped.
- All 308 tests across 26 test files passed.
- `npm run build` passed, including TypeScript checking and PWA generation.
- `npm run build:file` passed and produced a self-contained HTML file.
- The desktop preparation script copied that build successfully, and `node --check desktop/main.cjs` passed.

The application source, lesson content, assets, and dependency versions are unchanged from the supplied source archive. This preparation updated the README and GitHub configuration. Windows executable packaging and launch were not tested here.
