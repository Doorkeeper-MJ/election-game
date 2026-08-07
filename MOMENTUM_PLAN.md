# MOMENTUM PLAN — Step 9 dropout refinement

**Status:** Design approved in principle. Implementation on hold pending fresh go-ahead.

**Why:** The original Step 9 dropout rule (`polling < 3% AND delegates === 0 after 3+ contests`) is static — it reads a snapshot, not trajectory. After ~20 turns the field stays too crowded. Real primaries are driven by momentum ("Big Mo") that cuts both ways: fading candidates should drop sooner even if a stray delegate keeps them technically alive; surging underdogs (Carter 1976: 3% polling, won Iowa with 27%) should survive on positive momentum.

---

## 1. Core concept

A single **`momentum`** score per candidate, range **−100 to +100**:

- **+100** — "Big Mo", riding a hot streak, exceeding expectations
- **0** — neutral / steady
- **−100** — collapsing, narrative spiraling

Stored as `rt.momentum` on the candidate runtime. Decays toward 0 every turn so one hot night doesn't last forever; sustained performance is needed to hold it.

---

## 2. How momentum updates

### Per-turn decay (every turn, regardless of contest)

```
momentum = momentum × 0.85
pollingHistory.push(currentPolling)   // keep last 3 entries
```

### Per-contest update (when a candidate competes in a contest of their party)

```
expected         = candidate's current polling
actual           = candidate's vote share in this contest
overperformance  = actual − expected               // ±30 typical range

delegateSignal:
    +5   if got delegates                          // won
    −3   if no dels AND overperformance ≥ +2       // moral victory
    −10  otherwise                                  // flopped

trend            = currentPolling − pollingHistory[oldest]   // 3-turn window

delta = (overperformance × 2) + delegateSignal + (trend × 3)

momentum = clamp(momentum + delta, −100, +100)
```

The biggest input is **overperformance vs. expectations** — a candidate polling 3% who pulls 27% gets a +48 momentum bump on that alone.

The **tiered delegateSignal** prevents WTA contests from double-punishing the structural runner-up. Before tiering, a candidate who beat their polling expectations in a WTA shutout would still take a −10 hit just for "not winning" — wrong when the front-runner was locked in by polling alone. With tiering, overperforming by ≥+2 softens the penalty to −3, so the overperformance bonus dominates the delta.

---

## 3. How it drives dropout (replaces the static rule)

Composite "dropout pressure" — high pressure = drop. Each input contributes points:

```
pressure =
    (5 − polling) × 8                              // ≤5% poll adds; >5% subtracts
    + (delegates === 0 ? 15 : −delegates × 0.05)   // no dels adds; lots subtract
    − momentum × 0.5                                // positive mo cuts; negative adds

if (pressure > 35 AND contestsRunInParty >= 3 AND id !== humanPlayerId)
    → drop, set droppedTurn, push news entry
```

### Worked examples

| Candidate scenario             | Polling | Dels | Momentum | Pressure                            | Outcome           |
| ------------------------------ | ------: | ---: | -------: | ----------------------------------- | ----------------- |
| Hutchinson, fading hard        |      1% |    0 |      −25 | (5−1)×8 + 15 + 12.5 = **59.5**      | drops             |
| "Carter '76", weak poll surged |      3% |    5 |      +50 | 16 + 14.75 − 25 = **5.75**          | **survives**      |
| Haley, steady mid-tier polling |     14% |   80 |        0 | −72 − 4 + 0 = **−76**               | survives easily   |
| Phillips, mediocre but stable  |      3% |    0 |        0 | 16 + 15 + 0 = **31**                | survives (just under) |
| Phillips, after string of zeros|      3% |    0 |      −30 | 16 + 15 + 15 = **46**               | drops             |

Trajectory matters more than the snapshot — both directions.

---

## 4. How the player sees it

### Surface 1 — HUD candidate cards (left panel)

A tiny momentum chip next to polling. Arrow + color encodes the bucket:

| Arrow | Color         | Range            | Meaning      |
| ----- | ------------- | ---------------- | ------------ |
| `↑↑`  | bright green  | momentum > +50   | BIG MO       |
| `↗`   | green         | +15 to +50       | rising       |
| `→`   | grey          | −15 to +15       | steady       |
| `↘`   | amber         | −50 to −15       | fading       |
| `↓↓`  | red           | < −50            | collapsing   |

### Surface 2 — Right-panel player card

The candidate the human is playing gets the same arrow PLUS a small −100..+100 mini-bar so the player can feel their own mo and make tactical reads ("I'm at +20, one more bad contest and I'm in trouble").

### Surface 3 — News log callouts

Threshold-crossing events push tickered entries:

- crossing **+40** upward: *"BIG MO: Nikki Haley overperforms in NH"*
- crossing **−40** downward: *"Asa Hutchinson loses momentum after weak Iowa showing"*

---

## 5. Four decisions — approved values

| # | Decision                          | Approved value                                                   |
| - | --------------------------------- | ---------------------------------------------------------------- |
| 1 | Decay rate                        | **0.85** (a +50 surge halves in ~4 turns)                        |
| 2 | Polling-trend window              | **Last 3 turns**                                                 |
| 3 | Dropout pressure threshold        | **35**                                                           |
| 4 | Player visibility                 | **Arrow in HUD + arrow + mini-bar in right-panel player card**   |
| 5 | Moral-victory threshold           | **+2 overperformance** (softens no-dels penalty)                 |
| 6 | Moral-victory delegateSignal      | **−3** (vs −10 hard penalty)                                     |

All values are starting points. The user expects to tune after playtesting. The bucket thresholds (±15 / ±50) and news-log callout thresholds (±40) are also tunable.

---

## 6. Files this will touch

- **`scripts/state.js`** — add `momentum: 0` and `pollingHistory: []` to the candidate runtime in `makeInitialState()`.
- **`scripts/engine/contests.js`** — after each per-party contest, update each participant's momentum using the per-contest formula; replace the current `checkDropouts()` body with the composite-pressure rule.
- **`scripts/engine/turnLoop.js`** — at the end of each turn: apply 0.85 decay to every candidate's momentum, push current polling into `pollingHistory` (cap length 3), and emit threshold-crossing news entries.
- **`scripts/ui/hud.js`** — render the momentum arrow chip next to the polling stat on each candidate card.
- **`scripts/ui/actionsPanel.js`** — render the same arrow plus a small −100..+100 mini-bar in the human player's card.
- **`styles/newsroom.css`** — momentum chip styling (five color/arrow variants) and the mini-bar.
