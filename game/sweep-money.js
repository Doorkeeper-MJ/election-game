/* ============================================================
   sweep-money.js — balance sweep for the v2 step-1 war-chest lever.
   (Play-layer tooling, same pattern as sweep-emphasis.js; engine frozen;
   config-play.js unchanged by running this. Profile v2-2016 for the money
   rows, frozen-2016 for the baselines — same seeds, same strategies.)

   Rows, N seeds each:
     Cruz  A  hands-off, frozen                (the 18% baseline)
     Cruz  B  effort-only, frozen              (the 36% baseline)
     Cruz  C  effort + max money, v2           (does money ADD agency without a blowout?)
     Cruz  D  effort + emphasis, frozen        (the 41% baseline)
     Cruz  E  effort + emphasis + max money, v2
     Jeb   F  hands-off, frozen
     Jeb   G  effort + emphasis + MAX money, v2   <- council guard 2: "Jeb still loses"
     Trump H  effort + emphasis + max money, v2   (the favorite with money: no runaway?)

   "Max money" = buy MONEY_MAX_EXTRA_PER_TURN every turn while cash lasts;
   effort spread across today's biggest states, at most MAX_PER_STATE each.

   Usage: node sweep-money.js [seeds]   (default 200)
   ============================================================ */

const { newGame } = require("./src/gameState.js");
const { resolveTurn } = require("./src/turnLoop.js");
const { cycle2016 } = require("../model/data-2016.js");
const CFG = require("./src/config-play.js");
const moneyLever = require("./src/levers/moneyLever.js");

const SEEDS = parseInt(process.argv[2], 10) || 200;
// Tuning overrides for the sweep ONLY (config-play.js on disk is never touched):
//   MONEY_COST=2 MONEY_MAX=4 node sweep-money.js 200
if (process.env.MONEY_COST) CFG.MONEY_COST_PER_EFFORT = parseInt(process.env.MONEY_COST, 10);
if (process.env.MONEY_MAX) CFG.MONEY_MAX_EXTRA_PER_TURN = parseInt(process.env.MONEY_MAX, 10);
const BASE = 20160000;
const MAX_PER_STATE = Math.floor(CFG.MAX_POLL_BUMP / CFG.POLL_BUMP_PER_EFFORT);

function weakestAxis(p) {
    let axis = 0, worst = -1;
    for (let a = 0; a < p.calib.issues.length; a++) {
        const gap = Math.abs(p.calib.issues[a] - cycle2016.mood[a]);
        if (gap > worst) { worst = gap; axis = a; }
    }
    return axis;
}

// Spread `pool` points over the biggest states, MAX_PER_STATE each.
function spread(turn, pool) {
    const effort = {};
    const states = turn.contests.slice().sort((a, b) => b.delegates - a.delegates);
    let left = pool;
    for (const c of states) {
        if (left <= 0) break;
        const pts = Math.min(MAX_PER_STATE, left);
        effort[c.state] = pts; left -= pts;
    }
    return effort;
}

function season(playerId, seed, opts) {
    const g = newGame(playerId, seed, opts.money ? "v2-2016" : "frozen-2016");
    while (g.turnIndex < g.turns.length) {
        const turn = g.turns[g.turnIndex];
        const p = g.field.find(c => c.id === g.playerId);
        let moves = null;
        if (opts.effort || opts.emphasis || opts.money) {
            const spend = opts.money ? CFG.MONEY_MAX_EXTRA_PER_TURN : 0;   // ask for the max; the lever sells only what today's ballot can absorb
            const pool = moneyLever.poolFor(g, p, spend);
            moves = {
                effort: opts.effort ? spread(turn, pool) : {},
                emphasis: opts.emphasis ? weakestAxis(p) : null,
                spend: spend
            };
        }
        resolveTurn(g, moves);
    }
    const sorted = g.field.slice().sort((a, b) => b.delegates - a.delegates);
    const me = g.field.find(c => c.id === playerId);
    return { won: sorted[0].id === playerId, dels: me.delegates, cash: me.cash, winner: sorted[0].name };
}

const rows = [
    ["Cruz  A hands-off (frozen)          ", "R16-2", {}],
    ["Cruz  B effort-only (frozen)        ", "R16-2", { effort: true }],
    ["Cruz  C effort + money (v2)         ", "R16-2", { effort: true, money: true }],
    ["Cruz  D effort + emphasis (frozen)  ", "R16-2", { effort: true, emphasis: true }],
    ["Cruz  E effort+emphasis+money (v2)  ", "R16-2", { effort: true, emphasis: true, money: true }],
    ["Jeb   F hands-off (frozen)          ", "R16-5", {}],
    ["Jeb   G effort+emphasis+MAX money   ", "R16-5", { effort: true, emphasis: true, money: true }],
    ["Trump H effort+emphasis+money (v2)  ", "R16-1", { effort: true, emphasis: true, money: true }]
];

console.log(`sweep-money — ${SEEDS} seeds · COST ${CFG.MONEY_COST_PER_EFFORT} · MAX_EXTRA/turn ${CFG.MONEY_MAX_EXTRA_PER_TURN} · per-state cap ${MAX_PER_STATE}`);
const out = {};
for (const [label, pid, opts] of rows) {
    let wins = 0, dels = 0, cash = 0; const winners = {};
    for (let i = 0; i < SEEDS; i++) {
        const r = season(pid, BASE + i, opts);
        if (r.won) wins++;
        dels += r.dels; cash += r.cash;
        winners[r.winner] = (winners[r.winner] || 0) + 1;
    }
    const modal = Object.entries(winners).sort((a, b) => b[1] - a[1])[0];
    out[label.trim()] = { win: 100 * wins / SEEDS, dels: dels / SEEDS, cash: cash / SEEDS, modal: modal[0] };
    console.log(`${label} win ${(100 * wins / SEEDS).toFixed(1).padStart(5)}%   avg dels ${(dels / SEEDS).toFixed(0).padStart(4)}   cash left ${(cash / SEEDS).toFixed(1).padStart(5)}   modal winner ${modal[0]} (${modal[1]})`);
}
