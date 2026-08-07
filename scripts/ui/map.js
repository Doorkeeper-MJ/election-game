/* ============================================================
   ui/map.js  —  US tile-grid map

   A cartogram (each state = equal-sized tile in roughly its
   geographic position). Built dynamically as inline SVG so the
   file ships with the rest of the JS and works offline.

   API:
       EG.ui.map.build()    — one-time: insert SVG into .map-stage
       EG.ui.map.render()   — read EG.state.states and update colors
       EG.ui.map.demo()     — quick-paint sample winners (for testing)
   ============================================================ */

window.EG = window.EG || {};
EG.ui = EG.ui || {};
EG.ui.map = EG.ui.map || {};

EG.ui.map.SVG_NS = 'http://www.w3.org/2000/svg';
EG.ui.map.TILE   = 50;
EG.ui.map.GAP    = 6;

/* (abbr, col, row) — 51 cells, broadcast-style cartogram */
EG.ui.map.LAYOUT = [
    ['ME', 11, 0],
    ['VT', 10, 1], ['NH', 11, 1],
    ['WA',  1, 2], ['MT', 3, 2], ['ND', 4, 2], ['MN', 5, 2], ['WI', 6, 2], ['MI', 8, 2], ['NY', 10, 2], ['MA', 11, 2],
    ['OR',  1, 3], ['ID', 2, 3], ['WY', 3, 3], ['SD', 4, 3], ['IA', 5, 3], ['IL', 6, 3], ['IN', 7, 3], ['OH', 8, 3], ['PA', 9, 3], ['NJ', 10, 3], ['CT', 11, 3], ['RI', 12, 3],
    ['CA',  0, 4], ['NV', 1, 4], ['UT', 2, 4], ['CO', 3, 4], ['NE', 4, 4], ['MO', 5, 4], ['KY', 6, 4], ['WV', 7, 4], ['VA', 8, 4], ['MD',  9, 4], ['DE', 10, 4],
    ['AZ',  2, 5], ['NM', 3, 5], ['KS', 4, 5], ['AR', 5, 5], ['TN', 6, 5], ['NC', 7, 5], ['SC', 8, 5], ['DC', 9, 5],
    ['OK',  4, 6], ['LA', 5, 6], ['MS', 6, 6], ['AL', 7, 6], ['GA', 8, 6],
    ['HI',  0, 7], ['AK', 1, 7], ['TX', 4, 7], ['FL', 9, 7]
];

/* ---------- helpers --------------------------------------------- */
function svgEl(name, attrs) {
    var el = document.createElementNS(EG.ui.map.SVG_NS, name);
    if (attrs) {
        Object.keys(attrs).forEach(function (k) { el.setAttribute(k, attrs[k]); });
    }
    return el;
}

EG.ui.map.partyClass = function (candidateId) {
    if (!candidateId) return null;
    var c = EG.data.candidateById[candidateId];
    if (!c) return null;
    switch (c.party) {
        case 'Republican': return 'rep';
        case 'Democrat':   return 'dem';
        default:           return 'ind';
    }
};

