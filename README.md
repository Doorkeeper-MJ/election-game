# The Primary — 2016 GOP

A turn-based simulation of the 2016 Republican presidential primary, wrapped around a frozen, historically calibrated delegate engine, with a three-voice AI broadcast booth that is structurally prevented from inventing numbers.

**Scope, stated up front: this is the 2016 Republican primary only.** Not a general election, not a two-party simulator, and not the Democratic side. It runs from the first contest to the nomination and stops there. *(A Democratic primary is banked to v2 — proportional allocation and superdelegates are a second rules engine, not a reskin. A parked 2024 two-party general-election prototype also lives in this repo; see the layout table.)*

## Play it

1. Download the ZIP (green **Code** button → **Download ZIP**)
2. **Extract the ZIP — don't open it from inside the archive**
3. Double-click `index.html`

No install, no build, no server. It runs in your browser.

Each turn: one calendar date, three effort points to allocate, one optional issue axis. Clinch 1,237 delegates or lead when the calendar runs out.

### The broadcast is optional

The game is fully playable with the AI voices off, which is the default. Enabling them requires your own Anthropic API key, held in browser `localStorage`, and **it bills your account.**

> ⚠️ **A keyed build is for local personal use only.** A browser-direct API key is acceptable when the only person loading the page is the person who owns the key. It is not safe for public or commercial distribution: the key is readable out of `localStorage`, and calls are unmetered and unauthenticated. A public deployment needs a server-side proxy holding the key with per-user rate limiting — a backend, and a different project. **Distribute unkeyed.**

---

## Why this repository is interesting

Most of the engineering here is about **containment** — keeping a validated simulation validated while adding a play layer and a generative-AI layer on top of it. Three constraints drove the design:

1. The engine's historical calibration must survive every feature added above it.
2. The player must be able to *see* that their decisions mattered, measurably, not be told so.
3. Language models writing about a simulation must not be able to assert facts the simulation never produced.

Each is enforced by a machine check that fails the build, not by a convention or a comment.

---

## Architecture

### The frozen engine

`model/` holds the validated 2016 GOP engine — delegate award rules, the contest calendar, momentum dynamics, and a seeded PRNG. **It is read and never written.** The play layer in `game/` wraps it; no play-layer feature is permitted to reach into it. Tuning that the play layer needs lives in a separate `game/src/config-play.js`, deliberately disjoint from `model/config.js`, so there is no path by which "just nudge a knob to make this work" quietly invalidates the calibration.

The bundler enforces the same boundary physically: esbuild reads `model/` and emits `game/dist/app.js`. It has no write path back.

### Determinism as a testable property

The engine is seeded. That makes the calibration *checkable*, and the project spends that check aggressively:

- **Digit-for-digit identity.** A full playthrough in which the player does nothing must produce byte-identical results to calling the engine's own `runPrimary` on the same seed. At seed `20160201`: Trump 1327 / Cruz 978 / Carson 150 / Rubio 16, everyone else zero. Any drift fails the gate.
- **PRNG copy-identity.** The play layer extracts the canonical `mulberry32` implementation from the frozen `model/` *source at test time* and asserts byte-identical output across 8,000 draws (4 seeds × 2000). A copied-and-subtly-edited RNG is the kind of bug that produces plausible wrong numbers forever; this makes it impossible to land.
- **Three written invariants**, each machine- or comment-enforced: one RNG instance per game threaded through every call and never re-seeded mid-game; the copy-identity check above; and contest resolution strictly in calendar array order, with date grouping treated as display only.

### Legibility: proving the player's effect rather than asserting it

Each turn offers two levers — allocate three effort points across the states voting that day, and optionally lean into one issue axis. After contests resolve, the game reports the *measured* effect of those choices.

It is measured by re-running the same contests through the real engine with the player's inputs removed and diffing. Two properties are gated: a zero-move turn must produce exactly zero effect, and running the counterfactual must never perturb the live game state. So the readout — *"your push in Texas: Cruz +8, Trump −8"* — is an observation, not an estimate.

The same counterfactual deltas are handed to the broadcast layer, which is what makes the next section possible.

### The three-voice broadcast, and why it cannot fabricate

Three AI voices call the race: a play-by-play announcer, the player's own campaign advisor, and an outside TV commentator on nobody's payroll.

**All three read one shared factual context object** (`game/src/broadcast/context.js`), assembled from live game state plus the legibility counterfactuals. The voices differ in vantage, temperament, and what they are asked to notice — they do not differ in what they know. A voice cannot cite a number the game did not produce, because **no path exists by which a number reaches a prompt except through that one object.** This is a structural property, not a prompt instruction: there is nothing to disobey.

Prompt-level discipline is enforced separately and adversarially. A gate asserts that all three system prompts carry the no-fabrication rule *and* explicitly forbid the systems this game does not model — money, fundraising, ad spending, endorsements, debates, scandals. Nothing but that check stops a model from inventing a campaign budget, so it is a gate rather than a comment.

The advisor is *designed* to be conventional and to carry an insider blind spot; the outside commentator is usually sharper but is not an oracle. A per-turn `vantage` flag puts the commentator in `measured` or `bold` mode — same facts, different projection distance — as a deterministic function of `(seed, turn)`, so a re-render can never re-roll it. Deciding which voice to trust on a given turn is intended to be a real skill.

### Per-model token budgeting

Voices are assigned to models by what each voice is *for*:

| Voice | Model | Cadence | Why |
|---|---|---|---|
| Play-by-play announcer | `claude-sonnet-4-6` | automatic, every result | fires 20+ times a season; speed and cost dominate |
| Campaign advisor | `claude-sonnet-4-6` | on demand | deliberately conventional — paying frontier rates for the voice that is *supposed* to be predictable buys nothing |
| TV commentator | `claude-opus-5` | on demand | the one voice whose entire value is depth of insight |

