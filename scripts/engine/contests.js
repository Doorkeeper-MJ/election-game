/* ============================================================
   engine/contests.js  —  Step 3 of the turn cycle: Run contests

   When the calendar hits a primary date, this module:
     1. Finds the candidates of the relevant party who are still active
     2. Computes each one's vote share:
            (polling × contestMultiplier) + random(±5) + home-state bonus (+10)
        then normalizes to percentages summing to 100
     3. Allocates delegates per the state's party-specific rule:
            Winner-Take-All  → all delegates to the top vote-getter
            Proportional     → split among candidates ≥ 15% viability threshold
            Hybrid / Mixed   → treated as Proportional (v1 simplification)
     4. Writes winner + per-candidate allocations onto the state runtime
        and bumps each candidate's delegates total
     5. Pushes a result line to the news log; the map auto-shows dots
        (top-left for Dem winner, top-right for Rep winner) via the
        existing render() in ui/map.js

   Conventions: announce the nominee (highest delegate count for that party).
   General Election: placeholder until Step 14.
   Runoffs (0 delegates): skipped silently.

   API:
       EG.engine.contests.run()   — called by the turn loop (step 3)
       EG.engine.contests.demo()  — reset + run several turns (testing)
   ============================================================ */

window.EG = window.EG || {};
EG.engine = EG.engine || {};
EG.engine.contests = EG.engine.contests || {};

/* ---------- helpers --------------------------------------------- */
function findState(contestName) {
    /* strip suffixes like " (Runoff)" */
    var clean = contestName.replace(/\s*\(.*\)\s*$/, '').trim();
    if (clean === 'Democrats Abroad') return EG.data.stateByAbbr.DD;
    for (var abbr in EG.data.stateByAbbr) {
        if (EG.data.stateByAbbr[abbr].name === clean) return EG.data.stateByAbbr[abbr];
    }
    return null;
}

function computeShares(candidates, stateData) {
    var raw = {};
    var total = 0;
    candidates.forEach(function (rt) {
        var base = EG.data.candidateById[rt.id];
        var noise     = Math.random() * 10 - 5;
        var homeBonus = (base.homeState === stateData.name) ? 10 : 0;
        var mult      = rt.contestMultiplier || 1;
        var v = Math.max(0, (rt.polling * mult) + noise + homeBonus);
        raw[rt.id] = v;
        total += v;
    });
    if (total === 0) { raw[candidates[0].id] = 100; total = 100; }
    var pcts = {};
    Object.keys(raw).forEach(function (id) { pcts[id] = (raw[id] / total) * 100; });
    return pcts;
}

function allocateDelegates(sharePcts, delegateCount, rule) {
    var ids = Object.keys(sharePcts);
    var allocations = {};
    ids.forEach(function (id) { allocations[id] = 0; });

    var winner = ids.reduce(function (best, id) {
        return (sharePcts[id] > sharePcts[best]) ? id : best;
    }, ids[0]);

    if (rule === 'Winner-Take-All') {
        allocations[winner] = delegateCount;
    } else {
        /* Proportional (and Hybrid/Mixed treated as proportional) with 15% threshold */
        var viable = ids.filter(function (id) { return sharePcts[id] >= 15; });
        if (viable.length === 0) {
            allocations[winner] = delegateCount;
        } else {
            var viableTotal = viable.reduce(function (s, id) { return s + sharePcts[id]; }, 0);
            var used = 0;
            viable.forEach(function (id, idx) {
                var alloc = (idx === viable.length - 1)
                    ? (delegateCount - used)              /* last viable absorbs rounding */
                    : Math.floor((sharePcts[id] / viableTotal) * delegateCount);
                allocations[id] = alloc;
                used += alloc;
            });
        }
    }
    return { winner: winner, allocations: allocations };
}

