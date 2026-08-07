/* ============================================================
   ui/brokeredModal.js  —  Step 15.4: brokered convention drama

   Pops from turnLoop.refreshUI when EG.state.brokeredPending is set
   AND not in SIM ALL mode. Renders a ballot-by-ballot tally with
   staggered fade-in per column. CONTINUE button hides modal and
   clears the pending data so it doesn't re-pop on subsequent turns.

   API:
       EG.ui.brokeredModal.show()
       EG.ui.brokeredModal.hide()
   ============================================================ */

window.EG = window.EG || {};
EG.ui = EG.ui || {};
EG.ui.brokeredModal = EG.ui.brokeredModal || {};

(function () {

    function fmt(n) {
        return (typeof n === 'number') ? n.toLocaleString('en-US') : String(n);
    }

    function findSlateEntry(slate, id) {
        for (var i = 0; i < slate.length; i++) {
            if (slate[i].id === id) return slate[i];
        }
        return null;
    }

    function buildTallyHTML(data) {
        /* Collect all candidate ids that appear in any ballot */
        var idSeen = {};
        var ordered = [];
        data.ballots.forEach(function (b) {
            b.slate.forEach(function (c) {
                if (!idSeen[c.id]) {
                    idSeen[c.id] = c;
                    ordered.push(c);
                }
            });
        });

        /* Sort by final-ballot delegates (winner at top) */
        var lastBallot = data.ballots[data.ballots.length - 1];
        var lastDels = {};
        lastBallot.slate.forEach(function (c) { lastDels[c.id] = c.dels; });
        ordered.sort(function (a, b) {
            return (lastDels[b.id] || 0) - (lastDels[a.id] || 0);
        });

        /* Names column (delay 0s — reveals immediately) */
        var nameRows = ordered.map(function (c) {
            var isWinner = (c.id === data.winner.id);
            return '<div class="brk-cell brk-cell--name' + (isWinner ? ' brk-cell--winner' : '') + '">' +
                   (isWinner ? '★ ' : '') + c.name +
                   '</div>';
        }).join('');

        var cols = [
            '<div class="brk-col brk-col--names" style="animation-delay:0s">' +
              '<div class="brk-cell brk-cell--head">CANDIDATE</div>' +
              nameRows +
            '</div>'
        ];

        /* Ballot columns — staggered animation-delay */
        data.ballots.forEach(function (b, i) {
            var delay = ((i + 1) * 0.6).toFixed(2) + 's';
            var isFinalBallot = (i === data.ballots.length - 1);

            var cells = ordered.map(function (c) {
                var entry = findSlateEntry(b.slate, c.id);
                if (!entry) {
                    return '<div class="brk-cell brk-cell--out">—</div>';
                }
                var classes = ['brk-cell'];
                var trailing = '';
                if (c.id === b.eliminated) {
                    classes.push('brk-cell--elim');
                    trailing = ' ↓';
                }
                if (isFinalBallot && c.id === data.winner.id) {
                    classes.push('brk-cell--winner');
                    trailing = ' ★';
                }
                return '<div class="' + classes.join(' ') + '">' + fmt(entry.dels) + trailing + '</div>';
            }).join('');

            cols.push(
                '<div class="brk-col" style="animation-delay:' + delay + '">' +
                  '<div class="brk-cell brk-cell--head">BALLOT ' + b.num + '</div>' +
                  cells +
                '</div>'
            );
        });

        return '<div class="brk-tally">' + cols.join('') + '</div>';
    }

    function buildHTML(data) {
        var winnerBase  = EG.data.candidateById[data.winner.id];
        var winnerParty = winnerBase ? winnerBase.party : '';
        var partyClass  = winnerParty === 'Republican' ? 'brk-rep'
                       : winnerParty === 'Democrat'   ? 'brk-dem'
                       :                                '';

        var headlines = {
            clinched:  '★ NOMINATED ON BALLOT ' + data.winner.clinchedBallot + ': ' + data.winner.name.toUpperCase() + ' ★',
            attrition: '★ NOMINATED BY ATTRITION: ' + data.winner.name.toUpperCase() + ' ★',
            fallback:  '★ FALLBACK NOMINEE: ' + data.winner.name.toUpperCase() + ' ★',
            deadlock:  '★ DEADLOCK RESOLVED: ' + data.winner.name.toUpperCase() + ' ★'
        };
        var headline = headlines[data.winner.reason] || ('★ ' + data.winner.name.toUpperCase() + ' ★');

        /* CONTINUE button animation-delay matches the last ballot's reveal so
           it visually arrives once the tally is complete. */
        var continueDelay = ((data.ballots.length + 1) * 0.6).toFixed(2) + 's';

        return (
            '<div class="brk-panel ' + partyClass + '" role="document">' +
              '<div class="brk-stripe"></div>' +
              '<div class="brk-eyebrow">' + data.label + ' CONVENTION · ' + data.venue + '</div>' +
              '<div class="brk-subtitle">' +
                fmt(data.majority) + ' delegates needed · ' + data.ballots.length + ' ballot' +
                (data.ballots.length > 1 ? 's' : '') + ' required' +
              '</div>' +
              buildTallyHTML(data) +
              '<div class="brk-headline">' + headline + '</div>' +
              '<div class="brk-buttons" style="animation-delay:' + continueDelay + '">' +
                '<button type="button" class="brk-btn" data-action="continue">CONTINUE ▶</button>' +
              '</div>' +
            '</div>'
        );
    }

    EG.ui.brokeredModal.show = function () {
        var data = EG.state.brokeredPending;
        if (!data) return;
        if (document.getElementById('brk-overlay')) return;     /* idempotent */

        var overlay = document.createElement('div');
        overlay.id = 'brk-overlay';
        overlay.className = 'brk-overlay brk-overlay--visible';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.innerHTML = buildHTML(data);

        overlay.addEventListener('click', function (e) {
            var btn = e.target.closest && e.target.closest('[data-action]');
            if (!btn) return;
            if (btn.getAttribute('data-action') === 'continue') {
                EG.ui.brokeredModal.hide();
            }
        });

        document.body.appendChild(overlay);
    };

    EG.ui.brokeredModal.hide = function () {
        var overlay = document.getElementById('brk-overlay');
        if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
        EG.state.brokeredPending = null;
    };

}());
