import { evaluateSelection, signals } from "./scenarios.js";

const options = document.querySelector("#signal-options");
const reviewButton = document.querySelector("#review-button");
const resetButton = document.querySelector("#reset-button");
const selectionCount = document.querySelector("#selection-count");
const feedback = document.querySelector("#feedback");
const explanations = document.querySelector("#explanations");
const score = document.querySelector("#score");

for (const signal of signals) {
  const label = document.createElement("label");
  label.className = "signal-option";
  const input = document.createElement("input");
  input.type = "checkbox";
  input.value = signal.id;
  const text = document.createElement("span");
  text.textContent = signal.label;
  label.append(input, text);
  options.append(label);
}

function clearFeedback() {
  feedback.hidden = true;
  explanations.replaceChildren();
  score.textContent = "";
  for (const element of document.querySelectorAll(".highlighted")) {
    element.classList.remove("highlighted");
  }
}

options.addEventListener("change", () => {
  clearFeedback();
  const count = options.querySelectorAll("input:checked").length;
  selectionCount.textContent = count === 0
    ? "Nenhuma alternativa marcada."
    : `${count} de ${signals.length} alternativas marcadas.`;
});

reviewButton.addEventListener("click", () => {
  const selected = Array.from(options.querySelectorAll("input:checked"), (input) => input.value);
  const evaluation = evaluateSelection(selected);
  explanations.replaceChildren();
  score.textContent = `Você acertou ${evaluation.correctCount} de ${evaluation.total} avaliações. ${
    evaluation.perfect ? "Ótima análise!" : "Confira os motivos abaixo e tente novamente."
  }`;

  for (const result of evaluation.results) {
    const item = document.createElement("li");
    const heading = document.createElement("strong");
    heading.textContent = `${result.correct ? "Acerto" : "Revisar"}: ${result.label} `;
    item.append(heading, document.createTextNode(result.explanation));
    explanations.append(item);
    if (result.evidence) {
      document.getElementById(result.evidence).classList.add("highlighted");
    }
  }

  feedback.hidden = false;
  document.querySelector("#feedback-title").focus();
});

resetButton.addEventListener("click", () => {
  for (const input of options.querySelectorAll("input")) {
    input.checked = false;
  }
  selectionCount.textContent = "Nenhuma alternativa marcada.";
  clearFeedback();
  options.querySelector("input").focus();
});

reviewButton.disabled = false;
resetButton.disabled = false;
