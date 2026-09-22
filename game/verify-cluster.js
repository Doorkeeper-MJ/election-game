/* ============================================================
   verify-cluster.js — GATE D: the cluster's own acceptance gate
   (v2 step 0 — spec "04 SPEC — The Cluster" §1.3).

   Five assertions. Each prints PASS / FAIL, or PASS (vacuous) where the
   subsystem it guards has not been built yet — the assertion is written
   and running, it just has nothing to bite on until its step lands.
   A vacuous pass is printed as such so it can never be mistaken for a
   live one. Any FAIL exits 1.

   1  PROFILE ISOLATION — a frozen-2016 game (and a game with NO profile
      argument, which must default to frozen-2016) reproduces Gate A's
      numbers digit-for-digit with the cluster code present. At the
      default seed the expected numbers are hard-coded (Trump 1327 /
      Cruz 978 / Carson 150 / Rubio 16) so a drift in runPrimary itself
      would also be caught.
      + STEP-0 INERTNESS — a v2-2016 game produces the SAME numbers,
      because no flag has a consumer yet. RETIRE THIS SUB-CHECK AT STEP 2
      (dropouts) — from then on v2-2016 is expected to differ.

   2  STREAM INDEPENDENCE — drawing any number of times from the event
      and opponent streams before a turn moves ZERO contest results in
      that turn or any later one; the contest stream is byte-identical
      to mulberry32(seed).

   3  COUNTERFACTUAL HONESTY — dice.event(t) and dice.opponent(t) are
      pure functions of (seed, t): two calls yield identical sequences
      (so a shadow run fires the identical event), different turns /
      purposes / seeds yield different sequences, and a non-integer turn
      is refused. Plus the Slice 2 no-op invariant still holds under
      v2-2016 (zero-move season -> zero deltas).

   4  DROPOUT CONSERVATION — total field polling is conserved across the
      season (redistribution must sum to what left, +/-0.01). VACUOUS
      until step 2: no candidate exits today, so the sum cannot move.

   5  NO OPPONENT RESOURCE CHEAT — every opponent move on a turn result
      spends <= EFFORT_POOL effort and <= 1 emphasis axis, the same pools
      the player has. VACUOUS until step 4: no result carries opponent
      moves today.

   Usage:  node verify-cluster.js [seed]   (default 20160201)
   Exit 0 = PASS, 1 = FAIL.
   ============================================================ */

const { runPrimary } = require("../model/engine.js");
const { candidates2016, calendar2016, cycle2016 } = require("../model/data-2016.js");
const { mulberry32 } = require("./src/rng.js");
const { makeDice, deriveSeed } = require("./src/dice.js");
const PROFILES = require("./src/profiles.js");
const { newGame } = require("./src/gameState.js");
const { resolveTurn } = require("./src/turnLoop.js");
const CFG = require("./src/config-play.js");

const SEED = parseInt(process.argv[2], 10) || 20160201;
const DEFAULT_SEED = 20160201;
let pass = true;
const fails = [];
function check(cond, label) { if (!cond) { pass = false; fails.push(label); } return cond; }
function verdict(ok, msgPass, msgFail) { console.log(ok ? `  PASS — ${msgPass}` : `  FAIL — ${msgFail || msgPass}`); }

function finalTable(field) {
    return field.map(c => ({ name: c.name, delegates: c.delegates }))
        .sort((x, y) => x.name.localeCompare(y.name));
}
function sameTable(a, b) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
        if (a[i].name !== b[i].name || a[i].delegates !== b[i].delegates) return false;
    }
    return true;
}
function playNoMoves(profileName) {
    const g = newGame("R16-2", SEED, profileName);
    while (g.turnIndex < g.turns.length) resolveTurn(g, null);
    return g;
}
function fmt(tbl) {
    return tbl.filter(r => r.delegates > 0).map(r => `${r.name.split(" ").pop()} ${r.delegates}`).join(" / ");
}

// ================= 1. PROFILE ISOLATION =================
console.log(`1) PROFILE ISOLATION — frozen-2016 reproduces Gate A with the cluster code present (seed ${SEED}):`);
const ref = finalTable(runPrimary(candidates2016, calendar2016, cycle2016, mulberry32(SEED)));