/* ---------- build ----------------------------------------------- */
EG.ui.map.build = function () {
    var container = document.querySelector('.map-stage');
    if (!container) return;

    /* drop the static placeholder if present */
    var placeholder = container.querySelector('.map-placeholder');
    if (placeholder) placeholder.parentNode.removeChild(placeholder);

    /* avoid duplicate builds */
    var existing = container.querySelector('svg.us-map');
    if (existing) existing.parentNode.removeChild(existing);

    var step = EG.ui.map.TILE + EG.ui.map.GAP;
    var cols = 13, rows = 8;
    var w = cols * step - EG.ui.map.GAP;
    var h = rows * step - EG.ui.map.GAP;

    var svg = svgEl('svg', {
        'class':              'us-map',
        'viewBox':            '0 0 ' + w + ' ' + h,
        'preserveAspectRatio':'xMidYMid meet',
        'width':              '100%',
        'height':             '100%'
    });

    EG.ui.map.LAYOUT.forEach(function (entry) {
        var abbr = entry[0], col = entry[1], row = entry[2];
        var sd = EG.data.stateByAbbr[abbr];
        var ev = sd ? sd.electoralVotes : '';

        var g = svgEl('g', {
            'class':     'tile',
            'id':        'tile-' + abbr,
            'transform': 'translate(' + (col * step) + ',' + (row * step) + ')'
        });

        g.appendChild(svgEl('rect', {
            'class':  'tile-bg',
            'width':  EG.ui.map.TILE,
            'height': EG.ui.map.TILE,
            'rx':     4
        }));

        var abbrText = svgEl('text', {
            'class':       'tile-abbr',
            'x':           EG.ui.map.TILE / 2,
            'y':           EG.ui.map.TILE / 2 + 2,
            'text-anchor': 'middle'
        });
        abbrText.textContent = abbr;
        g.appendChild(abbrText);

        var evText = svgEl('text', {
            'class':       'tile-ev',
            'x':           EG.ui.map.TILE / 2,
            'y':           EG.ui.map.TILE - 6,
            'text-anchor': 'middle'
        });
        evText.textContent = ev;
        g.appendChild(evText);

        /* primary-winner indicator dots (hidden by default) */
        var demDot = svgEl('circle', {
            'class':   'tile-dem-dot',
            'cx':      7,
            'cy':      7,
            'r':       3,
            'display': 'none'
        });
        g.appendChild(demDot);

        var repDot = svgEl('circle', {
            'class':   'tile-rep-dot',
            'cx':      EG.ui.map.TILE - 7,
            'cy':      7,
            'r':       3,
            'display': 'none'
        });
        g.appendChild(repDot);

        svg.appendChild(g);
    });

    container.appendChild(svg);
};

/* ---------- render ---------------------------------------------- */
EG.ui.map.render = function () {
    EG.ui.map.LAYOUT.forEach(function (entry) {
        var abbr = entry[0];
        var tile = document.getElementById('tile-' + abbr);
        if (!tile) return;

        var st = EG.state.getState(abbr);
        if (!st) return;

        tile.classList.remove('tile--gen-rep', 'tile--gen-dem', 'tile--gen-ind');

        var demDot = tile.querySelector('.tile-dem-dot');
        var repDot = tile.querySelector('.tile-rep-dot');

        if (st.generalWinner) {
            var gp = EG.ui.map.partyClass(st.generalWinner);
            if (gp) tile.classList.add('tile--gen-' + gp);
            /* hide primary dots once general is called — clean visual */
            if (demDot) demDot.setAttribute('display', 'none');
            if (repDot) repDot.setAttribute('display', 'none');
        } else {
            if (demDot) demDot.setAttribute('display', st.demWinner ? 'inline' : 'none');
            if (repDot) repDot.setAttribute('display', st.repWinner ? 'inline' : 'none');
        }
    });
};

/* ---------- demo (for verifying Step 4) -------------------------- */
EG.ui.map.demo = function () {
    /* Paints a recognizable scenario so you can see all coloring paths:
       - PA: dem primary winner only
       - SC: rep primary winner only
       - CA: both primaries called
       - TX, FL, GA, NC, OH: general winner = Republican
       - NY, MA, IL, WA, OR: general winner = Democrat
       - WI: general winner = Independent (RFK Jr.) — to demo purple */
    var s = EG.state;
    s.getState('PA').demWinner = 'D02';
    s.getState('SC').repWinner = 'R01';
    s.getState('CA').demWinner = 'D02';
    s.getState('CA').repWinner = 'R01';
    ['TX','FL','GA','NC','OH'].forEach(function (a) { s.getState(a).generalWinner = 'R01'; });
    ['NY','MA','IL','WA','OR'].forEach(function (a) { s.getState(a).generalWinner = 'D02'; });
    s.getState('WI').generalWinner = 'I01';
    EG.ui.map.render();
    console.log('Map demo applied — try EG.state.reset(); EG.ui.map.render(); to clear.');
};
