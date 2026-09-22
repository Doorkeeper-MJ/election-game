/* ============================================================
   dice.js — SPLIT DICE for the play layer (v2 step 0, spec §1.2b).

   One master seed, three independent streams, every stream a pure
   function of (seed, purpose, turn):

     contest   — ONE persistent makeRng(seed), threaded through every
                 awardDelegates call across the season, exactly as v1.
                 Seeded with the MASTER SEED UNCHANGED, so a frozen-2016
                 no-move season is digit-for-digit runPrimary(mulberry32
                 (seed)) — Gate A never re-baselines. (The spec table
                 wrote hash(seed,"contest"); that would have moved every
                 Gate A number. Identity derivation is the one reading
                 consistent with "byte-identical to today".)
     event(t)  — a FRESH generator per turn, seeded from
                 deriveSeed(seed, "event", t). The event draw for turn t.
     opponent(t) — a FRESH generator per turn, seeded from
                 deriveSeed(seed, "opp", t). Opponent-heuristic noise.

   WHY per-turn re-seeding: the legibility counterfactual ("what if the
   player had done nothing THIS turn") must see the SAME event and the
   SAME opponent read as the real run. Because event(t) depends only on
   (seed, t), the shadow run gets identical draws by construction — the
   world is held constant and only the player's moves vary. It also
   means any single turn can be replayed in isolation.

   INVARIANT (replaces v1's "one rng instance, never re-seeded"):
   the CONTEST stream is still one instance, created once, never
   re-seeded. The event/opponent streams are never shared across turns
   and never touch the contest stream. Any extra event/opponent draw
   moves ZERO contest dice. Machine-checked in verify-cluster.js.

   No consumer of event()/opponent() exists at step 0. They are the
   sockets steps 3 and 4 plug into.
   ============================================================ */

const { makeRng } = require("./rng.js");

// murmur3 finalizer — spreads low-entropy inputs (small turn indices,
// short labels) across all 32 bits.
function fmix32(h) {
    h ^= h >>> 16;
    h = Math.imul(h, 0x85ebca6b);
    h ^= h >>> 13;
    h = Math.imul(h, 0xc2b2ae35);
    h ^= h >>> 16;
    return h >>> 0;
}

// Deterministic 32-bit seed for a (seed, label, turnIndex) triple.
// FNV-1a over the label's chars, folded with the master seed and the
// turn index, then fmix32. Pure; no Date, no Math.random, no state.
function deriveSeed(seed, label, turnIndex) {
    if (!Number.isInteger(turnIndex) || turnIndex < 0) {
        throw new Error(`deriveSeed: turnIndex must be a non-negative integer (got ${turnIndex}) — ` +
            "per-turn streams are never shared across turns");
    }
    let h = (0x811c9dc5 ^ (seed >>> 0)) >>> 0;
    for (let i = 0; i < label.length; i++) {
        h ^= label.charCodeAt(i);
        h = Math.imul(h, 0x01000193);
    }
    h ^= (turnIndex + 0x9e3779b9) >>> 0;
    h = Math.imul(h, 0x01000193);
    return fmix32(h);
}

// The game's dice. `contest` is the v1 generator under its new name;
// event/opponent are factories, not generators — call them with the turn.
function makeDice(seed) {
    const s = seed >>> 0;
    return Object.freeze({
        seed: s,
        contest: makeRng(s),
        event: function (turnIndex) { return makeRng(deriveSeed(s, "event", turnIndex)); },
        opponent: function (turnIndex) { return makeRng(deriveSeed(s, "opp", turnIndex)); }
    });
}

module.exports = { makeDice, deriveSeed, fmix32 };