const gDefault = playNoMoves(undefined);
const defaultIsFrozen = gDefault.profile.name === "frozen-2016" && PROFILES.DEFAULT_PROFILE === "frozen-2016";
check(defaultIsFrozen, "newGame() without a profile did not default to frozen-2016");
console.log(`  newGame() with no profile -> "${gDefault.profile.name}"`);
verdict(defaultIsFrozen, "the default profile is frozen-2016 (pre-v2 callers stay pinned to Gate A's world).",
    "default profile is not frozen-2016");

const gFrozen = playNoMoves("frozen-2016");
const frozenTbl = finalTable(gFrozen.field);
const frozenOk = sameTable(ref, frozenTbl) && sameTable(ref, finalTable(gDefault.field));
check(frozenOk, "frozen-2016 no-move season diverged from runPrimary");
console.log(`  runPrimary:   ${fmt(ref)}`);
console.log(`  frozen-2016:  ${fmt(frozenTbl)}`);
verdict(frozenOk, "digit-for-digit identical (explicit frozen-2016 AND default).", "diverged from runPrimary");

if (SEED === DEFAULT_SEED) {
    const expected = { "Donald Trump": 1327, "Ted Cruz": 978, "Ben Carson": 150, "Marco Rubio": 16 };
    let hardOk = true;
    for (const r of frozenTbl) {
        const want = expected[r.name] || 0;
        if (r.delegates !== want) hardOk = false;
    }
    check(hardOk, "frozen-2016 at seed 20160201 does not match the recorded Gate A numbers");
    verdict(hardOk, "matches the recorded Gate A baseline: Trump 1327 / Cruz 978 / Carson 150 / Rubio 16, rest 0.",
        "does not match Trump 1327 / Cruz 978 / Carson 150 / Rubio 16");
}

// STEP-0 INERTNESS — retire at step 2.
const gV2 = playNoMoves("v2-2016");
const v2Tbl = finalTable(gV2.field);
const inertOk = sameTable(ref, v2Tbl) && gV2.profile.name === "v2-2016";
check(inertOk, "v2-2016 differs from frozen-2016 at step 0 — a flag has a consumer that should not exist yet");
console.log(`  v2-2016:      ${fmt(v2Tbl)}`);
verdict(inertOk, "STEP-0 INERTNESS — v2-2016 == frozen-2016 (no flag has a consumer yet). RETIRE THIS SUB-CHECK AT STEP 2.",
    "v2-2016 diverged at step 0");

// Flags declared as the spec table says.
const fz = PROFILES.getProfile("frozen-2016"), v2 = PROFILES.getProfile("v2-2016");
const flagNames = ["money", "dropouts", "momentumBrake", "events", "opponentMoves"];
const flagsOk = flagNames.every(f => fz[f] === false && v2[f] === true)
    && Object.isFrozen(fz) && Object.isFrozen(v2);
check(flagsOk, "profile flag table is not frozen-all-off / v2-all-on, or profiles are mutable");
verdict(flagsOk, `flags ${flagNames.join("/")}: frozen-2016 all off, v2-2016 all on; both objects frozen.`,
    "flag table wrong or mutable");
let unknownRefused = false;
try { PROFILES.getProfile("v3-1976"); } catch (e) { unknownRefused = true; }
check(unknownRefused, "unknown profile name was not refused");
verdict(unknownRefused, "an unknown profile name throws (a typo can never silently change the rules).",
    "unknown profile accepted");
console.log("");

