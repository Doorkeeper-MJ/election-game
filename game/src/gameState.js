/* ============================================================
   gameState.js — owns the mutable game state for one playthrough.

   The `field` is built EXACTLY as runPrimary builds it
   (candidates2016.map(c => ({...c, momentum:0, delegates:0}))), in
   the same candidate order, so the engine sees identical inputs and
   draws rng in identical order. `field` is never reordered in place;
   any sorting for display happens on a copy. model/ is imported,
   never modified.
   ============================================================ */

const RNG = require("./rng.js");
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
function newGame(playerId, seed) {
    const s = (seed === undefined || seed === null) ? (Date.now() >>> 0) : (seed >>> 0);
    return {
        seed: s,
        // INVARIANT (rng seam): ONE makeRng instance is created here, ONCE per
        // game, stored as game.rng, and passed to EVERY awardDelegates call across
        // the whole season in calendar order. It is never re-created or re-seeded
        // per turn or per contest — a re-seed would reset the stream and break
        // digit-for-digit identity with runPrimary. See turnLoop.resolveTurn.
        // makeRng's stream is byte-identical to mulberry32 (proven in
        // verify-makerng.js), so this switch does not change any outcome; it only
        // adds getState()/setState() for the upcoming legibility counterfactual.
        rng: RNG.makeRng(s),
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
