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
    EMPHASIS_SHIFT: 2             // shore-up: transient position shift toward mood (never past it)
};
