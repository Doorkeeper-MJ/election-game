/* ============================================================
   emphasisLever.js — "What to emphasize" (Slice 2, v1's second lever).

   The player may pick ONE issue axis per turn (or none). The lever
   translates that choice into a BOUNDED, transient adjustment of the
   inputs the frozen engine already reads via computeCalibScore:

   - Emphasizing a STRENGTH (position within EMPHASIS_STRONG_THRESHOLD
     of the electorate mood) = "leaning in": conviction messaging —
     a transient authenticity bump (capped at 10). Authenticity
     MULTIPLIES alignment, so leaning in pays most exactly where the
     player is already aligned. (Lean into a strong issue.)
   - Emphasizing a WEAKNESS = "shoring up": the player's position on
     that axis moves toward the mood by up to EMPHASIS_SHIFT (never
     past it). (Shore up a weakness.)

   MUTATION SAFETY: candidate.calib is shared BY REFERENCE with the
   frozen data module (field building uses {...c}). This lever never
   mutates that object — it SWAPS player.calib for an adjusted copy
   and the undo restores the original reference. The counterfactual's
   pre-transient clone also holds the original reference, so the
   baseline is always clean.

   Like the campaign lever: no emphasis = a true no-op; no rng draws;
   engine untouched.
   ============================================================ */

const CFG = require("../config-play.js");

// "lean-in" | "shore-up" for a given axis, or null when no calib data.
function modeFor(player, cycle, axis) {
    if (!player || !player.calib || !cycle || !cycle.mood) return null;
    const gap = Math.abs(player.calib.issues[axis] - cycle.mood[axis]);
    return gap <= CFG.EMPHASIS_STRONG_THRESHOLD ? "lean-in" : "shore-up";
}

// Apply the transient emphasis. Returns an undo function, or null if
// there was nothing to apply (no axis chosen / no calib).
function applyEmphasis(player, cycle, axis) {
    if (axis === null || axis === undefined || !player || !player.calib) return null;
    if (!Number.isInteger(axis) || axis < 0 || axis >= player.calib.issues.length) return null;

    const original = player.calib;
    const mood = cycle.mood[axis];
    const pos = original.issues[axis];
    const issues = original.issues.slice();
    let authenticity = original.authenticity;

    if (modeFor(player, cycle, axis) === "lean-in") {
        authenticity = Math.min(10, authenticity + CFG.EMPHASIS_AUTH_BUMP);
    } else {
        const shift = Math.min(CFG.EMPHASIS_SHIFT, Math.abs(mood - pos));
        issues[axis] = pos + Math.sign(mood - pos) * shift;
    }

    player.calib = { ...original, issues: issues, authenticity: authenticity };
    return function undo() { player.calib = original; };
}

module.exports = { applyEmphasis, modeFor };
