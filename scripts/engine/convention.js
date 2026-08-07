/* ============================================================
   engine/convention.js  —  Step 11: Convention + nominee declaration

   Dispatched from contests.js when a Convention contest comes up
   on the calendar. Decides the party's nominee:

     - Single delegate-holder → instant nominee
     - Majority on ballot 1 → clinched, brief news entry
     - Otherwise → BROKERED CONVENTION:
         multi-ballot IRV — eliminate the lowest-delegate candidate
         each round, redistributing their delegates to survivors
         weighted by ideological proximity × momentum × jitter

   Dropped candidates (active === false) keep their delegates on
   ballot 1 (they were pledged) but cannot WIN — if they were the
   sole survivor, the highest-delegate active candidate is nominated.

   API:
       EG.engine.convention.run(contest)
   ============================================================ */

window.EG = window.EG || {};
EG.engine = EG.engine || {};
EG.engine.convention = EG.engine.convention || {};

(function () {

    /* ---------- ballot helpers ------------------------------------- */

    /* Snapshot of one candidate's convention-time stats. */
    function snap(rt) {
        var b = EG.data.candidateById[rt.id];
        return {
            id:        rt.id,
            name:      b.name,
            ideology:  b.ideology,
            momentum:  rt.momentum || 0,
            active:    rt.active,
            delegates: rt.delegates
        };
    }

    function buildSlate(party) {
        return EG.state.candidates
            .filter(function (rt) {
                var b = EG.data.candidateById[rt.id];
                return b && b.party === party && b.primaryEligible && rt.delegates > 0;
            })
            .map(snap)
            .sort(function (a, b) { return b.delegates - a.delegates; });
    }

    function leader(slate) {
        var top = slate[0];
        slate.forEach(function (c) { if (c.delegates > top.delegates) top = c; });
        return top;
    }

    function lowest(slate) {
        var bot = slate[0];
        slate.forEach(function (c) { if (c.delegates < bot.delegates) bot = c; });
        return bot;
    }

    /* Redistribute an eliminated candidate's delegates to survivors,
       weighted by ideological proximity × momentum × jitter.
       Uses largest-remainder rounding so the total is preserved. */
    function redistribute(eliminated, survivors) {
        if (eliminated.delegates <= 0 || survivors.length === 0) return;

        var weights = survivors.map(function (c) {
            var distSq      = Math.pow(c.ideology - eliminated.ideology, 2);
            var proximity   = 1 / (1 + distSq);
            var momentumMul = Math.max(0.5, Math.min(2.0, 1 + c.momentum / 100));
            var jitter      = 0.95 + Math.random() * 0.1;
            return proximity * momentumMul * jitter;
        });
        var totalW = weights.reduce(function (s, w) { return s + w; }, 0);
        if (totalW <= 0) {
            /* degenerate — split evenly */
            weights = survivors.map(function () { return 1; });
            totalW  = survivors.length;
        }

        var raw   = weights.map(function (w) { return (w / totalW) * eliminated.delegates; });
        var floor = raw.map(function (r) { return Math.floor(r); });
        var used  = floor.reduce(function (s, n) { return s + n; }, 0);
        var rem   = eliminated.delegates - used;

        /* Largest-remainder rounding — hand out the leftover delegates
           to the survivors with the biggest fractional remainders. */
        var remOrder = raw
            .map(function (r, i) { return { i: i, frac: r - Math.floor(r) }; })
            .sort(function (a, b) { return b.frac - a.frac; });
        for (var k = 0; k < rem; k++) floor[remOrder[k % survivors.length].i]++;

        survivors.forEach(function (c, i) { c.delegates += floor[i]; });
        eliminated.delegates = 0;
    }

    /* ---------- news formatting ------------------------------------ */

    function ballotLine(ballotNum, slate, note) {
        var ordered = slate.slice().sort(function (a, b) { return b.delegates - a.delegates; });
        var pieces  = ordered.map(function (c) {
            return (c.active ? '' : '*') + c.name + ' ' + c.delegates;
        });
        return 'Ballot ' + ballotNum + ': ' + pieces.join(' · ') + (note ? ' — ' + note : '');
    }

    function pushNews(msg) {
        console.log('   · ' + msg);
        EG.state.newsLog.push(msg);
    }

    /* ---------- main entry ----------------------------------------- */

    EG.engine.convention.run = function (contest) {
        var party     = contest.party;
        var total     = (party === 'Republican') ? contest.repDelegates : contest.demDelegates;
        var majority  = Math.floor(total / 2) + 1;
        var label     = (party === 'Republican' ? 'GOP' : 'DEM');
        var city      = (contest.notes && contest.notes.split('—')[0].trim()) || party + ' convention';
        var slate     = buildSlate(party);

        /* Step 15.4 — accumulate ballot snapshots in parallel with news pushes.
           Set EG.state.brokeredPending iff more than one ballot was needed AND
           we're not in SIM ALL (sim suppresses the modal; news log still records). */
        var ballotRecords = [];
        function snapshot(num) {
            return {
                num: num,
                slate: slate.map(function (c) {
                    return { id: c.id, name: c.name, dels: c.delegates, active: c.active };
                }),
                eliminated: null
            };
        }
        function finishBrokered(winnerData) {
            if (ballotRecords.length <= 1) return;
            if (EG.state.simAll) return;
            EG.state.brokeredPending = {
                party:    party,
                label:    label,
                venue:    city,
                majority: majority,
                ballots:  ballotRecords,
                winner:   winnerData
            };
        }

        /* ---- degenerate slates ---- */
        if (slate.length === 0) {
            pushNews('🏛 ' + label + ' CONVENTION: no eligible nominee — field exhausted');
            return;
        }

        if (slate.length === 1) {
            EG.state.nominees[party] = slate[0].id;
            pushNews('🏛 ' + label + ' NOMINEE: ' + slate[0].name +
                     ' — ' + slate[0].delegates + ' delegates (sole survivor)');
            return;
        }

        /* ---- ballot 1: anyone clinched outright? ---- */
        pushNews('🏛 ' + city + ' — ' + label + ' convention convened (' + majority + ' delegates needed)');

        var ballot   = 1;
        var maxBallots = 20;   /* safety guard — IRV terminates well before this */

        while (ballot <= maxBallots) {
            var top  = leader(slate);
            var snap = snapshot(ballot);

            if (top.delegates >= majority && top.active) {
                ballotRecords.push(snap);
                pushNews(ballotLine(ballot, slate, top.name.toUpperCase() + ' clinches' +
                    (ballot === 1 ? ' on first ballot' : ' (ballot ' + ballot + ')')));
                EG.state.nominees[party] = top.id;
                pushNews('🏛 ' + label + ' NOMINEE: ' + top.name + ' — ' + top.delegates + ' delegates');
                finishBrokered({ id: top.id, name: top.name, dels: top.delegates, clinchedBallot: ballot, reason: 'clinched' });
                return;
            }

            /* No clinch — one survivor left? */
            if (slate.length === 1) {
                var only = slate[0];
                ballotRecords.push(snap);
                if (only.active) {
                    EG.state.nominees[party] = only.id;
                    pushNews(ballotLine(ballot, slate, only.name.toUpperCase() + ' nominated by attrition'));
                    pushNews('🏛 ' + label + ' NOMINEE: ' + only.name + ' — ' + only.delegates + ' delegates');
                    finishBrokered({ id: only.id, name: only.name, dels: only.delegates, clinchedBallot: ballot, reason: 'attrition' });
                } else {
                    /* edge case: only survivor is a dropout. Fall back to
                       highest-delegate active candidate from the original field. */
                    var fallback = EG.state.candidates
                        .filter(function (rt) {
                            var b = EG.data.candidateById[rt.id];
                            return b && b.party === party && b.primaryEligible && rt.active;
                        })
                        .sort(function (a, b) { return b.delegates - a.delegates; })[0];
                    if (fallback) {
                        var fb = EG.data.candidateById[fallback.id];
                        EG.state.nominees[party] = fallback.id;
                        pushNews('🏛 ' + label + ' NOMINEE: ' + fb.name +
                                 ' — fallback (no active candidates remained in IRV)');
                        finishBrokered({ id: fallback.id, name: fb.name, dels: fallback.delegates, clinchedBallot: ballot, reason: 'fallback' });
                    }
                }
                return;
            }

            /* Eliminate the lowest, redistribute */
            var out       = lowest(slate);
            var survivors = slate.filter(function (c) { return c.id !== out.id; });
            snap.eliminated = out.id;
            ballotRecords.push(snap);
            redistribute(out, survivors);
            pushNews(ballotLine(ballot, slate, out.name + ' eliminated, ' +
                (out.delegates === 0 ? 'dels released' : '')));
            slate = survivors;
            ballot++;
        }

        /* Defensive: declare leader if we somehow ran out of ballots */
        var fin = leader(slate);
        EG.state.nominees[party] = fin.id;
        pushNews('🏛 ' + label + ' NOMINEE (deadlock resolved): ' + fin.name + ' — ' + fin.delegates + ' delegates');
        finishBrokered({ id: fin.id, name: fin.name, dels: fin.delegates, clinchedBallot: ballot - 1, reason: 'deadlock' });
    };

}());
