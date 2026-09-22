/* ============================================================
   profiles.js — RULES PROFILES (v2 step 0, spec §1.2a).

   A game is created under a named profile. The profile says which
   cluster subsystems are LIVE for that game. Cluster code is additive
   and lives in the play layer; model/ stays frozen; a profile flag is
   the only thing that switches a subsystem on.

     frozen-2016 — everything off. Gate A lives here, forever. A
                   no-move season is byte-identical to runPrimary.
                   THIS IS THE DEFAULT when newGame() is called without
                   a profile, so every gate, sweep and harness that
                   predates v2 stays pinned to it without an edit.
     v2-2016     — everything on. The real game (main.js asks for it).

   At step 0 NO CODE READS THESE FLAGS — the subsystems do not exist
   yet. Each flag is switched on in v2-2016 now so that when its step
   lands the shipped game gets it and frozen-2016 does not. Until then
   both profiles play identically (machine-checked in verify-cluster.js
   as "step-0 inertness"; that check retires when step 2 lands).

   Flags → step that consumes them (spec §7):
     money           step 1   §2.5  funds buy effort
     dropouts        step 2   §2.2  exit + proximity-weighted redistribution
     momentumBrake   step 2   §2.3  leader viability floor + ±M_CAP band
     events          step 3   §2.1  the ported deck
     opponentMoves   step 4   §2.4  strategy profiles, identical pools
   ============================================================ */

const PROFILES = Object.freeze({
    "frozen-2016": Object.freeze({
        name: "frozen-2016",
        cycle: 2016,
        money: false,
        dropouts: false,
        momentumBrake: false,
        events: false,
        opponentMoves: false
    }),
    "v2-2016": Object.freeze({
        name: "v2-2016",
        cycle: 2016,
        money: true,
        dropouts: true,
        momentumBrake: true,
        events: true,
        opponentMoves: true
    })
});

const DEFAULT_PROFILE = "frozen-2016";   // omitted → frozen (gates, sweeps, harnesses)
const PLAY_PROFILE = "v2-2016";          // what the browser game creates

function getProfile(name) {
    const key = (name === undefined || name === null) ? DEFAULT_PROFILE : String(name);
    const p = PROFILES[key];
    if (!p) throw new Error(`Unknown rules profile "${key}". Known: ${Object.keys(PROFILES).join(", ")}`);
    return p;
}

function isProfile(name) {
    return Object.prototype.hasOwnProperty.call(PROFILES, String(name));
}

module.exports = { PROFILES, DEFAULT_PROFILE, PLAY_PROFILE, getProfile, isProfile };
