// Vercel Serverless Function: GET /api/apisetu/pin-lookup?pin=522001
// Open Civic Directory Proxy: Resolves a 6-digit Indian PIN code to nearby Post Offices &
// India Post Payments Bank (IPPB) counters where citizens can complete instant Aadhaar–NPCI DBT Seeding
// (the #1 cause of AP DBT payment rejection). Keeps client CSP `connect-src 'self'` strict.

import { AP_26_DISTRICT_HUBS } from '../../src/config/apServiceCentres.js';
import type { ServerlessRequest, ServerlessResponse } from '../profile/extract';

export interface PinLookupRequest extends ServerlessRequest {
  query?: Record<string, string | string[] | undefined>;
}

export interface IppbSeedingDesk {
  office_name: string;
  branch_type: string;
  district: string;
  state: string;
  pin_code: string;
  dbt_seeding_supported: boolean;
  service_note_en: string;
  service_note_te: string;
  service_note_hi: string;
}

export interface PinLookupResponse {
  pin_code: string;
  desks: IppbSeedingDesk[];
  data_source: 'india_post_live' | 'ap_postal_fallback';
}

interface PostalApiPostOffice {
  Name?: string;
  BranchType?: string;
  DeliveryStatus?: string;
  District?: string;
  State?: string;
  Pincode?: string;
}

export function buildFallbackIppbDesks(pin: string): IppbSeedingDesk[] {
  const prefix3 = pin.slice(0, 3);
  const matchingHub =
    AP_26_DISTRICT_HUBS.find((h) => h.pin === pin) ||
    AP_26_DISTRICT_HUBS.find((h) => h.pin.startsWith(prefix3)) ||
    AP_26_DISTRICT_HUBS.find((h) => h.district === 'Guntur')!;

  return [
    {
      office_name: `${matchingHub.hqCity} Head Post Office & IPPB Seeding Counter`,
      branch_type: 'Head Post Office (IPPB Hub)',
      district: matchingHub.district,
      state: 'Andhra Pradesh',
      pin_code: pin,
      dbt_seeding_supported: true,
      service_note_en:
        'Instant biometric e-KYC Aadhaar–NPCI DBT bank seeding available (carry Rice Card / Passbook).',
      service_note_te:
        'తక్షణ బయోమెట్రిక్ ఆధార్–NPCI DBT బ్యాంకు సీడింగ్ సదుపాయం కలదు.',
      service_note_hi:
        'तत्काल बायोमेट्रिक आधार–NPCI DBT बैंक सीडिंग सुविधा उपलब्ध।',
    },
    {
      office_name: `${matchingHub.hqCity} Bazar Sub Post Office (DakPay / IPPB)`,
      branch_type: 'Sub Post Office',
      district: matchingHub.district,
      state: 'Andhra Pradesh',
      pin_code: pin,
      dbt_seeding_supported: true,
      service_note_en:
        'Postman / Gramin Dak Sevak CELC micro-ATM DBT account activation counter.',
      service_note_te:
        'పోస్ట్‌మ్యాన్ / గ్రామీణ డాక్ సేవక్ ద్వారా తక్షణ NPCI DBT ఖాతా యాక్టివేషన్.',
      service_note_hi:
        'पोस्टमैन / ग्रामीण डाक सेवक द्वारा तत्काल NPCI DBT खाता सक्रियण।',
    },
  ];
}

export default async function handler(
  req: PinLookupRequest,
  res: ServerlessResponse
): Promise<void> {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).json({ error: 'method_not_allowed', message: 'Use GET /api/apisetu/pin-lookup' });
    return;
  }

  const rawPin = typeof req.query?.pin === 'string' ? req.query.pin.trim() : '';
  if (!/^[1-8]\d{5}$/.test(rawPin)) {
    res.status(400).json({
      error: 'invalid_pin',
      message: 'Provide a valid 6-digit Indian PIN code (e.g., 522001). Do NOT enter Aadhaar or phone numbers.',
    });
    return;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3200);

  try {
    const resp = await fetch(`https://api.postalpincode.in/pincode/${rawPin}`, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });

    if (resp.ok) {
      const json = (await resp.json()) as Array<{
        Status?: string;
        PostOffice?: PostalApiPostOffice[] | null;
      }>;
      const postOffices = json?.[0]?.PostOffice;
      if (Array.isArray(postOffices) && postOffices.length > 0) {
        const desks: IppbSeedingDesk[] = postOffices.slice(0, 6).map((po) => ({
          office_name: `${po.Name || 'Post Office'} (${po.BranchType || 'SO'})`,
          branch_type: po.BranchType || 'Post Office',
          district: po.District || 'Andhra Pradesh',
          state: po.State || 'Andhra Pradesh',
          pin_code: po.Pincode || rawPin,
          dbt_seeding_supported: true,
          service_note_en:
            'IPPB Aadhaar–NPCI DBT Seeding & CELC Biometric Update Desk (Mon–Sat, 9:30 AM – 4:30 PM).',
          service_note_te:
            'IPPB ఆధార్–NPCI DBT బ్యాంకు సీడింగ్ & బయోమెట్రిక్ కేంద్రం (సోమ–శని).',
          service_note_hi:
            'IPPB आधार–NPCI DBT बैंक सीडिंग व बायोमेट्रिक केंद्र (सोम–शनि)।',
        }));

        res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800');
        const payload: PinLookupResponse = {
          pin_code: rawPin,
          desks,
          data_source: 'india_post_live',
        };
        res.status(200).json(payload);
        return;
      }
    }
  } catch {
    // Fall through to deterministic AP postal fallback
  } finally {
    clearTimeout(timeout);
  }

  res.setHeader('Cache-Control', 'public, s-maxage=3600');
  const fallbackPayload: PinLookupResponse = {
    pin_code: rawPin,
    desks: buildFallbackIppbDesks(rawPin),
    data_source: 'ap_postal_fallback',
  };
  res.status(200).json(fallbackPayload);
}
