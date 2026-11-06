# Sevgilim, meni tanla 💌

A small romantic date-invitation site in Uzbek: envelope → invitation (with a
"No" button that runs away) → date planner → celebration. The owner gets a
Telegram message when she visits, answers, or leaves.

Full spec: [`docs/index.md`](docs/index.md).

## Run locally

```bash
bun install
bun dev        # http://localhost:3000
```

Checks: `bun run lint`, `bunx tsc --noEmit`, `bun run build`.

## Change the content

All text, her name, places, default date/time and time slots live in
[`src/shared/config/invitation.ts`](src/shared/config/invitation.ts).
Set `girlName` to `""` to greet her as "go‘zal inson".

## Telegram reports

1. Copy `.env.example` to `.env.local` and fill in `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID`.
2. Open the bot in Telegram and press **Start** once, or it cannot message you.
3. Restart `bun dev`.

Without these values the site still works; `/api/report` just answers `503`.
The token stays on the server and never reaches the browser.
