# PROJECT STATUS — Election 2024 game

> **⚠️ TWO TRACKS — read first.** This doc began as the status for the **OLD "Election 2024" prototype** (`scripts/`). Everything in the historical sections below — "v1 COMPLETE — 2026-05-22," Step 15.7, the Done list, the Ship checklist — refers to **that prototype**, now **PARKED (visual reference only)**. The **active project** is the **v1 play layer** (`game/` + frozen `model/`, 2016 GOP) — see the "PLAY LAYER — v1 Slice 1" section. Where the old sections say "v1," they mean the *prototype's* v1, not the active one. The two known prototype issues (left-column party mixing, DeSantis-wins-too-often) are parked in `FUTURE_FEATURES.md` → "Old 2024 Prototype" and are **NOT active v1 work**. For where the active project actually stands, read the **SESSION HANDOFF** block immediately below.

**v1 COMPLETE — 2026-05-22.** All 14 core steps + 6 of 7 polish items shipped. 15.6 (VP pick) deferred to v1.1 → see `FUTURE_FEATURES.md`. Game is end-to-end playable and balance-tuned. Remaining work is shipping-mechanics only (browser smoke-test, README, distribution), not new features.

> **▶ DESIGN VISION — read before any play-layer build.** The play-layer vision lives in the vault note **`Election Game — Design Vision`** (`C:\Obsidian\MJ Life Hub\06 - Leisure\Election Game\Election Game — Design Vision.md` — path corrected 2026-07-25 after the July 23 vault cleanup moved it out of the vault root). **NOTE: `Election Game — v2 Vision` (same folder) is the GOVERNING vision note**; this Design Vision is the v1-scope record — read it for v1 pillars, but v2 Vision governs direction. It defines the four pillars — what-if engine, new-game setup page, real turns, and per-candidate AI Campaign Advisor — that sit *on top of* the validated engine. This `PROJECT_STATUS` covers the shipped engine/physics; the Design Vision covers the game/play layer that comes next. Do not start a play-layer feature without reading it.

---

# ▶ SESSION HANDOFF — 2026-08-08 (session close)

**Fresh session: start here.** Everything below this block is build history. This block is the live state.

## Closed today (2026-08-08)

- **Quick Start modal BUILT** — the highest-impact piece of Slice 4. New `game/src/ui/quickStart.js` (overlay, five panels: THE RACE / THE TURN / YOUR LEVERS / THE GOLD READOUT / THE BROADCAST), wired into `main.js` boot; `.qs-*` styles in `newsroom.css`. Auto-opens on first launch (`localStorage` flag `egv1.quickstart_seen`, set on dismiss), re-openable from a **? HOW TO PLAY** header button. Verified live in a browser: first-launch auto-open, dismiss, no-reopen after reload, header-button re-open, Escape close, game unbroken, zero console errors. **All copy is DRAFT** — structure locked, wording replaceable; final copy is a separate pass.
- **Slice 4 spec written** — `game/SLICE4_QUICKSTART.md`. Carries the **governing principle (set by MJ 2026-08-08): the modal covers what a player must know before turn one; the broadcast voices cover everything learned after; deeper system logic lives in the README, not the UI.** The modal states what the player controls, never what the game does in reply — momentum and system responses are deliberately excluded. Also records: gold-readout panel included (the `(16 vs 14)` counterfactual reading is not discoverable unaided), levers kept to one panel, and the pattern note that `candidateSelect.js` is an inline panel — the play layer had no existing overlay, so the overlay was built new in the shared visual language.
- **README "How the simulation works" section added** (`game/README.md`) — the destination of the modal's footer link. Anticipation-building, not spoiler: determinism, 2016 allocation rules, momentum (behavior gestured at, constants withheld), the measured counterfactual, voice constraints. Flagged DRAFT alongside the modal copy.
- **Democratic-primary v2 seed — already logged, verified, not duplicated.** `FUTURE_FEATURES.md` already carries the 2026-08-08 section with the "second rules engine, not a reskin" reasoning (proportional + 15% threshold + CD splits; superdelegates outside the contest loop).

## Closed 2026-08-07

- **SLICE 3 ACCEPTED** — MJ's keyed 22-turn playtest, played as Ted Cruz from `file://`. **Cruz won the nomination.** All three broadcast voices held character across the full run; the two-paragraph commentator constraint did not flatten the voice; **zero CUT OFF markers** (the commentator's `max_tokens: 1500` holds). Character review of `game/src/broadcast/prompts.js` is **closed — no further changes**. Details in the SLICE 3 ACCEPTED section below.
- **Root entry point repointed.** Root `index.html` used to load the parked 2024 prototype, so unzip-and-double-click started the *wrong game*. The prototype page is now **`prototype-2024.html`** (same directory, all 28 asset paths still resolve) and root `index.html` is a **launcher** that redirects to `game/index.html`, with a fallback link, a build-step hint, and a labeled link to the prototype. Deliberately a launcher, **not** a copy of the game page — one canonical HTML, no drift. Both READMEs rewritten to match. **VERIFIED LIVE 2026-08-07 (MJ):** double-clicked from the filesystem, the meta-refresh fired, and it landed on the 2016 GOP candidate picker. Confirmed in a real browser, not by path analysis.
- **Version control live.** `git init` → **3 commits** → pushed to the **private** repo `Doorkeeper-MJ/election-game` (`main`). Local and remote HEAD verified identical at `43de932`. **Repo visibility CONFIRMED on github.com 2026-08-07 (MJ):** Private badge beside the repo name, lock icon in the breadcrumb. Secret scan before the first commit: **clean** — no key, token, or credential anywhere, `.claude/settings.local.json` and `node_modules/` excluded, **`game/dist/app.js` committed on purpose** (the distribution promise needs the prebuilt bundle in the repo — `.gitignore` says so in a "do not clean this up" block).
- **Repo hygiene.** `.gitattributes` pins `* text=auto eol=lf` so checkouts are byte-identical across machines. `model_backup_2026-06-09.zip` deleted — git versions `model/` now; recoverable via `git show 5a7af37:model_backup_2026-06-09.zip`.

