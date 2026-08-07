# Slice 2 — Legibility (Session 1) — working spec + progress

**Goal:** after each turn, show the player the **marginal effect of their choices** (the "+8/−8"),
so even a losing seed feels like the decisions mattered. Built **lever-agnostic** so the same
readout serves the campaign lever now and the emphasis lever later. Engine stays frozen; all
additive in `game/`.

---

## Design (approved)

**Real-engine counterfactual, NO replication.** Per targeted contest, run the frozen engine twice:
- **Authoritative run** — the player's bump applied → the real outcome (unchanged).
- **Counterfactual run** — same contest, on a *clone* of the pre-contest field, with a *separate*
  `makeRng` restored to the *same pre-contest state* (identical dice), but **no player effort**.

Displayed delta = `authoritative − counterfactual` per candidate. Both runs ARE the frozen engine,
so nothing can drift from it. The replicated scorer in `prove-mechanism.js` stays an offline
cross-check only — not a live dependency.

**Lever-agnostic:** the counterfactual baseline is "player did nothing this contest" (`moves = null`),
so the delta captures whatever the player did — campaign effort today, emphasis tomorrow, both later.

**Honest scope:** the number is the *local* marginal effect at that contest given the real race
state up to then — NOT season-long momentum attribution. UI copy must say "your push **here**."

---

## Progress

### STEP 1 — snapshottable `makeRng` — ✅ COMPLETE + GATED
- `game/src/rng.js`: added `makeRng(seed)` — same mulberry32 stream + `getState()/setState()`.
  `mulberry32` kept as the canonical comparison reference.
- `game/verify-makerng.js` — gate, both checks **PASS**:
  - Copy-identity: `makeRng` byte-identical to canonical `mulberry32` from frozen `model/sim2016.js`
    (5 seeds × 2000 = 10,000 draws).
  - Snapshot/restore fidelity: `getState()`→`setState()` reproduces the exact stream, same-generator
    AND fresh-generator restore (the counterfactual pattern).

### STEP 2 — switch live game to `makeRng` — ✅ COMPLETE
- `game/src/gameState.js`: `game.rng = RNG.makeRng(s)` (was `mulberry32`). Invariant comment updated.
- Bundle rebuilt (`dist/app.js`).
- **Gate A still PASS, byte-for-byte identical:** no-move playthrough == `runPrimary`
  (Trump 1327 · Cruz 978 · Carson 150 · Rubio 16). Generator swap is behavior-neutral, confirmed live.

**Checkpoint state:** `model/` untouched (2026-06-09); `config-play.js` unchanged (4/12); no
counterfactual logic added yet. Green.

---

### STEP 3 — counterfactual plumbing — ✅ COMPLETE + GATED (2026-07-18)
- `turnLoop.js#resolveTurn`: per contest — rng snapshot + pre-transient field clone BEFORE any
  player transient; authoritative run unchanged; counterfactual run AFTER the transient revert
  (separate `makeRng` restored to the same state, clean clone, no player moves); `computeEffect`
  (deltas + realWinner/cfWinner/flipped) attached to each contest result.
- `verify-legibility.js` — the bite's gate, all parts **PASS**: no-op invariant (56 contests, zero
  deltas, zero flips), Gate A non-perturbation (digit-for-digit with counterfactual active),
  effort smoke (readout sees the lever across 3 seeds).

### STEP 4 — UI readout — ✅ COMPLETE (2026-07-18)
- `resultsPanel.js`: "↳ your moves here: Cruz +2 (16 vs 14) · Trump −2"; flip highlight
  ("⚡ Your moves WON Iowa (was Trump's)"); per-turn net summary; hands-off case
  ("baseline result, no push measured"). CSS in `newsroom.css`.
- Copy says "your moves **here**" — the honest local-effect scope.

### STEP 5 — EMPHASIS LEVER — ✅ COMPLETE + GATED + SWEPT (2026-07-18)
- `levers/emphasisLever.js`: one issue axis per turn (or none). Mode auto-derived:
  |pos − mood| <= EMPHASIS_STRONG_THRESHOLD ⇒ **lean in** (transient authenticity bump, cap 10 —
  amplifies existing alignment, i.e. leaning into strength); else ⇒ **shore up** (transient
  position shift toward mood, never past it). MUTATION-SAFE: swaps `player.calib` for an
  adjusted copy; undo restores the reference; shared calib never touched (machine-checked).
- Knobs in `config-play.js`: EMPHASIS_STRONG_THRESHOLD 2 · EMPHASIS_AUTH_BUMP 2 · EMPHASIS_SHIFT 2.
- `turnPanel.js`: emphasis section (six axes, you-vs-mood readout, STRENGTH/weak-spot tag).
- Counterfactual is lever-agnostic by design, so the readout captures emphasis with zero new code.
- Gate PART 4 **PASS**: shared calib/cycle unmutated after emphasis-heavy seasons; emphasis-only
  produces visible deltas.
- **Balance sweep (`sweep-emphasis.js`, 200 seeds, Cruz):** hands-off 18.0% · emphasis-only 25.5%
  · effort-only 36.0% · both 41.0% (avg dels 987/1074/1122/1155). Emphasis = meaningful but
  secondary; stacking sub-additive; Trump still favored at max-skill play. **NO config change —
  magnitude judgment goes to MJ's felt playtest** (the Slice 1 lesson, kept).

### STEP 6 — browser smoke — ✅ PASS (2026-07-18)
- Served via localhost; seed 20160272 (the blowout, the session's qualitative acceptance seed):
  Cruz + 3 effort Iowa + emphasize Establishment → **Iowa flips to Cruz 16–14**, readout renders
  the +2/−2, the flip banner, and the net summary. Turn 2 renders both levers cleanly.
- Remaining acceptance: **MJ's felt playtest** on 20160272 — does a losing seed now feel like the
  choices mattered? (The mechanical half is proven; the felt half is his.)

## ORIGINAL NEXT-BITE NOTES (now historical)

**Counterfactual plumbing** in `game/src/turnLoop.js#resolveTurn`, per contest:
1. `state = game.rng.getState()` (dice position before this contest).
2. `clone = game.field.map(c => ({...c}))` (pre-effort snapshot of the real running state).
3. Authoritative: apply bump → `awardDelegates(real field, game.rng)` → revert → `processContestMomentum`
   (unchanged).
4. Counterfactual: `cf = makeRng(0); cf.setState(state)` → `awardDelegates(clone, cf)` with **no bump**.
5. `effect = realAwards − cfAwards` per candidate → attach to the turn result (e.g.
   `result.contests[i].effect`).

Then the gate for this bite:
- **No-op invariant:** zero player moves ⇒ **exactly zero** delta on every contest (machine-checked
  over a full no-move season).
- **Gate A non-perturbation:** no-move digit-for-digit still identical (proves the clones + separate
  `cf` generator never touch the real game).

## After that (later bites, not this one)
- UI readout (`ui/effectPanel.js` or extend `resultsPanel.js`): "Texas — your push: Cruz +8 (73 vs 65),
  Trump −8"; flip highlight ("⚡ Your push WON Texas"); turn summary; no-effort case.
- **Re-playtest seed 20160272** (the blowout) — confirm choices read as legible even in defeat. The
  qualitative acceptance for the session.

## Guardrails (every bite)
- `model/` frozen; `config-play.js` untouched; no engine edits.
- Each bite ends at a verified checkpoint; never proceed past a red gate.
