/* ============================================================
   engine.js — cycle-agnostic primary engine (standalone port)

   Line-for-line port of the calibrated v06 VBA engine
   (GameEngine_FINAL_v06.bas, vault root):
   - computeCalibScore  <- ComputeCalibScore
   - awardDelegates     <- AwardDelegates (the wIssue slot, revived)
   - runPrimary         <- the contests-only loop of Sim2016GOPBatch

   All tuning knobs live in config.js. All cycle data lives in
   data files (e.g. data-2016.js). Nothing here is 2016-specific.

   Rounding note: VBA CInt rounds half-to-even, Math.round rounds
   half-up — sub-delegate noise, not a behavior difference.
   ============================================================ */

const CFG = require("./config.js");

/* Salience-weighted issue alignment vs electorate mood, amplified
   by a BOUNDED authenticity multiplier, plus small additive
   Strength/Competence resume bonuses.
   Returns neutral 5.0 when no calibration data exists, so
   uncalibrated cycles keep identical relative standings. */
function computeCalibScore(cand, cycle) {
    if (!cand.calib || !cycle || !cycle.mood || !cycle.salience) return 5.0;

    let sumSal = 0;
    let sumWeighted = 0;
    for (let a = 0; a < 6; a++) {
        const mood = cycle.mood[a];
        const sal = cycle.salience[a];
        const pos = cand.calib.issues[a];
        sumWeighted += sal * (10 - Math.abs(pos - mood));
        sumSal += sal;
    }
    if (sumSal === 0) return 5.0;
    const alignment = sumWeighted / sumSal;

    // Bounded authenticity MULTIPLIER; Strength/Competence ADDITIVE
    const authFactor = CFG.AUTH_MIN + cand.calib.authenticity * (CFG.AUTH_MAX - CFG.AUTH_MIN) / 10;

    return alignment * authFactor
        + CFG.STRCOMP_SCALE * (cand.calib.strength - 5)
        + CFG.STRCOMP_SCALE * (cand.calib.competence - 5);
}

/* One contest: composite score per active candidate, 15% viability
   threshold on score share, proportional split among the viable.
   Mutates cand.delegates. Returns the per-candidate awards. */
function awardDelegates(totalDel, field, cycle, rng) {
    const scored = field.map(cand => {
        const rand = (rng() - 0.5) * 10; // +/-5 point random swing
        const calib = computeCalibScore(cand, cycle);
        let score = (cand.polling * CFG.W_POLL)
            + (cand.momentum * CFG.W_MOMENTUM)
            + (calib * CFG.W_ISSUE * CFG.CALIB_SCALE)
            + (rand * CFG.W_RANDOM * 20);
        score = Math.max(0.1, score);
        return { cand, score };
    });

    const totalScore = scored.reduce((s, x) => s + x.score, 0);
    const viable = scored.filter(x => totalScore > 0 && x.score / totalScore >= CFG.VIABILITY);
    const viableTotal = viable.reduce((s, x) => s + x.score, 0);

    const awards = [];
    for (const x of viable) {
        if (viableTotal <= 0) break;
        const share = x.score / viableTotal;
        const dels = Math.round(totalDel * share);
        x.cand.delegates += dels;
        awards.push({ name: x.cand.name, delegates: dels, share });
    }
    return awards;
}

/* Contest-driven momentum: decay everyone (the engine's existing
   0.7), then winner gains / losers bleed, scaled by expectations.
   The current delegate leader (polling leader before any
   delegates) is expected to win: small gain when they do, big
   bleed when they stumble. A non-leader who wins a state scores
   an upset: big gain; non-leaders who lose bleed only slightly.
   Momentum feeds the next contest's score via the W_MOMENTUM term. */
function processContestMomentum(field, awards) {
    let winner = null;
    let best = -1;
    for (const a of awards) {
        if (a.delegates > best) { best = a.delegates; winner = a.name; }
    }
    let leader = null;
    let lead = -1;
    for (const cand of field) {
        const key = cand.delegates + cand.polling / 1000; // polling breaks ties
        if (key > lead) { lead = key; leader = cand.name; }
    }
    for (const cand of field) {
        cand.momentum *= CFG.MOM_DECAY;
        if (cand.name === winner && best > 0) {
            cand.momentum += (cand.name === leader) ? CFG.MOM_EXPECTED_GAIN : CFG.MOM_UPSET_GAIN;
        } else {
            cand.momentum -= (cand.name === leader) ? CFG.MOM_LEADER_BLEED : CFG.MOM_LOSE_BLEED;
        }
    }
}

/* Full primary season, contests only (no actions/events/dropouts).
   Same protocol as the VBA Sim2016GOPBatch plus contest-driven
   momentum between contests.
   Returns the field sorted by final delegate count, descending. */
function runPrimary(candidates, calendar, cycle, rng) {
    const field = candidates.map(c => ({ ...c, momentum: 0, delegates: 0 }));
    for (const contest of calendar) {
        const awards = awardDelegates(contest.delegates, field, cycle, rng);
        processContestMomentum(field, awards);
    }
    return field.sort((a, b) => b.delegates - a.delegates);
}

module.exports = { computeCalibScore, awardDelegates, processContestMomentum, runPrimary };
