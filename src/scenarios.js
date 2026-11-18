export const signals = [
  {
    id: "domain",
    label: "O remetente e o endereço de destino não correspondem ao domínio de referência.",
    suspicious: true,
    evidence: "evidence-sender",
    explanation: "conta-aurora.invalid e validacao-aurora.invalid são diferentes de rede-aurora.invalid. A semelhança no nome não comprova vínculo com a marca."
  },
  {
    id: "urgency",
    label: "A ameaça de suspensão em 15 minutos pressiona uma decisão imediata.",
    suspicious: true,
    evidence: "evidence-urgency",
    explanation: "Urgência e medo de perder acesso podem reduzir a atenção. Pare e confirme a solicitação por um canal conhecido."
  },
  {
    id: "external-access",
    label: "A mensagem pede confirmação de acesso por um endereço externo inesperado.",
    suspicious: true,
    evidence: "evidence-link",
    explanation: "Um pedido inesperado para confirmar acesso por outro endereço merece verificação independente. Não use o endereço da mensagem para validar a própria mensagem."
  },
  {
    id: "https",
    label: "O endereço começar com https:// é, por si só, um sinal de fraude.",
    suspicious: false,
    evidence: null,
    explanation: "HTTPS não é sinal de fraude nem garantia de legitimidade: protege a conexão com o domínio visitado, mas esse domínio também pode pertencer a um golpista."
  }
];

export function evaluateSelection(selectedIds) {
  const selected = new Set(selectedIds);
  for (const id of selected) {
    if (!signals.some((signal) => signal.id === id)) {
      throw new RangeError(`Alternativa desconhecida: ${id}`);
    }
  }

  const results = signals.map((signal) => ({
    ...signal,
    selected: selected.has(signal.id),
    correct: selected.has(signal.id) === signal.suspicious
  }));
  const correctCount = results.filter((result) => result.correct).length;

  return {
    correctCount,
    total: signals.length,
    perfect: correctCount === signals.length,
    results
  };
}
