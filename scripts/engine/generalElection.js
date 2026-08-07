/* ============================================================
   engine/generalElection.js  —  Step 14: November 5 resolution

   Dispatched from contests.js when the General Election contest
   fires. One-shot per-state simulation:

     repShare = repBase + momentum/10 + noise − tpFromR
     demShare = demBase + momentum/10 + noise − tpFromD

   where:
     repBase / demBase  = 47 / 48 anchored, ± margin2020/2
     tpFromR / tpFromD  = third-party siphon by ideology proximity
     noise              = ±5 in swing states, ±2 elsewhere

   Each non-territory state's higher-share nominee wins all its
   EVs (no ME/NE district split in v1). Writes s.generalWinner,
   bumps nominee.delegates by state.electoralVotes. After tally,
   sets EG.state.nominees.winner if any nominee ≥ 270.

   API:
       EG.engine.generalElection.run(contest)
   ============================================================ */

window.EG = window.EG || {};
EG.engine = EG.engine || {};
EG.engine.generalElection = EG.engine.generalElection || {};

(function () {

    var NATIONAL_REP_BASE = 47;
    var NATIONAL_DEM_BASE = 48;
    var TP_POLL_SCALAR    = 0.3;  /* RFK 14 → 4.2%, Stein 2 → 0.6%, etc. */
    var SWING_NOISE       = 5;
    var SAFE_NOISE        = 2;
    var MOMENTUM_SCALE    = 0.1;  /* ±100 momentum → ±10 share points */
    var TOTAL_EVS         = 538;
    var WIN_THRESHOLD     = 270;

    /* Build the third-party siphon: an object {fromR, fromD} giving the
       total points lifted out of repBase and demBase before the major-
       party calc. Stable across states (national-level math). */
    function buildSiphon(repNomBase, demNomBase) {
        var fromR = 0, fromD = 0;
        if (!repNomBase || !demNomBase) return { fromR: 0, fromD: 0, parts: [] };

        var parts = [];
        EG.state.candidates.forEach(function (rt) {
            if (!rt.active) return;
            var b = EG.data.candidateById[rt.id];
            if (!b || b.primaryEligible) return;          /* only third-party */

            var share = rt.polling * TP_POLL_SCALAR;
            var distR = Math.abs((b.ideology || 5) - (repNomBase.ideology || 9.5));
            var distD = Math.abs((b.ideology || 5) - (demNomBase.ideology || 3));
            var pullR = 1 / (1 + distR * distR);
            var pullD = 1 / (1 + distD * distD);
            var fromR_pct = pullR / (pullR + pullD);

            var takeR = share * fromR_pct;
            var takeD = share * (1 - fromR_pct);
            fromR += takeR;
            fromD += takeD;
            parts.push({ id: rt.id, name: b.name, share: share, takeR: takeR, takeD: takeD });
        });

        return { fromR: fromR, fromD: fromD, parts: parts };
    }

    function simulateState(stateData, repNom, demNom, repNomBase, demNomBase, siphon) {
        var margin    = stateData.margin2020 || 0;
        var baseSwing = margin / 2;

        var repBase = NATIONAL_REP_BASE - baseSwing - siphon.fromR;
        var demBase = NATIONAL_DEM_BASE + baseSwing - siphon.fromD;

        var momR = (repNom ? repNom.momentum : 0) * MOMENTUM_SCALE;
        var momD = (demNom ? demNom.momentum : 0) * MOMENTUM_SCALE;

        var noiseRange = stateData.swingState ? SWING_NOISE : SAFE_NOISE;
        var noiseR     = (Math.random() * 2 - 1) * noiseRange;
        var noiseD     = (Math.random() * 2 - 1) * noiseRange;

        var repShare = repBase + momR + noiseR;
        var demShare = demBase + momD + noiseD;

        return {
            repShare: repShare,
            demShare: demShare,
            winner: (repShare >= demShare) ? 'Republican' : 'Democrat'
        };
    }

    EG.engine.generalElection.run = function (/* contest */) {
        var nomR_id = EG.state.nominees && EG.state.nominees.Republican;
        var nomD_id = EG.state.nominees && EG.state.nominees.Democrat;
        var nomR    = nomR_id ? EG.state.getCandidate(nomR_id) : null;
        var nomD    = nomD_id ? EG.state.getCandidate(nomD_id) : null;
        var nomR_b  = nomR_id ? EG.data.candidateById[nomR_id] : null;
        var nomD_b  = nomD_id ? EG.data.candidateById[nomD_id] : null;

        if (!nomR_id || !nomD_id) {
            EG.state.newsLog.push('🗳 GENERAL ELECTION cannot run — missing nominee(s)');
            return;
        }

        EG.state.newsLog.push('🗳 GENERAL ELECTION — polls close across all 50 states');

        var siphon = buildSiphon(nomR_b, nomD_b);
        if (siphon.parts.length > 0) {
            var sp = siphon.parts.map(function (p) {
                return p.name + ' ' + p.share.toFixed(1) + '%';
            }).join(', ');
            EG.state.newsLog.push('Third-party national vote: ' + sp);
        }

        var evR = 0, evD = 0, statesR = 0, statesD = 0;
        var closeCalls = [];   /* swing-state results for headline news */

        EG.state.states.forEach(function (s) {
            var sd = EG.data.stateByAbbr && EG.data.stateByAbbr[s.abbr];
            if (!sd || sd.isTerritory) return;

            var result = simulateState(sd, nomR, nomD, nomR_b, nomD_b, siphon);

            /* EVs are tracked only via state.generalWinner — don't mutate
               nominee.delegates (that field is the primary-delegate count
               and the HUD still reads it). The scoreboard + end-game both
               derive EVs by summing electoralVotes from states.generalWinner. */
            if (result.winner === 'Republican') {
                s.generalWinner = nomR_id;
                evR += sd.electoralVotes;
                statesR++;
            } else {
                s.generalWinner = nomD_id;
                evD += sd.electoralVotes;
                statesD++;
            }

            if (sd.swingState) {
                var winName = (result.winner === 'Republican') ? nomR_b.name : nomD_b.name;
                var margin  = Math.abs(result.repShare - result.demShare);
                closeCalls.push(sd.abbr + ' → ' + winName + ' (+' + margin.toFixed(1) + ')');
            }
        });

        if (closeCalls.length > 0) {
            EG.state.newsLog.push('Swing-state calls: ' + closeCalls.join(' · '));
        }

        EG.state.newsLog.push(
            'Electoral count: ' +
            nomR_b.name + ' ' + evR + ' EVs (' + statesR + ' states) · ' +
            nomD_b.name + ' ' + evD + ' EVs (' + statesD + ' states)'
        );

        /* Call the race */
        var winner = null;
        if      (evR >= WIN_THRESHOLD) winner = nomR_id;
        else if (evD >= WIN_THRESHOLD) winner = nomD_id;

        EG.state.nominees.winner = winner;

        if (winner) {
            var winName = EG.data.candidateById[winner].name;
            var winParty = EG.data.candidateById[winner].party === 'Republican' ? 'GOP' : 'DEM';
            var margin   = Math.abs(evR - evD);
            EG.state.newsLog.push(
                '★ PRESIDENT-ELECT: ' + winName.toUpperCase() + ' (' + winParty + ') — ' +
                Math.max(evR, evD) + '–' + Math.min(evR, evD) + ', ' + winParty + ' +' + margin + ' ★'
            );
        } else {
            EG.state.newsLog.push('🗳 NO MAJORITY — contingent election triggered (deferred past v1)');
        }
    };

}());