function runPartyContest(stateData, party, delegateCount, rule) {
    var pool = EG.state.candidates.filter(function (rt) {
        if (!rt.active) return false;
        var b = EG.data.candidateById[rt.id];
        return b && b.party === party && b.primaryEligible;   /* skip third-party */
    });
    if (pool.length === 0 || delegateCount === 0) return null;

    var shares = computeShares(pool, stateData);
    var alloc  = allocateDelegates(shares, delegateCount, rule);
    updateMomentumForContest(pool, shares, alloc.allocations);
    return { winner: alloc.winner, allocations: alloc.allocations, shares: shares };
}

/* Per-contest momentum update — see MOMENTUM_PLAN.md §2.
   delta = (overperformance × 2) + delegateSignal + (trend × 3)
   Biggest input is overperformance (actual share − expected polling).
   delegateSignal is tiered to avoid double-punishing the WTA runner-up:
   getting no dels but overperforming expectations softens the penalty. */
function updateMomentumForContest(pool, shares, allocations) {
    pool.forEach(function (rt) {
        var expected        = rt.polling;
        var actual          = shares[rt.id] || 0;
        var overperformance = actual - expected;
        var gotDels         = (allocations[rt.id] || 0) > 0;
        var delegateSignal;
        if (gotDels)                   delegateSignal =  5;   /* won dels */
        else if (overperformance >= 2) delegateSignal = -3;   /* moral victory */
        else                           delegateSignal = -10;  /* flopped */
        var trend = 0;
        if (rt.pollingHistory && rt.pollingHistory.length > 0) {
            trend = rt.polling - rt.pollingHistory[0];   /* oldest of last 3 */
        }
        var delta = (overperformance * 2) + delegateSignal + (trend * 3);
        rt.momentum = Math.max(-100, Math.min(100, rt.momentum + delta));
    });
}

/* Count contests run so far per party (current contest is included
   because dropouts are evaluated AFTER it has resolved). */
function countContestsRun() {
    var counts = { Republican: 0, Democrat: 0 };
    for (var i = 0; i <= EG.state.currentContestIndex; i++) {
        var c = EG.data.calendar[i];
        if (!c) break;
        if ((c.party === 'Republican' || c.party === 'Both') && c.repDelegates > 0) counts.Republican++;
        if ((c.party === 'Democrat'   || c.party === 'Both') && c.demDelegates > 0) counts.Democrat++;
    }
    return counts;
}

/* Composite-pressure dropout rule — see MOMENTUM_PLAN.md §3.
   Trajectory beats snapshot: fading candidates drop sooner; surging
   underdogs survive even with weak polling. Pressure > 35 = drop. */
function checkDropouts() {
    var runs = countContestsRun();
    var debug = EG.debug && EG.debug.dropouts;
    var trace = [];
    EG.state.candidates.forEach(function (rt) {
        if (!rt.active) return;
        if (rt.id === EG.state.humanPlayerId) return;
        var base = EG.data.candidateById[rt.id];
        if (!base || !base.primaryEligible) return;
        var gated = (runs[base.party] || 0) < 3;

        var pollTerm = (5 - rt.polling) * 8;
        var delTerm  = (rt.delegates === 0) ? 15 : -rt.delegates * 0.05;
        var moTerm   = -rt.momentum * 0.5;
        var pressure = pollTerm + delTerm + moTerm;

        if (debug) {
            trace.push(
                base.party[0] + ' ' + base.name +
                ' p=' + pressure.toFixed(1) +
                ' [poll=' + pollTerm.toFixed(1) +
                ' del=' + delTerm.toFixed(1) +
                ' mo=' + moTerm.toFixed(1) + ']' +
                (gated ? ' (gated)' : '')
            );
        }

        if (gated) return;

        if (pressure > 35) {
            rt.active = false;
            rt.droppedTurn = EG.state.turn;
            var msg = base.name + ' suspends campaign';
            console.log('   · ' + msg + '  (pressure ' + pressure.toFixed(1) + ')');
            EG.state.newsLog.push(msg);
        }
    });
    if (debug && trace.length) {
        console.log('   · [dropouts] turn ' + EG.state.turn + '\n     ' + trace.join('\n     '));
    }
}

