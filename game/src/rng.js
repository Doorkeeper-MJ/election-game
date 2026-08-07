/* ============================================================
   rng.js — seeded PRNG for the play layer.

   mulberry32 is copied VERBATIM from model/sim2016.js to guarantee
   an identical rng sequence (the digit-for-digit Slice-1 gate).
   model/ is frozen and sim2016.js exports nothing (it is a script),
   so this is a faithful copy, not an import. Do not "improve" it —
   any change breaks sequence identity with the validated engine.
   ============================================================ */

function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
        a |= 0;
        a = (a + 0x6D2B79F5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

/* makeRng — the SAME mulberry32 stream (byte-identical output to
   mulberry32 above) plus a snapshottable state, for the legibility
   counterfactual: capture the dice position before a contest, then
   reproduce the exact same draws on a separate generator.

   The whole generator state is the single 32-bit integer `a`.
   getState() returns it; setState() restores it. A draw normalizes
   with `a |= 0` first, so storing/restoring the unsigned (>>>0)
   representation is bit-exact. NOT yet wired into the game — added
   as a verified primitive only. mulberry32 stays the canonical
   comparison reference. */
function makeRng(seed) {
    let a = seed >>> 0;
    const f = function () {
        a |= 0;
        a = (a + 0x6D2B79F5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    f.getState = function () { return a >>> 0; };
    f.setState = function (s) { a = s >>> 0; };
    return f;
}

module.exports = { mulberry32, makeRng };
