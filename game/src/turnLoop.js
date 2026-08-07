/* ============================================================
   turnLoop.js — paces the FROZEN engine one turn (one date) at a time.

   resolveTurn replays exactly what runPrimary does per contest —
   awardDelegates(...) then processContestMomentum(...) — in calendar
   order, with no extra rng draws. The only addition is a bounded,
   transient polling bump on the player's candidate for states they
   campaigned in (reverted immediately after the contest). With no
   moves it is a literal no-op, so a no-move playthrough reproduces
   runPrimary digit-for-digit.

   End-condition policy (clinch / calendar-exhausted) lives in
   evaluateEnd, kept SEPARATE from resolution so the gate can resolve
   the full calendar exactly as runPrimary does.
   ============================================================ */

const { awardDelegates, processContestMomentum } = require("../../model/engine.js");
const campaignLever = require("./levers/campaignLever.js");
const emphasisLever = require("./levers/emphasisLever.js");
const RNG = require("./rng.js");

/* Legibility effect (Slice 2): authoritative − counterfactual, per candidate.
   Union of the two award lists by name; candidates present in one and not the
   other count as 0 there. Also names both winners so the UI can flag a flip. */
function computeEffect(realAwards, cfAwards) {
    const real = {};
    for (const a of realAwards) real[a.name] = a.delegates;
    const cf = {};
    for (const a of cfAwards) cf[a.name] = a.delegates;
    const names = Object.keys({ ...real, ...cf });
    const deltas = names.map(n => ({
        name: n,
        real: real[n] || 0,
        cf: cf[n] || 0,
        delta: (real[n] || 0) - (cf[n] || 0)
    }));
    const winnerOf = list => list.reduce((b, a) => (a.delegates > (b ? b.delegates : -1) ? a : b), null);
    const rw = winnerOf(realAwards);
    const cw = winnerOf(cfAwards);
    return {
        deltas: deltas,
        realWinner: rw ? rw.name : null,
        cfWinner: cw ? cw.name : null,
        flipped: !!(rw && cw && rw.name !== cw.name)
    };
}

function leaderOf(field) {
    return field.reduce((best, c) => (c.delegates > best.delegates ? c : best), field[0]);
}

// Resolve the current turn's contests through the frozen engine.
// moves = { effort: { [stateName]: points }, emphasis: axisIndex|null } | null
function resolveTurn(game, moves) {
    const turn = game.turns[game.turnIndex];
    const player = game.field.find(c => c.id === game.playerId);
    const result = { date: turn.date, contests: [] };

    // INVARIANT (resolution order): contests resolve in calendar2016 array-index
    // order. turn.contests preserves that order, and turns are consecutive slices
    // of the calendar, so iterating turns then turn.contests == iterating the raw
    // calendar. Date-grouping is DISPLAY ONLY and must never reorder resolution.
    // INVARIANT (rng): the SAME game.rng instance (created once in newGame) is
    // passed to every awardDelegates call here — never re-seeded per turn/contest.
    for (const contest of turn.contests) {
        // LEGIBILITY COUNTERFACTUAL (Slice 2) — snapshot BEFORE any player
        // transient: the dice position (getState is a read; zero draws) and a
        // shallow clone of the pre-effort field. Both are for the counterfactual
        // run only; the real game never touches them.
        const rngState = game.rng.getState();
        const preField = game.field.map(c => ({ ...c }));

        // Bounded transient polling bump for the player in this state only.
        const bump = campaignLever.bumpForState(moves, contest.state);
        if (bump !== 0 && player) player.polling += bump;

        // Bounded transient emphasis (Slice 2) — turn-wide messaging, applied
        // around every contest this turn. Swaps player.calib for an adjusted
        // copy; undo restores the original reference (shared calib never mutated).
        const undoEmphasis = emphasisLever.applyEmphasis(
            player, game.cycle, moves ? moves.emphasis : null);

        const awards = awardDelegates(contest.delegates, game.field, game.cycle, game.rng);
        processContestMomentum(game.field, awards);

        if (undoEmphasis) undoEmphasis();
        if (bump !== 0 && player) player.polling -= bump; // revert — engine state untouched beyond delegates/momentum

        // Counterfactual: the SAME frozen engine, a SEPARATE generator restored
        // to the same dice position (identical draws), the clean pre-effort
        // clone, and NO player transients ("player did nothing this contest").
        // Runs AFTER the transient revert so shared-by-reference sub-objects
        // (e.g. calib) are clean. Mutates only the discarded clone.
        const cfRng = RNG.makeRng(0);
        cfRng.setState(rngState);
        const cfAwards = awardDelegates(contest.delegates, preField, game.cycle, cfRng);

        result.contests.push({
            state: contest.state,
            delegates: contest.delegates,
            awards: awards,
            effect: computeEffect(awards, cfAwards)
        });
    }

    game.history.push(result);
    game.turnIndex++;
    return result;
}

// End-condition policy (NOT part of resolution). Sets phase + nominee.
function evaluateEnd(game) {
    const leader = leaderOf(game.field);
    if (leader.delegates >= game.clinch) {
        game.phase = "concluded";
        game.nominee = leader;
    } else if (game.turnIndex >= game.turns.length) {
        game.phase = "concluded";
        game.nominee = leader;
    }
    return game.phase;
}

module.exports = { resolveTurn, evaluateEnd, leaderOf };
