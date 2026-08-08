# The Primary — 2016 GOP (v1 play layer)

> **Two tracks:** this folder (`game/`) is the **active v1 play layer**, wrapping the **frozen** validated engine in `../model/`. The parked older "Election 2024" prototype is `../prototype-2024.html` + `../scripts/` + `../styles/` — **visual reference only**. The root `README.md` documents this game, not the prototype. See `../PROJECT_STATUS.md`.

Play the 2016 Republican primary as any candidate in the field, making two real decisions per turn against a historically calibrated engine.

**Scope: the 2016 Republican primary only** — not a general election, not a two-party simulator, not the Democratic side. It runs to the nomination and stops. A Democratic primary is banked to v2 in `../FUTURE_FEATURES.md`.

## Run it

```bash
npm install          # first time only
npm run build        # bundles src/ + frozen model/ into dist/app.js
```

Then double-click `index.html` — **no server needed.** The bundle is a plain IIFE and every asset path is relative, so it runs straight from a `file://` origin (confirmed in a full keyed playtest, 2026-08-07). Double-clicking `../index.html` at the repo root lands here too.

Append `?seed=NNNNNNNN` to the URL to lock the seed for repeatable playtests — a dev badge appears when you do.

First launch opens a **Quick Start** overlay covering what you control; re-open it any time from **? HOW TO PLAY** in the header.

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

<!-- DRAFT COPY (Slice 4, 2026-08-08) — structure locked, wording replaceable; see SLICE4_QUICKSTART.md "Copy status" -->
## How the simulation works

*For readers who want to understand the system before playing. Nothing here is needed to play — the in-game Quick Start covers what you control, and the broadcast voices narrate the rest as it happens. This is the deeper tour.*

**The race is a simulation, not a script.** Every game runs on a seeded random-number generator: a fresh seed each game, so no two races repeat — but the same seed always produces exactly the same race. That determinism is not a limitation, it's the foundation: it is what lets the game *prove* your effect (below) instead of asserting it.

**Delegates are won under the 2016 rules.** Each state awards its delegates in real calendar order under its real allocation style — winner-take-all, proportional, or hybrid — with a viability threshold that cuts off also-rans. The threshold matters more than it looks: in a crowded field, most candidates spend most of the season below it. Watching who clears it, where, is half the race.

**Momentum is real, and it compounds.** Wins feed momentum; upsets pay far more than expected wins; and front-runners bleed it just by being front-runners. The engine's momentum dynamics are the reason a race can swing hard and then swing back — and the reason the leaderboard on a given Tuesday is not the whole story. How exactly it behaves is best discovered by playing; watch what the commentator notices when a challenger starts closing on the leader.

**Your effect is measured, not estimated.** Every turn, after the real contests resolve, the game silently re-runs the same contests through the same engine with your moves removed — same seed, same dice — and diffs the two. The gold readout is that diff. Two properties are machine-gated: doing nothing measures exactly zero, and the measurement never disturbs the live game.

**The voices are constrained.** All three broadcast voices read a single shared fact sheet built from live game state plus those measured effects. They cannot cite a number the game didn't produce — no path exists for one to reach them — and their prompts are machine-checked to forbid inventing the things this game doesn't model: money, fundraising, ads, endorsements, debates, scandals. The advisor is written to be the loyal inside read; the commentator is usually sharper but not an oracle — each turn he is deterministically set to a *measured* or *bold* stance, and learning when to trust him is part of the game.

**What's deterministic:** given a seed, everything — contest results, momentum, the commentator's stance — except the AI voices' wording, which is generated fresh each time from those fixed facts.

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
