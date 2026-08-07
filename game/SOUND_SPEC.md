# Election Game — Sound Integration Spec (v1 ship feature)

**Status:** Spec banked July 2026. **NOT built yet.** Build order: **after Slice 2 (legibility).** Design doctrine by MJ, July 13, 2026.

**Design doctrine (MJ — preserved verbatim):** *Sound = information hierarchy for the ears; the rarer the sound, the more power it keeps.*

---

## Scope reality — why this is re-mapped (read first)

The original five-tier spec was written against the **OLD 2024 prototype's** mechanics — events, Black Swans, per-state winner "calls," dropouts, endorsements, debates. The **active v1** (`game/` + `model/`, 2016 GOP) is a **proportional-delegate primary with momentum**: it has **no events system, no per-state winner calls, no dropouts, no endorsements/funding**. Verified: `model/engine.js` = "contests only (no actions/events/dropouts)."

So **Tiers 3 (upset sting) and 4 (Black Swan klaxon) have nothing to fire on in v1** and are **PARKED to v2** (pre-designed — see `Election Game — v2 Vision.md` in the vault), awaiting a v2 events system. **v1 ships with Tiers 1, 2, 5 + the Poll-Close Drumroll.** That's a deliberately thinner system than the full vision — most of the doctrine's punch (the stings and the klaxon) lives in the parked tiers and needs v2's events to land.

---

## Full five-tier design (preserved) + v1 status

| Tier | Sound | Character | Original triggers | **v1 status** |
|---|---|---|---|---|
| **1 — Tick** | soft click/blip, <0.5s | subliminal heartbeat | routine poll updates, minor delegate increments, minor news | **ACTIVE** — per-contest delegate awards |
| **2 — Chime** | single clean note, ~1s | "glance when convenient" | expected state call, endorsements, funding milestones, threshold crossings | **ACTIVE (partial)** — see v1 triggers; endorsements/funding N/A in v1 |
| **3 — Sting** | 2–3 note dramatic hit, ~1.5s | "look up NOW" | UPSET state call, candidate eliminated, debate verdicts, momentum flip in must-win state | **PARKED → v2** (needs events / winner-call system) |
| **4 — KLAXON** | low alarm swell + pulse, ~2–3s | stomach-drop | BLACK SWAN events ONLY | **PARKED → v2** (needs events deck; no other trigger may EVER use this sound) |
| **5a — Fanfare** | triumphant brass, 3–5s | once per game | player's candidate clinches nomination | **ACTIVE** — player reaches clinch (1237) |
| **5b — Somber sting** | low strings, ~3s | defeat lands | player's candidate eliminated | **ACTIVE** — game ends with player not the nominee |

> **Tier 5a TODO:** the fanfare is a **placeholder** — to be replaced post-ship by an **original Doorkeeper Original Music brass sting** (MJ's catalog, first product placement).

---

## v1-accurate trigger map (what to actually wire)

- **Tier 1 (Tick):** each contest's delegate award as it lands (batched per state within a turn is fine).
- **Tier 2 (Chime):** a v1 "as expected / glance" moment — e.g., the current delegate **leader tops a contest as expected**, or the **player wins delegates in a state they campaigned in**. Keep it modest; it must stay rarer/heavier than the Tick.
- **Tier 5a (Fanfare):** player's candidate reaches the **clinch threshold (1237)** → nominee.
- **Tier 5b (Somber):** game concludes (`phase === 'concluded'`) with the player **not** the nominee.

*(Note: v1's engine does produce internal "upsets" via momentum — a non-leader winning a contest triggers `MOM_UPSET_GAIN`. Per MJ, the Tier-3 SOUND for that stays parked to v2 with the rest of the events layer; do not wire a v1 sting off the momentum signal.)*

## Structural rules

- **Poll-Close Drumroll (v1 ACTIVE):** 2–3s tension riser BEFORE each turn's contests resolve ("stand by for a projection"). Every resolution round, win or lose.
- **No stacking (v1 ACTIVE):** if multiple events resolve together, play only the **highest tier once**; lower-tier events in the batch resolve silently.
- **Silence Rule (v2 — inert in v1):** suppress Tier 1–2 for 2s after any Tier 4. Documented now; does nothing until Tier 4 exists (v2).
- **Frequency guard (v2 — inert in v1):** batch 3+ Tier-3 triggers in a turn to one play. Inert until Tier 3 exists (v2).

## Sourcing (v1)

Royalty-free packs (Pixabay / Freesound / Mixkit) — **verify each license allows game use**; note attribution in a `CREDITS` comment if required. Small, web-optimized (mp3/ogg, <100KB each where possible). Tier 5a = placeholder pending the Doorkeeper sting (above).

## Controls

Master **mute toggle**, always visible, **top corner, speaker icon**. Default = **sound ON, ~60% volume**. **Single master only** for v1 (no per-tier sliders — keep the UI clean). **Persist mute state for the session.**

## Technical

- **Preload** all audio on game start (no first-play lag).
- Handle **browser autoplay policy** — sounds unlock on first user interaction.
- **Graceful no-audio fallback** — the game must remain **fully playable muted**.

## Implementation surfaces (v1 code — when built)

- New `game/src/ui/sound.js` — audio registry (preload, mute state, `play(tier)` with no-stacking + drumroll orchestration).
- Hooks: `turnLoop.resolveTurn` (drumroll before resolution; Tier 1 on awards), `main.renderEnd` / `evaluateEnd` (Tier 5a / 5b), `main.js` header (mute toggle + unlock-on-first-interaction).
- **No `model/` or `engine` changes; `config-play.js` untouched.**

## Test checklist (v1 subset)

(a) drumroll precedes **every** resolution round; (b) **victory AND defeat** each produce their Tier 5; (c) mute kills everything **instantly**; (d) **no stacking** on multi-contest turns; (e) muted game is **fully playable**; (f) confirm **no Tier 4** path exists in v1 (parked).

*(The original checklist items about Tier 4 firing only on Black Swan, and expected-vs-upset tiers, move to the v2 test checklist when the events system lands.)*
