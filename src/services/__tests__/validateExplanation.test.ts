import { describe, it, expect } from 'vitest';
import { validateExplanation } from '../../../serverless/ai/validateExplanation';

// Synthetic data only.
const allowed = ['RULE-A', 'RULE-B'];

describe('validateExplanation', () => {
  it('returns ok true when all cited ids are allowed', () => {
    const result = validateExplanation(
      { explanation: 'Likely eligible based on income rule.', cited_rule_ids: ['RULE-A', 'RULE-B'] },
      allowed,
    );
    expect(result.ok).toBe(true);
  });

  it('returns ok false when a cited id is not in allowedRuleIds', () => {
    const result = validateExplanation(
      { explanation: 'Some text.', cited_rule_ids: ['RULE-X'] },
      allowed,
    );
    expect(result.ok).toBe(false);
  });

  it('returns ok false when explanation is not a string', () => {
    const result = validateExplanation({ explanation: 42, cited_rule_ids: [] }, allowed);
    expect(result.ok).toBe(false);
  });

  it('returns ok false when explanation is empty', () => {
    const result = validateExplanation({ explanation: '   ', cited_rule_ids: [] }, allowed);
    expect(result.ok).toBe(false);
  });

  it('returns ok false when input is not an object', () => {
    expect(validateExplanation('not an object', allowed).ok).toBe(false);
    expect(validateExplanation(null, allowed).ok).toBe(false);
    expect(validateExplanation(['array'], allowed).ok).toBe(false);
  });
});
