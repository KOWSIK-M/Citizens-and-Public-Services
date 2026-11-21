// Vercel Serverless Function: POST /api/apisetu/sandbox
// API Setu OpenAPI v3 Certificate Verification Sandbox Adapter
// STRICT HACKATHON GUARDRAILS:
// 1. Rejects (`HTTP 403`) any request where `is_sample !== true`.
// 2. Rejects (`HTTP 422`) any payload containing Aadhaar, PAN, phone, Voter ID, bank account, or email.
// 3. Demonstrates real API Setu v3 request/response envelope structure strictly on synthetic tokens (`SYNTH-*`).

import { inspectTextForPii } from '../../src/utils/piiValidator.js';
import {
  API_SETU_DOC_SCHEMAS,
  type ApiSetuDocType,
} from '../../src/config/apiSetuSchemas.js';
import type { ServerlessRequest, ServerlessResponse } from '../profile/extract';

export interface ApiSetuSandboxRequestBody {
  is_sample?: boolean;
  doc_type?: ApiSetuDocType;
  synthetic_token?: string;
  district_code?: string;
  persona_label?: string;
}

export interface ApiSetuOpenApiV3Response {
  apiVersion: '3.0.0';
  txnId: string;
  ts: string;
  sandboxMode: 'SYNTHETIC_PERSONA_ONLY';
  orgId: string;
  docType: ApiSetuDocType;
  endpointSimulated: string;
  requestEnvelope: {
    txnId: string;
    format: 'json';
    certificateParameters: {
      syntheticCertRef: string;
      stateCode: 'AP';
      district: string;
    };
    consentArtifact: {
      consentId: string;
      purpose: 'Citizen Pre-Submission Readiness Check (Synthetic Demo)';
      piiCollected: false;
    };
  };
  verificationResult: {
    status: 'VERIFIED_SYNTHETIC_DEMO';
    issuer: string;
    digilockerPullReady: boolean;
    validityRule: string;
    verifiedAttributes: Record<string, string>;
    advisoryNote: string;
  };
}

export default async function handler(
  req: ServerlessRequest,
  res: ServerlessResponse
): Promise<void> {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'method_not_allowed', message: 'Use POST /api/apisetu/sandbox' });
    return;
  }

  const body = (typeof req.body === 'object' && req.body !== null
    ? req.body
    : {}) as ApiSetuSandboxRequestBody;

  // Guardrail 1: Strictly isolate API Setu verification simulation to synthetic personas (`is_sample: true`)
  if (body.is_sample !== true) {
    res.status(403).json({
      error: 'synthetic_persona_required',
      message:
        'API Setu Sandbox verification is restricted strictly to synthetic demo profiles (is_sample = true). Real citizen certificate IDs are never collected.',
    });
    return;
  }

  // Guardrail 2: Inspect all incoming strings for PII
  const rawCombined = [body.synthetic_token || '', body.district_code || '', body.persona_label || ''].join(' ');
  const piiResult = inspectTextForPii(rawCombined);
  if (piiResult.hasPii) {
    res.status(422).json({
      error: 'pii_detected',
      detected_types: piiResult.detectedTypes,
      message:
        'Sensitive personal numbers (Aadhaar, PAN, phone, or bank account) are strictly blocked. Use synthetic demo tokens only.',
    });
    return;
  }

  const docType = (body.doc_type && body.doc_type in API_SETU_DOC_SCHEMAS
    ? body.doc_type
    : 'INCER') as ApiSetuDocType;
  const schema = API_SETU_DOC_SCHEMAS[docType];

  const safeToken =
    body.synthetic_token && body.synthetic_token.startsWith('SYNTH-')
      ? body.synthetic_token.slice(0, 40)
      : schema.syntheticSampleToken;
  const safeDistrict = (body.district_code && body.district_code !== 'unknown'
    ? body.district_code
    : 'Guntur'
  ).slice(0, 40);

  const txnId = `apisetu-v3-synth-${Date.now().toString(36)}`;
  const nowIso = new Date().toISOString();

  const payload: ApiSetuOpenApiV3Response = {
    apiVersion: '3.0.0',
    txnId,
    ts: nowIso,
    sandboxMode: 'SYNTHETIC_PERSONA_ONLY',
    orgId: schema.orgId,
    docType: schema.docType,
    endpointSimulated: schema.openApiEndpointSlug,
    requestEnvelope: {
      txnId,
      format: 'json',
      certificateParameters: {
        syntheticCertRef: safeToken,
        stateCode: 'AP',
        district: safeDistrict,
      },
      consentArtifact: {
        consentId: `consent-synth-${docType.toLowerCase()}-2026`,
        purpose: 'Citizen Pre-Submission Readiness Check (Synthetic Demo)',
        piiCollected: false,
      },
    },
    verificationResult: {
      status: 'VERIFIED_SYNTHETIC_DEMO',
      issuer: schema.issuerName_en,
      digilockerPullReady: schema.digilockerPullable,
      validityRule: schema.validityRule_en,
      verifiedAttributes: {
        holderType: body.persona_label?.slice(0, 50) || 'Synthetic AP Household Persona',
        state: 'Andhra Pradesh',
        district: safeDistrict,
        documentCode: schema.docType,
        standing: 'ACTIVE_IN_SYNTHETIC_SANDBOX',
      },
      advisoryNote:
        'Preliminary readiness check using synthetic API Setu v3 schema only. Final eligibility is verified by Grama/Ward Sachivalayam officers.',
    },
  };

  res.status(200).json(payload);
}
