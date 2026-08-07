/* ============================================================
   main.js  —  bootstrap
   Plain <script> tags + a single global namespace: window.EG
   Loads after the data files; verifies them and updates the UI.
   ============================================================ */

window.EG = window.EG || {};

EG.version = '0.9.1';
EG.buildStep = 'Step 9 — run contests (with eligibility model)';

/* Convenience: switch which candidate the human plays as */
EG.setPlayer = function (id) {
    if (!EG.data.candidateById[id]) {
        console.warn('Unknown candidate id:', id, '— try one of:', Object.keys(EG.data.candidateById).join(', '));
        return;
    }
    EG.state.humanPlayerId = id;
    if (EG.ui.hud)          EG.ui.hud.render();
    if (EG.ui.actionsPanel) EG.ui.actionsPanel.render();
};

/* Step 15.4 — force a brokered scenario for verifying the IRV path.
   Redistributes delegates among the party's primary-eligible candidates
   so no one has the majority needed at convention, then optionally fires
   the convention immediately. Use after EG.newGame() (or at game start)
   before clicking through to the convention turn.

   Usage from console:
       EG.debug.forceBrokered('Republican')           // set up + fire now
       EG.debug.forceBrokered('Democrat', { fire: false })   // set up only
*/
EG.debug = EG.debug || {};
EG.debug.forceBrokered = function (party, opts) {
    opts = opts || {};
    if (party !== 'Republican' && party !== 'Democrat') {
        console.warn('forceBrokered: party must be "Republican" or "Democrat"');
        return;
    }
    var convRow = (EG.data.calendar || []).find(function (c) {
        return c.type === 'Convention' && c.party === party;
    });
    if (!convRow) { console.warn('No convention row in calendar for', party); return; }

    var total    = (party === 'Republican') ? convRow.repDelegates : convRow.demDelegates;
    var majority = Math.floor(total / 2) + 1;

    var pool = EG.state.candidates.filter(function (rt) {
        var b = EG.data.candidateById[rt.id];
        return b && b.party === party && b.primaryEligible;
    });
    if (pool.length < 3) {
        console.warn('forceBrokered: need ≥3 primary-eligible candidates; have', pool.length);
        return;
    }

    /* Distribute so no one reaches majority. Top candidate gets ~45% of
       total (just below the 50% threshold), second ~30%, rest split the
       remaining ~25%. Ensures multi-ballot IRV but keeps the leader
       believable. */
    pool.sort(function (a, b) { return b.polling - a.polling; });
    var shares = [0.45, 0.28];
    var remaining = pool.length - 2;
    for (var i = 0; i < remaining; i++) shares.push(0.27 / remaining);

    pool.forEach(function (rt, idx) { rt.delegates = Math.floor(total * shares[idx]); });

    /* Also make sure all of them are active so the slate isn't degenerate. */
    pool.forEach(function (rt) { rt.active = true; rt.droppedTurn = null; });

    var top = pool[0];
    console.log('forceBrokered ' + party + ': majority=' + majority +
                ', top=' + EG.data.candidateById[top.id].name + ' with ' + top.delegates + ' dels' +
                ' (below ' + majority + '), ' + pool.length + ' candidates in slate');

    if (opts.fire !== false) {
        if (!EG.engine.convention || !EG.engine.convention.run) {
            console.warn('convention.js not loaded');
            return;
        }
        EG.engine.convention.run(convRow);
        /* Trigger UI refresh so the modal pops */
        if (EG.ui.hud && EG.ui.hud.render) EG.ui.hud.render();
        if (EG.ui.brokeredModal && EG.ui.brokeredModal.show) EG.ui.brokeredModal.show();
    }
};

/* Step 15.2 — Auto-Play modes. Loop turnLoop.next() while the simAll flag
   is set so aiPlayer also stages for the human. The flag is reset in a
   finally block to guarantee the human regains control even if something
   throws mid-loop. Hard turn cap defends against runaway. */
function simLoop(shouldStop, label) {
    if (!EG.state.humanPlayerId) {
        console.warn(label + ' — pick a candidate first');
        return;
    }
    if (EG.state.phase === 'concluded') {
        console.warn(label + ' — game already concluded');
        return;
    }
    var MAX_TURNS = 200;     /* calendar has 49 entries; 200 is well past any sane run */
    var ran = 0;
    EG.state.simAll = true;
    try {
        while (ran < MAX_TURNS && !shouldStop()) {
            EG.engine.turnLoop.next();
            ran++;
        }
    } finally {
        EG.state.simAll = false;
    }
    console.log(label + ' — ran ' + ran + ' turns; phase=' + EG.state.phase);
}

EG.simRest = function () {
    simLoop(function () { return EG.state.phase === 'concluded'; }, 'SIM REST');
};

EG.simPrimary = function () {
    simLoop(function () { return EG.state.phase !== 'primary'; }, 'SIM PRIMARY');
};

/* Reset to a fresh game — called by the end-game modal's PLAY AGAIN button.
   Wipes runtime state, recomputes snapshots, repaints UI, re-locks Next Turn,
   and reopens the candidate-select modal. */
EG.newGame = function () {
    EG.state.reset();
    if (EG.engine.scoreboard) EG.engine.scoreboard.run();

    if (EG.ui.hud)          EG.ui.hud.render();
    if (EG.ui.map)          EG.ui.map.render();
    if (EG.ui.actionsPanel) EG.ui.actionsPanel.render();
    if (EG.ui.scoreboard)   EG.ui.scoreboard.render();
    if (EG.ui.clock)        EG.ui.clock.render();

    EG.state.newsLog.push('New game. Choose your candidate to begin.');
    if (EG.ui.log) EG.ui.log.render();

    var btn = document.getElementById('btn-next-turn');
    if (btn) { btn.disabled = true; btn.textContent = 'NEXT TURN ▶'; }
    var simP = document.getElementById('btn-sim-primary');
    if (simP) simP.disabled = true;
    var simR = document.getElementById('btn-sim-rest');
    if (simR) simR.disabled = true;

    if (EG.ui.candidateSelect) EG.ui.candidateSelect.show();
};

