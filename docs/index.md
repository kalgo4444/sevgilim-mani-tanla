# Project: Romantic Date Invitation Website

Act as a senior frontend developer and UI/UX designer. Build a beautiful, modern, fully responsive romantic invitation website using **Next.js (latest) + Bun + Tailwind CSS + Framer Motion + Lucide React**, organized with **Feature-Sliced Design (FSD)**.

---

## 1. Project Concept

Create an interactive romantic website where a person invites a girl on a date.

The website should feel personal, elegant, cute, and memorable. The main interaction is a playful invitation with two buttons:

- **"Ha, albatta! ❤️"** (Yes)
- **"Yo‘q 🙈"** (No)

The "No" button escapes whenever the user tries to click or touch it, while the "Yes" button always remains accessible.

After "Yes", the girl **chooses where and when** the date will happen. Then a celebration screen is shown.

The site owner receives a **Telegram bot report** with: the visitor's IP address, device info, how many times she tried to press "No", and the chosen place, date and time.

All visible website text must be in **Uzbek** (Latin script, use the real `‘` character in words like *Yo‘q*, *go‘zal*, *bo‘lasan*).

There is **no database and no separate backend**. The only server code is one Next.js Route Handler that forwards reports to Telegram.

---

## 2. Tech Stack

| Tool | Requirement |
|------|-------------|
| **Next.js** | Latest stable version, **App Router**, TypeScript, one Route Handler for Telegram |
| **Bun** | Package manager and script runner — use `bun`/`bunx` only, never `npm`, `yarn` or `pnpm` |
| **Tailwind CSS** | Latest version (v4, CSS-first config with `@theme`, no `tailwind.config.js` unless truly needed) |
| **Framer Motion** | All animations (`framer-motion` package) |
| **Lucide React** | Icons |
| **next/font/google** | Playfair Display (headings) and DM Sans (body), exposed as CSS variables |
| **server-only** | The only extra package allowed — guards server files from being imported on the client |

Do not add any other dependencies: no confetti libraries, no UI kits, no state managers, no validation libraries (write typed guards by hand), no user-agent parsing libraries (write a small parser), no Telegram SDKs (call the Bot API with `fetch`).

### Environment variables

The bot token and the owner's Telegram user id are provided by the owner. They are **secrets** and live only on the server.

- Create `.env.example` (committed) with empty values:
  ```env
  TELEGRAM_BOT_TOKEN=
  TELEGRAM_CHAT_ID=
  ```
- The real values go into `.env.local` (git-ignored — verify `.gitignore` covers it).
- **Never** use the `NEXT_PUBLIC_` prefix for these, never hardcode them, never send them to the browser, never log them.
- If either variable is missing, the Route Handler returns `503` and logs one clear server-side warning; the website itself keeps working normally.
- The owner must press **Start** in the bot once, otherwise Telegram will not deliver messages to `TELEGRAM_CHAT_ID`. Mention this in the final report.

---

## 3. Architecture — Feature-Sliced Design

### 3.1. Next.js + FSD layout

Next.js routing lives in the **root `app/` folder** and only wires FSD code together. All real code lives in `src/` following FSD layers.