// ================= 2. STREAM INDEPENDENCE =================
console.log(`2) STREAM INDEPENDENCE — event/opponent draws move zero contest dice (seed ${SEED}):`);
const A = newGame("R16-2", SEED, "v2-2016");
const B = newGame("R16-2", SEED, "v2-2016");
let contestsCompared = 0, contestMismatch = 0, sideDraws = 0;
while (A.turnIndex < A.turns.length) {
    const t = B.turnIndex;
    // Game B burns a varying number of event + opponent draws before the turn —
    // the exact thing steps 3 and 4 will do. Game A burns none.
    const k = (t % 5) + 1;
    const ev = B.dice.event(t), op = B.dice.opponent(t);
    for (let i = 0; i < k; i++) { ev(); op(); sideDraws += 2; }
    const ra = resolveTurn(A, null), rb = resolveTurn(B, null);
    for (let i = 0; i < ra.contests.length; i++) {
        contestsCompared++;
        if (JSON.stringify(ra.contests[i].awards) !== JSON.stringify(rb.contests[i].awards)) contestMismatch++;
    }
}
const indepOk = contestMismatch === 0 && sameTable(ref, finalTable(B.field));
check(indepOk, "side-stream draws moved a contest result");
console.log(`  ${sideDraws} event/opponent draws injected across ${A.turns.length} turns · ${contestsCompared} contests compared · mismatches: ${contestMismatch}`);
verdict(indepOk, "every contest identical with and without side draws; B still equals runPrimary.",
    "a side-stream draw changed a contest");

// contest stream == mulberry32(seed), byte-for-byte
const DRAWS = 2000;
let identOk = true;
for (const s of [SEED, 1, 123456789, 4294967295]) {
    const d = makeDice(s).contest, m = mulberry32(s);
    for (let i = 0; i < DRAWS; i++) if (d() !== m()) { identOk = false; break; }
    if (!identOk) break;
}
check(identOk, "dice.contest is not byte-identical to mulberry32(seed)");
verdict(identOk, `dice.contest byte-identical to mulberry32(seed) over ${4 * DRAWS} draws (4 seeds) — the master seed still means what it always meant.`,
    "dice.contest drifted from mulberry32(seed)");
// alias intact
const gAlias = newGame("R16-2", SEED);
check(gAlias.rng === gAlias.dice.contest, "game.rng is not the same object as game.dice.contest");
verdict(gAlias.rng === gAlias.dice.contest, "game.rng is an alias of game.dice.contest (same object) — nothing that read it breaks.",
    "game.rng alias broken");
console.log("");

// ================= 3. COUNTERFACTUAL HONESTY =================
console.log(`3) COUNTERFACTUAL HONESTY — per-turn streams are pure functions of (seed, turn):`);
const SEQ = 1000;
function seq(gen, n) { const out = []; for (let i = 0; i < n; i++) out.push(gen()); return out; }
function sameSeq(a, b) { if (a.length !== b.length) return false; for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false; return true; }

let replayOk = true, distinctOk = true, turnsChecked = 0;
const dice1 = makeDice(SEED), dice2 = makeDice(SEED), diceOther = makeDice((SEED + 1) >>> 0);
for (let t = 0; t < 22; t++) {
    turnsChecked++;
    const e1 = seq(dice1.event(t), SEQ), e2 = seq(dice2.event(t), SEQ);
    const o1 = seq(dice1.opponent(t), SEQ), o2 = seq(dice2.opponent(t), SEQ);
    if (!sameSeq(e1, e2) || !sameSeq(o1, o2)) replayOk = false;                 // same (seed,t) -> same stream
    if (sameSeq(e1, o1)) distinctOk = false;                                     // event != opponent at same t
    if (sameSeq(e1, seq(dice1.event(t + 1), SEQ))) distinctOk = false;           // t != t+1
    if (sameSeq(e1, seq(diceOther.event(t), SEQ))) distinctOk = false;           // seed != seed+1
    if (sameSeq(e1, seq(mulberry32(SEED), SEQ))) distinctOk = false;             // side stream != contest stream
}
check(replayOk, "event/opponent stream not reproducible from (seed, turn)");
check(distinctOk, "event/opponent streams collide across turn, purpose, or seed");
console.log(`  ${turnsChecked} turns x ${SEQ} draws, two independent dice objects at the same seed`);
verdict(replayOk, "identical sequences on replay — a shadow run fires the identical event.", "replay mismatch");
verdict(distinctOk, "distinct across turn / purpose / seed, and distinct from the contest stream.", "stream collision");

// deriveSeed determinism + refusal of a shared (turnless) stream
const dOk = deriveSeed(SEED, "event", 3) === deriveSeed(SEED, "event", 3)
    && deriveSeed(SEED, "event", 3) !== deriveSeed(SEED, "event", 4)
    && deriveSeed(SEED, "event", 3) !== deriveSeed(SEED, "opp", 3);
