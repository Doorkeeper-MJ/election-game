/* ============================================================
   engine/aiPlayer.js  —  Step 13: AI opponent decision-making

   Called from the top of engine.actions.run(). For every active,
   non-human, primary-eligible candidate without a staged action,
   classify their archetype, score each affordable action via a
   4×4 (archetype × action) matrix × specialty × jitter, and stage
   the winner. Skip if no affordable action scores positive.

   Archetypes:
     ENDANGERED — pressure > 25 after 3+ party contests
     LEADER     — top-1 in party by delegates AND polling > 25%
     LONGSHOT   — polling < 10% OR (0 dels AND 3+ party contests)
     CONTENDER  — everyone else

   Debug: set EG.debug.ai = true to log each AI decision per turn.

   API:
     EG.engine.aiPlayer.run()                — stage actions for all AIs
     EG.engine.aiPlayer.classify(rt)         — diagnostic archetype lookup
     EG.engine.aiPlayer.SCORE_MATRIX         — tunable weights
   ============================================================ */

window.EG = window.EG || {};
EG.engine = EG.engine || {};
EG.engine.aiPlayer = EG.engine.aiPlayer || {};
EG.debug = EG.debug || {};

(function () {

    /* Tunable score matrix. Rows = archetype, cols = action id from
       engine.actions.DEFS. Higher = more attractive for this archetype. */
    var SCORE_MATRIX = {
        LEADER:     { rally: 14, ad_buy: 12, ground_game: 11, debate_prep:  8 },
        CONTENDER:  { rally:  9, ad_buy: 10, ground_game: 11, debate_prep: 10 },
        LONGSHOT:   { rally: 12, ad_buy:  6, ground_game:  7, debate_prep: 11 },
        ENDANGERED: { rally: 14, ad_buy:  6, ground_game:  5, debate_prep: 13 }
    };

    var PRESSURE_THRESHOLD = 25;   /* below the 35 dropout cutoff, so AI panics before it's terminal */
    var LEADER_POLL_MIN    = 25;
    var LONGSHOT_POLL_MAX  = 10;

    /* Count party contests run so far (matches contests.js#countContestsRun
       logic — duplicated here because that function is module-private). */
    function countContestsRun(party) {
        var n = 0;
        var cal = EG.data.calendar || [];
        for (var i = 0; i <= EG.state.currentContestIndex; i++) {
            var c = cal[i];
            if (!c) break;
            if (c.party === party || c.party === 'Both') {
                var dels = (party === 'Republican') ? c.repDelegates : c.demDelegates;
                if (dels > 0) n++;
            }
        }
        return n;
    }

    /* Mirror of contests.js dropout pressure formula. Keep in sync —
       see MOMENTUM_PLAN.md §3. */
    function dropoutPressure(rt) {
        var pollTerm = (5 - rt.polling) * 8;
        var delTerm  = (rt.delegates === 0) ? 15 : -rt.delegates * 0.05;
        var moTerm   = -(rt.momentum || 0) * 0.5;
        return pollTerm + delTerm + moTerm;
    }

    function isPartyDelegateLeader(rt, base) {
        var topDels = 0;
        var topId   = null;
        EG.state.candidates.forEach(function (other) {
            var ob = EG.data.candidateById[other.id];
            if (!ob || ob.party !== base.party || !ob.primaryEligible) return;
            if (other.delegates > topDels) {
                topDels = other.delegates;
                topId   = other.id;
            }
        });
        return topId === rt.id && topDels > 0;
    }

    function classify(rt, base) {
        var contestsRun = countContestsRun(base.party);
        if (contestsRun >= 3 && dropoutPressure(rt) > PRESSURE_THRESHOLD) return 'ENDANGERED';
        if (isPartyDelegateLeader(rt, base) && rt.polling > LEADER_POLL_MIN) return 'LEADER';
        if (rt.polling < LONGSHOT_POLL_MAX || (rt.delegates === 0 && contestsRun >= 3)) return 'LONGSHOT';
        return 'CONTENDER';
    }

    function specialtyMultiplier(candidateId, actionId) {
        if (!EG.engine.actions || !EG.engine.actions.specialtyTagFor) return 1;
        var tag = EG.engine.actions.specialtyTagFor(candidateId, actionId);
        return tag === 'bonus'   ? 1.5
             : tag === 'penalty' ? 0.5
             :                     1.0;
    }

    function pickAction(rt, base) {
        var archetype = classify(rt, base);
        var weights   = SCORE_MATRIX[archetype];
        var defs      = EG.engine.actions.DEFS;
        var bestId    = null;
        var bestScore = 0;

        Object.keys(defs).forEach(function (id) {
            var def = defs[id];
            if (rt.cp < def.cost) return;       /* can't afford */

            var raw   = (weights && weights[id]) || 0;
            var spec  = specialtyMultiplier(rt.id, id);
            var aff   = (EG.engine.actions._affinityMultiplier
                            ? EG.engine.actions._affinityMultiplier(id)
                            : 1.0);
            var jit   = 0.9 + Math.random() * 0.2;
            var score = raw * spec * aff * jit;

            if (score > bestScore) {
                bestScore = score;
                bestId    = id;
            }
        });

        return { actionId: bestId, score: bestScore, archetype: archetype };
    }

    EG.engine.aiPlayer.run = function () {
        if (!EG.engine.actions || !EG.engine.actions.DEFS) return;

        EG.state.candidates.forEach(function (rt) {
            if (!rt.active) return;
            /* Step 15.2: in SIM ALL mode, the human is AI-controlled too. */
            if (rt.id === EG.state.humanPlayerId && !EG.state.simAll) return;
            if (rt.pendingAction) return;        /* human's staged action — respect it on first sim turn */

            var base = EG.data.candidateById[rt.id];
            if (!base || !base.primaryEligible) return;

            var pick = pickAction(rt, base);
            if (!pick.actionId) {
                if (EG.debug.ai) {
                    console.log('   · AI ' + base.name + ' skips (no affordable action; archetype ' + pick.archetype + ', cp ' + rt.cp + ')');
                }
                return;
            }

            var staged = EG.engine.actions.stage(rt.id, pick.actionId);
            if (staged && EG.debug.ai) {
                var def = EG.engine.actions.DEFS[pick.actionId];
                console.log('   · AI ' + base.name + ' → ' + def.label +
                            ' (' + pick.archetype + ', score ' + pick.score.toFixed(1) + ')');
            }
        });
    };

    /* Diagnostic — `EG.engine.aiPlayer.classify(EG.state.getCandidate('R02'))` */
    EG.engine.aiPlayer.classify = function (rt) {
        var base = rt && EG.data.candidateById[rt.id];
        return base ? classify(rt, base) : null;
    };

    EG.engine.aiPlayer.SCORE_MATRIX = SCORE_MATRIX;

}());
