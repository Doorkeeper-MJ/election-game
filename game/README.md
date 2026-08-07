# The Primary — 2016 GOP (v1 play layer)

> **Two tracks:** this folder (`game/`) is the **active v1 play layer**, wrapping the **frozen** validated engine in `../model/`. The root `README.md` and `scripts/` belong to the older "Election 2024" prototype, which is **parked (visual reference only)**. See `../PROJECT_STATUS.md`.

Play the 2016 Republican primary as any candidate in the field, making two real decisions per turn against a historically calibrated engine.

## Run it

```bash
npm install          # first time only
npm run build        # bundles src/ + frozen model/ into dist/app.js
```

Then double-click `index.html` — **no server needed.** The bundle is a plain IIFE and every asset path is relative, so it runs straight from a `file://` origin (confirmed in a full keyed playtest, 2026-08-07). Double-clicking `../index.html` at the repo root lands here too.

Append `?seed=NNNNNNNN` to the URL to lock the seed for repeatable playtests — a dev badge appears when you do.

## Each turn

1. **Where to campaign** — allocate 3 effort points across the states voting that turn.
2. **What to emphasize** — lean into one issue axis, or none.
3. **Run the contest(s)** — and read the gold readout: the *measured* effect of your moves, from a real-engine counterfactual (the same contest re-run with you doing nothing).

Clinch 1,237 delegates or lead when the calendar runs out.

## The broadcast (optional AI feature)

Three voices call the race. They are **off by default** — the game is fully playable without them.

| Voice | Model | When | What it is |
|---|---|---|---|
| **Play-by-play** | `claude-sonnet-4-6` | automatically, every result | the live call, present tense |
| **Campaign advisor** | `claude-sonnet-4-6` | on demand | your strategist, inside the room — invested and conventional |
| **TV commentator** | `claude-opus-5` | on demand | an outside analyst on no one's payroll — usually the sharper read |

The advisor and the commentator see **exactly the same facts** and disagree only in vantage and emphasis. Neither one lies to you. Part of playing well is learning which one to trust on a given turn — the outsider is usually sharper, but he is outside the room, and roughly one turn in three he commits to a forward call the data allows but does not guarantee.

No voice can invent anything: all three read one shared context object built from live game state and the counterfactual effect data, and `npm run gate:broadcast` machine-checks that their prompts forbid fabricating the systems this game doesn't model (money, fundraising, ads, endorsements, debates, scandals).

### API key

To turn the broadcast on, click **Add key** in the broadcast panel and paste an Anthropic API key (`sk-ant-...`). It is stored in this browser's `localStorage` and sent only to `api.anthropic.com`.

> ⚠️ **Not ship-safe for public release (Gate B).** A browser-direct API key is fine for a local, single-player tool used by the person who owns the key. It is **not** acceptable for a public or commercial build: anyone with the page can read the key out of localStorage, and calls are unmetered and unauthenticated. Shipping this publicly requires a server-side proxy that holds the key and rate-limits per user. Do not distribute a keyed build.

## Gates

```bash
npm run gate            # Gate A — digit-for-digit engine identity
npm run gate:broadcast  # Gate C — broadcast context fidelity + prompt guardrails
npm run gate:all        # all four gates
```

- **Gate A** — a no-move playthrough must equal `runPrimary` exactly at the same seed, and the play-layer RNG must be byte-identical to the frozen canonical one.
- **makeRng** — snapshot/restore fidelity for the legibility counterfactual.
- **Legibility** — a zero-move season must show exactly zero measured effect, the counterfactual must never perturb the real game, and both levers must be visible in the readout.
- **Broadcast** — context numbers must trace to live state, Slice 2 effect data must pass through unaltered, the commentator's `vantage` must be deterministic, and all three prompts must carry the no-fabrication rule.

**The engine is frozen.** `../model/` is read, never written. Play-layer tuning lives in `src/config-play.js`; the validated engine knobs in `../model/config.js` are not touched.
