import { describe, it, expect } from 'vitest';
import {
  createInitialVoiceCallSession,
  processVoiceCallTurn,
} from '../src/services/voiceCallEngine';
import { MOCK_GOVERNMENT_SCHEMES } from './fixtures/sampleSchemes';

describe('Saathi Live Call — Deterministic Voice Conversation Engine', () => {
  it('creates trilingual initial greetings warning against Aadhaar/phone sharing', () => {
    const enSession = createInitialVoiceCallSession('en');
    expect(enSession.phase).toBe('greeting');
    expect(enSession.turns[0].text).toContain('Namaskaram');
    expect(enSession.turns[0].text.toLowerCase()).toContain('aadhaar');

    const teSession = createInitialVoiceCallSession('te');
    expect(teSession.turns[0].text).toContain('నమస్కారం');

    const hiSession = createInitialVoiceCallSession('hi');
    expect(hiSession.turns[0].text).toContain('नमस्कार');
  });

  it('extracts multi-turn citizen story, asks short clarifications, and uses "likely eligible" wording', () => {
    let state = createInitialVoiceCallSession('en');
    state = processVoiceCallTurn(
      state,
      'I am a 68 year old widow in Krishna district with no farmland and White Rice Card',
      'en',
      MOCK_GOVERNMENT_SCHEMES
    );

    // Ensure no agent turn ever says "guaranteed" or "approved"
    for (const turn of state.turns) {
      if (turn.speaker === 'agent') {
        expect(turn.text.toLowerCase()).not.toContain('guaranteed');
        expect(turn.text.toLowerCase()).not.toContain('100% approved');
      }
    }

    // Advance if a clarifying slot was asked
    if (state.phase === 'collecting_profile') {
      state = processVoiceCallTurn(state, 'We belong to BC category', 'en', MOCK_GOVERNMENT_SCHEMES);
    }
    if (state.phase === 'collecting_profile') {
      state = processVoiceCallTurn(state, 'I am a homemaker', 'en', MOCK_GOVERNMENT_SCHEMES);
    }

    expect(state.recommendedSchemes.length).toBeGreaterThan(0);
    const lastAgentTurn = state.turns[state.turns.length - 1];
    expect(lastAgentTurn.text.toLowerCase()).toContain('likely eligible');
  });

  it('scrubs spoken Aadhaar / phone PII immediately and prepends a privacy note', () => {
    let state = createInitialVoiceCallSession('en');
    state = processVoiceCallTurn(
      state,
      'My Aadhaar is 4567 8901 2345 and phone is 9876543210, I am a farmer with 2 acres in Guntur',
      'en',
      MOCK_GOVERNMENT_SCHEMES
    );

    const citizenTurn = state.turns.find((t) => t.speaker === 'citizen');
    expect(citizenTurn?.hadPiiRedacted).toBe(true);
    expect(citizenTurn?.text).not.toContain('4567 8901 2345');
    expect(citizenTurn?.text).not.toContain('9876543210');

    const agentReply = state.turns[state.turns.length - 1];
    expect(agentReply.text.toLowerCase()).toContain('privacy note');
  });

  it('supports hands-free scheme picking and proceeding by voice command', () => {
    let state = createInitialVoiceCallSession('en');
    state = processVoiceCallTurn(
      state,
      'I am 17 studying in Class 10 in Guntur, BC category, parents are daily wage workers with White Rice Card and no land',
      'en',
      MOCK_GOVERNMENT_SCHEMES
    );

    // Ensure we reach presenting_options
    while (state.phase === 'collecting_profile') {
      state = processVoiceCallTurn(state, 'Yes', 'en', MOCK_GOVERNMENT_SCHEMES);
    }

    expect(state.phase).toBe('presenting_options');
    expect(state.recommendedSchemes.length).toBeGreaterThan(0);

    // Select first scheme and proceed in one spoken command
    state = processVoiceCallTurn(state, 'Pick first scheme and proceed', 'en', MOCK_GOVERNMENT_SCHEMES);
    expect(state.phase).toBe('completed');
    expect(state.proceedWithSchemeId).toBe(state.recommendedSchemes[0].scheme_id);
  });

  it('flags suggestWelfareGapRequest when zero schemes match high-income/ineligible profile', () => {
    let state = createInitialVoiceCallSession('en');
    state = processVoiceCallTurn(
      state,
      'I am 35 years old self employed in Visakhapatnam earning 9 lakh rupees per year with 10 acres of land, OC category, no children in school',
      'en',
      MOCK_GOVERNMENT_SCHEMES
    );
    while (state.phase === 'collecting_profile') {
      state = processVoiceCallTurn(state, 'No', 'en', MOCK_GOVERNMENT_SCHEMES);
    }

    expect(state.recommendedSchemes.length).toBe(0);
    expect(state.suggestWelfareGapRequest).toBe(true);
  });
});