**The finding worth reading:** `max_tokens` is not a word budget — it is model-dependent, and treating it as a word budget produces a bug that looks like a prompt problem.

The commentator was truncating mid-sentence at roughly 130 words against a 400-token ceiling. Three successive prompt-side fixes failed, and could only have failed: `claude-opus-5` runs adaptive thinking on by default — a breaking change from Opus 4.8, where omitting the `thinking` field meant no thinking — and `max_tokens` caps **thinking plus visible output together**. Most of the budget was being spent before a word was emitted, and *a model cannot see its own budget*, so no instruction about length could have helped.

Fixes: the ceiling moved 400 → 1500; a visible **CUT OFF** marker was added so a clipped voice can never render as a finished call; and `usage.output_tokens` now appears in the console warning so the next occurrence reports its own numbers. A gate drives the real client and panel with `fetch` stubbed and asserts both directions — clipped output gets marked, complete output stays clean — and it was verified by deliberately breaking the marker and confirming a non-zero exit.

The standing rule now lives in the `VOICES` table: **changing a voice's model requires revisiting its `max_tokens` in the same edit.** The announcer's ceiling of 200 is safe *only* because Sonnet 4.6 does no thinking there.

### The gates

Four suites, all re-runnable, all exiting non-zero on drift. `npm run gate:all`.

| Gate | Asserts |
|---|---|
| **A — engine identity** | digit-for-digit no-move equivalence; PRNG copy-identity over 8,000 draws |
| **makeRng** | snapshot/restore fidelity |
| **Legibility** | zero move ⇒ zero effect; the counterfactual never perturbs live state |
| **Broadcast** | context fidelity (delegates, standings, clinch, calendar sums, season totals each recomputed independently); effect passthrough; vantage determinism; prompt guardrails; truncation surfacing |

Balance decisions are made by sweep, not by single playthrough — an early single-seed test read as "the lever is too weak" and a 200-seed sweep showed the opposite. Current four-way: hands-off 18% · emphasis only 25.5% · effort only 36% · both 41%, with the historical favorite still favored. The lever was left unchanged as a result.

### Distribution

`npm run build` bundles the play layer and the frozen engine into a single plain IIFE. No ES modules, no fetched local assets, every path relative — so `index.html` opens directly from the filesystem in any modern browser. Verified end-to-end from a `file://` origin, including a full 22-turn keyed season, not inferred from path analysis.

`game/dist/app.js` is committed deliberately, against the usual convention, because the distribution promise is unzip → double-click → play and a build step at the far end would break it. The `.gitignore` says so explicitly so nobody "fixes" it later.

---

## For developers

The repo ships the prebuilt bundle (`game/dist/app.js`) — playing needs no tooling. To rebuild after changing `game/src/` or `model/`:

```bash
cd game
npm install     # first time only
npm run build   # bundles play layer + frozen engine into game/dist/app.js
```

A blank page means the bundle is missing or stale — rebuild. Full developer detail, gates, and the `?seed=` lock: [`game/README.md`](game/README.md).

---

## Known limitations

Real ones, reproduced and characterized rather than suspected. All are banked rather than fixed because each would invalidate the Gate A baselines and the 200-seed sweeps — the v1 rule is that shipping comes before improving.

**Momentum runaway.** At the current momentum constants, the delegate leader's raw score can go *negative* and be floored to a minimum, rendering him non-viable in a contest he leads by roughly 200 delegates. Reproduced at seed `20160201`, 2016-03-08: the challenger took 150 of 150 delegates across four states. A partial brake exists and was observed working in play — once the challenger passes the leader, the leader-bleed term starts working against *him* instead — but the un-braked half is real and unfixed.

**No dropout logic.** All nine candidates remain in the field the entire season, diluting the viability denominator in every contest. Historically the field collapsed; here it doesn't.

**AI opponents don't respond to the player.** Opponent behavior is not adaptive. Making it adaptive breaks determinism, which breaks Gate A *and* the legibility counterfactual — so it is sequel territory, not a patch.

**No events system.** v1 has no shock/event mechanic. Two of the five planned sound tiers depend on one and are parked with it.

Full backlog and reasoning: [`FUTURE_FEATURES.md`](FUTURE_FEATURES.md). Build history, gate details, and acceptance records: [`PROJECT_STATUS.md`](PROJECT_STATUS.md).

---

## Repository layout

| Path | What it is |
|---|---|
| `index.html` | Launcher — redirects to the game. A launcher, not a copy, so the two cannot drift. |
| `game/` | The active v1 game — play layer, levers, broadcast, gates, its own README |
| `model/` | The **frozen** validated 2016 engine. Read, never written. |
| `PROJECT_STATUS.md` | Build status, acceptance gates, session handoff |
| `FUTURE_FEATURES.md` | Post-v1 backlog under a v1-ships-first rule |
| `prototype-2024.html`, `scripts/`, `styles/` | A parked earlier 2024-cycle prototype. Visual reference only — its engine is not used and not maintained. |

---

## About the depiction

This is a statistical simulation of a historical public election. Candidates are real public figures who sought public office in 2016, and contest outcomes derive from the historical calendar and delegate rules.

The optional broadcast voices are **generated by language models at runtime**. Their output is commentary on simulated results — not fact, not reporting, and not statements by or about any real person's actual conduct. The models are constrained to the simulation's own numbers and are explicitly barred from inventing fundraising, endorsements, debates, or scandals, but generated text is generated text and should be read as such.

Not affiliated with, endorsed by, or representing any candidate, campaign, party, or news organization.
