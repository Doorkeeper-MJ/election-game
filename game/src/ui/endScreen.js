/* endScreen.js — nominee declaration + restart. v1 ends at the primary
   (no general election). */

const { el } = require("./dom.js");

function render(game, onRestart) {
    const wrap = el("div", { class: "panel end" });
    const nom = game.nominee;
    const clinched = nom.delegates >= game.clinch;
    const youWon = nom.id === game.playerId;

    wrap.appendChild(el("h2", { text: "🏛  NOMINATION DECIDED" }));
    wrap.appendChild(el("div", {
        class: "nominee",
        text: `${nom.name} is the 2016 Republican nominee — ${nom.delegates} delegates ${clinched ? "(clinched the majority)" : "(delegate leader at the end of the calendar)"}.`
    }));
    wrap.appendChild(el("div", {
        class: "verdict " + (youWon ? "won" : "lost"),
        text: youWon ? "You won the nomination." : "Your candidate fell short — run it back."
    }));
    wrap.appendChild(el("button", { class: "run-btn", text: "PLAY AGAIN", onClick: onRestart }));
    return wrap;
}

module.exports = { render };
