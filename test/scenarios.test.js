import test from "node:test";
import assert from "node:assert/strict";
import { evaluateSelection } from "../src/scenarios.js";

test("reconhece os três alertas sem tratar HTTPS como fraude", () => {
  const result = evaluateSelection(["domain", "urgency", "external-access"]);
  assert.equal(result.correctCount, 4);
  assert.equal(result.total, 4);
  assert.equal(result.perfect, true);
  assert.ok(result.results.every((item) => item.correct));
});

test("marcar também HTTPS reduz a pontuação e explica o erro", () => {
  const result = evaluateSelection(["domain", "urgency", "external-access", "https"]);
  assert.equal(result.correctCount, 3);
  assert.equal(result.perfect, false);
  assert.equal(result.results.find((item) => item.id === "https").correct, false);
});

test("nenhuma seleção e seleção parcial não recebem nota máxima", () => {
  const empty = evaluateSelection([]);
  assert.equal(empty.correctCount, 1);
  assert.equal(empty.perfect, false);
  const partial = evaluateSelection(["urgency"]);
  assert.equal(partial.correctCount, 2);
  assert.equal(partial.results.find((item) => item.id === "domain").correct, false);
});

test("rejeita alternativas desconhecidas em vez de ignorá-las", () => {
  assert.throws(() => evaluateSelection(["desconhecida"]), RangeError);
});
