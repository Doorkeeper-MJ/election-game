/* ============================================================
   ui/scoreboard.js  —  Step 12: broadcast scoreboard strip

   Reads EG.state.scoreboardSnapshot (written by engine/scoreboard.js)
   and paints a compact two-row "lower-third"-style strip between
   the header and the main stage. Reshapes per phase.

   API:
       EG.ui.scoreboard.build()    — one-time DOM bootstrap
       EG.ui.scoreboard.render()   — read snapshot, repaint
   ============================================================ */

window.EG = window.EG || {};
EG.ui = EG.ui || {};
EG.ui.scoreboard = EG.ui.scoreboard || {};

(function () {

    function fmt(n) {
        if (typeof n !== 'number') return n;
        return n.toLocaleString('en-US');
    }

    function partyTag(party) {
        return party === 'Republican' ? 'GOP'
             : party === 'Democrat'   ? 'DEM'
             : party === 'Both'       ? 'BOTH'
             : (party || '').toUpperCase();
    }

    function partyCls(party) {
        return party === 'Republican' ? 'sb-party--rep'
             : party === 'Democrat'   ? 'sb-party--dem'
             :                          'sb-party--ind';
    }

    /* ---- party block for primary/convention phases --------------- */
    function renderPartyBlock(party, p) {
        if (!p || !p.leaderId) {
            return (
                '<div class="sb-party ' + partyCls(party) + '">' +
                  '<span class="sb-party-tag">' + partyTag(party) + '</span>' +
                  '<span class="sb-party-empty">—</span>' +
                '</div>'
            );
        }

        var clinched = p.nomineeId || (p.clinchThreshold && p.leaderDelegates >= p.clinchThreshold);
        var nomineeBase = p.nomineeId ? EG.data.candidateById[p.nomineeId] : null;
        var displayName = nomineeBase ? nomineeBase.name : p.leaderName;

        if (clinched) {
            return (
                '<div class="sb-party ' + partyCls(party) + ' sb-party--clinched">' +
                  '<span class="sb-party-tag">' + partyTag(party) + '</span>' +
                  '<span class="sb-party-leader">★ ' + displayName.toUpperCase() + '</span>' +
                  '<span class="sb-party-count">' + fmt(p.leaderDelegates) + ' del</span>' +
                  '<span class="sb-party-pct">' + (p.nomineeId ? 'NOMINEE' : 'CLINCHED') + '</span>' +
                '</div>'
            );
        }

        var pct = (p.clinchThreshold && p.clinchThreshold > 0)
            ? Math.min(100, Math.round((p.leaderDelegates / p.clinchThreshold) * 100))
            : 0;

        return (
            '<div class="sb-party ' + partyCls(party) + '">' +
              '<span class="sb-party-tag">' + partyTag(party) + '</span>' +
              '<span class="sb-party-leader">' + (p.leaderName || '—') + '</span>' +
              '<span class="sb-party-count">' + fmt(p.leaderDelegates) +
                (p.clinchThreshold ? ' / ' + fmt(p.clinchThreshold) : '') + '</span>' +
              '<div class="sb-bar"><div class="sb-bar-fill" style="width:' + pct + '%"></div></div>' +
              '<span class="sb-party-pct">' + pct + '%</span>' +
            '</div>'
        );
    }

    /* ---- party block for general-election phase ------------------ */
    function renderGeneralBlock(party, g) {
        if (!g) return '';
        var nomBase = g.nomineeId ? EG.data.candidateById[g.nomineeId] : null;
        var name = nomBase ? nomBase.name.toUpperCase() : '—';
        var pct = Math.min(100, Math.round((g.evs / 270) * 100));
        return (
            '<div class="sb-party ' + partyCls(party) + '">' +
              '<span class="sb-party-tag">' + partyTag(party) + '</span>' +
              '<span class="sb-party-leader">' + name + '</span>' +
              '<span class="sb-party-count">' + g.evs + ' EV' + (g.statesWon ? ' · ' + g.statesWon + ' st' : '') + '</span>' +
              '<div class="sb-bar"><div class="sb-bar-fill" style="width:' + pct + '%"></div></div>' +
              '<span class="sb-party-pct">' + g.evs + '/270</span>' +
            '</div>'
        );
    }

    /* ---- meta row (phase + progress + next) ---------------------- */
    function renderMetaRow(snap) {
        var phaseLabel = ({
            primary:    'PRIMARY',
            convention: 'CONVENTION',
            general:    'GENERAL',
            concluded:  'CONCLUDED'
        })[snap.phase] || snap.phase.toUpperCase();

        var pieces = ['<span class="sb-phase">' + phaseLabel + '</span>'];

        if (snap.phase !== 'concluded') {
            pieces.push('<span class="sb-divider">·</span>');
            pieces.push('<span class="sb-progress">CONTEST ' +
                Math.min(snap.contestIndex + 1, snap.contestsTotal) +
                ' / ' + snap.contestsTotal + '</span>');
        }

        if (snap.nextContest) {
            pieces.push('<span class="sb-divider">·</span>');
            var c = snap.nextContest;
            var label = (c.type === 'Convention')      ? c.contest
                      : (c.type === 'General Election') ? 'GENERAL ELECTION · 11/5'
                      :                                   c.contest + ' (' + partyTag(c.party) + ')';
            pieces.push('<span class="sb-next">NEXT: ' + label + ' — ' + c.date + '</span>');
        }

        return '<div class="sb-row sb-row--meta">' + pieces.join('') + '</div>';
    }

    /* ---- conclusion banner --------------------------------------- */
    function renderConclusion(snap) {
        var g = snap.general;
        if (!g || (!g.Republican.evs && !g.Democrat.evs)) {
            return '<div class="sb-conclusion">★ ELECTION CONCLUDED ★</div>';
        }
        var winId = g.winner;
        var winBase = winId ? EG.data.candidateById[winId] : null;
        var winName = winBase ? winBase.name.toUpperCase() : 'NO WINNER';
        var margin  = Math.abs(g.Republican.evs - g.Democrat.evs);
        var lead    = g.Republican.evs > g.Democrat.evs ? 'GOP' : 'DEM';
        return (
            '<div class="sb-conclusion">' +
              '<span class="sb-conclusion-star">★</span>' +
              '<span class="sb-conclusion-title">CALLED</span>' +
              '<span class="sb-conclusion-name">' + winName + '</span>' +
              '<span class="sb-conclusion-score">' +
                g.Republican.evs + '<span class="sb-vs">—</span>' + g.Democrat.evs +
              '</span>' +
              '<span class="sb-conclusion-margin">' + lead + ' +' + margin + '</span>' +
              '<span class="sb-conclusion-star">★</span>' +
            '</div>'
        );
    }

    /* ---- top-level render ---------------------------------------- */
    EG.ui.scoreboard.build = function () {
        if (document.getElementById('scoreboard')) return;
        var sb = document.createElement('section');
        sb.id = 'scoreboard';
        sb.className = 'scoreboard';
        sb.innerHTML = '<div class="sb-inner" id="sb-inner"></div>';

        var header = document.querySelector('header.broadcast-header');
        var stage  = document.querySelector('main.stage');
        if (stage && stage.parentNode) {
            stage.parentNode.insertBefore(sb, stage);
        } else if (header && header.parentNode) {
            header.parentNode.insertBefore(sb, header.nextSibling);
        } else {
            document.body.appendChild(sb);
        }
    };

    EG.ui.scoreboard.render = function () {
        var inner = document.getElementById('sb-inner');
        if (!inner) return;

        var snap = EG.state.scoreboardSnapshot;
        if (!snap) {
            inner.innerHTML = '<div class="sb-row sb-row--meta"><span class="sb-phase">AWAITING DATA</span></div>';
            return;
        }

        if (snap.phase === 'concluded') {
            inner.innerHTML = renderConclusion(snap);
            return;
        }

        var partiesRow;
        if (snap.phase === 'general' && snap.general) {
            partiesRow =
                '<div class="sb-row sb-row--parties">' +
                  renderGeneralBlock('Republican', snap.general.Republican) +
                  renderGeneralBlock('Democrat',   snap.general.Democrat) +
                  '<div class="sb-tossup">TOSS-UP: ' + snap.general.tossup.evs + ' EV</div>' +
                '</div>';
        } else {
            partiesRow =
                '<div class="sb-row sb-row--parties">' +
                  renderPartyBlock('Republican', snap.parties.Republican) +
                  renderPartyBlock('Democrat',   snap.parties.Democrat) +
                '</div>';
        }

        inner.innerHTML = renderMetaRow(snap) + partiesRow;
    };

}());
