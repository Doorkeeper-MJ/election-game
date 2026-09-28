/* ============================================================
   moneyLever.js — "War chest" (v2 step 1, spec §2.5).

   Money buys EFFORT, never polling. Each turn the player may buy up to
   MONEY_MAX_EXTRA_PER_TURN extra effort points at MONEY_COST_PER_EFFORT
   cash each, drawn down from a finite pot (cand.cash, seeded from the
   frozen data's `funds`). The bought points enter the SAME effort pool
   the campaign lever already spends, so money is routed through the
   player's judgment (where to campaign) and through the existing
   per-state cap (MAX_POLL_BUMP) by construction — the council's
   unanimous constraint (2026-09-28 run): capacity, capped, never polling.

   Two guards from that run:
     1. per-turn spend ceiling            -> MONEY_MAX_EXTRA_PER_TURN
     2. "a badly run Jeb still loses"     -> Gate D check 6 (verify-cluster.js)

   And one consequence of the per-state cap, made explicit here so the
   player can never buy points the ballot cannot absorb: the lever only
   sells what TODAY'S states can take. On a one-state day the base pool
   already covers the cap, so there is nothing to buy and cash is kept.
   Money buys REACH across states, never a bigger hammer in one. (Found
   in the first sweep: a naive max-spend strategy burned Cruz's whole
   chest on three single-state days before Super Tuesday, for nothing.)

   Profile-gated: under frozen-2016 (profile.money false) nothing here
   runs — pool is the base pool and cash never moves — so Gate A and every
   pre-v2 sweep are untouched. Opponents' cash is not spent at step 1;
   step 2 reads it (dropout trigger) and step 4 spends it (opponent moves).

   moves.spend = number of EXTRA effort points the player asks for this
   turn (an integer >= 0). Not cash — points. The UI shows the cost.
   ============================================================ */

const CFG = require("../config-play.js");

const MAX_PER_STATE = Math.floor(CFG.MAX_POLL_BUMP / CFG.POLL_BUMP_PER_EFFORT);

function enabled(game) {
    return !!(game && game.profile && game.profile.money);
}

// How many extra points today's ballot can absorb beyond the base pool.
function capacityFor(game) {
    const turn = game && game.turns ? game.turns[game.turnIndex] : null;
    if (!turn) return 0;
    return Math.max(0, turn.contests.length * MAX_PER_STATE - CFG.EFFORT_POOL);
}

// How many extra points this candidate could buy right now: the per-turn
// ceiling, the cash on hand, and what today's states can take.
function maxBuyable(game, cand) {
    if (!enabled(game) || !cand) return 0;
    const byCash = Math.floor((cand.cash || 0) / CFG.MONEY_COST_PER_EFFORT);
    return Math.max(0, Math.min(CFG.MONEY_MAX_EXTRA_PER_TURN, byCash, capacityFor(game)));
}

// Points actually bought for a requested spend, clamped. Pure; no deduction.
function boughtFor(game, cand, spend) {
    const want = Math.max(0, Math.floor(Number(spend) || 0));
    return Math.min(want, maxBuyable(game, cand));
}

// The effort pool for this turn: base + bought.
function poolFor(game, cand, spend) {
    return CFG.EFFORT_POOL + boughtFor(game, cand, spend);
}

// Apply the purchase for real: deduct cash, return the receipt. Called
// once per turn by resolveTurn BEFORE contests resolve. Under frozen-2016
// returns a zero receipt and touches nothing.
function apply(game, cand, moves) {
    const spend = moves ? moves.spend : 0;
    const bought = boughtFor(game, cand, spend);
    const spent = bought * CFG.MONEY_COST_PER_EFFORT;
    if (bought > 0) cand.cash -= spent;
    return {
        bought: bought,
        spent: spent,
        pool: CFG.EFFORT_POOL + bought,
        cashAfter: cand ? cand.cash : null
    };
}

module.exports = { enabled, capacityFor, maxBuyable, boughtFor, poolFor, apply, MAX_PER_STATE };