## What remains on v1 — three items

1. **Slice 4** — tooltips + menu/visual polish. *(Quick Start modal ✅ built 2026-08-08 — copy still DRAFT; see `game/SLICE4_QUICKSTART.md`.)*
2. **Sound** — Tiers 1/2/5 + Poll-Close Drumroll per `game/SOUND_SPEC.md`. Tiers 3–4 are parked to v2 (no events system exists in v1); the ship checklist must confirm **no Tier 4 path exists**.
3. **Ship mechanics** — browser smoke-test + distribution.

## ▶ THE SINGLE NEXT ACTION

**Slice 4, next piece: static "?" tooltips per panel** (DoD item 4 — static help only, no Tutorial Mode). The Slice 4 spec's governing principle applies: tooltips explain what's on screen, never the engine's reply — see `game/SLICE4_QUICKSTART.md` before starting. The gold readout's tooltip can stay light: the modal now carries the counterfactual explanation.

Separate small item, schedulable anytime: **final copy pass** over the Quick Start modal (`game/src/ui/quickStart.js`) and the README "How the simulation works" section — both flagged DRAFT in place.

- **After building:** `cd game && npm run build`, then `npm run gate:all` (all four must stay green), then commit — including the rebuilt `game/dist/app.js`. `?seed=NNNNNNNN` on the URL locks the seed for repeatable checks.

## Things a fresh session would otherwise rediscover the hard way

