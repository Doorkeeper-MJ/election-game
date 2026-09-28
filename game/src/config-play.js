/* ============================================================
   config-play.js — PLAY-LAYER knobs ONLY.

   These govern how player CHOICES translate into the inputs the
   frozen engine already reads (the player's own polling/momentum).
   They are deliberately SEPARATE from model/config.js, which holds
   the validated engine knobs and is frozen. NOTHING here may ever
   be moved into model/config.js, and nothing there is duplicated
   here. Magnitudes are intentionally BOUNDED: v1 is a what-if
   AROUND the validated baseline, not an override of it.
   ============================================================ */

module.exports = {
    // "Where to campaign" lever.
    EFFORT_POOL: 3,            // effort points the player allocates per turn
    POLL_BUMP_PER_EFFORT: 4,   // transient polling added per effort point in a targeted state
    MAX_POLL_BUMP: 12,         // hard cap on the per-state bump (bounded what-if)

    // "What to emphasize" lever (Slice 2). One issue axis per turn, or none.
    EMPHASIS_STRONG_THRESHOLD: 2, // |position − mood| <= this ⇒ the axis is a strength ("lean in")
    EMPHASIS_AUTH_BUMP: 2,        // lean-in: transient authenticity bump (capped at 10)
    EMPHASIS_SHIFT: 2,            // shore-up: transient position shift toward mood (never past it)

    // "War chest" lever (v2 step 1, spec §2.5; live only under a profile with money: true).
    // Money buys EFFORT, never polling: bought points join the same pool the campaign
    // lever spends, so the per-state cap above still binds. Starting values; both are
    // sweep outputs per the spec (§8), re-tuned by sweep-money.js, never by feel.
    MONEY_COST_PER_EFFORT: 2,     // cash per extra effort point (data: Jeb 100, Trump 50, Cruz 25 ... Huckabee 4)
    MONEY_MAX_EXTRA_PER_TURN: 4   // council guard 1 — per-turn spend ceiling (extra points, not cash)
    // Set by sweep-money.js, 200 seeds, 2026-09-28. Grid (cost/ceiling → Cruz effort+money win%,
    // effort+emphasis+money win%, Jeb max-money win%): 4/2 → 36.5, 41.0, 0 (money inert) ·
    // 4/4 → 37.5, 43.5, 0 · 2/4 → 39.0, 46.0, 0 (chosen: same weight as the emphasis lever) ·
    // 2/6 → 44.5, 46.0, 0 · 2/2 and 1/4 → money HURT Cruz (34–37%): early wins make him leader
    // sooner and MOM_LEADER_BLEED turns on him. Baselines: effort-only 36.0, effort+emphasis 41.0.
};
