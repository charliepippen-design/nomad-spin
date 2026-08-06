# Fix the failing "Playwright Tests" GitHub Action

## What's happening

The failure emails come from GitHub, not from the backend. Your repo has a GitHub Actions workflow (`Playwright Tests`) that runs on every push to `main`. It installs dependencies with `npm ci`, which requires `package-lock.json` to exactly match `package.json`.

When the MCP agent integration was added, `@lovable.dev/mcp-js` and `zod` v4 were installed with Bun, so `bun.lock` was updated but `package-lock.json` was not. Confirmed mismatches:

- `@lovable.dev/mcp-js` — in package.json, missing from the npm lockfile
- `zod` — `^4.4.3` in package.json vs `^3.25.76` in the lockfile
- `@lovable.dev/cloud-auth-js` — `^1.0.0` vs `^0.0.2`

So `npm ci` aborts before any test runs, the job fails, and GitHub emails you on every push. Nothing is wrong with the app, the database, or the published site.

## The fix

1. Regenerate `package-lock.json` from the current `package.json` so it includes the new packages and correct versions (lockfile-only refresh, no app code changes).
2. Align the workflow with the project's actual package manager — the project uses Bun (`bun.lock` is the live lockfile). Switch the Playwright workflow to install with Bun so the npm lockfile can't drift again.
3. Clean up the stale `VITE_SUPABASE_PROJECT_ID` hardcoded in the workflow — it points at a different project ref than this one.
4. Sanity-check the two test specs still match the current site: they assert the page title matches `/Nomad Spin/` (current title starts with "Nomad Spin", so it passes) and that `/guides` renders. No test changes expected, but they'll be verified locally with a production build + preview run before the change is pushed.

## Technical details

- `.github/workflows/playwright.yml`: replace `actions/setup-node` + `npm ci` / `npm run build` / `npx playwright test` with `oven-sh/setup-bun` + `bun install --frozen-lockfile` / `bun run build` / `bunx playwright test`; remove the stale hardcoded project id env var.
- `package-lock.json`: regenerate with `npm install --package-lock-only` so it stays valid for anyone still using npm.
- No change to `playwright.config.ts` (preview on port 4173 works under Bun too).

## Optional (say the word)

If you'd rather stop the emails entirely instead of fixing CI, the workflow can be limited to pull requests only, or disabled. Fixing it is the better default — it's a genuine smoke test of the build.
