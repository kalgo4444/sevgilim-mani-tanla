# AGENTS.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A romantic date-invitation website, with all visible text in Uzbek (Latin script). The flow has four screens: envelope → invitation (a "Yes" button and a "No" button that runs away) → date planner (place, date, time) → celebration. The owner gets reports through a Telegram bot. There is no database and no backend. The only server code is one Route Handler that forwards reports to Telegram.

**`docs/index.md` is the full spec and the source of truth.** It covers config keys, animations, report payloads, Telegram message formats and the verification checklist (§10). Read the relevant section before changing a feature.

## Commands

Use **bun / bunx only**, never npm, yarn or pnpm.

```bash
bun install
bun dev                 # dev server on :3000
bun run lint            # biome check (Biome, not ESLint)
bun run format          # biome format --write
bunx tsc --noEmit       # type check
bun run build
```

There is no test framework. "Done" means `lint`, `tsc` and `build` all pass, plus the manual checks in spec §10. After a build, grep `.next/static` for the bot token (without printing it) to confirm it never reached the client.

To run the site without sending real Telegram messages, blank the keys for that process: `TELEGRAM_BOT_TOKEN= TELEGRAM_CHAT_ID= bun dev`. Empty process env vars win over `.env`, so `/api/report` answers `503` and the site keeps working.

## Stack specifics

- Next.js 16 (App Router), React 19, TypeScript strict (no `any`), React Compiler on (`reactCompiler: true`).
- Tailwind v4 loads through the `@tailwindcss/turbopack` loader in `next.config.ts` (not PostCSS). Config is CSS-first: color/shadow tokens in `@theme` and font tokens in `@theme inline` in `app/globals.css`. Do not add a `tailwind.config.js`. Envelope `clip-path` shapes and date-picker styling are the only custom CSS.
- Runtime dependencies are `framer-motion`, `lucide-react` and `server-only`. **Add nothing else.** No UI kits, state managers, Zod, confetti libraries, UA parsers or Telegram SDKs. Type guards and the UA parser are hand-written, and Telegram is called with `fetch`. This overrides the generic advice in `.claude/skills/nextjs.md`, which suggests Zustand, Zod and Shadcn.
- lucide-react is v1: `Loader2` still works as an alias of `LoaderCircle`.
- `app/layout.tsx` types `children` as `Readonly<{ children: ReactNode }>` rather than the generated `LayoutProps`, so `bunx tsc --noEmit` passes on a clean checkout before Next has generated its types.

## Architecture: Feature-Sliced Design

- **Routing lives in the root `app/` folder** and only wires FSD code together. Because root `app/` exists, Next ignores `src/app`. Root `pages/README.md` is a placeholder that stops Next from treating `src/pages` as the Pages Router. Don't delete it.
- `@/*` maps to `./src/*`. Layers inside `src/`: `app` (providers only) → `pages` → `widgets` → `features` → `entities` → `shared`.
  - A layer may import only from layers **below** it. The root `app/` folder may import from any layer.
  - Slices on the same layer must not import from each other. The one exception uses FSD's `@x` notation: `entities/report` imports types from `entities/visitor/@x/report.ts` and `entities/date-plan/@x/report.ts`. Add to those files rather than importing another entity's internals.
  - Each slice exposes a public API through `index.ts`. Import from the slice root (`@/features/escape-button`), never from internal files.
  - Allowed segment names: `ui`, `model`, `lib`, `api`, `config`.
- **`@/shared/lib` (its `index.ts`) must stay server-safe.** The API route imports it, and the build fails if a React hook is reachable from there. That's why `useIsClient` is not in the barrel and is imported as `@/shared/lib/useIsClient`. Put any new hook in its own file the same way.
- Server-only code lives in `*.server.ts` files that start with `import "server-only"` (currently `src/shared/api/telegram.server.ts`). Only `app/api/**` imports them, by direct path. Never re-export them from a public `index.ts`.
- `app/layout.tsx` and `app/page.tsx` stay Server Components. `MotionProvider` (`<MotionConfig reducedMotion="user">`) wraps the body. The `"use client"` boundary starts at `InvitationPage` (`src/pages/invitation`). It holds `stage`, the chosen `DatePlan` and a `round` counter, renders one widget at a time inside `AnimatePresence mode="wait"`, and keys each screen by `round` so replay remounts everything.
- **All user-facing text and content** lives in `src/shared/config/invitation.ts` (typed `InvitationConfig`). Widgets read the config and pass text to features as props, so features stay text-agnostic. Never hardcode text in components. Use the real `‘` character in words like `Yo‘q`. The exceptions are Telegram message strings (`entities/report/lib/formatReportMessage.ts`) and Uzbek month/weekday names (`shared/lib/formatDateTime.ts`).