- **`max_tokens` is not a word budget — it depends on the MODEL.** `claude-opus-5` runs **adaptive thinking on by default** (a breaking change from Opus 4.8, where omitting the `thinking` field meant no thinking), and `max_tokens` caps **thinking + visible text together**. This is what truncated the commentator at ~130 words against a 400 ceiling on 2026-08-06 — and why three prompt-side fixes could not work: a model cannot see its own budget. **Changing any voice's model requires revisiting its `max_tokens` in the same edit.** The `VOICES` table in `game/src/broadcast/client.js` carries this rule; the announcer's 200 is safe *only* because Sonnet 4.6 does no thinking there. Gate C PART 5 now machine-checks that a clipped voice can never render as a finished call.
- **`file://` play is CONFIRMED** for the keyed build — verified in the Aug 7 playtest. The earlier worry that a `null` origin would be CORS-rejected, or that `localStorage` wouldn't hold the key across a double-click launch, did not materialize. Do not re-add a "serve the folder" instruction; the only prerequisite is that `npm run build` has run once.
- **`model/` is FROZEN.** Read by the play layer, never written. Play-layer tuning lives in `game/src/config-play.js`.
- **V2 SEEDS BANKED 2026-08-07** in `FUTURE_FEATURES.md` — momentum runaway (the delegate leader's raw score can go negative and be floored to 0.1, making him non-viable in a contest he leads by ~200 delegates; observed at seed 20160201, 2016-03-08, Cruz taking 150 of 150 across four states), no dropout logic (all nine candidates dilute the viability denominator all season), and AI candidates that respond to the player (cross-referenced to the July 27 AI-opponents seed, not duplicated). Also added: the **events system** as its own entry — it does not exist in v1, the prototype implementation is at `scripts/data/eventsDeck.js` + `scripts/engine/events.js`, and Sound Tiers 3/4 depend on it. **None of it is v1** — all of it invalidates Gate A baselines and the 200-seed sweep, which is exactly why it is banked rather than built.
- **Git conventions here:** branch is `main`, identity is set **repo-local** (`Michael A. Jones`, GitHub noreply email — switched off the Remark domain 2026-08-08 ahead of taking the repo public), remote is `origin` → `Doorkeeper-MJ/election-game`. Credentials are stored by Git Credential Manager, so pushes no longer prompt. **Rebuild and commit `game/dist/app.js` alongside any change under `game/src/` or `model/`** — a source change without the rebuilt bundle silently ships a stale game.

---

## PLAY LAYER — v1 Slice 1 (`game/`) — COMPLETE 2026-06-09

A fresh play layer now lives in **`game/`**, built ALONGSIDE a **FROZEN `model/`** (the validated 2016 GOP engine). The play layer *wraps* `model/`; it never modifies it. None of this project's old `scripts/` "Election 2024" engine logic is reused — `scripts/` is **visual reference only**.

**Slice 1 scope (done):** candidate select → **one calendar DATE per turn** → **"where to campaign"** lever (bounded effort → transient polling bump on the player's candidate only) → resolution through the frozen engine (`awardDelegates` + `processContestMomentum`) → clinch (1237) / calendar-end → nominee declared → Play Again. v1 ends at the primary (no general election).

**Acceptance Gate A — PASS** (`npm run gate`; re-runnable, exits non-zero on any drift):
- **Digit-for-digit:** no-move playthrough == `runPrimary` single run, seed 20160201 — **Trump 1327 / Cruz 978 / Carson 150 / Rubio 16**, rest 0.
- **Copy-identity:** play-layer `mulberry32` byte-identical to the canonical one (sourced live from frozen `model/sim2016.js`) across **8,000 draws (4 seeds × 2000)**.

**Three written invariants (machine- or comment-enforced):**
1. **Single rng instance** — one `mulberry32(seed)` created once per game in `gameState.newGame`, threaded to every `awardDelegates` call; never re-seeded per turn/contest.
2. **Copy-identity machine-check** — the gate extracts the canonical `mulberry32` from frozen `model/sim2016.js` source and asserts byte-identical output.
3. **Calendar-order resolution** — contests resolve in `calendar2016` array order; date-grouping is display-only and never reorders resolution.

**Bridge (decision #4 = bundler over hand-rolled shim):** esbuild bundles `src/main.js` + the frozen `model/` into `dist/app.js`. esbuild **reads `model/`, never writes it** (all six `model/*.js` still dated 2026-06-09). Build: `npm run build`. Trade-off accepted: loses pure double-click-to-play; gains a bridge that never tempts a "just tweak `model/` so it loads" edit.

**Engine stays frozen.** Play-layer tuning lives in `game/src/config-play.js` (bounded magnitudes), entirely separate from `model/config.js` (validated knobs). v1 is all-additive.

**Models:** this build authored on **Opus 4.8** (Fable 5 suspended by US directive since June 12). ~~The in-game Campaign Advisor (Slice 3) will call **claude-sonnet-4-6**~~ — **SUPERSEDED 2026-07-25, see the Slice 3 split-model note below.** Key via localStorage like the old autopsy feature, no streaming in v1.

**Banked — Gate addition B (not yet relevant):** browser-direct API key in localStorage is fine for a local single-player tool but **NOT ship-safe** for public/commercial release (would need a proxy). Lands as a README note when the advisor ships in Slice 3.

**Playtest 1 + lever validation (2026-06-15):** Slice 1 played in-browser; full game completes cleanly. The "where to campaign" lever was investigated mechanism-first (`game/prove-mechanism.js`, `game/sweep-lever.js` — play-layer tooling, engine frozen, `config-play.js` unchanged on disk):
- A single-seed playtest (seed 20160201: Cruz +5) read as "too weak," but a 200-seed sweep shows focused-all-in Cruz **wins 31%** at the current magnitude (maxBump 12) vs 17.5% hands-off — inside the target "earned upset" band (25–33%), Trump still favored. The single seed misled (the project's own "sweep, don't guess" lesson). Distribution is a smooth band, no cliff; win rate saturates ~70% and *declines* past maxBump ~40 (Cruz becomes leader → `MOM_LEADER_BLEED` works against him).
- Mechanism note: an inferred "bump knocks minors below 15% viability → feeds Trump" was **DISPROVEN** by instrumentation — only Trump & Cruz are viable in a typical contest anyway; the bump cleanly transfers **Cruz +8 / Trump −8** per targeted state. The lever helps Cruz; single-seed swings are momentum dynamics (working as designed).
- **Decision: NO config change** — the lever is correctly tuned. `config-play.js` stays at 4 / 12.

**REQUIREMENT (Slice 2/3) — LEGIBILITY:** a single game must SHOW the player their effort working. Surface the per-turn effect of effort (e.g. *"Your push in Texas: Cruz +8, Trump −8"*) so even a losing seed feels like the choices mattered. This is the real fix for the "feels weak" perception — not magnitude. Pairs with the contest-results panel (Slice 2) and the advisor (Slice 3).

**SLICE 2 — COMPLETE 2026-07-18 (pending MJ's felt playtest).** Full build in one session per the staged plan (`game/SLICE2_LEGIBILITY.md`): real-engine counterfactual per contest (no-op invariant + Gate A non-perturbation, machine-gated in `game/verify-legibility.js`), per-turn legibility readout ("↳ your moves here: Cruz +2 (16 vs 14) · Trump −2", flip banner, net summary), and the **emphasis lever** (`game/src/levers/emphasisLever.js` — one axis per turn; strength ⇒ lean-in authenticity bump, weakness ⇒ shore-up shift toward mood; transient, bounded, mutation-safe, knobs in `config-play.js` at 2/2/2). 200-seed balance sweep (`game/sweep-emphasis.js`): hands-off 18% · emphasis-only 25.5% · effort-only 36% · both 41% — emphasis meaningful but secondary, stacking sub-additive, Trump still favored; NO config change, magnitude judgment to MJ's playtest. Browser smoke on seed 20160272: Iowa flips Cruz 16–14 with full readout. Engine frozen throughout; all gates green (`verify-gate.js`, `verify-makerng.js`, `verify-legibility.js`).

**SLICE 2 ACCEPTED — 2026-07-18, MJ felt-playtest on seed 20160272:** full season played; verdict "my decisions clearly affected the results on most turns." Final-turn exhibit: New Jersey — Cruz +21 (21 vs 0) — a losing seed showing real agency to the last day. Emphasis knobs stand at 2/2/2.

**SLICE 3 BUILT — 2026-07-25** (prompts reviewed and **ACCEPTED 2026-08-07** — see SLICE 3 ACCEPTED below). Pillar 4 shipped as a **three-voice broadcast**, not a single advisor. All three read one shared factual context (`game/src/broadcast/context.js`) built from live state + the Slice 2 `result.contests[].effect` counterfactuals; no voice can cite a number that isn't in it.

**SPLIT MODELS (supersedes the single claude-sonnet-4-6 advisor note above):**
| Voice | Model | Cadence | Role |
|---|---|---|---|
| Play-by-play announcer | `claude-sonnet-4-6` | auto, every result | present-tense call + tactical read baked in |
| Campaign advisor (inside) | `claude-sonnet-4-6` | on demand | loyal staffer, "we/our path"; competent, conventional, carries the insider blind spot **by design** |
| TV commentator (outside) | `claude-opus-5` | on demand | detached analyst; names the structural truth; **usually sharper, not an oracle** |

**Reasoning for the split:** Opus 5 is reserved for the one voice whose value IS depth of insight — the outsider who has to see the whole board and say the unwelcome thing. Sonnet carries the per-turn announcer (fires 20+ times a season; speed and cost matter) and the advisor (deliberately conventional — the reliable inside read the outsider usually beats). Paying Opus rates for the voice that is *supposed* to be conventional would buy nothing. `claude-opus-5` verified against Anthropic's models docs 2026-07-25: pinned dateless snapshot, no date suffix.

**The balance mechanic (why the player's judgment matters):** the commentator gets a per-turn `vantage` field — `measured` (stay tight to what the numbers support) or `bold` (commit to a forward call the data allows but doesn't guarantee). It is a deterministic function of (seed, turn) — ~1 turn in 3 is bold — so a re-render can never re-roll it. Same facts in both modes; only the projection distance changes. That is how an honest outsider overreaches, and it makes "which voice do I trust this turn?" a real skill.

**Acceptance Gate C — BROADCAST: PASS** (`npm run gate:broadcast`; full suite `npm run gate:all`): context fidelity (delegates/standings/clinch/calendar-sum/season totals recomputed independently), effect passthrough (Slice 2 deltas/flips identical into context), vantage determinism, and **prompt guardrails** — a machine check that all three system prompts carry the no-fabrication rule and explicitly forbid the systems this game does not model (money, fundraising, ad spending, endorsements, debates, scandals). Nothing stops a voice inventing a budget except that check, so it is a gate, not a comment.

**SLICE 3 ACCEPTED — 2026-08-07, MJ keyed playtest.** Full **22-turn season played as Ted Cruz**, keyed, launched from `file://` — **Cruz won the nomination.** Every open acceptance question answered in play:
- **Character held across the full run.** All three voices stayed in character start to finish. The two-paragraph commentator constraint (added 2026-08-06) did **not** flatten the voice.
- **Prompt character review CLOSED.** `game/src/broadcast/prompts.js` reviewed in full — **no further changes**. The strings stand as written.
- **No truncation.** Zero CUT OFF markers across the season; the commentator's `max_tokens: 1500` holds.
- **The race read as a race.** It went back and forth rather than running away, and the momentum **leader-swap brake was observed working in play** — the runaway self-corrects once the challenger passes the leader and `MOM_LEADER_BLEED` starts working against him instead of for him. The un-braked half of that dynamic is banked to v2 (`FUTURE_FEATURES.md` → V2 SEEDS 2026-08-07); v1 balance stands.

**`file://` play CONFIRMED for the keyed build.** The browser-direct API path works from a `file://` origin. The earlier concern — that a `null` origin might be CORS-rejected, or that `localStorage` wouldn't persist the key across a double-click launch — did not materialize. v1 keeps double-click-to-play *after* `npm run build`.

**BROADCAST TRUNCATION — found and fixed 2026-08-06 (the reason 1500 is the number).** The commentator was cutting off mid-sentence at ~130 words against a 400-token ceiling. Root cause was **not** the prompt: `claude-opus-5` runs **adaptive thinking on by default** — a breaking change from Opus 4.8, where omitting the `thinking` field meant no thinking — and `max_tokens` caps **thinking plus visible text together**. Most of the 400 was spent before a word was written, which is why three successive prompt-side fixes could not work: a model cannot see its own budget. Fixes shipped: commentator `max_tokens` **400 → 1500**; a visible **CUT OFF** marker so a clipped voice can never render as a finished call; `usage.output_tokens` reported in the console warning so the next one diagnoses itself. **Gate C gained PART 5 — TRUNCATION SURFACING** (`npm run gate:broadcast`), which drives the real client + panel with `fetch` stubbed and asserts both directions (clipped ⇒ marked, complete ⇒ clean); verified to fail on a deliberate regression. The `VOICES` table now carries the standing rule: **`max_tokens` is not a word budget — it depends on the MODEL**, and changing a voice's model requires revisiting its ceiling in the same edit. The announcer's 200 is safe *only* because Sonnet 4.6 does no thinking there.

**NEXT — v1 ship list, Slices 1–3 CLOSED:**
1. **Slice 4** — menu/visual polish + tooltips. *(Quick Start modal ✅ 2026-08-08, copy DRAFT.)*
2. **Sound** — Tiers 1/2/5 + Poll-Close Drumroll per `game/SOUND_SPEC.md` (Tiers 3–4 parked to v2; ship checklist must confirm **no Tier 4 path exists**).
3. **Gate addition B — ✅ SATISFIED.** Already written during the Slice 3 build; it is `game/README.md` § API key. Restated at the root README too (2026-08-07), since that is the file a distributor reads first: a browser-direct key is fine for a local single-player tool, **not ship-safe** for public or commercial release (key is readable out of `localStorage`; calls unmetered and unauthenticated; a public build needs a server-side proxy). **Ship unkeyed.**
4. **Root entry point — ✅ REPOINTED 2026-08-07.** Root `index.html` used to load the parked 2024 prototype, so unzipping and double-clicking the obvious file started the *wrong game*. Now: the old prototype page is renamed **`prototype-2024.html`** (same directory, so its `scripts/` + `styles/` paths still resolve), and root `index.html` is a **launcher** that redirects to `game/index.html`, with a visible fallback link, a build-step hint for the blank-page case, and a labeled link to the parked prototype. Deliberately a launcher and **not** a copy of the game page — one canonical HTML, no drift. Root `README.md` rewritten to lead with the v1 game; the prototype is documented as reference-only.
5. **Ship mechanics** — browser smoke-test, distribution. (READMEs ✅ done 2026-08-07.)

**`file://` DISTRIBUTION PROMISE — INTACT and LIVE-VERIFIED 2026-08-07.** Definition-of-Done item 2 (unzip → double-click → play) holds after the Slice 1 bundler decision, with one added step: `npm run build` must have run once so `game/dist/app.js` exists. Both entry points open from `file://` with no server — the bundle is a plain IIFE, nothing uses ESM or fetches local assets, and every path is relative. **MJ double-clicked the root `index.html` and reached the candidate picker**, so this is confirmed end-to-end in a browser rather than inferred from path resolution. The keyed 22-turn Slice 3 playtest also ran entirely from `file://`, which separately confirms the browser-direct API path works from a `null` origin.

Session-start chore ✅ DONE 2026-07-25: esbuild installed locally (`node_modules/.bin/esbuild` 0.21.5); `npm run build` no longer needs npx.

**V2 SEEDS BANKED — 2026-07-27 (MJ playtest burst):** four ideas captured to `FUTURE_FEATURES.md` under the v1-ships-first rule — AI opponents (sequel territory: breaks determinism, hence breaks Gate A + the legibility counterfactual), spoken broadcast booth (cross-links the vault's Voice-as-Medium seed, which currently *excludes* this game — exclusion must be consciously lifted if ever built), era-appropriate anchor personas (**guardrail: original invented personas only, no real named broadcasters**), and convention/crowd ambient audio (cheapest of the four — pure audio files, no AI, no per-play cost; still held off v1 to hold scope). **None of it is v1.** v1 sound remains Tiers 1/2/5 + Poll-Close Drumroll.

**v1 ship features — banked specs (built near ship, after Slice 2):** Sound integration — see `game/SOUND_SPEC.md`. v1 scope = Tiers 1/2/5 + Poll-Close Drumroll; Tiers 3–4 (upset sting, Black-Swan klaxon) parked to v2 because v1 has no events/upset-call system. Original 5-tier doctrine preserved in that spec.

## Step 15.7 — Tuning Pass — COMPLETE

Shipped across two work sessions in 2026-05-22:

1. **Polling display clamp** — `Math.min(100, Math.max(0, p))` for display only; raw `rt.polling` unbounded internally. Six sites: `scripts/ui/hud.js:38`, `scripts/ui/candidateSelect.js:19`, `scripts/ui/actionsPanel.js:66`, `scripts/ui/endGameScreen.js:121`, `scripts/engine/autopsy.js:239`, `scripts/engine/autopsy.js:286`.
2. **Dropout instrumentation** — `EG.debug.dropouts = true` enables per-turn pressure trace with `[poll=X del=Y mo=Z]` component breakdown. In `scripts/engine/contests.js#checkDropouts`. Threshold untouched at 35.
3. **Biden inactive** — `scripts/data/candidates.js` D01 `initiallyActive: false`. DEM field becomes Harris / Phillips / Williamson. Eliminates the Harris-vs-Biden co-frontrunner deadlock that produced 10/10 brokered DEM conventions.
4. **LEADER rally weight 6 → 14** — `scripts/engine/aiPlayer.js:34`. Triggers Trump's Rally specialty (×1.5 effective 21, top of his row).
5. **Ground Game `contestMultDelta` 0.4 → 0.25** — `scripts/engine/actions.js`. Tames the base delegate-multiplier without removing the strategic dimension.
6. **Specialty does NOT compound on `contestMultDelta`** — `scripts/engine/actions.js#applyEffect`. Affinity still compounds. This is the key structural fix: previously DeSantis got `1 + (0.25 × 1.5 × 1.3) = ×1.49` per contest, an unintended specialty×affinity×base double-stack. Now: `1 + (0.25 × 1.3) = ×1.33`. Specialty still boosts the action's primary effects (polling, momentum).

### Verified end-state (Node `vm` harness, 10 seeded SIM RESTs against on-disk code)

```
seed | R nom        | Trump | DeSantis | Haley | margin
1    | Trump        | 953   | 800      | 175   |   +153
2    | Trump        | 962   | 819      | 171   |   +143
3    | Trump        | 998   | 791      | 191   |   +207
4    | Trump        | 953   | 809      | 165   |   +144
5    | Trump        | 1073  | 667      | 175   |   +406
6    | Trump        | 987   | 774      | 172   |   +213
7    | DeSantis     | 941   | 847      | 184   |    +94   ← upset, narrow
8    | Trump        | 1132  | 651      | 197   |   +481
9    | Trump        | 952   | 808      | 172   |   +144
10   | Trump        | 1001  | 757      | 163   |   +244
```

**Trump wins 9/10. Avg margin +223. Range +94 to +481.** Hits the user's spec of 80-90% Trump dominance with DeSantis as a credible-but-usually-unsuccessful challenger (seed 7: DeSantis ekes out a 94-delegate upset). Conventions resolved cleanly without brokered modal triggering in any of the 10 runs.

### Things that did NOT reproduce headlessly (left as open carry-over to next session if user wants to revisit)

- **The user's reported "all candidates 0 delegates at end of game" observation.** Headless Node sims show delegates persisting normally through conventions and general election. Likely either (a) a misread of browser state at the wrong moment, (b) PLAY AGAIN reset confusion, or (c) a browser-specific quirk. Not worth chasing unless it re-surfaces.
- **The user's reported "brokered conventions 9/10 both parties" observation.** Headless 0/10 brokered with current code. Same caveat.

## Lessons for future tuning passes (worth keeping)

- **Build a Node `vm` harness early.** It took 20 minutes to wire up and turned every tuning question from "what does the user think?" to "what does the data say?" Predicted outcomes from real numbers > guesses. Wire it up at the start of any tuning pass.
- **Sweep, don't guess.** When I tested 9 tuning options across 10 seeded sims, the right answer was immediately obvious. Single-point tests can mislead.
- **When the model says X is the issue, don't assume reverts are safe.** I recommended reverting the Ground Game 0.4→0.25 change alongside applying Option D, thinking the multiplier-stacking fix would be sufficient. It wasn't — the 0.25 nerf was doing real work too. Always re-verify after a revert proposal; never bundle a "revert" with a "new fix" in one decision.
- **Diagnose-then-tune, not tune-and-hope.** Two sessions in, the diagnostic harness immediately surfaced that DeSantis dominance was real but the brokered/zero-delegate observations were ghosts. The earlier rounds of blind constant-cranking accomplished nothing.

## Done (verified in browser)

1. Skeleton + newsroom theme
2. Data layer (16 candidates, 57 states/territories, 49 contests, 30 events)
3. Game-state model (`EG.state`)
4. US tile-grid map with state coloring
5. Candidate HUD (left panel)
6. Turn-loop scaffold + NEXT TURN button
7. Step 1 — earn campaign points
8. Step 2 — action picker (Rally / Ad Buy / Ground Game / Debate Prep)
9. Step 3 — run contests + **candidate eligibility model** + **momentum mechanic** (chips on HUD, mini-bar on player card, ±40 threshold news, composite-pressure dropout). Design in `MOMENTUM_PLAN.md`.
10. Step 10 — random events from the 30-card deck. Per-card structured mechanic (tier / resolver / deltas) in `data/eventsDeck.js`; engine in `engine/events.js`. 50% per-turn fire, draw-without-replacement, 5 black swans with race-shaping magnitudes, full momentum coupling.
11. Step 11 — convention + nominee declaration (`engine/convention.js`). Single-survivor and clinched-first-ballot paths verified end-to-end in a full-season playthrough (Trump 1803, Harris 3296 in the verified run). Game ended cleanly with ELECTION CONCLUDED.
12. Step 11.6 — **candidate-select modal**. `scripts/ui/candidateSelect.js` overlay at boot lists the 10 active primary-eligible candidates (6 REP + 4 DEM, filtered by `primaryEligible && initiallyActive`) grouped by party. Click → `EG.setPlayer()` → hide → unlock NEXT TURN. Removed the `humanPlayerId = 'R01'` default in `main.js`; button starts disabled. Console override (`EG.setPlayer('R01')` pre-boot) still skips the modal. ~140 lines CSS in `newsroom.css` matching newsroom theme.
13. Step 12 — **scoreboard refinement**. Broadcast-style lower-third strip between header and stage. `engine/scoreboard.js` writes `EG.state.scoreboardSnapshot` (phase-aware: primary, convention, general, concluded) after the per-turn `refreshPhase()` so it reflects the *upcoming* contest, not the one that just ran. `ui/scoreboard.js` reshapes content per phase: primary shows leader · clinch threshold · % bar per party; convention swaps to "★ NOMINEE" gold treatment once `state.nominees[party]` is set; general shows EVs / 270 with toss-up chip; concluded shows full-width called-race banner. Removed the stub `scoreboard` STEPS entry; clinch thresholds (1215 GOP / 1967 DEM) cached on first read from convention rows in the calendar.
14. Step 13 — **AI opponents** (`engine/aiPlayer.js`). Called at top of `engine.actions.run()`. Classifies each non-human active primary-eligible candidate into LEADER / CONTENDER / LONGSHOT / ENDANGERED (based on party-delegate lead + polling + dropout pressure + contests-run gate), then scores the 4 actions via a 4×4 matrix × specialty multiplier × ±10% jitter, stages the winner via `actions.stage()`. Console debug behind `EG.debug.ai = true`. `SCORE_MATRIX` exposed for live tuning. Side effect: Haley's drift question from Step 12 is now even more pronounced since Trump actively spends CP — see [[feedback-momentum-drift-by-design]] in memory.
15. Step 14 — **general election + end-game screen**. `engine/generalElection.js` runs per-state R-vs-D outcome (47/48 national anchors ± margin2020/2 swing, third-party ideology-proximity siphon, swing-state ±5 / safe-state ±2 noise, momentum × 0.1 boost). Writes `s.generalWinner`, sums EVs by re-iterating states (does NOT mutate `nominee.delegates` — that field stays primary count for HUD). Sets `EG.state.nominees.winner` if any nominee ≥ 270. `ui/endGameScreen.js` full-screen modal pops on phase=='concluded' with three tone variants (🏆 PRESIDENT / 🥈 RUNNER-UP / 🚪 PRIMARY-OUT). PLAY AGAIN wired through `EG.newGame()`.
16. **Step 15 polish pass — 5/7 items done.** All verified in-browser.
    - **15.1** — **Action × contest-type interaction** (audit finding #6). Per-state affinity ×1.3/×0.8 in `engine/actions.js`: Rally ↔ retail (pop<4M)/media (pop>12M), Ad Buy inverse, Ground Game ↔ Proportional/WTA, Debate Prep ↔ Caucus/Super-Tuesday. Stacks with specialty. AI score also multiplies affinity so opponents adapt. Action-panel UI shows affinity tag line under description.
    - **15.2** — **SIM ALL / Auto-Play.** Header buttons `▶▶ SIM PRIMARY` and `▶▶▶ SIM REST` loop `turnLoop.next()` with `EG.state.simAll = true`; `aiPlayer.run` then stages for the human too. Full game in <1 second. Try/finally guarantees flag cleanup; `MAX_TURNS=200` safety cap.
    - **15.3** — **Candidate-select polish.** Ideology bar (0-10 gradient blue→grey→red with diamond marker), specialty preview chips (BONUS/PENALTY — only shows wired actions), difficulty tier badge (FAVORITE/CONTENDER/LONGSHOT from `polling×0.5 + funds×0.1 + nameRec×0.1`).
    - **15.4** — **Brokered convention modal + forced playtest.** `engine/convention.js` accumulates ballot snapshots and writes `EG.state.brokeredPending` when multi-ballot. `ui/brokeredModal.js` animated ballot-by-ballot reveal (~0.6s per column). Suppressed during SIM ALL. `EG.debug.forceBrokered(party)` redistributes delegates 45/28/27 across all primary-eligible to guarantee IRV. Verified live: Haley nominated ballot 7.
    - **15.5** — **Election Autopsy (hybrid).** `engine/autopsy.js` template generator (3 paragraphs — primary recap, general recap, human outcome — parses newsLog for nominee reason). `engine/autopsyAI.js` browser-direct Claude API call (Sonnet 4.6, `max_tokens: 800`, `anthropic-dangerous-direct-browser-access: true` header, no caching/streaming). Key in `localStorage` (`eg.claude_api_key`), validated `sk-ant-...` prefix. End-game modal renders template by default with `✨ AI AUTOPSY` upgrade button; failure preserves template. Per-error-type messages (401, 429, network, format).
17. **Action-system audit pass (2026-05-21).** Guided playthrough as Haley surfaced 6 findings; fixed 4, partially addressed 1, deferred 1.
    - **#1 Turn 1 zero agency** — fixed. `state.js` seeds starting CP as `max(earnedFromFormula, 20)` for active candidates so every player can stage Rally (15) or Debate Prep (20) on Turn 1. Formula duplicated inline with sync-comment pointing at `engine/points.js`.
    - **#2 Action efficiency undifferentiated** — fixed. `engine/actions.js` redesigned around four investment dimensions: Rally `+2 poll, +5 momentum` (streak builder), Ad Buy `+4 poll` (pure polling), Ground Game `+2 poll, ×1.4 dels next contest` (del optimizer; was ×1.3), Debate Prep `+3 poll, +3 momentum` (balanced). Each action answers a different strategic question.
    - **#3 Candidate specialties unwired** — fixed. `actions.js` reads `bonusAction`/`penaltyAction` from candidate data and applies ×1.5/×0.5 multipliers to polling, momentum, and Ground Game's del-multiplier delta. `actionsPanel.js` shows green BONUS / red PENALTY badges with the multiplier appended to the description. `auditSpecialties()` runs once at boot via `main.js` and warns about specialty refs pointing to actions not in DEFS (12 such refs across Fundraise / Policy Announcement / Surrogate Deployment / Opposition Research / Air War — fill the gap when those actions get built). CSS `.action-btn-badge` variants in `styles/newsroom.css`.
    - **#4 WTA double-punishes runner-up** — fixed. `engine/contests.js#updateMomentumForContest` tiers `delegateSignal`: `+5` (got dels) / `−3` (no dels but overperformance ≥ +2, moral victory) / `−10` (flopped). `MOMENTUM_PLAN.md` §2 formula + decisions table updated with rows 5–6.
    - **#5 Early action economy thin** — partially addressed by #1's CP floor (Turn 1 now offers a real choice). Watchlist item — re-evaluate in a longer playthrough.
    - **#6 Actions don't interact with contest type** — deferred to Step 15 (Rally better in retail-politics states, Ad Buy in big media markets, Ground Game better in Proportional, etc.).

## Caveats inside the "Done" list

- **Brokered convention not playtested.** The multi-ballot IRV + ideologically-weighted redistribution path only executes when no candidate hits majority on ballot 1, which didn't happen in the verified run. Code paths exist and have console-driven test recipes in the Step 11 chat history; needs a wild primary season (or contrived state) to exercise in real play.
- **Full-season replay not re-verified post-audit.** The Trump 1803 / Harris 3296 result was captured before the action-system audit pass changed five formulas (starting CP, action effects, specialty multipliers, WTA delegate signal). Game still ends cleanly with ELECTION CONCLUDED, but absolute numbers will differ. Re-verify when convenient.

## 🏁 v1 DEFINITION OF DONE — OFFICIAL (set by MJ, 2026-07-27)

> **This supersedes the old prototype ship checklist**, which lived here and referred to the parked `scripts/` "Election 2024" build (`EG.debug.forceBrokered`, convention modal, AI autopsy — none of which exist in the active play layer). That dead checklist is preserved at the bottom of this file under *Archive*, for history only. **It is not the finish line and must not be worked.**

**THE FINISH LINE, IN ONE SENTENCE: _"A friend can play it, voices optional."_**

**v1 is SHIPPED when all five are true:**

1. **It plays start to finish, honestly.** Pick candidate → 22 turns → nominee → play again, with no dead ends. **All four gates green:** Gate A (digit-for-digit engine identity), makeRng (snapshot/restore fidelity), Legibility (zero-move = zero effect; counterfactual never perturbs the real game), Broadcast (context fidelity + prompt guardrails). `npm run gate:all`.
2. **A non-technical friend can open it and play.** A build he **launches without npm, without a build step, and without running a server** — plus a **plain-English README written for him**, not for a developer. *(Note: Slice 1 traded away double-click-to-play for the esbuild bridge. Restoring a just-open-it build is real work and belongs to this line item — it is the biggest unknown in the runway.)*
3. **The broadcast works, and the voices are clearly optional.** The game plays fine with no key. If he adds **his own** key, all three voices speak. The README **tells him plainly that it bills his account.**
4. **Slice 4 done to "clear," not "perfect."** Quick Start modal (goal / levers / turn structure / win condition) + static **"?"** tooltips per panel. **Static help only — no Tutorial Mode.** Good enough that a stranger isn't confused; not polished to a standard nobody asked for.
5. **Sound built: Tiers 1/2/5 + Poll-Close Drumroll.** Placeholder fanfare is fine for v1; the original **Doorkeeper Original Music** cue is a post-ship replacement (per `game/SOUND_SPEC.md`).

**EXPLICITLY NOT IN v1** — all banked in `FUTURE_FEATURES.md`, none of it blocks the ship: AI opponents · spoken broadcast booth · era-appropriate anchor personas · convention/crowd atmosphere · public/proxy hosting.

> **"What is not finished is not."**

**Gate-B tiers, for clarity about what "shipped" does and does not mean:**
| Audience | Status | What it needs |
|---|---|---|
| **(a) MJ, personal use** | ✅ **READY NOW** | own machine, own key — exactly the case Gate B blesses |
| **(b) One non-tech friend** | 🎯 **THIS IS v1** | items 2 + 3 above; blockers are usability, not security |
| **(c) Public / commercial** | ❌ **NOT v1, structural** | a server-side proxy holding the key with per-user rate limiting — a backend, hosting, and cost exposure. A separate project, not a task. |

## Post-v1

See `FUTURE_FEATURES.md` for the full backlog: VP pick, sound integration, brokered-convention dealmaking, player documentation, historical-data mode, two-player hotseat.

---

## Archive — OLD 2024 PROTOTYPE ship checklist (dead, history only)

> Preserved from before 2026-07-27. This was the finish line for the **parked `scripts/` "Election 2024" prototype**, NOT the active v1 play layer. Superseded by the v1 Definition of Done above. Do not work these items.

1. **Real-browser playthrough.** Node `vm` harness != live browser. Open `index.html`, click through one full game end-to-end, confirm: candidate-select modal works, NEXT TURN advances cleanly, contests render delegate awards on the map, brokered modal fires correctly when triggered via `EG.debug.forceBrokered('Republican')` (never verified in real play under current balance), end-game modal renders, PLAY AGAIN resets cleanly.
2. **Cross-browser smoke check.** At minimum Chrome + one of Firefox/Edge.
3. **Write README.md** at project root. One screen. Note about optional Claude API key for AI autopsy.
4. **Distribution choice.** Zip + email/Dropbox? GitHub Pages? Send the folder?
