/* ============================================================
   ui/clock.js  —  Header date/turn display

   Reads EG.state.turn + the current calendar contest and
   writes a compact label into the #clock element in the header.
   ============================================================ */

window.EG = window.EG || {};
EG.ui = EG.ui || {};
EG.ui.clock = EG.ui.clock || {};

EG.ui.clock.render = function () {
    var el = document.getElementById('clock');
    if (!el) return;

    if (EG.state.phase === 'concluded') {
        el.textContent = '— ELECTION CONCLUDED —';
        return;
    }

    var contest = EG.state.getCurrentContest();
    var turnLbl = 'TURN ' + EG.state.turn;
    if (contest) {
        el.textContent = turnLbl + ' · ' + contest.date.toUpperCase();
    } else {
        el.textContent = turnLbl + ' · END OF SEASON';
    }
};
