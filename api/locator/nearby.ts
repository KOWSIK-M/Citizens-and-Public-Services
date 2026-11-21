// Vercel Serverless Function: GET /api/locator/nearby
// Proxies OpenStreetMap Overpass/Nominatim civic office POIs while keeping client `connect-src 'self'`
// strict, merging live OpenStreetMap Sachivalayam/MeeSeva POIs with verified 26-district AP hubs.
// Zero coordinates or citizen queries are persisted or logged.

import {
  AP_OFFICIAL_HELPLINES,
  AP_26_DISTRICT_HUBS,
  findCuratedCentres,
  haversineDistanceKm,
} from '../../src/config/apServiceCentres.js';
import type { LocatorApiResponse, ServiceCentre } from '../../src/types/locator';
import type { ServerlessRequest, ServerlessResponse } from '../profile/extract';

export interface LocatorApiRequest extends ServerlessRequest {
  query?: Record<string, string | string[] | undefined>;
}

interface OverpassElement {
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string | undefined>;
}

async function fetchLiveOsmCivicCentres(
  lat: number,
  lng: number,
  districtLabel: string
): Promise<ServiceCentre[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3200);

  try {
    // Search within 12km radius for Sachivalayam, MeeSeva, eSeva, CSC, or Mandal/Municipal civic offices
    const query = `[out:json][timeout:3];(node["office"="government"](around:12000,${lat},${lng});way["office"="government"](around:12000,${lat},${lng});node["amenity"="townhall"](around:12000,${lat},${lng}););out center 12;`;
    const resp = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'User-Agent': 'ClaimSaathi-Civic-Welfare-Assistant/3.0',
      },
      body: `data=${encodeURIComponent(query)}`,
      signal: controller.signal,
    });

    if (!resp.ok) return [];
    const data = (await resp.json()) as { elements?: OverpassElement[] };
    if (!Array.isArray(data.elements)) return [];

    const mapped: ServiceCentre[] = [];
    for (const el of data.elements) {
      const elLat = el.lat ?? el.center?.lat;
      const elLng = el.lon ?? el.center?.lon;
      const rawName = el.tags?.['name:en'] || el.tags?.name;
      if (typeof elLat !== 'number' || typeof elLng !== 'number' || !rawName) continue;

      const lowerName = rawName.toLowerCase();
      const inferredType =
        lowerName.includes('meeseva') || lowerName.includes('eseva') || lowerName.includes('csc')
          ? 'meeseva_eseva'
          : lowerName.includes('rythu') || lowerName.includes('rbk')
          ? 'rythu_seva_kendra'
          : lowerName.includes('collector')
          ? 'collectorate_pgrs'
          : 'sachivalayam';

      const street = [el.tags?.['addr:street'], el.tags?.['addr:city'] || districtLabel]
        .filter(Boolean)
        .join(', ');

      mapped.push({
        id: `osm-${el.id}`,
        district: districtLabel,
        pin_code: el.tags?.['addr:postcode'] || '',
        type: inferredType,
        name_en: rawName,
        name_te: el.tags?.['name:te'] || rawName,
        name_hi: el.tags?.['name:hi'] || rawName,
        address_en: street || `${districtLabel}, Andhra Pradesh`,
        address_te: street || `${districtLabel}, ఆంధ్రప్రదేశ్`,
        address_hi: street || `${districtLabel}, आंध्र प्रदेश`,
        lat: Number(elLat.toFixed(5)),
        lng: Number(elLng.toFixed(5)),
        hours_en: el.tags?.opening_hours || 'Mon–Sat: 10:00 AM – 5:00 PM',
        hours_te: 'సోమ–శని: ఉదయం 10:00 – సాయంత్రం 5:00',
        hours_hi: 'सोम–शनि: सुबह 10:00 – शाम 5:00',
        helpline: inferredType === 'meeseva_eseva' ? '1100' : '1902',
        official_portal_url:
          inferredType === 'meeseva_eseva'
            ? 'https://ap.meeseva.gov.in/'
            : 'https://vsws.ap.gov.in/',
        services_en: ['Public Welfare Assistance & Certificate Verification'],
        services_te: ['ప్రజా సంక్షేమ సేవలు & ధృవీకరణ పత్రాల సహాయం'],
        services_hi: ['जन कल्याण सहायता व प्रमाण पत्र सत्यापन'],
        source: 'openstreetmap_live',
        distance_km: haversineDistanceKm(lat, lng, elLat, elLng),
      });
    }

    return mapped;
  } catch {
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

export default async function handler(
  req: LocatorApiRequest,
  res: ServerlessResponse
): Promise<void> {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).json({ error: 'method_not_allowed', message: 'Use GET /api/locator/nearby' });
    return;
  }

  const districtParam = typeof req.query?.district === 'string' ? req.query.district.trim() : null;
  const pinParam = typeof req.query?.pin === 'string' ? req.query.pin.trim() : null;
  const typeParam = typeof req.query?.type === 'string' ? req.query.type.trim() : null;
  const latRaw = typeof req.query?.lat === 'string' ? Number(req.query.lat) : null;
  const lngRaw = typeof req.query?.lng === 'string' ? Number(req.query.lng) : null;

  const validCoords =
    typeof latRaw === 'number' &&
    !Number.isNaN(latRaw) &&
    latRaw >= 12.0 &&
    latRaw <= 20.0 &&
    typeof lngRaw === 'number' &&
    !Number.isNaN(lngRaw) &&
    lngRaw >= 76.5 &&
    lngRaw <= 85.5;

  let anchorLat = validCoords ? latRaw : null;
  let anchorLng = validCoords ? lngRaw : null;
  let resolvedDistrict = districtParam || 'Guntur';

  if (anchorLat === null && districtParam && districtParam !== 'all') {
    const hub = AP_26_DISTRICT_HUBS.find(
      (h) => h.district.toLowerCase() === districtParam.toLowerCase()
    );
    if (hub) {
      anchorLat = hub.lat;
      anchorLng = hub.lng;
      resolvedDistrict = hub.district;
    }
  }

  const curated = findCuratedCentres({
    district: districtParam,
    pin: pinParam,
    type: typeParam,
    lat: validCoords ? latRaw : null,
    lng: validCoords ? lngRaw : null,
  });

  let osmCentres: ServiceCentre[] = [];
  if (anchorLat !== null && anchorLng !== null && (!districtParam || districtParam !== 'all')) {
    osmCentres = await fetchLiveOsmCivicCentres(anchorLat, anchorLng, resolvedDistrict);
    if (typeParam && typeParam !== 'all') {
      osmCentres = osmCentres.filter((c) => c.type === typeParam);
    }
  }

  const combined = [...curated, ...osmCentres];
  if (validCoords) {
    combined.sort((a, b) => (a.distance_km ?? 9999) - (b.distance_km ?? 9999));
  }

  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  const payload: LocatorApiResponse = {
    centres: combined.slice(0, 84),
    helplines: AP_OFFICIAL_HELPLINES,
    total: combined.length,
    data_source: osmCentres.length > 0 ? 'merged_osm_and_curated' : 'curated_ap_gsws',
  };
  res.status(200).json(payload);
}
