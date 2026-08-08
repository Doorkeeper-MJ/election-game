(() => {
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };

  // src/rng.js
  var require_rng = __commonJS({
    "src/rng.js"(exports, module) {
      function mulberry32(seed) {
        let a = seed >>> 0;
        return function() {
          a |= 0;
          a = a + 1831565813 | 0;
          let t = Math.imul(a ^ a >>> 15, 1 | a);
          t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
          return ((t ^ t >>> 14) >>> 0) / 4294967296;
        };
      }
      function makeRng(seed) {
        let a = seed >>> 0;
        const f = function() {
          a |= 0;
          a = a + 1831565813 | 0;
          let t = Math.imul(a ^ a >>> 15, 1 | a);
          t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
          return ((t ^ t >>> 14) >>> 0) / 4294967296;
        };
        f.getState = function() {
          return a >>> 0;
        };
        f.setState = function(s) {
          a = s >>> 0;
        };
        return f;
      }
      module.exports = { mulberry32, makeRng };
    }
  });

  // ../model/data-2016.js
  var require_data_2016 = __commonJS({
    "../model/data-2016.js"(exports, module) {
      var AXES = ["Immigration", "Trade", "Economy/Jobs", "Foreign Policy", "Establishment", "Social Conservatism"];
      var cycle2016 = {
        year: 2016,
        party: "Republican",
        mood: [9, 7, 8, 6, 8, 7],
        salience: [9, 7, 8, 5, 10, 5],
        delegatesToClinch: 1237
      };
      var candidates2016 = [
        {
          id: "R16-1",
          name: "Donald Trump",
          party: "Republican",
          polling: 35,
          funds: 50,
          calib: { issues: [9, 9, 9, 7, 10, 5], strength: 9, competence: 7, authenticity: 10 }
        },
        {
          id: "R16-2",
          name: "Ted Cruz",
          party: "Republican",
          polling: 20,
          funds: 25,
          calib: { issues: [8, 5, 6, 6, 8, 9], strength: 7, competence: 7, authenticity: 7 }
        },
        {
          id: "R16-3",
          name: "Marco Rubio",
          party: "Republican",
          polling: 15,
          funds: 22,
          calib: { issues: [6, 3, 5, 8, 3, 8], strength: 5, competence: 7, authenticity: 4 }
        },
        {
          id: "R16-4",
          name: "John Kasich",
          party: "Republican",
          polling: 8,
          funds: 12,
          calib: { issues: [3, 3, 5, 7, 2, 5], strength: 4, competence: 7, authenticity: 5 }
        },
        {
          id: "R16-5",
          name: "Jeb Bush",
          party: "Republican",
          polling: 5,
          funds: 100,
          calib: { issues: [3, 2, 4, 8, 1, 6], strength: 3, competence: 7, authenticity: 3 }
        },
        {
          id: "R16-6",
          name: "Ben Carson",
          party: "Republican",
          polling: 10,
          funds: 28,
          calib: { issues: [7, 5, 5, 4, 9, 9], strength: 3, competence: 8, authenticity: 8 }
        },
        {
          id: "R16-7",
          name: "Chris Christie",
          party: "Republican",
          polling: 3,
          funds: 8,
          calib: { issues: [5, 4, 5, 7, 3, 5], strength: 8, competence: 7, authenticity: 6 }
        },
        {
          id: "R16-8",
          name: "Rand Paul",
          party: "Republican",
          polling: 3,
          funds: 12,
          calib: { issues: [6, 6, 6, 4, 7, 6], strength: 4, competence: 6, authenticity: 7 }
        },
        {
          id: "R16-9",
          name: "Mike Huckabee",
          party: "Republican",
          polling: 2.5,
          funds: 4,
          calib: { issues: [6, 5, 6, 5, 7, 10], strength: 5, competence: 7, authenticity: 7 }
        }
      ];
      var calendar2016 = [
        { date: "2016-02-01", state: "Iowa", delegates: 30 },
        { date: "2016-02-09", state: "New Hampshire", delegates: 23 },
        { date: "2016-02-20", state: "South Carolina", delegates: 50 },
        { date: "2016-02-23", state: "Nevada", delegates: 30 },
        { date: "2016-03-01", state: "Alabama", delegates: 50 },
        { date: "2016-03-01", state: "Alaska", delegates: 28 },
        { date: "2016-03-01", state: "Arkansas", delegates: 40 },
        { date: "2016-03-01", state: "Georgia", delegates: 76 },
        { date: "2016-03-01", state: "Massachusetts", delegates: 42 },
        { date: "2016-03-01", state: "Minnesota", delegates: 38 },
        { date: "2016-03-01", state: "Oklahoma", delegates: 43 },
        { date: "2016-03-01", state: "Tennessee", delegates: 58 },
        { date: "2016-03-01", state: "Texas", delegates: 155 },
        { date: "2016-03-01", state: "Vermont", delegates: 16 },
        { date: "2016-03-01", state: "Virginia", delegates: 49 },
        { date: "2016-03-05", state: "Kansas", delegates: 40 },
        { date: "2016-03-05", state: "Kentucky", delegates: 46 },
        { date: "2016-03-05", state: "Louisiana", delegates: 46 },
        { date: "2016-03-05", state: "Maine", delegates: 23 },
        { date: "2016-03-06", state: "Puerto Rico", delegates: 23 },
        { date: "2016-03-08", state: "Hawaii", delegates: 19 },
        { date: "2016-03-08", state: "Idaho", delegates: 32 },
        { date: "2016-03-08", state: "Michigan", delegates: 59 },
        { date: "2016-03-08", state: "Mississippi", delegates: 40 },
        { date: "2016-03-10", state: "Virgin Islands", delegates: 9 },
        { date: "2016-03-12", state: "District of Columbia", delegates: 19 },
        { date: "2016-03-12", state: "Guam", delegates: 9 },
        { date: "2016-03-12", state: "Wyoming", delegates: 29 },
        { date: "2016-03-15", state: "Florida", delegates: 99 },
        { date: "2016-03-15", state: "Illinois", delegates: 69 },
        { date: "2016-03-15", state: "Missouri", delegates: 52 },
        { date: "2016-03-15", state: "North Carolina", delegates: 72 },
        { date: "2016-03-15", state: "Northern Mariana Islands", delegates: 9 },
        { date: "2016-03-15", state: "Ohio", delegates: 66 },
        { date: "2016-03-22", state: "American Samoa", delegates: 9 },
        { date: "2016-03-22", state: "Arizona", delegates: 58 },
        { date: "2016-03-22", state: "Utah", delegates: 40 },
        { date: "2016-04-01", state: "North Dakota", delegates: 28 },
        { date: "2016-04-05", state: "Wisconsin", delegates: 42 },
        { date: "2016-04-09", state: "Colorado", delegates: 37 },
        { date: "2016-04-19", state: "New York", delegates: 95 },
        { date: "2016-04-26", state: "Connecticut", delegates: 28 },
        { date: "2016-04-26", state: "Delaware", delegates: 16 },
        { date: "2016-04-26", state: "Maryland", delegates: 38 },
        { date: "2016-04-26", state: "Pennsylvania", delegates: 71 },
        { date: "2016-04-26", state: "Rhode Island", delegates: 19 },
        { date: "2016-05-03", state: "Indiana", delegates: 57 },
        { date: "2016-05-10", state: "Nebraska", delegates: 36 },
        { date: "2016-05-10", state: "West Virginia", delegates: 34 },
        { date: "2016-05-17", state: "Oregon", delegates: 28 },
        { date: "2016-05-24", state: "Washington", delegates: 44 },
        { date: "2016-06-07", state: "California", delegates: 172 },
        { date: "2016-06-07", state: "Montana", delegates: 27 },
        { date: "2016-06-07", state: "New Jersey", delegates: 51 },
        { date: "2016-06-07", state: "New Mexico", delegates: 24 },
        { date: "2016-06-07", state: "South Dakota", delegates: 29 }
      ];
      module.exports = { AXES, cycle2016, candidates2016, calendar2016 };
    }
  });

  // src/gameState.js
  var require_gameState = __commonJS({
    "src/gameState.js"(exports, module) {
      var RNG = require_rng();
      var { candidates2016, calendar2016, cycle2016 } = require_data_2016();
      function buildField(candidates) {
        return candidates.map((c) => ({ ...c, momentum: 0, delegates: 0 }));
      }
      function groupByDate(calendar) {
        const turns = [];
        let cur = null;
        for (const contest of calendar) {
          if (!cur || cur.date !== contest.date) {
            cur = { date: contest.date, contests: [] };
            turns.push(cur);
          }
          cur.contests.push(contest);
        }
        return turns;
      }
      function newGame2(playerId, seed) {
        const s = seed === void 0 || seed === null ? Date.now() >>> 0 : seed >>> 0;
        return {
          seed: s,
          // INVARIANT (rng seam): ONE makeRng instance is created here, ONCE per
          // game, stored as game.rng, and passed to EVERY awardDelegates call across
          // the whole season in calendar order. It is never re-created or re-seeded
          // per turn or per contest — a re-seed would reset the stream and break
          // digit-for-digit identity with runPrimary. See turnLoop.resolveTurn.
          // makeRng's stream is byte-identical to mulberry32 (proven in
          // verify-makerng.js), so this switch does not change any outcome; it only
          // adds getState()/setState() for the upcoming legibility counterfactual.
          rng: RNG.makeRng(s),
          field: buildField(candidates2016),
          cycle: cycle2016,
          calendar: calendar2016,
          turns: groupByDate(calendar2016),
          turnIndex: 0,
          phase: "primary",
          // "primary" | "concluded"
          playerId,
          nominee: null,
          clinch: cycle2016.delegatesToClinch,
          // 1237
          history: []
        };
      }
      module.exports = { newGame: newGame2, buildField, groupByDate };
    }
  });

  // ../model/config.js
  var require_config = __commonJS({
    "../model/config.js"(exports, module) {
      module.exports = {
        // Authenticity multiplier bounds: Authenticity 0 maps to AUTH_MIN,
        // 10 maps to AUTH_MAX (linear in between). Bounds the "authentic
        // outsider" amplification so it can't swing wildly.
        AUTH_MIN: 0.7,
        AUTH_MAX: 1.3,
        // Scale that puts the 0-10ish calib score on the same magnitude
        // as the polling term inside awardDelegates.
        CALIB_SCALE: 10,
        // Additive resume-bonus per point of Strength / Competence above
        // or below 5 (so +/-0.5 max each at 0.1). ADDITIVE, never multiplier.
        STRCOMP_SCALE: 0.1,
        // Composite-score weights used by awardDelegates.
        W_POLL: 0.3,
        // polling term
        W_MOMENTUM: 0.15,
        // momentum term
        W_ISSUE: 0.1,
        // calibration term (the revived dead slot)
        W_RANDOM: 0.05,
        // random swing term (x20 internally = +/-5)
        // Viability threshold: share of total composite score required
        // to receive delegates in a contest (ported from AwardDelegates).
        VIABILITY: 0.15,
        /* ── Race dynamics (contest-driven momentum) ──────────────
           Separate from the calibration knobs above — these govern
           path-dependence between contests, not candidate scoring.
           Momentum feeds the score via the (pre-existing) W_MOMENTUM
           term; these control how contests move it. */
        MOM_DECAY: 0.7,
        // per-contest momentum decay (v06 engine's existing 0.7)
        /* Winner gains / losers bleed, scaled by EXPECTATIONS — the
           current delegate leader is expected to win, so wins barely
           move them while losses cost dearly; for everyone else the
           reverse. This is what lets a challenger catch fire. */
        MOM_EXPECTED_GAIN: 0.1,
        // leader wins (expected): token gain
        MOM_UPSET_GAIN: 72,
        // non-leader wins (upset): big gain
        MOM_LEADER_BLEED: 50,
        // leader loses (stumble): big bleed
        MOM_LOSE_BLEED: 0.1
        // non-leader loses (expected): token bleed
      };
    }
  });

  // ../model/engine.js
  var require_engine = __commonJS({
    "../model/engine.js"(exports, module) {
      var CFG2 = require_config();
      function computeCalibScore(cand, cycle) {
        if (!cand.calib || !cycle || !cycle.mood || !cycle.salience) return 5;
        let sumSal = 0;
        let sumWeighted = 0;
        for (let a = 0; a < 6; a++) {
          const mood = cycle.mood[a];
          const sal = cycle.salience[a];
          const pos = cand.calib.issues[a];
          sumWeighted += sal * (10 - Math.abs(pos - mood));
          sumSal += sal;
        }
        if (sumSal === 0) return 5;
        const alignment = sumWeighted / sumSal;
        const authFactor = CFG2.AUTH_MIN + cand.calib.authenticity * (CFG2.AUTH_MAX - CFG2.AUTH_MIN) / 10;
        return alignment * authFactor + CFG2.STRCOMP_SCALE * (cand.calib.strength - 5) + CFG2.STRCOMP_SCALE * (cand.calib.competence - 5);
      }
      function awardDelegates(totalDel, field, cycle, rng) {
        const scored = field.map((cand) => {
          const rand = (rng() - 0.5) * 10;
          const calib = computeCalibScore(cand, cycle);
          let score = cand.polling * CFG2.W_POLL + cand.momentum * CFG2.W_MOMENTUM + calib * CFG2.W_ISSUE * CFG2.CALIB_SCALE + rand * CFG2.W_RANDOM * 20;
          score = Math.max(0.1, score);
          return { cand, score };
        });
        const totalScore = scored.reduce((s, x) => s + x.score, 0);
        const viable = scored.filter((x) => totalScore > 0 && x.score / totalScore >= CFG2.VIABILITY);
        const viableTotal = viable.reduce((s, x) => s + x.score, 0);
        const awards = [];
        for (const x of viable) {
          if (viableTotal <= 0) break;
          const share = x.score / viableTotal;
          const dels = Math.round(totalDel * share);
          x.cand.delegates += dels;
          awards.push({ name: x.cand.name, delegates: dels, share });
        }
        return awards;
      }
      function processContestMomentum(field, awards) {
        let winner = null;
        let best = -1;
        for (const a of awards) {
          if (a.delegates > best) {
            best = a.delegates;
            winner = a.name;
          }
        }
        let leader = null;
        let lead = -1;
        for (const cand of field) {
          const key = cand.delegates + cand.polling / 1e3;
          if (key > lead) {
            lead = key;
            leader = cand.name;
          }
        }
        for (const cand of field) {
          cand.momentum *= CFG2.MOM_DECAY;
          if (cand.name === winner && best > 0) {
            cand.momentum += cand.name === leader ? CFG2.MOM_EXPECTED_GAIN : CFG2.MOM_UPSET_GAIN;
          } else {
            cand.momentum -= cand.name === leader ? CFG2.MOM_LEADER_BLEED : CFG2.MOM_LOSE_BLEED;
          }
        }
      }
      function runPrimary(candidates, calendar, cycle, rng) {
        const field = candidates.map((c) => ({ ...c, momentum: 0, delegates: 0 }));
        for (const contest of calendar) {
          const awards = awardDelegates(contest.delegates, field, cycle, rng);
          processContestMomentum(field, awards);
        }
        return field.sort((a, b) => b.delegates - a.delegates);
      }
      module.exports = { computeCalibScore, awardDelegates, processContestMomentum, runPrimary };
    }
  });

  // src/config-play.js
  var require_config_play = __commonJS({
    "src/config-play.js"(exports, module) {
      module.exports = {
        // "Where to campaign" lever.
        EFFORT_POOL: 3,
        // effort points the player allocates per turn
        POLL_BUMP_PER_EFFORT: 4,
        // transient polling added per effort point in a targeted state
        MAX_POLL_BUMP: 12,
        // hard cap on the per-state bump (bounded what-if)
        // "What to emphasize" lever (Slice 2). One issue axis per turn, or none.
        EMPHASIS_STRONG_THRESHOLD: 2,
        // |position − mood| <= this ⇒ the axis is a strength ("lean in")
        EMPHASIS_AUTH_BUMP: 2,
        // lean-in: transient authenticity bump (capped at 10)
        EMPHASIS_SHIFT: 2
        // shore-up: transient position shift toward mood (never past it)
      };
    }
  });

  // src/levers/campaignLever.js
  var require_campaignLever = __commonJS({
    "src/levers/campaignLever.js"(exports, module) {
      var CFG2 = require_config_play();
      function bumpForState(moves, stateName) {
        if (!moves || !moves.effort) return 0;
        const pts = moves.effort[stateName] || 0;
        if (pts <= 0) return 0;
        return Math.min(pts * CFG2.POLL_BUMP_PER_EFFORT, CFG2.MAX_POLL_BUMP);
      }
      function totalAllocated(moves) {
        if (!moves || !moves.effort) return 0;
        return Object.values(moves.effort).reduce((s, p) => s + (p > 0 ? p : 0), 0);
      }
      module.exports = { bumpForState, totalAllocated };
    }
  });

  // src/levers/emphasisLever.js
  var require_emphasisLever = __commonJS({
    "src/levers/emphasisLever.js"(exports, module) {
      var CFG2 = require_config_play();
      function modeFor(player, cycle, axis) {
        if (!player || !player.calib || !cycle || !cycle.mood) return null;
        const gap = Math.abs(player.calib.issues[axis] - cycle.mood[axis]);
        return gap <= CFG2.EMPHASIS_STRONG_THRESHOLD ? "lean-in" : "shore-up";
      }
      function applyEmphasis(player, cycle, axis) {
        if (axis === null || axis === void 0 || !player || !player.calib) return null;
        if (!Number.isInteger(axis) || axis < 0 || axis >= player.calib.issues.length) return null;
        const original = player.calib;
        const mood = cycle.mood[axis];
        const pos = original.issues[axis];
        const issues = original.issues.slice();
        let authenticity = original.authenticity;
        if (modeFor(player, cycle, axis) === "lean-in") {
          authenticity = Math.min(10, authenticity + CFG2.EMPHASIS_AUTH_BUMP);
        } else {
          const shift = Math.min(CFG2.EMPHASIS_SHIFT, Math.abs(mood - pos));
          issues[axis] = pos + Math.sign(mood - pos) * shift;
        }
        player.calib = { ...original, issues, authenticity };
        return function undo() {
          player.calib = original;
        };
      }
      module.exports = { applyEmphasis, modeFor };
    }
  });

  // src/turnLoop.js
  var require_turnLoop = __commonJS({
    "src/turnLoop.js"(exports, module) {
      var { awardDelegates, processContestMomentum } = require_engine();
      var campaignLever = require_campaignLever();
      var emphasisLever = require_emphasisLever();
      var RNG = require_rng();
      function computeEffect(realAwards, cfAwards) {
        const real = {};
        for (const a of realAwards) real[a.name] = a.delegates;
        const cf = {};
        for (const a of cfAwards) cf[a.name] = a.delegates;
        const names = Object.keys({ ...real, ...cf });
        const deltas = names.map((n) => ({
          name: n,
          real: real[n] || 0,
          cf: cf[n] || 0,
          delta: (real[n] || 0) - (cf[n] || 0)
        }));
        const winnerOf = (list) => list.reduce((b, a) => a.delegates > (b ? b.delegates : -1) ? a : b, null);
        const rw = winnerOf(realAwards);
        const cw = winnerOf(cfAwards);
        return {
          deltas,
          realWinner: rw ? rw.name : null,
          cfWinner: cw ? cw.name : null,
          flipped: !!(rw && cw && rw.name !== cw.name)
        };
      }
      function leaderOf(field) {
        return field.reduce((best, c) => c.delegates > best.delegates ? c : best, field[0]);
      }
      function resolveTurn2(game2, moves) {
        const turn = game2.turns[game2.turnIndex];
        const player = game2.field.find((c) => c.id === game2.playerId);
        const result = { date: turn.date, contests: [] };
        for (const contest of turn.contests) {
          const rngState = game2.rng.getState();
          const preField = game2.field.map((c) => ({ ...c }));
          const bump = campaignLever.bumpForState(moves, contest.state);
          if (bump !== 0 && player) player.polling += bump;
          const undoEmphasis = emphasisLever.applyEmphasis(
            player,
            game2.cycle,
            moves ? moves.emphasis : null
          );
          const awards = awardDelegates(contest.delegates, game2.field, game2.cycle, game2.rng);
          processContestMomentum(game2.field, awards);
          if (undoEmphasis) undoEmphasis();
          if (bump !== 0 && player) player.polling -= bump;
          const cfRng = RNG.makeRng(0);
          cfRng.setState(rngState);
          const cfAwards = awardDelegates(contest.delegates, preField, game2.cycle, cfRng);
          result.contests.push({
            state: contest.state,
            delegates: contest.delegates,
            awards,
            effect: computeEffect(awards, cfAwards)
          });
        }
        game2.history.push(result);
        game2.turnIndex++;
        return result;
      }
      function evaluateEnd2(game2) {
        const leader = leaderOf(game2.field);
        if (leader.delegates >= game2.clinch) {
          game2.phase = "concluded";
          game2.nominee = leader;
        } else if (game2.turnIndex >= game2.turns.length) {
          game2.phase = "concluded";
          game2.nominee = leader;
        }
        return game2.phase;
      }
      module.exports = { resolveTurn: resolveTurn2, evaluateEnd: evaluateEnd2, leaderOf };
    }
  });

  // src/ui/dom.js
  var require_dom = __commonJS({
    "src/ui/dom.js"(exports, module) {
      function el(tag, props, children) {
        const node = document.createElement(tag);
        props = props || {};
        for (const k of Object.keys(props)) {
          const v = props[k];
          if (k === "class") node.className = v;
          else if (k === "text") node.textContent = v;
          else if (k === "html") node.innerHTML = v;
          else if (k.slice(0, 2) === "on" && typeof v === "function") node.addEventListener(k.slice(2).toLowerCase(), v);
          else if (v != null) node.setAttribute(k, v);
        }
        const kids = [].concat(children == null ? [] : children);
        for (const c of kids) {
          if (c == null) continue;
          node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
        }
        return node;
      }
      function clear2(node) {
        while (node.firstChild) node.removeChild(node.firstChild);
      }
      module.exports = { el, clear: clear2 };
    }
  });

  // src/ui/candidateSelect.js
  var require_candidateSelect = __commonJS({
    "src/ui/candidateSelect.js"(exports, module) {
      var { el } = require_dom();
      var { candidates2016 } = require_data_2016();
      function render(onPick, defaultId) {
        const wrap = el("div", { class: "panel select" });
        wrap.appendChild(el("h2", { text: "PICK YOUR CANDIDATE" }));
        wrap.appendChild(el("div", { class: "hint", text: "2016 Republican primary. Run anyone. (Trump is the historical favorite \u2014 the challenge is everyone else.)" }));
        const list = el("div", { class: "cand-grid" });
        for (const c of candidates2016) {
          const isDefault = c.id === defaultId;
          const card = el("button", {
            class: "cand-card" + (isDefault ? " recommended" : ""),
            onClick: () => onPick(c.id)
          }, [
            el("span", { class: "cc-name", text: c.name }),
            el("span", { class: "cc-poll", text: `polling ${c.polling}%` }),
            isDefault ? el("span", { class: "cc-tag", text: "underdog pick" }) : null
          ]);
          list.appendChild(card);
        }
        wrap.appendChild(list);
        return wrap;
      }
      module.exports = { render };
    }
  });

  // src/ui/quickStart.js
  var require_quickStart = __commonJS({
    "src/ui/quickStart.js"(exports, module) {
      var { el } = require_dom();
      var SEEN_KEY = "egv1.quickstart_seen";
      function hasSeen() {
        try {
          return localStorage.getItem(SEEN_KEY) === "1";
        } catch (e) {
          return false;
        }
      }
      function markSeen() {
        try {
          localStorage.setItem(SEEN_KEY, "1");
        } catch (e) {
        }
      }
      function onKey(e) {
        if (e.key === "Escape") close();
      }
      function close() {
        const ov = document.getElementById("qs-overlay");
        if (ov && ov.parentNode) ov.parentNode.removeChild(ov);
        document.removeEventListener("keydown", onKey);
        markSeen();
      }
      function panel(title, kids) {
        return el(
          "div",
          { class: "qs-panel" },
          [el("div", { class: "qs-panel-title", text: title })].concat(kids)
        );
      }
      function line(props) {
        return el("p", Object.assign({ class: "qs-line" }, props));
      }
      function renderOverlay() {
        const overlay = el("div", {
          id: "qs-overlay",
          class: "qs-overlay",
          onClick: (e) => {
            if (e.target && e.target.id === "qs-overlay") close();
          }
        });
        const modal = el("div", { class: "qs-modal", role: "dialog", "aria-label": "How to play" }, [
          el("button", { class: "qs-x", text: "\u2715", "aria-label": "Close", onClick: close }),
          el("h2", { class: "qs-title", text: "HOW TO PLAY" }),
          // 1 — the subject FIRST (this repo also holds a two-party general-election
          // prototype, which is exactly why the game must say what it is up front).
          panel("THE RACE", [
            line({ class: "qs-line lead", text: "This is the 2016 Republican presidential primary \u2014 not a general election, and not a two-party simulator." }),
            line({ text: "You run one campaign for the nomination. Win it by clinching 1,237 delegates \u2014 or by holding the delegate lead when the calendar runs out." })
          ]),
          panel("THE TURN", [
            line({ text: "Each turn is one date on the primary calendar. Every state voting that day resolves at once, and the race moves on \u2014 date by date, to the last contest." })
          ]),
          panel("YOUR LEVERS", [
            line({ html: "<b>WHERE TO CAMPAIGN</b> \u2014 3 effort points, yours to spread across the states voting this turn. Stack them, split them, or hold them back." }),
            line({ html: "<b>WHAT TO EMPHASIZE</b> \u2014 press one issue this turn, or none. Lean into a strength, or shore up a weak spot." })
          ]),
          panel("THE GOLD READOUT", [
            line({ text: "After each contest, the gold line measures what your moves actually changed \u2014 your delegates with the push versus without it, same contest, same dice:" }),
            el("div", { class: "qs-example", text: "\u21B3 your moves here: Cruz +2 (16 vs 14) \xB7 Trump \u22122" }),
            line({ text: "If your push flipped a state's winner, it says so. No line means a hands-off turn." })
          ]),
          // 5 — most players run unkeyed: an invitation, never a deficiency notice.
          panel("THE BROADCAST", [
            line({ text: "Three voices can call your race \u2014 the live play-by-play, your own campaign advisor, and an outside TV commentator who is not on your payroll. Commentary brings the race to life: add an Anthropic API key in the broadcast panel to hear them." }),
            line({ class: "qs-line quiet", text: "The game is complete without a key. With one, calls bill that key's account." })
          ]),
          el("div", { class: "qs-readme", text: `Curious what's under the hood? The README's "How the simulation works" section is the full tour \u2014 rules, momentum, and what the voices are allowed to know.` }),
          el("button", { class: "run-btn qs-go", text: "TO THE RACE \u25B6", onClick: close })
        ]);
        overlay.appendChild(modal);
        document.addEventListener("keydown", onKey);
        return overlay;
      }
      function show() {
        if (document.getElementById("qs-overlay")) return;
        document.body.appendChild(renderOverlay());
      }
      function install() {
        const bar = document.querySelector(".topbar");
        if (bar && !document.getElementById("qs-help-btn")) {
          bar.appendChild(el("button", {
            id: "qs-help-btn",
            class: "qs-help",
            text: "? HOW TO PLAY",
            onClick: show
          }));
        }
        if (!hasSeen()) show();
      }
      module.exports = { install, show };
    }
  });

  // src/ui/hud.js
  var require_hud = __commonJS({
    "src/ui/hud.js"(exports, module) {
      var { el } = require_dom();
      function render(game2) {
        const wrap = el("div", { class: "panel hud" });
        const sorted = game2.field.slice().sort((a, b) => b.delegates - a.delegates);
        const leader = sorted[0];
        wrap.appendChild(el("h2", { text: "STANDINGS" }));
        wrap.appendChild(el("div", {
          class: "clinch",
          text: `Leader: ${leader.name} \u2014 ${leader.delegates} / ${game2.clinch} to clinch`
        }));
        const table = el("div", { class: "standings" });
        for (const c of sorted) {
          const isPlayer = c.id === game2.playerId;
          table.appendChild(el("div", { class: "cand-row" + (isPlayer ? " player" : "") }, [
            el("span", { class: "cand-name", text: (isPlayer ? "\u25B6 " : "") + c.name }),
            el("span", { class: "cand-del", text: `${c.delegates} del` }),
            el("span", { class: "cand-mo", text: `mo ${c.momentum.toFixed(1)}` })
          ]));
        }
        wrap.appendChild(table);
        return wrap;
      }
      module.exports = { render };
    }
  });

  // src/ui/turnPanel.js
  var require_turnPanel = __commonJS({
    "src/ui/turnPanel.js"(exports, module) {
      var { el, clear: clear2 } = require_dom();
      var CFG2 = require_config_play();
      var { AXES } = require_data_2016();
      var emphasisLever = require_emphasisLever();
      function render(game2, onResolve2) {
        const turn = game2.turns[game2.turnIndex];
        const player = game2.field.find((c) => c.id === game2.playerId);
        const wrap = el("div", { class: "panel turn-panel" });
        const moves = { effort: {}, emphasis: null };
        const POOL = CFG2.EFFORT_POOL;
        function used() {
          return Object.keys(moves.effort).reduce((s, k) => s + moves.effort[k], 0);
        }
        function remaining() {
          return POOL - used();
        }
        function redraw() {
          clear2(wrap);
          wrap.appendChild(el("h3", { text: `Turn ${game2.turnIndex + 1} of ${game2.turns.length} \u2014 ${turn.date}` }));
          wrap.appendChild(el("div", {
            class: "lever-label",
            text: `WHERE TO CAMPAIGN \u2014 ${POOL} effort points (remaining: ${remaining()})`
          }));
          for (const contest of turn.contests) {
            const cur = moves.effort[contest.state] || 0;
            wrap.appendChild(el("div", { class: "state-row" }, [
              el("span", { class: "state-name", text: `${contest.state} (${contest.delegates})` }),
              el("button", {
                class: "step",
                text: "\u2212",
                onClick: () => {
                  if (cur > 0) {
                    moves.effort[contest.state] = cur - 1;
                    redraw();
                  }
                }
              }),
              el("span", { class: "alloc", text: String(cur) }),
              el("button", {
                class: "step",
                text: "+",
                onClick: () => {
                  if (remaining() > 0) {
                    moves.effort[contest.state] = cur + 1;
                    redraw();
                  }
                }
              })
            ]));
          }
          if (player && player.calib) {
            wrap.appendChild(el("div", {
              class: "lever-label emphasis-label",
              text: "WHAT TO EMPHASIZE \u2014 one issue this turn (optional)"
            }));
            for (let a = 0; a < AXES.length; a++) {
              const mode = emphasisLever.modeFor(player, game2.cycle, a);
              const chosen = moves.emphasis === a;
              const you = player.calib.issues[a];
              const mood = game2.cycle.mood[a];
              wrap.appendChild(el("div", { class: "state-row emphasis-row" + (chosen ? " chosen" : "") }, [
                el("button", {
                  class: "step emph-pick" + (chosen ? " on" : ""),
                  text: chosen ? "\u25CF" : "\u25CB",
                  onClick: () => {
                    moves.emphasis = chosen ? null : a;
                    redraw();
                  }
                }),
                el("span", { class: "state-name", text: AXES[a] }),
                el("span", {
                  class: "emph-meta",
                  text: `you ${you} \xB7 mood ${mood} \xB7 ${mode === "lean-in" ? "STRENGTH \u2014 lean in" : "weak spot \u2014 shore up"}`
                })
              ]));
            }
          }
          wrap.appendChild(el("button", {
            class: "run-btn",
            text: "RUN CONTEST(S) \u25B6",
            onClick: () => onResolve2(moves)
          }));
          wrap.appendChild(el("div", { class: "hint", text: "Allocate 0 and emphasize nothing to play it straight (hands-off baseline)." }));
        }
        redraw();
        return wrap;
      }
      module.exports = { render };
    }
  });

  // src/ui/resultsPanel.js
  var require_resultsPanel = __commonJS({
    "src/ui/resultsPanel.js"(exports, module) {
      var { el } = require_dom();
      function lastName(full) {
        const parts = full.split(" ");
        return parts[parts.length - 1];
      }
      function effectLine(effect, playerName) {
        const moved = effect.deltas.filter((d) => d.delta !== 0).sort((a, b) => {
          if (a.name === playerName) return -1;
          if (b.name === playerName) return 1;
          return Math.abs(b.delta) - Math.abs(a.delta);
        }).slice(0, 3);
        return moved.map((d) => {
          const sign = d.delta > 0 ? "+" : "\u2212";
          const mag = Math.abs(d.delta);
          const detail = d.name === playerName ? ` (${d.real} vs ${d.cf})` : "";
          return `${lastName(d.name)} ${sign}${mag}${detail}`;
        }).join(" \xB7 ");
      }
      function render(lastResult2, game2) {
        const player = game2.field.find((c) => c.id === game2.playerId);
        const playerName = player ? player.name : null;
        const wrap = el("div", { class: "panel results" });
        wrap.appendChild(el("h3", { text: `Results \u2014 ${lastResult2.date}` }));
        let pushedAnywhere = false;
        let netPlayerDelta = 0;
        for (const c of lastResult2.contests) {
          const top = c.awards.slice().sort((a, b) => b.delegates - a.delegates).slice(0, 3).map((a) => `${lastName(a.name)} ${a.delegates}`).join(", ");
          wrap.appendChild(el("div", {
            class: "result-row",
            text: `${c.state} (${c.delegates}): ${top || "no award"}`
          }));
          const fx = c.effect;
          if (!fx || !fx.deltas) continue;
          const anyDelta = fx.deltas.some((d) => d.delta !== 0);
          if (!anyDelta) continue;
          pushedAnywhere = true;
          if (playerName) {
            const mine = fx.deltas.find((d) => d.name === playerName);
            if (mine) netPlayerDelta += mine.delta;
          }
          wrap.appendChild(el("div", {
            class: "effect-line",
            text: `\u21B3 your moves here: ${effectLine(fx, playerName)}`
          }));
          if (fx.flipped) {
            const wonIt = playerName && fx.realWinner === playerName;
            wrap.appendChild(el("div", {
              class: "effect-flip",
              text: wonIt ? `\u26A1 Your moves WON ${c.state} (was ${lastName(fx.cfWinner)}'s)` : `\u26A1 Your moves changed the winner here: ${lastName(fx.cfWinner)} \u2192 ${lastName(fx.realWinner)}`
            }));
          }
        }
        if (pushedAnywhere && playerName) {
          const sign = netPlayerDelta > 0 ? "+" : netPlayerDelta < 0 ? "\u2212" : "\xB1";
          wrap.appendChild(el("div", {
            class: "effect-summary",
            text: `Net effect of your moves this turn: ${lastName(playerName)} ${sign}${Math.abs(netPlayerDelta)} delegates`
          }));
        } else if (!pushedAnywhere) {
          wrap.appendChild(el("div", {
            class: "effect-none",
            text: "Hands-off turn \u2014 baseline result, no push measured."
          }));
        }
        return wrap;
      }
      module.exports = { render };
    }
  });

  // src/broadcast/prompts.js
  var require_prompts = __commonJS({
    "src/broadcast/prompts.js"(exports, module) {
      var FACTS_RULE = `
HARD RULE \u2014 NEVER INVENT ANYTHING.
Every number, state name, date, candidate name, and delegate count you use must come from the JSON context you are given. If a fact is not in the JSON, you do not know it and must not mention it.
Specifically, this game models ONLY: delegates, momentum, polling, per-state contests, the calendar, and the player's two levers (where to campaign, what to emphasize).
There is NO money, NO fundraising, NO ad spending, NO endorsements, NO debates, NO scandals, and NO national polling averages in this game. Never refer to any of them, not even in passing or as color.
Do not invent quotes, staffers, events, or historical claims about the real 2016 race. You are inside THIS simulation, and its JSON is the whole world.
If you are unsure whether something is in the JSON, leave it out. Fewer, true specifics beat rich, false ones.`;
      var FORMAT_RULE = `
Write plain prose. No markdown, no bullet points, no headers, no emoji, no stage directions.`;
      var ANNOUNCER = `You are the play-by-play announcer on primary night, calling results live as they come in.
${FACTS_RULE}

YOUR VOICE
Present tense, always. You are calling this as it happens, on air, right now.
Fast and energetic, but never manic. You are a professional who loves this.
You call the result FIRST, then land one short tactical read in the same breath \u2014 the read is part of the call, not a separate paragraph of analysis. Think: "Jersey's in \u2014 plus twenty-one, and that's the suburban firewall holding."
Use last names only. Numbers out loud, the way a broadcaster says them.

WHAT YOU HAVE
The JSON gives you this turn's contests, the delegate awards, the running standings, and \u2014 when the player made moves \u2014 the measured effect of those moves: the real result versus the counterfactual result if they had done nothing. A "flip" means the player's moves actually changed who won that state.
When there is a flip, that is your lead. It is the most exciting true thing on the board.
When the player's moves earned delegates without flipping anything, say so plainly and give the number.
When the player did nothing this turn, call the result straight \u2014 no invented drama about a push that never happened.

LENGTH
One to three sentences. Under 60 words. This is a call, not a segment.
${FORMAT_RULE}`;
      var ADVISOR = `You are the campaign's senior strategist, talking privately with your candidate between contests. You have been with this campaign since before it was anything. You believe in it.
${FACTS_RULE}

YOUR VOICE
You speak in "we" and "our" \u2014 our path, our states, our people. Never "you" as an outsider would use it; this is your campaign too.
You are competent and specific. You give real, usable strategy off the actual numbers: which upcoming states to push, which issue to emphasize, where the delegates actually are. A player who follows your advice should generally do better than a player who ignores it.
You are direct with your candidate about bad nights. You do not lie and you do not flatter emptily.

WHO YOU ARE, HONESTLY
But you are inside this thing, and it shows. You believe the plan is the right plan, because you helped build it. When a night goes badly you reach first for what is recoverable in it \u2014 the state that stayed close, the momentum that held \u2014 and you tend to frame the next few contests as the ones that turn it around. You protect your candidate's confidence a little, because you think that is part of the job, and you are not entirely wrong.
Your instincts are conventional: consolidate strength, work the map in front of you, keep the organization steady. That is sound advice most of the time.
What you are slower to say out loud is the structural thing \u2014 that the arithmetic may already be deciding this regardless of tactics. You are not hiding it and you would not deny it if asked directly. It is simply not where an invested person's eye goes first.

Do not caricature yourself. You are not a spin doctor, not a yes-man, and not stupid. You are a good operative who is close to it.

LENGTH
80 to 120 words. Conversational. Lead with the read, close with the concrete recommendation for this turn.
${FORMAT_RULE}`;
      var COMMENTATOR = `You are a veteran political analyst on a television panel, watching this primary from the outside. You are not on anyone's payroll and you have no stake in who wins.
${FACTS_RULE}

YOUR VOICE
You speak about the campaign in the third person \u2014 "the Cruz campaign," "they," "this operation." Never "we." You are watching, not helping.
You are dry, precise, and unsentimental. You have covered enough of these to know how they end.
You say the thing nobody inside the building wants said out loud. Usually that is the arithmetic: how many delegates are actually left, what the leader needs versus what the challenger needs, whether a good night was good enough to matter, what the calendar ahead does to a campaign that is behind. An insider's eye goes to the next state; yours goes to the whole board.
When the player's moves produced a real measured effect, credit it exactly and honestly \u2014 then say whether it changed the shape of the race or merely the shape of one night. Those are different things and you are the one who says so.
Round when you speak. You are on a panel, not reading a table. Say "about half of everything left," not "twelve twenty-six of twenty-three sixty-nine." At most one exact figure per paragraph, and only when the exact number is itself the point.

WHAT MAKES YOU WORTH LISTENING TO \u2014 AND WHEN IT FAILS
You are usually the sharper read. You see the structure while the campaign sees the schedule.
But you are outside the room. You do not know what they know about their own organization, and you have been wrong before by extrapolating a clean line from a noisy signal. Detachment is not omniscience.
The JSON contains a field called "vantage".
- When vantage is "measured": stay tight to what the numbers presently support. Name the structural fact, mark clearly what is still genuinely open, and do not forecast beyond the evidence.
- When vantage is "bold": commit. Make the forward call about where this race is heading and say it with conviction, on the strength of the real trend in front of you. Do not hedge it into mush. This is you doing what analysts do \u2014 reading the arc and calling it early. Sometimes that call is prescient. Sometimes the race turns and you were early to a conclusion the data allowed but did not promise. Commit anyway; that is the job.
In BOTH modes every fact stays true to the JSON. The difference is how far beyond the present numbers you are willing to project \u2014 never whether you tell the truth about them.

LENGTH
Two short paragraphs, 80 to 120 words total. Never three.
Analytical, conversational, no throat-clearing.
End on a complete thought \u2014 a call that stops mid-sentence is worse
than a shorter one.
${FORMAT_RULE}`;
      module.exports = { ANNOUNCER, ADVISOR, COMMENTATOR };
    }
  });

  // src/broadcast/context.js
  var require_context = __commonJS({
    "src/broadcast/context.js"(exports, module) {
      function lastName(full) {
        const parts = String(full).split(" ");
        return parts[parts.length - 1];
      }
      function vantageFor(game2) {
        const h = (game2.seed >>> 0) + game2.turnIndex * 2654435761 >>> 0;
        return h % 3 === 0 ? "bold" : "measured";
      }
      function build(game2, lastResult2) {
        const player = game2.field.find((c) => c.id === game2.playerId) || null;
        const playerName = player ? player.name : null;
        const sorted = game2.field.slice().sort((a, b) => b.delegates - a.delegates);
        const standings = sorted.filter((c) => c.delegates > 0 || c.id === game2.playerId || sorted.indexOf(c) < 4).map((c, i) => ({
          rank: sorted.indexOf(c) + 1,
          name: c.name,
          delegates: c.delegates,
          momentum: Math.round(c.momentum * 100) / 100,
          is_player: c.id === game2.playerId
        }));
        const leader = sorted[0];
        const playerRank = player ? sorted.indexOf(player) + 1 : null;
        let delegatesRemaining = 0;
        const upcoming = [];
        for (let t = game2.turnIndex; t < game2.turns.length; t++) {
          const turn = game2.turns[t];
          for (const c of turn.contests) {
            delegatesRemaining += c.delegates;
            if (upcoming.length < 10) {
              upcoming.push({ date: turn.date, state: c.state, delegates: c.delegates, is_next_turn: t === game2.turnIndex });
            }
          }
        }
        const playerNeeds = player ? Math.max(0, game2.clinch - player.delegates) : null;
        const leaderNeeds = Math.max(0, game2.clinch - leader.delegates);
        let seasonNetDelta = 0, flipsWon = 0, contestsPushed = 0;
        for (const res of game2.history) {
          for (const c of res.contests) {
            const fx = c.effect;
            if (!fx || !fx.deltas) continue;
            const mine = playerName ? fx.deltas.find((d) => d.name === playerName) : null;
            if (mine && mine.delta !== 0) {
              seasonNetDelta += mine.delta;
              contestsPushed++;
            }
            if (fx.flipped && playerName && fx.realWinner === playerName) flipsWon++;
          }
        }
        let thisTurn = null;
        if (lastResult2) {
          let turnNetDelta = 0;
          const contests = lastResult2.contests.map((c) => {
            const awards = c.awards.slice().sort((a, b) => b.delegates - a.delegates).filter((a) => a.delegates > 0).map((a) => ({ name: a.name, delegates: a.delegates }));
            const row = { state: c.state, delegates_at_stake: c.delegates, awards };
            const fx = c.effect;
            if (fx && fx.deltas && fx.deltas.some((d) => d.delta !== 0)) {
              const mine = playerName ? fx.deltas.find((d) => d.name === playerName) : null;
              if (mine) turnNetDelta += mine.delta;
              row.player_moves_measured_effect = {
                explanation: "Real result vs. the same contest re-run with the player making no moves. Difference is caused by the player's moves.",
                deltas: fx.deltas.filter((d) => d.delta !== 0).map((d) => ({ name: d.name, delta: d.delta, real: d.real, without_player_moves: d.cf })),
                flipped_winner: !!fx.flipped,
                winner_without_player_moves: fx.flipped ? fx.cfWinner : null,
                actual_winner: fx.flipped ? fx.realWinner : null
              };
            }
            return row;
          });
          thisTurn = {
            date: lastResult2.date,
            contests,
            player_net_delegate_effect_this_turn: turnNetDelta,
            player_made_moves: contests.some((c) => c.player_moves_measured_effect)
          };
        }
        return {
          game: {
            cycle: "2016 Republican presidential primary (simulation)",
            turn: game2.turnIndex,
            total_turns: game2.turns.length,
            phase: game2.phase,
            delegates_to_clinch: game2.clinch
          },
          player: player ? {
            name: player.name,
            last_name: lastName(player.name),
            delegates: player.delegates,
            rank: playerRank,
            momentum: Math.round(player.momentum * 100) / 100,
            delegates_needed_to_clinch: playerNeeds,
            mathematically_alive: playerNeeds !== null && playerNeeds <= delegatesRemaining
          } : null,
          leader: {
            name: leader.name,
            delegates: leader.delegates,
            delegates_needed_to_clinch: leaderNeeds,
            is_player: player ? leader.id === player.id : false
          },
          standings,
          calendar: {
            delegates_remaining_in_all_future_contests: delegatesRemaining,
            leader_can_clinch: leaderNeeds <= delegatesRemaining,
            upcoming_contests: upcoming
          },
          this_turn_result: thisTurn,
          player_season_totals: {
            net_delegates_gained_from_own_moves: seasonNetDelta,
            contests_where_moves_measurably_mattered: contestsPushed,
            states_won_that_would_otherwise_have_been_lost: flipsWon
          },
          levers_available_to_player: {
            where_to_campaign: "3 effort points per turn, allocated across the states voting that turn",
            what_to_emphasize: "one issue axis per turn, or none"
          },
          vantage: vantageFor(game2)
        };
      }
      module.exports = { build, vantageFor };
    }
  });

  // src/broadcast/client.js
  var require_client = __commonJS({
    "src/broadcast/client.js"(exports, module) {
      var PROMPTS = require_prompts();
      var context = require_context();
      var STORAGE_KEY = "eg.claude_api_key";
      var API_ENDPOINT = "https://api.anthropic.com/v1/messages";
      var SONNET = "claude-sonnet-4-6";
      var OPUS = "claude-opus-5";
      var VOICES = {
        // 200 is safe ONLY because Sonnet 4.6 does no thinking here: all 200 tokens
        // are prose, which comfortably covers the announcer's "under 60 words" rule.
        // This is the tightest budget of the three. Move this voice to OPUS (or any
        // thinking-by-default model) and 200 truncates on the first call — raise it
        // to ~1200 in the same commit, or the announcer starts cutting off mid-call.
        announcer: {
          system: PROMPTS.ANNOUNCER,
          model: SONNET,
          max_tokens: 200,
          ask: "Call this turn's result."
        },
        // Sonnet, no thinking: 400 tokens of pure prose against 80-120 words.
        advisor: {
          system: PROMPTS.ADVISOR,
          model: SONNET,
          max_tokens: 400,
          ask: "Where do we stand, and what do we do this turn?"
        },
        // Opus 5 thinks by default, so this budget is shared. 400 truncated at ~130
        // words (2026-08-06) because thinking consumed most of it; 1500 leaves room
        // for adaptive thinking plus the full 80-120 words.
        commentator: {
          system: PROMPTS.COMMENTATOR,
          model: OPUS,
          max_tokens: 1500,
          ask: "What's your read on this race right now?"
        }
      };
      function getStoredKey() {
        try {
          return localStorage.getItem(STORAGE_KEY);
        } catch (e) {
          return null;
        }
      }
      function setStoredKey(key) {
        try {
          localStorage.setItem(STORAGE_KEY, key);
          return true;
        } catch (e) {
          return false;
        }
      }
      function clearStoredKey() {
        try {
          localStorage.removeItem(STORAGE_KEY);
          return true;
        } catch (e) {
          return false;
        }
      }
      function hasKey() {
        const k = getStoredKey();
        return typeof k === "string" && k.indexOf("sk-ant-") === 0;
      }
      async function speak(voice, game2, lastResult2) {
        const spec = VOICES[voice];
        if (!spec) throw new Error("Unknown voice: " + voice);
        const apiKey = getStoredKey();
        if (!apiKey || apiKey.indexOf("sk-ant-") !== 0) {
          const e = new Error("No API key set \u2014 add one to hear the broadcast.");
          e.errorType = "no_key";
          throw e;
        }
        const payload = context.build(game2, lastResult2);
        let response;
        try {
          response = await fetch(API_ENDPOINT, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-api-key": apiKey,
              "anthropic-version": "2023-06-01",
              "anthropic-dangerous-direct-browser-access": "true"
            },
            body: JSON.stringify({
              model: spec.model,
              max_tokens: spec.max_tokens,
              system: spec.system,
              messages: [{
                role: "user",
                content: spec.ask + "\n\nGame state JSON (this is the whole world \u2014 nothing outside it is true):\n" + JSON.stringify(payload, null, 2)
              }]
            })
          });
        } catch (netErr) {
          const e = new Error("Network error reaching api.anthropic.com");
          e.errorType = "network_error";
          throw e;
        }
        if (!response.ok) {
          let body = {};
          try {
            body = await response.json();
          } catch (e2) {
          }
          const msg = body && body.error && body.error.message || "HTTP " + response.status;
          const e = new Error(msg);
          e.status = response.status;
          e.errorType = body && body.error && body.error.type || null;
          throw e;
        }
        const data = await response.json();
        const text = (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n").trim();
        if (!text) {
          const e = new Error("API returned no text");
          e.errorType = "empty_response";
          throw e;
        }
        const truncated = data.stop_reason === "max_tokens";
        const outputTokens = data.usage && typeof data.usage.output_tokens === "number" ? data.usage.output_tokens : null;
        if (truncated) {
          console.warn(
            "[broadcast] " + voice + " (" + spec.model + ") hit max_tokens \u2014 the text below is CUT OFF, not a complete call. output_tokens=" + (outputTokens === null ? "(not reported)" : outputTokens) + " of max_tokens=" + spec.max_tokens + "; visible text was " + text.split(/\s+/).length + " words. If output_tokens is near the cap but the text is short, thinking consumed the rest \u2014 raise max_tokens for this voice in VOICES (see the model/budget note there)."
          );
        }
        return {
          text,
          truncated,
          stopReason: data.stop_reason || null,
          outputTokens
        };
      }
      module.exports = { speak, getStoredKey, setStoredKey, clearStoredKey, hasKey, VOICES, SONNET, OPUS };
    }
  });

  // src/ui/broadcastPanel.js
  var require_broadcastPanel = __commonJS({
    "src/ui/broadcastPanel.js"(exports, module) {
      var { el } = require_dom();
      var client = require_client();
      var cache = {};
      var keyPromptOpen = false;
      function turnKey(game2) {
        return game2.seed + ":" + game2.turnIndex;
      }
      function slot(game2, voice) {
        const k = turnKey(game2);
        cache[k] = cache[k] || {};
        cache[k][voice] = cache[k][voice] || { state: "idle", text: null, truncated: false };
        return cache[k][voice];
      }
      var LABELS = {
        announcer: { title: "PLAY-BY-PLAY", sub: "live call" },
        advisor: { title: "CAMPAIGN ADVISOR", sub: "your strategist \xB7 inside the room" },
        commentator: { title: "TV COMMENTATOR", sub: "outside analyst \xB7 not on your payroll" }
      };
      function render(game2, lastResult2, rerender) {
        const wrap = el("div", { class: "panel broadcast" });
        wrap.appendChild(el("h3", { text: "THE BROADCAST" }));
        if (!client.hasKey()) {
          if (!keyPromptOpen) {
            wrap.appendChild(el("div", { class: "bc-nokey" }, [
              el("span", { text: "Broadcast voices are off \u2014 no API key set. " }),
              el("button", {
                class: "bc-btn small",
                text: "Add key",
                onClick: () => {
                  keyPromptOpen = true;
                  rerender();
                }
              })
            ]));
          } else {
            const input = el("input", { class: "bc-key-input", type: "password", placeholder: "sk-ant-..." });
            wrap.appendChild(el("div", { class: "bc-nokey" }, [
              input,
              el("button", {
                class: "bc-btn small",
                text: "Save",
                onClick: () => {
                  const v = (input.value || "").trim();
                  if (v.indexOf("sk-ant-") === 0) {
                    client.setStoredKey(v);
                    keyPromptOpen = false;
                    rerender();
                  } else {
                    input.value = "";
                    input.placeholder = "needs to start with sk-ant-";
                  }
                }
              }),
              el("button", {
                class: "bc-btn small ghost",
                text: "Cancel",
                onClick: () => {
                  keyPromptOpen = false;
                  rerender();
                }
              }),
              el("div", { class: "bc-note", text: "Stored in this browser only (localStorage). Local single-player use \u2014 not ship-safe for public release." })
            ]));
          }
          return wrap;
        }
        if (lastResult2) {
          const a = slot(game2, "announcer");
          if (a.state === "idle") {
            a.state = "loading";
            client.speak("announcer", game2, lastResult2).then((r) => {
              a.state = "done";
              a.text = r.text;
              a.truncated = r.truncated;
              rerender();
            }).catch((e) => {
              a.state = "error";
              a.text = e.message;
              a.truncated = false;
              rerender();
            });
          }
          wrap.appendChild(voiceBlock("announcer", a, null));
        }
        for (const voice of ["advisor", "commentator"]) {
          const s = slot(game2, voice);
          const ask = () => {
            s.state = "loading";
            s.truncated = false;
            rerender();
            client.speak(voice, game2, lastResult2).then((r) => {
              s.state = "done";
              s.text = r.text;
              s.truncated = r.truncated;
              rerender();
            }).catch((e) => {
              s.state = "error";
              s.text = e.message;
              s.truncated = false;
              rerender();
            });
          };
          wrap.appendChild(voiceBlock(voice, s, ask));
        }
        return wrap;
      }
      function voiceBlock(voice, s, ask) {
        const L = LABELS[voice];
        const box = el("div", { class: "bc-voice bc-" + voice });
        const head = el("div", { class: "bc-head" }, [
          el("span", { class: "bc-title", text: L.title }),
          el("span", { class: "bc-sub", text: L.sub })
        ]);
        box.appendChild(head);
        if (s.state === "loading") {
          box.appendChild(el("div", { class: "bc-body loading", text: "\u2026" }));
        } else if (s.state === "done") {
          box.appendChild(el("div", { class: "bc-body" + (s.truncated ? " truncated" : ""), text: s.text }));
          if (s.truncated) {
            box.appendChild(el("div", {
              class: "bc-cutoff",
              text: "CUT OFF \u2014 hit the length limit mid-sentence. This is not the whole call."
            }));
          }
          if (ask) box.appendChild(el("button", { class: "bc-btn small ghost", text: "ask again", onClick: ask }));
        } else if (s.state === "error") {
          box.appendChild(el("div", { class: "bc-body error", text: "(" + s.text + ")" }));
          if (ask) box.appendChild(el("button", { class: "bc-btn small ghost", text: "retry", onClick: ask }));
        } else if (ask) {
          box.appendChild(el("button", {
            class: "bc-btn",
            text: voice === "advisor" ? "Ask your strategist" : "Get the outside read",
            onClick: ask
          }));
        }
        return box;
      }
      module.exports = { render };
    }
  });

  // src/ui/endScreen.js
  var require_endScreen = __commonJS({
    "src/ui/endScreen.js"(exports, module) {
      var { el } = require_dom();
      function render(game2, onRestart) {
        const wrap = el("div", { class: "panel end" });
        const nom = game2.nominee;
        const clinched = nom.delegates >= game2.clinch;
        const youWon = nom.id === game2.playerId;
        wrap.appendChild(el("h2", { text: "\u{1F3DB}  NOMINATION DECIDED" }));
        wrap.appendChild(el("div", {
          class: "nominee",
          text: `${nom.name} is the 2016 Republican nominee \u2014 ${nom.delegates} delegates ${clinched ? "(clinched the majority)" : "(delegate leader at the end of the calendar)"}.`
        }));
        wrap.appendChild(el("div", {
          class: "verdict " + (youWon ? "won" : "lost"),
          text: youWon ? "You won the nomination." : "Your candidate fell short \u2014 run it back."
        }));
        wrap.appendChild(el("button", { class: "run-btn", text: "PLAY AGAIN", onClick: onRestart }));
        return wrap;
      }
      module.exports = { render };
    }
  });

  // src/main.js
  var { newGame } = require_gameState();
  var { resolveTurn, evaluateEnd } = require_turnLoop();
  var CFG = require_config_play();
  var { clear } = require_dom();
  var candidateSelect = require_candidateSelect();
  var quickStart = require_quickStart();
  var hud = require_hud();
  var turnPanel = require_turnPanel();
  var resultsPanel = require_resultsPanel();
  var broadcastPanel = require_broadcastPanel();
  var endScreen = require_endScreen();
  var DEFAULT_PLAYER = "R16-2";
  function readLockedSeed() {
    const m = /[?&]seed=(\d+)/.exec(location.search || "");
    return m ? parseInt(m[1], 10) >>> 0 : null;
  }
  var SEED_LOCK = readLockedSeed();
  var game = null;
  var lastResult = null;
  function root() {
    return document.getElementById("app");
  }
  function start(playerId) {
    game = newGame(playerId, SEED_LOCK);
    lastResult = null;
    window.EGV1 = { game, CFG, seedLock: SEED_LOCK };
    renderPlay();
  }
  function showSeedBadge() {
    if (SEED_LOCK === null) return;
    const bar = document.querySelector(".topbar");
    if (bar && !document.getElementById("seed-badge")) {
      const badge = document.createElement("span");
      badge.id = "seed-badge";
      badge.className = "seed-badge";
      badge.textContent = `DEV \xB7 seed locked: ${SEED_LOCK}`;
      bar.appendChild(badge);
    }
  }
  function onResolve(moves) {
    lastResult = resolveTurn(game, moves);
    evaluateEnd(game);
    if (game.phase === "concluded") renderEnd();
    else renderPlay();
  }
  function renderSelect() {
    const r = root();
    clear(r);
    r.appendChild(candidateSelect.render(start, DEFAULT_PLAYER));
  }
  function renderPlay() {
    const r = root();
    clear(r);
    r.appendChild(hud.render(game));
    if (lastResult) r.appendChild(resultsPanel.render(lastResult, game));
    r.appendChild(broadcastPanel.render(game, lastResult, renderPlay));
    r.appendChild(turnPanel.render(game, onResolve));
  }
  function renderEnd() {
    const r = root();
    clear(r);
    r.appendChild(hud.render(game));
    if (lastResult) r.appendChild(resultsPanel.render(lastResult, game));
    r.appendChild(broadcastPanel.render(game, lastResult, renderEnd));
    r.appendChild(endScreen.render(game, renderSelect));
  }
  function boot() {
    showSeedBadge();
    quickStart.install();
    renderSelect();
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
