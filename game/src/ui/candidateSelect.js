/* candidateSelect.js — Slice 1 candidate picker. Bare. Defaults the
   highlight to a non-Trump candidate (Cruz) so agency is felt. */

const { el } = require("./dom.js");
const { candidates2016 } = require("../../../model/data-2016.js");

function render(onPick, defaultId) {
    const wrap = el("div", { class: "panel select" });
    wrap.appendChild(el("h2", { text: "PICK YOUR CANDIDATE" }));
    wrap.appendChild(el("div", { class: "hint", text: "2016 Republican primary. Run anyone. (Trump is the historical favorite — the challenge is everyone else.)" }));

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
