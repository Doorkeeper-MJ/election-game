/* ============================================================
   context.js — builds the SINGLE factual payload all three voices read.

   Every field here is computed from live game state or the Slice 2
   counterfactual effect data. Nothing is estimated, inferred, or
   decorated. If a voice cites a number, it came from here.

   All three voices get the SAME object (the commentator additionally
   reads `vantage`). Insider vs outsider is a difference of emphasis,
   never of information.
   ============================================================ */

function lastName(full) {
    const parts = String(full).split(" ");
    return parts[parts.length - 1];
}

// Deterministic per-turn vantage for the commentator: same game + same
// turn always yields the same posture, so a re-render never re-rolls it.
// ~1 turn in 3 is "bold" (commit to a forward call). Derived from the
// game seed so it is reproducible in playtests.
function vantageFor(game) {
    const h = ((game.seed >>> 0) + (game.turnIndex * 2654435761)) >>> 0;
    return (h % 3 === 0) ? "bold" : "measured";
}

function build(game, lastResult) {
    const player = game.field.find(c => c.id === game.playerId) || null;
    const playerName = player ? player.name : null;

    // ---- standings (sorted, real) ----
    const sorted = game.field.slice().sort((a, b) => b.delegates - a.delegates);
    const standings = sorted
        .filter(c => c.delegates > 0 || c.id === game.playerId || sorted.indexOf(c) < 4)
        .map((c, i) => ({
            rank: sorted.indexOf(c) + 1,
            name: c.name,
            delegates: c.delegates,
            momentum: Math.round(c.momentum * 100) / 100,
            is_player: c.id === game.playerId
        }));

    const leader = sorted[0];
    const playerRank = player ? sorted.indexOf(player) + 1 : null;

    // ---- calendar arithmetic (real: sums the actual remaining calendar) ----
    let delegatesRemaining = 0;
    const upcoming = [];
    for (let t = game.turnIndex; t < game.turns.length; t++) {
        const turn = game.turns[t];
        for (const c of turn.contests) {
            delegatesRemaining += c.delegates;
            if (upcoming.length < 10) {
                upcoming.push({ date: turn.date, state: c.state, delegates: c.delegates, is_next_turn: t === game.turnIndex });
            }
        }
    }

    const playerNeeds = player ? Math.max(0, game.clinch - player.delegates) : null;
    const leaderNeeds = Math.max(0, game.clinch - leader.delegates);

    // ---- season-cumulative measured effect of the player's own moves ----
    let seasonNetDelta = 0, flipsWon = 0, contestsPushed = 0;
    for (const res of game.history) {
        for (const c of res.contests) {
            const fx = c.effect;
            if (!fx || !fx.deltas) continue;
            const mine = playerName ? fx.deltas.find(d => d.name === playerName) : null;
            if (mine && mine.delta !== 0) { seasonNetDelta += mine.delta; contestsPushed++; }
            if (fx.flipped && playerName && fx.realWinner === playerName) flipsWon++;
        }
    }

    // ---- this turn's results + measured effect (the Slice 2 gift) ----
    let thisTurn = null;
    if (lastResult) {
        let turnNetDelta = 0;
        const contests = lastResult.contests.map(c => {
            const awards = c.awards.slice()
                .sort((a, b) => b.delegates - a.delegates)
                .filter(a => a.delegates > 0)
                .map(a => ({ name: a.name, delegates: a.delegates }));
            const row = { state: c.state, delegates_at_stake: c.delegates, awards: awards };
            const fx = c.effect;
            if (fx && fx.deltas && fx.deltas.some(d => d.delta !== 0)) {
                const mine = playerName ? fx.deltas.find(d => d.name === playerName) : null;
                if (mine) turnNetDelta += mine.delta;
                row.player_moves_measured_effect = {
                    explanation: "Real result vs. the same contest re-run with the player making no moves. Difference is caused by the player's moves.",
                    deltas: fx.deltas.filter(d => d.delta !== 0)
                        .map(d => ({ name: d.name, delta: d.delta, real: d.real, without_player_moves: d.cf })),
                    flipped_winner: !!fx.flipped,
                    winner_without_player_moves: fx.flipped ? fx.cfWinner : null,
                    actual_winner: fx.flipped ? fx.realWinner : null
                };
            }
            return row;
        });
        thisTurn = {
            date: lastResult.date,
            contests: contests,
            player_net_delegate_effect_this_turn: turnNetDelta,
            player_made_moves: contests.some(c => c.player_moves_measured_effect)
        };
    }

    return {
        game: {
            cycle: "2016 Republican presidential primary (simulation)",
            turn: game.turnIndex,
            total_turns: game.turns.length,
            phase: game.phase,
            delegates_to_clinch: game.clinch
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
        standings: standings,
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
        vantage: vantageFor(game)
    };
}

module.exports = { build, vantageFor };
