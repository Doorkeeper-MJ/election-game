/* ============================================================
   sweep-momentum.js — race-dynamics knob sweep

   Grid over MOM_WIN_GAIN x MOM_SHUTOUT_BLEED with the calibration
   knobs FROZEN at approved values. Reports per cell:
   Trump win % | Cruz share of upsets | Trump delegate share %.
   Mutates the shared config in-memory only; config.js untouched.

   Usage:  node sweep-momentum.js [nRuns] [seed]
   ============================================================ */

const CFG = require("./config.js");
const { runPrimary } = require("./engine.js");
const { cycle2016, candidates2016, calendar2016 } = require("./data-2016.js");

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
const totalDelegates = calendar2016.reduce((s, c) => s + c.delegates, 0);

function batch() {
    const rng = mulberry32(seed);
    let trumpWins = 0;
    let trumpDels = 0;
    let upsets = 0;
    let cruzUpsets = 0;
    for (let i = 0; i < nRuns; i++) {
        const result = runPrimary(candidates2016, calendar2016, cycle2016, rng);
        if (result[0].name === "Donald Trump") trumpWins++;
        else { upsets++; if (result[0].name === "Ted Cruz") cruzUpsets++; }
        trumpDels += result.find(c => c.name === "Donald Trump").delegates;
    }
    return {
        winPct: 100 * trumpWins / nRuns,
        cruzUpsetPct: upsets === 0 ? null : 100 * cruzUpsets / upsets,
        trumpShare: 100 * (trumpDels / nRuns) / totalDelegates
    };
}

const GAIN_GRID = [48, 56, 64, 72];   // MOM_UPSET_GAIN
const BLEED_GRID = [42, 50, 58, 66];  // MOM_LEADER_BLEED

console.log(`Momentum sweep: ${nRuns} runs/cell, seed ${seed}. Cells: Trump win% | Cruz%-of-upsets | Trump share%`);
console.log(`Calibration knobs frozen: AUTH ${CFG.AUTH_MIN}-${CFG.AUTH_MAX}, CALIB_SCALE ${CFG.CALIB_SCALE}. Target: win 75-85%.`);
console.log("");
console.log(["GAIN \\ BLEED", ...BLEED_GRID.map(b => String(b).padStart(18))].join(" "));
for (const gain of GAIN_GRID) {
    CFG.MOM_UPSET_GAIN = gain;
    const cells = [];
    for (const bleed of BLEED_GRID) {
        CFG.MOM_LEADER_BLEED = bleed;
        const r = batch();
        const cruz = r.cruzUpsetPct === null ? "n/a" : r.cruzUpsetPct.toFixed(0) + "%";
        cells.push(`${r.winPct.toFixed(0)}% | ${cruz} | ${r.trumpShare.toFixed(1)}`.padStart(18));
    }
    console.log(`${String(gain).padEnd(12)} ${cells.join(" ")}`);
}
