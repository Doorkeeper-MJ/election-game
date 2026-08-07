/* ============================================================
   sim2016.js — headless 2016 GOP primary batch validator

   JS equivalent of the VBA Sim2016GOPBatch: replays the 2016
   GOP primary N times and reports Trump win frequency, delegate
   spread, margin stats, and the upset table.

   Usage:  node sim2016.js [nRuns] [seed]
   Default: 200 runs, seed 20160201 (reproducible).
   ============================================================ */

const { computeCalibScore, runPrimary } = require("./engine.js");
const { cycle2016, candidates2016, calendar2016 } = require("./data-2016.js");

// Seeded RNG (mulberry32) so every batch is exactly reproducible.
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

const nRuns = parseInt(process.argv[2], 10) || 200;
const seed = parseInt(process.argv[3], 10) || 20160201;
const rng = mulberry32(seed);

const totalDelegates = calendar2016.reduce((s, c) => s + c.delegates, 0);
const clinch = cycle2016.delegatesToClinch;

console.log("=== 2016 GOP PRIMARY — BATCH VALIDATION ===");
console.log(`runs=${nRuns} seed=${seed} contests=${calendar2016.length} totalDelegates=${totalDelegates} clinch=${clinch}`);
console.log("");

// Static calib scores (they don't vary by contest) — print once.
console.log("Calib scores (alignment x bounded authenticity + resume bonus):");
for (const c of candidates2016) {
    console.log(`  ${c.name.padEnd(16)} calib=${computeCalibScore(c, cycle2016).toFixed(2)}  polling=${c.polling}`);
}
console.log("");

const runs = [];
const winCounts = {};
const delegateSums = {};
for (const c of candidates2016) { winCounts[c.name] = 0; delegateSums[c.name] = 0; }

for (let i = 1; i <= nRuns; i++) {
    const result = runPrimary(candidates2016, calendar2016, cycle2016, rng);
    const winner = result[0];
    const runnerUp = result[1];
    winCounts[winner.name]++;
    for (const c of result) delegateSums[c.name] += c.delegates;
    runs.push({
        run: i,
        winner: winner.name,
        winnerDels: winner.delegates,
        runnerUp: runnerUp.name,
        runnerUpDels: runnerUp.delegates,
        margin: winner.delegates - runnerUp.delegates,
        clinched: winner.delegates >= clinch
    });
}

// ---- Report ----
console.log("Wins by candidate:");
Object.entries(winCounts)
    .filter(([, n]) => n > 0)
    .sort((a, b) => b[1] - a[1])
    .forEach(([name, n]) => {
        console.log(`  ${name.padEnd(16)} ${String(n).padStart(4)}  (${(100 * n / nRuns).toFixed(1)}%)`);
    });
console.log("");

const trumpRuns = runs.filter(r => r.winner === "Donald Trump");
if (trumpRuns.length > 0) {
    const dels = trumpRuns.map(r => r.winnerDels);
    const margins = trumpRuns.map(r => r.margin);
    const avg = arr => arr.reduce((s, x) => s + x, 0) / arr.length;
    console.log("Trump (when winning):");
    console.log(`  delegates  min=${Math.min(...dels)} avg=${Math.round(avg(dels))} max=${Math.max(...dels)}  (of ${totalDelegates})`);
    console.log(`  margin     min=${Math.min(...margins)} avg=${Math.round(avg(margins))} max=${Math.max(...margins)}`);
    console.log(`  clinched >=${clinch}: ${trumpRuns.filter(r => r.clinched).length}/${trumpRuns.length}`);
    console.log("");
}

console.log("Average delegates per candidate (all runs):");
Object.entries(delegateSums)
    .sort((a, b) => b[1] - a[1])
    .forEach(([name, sum]) => {
        const avgDels = sum / nRuns;
        console.log(`  ${name.padEnd(16)} ${String(Math.round(avgDels)).padStart(5)}  (${(100 * avgDels / totalDelegates).toFixed(1)}%)`);
    });
console.log("");

const upsets = runs.filter(r => r.winner !== "Donald Trump");
console.log(`Upsets (non-Trump winners): ${upsets.length}`);
for (const u of upsets.slice(0, 15)) {
    console.log(`  run ${String(u.run).padStart(3)}: ${u.winner} ${u.winnerDels} over ${u.runnerUp} ${u.runnerUpDels} (margin ${u.margin})`);
}
if (upsets.length > 15) console.log(`  ... and ${upsets.length - 15} more`);

// ---- Gate check (frequency target + ordering) ----
const trumpPct = 100 * winCounts["Donald Trump"] / nRuns;
const cruzUpsets = upsets.filter(r => r.winner === "Ted Cruz").length;
const cruzRunnerUp = runs.filter(r => r.runnerUp === "Ted Cruz" || r.winner === "Ted Cruz").length;
console.log("");
console.log("GATE:");
console.log(`  Trump win %           ${trumpPct.toFixed(1)}%  (target 75-85)`);
console.log(`  Upset breakdown       ${upsets.length === 0 ? "none" : Object.entries(upsets.reduce((m, r) => (m[r.winner] = (m[r.winner] || 0) + 1, m), {})).map(([n, c]) => `${n} ${c}`).join(", ")}`);
console.log(`  Cruz majority of upsets: ${upsets.length === 0 ? "n/a" : (cruzUpsets > upsets.length / 2 ? "YES" : "NO")}`);
console.log(`  Cruz 1st-or-2nd       ${cruzRunnerUp}/${nRuns} runs`);

// Historical reference line for the WTA assessment
console.log("");
console.log(`History (actual 2016): Trump 1,441 of 2,472 (58.3%) — Cruz 551, Rubio 173, Kasich 161.`);