function applyResult(stateRuntime, party, result) {
    if (party === 'Republican') {
        stateRuntime.repWinner      = result.winner;
        stateRuntime.repAllocations = result.allocations;
    } else {
        stateRuntime.demWinner      = result.winner;
        stateRuntime.demAllocations = result.allocations;
    }
    Object.keys(result.allocations).forEach(function (id) {
        var rt = EG.state.getCandidate(id);
        if (rt) rt.delegates += result.allocations[id];
    });
}

function formatLine(result, partyLetter) {
    var base  = EG.data.candidateById[result.winner];
    var name  = base ? base.name : result.winner;
    var share = (result.shares[result.winner] || 0).toFixed(0);
    var dels  = result.allocations[result.winner] || 0;
    return partyLetter + ': ' + name + ' ' + share + '% (+' + dels + ' del)';
}

/* Convention dispatch — full IRV brokered-convention logic lives in
   engine/convention.js. Pass the calendar row through (it has both
   party and the delegate total we need for the clinch threshold). */
function announceNominee(contest) {
    if (EG.engine.convention && EG.engine.convention.run) {
        EG.engine.convention.run(contest);
    } else {
        console.warn('   · convention.js not loaded; nominee not declared');
    }
}

/* ---------- main entry ------------------------------------------ */
EG.engine.contests.run = function () {
    var contest = EG.state.getCurrentContest();
    if (!contest) {
        console.log('   · No contest scheduled');
        return;
    }

    if (contest.type === 'Convention') {
        announceNominee(contest);
        return;
    }
    if (contest.type === 'General Election') {
        if (EG.engine.generalElection && EG.engine.generalElection.run) {
            EG.engine.generalElection.run(contest);
        } else {
            console.warn('   · generalElection.js not loaded; skipping general');
        }
        return;
    }

    var isPrimary = ['Primary', 'Caucus', 'Super Tuesday'].indexOf(contest.type) >= 0;
    if (!isPrimary) {
        console.log('   · Skipping non-primary contest type: ' + contest.type);
        return;
    }

    var stateData = findState(contest.contest);
    if (!stateData) {
        console.log('   · Could not match a state for contest: ' + contest.contest);
        return;
    }
    var stateRuntime = EG.state.getState(stateData.abbr);
    if (!stateRuntime) return;

    var lines = [];

    if ((contest.party === 'Republican' || contest.party === 'Both') && contest.repDelegates > 0) {
        var r = runPartyContest(stateData, 'Republican', contest.repDelegates, stateData.repRule);
        if (r) {
            applyResult(stateRuntime, 'Republican', r);
            lines.push(formatLine(r, 'R'));
        }
    }
    if ((contest.party === 'Democrat' || contest.party === 'Both') && contest.demDelegates > 0) {
        var d = runPartyContest(stateData, 'Democrat', contest.demDelegates, stateData.demRule);
        if (d) {
            applyResult(stateRuntime, 'Democrat', d);
            lines.push(formatLine(d, 'D'));
        }
    }

    /* one-shot multipliers reset after the contest they affect */
    EG.state.candidates.forEach(function (rt) { rt.contestMultiplier = 1; });

    if (lines.length > 0) {
        var headline = stateData.abbr + ' · ' + lines.join(' | ');
        console.log('   · ' + headline);
        EG.state.newsLog.push(headline);
    } else {
        console.log('   · ' + contest.contest + ' — no delegates contested');
    }

    /* organic dropouts evaluated after every contest */
    checkDropouts();
};

/* ---------- demo (for verifying Step 9) ------------------------- */
EG.engine.contests.demo = function () {
    EG.state.reset();
    if (EG.ui.hud)          EG.ui.hud.render();
    if (EG.ui.map)          EG.ui.map.render();
    if (EG.ui.actionsPanel) EG.ui.actionsPanel.render();
    if (EG.ui.clock)        EG.ui.clock.render();
    EG.engine.turnLoop.runMany(6);   /* Iowa, NH, SC(D), NV(R), SC(R), MI(D) */
    console.log('Demo: ran 6 turns — check the map for IA/NH/SC/NV/MI dots and the HUD for delegate counts.');
};