```
.
├── app/                                  # Next.js App Router (routing only)
│   ├── layout.tsx                        # <html lang="uz">, fonts, metadata, providers
│   ├── page.tsx                          # renders <InvitationPage /> from @/pages/invitation
│   ├── globals.css                       # Tailwind import + @theme tokens + base styles
│   └── api/
│       └── report/
│           └── route.ts                  # POST: validate → enrich with IP/device → send to Telegram
├── pages/
│   └── README.md                         # placeholder so Next.js does not treat src/pages as Pages Router
├── public/
├── .env.example
└── src/
    ├── app/                              # FSD "app" layer
    │   └── providers/
    │       ├── MotionProvider.tsx        # <MotionConfig reducedMotion="user">
    │       └── index.ts
    ├── pages/                            # FSD "pages" layer
    │   └── invitation/
    │       ├── ui/InvitationPage.tsx     # stage state machine + AnimatePresence + report wiring
    │       ├── model/stage.ts            # type Stage = 'envelope' | 'invitation' | 'planner' | 'celebration'
    │       └── index.ts
    ├── widgets/                          # FSD "widgets" layer — full screens
    │   ├── envelope/
    │   │   ├── ui/Envelope.tsx
    │   │   └── index.ts
    │   ├── invitation-card/
    │   │   ├── ui/InvitationCard.tsx
    │   │   └── index.ts
    │   ├── date-planner/
    │   │   ├── ui/DatePlanner.tsx
    │   │   └── index.ts
    │   └── celebration/
    │       ├── ui/Celebration.tsx
    │       └── index.ts
    ├── features/                         # FSD "features" layer — user interactions
    │   ├── escape-button/                # the running-away "No" button
    │   │   ├── ui/EscapeButton.tsx
    │   │   ├── model/useEscapePosition.ts
    │   │   ├── lib/findSafePosition.ts
    │   │   └── index.ts
    │   ├── accept-invitation/            # the "Yes" button
    │   │   ├── ui/AcceptButton.tsx
    │   │   └── index.ts
    │   ├── choose-date-plan/             # place + date + time form
    │   │   ├── ui/DatePlanForm.tsx
    │   │   ├── model/useDatePlanForm.ts
    │   │   └── index.ts
    │   └── telegram-report/              # collects stats and sends reports
    │       ├── model/useTelegramReport.ts
    │       └── index.ts
    ├── entities/                         # FSD "entities" layer — domain data
    │   ├── visitor/
    │   │   ├── model/types.ts            # ClientInfo, DeviceInfo
    │   │   ├── lib/collectClientInfo.ts  # browser-side info (screen, language, timezone, touch)
    │   │   ├── lib/parseUserAgent.ts     # UA → { type, os, browser, model? }
    │   │   └── index.ts
    │   ├── date-plan/
    │   │   ├── model/types.ts            # DatePlan
    │   │   └── index.ts
    │   └── report/
    │       ├── model/types.ts            # ReportPayload (discriminated union), NoAttemptStats
    │       ├── lib/isReportPayload.ts    # hand-written runtime type guard
    │       ├── lib/formatReportMessage.ts# builds the Uzbek Telegram message (HTML)
    │       └── index.ts
    └── shared/                           # FSD "shared" layer — reusable, no business logic
        ├── config/
        │   └── invitation.ts             # ALL customizable texts and data
        ├── api/
        │   ├── report-client.ts          # postReport() with fetch, beaconReport() with sendBeacon
        │   └── telegram.server.ts        # import "server-only"; sendTelegramMessage(text)
        ├── ui/
        │   ├── FloatingHearts.tsx
        │   ├── Confetti.tsx
        │   ├── GlassCard.tsx
        │   └── index.ts
        ├── lib/
        │   ├── random.ts
        │   ├── geometry.ts               # rect overlap / clamp helpers
        │   ├── escapeHtml.ts
        │   ├── formatDateTime.ts         # Intl, Asia/Tashkent
        │   ├── useIsClient.ts
        │   └── index.ts
        └── types/
            └── index.ts
```

### 3.2. FSD rules (must follow)

- **Layer order (top → bottom):** `app` → `pages` → `widgets` → `features` → `entities` → `shared`. A layer may import only from layers **below** it. The root `app/` routing folder may import from any layer.
- **No cross-imports** between slices on the same layer (e.g. `widgets/envelope` must not import from `widgets/celebration`).
- Every slice exposes a **public API** through `index.ts`. Import from the slice root (`@/features/escape-button`), never from internal files.
- `shared` contains no business logic and knows nothing about upper layers.
- Server-only files (`*.server.ts`) start with `import "server-only"` and are imported only from `app/api/**`. Do not re-export them from a public `index.ts` that client code uses.
- Segment names: `ui`, `model`, `lib`, `api`, `config` only.

### 3.3. Server / Client components

- `app/layout.tsx` and `app/page.tsx` stay **Server Components**.
- Components that use state, effects, events or Framer Motion get `"use client"`. Keep the client boundary as low as reasonable (`InvitationPage` and below).

