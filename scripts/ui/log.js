/* ============================================================
   ui/log.js  —  Bottom news ticker

   Renders the most recent entry from EG.state.newsLog into the
   #ticker-content element. Later steps will push richer events
   here (contest results, drawn events, drop-outs).
   ============================================================ */

window.EG = window.EG || {};
EG.ui = EG.ui || {};
EG.ui.log = EG.ui.log || {};

EG.ui.log.render = function () {
    var el = document.getElementById('ticker-content');
    if (!el) return;

    var entries = EG.state.newsLog || [];
    if (entries.length === 0) {
        el.textContent = 'Awaiting first turn...';
        return;
    }

    var latest = entries[entries.length - 1];
    var count  = entries.length;
    el.textContent = latest + '   [' + count + ' news item' + (count === 1 ? '' : 's') + ']';
};
