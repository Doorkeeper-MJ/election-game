/* ============================================================
   engine/turnLoop.js  —  orchestrates the per-turn cycle

   Each step lives in its own engine module and exposes a .run().
   turnLoop walks the sequence, advances the calendar pointer +
   phase, then refreshes UI. The scoreboard snapshot is computed
   AFTER the phase advance so it reflects the upcoming contest,
   not the one that just ran — so it's not in STEPS, it's an
   explicit post-phase call.

   API:
       EG.engine.turnLoop.next()        — advance one turn
       EG.engine.turnLoop.runMany(n)    — advance n turns (or until end)
       EG.engine.turnLoop.STEPS         — ordered per-turn step list
   ============================================================ */

window.EG = window.EG || {};
EG.engine = EG.engine || {};
EG.engine.turnLoop = EG.engine.turnLoop || {};

EG.engine.turnLoop.STEPS = [
    { id: 'points',     label: '1. Earn campaign points' },
    { id: 'actions',    label: '2. Choose actions'       },
    { id: 'contests',   label: '3. Run contests'         },
    { id: 'events',     label: '4. Resolve events'       },
    { id: 'delegates',  label: '5. Award delegates'      }
];

/* Run a single step — delegates to its module if loaded, else logs a stub */
EG.engine.turnLoop.runStep = function (step) {
    var mod = EG.engine[step.id];
    if (mod && typeof mod.run === 'function') {
        mod.run();
    } else {
        console.log('   · ' + step.label + ' (stub)');
    }
};

/* Update phase based on the next-upcoming contest */
function refreshPhase() {
    var next = EG.state.getCurrentContest();
    if (!next) {
        EG.state.phase = 'concluded';
        return;
    }
    switch (next.type) {
        case 'General Election': EG.state.phase = 'general';    break;
        case 'Convention':       EG.state.phase = 'convention'; break;
        default:                 EG.state.phase = 'primary';
    }
}

/* Refresh all UI modules after a turn */
function refreshUI() {
    if (EG.ui && EG.ui.hud          && EG.ui.hud.render)          EG.ui.hud.render();
    if (EG.ui && EG.ui.map          && EG.ui.map.render)          EG.ui.map.render();
    if (EG.ui && EG.ui.clock        && EG.ui.clock.render)        EG.ui.clock.render();
    if (EG.ui && EG.ui.log          && EG.ui.log.render)          EG.ui.log.render();
    if (EG.ui && EG.ui.actionsPanel && EG.ui.actionsPanel.render) EG.ui.actionsPanel.render();
    if (EG.ui && EG.ui.scoreboard   && EG.ui.scoreboard.render)   EG.ui.scoreboard.render();

    var concluded = (EG.state.phase === 'concluded');
    var btn = document.getElementById('btn-next-turn');
    if (btn) {
        btn.disabled    = concluded;
        btn.textContent = concluded ? 'GAME OVER' : 'NEXT TURN ▶';
    }
    /* Step 15.2: sim buttons follow the same gating; also disabled if
       there's no human player yet (covered by initial state). */
    var simP = document.getElementById('btn-sim-primary');
    if (simP) simP.disabled = concluded || EG.state.phase !== 'primary';
    var simR = document.getElementById('btn-sim-rest');
    if (simR) simR.disabled = concluded;

    /* Pop the end-game modal once the race is called. Idempotent — the
       module bails if its overlay already exists. */
    if (EG.state.phase === 'concluded' && EG.ui && EG.ui.endGameScreen && EG.ui.endGameScreen.show) {
        EG.ui.endGameScreen.show();
    }

    /* Step 15.4 — pop the brokered convention modal if convention.js set
       pending data. Suppressed during SIM ALL (sim still records the data
       to news log; the modal just doesn't interrupt). */
    if (EG.state.brokeredPending && !EG.state.simAll && EG.ui && EG.ui.brokeredModal && EG.ui.brokeredModal.show) {
        EG.ui.brokeredModal.show();
    }
}

/* Advance one turn */
EG.engine.turnLoop.next = function () {
    if (EG.state.phase === 'concluded') {
        console.log('Game concluded — no more turns to advance.');
        return;
    }

    EG.state.turn++;
    var contest = EG.state.getCurrentContest();
    var headline = contest
        ? contest.date + ' — ' + contest.contest + ' (' + contest.party + ')'
        : 'no contest';

    /* Snapshot momentum before the turn's steps run so we can detect
       threshold crossings (the steps + end-of-turn decay both move it). */
    var momentumBefore = {};
    EG.state.candidates.forEach(function (rt) { momentumBefore[rt.id] = rt.momentum; });

    console.group(
        '%c TURN ' + EG.state.turn + ' ',
        'background:#f4c542;color:#000;font-weight:900;padding:2px 8px;',
        '— ' + headline
    );

    var newsBefore = EG.state.newsLog.length;
    EG.engine.turnLoop.STEPS.forEach(EG.engine.turnLoop.runStep);

    /* End-of-turn momentum bookkeeping (decay + polling-history trail) */
    EG.state.candidates.forEach(function (rt) {
        rt.momentum = rt.momentum * 0.85;
        rt.pollingHistory.push(rt.polling);
        while (rt.pollingHistory.length > 3) rt.pollingHistory.shift();
    });

    /* Threshold-crossing news (±40) — compare snapshot vs. post-decay. */
    var contestLabel = contest ? contest.contest : null;
    EG.state.candidates.forEach(function (rt) {
        if (!rt.active) return;
        var prev = momentumBefore[rt.id] || 0;
        var now  = rt.momentum;
        var base = EG.data.candidateById[rt.id];
        if (!base) return;
        if (prev < 40 && now >= 40) {
            var up = 'BIG MO: ' + base.name + ' overperforms' + (contestLabel ? ' in ' + contestLabel : '');
            console.log('   · ' + up);
            EG.state.newsLog.push(up);
        } else if (prev > -40 && now <= -40) {
            var dn = base.name + ' loses momentum after weak showing' + (contestLabel ? ' in ' + contestLabel : '');
            console.log('   · ' + dn);
            EG.state.newsLog.push(dn);
        }
    });

    /* Only push a generic turn-summary entry if no step contributed news */
    if (EG.state.newsLog.length === newsBefore) {
        EG.state.newsLog.push('Turn ' + EG.state.turn + ' — ' + headline);
    }

    /* Advance the calendar pointer, then update phase */
    EG.state.currentContestIndex++;
    refreshPhase();

    /* Compute scoreboard snapshot post-phase so it reflects the upcoming
       contest, not the one that just resolved. */
    if (EG.engine.scoreboard && EG.engine.scoreboard.run) {
        EG.engine.scoreboard.run();
    }

    console.groupEnd();

    refreshUI();
};

/* Advance many turns at once (handy for testing) */
EG.engine.turnLoop.runMany = function (n) {
    for (var i = 0; i < n; i++) {
        if (EG.state.phase === 'concluded') break;
        EG.engine.turnLoop.next();
    }
};