---

## 4. Personalization

All texts and data live in **`src/shared/config/invitation.ts`**, fully typed (an exported `interface InvitationConfig` and a `const invitationConfig: InvitationConfig`). No user-facing text is hardcoded inside components. Secrets are **not** part of this file.

| Key | Example value | Where it is used |
|-----|---------------|------------------|
| `girlName` | `"Madina"` (empty string allowed) | Greeting: "Salom, {girlName}! ❤️". If empty → "Salom, go‘zal inson! ❤️" |
| `envelope.teaser` | `"Senga kichik bir xabarim bor..."` | Envelope screen |
| `envelope.openLabel` | `"Xatni ochish"` | Envelope button |
| `invitation.question` | `"Men bilan uchrashuvga borasanmi?"` | Invitation screen |
| `buttons.yes` | `"Ha, albatta! ❤️"` | Yes button |
| `buttons.no` | `"Yo‘q 🙈"` | No button |
| `buttons.noTeasers` | `["Ishonchingiz komilmi? 🥺", "Qochib ketdim! 😜", ...]` | Optional: No button text changes after each escape |
| `planner.title` | `"Qayerga va qachon boramiz? 🌷"` | Planner screen |
| `planner.locations` | `[{ id: "cafe", label: "Shinam kafe", emoji: "☕" }, { id: "park", label: "Park bo‘ylab sayr", emoji: "🌳" }, ...]` | Place options |
| `planner.allowCustomLocation` | `true` | Shows "O‘zim tanlayman ✍️" option with a text input |
| `planner.defaultDate` | `"2026-02-14"` (ISO) | Preselected date (if it is in the past, use tomorrow) |
| `planner.defaultTime` | `"19:00"` | Preselected time |
| `planner.timeSlots` | `["12:00", "15:00", "18:00", "19:00", "20:00"]` | Quick-pick time chips (a time input is also available) |
| `planner.notePlaceholder` | `"Istagingni yoz... (ixtiyoriy)"` | Optional note field |
| `planner.submitLabel` | `"Tasdiqlash 💌"` | Submit button |
| `celebration.title` | `"Yeeee! ❤️ Bilardim, rozi bo‘lasan!"` | Celebration |
| `celebration.subtitle` | `"Unda bizni chiroyli uchrashuv kutmoqda!"` | Celebration |
| `celebration.closing` | `"Bu kunni esda qolarli qilamiz! 🌷"` | Celebration |
| `celebration.replayLabel` | `"Yana bir bor ko‘rish"` | Replay button |
| `report.timezone` | `"Asia/Tashkent"` | Time format in Telegram messages |
| `meta.title`, `meta.description` | Uzbek page title/description | `app/layout.tsx` metadata |

---

## 5. Visual Design

- Colors: soft pink, pastel pink, cream and white. Define them as Tailwind v4 theme tokens in `app/globals.css` (`@theme { --color-blush-50: ...; --color-rose-soft: ...; --color-cream: ...; }`) and use them through Tailwind classes.
- Fonts: Playfair Display for headings, DM Sans for body/buttons, loaded with `next/font/google` and mapped to `--font-display` and `--font-sans` in `@theme`.
- Glassmorphism cards (`bg-white/50 backdrop-blur-xl border border-white/60 shadow-...`), wrapped in a reusable `GlassCard`.
- Soft shadows, gentle gradient backgrounds, floating hearts on every screen.
- Form controls on the planner screen match the design: rounded glass inputs, pink focus rings, selectable location cards and time chips — no default-looking browser controls.
- Responsive for mobile (from 360px), tablet and desktop. Use `min-h-dvh` instead of `h-screen`.
- Elegant and visually balanced, no excessive decorations.
- Styling with Tailwind utilities; custom CSS in `globals.css` only where Tailwind cannot express it cleanly (e.g. envelope shapes via `clip-path`).

---

## 6. Website Flow

### Screen 1 — Romantic Envelope (`widgets/envelope`)

