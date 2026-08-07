# The Primary — 2016 GOP

Play the 2016 Republican presidential primary as any candidate in the field. Two real decisions a turn, resolved by a historically calibrated engine, with a three-voice broadcast booth calling the race. Clinch 1,237 delegates or lead when the calendar runs out.

## How to play

**Build once, then double-click `index.html`.**

```bash
cd game
npm install     # first time only
npm run build   # bundles the play layer + frozen engine into game/dist/app.js
```

Then double-click `index.html` in this folder. No server, no install beyond that one build step — it runs straight from the filesystem in any modern browser (Chrome, Firefox, Edge, Safari).

> `index.html` at the root is a launcher that opens the real game at `game/index.html`. You can open `game/index.html` directly instead; both work the same way.

**Blank page?** The build step hasn't run. Do the three lines above.

Each turn you get one calendar date and two levers: **where to campaign** (allocate 3 effort points across the states voting that day) and **what to emphasize** (lean into one issue axis, or none). After the contests resolve, a gold readout shows the *measured* effect of your choices — the same contests re-run through the real engine with you doing nothing, so the difference is genuinely attributable to you rather than asserted.

Full details, per-turn mechanics, and the gate suite: **[`game/README.md`](game/README.md)**.

## The broadcast (optional AI feature)

Three voices call the race — a play-by-play announcer, your campaign advisor, and an outside TV commentator who is on nobody's payroll. They read identical facts and differ only in vantage. They are **off by default**; the game is fully playable without them.

Turning them on needs an Anthropic API key, stored in your browser's `localStorage`.

> ⚠️ **A keyed build is for local, personal use only — do not distribute one.** A browser-direct API key is fine when the only person using the page is the person who owns the key. It is **not** safe for public or commercial release: anyone with the page can read the key out of `localStorage`, and the calls are unmetered and unauthenticated. A public build needs a server-side proxy that holds the key and rate-limits per user. See `game/README.md` for the full note (Gate B).

## Sharing

Zip this folder and send it, or host it on any static file server (GitHub Pages works). No backend. Run `npm run build` first so `game/dist/app.js` is present, and **ship it unkeyed** — see the warning above.

## What's in this folder

| Path | What it is |
|---|---|
| `index.html` | Launcher — opens the v1 game |
| `game/` | **The active v1 game** — play layer, broadcast, gates, its own README |
| `model/` | The **frozen** validated 2016 engine. Read, never written. |
| `prototype-2024.html`, `scripts/`, `styles/` | Parked "Election 2024" prototype — **visual reference only, not the current game** |
| `PROJECT_STATUS.md` | Build status, acceptance gates, what's shipped |
| `FUTURE_FEATURES.md` | Post-v1 backlog, under a v1-ships-first rule |

### The parked 2024 prototype

`prototype-2024.html` is an earlier, separate game — a full 2024 cycle with primaries, conventions, and a general election. Its engine is **not** used by the current game and it is not maintained. It is kept because its newsroom styling is the visual reference for v1. It was the root `index.html` until 2026-08-07; it was renamed so that double-clicking the obvious file starts the current game instead of the old one.