let refused = 0;
for (const bad of [undefined, null, -1, 1.5, "3"]) { try { makeDice(SEED).event(bad); } catch (e) { refused++; } }
check(dOk, "deriveSeed not deterministic/distinct");
check(refused === 5, "dice.event accepted a non-integer or missing turn index");
verdict(dOk && refused === 5, "deriveSeed deterministic; event()/opponent() refuse a missing, negative or fractional turn (5/5 refused) — a stream can never be shared across turns by accident.",
    `deriveSeed ok=${dOk}, refusals=${refused}/5`);

// Slice 2 no-op invariant under v2-2016
const gNoop = newGame("R16-2", SEED, "v2-2016");
let badDeltas = 0, flips = 0, nContests = 0;
while (gNoop.turnIndex < gNoop.turns.length) {
    const r = resolveTurn(gNoop, null);
    for (const c of r.contests) { nContests++; for (const d of c.effect.deltas) if (d.delta !== 0) badDeltas++; if (c.effect.flipped) flips++; }
}
const noopOk = badDeltas === 0 && flips === 0;
check(noopOk, "zero-move season under v2-2016 produced a nonzero counterfactual delta");
verdict(noopOk, `Slice 2 no-op invariant holds under v2-2016: ${nContests} contests, 0 deltas, 0 flips.`, `deltas=${badDeltas} flips=${flips}`);
console.log("");

// ================= 4. DROPOUT CONSERVATION =================
console.log(`4) DROPOUT CONSERVATION — field polling is conserved across the season (+/-0.01):`);
let consOk = true, exits = 0;
for (const prof of ["frozen-2016", "v2-2016"]) {
    const g = newGame("R16-2", SEED, prof);
    const before = g.field.reduce((s, c) => s + c.polling, 0);
    const n0 = g.field.length;
    while (g.turnIndex < g.turns.length) resolveTurn(g, null);
    const after = g.field.reduce((s, c) => s + c.polling, 0);
    const active = g.field.filter(c => c.active !== false).length;   // step 2 will mark exits
    exits += n0 - active;
    if (Math.abs(before - after) > 0.01) consOk = false;
    console.log(`  ${prof.padEnd(12)} polling sum before ${before.toFixed(2)} · after ${after.toFixed(2)} · exits ${n0 - active}`);
}
check(consOk, "field polling not conserved");
if (consOk && exits === 0) console.log("  PASS (vacuous) — 0 dropouts occurred; conservation held trivially. LIVE AT STEP 2.");
else verdict(consOk, `conserved across ${exits} exits.`, "polling leaked or was created");
console.log("");

// ================= 5. NO OPPONENT RESOURCE CHEAT =================
console.log(`5) NO OPPONENT RESOURCE CHEAT — opponents draw from the player's pools (EFFORT_POOL ${CFG.EFFORT_POOL}, one emphasis axis):`);
const gOpp = newGame("R16-2", SEED, "v2-2016");
let oppMoves = 0, cheats = 0;
while (gOpp.turnIndex < gOpp.turns.length) {
    const r = resolveTurn(gOpp, null);
    const om = r.opponentMoves || {};            // step 4 will populate { [candidateId]: { effort:{state:pts}, emphasis } }
    for (const id of Object.keys(om)) {
        oppMoves++;
        const mv = om[id] || {};
        const spent = Object.values(mv.effort || {}).reduce((s, v) => s + v, 0);
        const axes = mv.emphasis == null ? 0 : (Array.isArray(mv.emphasis) ? mv.emphasis.length : 1);
        if (spent > CFG.EFFORT_POOL || axes > 1) cheats++;
    }
}
check(cheats === 0, "an opponent spent more than the player's pools");
if (oppMoves === 0) console.log("  PASS (vacuous) — no result carries opponent moves yet. LIVE AT STEP 4.");
else verdict(cheats === 0, `${oppMoves} opponent moves, 0 over the pool.`, `${cheats} opponent moves exceeded the player's pools`);
console.log("");

if (!pass) { console.log("Failures:"); for (const f of fails) console.log("  - " + f); console.log(""); }
console.log(pass ? "GATE D (CLUSTER): PASS" : "GATE D (CLUSTER): FAIL");
process.exit(pass ? 0 : 1);