- Romantic background, floating hearts.
- Teaser text: **"Senga kichik bir xabarim bor..."**
- An animated envelope with a **heart-shaped seal** (gentle heartbeat pulse).
- Clickable envelope and a button **"Xatni ochish"**.

When clicked:

1. The seal pops and fades.
2. The flap opens in **3D** (`perspective`, `rotateX`, `transform-origin: top`, `backface-visibility: hidden`, correct z-ordering of flap/front/letter).
3. A letter slides up out of the envelope.
4. The letter grows and the screen transitions smoothly to the invitation.

Props: `onOpened: () => void`, called when the animation finishes.

### Screen 2 — Invitation (`widgets/invitation-card`)

- **"Salom, {girlName}! ❤️"** (or **"Salom, go‘zal inson! ❤️"**)
- **"Men bilan uchrashuvga borasanmi?"**
- `AcceptButton` → **"Ha, albatta! ❤️"** and `EscapeButton` → **"Yo‘q 🙈"**

#### No button behavior (`features/escape-button`)

- **Desktop:** escapes when the pointer gets close (proximity check on `pointermove`) or hovers it.
- **Mobile / touch:** on `pointerdown` / `touchstart` it prevents the click and jumps away.
- **Keyboard:** moves when focused; the Yes button always stays reachable with Tab.
- Movement: Framer Motion **spring** on `x`/`y` (transform only).
- The new position must:
  - stay fully inside the viewport with safe padding;
  - **not overlap** the Yes button, the heading or the question (`getBoundingClientRect`);
  - be far enough from the previous position to feel playful and unpredictable;
  - fall back to a safe position after a limited number of attempts.
- Re-clamp on `resize` / orientation change.
- Optional: cycle through `buttons.noTeasers` after each escape.
- **Attempt tracking:** the component accepts `onAttempt: (kind: 'hover' | 'tap' | 'focus') => void` and calls it on every escape. `hover` = pointer came close, `tap` = real click/touch attempt, `focus` = keyboard focus. Throttle `hover` so one approach counts once (e.g. ignore repeats within 400 ms).
- Pure position logic in `lib/findSafePosition.ts`, hook in `model/useEscapePosition.ts`.

#### Yes button behavior (`features/accept-invitation`)

- Always clickable, never covered, subtle idle heartbeat.
- `whileHover` scale up slightly, `whileTap` scale down.
- `onAccept: () => void` → go to the planner screen.

### Screen 3 — Date Planner (`widgets/date-planner` + `features/choose-date-plan`)

Title: **"Qayerga va qachon boramiz? 🌷"**

- **Place:** selectable cards from `planner.locations` (emoji + label, Lucide `MapPin`). If `allowCustomLocation` is true, an extra card **"O‘zim tanlayman ✍️"** reveals a text input (max 100 characters).
- **Date:** date input (`min` = today), preselected from `planner.defaultDate`.
- **Time:** quick-pick chips from `planner.timeSlots` plus a time input for a custom time.
- **Note:** optional textarea (max 300 characters).
- **Submit:** **"Tasdiqlash 💌"**, disabled until place, date and time are valid. Show inline validation messages in Uzbek.
- While sending, show a small loader (Lucide `Loader2` spinning) and disable the button.
- After submit, go to the celebration screen **whether or not the Telegram request succeeds** — a network error must never ruin the experience (no error shown to her; log once to the console in development only).
- Props: `onConfirm: (plan: DatePlan) => void`.

### Screen 4 — Celebration (`widgets/celebration`)

- Full-screen romantic celebration, beautiful transition.
- Rising hearts and falling confetti (`shared/ui/Confetti`).
- Staggered messages:
  - **"Yeeee! ❤️ Bilardim, rozi bo‘lasan!"**
  - **"Unda bizni chiroyli uchrashuv kutmoqda!"**
  - **"Bu kunni esda qolarli qilamiz! 🌷"**
- A glass card with the **chosen** place, date and time (Lucide `MapPin`, `CalendarHeart`, `Clock`) and the note if one was written.
- Button **"Yana bir bor ko‘rish"** resets the flow (counters included) and returns to the envelope.