/* ---------- data summary helper (callable from console) ---------- */
EG.data = EG.data || {};

EG.data.summary = function () {
    var c   = EG.data.candidates || [];
    var s   = EG.data.states || [];
    var cal = EG.data.calendar || [];
    var ev  = EG.data.events || [];

    var counts = {
        candidates: {
            total:  c.length,
            active: c.filter(function (x) { return x.active; }).length,
            byParty: c.reduce(function (acc, x) { acc[x.party] = (acc[x.party] || 0) + 1; return acc; }, {})
        },
        states: {
            total:       s.length,
            statesAndDC: s.filter(function (x) { return !x.isTerritory; }).length,
            territories: s.filter(function (x) { return x.isTerritory; }).length,
            swing:       s.filter(function (x) { return x.swingState; }).length,
            totalEVs:    s.reduce(function (acc, x) { return acc + x.electoralVotes; }, 0)
        },
        calendar: {
            total:     cal.length,
            primaries: cal.filter(function (x) { return x.type === 'Primary' || x.type === 'Caucus' || x.type === 'Super Tuesday'; }).length,
            firstDate: cal[0] && cal[0].date,
            lastDate:  cal[cal.length - 1] && cal[cal.length - 1].date
        },
        events: {
            total:    ev.length,
            byCategory: ev.reduce(function (acc, x) { acc[x.category] = (acc[x.category] || 0) + 1; return acc; }, {})
        }
    };

    console.group('%c EG.data.summary() ', 'background:#2b6cff;color:#fff;font-weight:900;padding:2px 8px;');
    console.log('Candidates :', counts.candidates.total, '(' + counts.candidates.active + ' active)', counts.candidates.byParty);
    console.log('States     :', counts.states.statesAndDC, 'states+DC,', counts.states.territories, 'territories,', counts.states.swing, 'swing,', counts.states.totalEVs, 'total EVs');
    console.log('Calendar   :', counts.calendar.total, 'contests (' + counts.calendar.firstDate + ' → ' + counts.calendar.lastDate + ')');
    console.log('Events     :', counts.events.total, counts.events.byCategory);
    console.log('— samples —');
    console.log('candidate[0]:', c[0]);
    console.log('state PA   :', EG.data.stateByAbbr && EG.data.stateByAbbr.PA);
    console.log('contest[0] :', cal[0]);
    console.log('event[0]   :', ev[0]);
    console.groupEnd();

    return counts;
};

/* ---------- bootstrap ------------------------------------------- */
(function bootstrap() {
    console.log(
        '%c ELECTION 2024 ',
        'background:#e63946;color:#fff;font-weight:900;letter-spacing:2px;padding:2px 8px;',
        'v' + EG.version + ' — ' + EG.buildStep
    );

    EG.data.summary();
    var snap = EG.state.summary();

    if (EG.engine && EG.engine.actions && EG.engine.actions.auditSpecialties) {
        EG.engine.actions.auditSpecialties();
    }

    /* Seed the initial scoreboard snapshot so the UI has something to read */
    if (EG.engine && EG.engine.scoreboard) EG.engine.scoreboard.run();

    /* Build and render the UI modules (behind the candidate-select modal) */
    if (EG.ui && EG.ui.map) {
        EG.ui.map.build();
        EG.ui.map.render();
    }
    if (EG.ui && EG.ui.hud) {
        EG.ui.hud.build();
        EG.ui.hud.render();
    }
    if (EG.ui && EG.ui.scoreboard) {
        EG.ui.scoreboard.build();
        EG.ui.scoreboard.render();
    }
    if (EG.ui && EG.ui.actionsPanel) {
        EG.ui.actionsPanel.build();
        EG.ui.actionsPanel.render();
    }
    if (EG.ui && EG.ui.clock) EG.ui.clock.render();

    /* Seed the news log + render the ticker */
    EG.state.newsLog.push('Game initialized. Choose your candidate to begin.');
    if (EG.ui && EG.ui.log) EG.ui.log.render();

    /* Wire the Next Turn button — disabled until the human picks a candidate */
    var nextBtn = document.getElementById('btn-next-turn');
    if (nextBtn) {
        if (!EG.state.humanPlayerId) nextBtn.disabled = true;
        nextBtn.addEventListener('click', function () {
            EG.engine.turnLoop.next();
        });
    }

    /* Step 15.2 — wire SIM PRIMARY / SIM REST buttons */
    var simPrimaryBtn = document.getElementById('btn-sim-primary');
    if (simPrimaryBtn) {
        if (!EG.state.humanPlayerId) simPrimaryBtn.disabled = true;
        simPrimaryBtn.addEventListener('click', function () { EG.simPrimary(); });
    }
    var simRestBtn = document.getElementById('btn-sim-rest');
    if (simRestBtn) {
        if (!EG.state.humanPlayerId) simRestBtn.disabled = true;
        simRestBtn.addEventListener('click', function () { EG.simRest(); });
    }

    /* Step 11.6 — show the candidate-select modal if no player chosen yet.
       Console override (EG.setPlayer('R01') before page loads) still works
       and skips the modal. */
    if (!EG.state.humanPlayerId && EG.ui && EG.ui.candidateSelect) {
        EG.ui.candidateSelect.show();
    }
}());
