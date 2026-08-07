/* ============================================================
   engine/scoreboard.js  —  Step 12: compute race-state snapshot

   Wired as step 6 of the turn loop. Reads EG.state + EG.data and
   writes a phase-aware snapshot to EG.state.scoreboardSnapshot.
   The UI module reads that snapshot — no DOM work happens here.

   Snapshot shape:
       {
         turn, phase, contestIndex, contestsTotal,
         nextContest: { date, contest, party, type } | null,
         parties: {
           Republican: { leaderId, leaderName, leaderDelegates,
                         clinchThreshold, nomineeId },
           Democrat:   { ... }
         },
         general: null | {
           Republican: { evs, statesWon, nomineeId },
           Democrat:   { evs, statesWon, nomineeId },
           tossup:     { evs },
           winner:     candidateId | null
         }
       }

   API:
       EG.engine.scoreboard.run()       — write a fresh snapshot
       EG.engine.scoreboard.compute()   — pure: returns snapshot
   ============================================================ */

window.EG = window.EG || {};
EG.engine = EG.engine || {};
EG.engine.scoreboard = EG.engine.scoreboard || {};

(function () {

    /* Clinch threshold = floor(conv-delegates / 2) + 1. Cached on first
       call since the calendar is immutable reference data. */
    var clinchCache = null;
    function getClinchThresholds() {
        if (clinchCache) return clinchCache;
        clinchCache = { Republican: null, Democrat: null };
        var cal = EG.data.calendar || [];
        for (var i = 0; i < cal.length; i++) {
            var c = cal[i];
            if (c.type !== 'Convention') continue;
            if (c.party === 'Republican' && c.repDelegates > 0) {
                clinchCache.Republican = Math.floor(c.repDelegates / 2) + 1;
            } else if (c.party === 'Democrat' && c.demDelegates > 0) {
                clinchCache.Democrat = Math.floor(c.demDelegates / 2) + 1;
            }
        }
        return clinchCache;
    }

    function partyLeader(party) {
        var pool = EG.state.candidates.filter(function (rt) {
            var b = EG.data.candidateById[rt.id];
            return b && b.party === party && b.primaryEligible;
        });
        if (pool.length === 0) return null;
        var top = pool[0];
        for (var i = 1; i < pool.length; i++) {
            if (pool[i].delegates > top.delegates) top = pool[i];
        }
        return top;
    }

    function partySnapshot(party) {
        var leader = partyLeader(party);
        var base   = leader ? EG.data.candidateById[leader.id] : null;
        var thresholds = getClinchThresholds();
        return {
            leaderId:        leader ? leader.id : null,
            leaderName:      base ? base.name : null,
            leaderDelegates: leader ? leader.delegates : 0,
            clinchThreshold: thresholds[party],
            nomineeId:       (EG.state.nominees && EG.state.nominees[party]) || null
        };
    }

    function generalSnapshot() {
        var nomR = EG.state.nominees && EG.state.nominees.Republican;
        var nomD = EG.state.nominees && EG.state.nominees.Democrat;
        var evR = 0, evD = 0, evOther = 0, statesR = 0, statesD = 0, evAssigned = 0;

        EG.state.states.forEach(function (s) {
            var sd = EG.data.stateByAbbr && EG.data.stateByAbbr[s.abbr];
            if (!sd || sd.isTerritory) return;
            if (!s.generalWinner) return;
            var ev = sd.electoralVotes || 0;
            evAssigned += ev;
            if      (s.generalWinner === nomR) { evR += ev; statesR++; }
            else if (s.generalWinner === nomD) { evD += ev; statesD++; }
            else                                { evOther += ev; }
        });

        var totalEV = 538;
        var tossup  = Math.max(0, totalEV - evAssigned);
        var winner  = null;
        if (evR >= 270 && evR > evD) winner = nomR;
        else if (evD >= 270 && evD > evR) winner = nomD;

        return {
            Republican: { evs: evR, statesWon: statesR, nomineeId: nomR || null },
            Democrat:   { evs: evD, statesWon: statesD, nomineeId: nomD || null },
            tossup:     { evs: tossup },
            other:      { evs: evOther },
            winner:     winner
        };
    }

    EG.engine.scoreboard.compute = function () {
        var cal  = EG.data.calendar || [];
        var idx  = EG.state.currentContestIndex;
        var next = cal[idx] || null;

        var snap = {
            turn:           EG.state.turn,
            phase:          EG.state.phase,
            contestIndex:   idx,
            contestsTotal:  cal.length,
            nextContest:    next ? {
                date:    next.date,
                contest: next.contest,
                party:   next.party,
                type:    next.type
            } : null,
            parties: {
                Republican: partySnapshot('Republican'),
                Democrat:   partySnapshot('Democrat')
            },
            general: null
        };

        if (snap.phase === 'general' || snap.phase === 'concluded') {
            snap.general = generalSnapshot();
        }

        return snap;
    };

    EG.engine.scoreboard.run = function () {
        EG.state.scoreboardSnapshot = EG.engine.scoreboard.compute();
    };

}());