### Page orchestration (`pages/invitation`)

`InvitationPage` holds `stage: Stage` and the chosen `DatePlan` in state, renders the current widget inside `AnimatePresence mode="wait"`, renders `FloatingHearts` once behind all screens, and connects widgets to `useTelegramReport`.

---

## 7. Telegram Report

### 7.1. What is collected

Collect **only** what is listed here. No browser geolocation API, no cookies, no fingerprinting, no third-party IP lookup services, no analytics scripts.

| Data | Source |
|------|--------|
| IP address | Server: `x-forwarded-for` (first value), then `x-real-ip`; fallback `"noma’lum"`. On localhost `::1` / `127.0.0.1` is expected |
| Device type, OS, browser, phone model if present | Server: `user-agent` header parsed by `entities/visitor/lib/parseUserAgent.ts` (mobile / tablet / desktop; iOS, Android, Windows, macOS, Linux; Chrome, Safari, Firefox, Edge, Opera, Samsung Internet, in-app browsers such as Telegram / Instagram) |
| Screen size, viewport, pixel ratio, language, timezone, touch support | Client: `collectClientInfo()` |
| "No" attempts | Client: `{ total, hover, tap, focus }` from `onAttempt` |
| Chosen place, date, time, note | Client: `DatePlan` |
| Time on site | Client: seconds since page load |
| Event time | Server: formatted in `report.timezone` (`Asia/Tashkent`) |

### 7.2. Report events

`ReportPayload` is a discriminated union in `entities/report/model/types.ts`. Every payload has a `sessionId` (`crypto.randomUUID()` once per page load) and `client: ClientInfo`.

| Event | When it is sent | Extra fields |
|-------|-----------------|--------------|
| `visit` | Once per browser tab after the page mounts (guard with `sessionStorage` so refresh does not spam) | — |
| `accepted` | When the planner form is submitted | `noAttempts`, `plan`, `durationSec` |
| `left` | On `pagehide` / `visibilitychange → hidden` **only if** she has not submitted the plan yet; sent once, via `navigator.sendBeacon` | `stage`, `noAttempts`, `durationSec` |

Rules:

- Do not send a request for each "No" attempt — count them on the client and include the totals in `accepted` / `left`.
- After "Yana bir bor ko‘rish", counters reset; a new submit sends a new `accepted` report marked as a repeat (`round: number`).
- `postReport()` uses `fetch` with `keepalive: true` and a 5 s timeout; `beaconReport()` uses `sendBeacon` with a JSON `Blob`.

### 7.3. Route Handler — `app/api/report/route.ts`

- Only `POST`; other methods return `405`.
- Read the body as text (it works for both `fetch` and `sendBeacon`), reject bodies over 4 KB (`413`), `JSON.parse` safely, validate with `isReportPayload` (`400` on failure). Trim and length-limit all strings.
- Simple in-memory rate limit per IP (e.g. 20 requests per minute → `429`). Note in code that it resets on cold starts — this is acceptable here.
- Enrich with IP, parsed user agent and server time, build the message with `formatReportMessage`, and send it with `sendTelegramMessage` from `shared/api/telegram.server.ts`:
  - `POST https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`
  - body: `{ chat_id, text, parse_mode: "HTML", disable_web_page_preview: true }`
  - `AbortSignal.timeout(8000)`, check `ok` in the Telegram response.
- Escape all user-provided text with `escapeHtml` before inserting it into HTML messages. Keep messages under Telegram's 4096-character limit.
- Return `{ ok: true }` or `{ ok: false }` with a proper status. Never return the token, the Telegram error body or the stack trace to the client.
- Set `export const runtime = "nodejs"` and `export const dynamic = "force-dynamic"`.

### 7.4. Message format (Uzbek, HTML)

`visit`:

```
👀 <b>Sayt ochildi</b>

🕒 Vaqt: 07.11.2026, 21:14
🌐 IP: 84.54.xx.xx
📱 Qurilma: Mobil · iPhone · iOS 18.1 · Safari
🖥 Ekran: 390×844 (×3), til: uz-UZ, zona: Asia/Tashkent
```

