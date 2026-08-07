/* ============================================================
   campaignLever.js — "Where to campaign" (Slice 1 lever).

   Translates a player's per-turn effort allocation into a BOUNDED,
   transient polling bump applied to the PLAYER'S OWN candidate, and
   only for the targeted state's contest. The engine reads cand.polling
   when scoring a contest; this nudges that input and reverts it right
   after. It never touches calib, the knobs, or any rng draw — so a
   zero allocation is a true no-op and the rng sequence is unchanged.
   ============================================================ */

const CFG = require("../config-play.js");

// Bounded polling bump for a given state, from the player's allocation.
// moves = { effort: { [stateName]: points } } | null
function bumpForState(moves, stateName) {
    if (!moves || !moves.effort) return 0;
    const pts = moves.effort[stateName] || 0;
    if (pts <= 0) return 0;
    return Math.min(pts * CFG.POLL_BUMP_PER_EFFORT, CFG.MAX_POLL_BUMP);
}

function totalAllocated(moves) {
    if (!moves || !moves.effort) return 0;
    return Object.values(moves.effort).reduce((s, p) => s + (p > 0 ? p : 0), 0);
}

module.exports = { bumpForState, totalAllocated };
