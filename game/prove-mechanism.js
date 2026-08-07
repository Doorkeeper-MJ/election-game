/* ============================================================
   prove-mechanism.js — PROVE the viability-redistribution mechanism
   before any tuning. Read-only on model/; changes no config.

   Claim under test: a bounded polling bump to Cruz (the #2) knocks
   weak candidates below the engine's 15% viability threshold, so they
   get ZERO and their delegates redistribute proportionally among the
   survivors — with Trump, the largest, scooping most. Net: the lever
   feeds the leader, not the player.

   Method:
   1) Replicate awardDelegates' scoring EXACTLY and validate it equals
      the frozen engine over many random contests (so the rand=0 tables
      below are trustworthy).
   2) Show the expected-value (rand=0) viability table for real pre-
      states (Iowa = fresh field; Texas = captured mid-race), unbumped
      vs Cruz +max-effort-bump. Mark the 15% line and the redistribution.
   ============================================================ */

const engine = require("../model/engine.js");
const ECFG = require("../model/config.js");           // frozen engine weights
const { candidates2016, calendar2016, cycle2016 } = require("../model/data-2016.js");
const { mulberry32 } = require("./src/rng.js");
const PCFG = require("./src/config-play.js");          // play-layer knobs (read only here)

const MAXBUMP = Math.min(PCFG.EFFORT_POOL * PCFG.POLL_BUMP_PER_EFFORT, PCFG.MAX_POLL_BUMP);

function cloneField() { return candidates2016.map(c => ({ ...c, momentum: 0, delegates: 0 })); }

// Score exactly as engine.awardDelegates does (per-candidate).
function score(cand, polling, momentum, rand) {
    const calib = engine.computeCalibScore(cand, cycle2016);
    return Math.max(0.1,
        polling * ECFG.W_POLL +
        momentum * ECFG.W_MOMENTUM +
        calib * ECFG.W_ISSUE * ECFG.CALIB_SCALE +
        rand * ECFG.W_RANDOM * 20);
}

// Full replication of awardDelegates (for validation).
function replicateAward(totalDel, field, rng) {
    const scored = field.map(c => ({ cand: c, s: score(c, c.polling, c.momentum, (rng() - 0.5) * 10) }));
    const totalScore = scored.reduce((a, x) => a + x.s, 0);
    const viable = scored.filter(x => totalScore > 0 && x.s / totalScore >= ECFG.VIABILITY);
    const viableTotal = viable.reduce((a, x) => a + x.s, 0);
    const awards = [];
    for (const x of viable) { if (viableTotal <= 0) break; awards.push({ name: x.cand.name, delegates: Math.round(totalDel * x.s / viableTotal) }); }
    return awards;
}

// ---- 1) VALIDATE replication == frozen engine ----
let valOk = true, valN = 0;
for (let t = 0; t < 300 && valOk; t++) {
    const seed = 1000 + t;
    const f1 = cloneField(), f2 = cloneField();
    const r0 = mulberry32(seed);
    for (let i = 0; i < f1.length; i++) {
        const m = (r0() - 0.5) * 200;
        const dp = (r0() - 0.5) * 20;
        f1[i].momentum = f2[i].momentum = m;
        f1[i].polling = f2[i].polling = Math.max(0.5, f1[i].polling + dp);
    }
    const totalDel = 20 + Math.floor(r0() * 150);
    const rngSeed = (seed ^ 0x9e3779b9) >>> 0;
    const eAwards = engine.awardDelegates(totalDel, f1, cycle2016, mulberry32(rngSeed));
    const rAwards = replicateAward(totalDel, f2, mulberry32(rngSeed));
    valN++;
    if (eAwards.length !== rAwards.length) valOk = false;
    else for (let i = 0; i < eAwards.length; i++) {
        if (eAwards[i].name !== rAwards[i].name || eAwards[i].delegates !== rAwards[i].delegates) valOk = false;
    }
}
console.log(`REPLICATION CHECK: ${valOk ? "PASS" : "FAIL"} — replicate == frozen engine awardDelegates over ${valN} random contests.`);
console.log(`(So the rand=0 expected-value tables below are trustworthy.)`);

// ---- capture a real mid-race pre-state from a no-move baseline ----
function capturePreState(targetState, seed) {
    const field = cloneField();
    const rng = mulberry32(seed);
    for (const contest of calendar2016) {
        if (contest.state === targetState) return field.map(c => ({ ...c }));
        engine.processContestMomentum(field, engine.awardDelegates(contest.delegates, field, cycle2016, rng));
    }
    return field.map(c => ({ ...c }));
}

// ---- 2) expected-value (rand=0) viability table ----
function showContest(label, field, totalDel, bump) {
    const f = field.map(c => ({ ...c }));
    if (bump) { const cruz = f.find(c => c.id === "R16-2"); cruz.polling += bump; }
    const scored = f.map(c => ({ name: c.name, s: score(c, c.polling, c.momentum, 0) }));
    const totalScore = scored.reduce((a, x) => a + x.s, 0);
    const rows = scored.map(x => ({ name: x.name, s: x.s, sharePct: 100 * x.s / totalScore, viable: x.s / totalScore >= ECFG.VIABILITY }));
    const viableTotal = rows.filter(r => r.viable).reduce((a, r) => a + r.s, 0);
    rows.forEach(r => r.dels = r.viable ? Math.round(totalDel * r.s / viableTotal) : 0);
    rows.sort((a, b) => b.s - a.s);
    console.log(`\n${label}${bump ? `  [Cruz polling +${bump}]` : "  [unbumped]"}  totalDel=${totalDel}`);
    for (const r of rows) {
        console.log(`   ${r.viable ? "  " : "x "}${r.name.padEnd(15)} share ${r.sharePct.toFixed(1).padStart(5)}%  ${r.viable ? "viable" : "BELOW 15%"}  -> ${String(r.dels).padStart(3)} del`);
    }
    return rows;
}

function delOf(rows, name) { const r = rows.find(x => x.name === name); return r ? r.dels : 0; }

function report(label, field, totalDel) {
    console.log(`\n================ ${label} ================`);
    const a = showContest(label, field, totalDel, 0);
    const b = showContest(label, field, totalDel, MAXBUMP);
    const dCruz = delOf(b, "Ted Cruz") - delOf(a, "Ted Cruz");
    const dTrump = delOf(b, "Donald Trump") - delOf(a, "Donald Trump");
    const droppedOut = a.filter(r => r.viable).map(r => r.name)
        .filter(n => { const r = b.find(x => x.name === n); return r && !r.viable; });
    console.log(`   => bump effect: Cruz ${dCruz >= 0 ? "+" : ""}${dCruz} del, Trump ${dTrump >= 0 ? "+" : ""}${dTrump} del; knocked below 15%: ${droppedOut.length ? droppedOut.join(", ") : "none"}`);
}

report("IOWA (fresh field, momentum 0)", cloneField(), 30);
report("TEXAS (real mid-race pre-state, seed 20160201)", capturePreState("Texas", 20160201), 155);