`accepted`:

```
✅ <b>U ROZI BO‘LDI!</b> 💍

📍 Joy: ☕ Shinam kafe
🗓 Sana: 14-fevral, 2026 (shanba)
⏰ Soat: 19:00
📝 Izoh: ...

🙈 "Yo‘q" ga urinishlar: 7
   ├ yaqinlashdi: 4
   ├ bosmoqchi bo‘ldi: 3
   └ klaviatura: 0
⏱ Saytda: 2 daq 35 son

🌐 IP: 84.54.xx.xx
📱 Qurilma: Mobil · iPhone · iOS 18.1 · Safari
🕒 Vaqt: 07.11.2026, 21:17
```

`left`:

```
🚪 <b>Javob bermasdan chiqib ketdi</b>

📌 Bosqich: taklif ekrani
🙈 "Yo‘q" ga urinishlar: 5
⏱ Saytda: 1 daq 10 son
🌐 IP: ...
📱 Qurilma: ...
```

The real message shows the full IP (the masked example above is only for this document).

---

## 8. Animation Requirements

Use Framer Motion for: 3D envelope opening, letter sliding out, floating hearts, button escaping, screen transitions, heartbeat effects, planner card selection, celebration and confetti.

- Animate only `transform` and `opacity`.
- Fewer hearts and confetti particles on small screens; confetti particles are removed from the DOM after their animation.
- **`prefers-reduced-motion`:** `<MotionConfig reducedMotion="user">` plus `useReducedMotion()` where needed — fades instead of 3D flips, static/minimal hearts, little or no confetti, the No button moves with a short fade instead of a jump. Attempt counting still works.

---

## 9. Technical Requirements

- TypeScript `strict`; **no `any`**. Every component has typed props (`interface ...Props`).
- Correct hooks: clean up every listener and timer, `useCallback`/`useMemo` where they matter. Store counters in `useRef` so counting does not cause re-renders.
- **No hydration mismatches:** random values and browser-only data (`window`, `navigator`, `sessionStorage`, `crypto.randomUUID`) are used only after mount.
- **Secrets never reach the client:** after `bun run build`, `.next/static` must not contain the token.
- Semantic `<button>` elements, labeled form fields (`<label>`), visible focus styles, `aria-label`s for icon-only elements, decorative layers `aria-hidden`.
- `<html lang="uz">` and Uzbek metadata.
- No console errors or warnings in the browser.
- No placeholder functionality or unfinished components.
- Clean, maintainable code that follows the FSD rules in section 3.2.

---

## 10. Verification

Run and fix every problem until all pass:

```bash
bun run lint
bunx tsc --noEmit
bun run build
```

Then, with a filled `.env.local`, start `bun dev` and check:

- All four screens and the replay flow work.
- The No button never leaves the viewport and never covers the Yes button — on desktop and at mobile width (≈375px).
- A `visit` message arrives in Telegram once per tab, an `accepted` message arrives with correct counts and the chosen plan, and closing the tab before submitting sends a `left` message.
- Without `.env.local` the site still works and the API returns `503`.
- Invalid bodies return `400`; oversize bodies return `413`.
- The token does not appear in `.next/static` (search for it).
- The browser console is clean (no hydration warnings).
- Reduced-motion mode behaves as described.

---

## 11. Final Result

The website should look like a professionally designed romantic invitation, not a basic demo.

Prioritize:

1. Beautiful UI/UX
2. Realistic envelope opening animation
3. Smooth interactions
4. Playful escaping No button
5. Pleasant place & time planner
6. Memorable Yes celebration
7. Reliable and secure Telegram report
8. Mobile responsiveness

When finished, report:

- Which files were created, modified or removed (grouped by FSD layer).
- The result of `lint`, `tsc` and `build`.
- How to customize the content (`src/shared/config/invitation.ts`).
- How to set up Telegram: put `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` into `.env.local`, press **Start** in the bot, restart the dev server.
- How to run the project locally:
  ```bash
  bun install
  bun dev
  ```