## How a report travels

1. `features/telegram-report/useTelegramReport(stage)` is the only client sender. It keeps the session id, the "No" attempt counts, `round` and the accepted/left flags in refs, so counting never re-renders.
   - `visit` is sent once per tab, guarded by the `sessionStorage` key `invitation:visit-reported`.
   - `left` uses `sendBeacon` on `pagehide`/`visibilitychange`. It is sent once, and only if no plan was accepted during that page load.
   - `accepted` is awaited by `InvitationPage.handleConfirm` before it shows the celebration. `postReport` never throws and times out after 5 s, so a failed send can't block the flow.
2. `shared/api/report-client.ts` only POSTs JSON. Payload types live in `entities/report`.
3. `app/api/report/route.ts` runs these checks in order: rate limit per IP (in memory, resets on cold start) → streamed body read capped at 4 KB (`413`) → `JSON.parse` + `isReportPayload` (`400`) → config check (`503`) → `sanitizeReportPayload` (trim and length-limit) → `formatReportMessage` with IP, parsed UA and server time → `sendTelegramMessage` (`502` on failure). Validation runs before the config check, so 400/413 can be tested without keys.

When you change a payload field, update the type in `entities/report/model/types.ts`, the guard and the sanitizer in `isReportPayload.ts`, and the formatter.

## The escaping "No" button (`features/escape-button`)

- Placement logic is pure: `lib/findSafePosition.ts` tries random spots, then falls back to a grid. It checks the viewport padding, the obstacle rects (Yes button, greeting heading, question, passed in as `avoidRefs` from the widget) and a minimum jump distance.
- The button never leaves its layout slot. `model/useEscapePosition.ts` only animates `x`/`y` motion values, and it tracks the **target** offset in a ref instead of measuring mid-spring. The button sits `absolute` inside a slot sized by an invisible copy of the first label. If you remove that slot, longer teaser labels re-flow the centered row and push the button off-screen.
- Attempt kinds: `hover` (window `pointermove` within 56 px, throttled to 400 ms), `tap` (`pointerdown`; a non-passive `touchstart` listener cancels the click) and `focus` (`:focus-visible` only). A click or focus within 700 ms of a pointerdown is treated as the same attempt.

## The envelope (`widgets/envelope`)

The opening is one `useAnimate` sequence that targets `data-*` attributes inside the scope (`data-seal`, `data-flap`, `data-letter`, `data-body`, `data-chrome`). The z-order changes mid-sequence: the flap drops to `z-5` after its 180° fold, and the letter rises to `z-40` before it grows. Reduced motion takes a separate fade-only branch. When you add layers, keep this z-order and the attributes in sync.

## Cross-cutting rules

- **Secrets:** `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` are server-only. Never use the `NEXT_PUBLIC_` prefix, never log them, and never return them or Telegram's error body to the client. The spec wants real values in `.env.local`. A `.env` with real values also exists. Don't print either file.
- **Privacy:** collect only what spec §7.1 lists. No geolocation, cookies, fingerprinting, analytics or third-party IP lookups.
- **Hydration:** use `window`, `navigator`, `sessionStorage`, `crypto` and random values only after mount. Randomized decoration (`FloatingHearts`, `Confetti`) renders an inner layer only when `useIsClient()` is true, and generates its particles in a lazy `useState` initializer. `createId()` falls back from `crypto.randomUUID` because that API is missing on plain-http LAN URLs (phone testing).
- **Motion:** animate `transform` and `opacity` only. Respect reduced motion via `MotionProvider` plus `useReducedMotion()` branches (envelope, escape button, hearts, confetti). In dev, Framer Motion logs its own "Reduced Motion enabled" warning when reduced motion is on. It is expected and absent in production.
- **Browser testing:** the Playwright MCP writes `.playwright-mcp/` into the repo root, which makes the dev server Fast-Refresh in a loop. Delete the folder when you're done.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
