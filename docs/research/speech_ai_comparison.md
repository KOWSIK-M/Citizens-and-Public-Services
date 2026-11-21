# Speech and AI Provider Comparison

Owner: Agent 02
Status: PENDING

## Comparison table

| Provider | Telugu STT | English STT | TTS | Free limit | Licence | Latency | Cost | Decision |
|---|---|---|---|---|---|---|---|---|
| Sarvam Saaras v4 (STT) | Yes; Telugu and Tenglish code-mix | Not stated in research | n/a | Rs 100 free credit (about 60 voice sessions) per dossier; PENDING VERIFICATION | PENDING VERIFICATION | PENDING VERIFICATION | Not stated in research | Shortlist (STT); named in open-source file as fastest hackathon path |
| Sarvam Bulbul v3 / v4-flash (TTS) | n/a | n/a | Yes; open-source file names Bulbul; dossier mentions Bulbul v4 | PENDING VERIFICATION | PENDING VERIFICATION | PENDING VERIFICATION | Not stated in research | Shortlist (TTS); version conflict PENDING VERIFICATION |
| Bhashini / AI4Bharat IndicConformer | Yes; Telugu checkpoints | Not stated in research | Not stated in research | PENDING VERIFICATION | Open-weight, self-hostable | PENDING VERIFICATION | PENDING VERIFICATION (hosting cost) | Fallback (self-hosted) |
| Whisper | Weaker baseline for code-mixed Telugu | Not stated in research | Not stated in research | Not stated in research | Not stated in research | No figures given | Not stated in research | Not shortlisted |

## Deprecation conflict (unresolved)
- Dossier lists Saarika, Sarvam-M and Sarvam-30B as deprecated.
- Open-source file says Saarika v2.5 is deprecated, with Saaras v4 as its replacement.
- Conflict is not resolved by the research; verify before use.

## Recommendation (PENDING APPROVAL)
- Shortlist: Sarvam Saaras v4 (STT) + Sarvam Bulbul (TTS).
- Fallback: Bhashini / AI4Bharat IndicConformer (self-hosted).
- Status: PENDING APPROVAL. No provider is approved for implementation yet.

## Fallback
- Bhashini / AI4Bharat IndicConformer (self-hosted, Telugu checkpoints, open-weight).

## Open questions
- Deprecation conflict: Saarika / Sarvam-M / Sarvam-30B (dossier) vs Saarika v2.5 with Saaras v4 replacement (open-source file).
- Bulbul version: v3 / v4-flash (open-source file) vs Bulbul v4 (dossier).
- Sarvam credit terms and card requirement.
- Bhashini / IndicConformer hosting cost.
