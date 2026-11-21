// Pure validator for the model's explanation output.
// The model must reply ONLY with {"explanation": string, "cited_rule_ids": string[]}.
// Every cited rule id must exist in the deterministic result's rule ids.

export type ExplanationValue = {
  explanation: string;
  cited_rule_ids: string[];
};

export type ValidationResult =
  | { ok: true; value: ExplanationValue }
  | { ok: false; reason: string };

export function validateExplanation(
  output: unknown,
  allowedRuleIds: string[],
): ValidationResult {
  if (typeof output !== 'object' || output === null || Array.isArray(output)) {
    return { ok: false, reason: 'output is not a JSON object' };
  }

  const record = output as Record<string, unknown>;

  const explanation = record.explanation;
  if (typeof explanation !== 'string' || explanation.trim().length === 0) {
    return { ok: false, reason: 'explanation must be a non-empty string' };
  }

  const cited = record.cited_rule_ids;
  if (!Array.isArray(cited)) {
    return { ok: false, reason: 'cited_rule_ids must be an array' };
  }

  const allowed = new Set(allowedRuleIds);
  const citedIds: string[] = [];
  for (const id of cited) {
    if (typeof id !== 'string') {
      return { ok: false, reason: 'cited_rule_ids must contain only strings' };
    }
    if (!allowed.has(id)) {
      return { ok: false, reason: `cited rule id not in input: ${id}` };
    }
    citedIds.push(id);
  }

  return {
    ok: true,
    value: { explanation: explanation.trim(), cited_rule_ids: citedIds },
  };
}
