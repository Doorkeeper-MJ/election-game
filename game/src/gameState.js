/* ============================================================
   gameState.js — owns the mutable game state for one playthrough.

   The `field` is built EXACTLY as runPrimary builds it
   (candidates2016.map(c => ({...c, momentum:0, delegates:0}))), in
   the same candidate order, so the engine sees identical inputs and
   draws rng in identical order. `field` is never reordered in place;
   any sorting for display happens on a copy. model/ is imported,
   never modified.

   v2 step 0 adds two things to the game object and changes no rule:
     game.profile — the rules profile (profiles.js). Omitted -> frozen-2016.
     game.dice    — split dice (dice.js): contest / event(t) / opponent(t).
   game.rng is kept as an ALIAS of game.dice.contest (same object) so
   nothing that read it breaks; new code should say game.dice.contest.
   ============================================================ */

const { makeDice } = require("./dice.js");
const { getProfile } = require("./profiles.js");
const { candidates2016, calendar2016, cycle2016 } = require("../../model/data-2016.js");

// Same clone runPrimary makes — same order, same starting values.
function buildField(candidates) {
    return candidates.map(c => ({ ...c, momentum: 0, delegates: 0 }));
}

// Group the chronological calendar into one turn per DATE (so Super
// Tuesday is one turn). Same-date contests are consecutive in the
// calendar, so resolution order across all turns is identical to the
// calendar array order — and thus to runPrimary.
function groupByDate(calendar) {
    const turns = [];
    let cur = null;
    for (const contest of calendar) {
        if (!cur || cur.date !== contest.date) {
            cur = { date: contest.date, contests: [] };
            turns.push(cur);
        }
        cur.contests.push(contest);
    }
    return turns;
}

// seed omitted -> random per play; passed explicitly -> reproducible (gate).
// profileName omitted -> "frozen-2016" (see profiles.js for why the default
// is frozen: every pre-v2 caller stays pinned to Gate A's world untouched).
function newGame(playerId, seed, profileName) {
    const s = (seed === undefined || seed === null) ? (Date.now() >>> 0) : (seed >>> 0);
    const profile = getProfile(profileName);
    // INVARIANT (dice seam, v2 step 0 — replaces v1's "one rng instance"):
    // dice.contest is ONE makeRng(seed) created here, ONCE per game, and passed
    // to EVERY awardDelegates call across the season in calendar order. It is
    // never re-created or re-seeded per turn or per contest. It is seeded with
    // the master seed UNCHANGED, so a frozen-2016 no-move season is digit-for-
    // digit runPrimary(mulberry32(seed)) (Gate A). dice.event(t) and
    // dice.opponent(t) are SEPARATE per-turn generators derived from (seed, t);
    // a draw on either moves zero contest dice. See dice.js; machine-checked in
    // verify-cluster.js (Gate D).
    const dice = makeDice(s);
    return {
        seed: s,
        profile: profile,
        dice: dice,
        rng: dice.contest,           // alias — same object as dice.contest
        field: buildField(candidates2016),
        cycle: cycle2016,
        calendar: calendar2016,
        turns: groupByDate(calendar2016),
        turnIndex: 0,
        phase: "primary",            // "primary" | "concluded"
        playerId: playerId,
        nominee: null,
        clinch: cycle2016.delegatesToClinch,   // 1237
        history: []
    };
}

module.exports = { newGame, buildField, groupByDate };
