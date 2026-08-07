/* ============================================================
   state.js  —  mutable game-state model

   EG.data  = immutable reference data (loaded in Step 2).
   EG.state = the LIVE game state — what mutates as the game is
              played. The engine (Steps 6–12) will read/write here.

   Shape:
       EG.state.turn                  — counter, advances each cycle
       EG.state.phase                 — 'primary' | 'convention' | 'general' | 'concluded'
       EG.state.currentContestIndex   — pointer into EG.data.calendar
       EG.state.humanPlayerId         — set when the player picks a candidate
       EG.state.candidates[]          — per-candidate runtime stats
       EG.state.states[]              — per-state runtime results
       EG.state.eventLog[]            — random events drawn this game
       EG.state.newsLog[]             — chronological news strings

   Helpers:
       EG.state.init()                — wipe + initialize from EG.data
       EG.state.reset()               — alias for init()
       EG.state.getCandidate(id)      — runtime row by id
       EG.state.getCandidateInfo(id)  — merged base data + runtime view
       EG.state.getActiveCandidates() — only candidates still running
       EG.state.getState(abbr)        — runtime row by state abbr
       EG.state.getCurrentContest()   — next contest from calendar
       EG.state.summary()             — pretty console dump for verifying
   ============================================================ */

window.EG = window.EG || {};
EG.state = EG.state || {};

/* ---------- internal: build a fresh state object ---------------- */
function makeInitialState() {
    return {
        turn: 0,
        phase: 'primary',
        currentContestIndex: 0,
        humanPlayerId: null,

        candidates: (EG.data.candidates || []).map(function (c) {
            /* Starting CP: pre-credit one turn's earnings, floored at 20 so
               every active candidate can afford Rally (15) or Debate Prep
               (20) on Turn 1. Formula MUST stay in sync with engine/points.js
               calculate(); divergence shows up immediately as wrong starting
               CP on the HUD. Inactive starters (Tim Scott, Burgum) get 0. */
            var cpEarned = 10
                + Math.floor((c.polling         || 0) / 5)
                + Math.floor((c.campaignFunds   || 0) / 20)
                + Math.floor((c.nameRecognition || 0) / 20);
            var startingCp = c.initiallyActive ? Math.max(cpEarned, 20) : 0;
            return {
                id:                c.id,
                cp:                startingCp,         // campaign points (the spendable currency)
                polling:           c.polling,          // mutates over the season
                delegates:         0,                  // primary delegates won
                active:            !!c.initiallyActive, // true unless candidate dropped pre-game
                droppedTurn:       null,               // filled in when they exit
                pendingAction:     null,               // { id: 'rally' } — staged action
                contestMultiplier: 1,                  // multiplies polling in next contest
                momentum:          0,                  // −100..+100, decays toward 0 each turn
                pollingHistory:    []                  // last 3 polling snapshots (for trend)
            };
        }),

        states: (EG.data.states || []).map(function (s) {
            return {
                abbr:            s.abbr,
                demWinner:       null,     // candidate id of Dem primary winner
                repWinner:       null,     // candidate id of Rep primary winner
                demAllocations:  {},       // { candidateId: delegateCount }
                repAllocations:  {},
                generalWinner:   null      // candidate id who carried the state in Nov
            };
        }),

        eventLog:     [],
        eventDeck:    [],     /* shuffled IDs remaining in current cycle */
        eventDiscard: [],     /* IDs fired in current cycle */
        nominees:     { Republican: null, Democrat: null, winner: null },
        newsLog:      [],
        simAll:       false,  /* Step 15.2: when true, aiPlayer also stages for the human */
        brokeredPending: null /* Step 15.4: convention.js writes ballot data here when brokered */
    };
}

/* ---------- (re)initialize the live state ----------------------- */
EG.state.init = function () {
    var fresh = makeInitialState();
    Object.keys(fresh).forEach(function (k) { EG.state[k] = fresh[k]; });
    return EG.state;
};

EG.state.reset = EG.state.init;

/* ---------- accessors ------------------------------------------- */
EG.state.getCandidate = function (id) {
    for (var i = 0; i < EG.state.candidates.length; i++) {
        if (EG.state.candidates[i].id === id) return EG.state.candidates[i];
    }
    return null;
};

EG.state.getCandidateInfo = function (id) {
    var runtime = EG.state.getCandidate(id);
    var base    = EG.data.candidateById ? EG.data.candidateById[id] : null;
    if (!runtime || !base) return null;
    return Object.assign({}, base, {
        cp:          runtime.cp,
        polling:     runtime.polling,
        delegates:   runtime.delegates,
        active:      runtime.active,
        droppedTurn: runtime.droppedTurn
    });
};

EG.state.getActiveCandidates = function () {
    return EG.state.candidates.filter(function (c) { return c.active; });
};

EG.state.getState = function (abbr) {
    for (var i = 0; i < EG.state.states.length; i++) {
        if (EG.state.states[i].abbr === abbr) return EG.state.states[i];
    }
    return null;
};

EG.state.getCurrentContest = function () {
    var cal = EG.data.calendar || [];
    return cal[EG.state.currentContestIndex] || null;
};

/* ---------- summary helper (for verification) ------------------- */
EG.state.summary = function () {
    var cands         = EG.state.candidates;
    var actives       = EG.state.getActiveCandidates();
    var contest       = EG.state.getCurrentContest();
    var statesCalled  = EG.state.states.filter(function (s) {
        return s.demWinner || s.repWinner || s.generalWinner;
    }).length;

    var topByDelegates = cands.slice()
        .sort(function (a, b) { return b.delegates - a.delegates; })
        .slice(0, 5)
        .map(function (c) {
            var base = EG.data.candidateById[c.id];
            return (base ? base.name : c.id) +
                   ' (' + (base ? base.party.slice(0, 3).toUpperCase() : '???') + ')' +
                   ' — ' + c.delegates + ' del, ' + c.polling + '% poll, ' + c.cp + ' CP';
        });

    console.group('%c EG.state.summary() ', 'background:#f4c542;color:#000;font-weight:900;padding:2px 8px;');
    console.log('Turn         :', EG.state.turn, '(' + EG.state.phase + ')');
    console.log('Human player :', EG.state.humanPlayerId || '(not chosen)');
    console.log('Candidates   :', cands.length, '(' + actives.length + ' active, ' + (cands.length - actives.length) + ' dropped)');
    console.log('States       :', EG.state.states.length, '(' + statesCalled + ' called)');
    console.log('News entries :', EG.state.newsLog.length);
    console.log('Events drawn :', EG.state.eventLog.length);
    if (contest) {
        console.log('Next contest : #' + contest.order + ' — ' + contest.date + ' — ' + contest.contest + ' (' + contest.party + ')');
    } else {
        console.log('Next contest : — none —');
    }
    console.log('— top by delegates —');
    topByDelegates.forEach(function (line) { console.log('  ' + line); });
    console.groupEnd();

    return {
        turn:          EG.state.turn,
        phase:         EG.state.phase,
        candidates:    cands.length,
        active:        actives.length,
        statesCalled:  statesCalled,
        nextContest:   contest
    };
};

/* ---------- auto-initialize on load ----------------------------- */
EG.state.init();
