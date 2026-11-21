import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useLanguage } from '@/store/useLanguageStore';
import { useProfileStore } from '@/store/useProfileStore';
import { AP_DISTRICT_OPTIONS } from '@/config/bands';
import {
  AP_OFFICIAL_HELPLINES,
  findCuratedCentres,
} from '@/config/apServiceCentres';
import {
  LocatorApiResponse,
  ServiceCentre,
  ServiceCentreType,
} from '@/types/locator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  MapPin,
  PhoneCall,
  Navigation,
  Building2,
  Clock,
  ExternalLink,
  LocateFixed,
  Search,
  ShieldCheck,
} from 'lucide-react';

const CENTRE_TYPE_COLORS: Record<
  ServiceCentreType,
  { hex: string; badgeClass: string; labelEn: string; labelTe: string; labelHi: string }
> = {
  sachivalayam: {
    hex: '#059669',
    badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    labelEn: 'Grama / Ward Sachivalayam',
    labelTe: 'గ్రామ / వార్డు సచివాలయం',
    labelHi: 'ग्राम / वार्ड सचिवालय',
  },
  meeseva_eseva: {
    hex: '#2563eb',
    badgeClass: 'bg-blue-100 text-blue-900 border-blue-300',
    labelEn: 'MeeSeva / E-Seva Centre',
    labelTe: 'మీసేవ / ఈ-సేవ కేంద్రం',
    labelHi: 'मीसेवा / ई-सेवा केंद्र',
  },
  rythu_seva_kendra: {
    hex: '#d97706',
    badgeClass: 'bg-amber-100 text-amber-950 border-amber-300',
    labelEn: 'Rythu Seva Kendra (RSK)',
    labelTe: 'రైతు సేవా కేంద్రం (RSK)',
    labelHi: 'रैतु सेवा केंद्र (RSK)',
  },
  collectorate_pgrs: {
    hex: '#7c3aed',
    badgeClass: 'bg-purple-100 text-purple-900 border-purple-300',
    labelEn: 'Collectorate PGRS / Meekosam',
    labelTe: 'కలెక్టరేట్ PGRS / మీకోసం',
    labelHi: 'कलेक्टरेट जन शिकायत केंद्र',
  },
};

export const ServiceCentresPage: React.FC = () => {
  const { pick, getFontClass } = useLanguage();
  const { confirmedProfile } = useProfileStore();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialDistrict =
    searchParams.get('district') ||
    (confirmedProfile?.district_code && confirmedProfile.district_code !== 'unknown'
      ? confirmedProfile.district_code
      : 'Guntur');

  const [selectedDistrict, setSelectedDistrict] = useState<string>(initialDistrict);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [pinInput, setPinInput] = useState<string>(searchParams.get('pin') || '');
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'locating' | 'active' | 'denied'>('idle');
  const [centres, setCentres] = useState<ServiceCentre[]>(() =>
    findCuratedCentres({ district: initialDistrict })
  );
  const [focusedCentreId, setFocusedCentreId] = useState<string | null>(null);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // Query local curated + serverless OpenStreetMap merged endpoint
  useEffect(() => {
    const cleanPin = pinInput.replace(/\D/g, '').slice(0, 6);
    const localResults = findCuratedCentres({
      district: gpsCoords ? 'all' : selectedDistrict,
      pin: cleanPin.length >= 3 ? cleanPin : null,
      type: selectedType,
      lat: gpsCoords?.lat ?? null,
      lng: gpsCoords?.lng ?? null,
    });
    setCentres(localResults);

    let cancelled = false;
    const params = new URLSearchParams();
    if (!gpsCoords && selectedDistrict) params.set('district', selectedDistrict);
    if (cleanPin.length >= 3) params.set('pin', cleanPin);
    if (selectedType !== 'all') params.set('type', selectedType);
    if (gpsCoords) {
      params.set('lat', String(gpsCoords.lat));
      params.set('lng', String(gpsCoords.lng));
    }

    fetch(`/api/locator/nearby?${params.toString()}`)
      .then((r) => (r.ok ? (r.json() as Promise<LocatorApiResponse>) : null))
      .then((data) => {
        if (!cancelled && data && Array.isArray(data.centres) && data.centres.length > 0) {
          setCentres(data.centres);
        }
      })
      .catch(() => {
        // Offline / Vite dev mode gracefully keeps `localResults`
      });

    return () => {
      cancelled = true;
    };
  }, [selectedDistrict, selectedType, pinInput, gpsCoords]);

  // Initialize Leaflet map once
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [16.3067, 80.4365],
      zoom: 11,
      scrollWheelZoom: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;
    markersLayerRef.current = layerGroup;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markersLayerRef.current = null;
    };
  }, []);

  // Sync markers whenever `centres` or `focusedCentreId` changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();
    if (centres.length === 0) return;

    const bounds: Array<[number, number]> = [];
    centres.slice(0, 40).forEach((centre) => {
      const styleMeta = CENTRE_TYPE_COLORS[centre.type];
      const isFocused = focusedCentreId === centre.id;

      const marker = L.circleMarker([centre.lat, centre.lng], {
        radius: isFocused ? 12 : 9,
        fillColor: styleMeta.hex,
        color: '#ffffff',
        weight: isFocused ? 3 : 2,
        opacity: 1,
        fillOpacity: 0.92,
      });

      const popupHtml = `<div style="font-family:sans-serif;max-width:220px">
        <strong style="font-size:13px;color:#0f172a">${centre.name_en}</strong>
        <div style="font-size:11px;color:#475569;margin-top:3px">${centre.address_en}</div>
        <div style="font-size:11px;color:#059669;font-weight:700;margin-top:4px">Helpline: ${centre.helpline}</div>
      </div>`;
      marker.bindPopup(popupHtml);
      marker.addTo(layer);
      bounds.push([centre.lat, centre.lng]);

      if (isFocused) {
        marker.openPopup();
      }
    });

    if (focusedCentreId) {
      const target = centres.find((c) => c.id === focusedCentreId);
      if (target) {
        map.setView([target.lat, target.lng], 14, { animate: true });
        return;
      }
    }

    if (bounds.length === 1) {
      map.setView(bounds[0], 13);
    } else if (bounds.length > 1) {
      map.fitBounds(bounds, { padding: [32, 32], maxZoom: 13 });
    }
  }, [centres, focusedCentreId]);

  const handleUseNearMe = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setGpsStatus('denied');
      return;
    }
    setGpsStatus('locating');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsCoords({
          lat: Number(pos.coords.latitude.toFixed(4)),
          lng: Number(pos.coords.longitude.toFixed(4)),
        });
        setGpsStatus('active');
        setFocusedCentreId(null);
      },
      () => {
        setGpsStatus('denied');
      },
      { enableHighAccuracy: false, timeout: 6000 }
    );
  };

  const handleDistrictChange = (nextDistrict: string) => {
    setSelectedDistrict(nextDistrict);
    setGpsCoords(null);
    setGpsStatus('idle');
    setFocusedCentreId(null);
    const nextParams = new URLSearchParams(searchParams);
    if (nextParams.get('district') !== nextDistrict) {
      nextParams.set('district', nextDistrict);
      setSearchParams(nextParams, { replace: true });
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 md:py-10 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="space-y-2 border-b border-border pb-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="bg-emerald-100 text-emerald-900 border border-emerald-300 font-semibold">
            <ShieldCheck className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
            {pick(
              'All 26 AP Districts • Free Government Facilitation',
              'మొత్తం 26 ఆంధ్రప్రదేశ్ జిల్లాలు • ఉచిత ప్రభుత్వ సేవా కేంద్రాలు',
              'सभी 26 आंध्र प्रदेश जिले • निःशुल्क सरकारी सहायता केंद्र'
            )}
          </Badge>
        </div>
        <h1 className={`text-2xl md:text-3xl font-extrabold text-primary flex items-center gap-2.5 ${getFontClass()}`}>
          <MapPin className="h-7 w-7 text-emerald-600 shrink-0" aria-hidden="true" />
          <span>
            {pick(
              'Local Grama/Ward Sachivalayam, MeeSeva & E-Seva Locator',
              'స్థానిక గ్రామ/వార్డు సచివాలయం, మీసేవ & ఈ-సేవ కేంద్రాల లొకేటర్',
              'स्थानीय ग्राम/वार्ड सचिवालय, मीसेवा और ई-सेवा केंद्र लोकेटर'
            )}
          </span>
        </h1>
        <p className={`text-sm md:text-base text-muted max-w-3xl ${getFontClass()}`}>
          {pick(
            'Find your nearest Sachivalayam, MeeSeva/E-Seva counter, Rythu Seva Kendra, or Collectorate PGRS desk with timings, directions, and direct toll-free helplines.',
            'మీ సమీప సచివాలయం, మీసేవ/ఈ-సేవ కేంద్రం, రైతు సేవా కేంద్రం లేదా కలెక్టరేట్ PGRS కార్యాలయ చిరునామా, పని వేళలు మరియు టోల్-ఫ్రీ నంబర్లు చూడండి.',
            'अपने नजदीकी सचिवालय, मीसेवा/ई-सेवा केंद्र, रैतु सेवा केंद्र और टोल-फ्री हेल्पलाइन विवरण देखें।'
          )}
        </p>
      </div>

      {/* Official AP Toll-Free Helpline Strip */}
      <section aria-label="Official Helplines" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {AP_OFFICIAL_HELPLINES.map((hl) => (
          <Card key={hl.code} className="border-emerald-200 bg-emerald-50/40">
            <CardContent className="p-4 flex flex-col justify-between h-full gap-2">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xl font-extrabold text-emerald-800">{hl.number}</span>
                  <a
                    href={`tel:${hl.number}`}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold min-h-[32px]"
                  >
                    <PhoneCall className="h-3.5 w-3.5" aria-hidden="true" />
                    {pick('Call Free', 'కాల్ చేయండి', 'कॉल करें')}
                  </a>
                </div>
                <p className={`text-xs font-bold text-primary mt-1.5 ${getFontClass()}`}>
                  {pick(hl.title_en, hl.title_te, hl.title_hi)}
                </p>
              </div>
              <p className={`text-[11px] text-muted leading-snug ${getFontClass()}`}>
                {pick(hl.scope_en, hl.scope_te, hl.scope_hi)}
              </p>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Search & Filter Controls */}
      <Card className="border-border bg-white shadow-sm">
        <CardContent className="p-4 sm:p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* District Selector */}
            <div className="space-y-1">
              <label
                htmlFor="locator-district-select"
                className={`block text-xs font-bold text-primary ${getFontClass()}`}
              >
                {pick('AP District (26 Districts)', 'ఆంధ్రప్రదేశ్ జిల్లా', 'आंध्र प्रदेश जिला')}
              </label>
              <select
                id="locator-district-select"
                value={selectedDistrict}
                onChange={(e) => handleDistrictChange(e.target.value)}
                className={`w-full min-h-[44px] rounded-md border border-input bg-white px-3 text-sm text-body focus:outline-none focus:ring-2 focus:ring-focus ${getFontClass()}`}
              >
                <option value="all">
                  {pick('All 26 Districts', 'అన్ని 26 జిల్లాలు', 'सभी 26 जिले')}
                </option>
                {AP_DISTRICT_OPTIONS.map((d) => (
                  <option key={d.value} value={d.value}>
                    {pick(d.label_en, d.label_te, d.label_hi)}
                  </option>
                ))}
              </select>
            </div>

            {/* 6-Digit PIN Filter */}
            <div className="space-y-1">
              <label
                htmlFor="locator-pin-input"
                className={`block text-xs font-bold text-primary ${getFontClass()}`}
              >
                {pick('6-Digit PIN Code (Optional)', '6-అంకెల పిన్ కోడ్', '6-अंकीय पिन कोड')}
              </label>
              <div className="relative">
                <Search
                  className="h-4 w-4 text-muted absolute left-3 top-1/2 -translate-y-1/2"
                  aria-hidden="true"
                />
                <Input
                  id="locator-pin-input"
                  inputMode="numeric"
                  maxLength={6}
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="e.g. 522001"
                  className="pl-9 min-h-[44px]"
                />
              </div>
            </div>

            {/* Centre Type Selector */}
            <div className="space-y-1">
              <label
                htmlFor="locator-type-select"
                className={`block text-xs font-bold text-primary ${getFontClass()}`}
              >
                {pick('Centre Type', 'సేవా కేంద్రం రకం', 'सेवा केंद्र का प्रकार')}
              </label>
              <select
                id="locator-type-select"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className={`w-full min-h-[44px] rounded-md border border-input bg-white px-3 text-sm text-body focus:outline-none focus:ring-2 focus:ring-focus ${getFontClass()}`}
              >
                <option value="all">
                  {pick('All Centres', 'అన్ని కేంద్రాలు', 'सभी केंद्र')}
                </option>
                <option value="sachivalayam">
                  {pick('Grama / Ward Sachivalayam', 'గ్రామ / వార్డు సచివాలయం', 'ग्राम / वार्ड सचिवालय')}
                </option>
                <option value="meeseva_eseva">
                  {pick('MeeSeva / E-Seva', 'మీసేవ / ఈ-సేవ', 'मीसेवा / ई-सेवा')}
                </option>
                <option value="rythu_seva_kendra">
                  {pick('Rythu Seva Kendra (RSK)', 'రైతు సేవా కేంద్రం', 'रैतु सेवा केंद्र')}
                </option>
                <option value="collectorate_pgrs">
                  {pick('Collectorate PGRS', 'కలెక్టరేట్ PGRS', 'कलेक्टरेट शिकायत केंद्र')}
                </option>
              </select>
            </div>

            {/* Opt-In Near Me Geolocation */}
            <div className="flex items-end">
              <Button
                type="button"
                variant="outline"
                onClick={handleUseNearMe}
                disabled={gpsStatus === 'locating'}
                className={`w-full min-h-[44px] font-semibold ${getFontClass()} ${
                  gpsStatus === 'active'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                    : ''
                }`}
              >
                <LocateFixed className="h-4 w-4 mr-2 shrink-0" aria-hidden="true" />
                {gpsStatus === 'locating'
                  ? pick('Finding Nearest…', 'వెతుకుతోంది…', 'खोज रहा है…')
                  : gpsStatus === 'active'
                  ? pick('Sorted by Distance', 'దూరం ఆధారంగా', 'दूरी के अनुसार')
                  : pick('Use Near Me (GPS)', 'నా సమీప కేంద్రాలు', 'मेरे पास खोजें')}
              </Button>
            </div>
          </div>

          {gpsStatus === 'denied' && (
            <p className={`text-xs text-amber-800 ${getFontClass()}`}>
              {pick(
                'Location permission was declined or unavailable—use the AP District or 6-digit PIN filter above.',
                'లొకేషన్ అనుమతి అందుబాటులో లేదు—పైనున్న జిల్లా లేదా పిన్ కోడ్ ఫిల్టర్ వాడండి.',
                'लोकेशन अनुमति उपलब्ध नहीं है—कृपया ऊपर जिला या पिन कोड चुनें।'
              )}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Interactive OpenStreetMap + Centre List Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Map Column */}
        <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-2">
          <div
            ref={mapContainerRef}
            aria-label="OpenStreetMap of Andhra Pradesh Citizen Service Centres"
            className="w-full h-[300px] sm:h-[380px] lg:h-[460px] rounded-2xl border border-border shadow-sm overflow-hidden z-0"
          />
          <div className="flex flex-wrap gap-2 text-[11px] text-muted px-1">
            <span className="inline-flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" /> Sachivalayam
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-600" /> MeeSeva / E-Seva
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-600" /> Rythu Seva Kendra
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-full bg-purple-600" /> Collectorate PGRS
            </span>
          </div>
        </div>

        {/* Cards List Column */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className={`text-base sm:text-lg font-bold text-primary ${getFontClass()}`}>
              {pick(
                `Showing ${centres.length} Verified Citizen Service Centres`,
                `${centres.length} ధృవీకరించబడిన పౌర సేవా కేంద్రాలు`,
                `${centres.length} सत्यापित नागरिक सेवा केंद्र`
              )}
            </h2>
          </div>

          {centres.map((centre) => {
            const typeMeta = CENTRE_TYPE_COLORS[centre.type];
            const services = pick(
              centre.services_en.join(' • '),
              centre.services_te.join(' • '),
              centre.services_hi.join(' • ')
            );
            const osmDirectionsUrl = `https://www.openstreetmap.org/directions?from=&to=${centre.lat}%2C${centre.lng}#map=15/${centre.lat}/${centre.lng}`;

            return (
              <Card
                key={centre.id}
                className={`border transition-all ${
                  focusedCentreId === centre.id
                    ? 'border-emerald-600 ring-2 ring-emerald-500/20'
                    : 'border-border'
                }`}
              >
                <CardHeader className="pb-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Badge className={`border font-semibold ${typeMeta.badgeClass} ${getFontClass()}`}>
                      {pick(typeMeta.labelEn, typeMeta.labelTe, typeMeta.labelHi)}
                    </Badge>
                    <div className="flex items-center gap-2 text-xs text-muted font-medium">
                      {centre.pin_code && <span>PIN: {centre.pin_code}</span>}
                      {typeof centre.distance_km === 'number' && (
                        <Badge variant="outline">{centre.distance_km} km</Badge>
                      )}
                    </div>
                  </div>
                  <CardTitle className={`text-base sm:text-lg font-bold text-primary pt-1 ${getFontClass()}`}>
                    {pick(centre.name_en, centre.name_te, centre.name_hi)}
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-3 text-sm">
                  <p className={`text-body flex items-start gap-2 ${getFontClass()}`}>
                    <Building2 className="h-4 w-4 text-muted shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{pick(centre.address_en, centre.address_te, centre.address_hi)}</span>
                  </p>

                  <p className={`text-xs text-muted flex items-center gap-2 ${getFontClass()}`}>
                    <Clock className="h-4 w-4 text-amber-600 shrink-0" aria-hidden="true" />
                    <span>{pick(centre.hours_en, centre.hours_te, centre.hours_hi)}</span>
                  </p>

                  <div className="rounded-lg bg-slate-50 border border-slate-200/80 p-2.5">
                    <p className={`text-xs text-slate-700 leading-relaxed ${getFontClass()}`}>
                      <strong className="text-primary">
                        {pick('Services:', 'సేవలు:', 'सेवाएं:')}{' '}
                      </strong>
                      {services}
                    </p>
                  </div>

                  <div className="pt-1 flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setFocusedCentreId(centre.id)}
                      className={`min-h-[40px] text-xs font-semibold ${getFontClass()}`}
                    >
                      <MapPin className="h-3.5 w-3.5 mr-1.5 text-emerald-700" aria-hidden="true" />
                      {pick('Show on Map', 'మ్యాప్‌లో చూడండి', 'मानचित्र पर देखें')}
                    </Button>

                    <a
                      href={`tel:${centre.helpline}`}
                      className={`inline-flex items-center justify-center rounded-md px-3 min-h-[40px] text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white ${getFontClass()}`}
                    >
                      <PhoneCall className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
                      {pick(
                        `Helpline ${centre.helpline}`,
                        `హెల్ప్‌లైన్ ${centre.helpline}`,
                        `हेल्पलाइन ${centre.helpline}`
                      )}
                    </a>

                    <a
                      href={osmDirectionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center justify-center rounded-md px-3 min-h-[40px] text-xs font-semibold border border-border bg-white hover:bg-slate-50 text-primary ${getFontClass()}`}
                    >
                      <Navigation className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
                      {pick('Directions', 'దారి చూడండి', 'दिशा-निर्देश')}
                    </a>

                    <a
                      href={centre.official_portal_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center justify-center rounded-md px-3 min-h-[40px] text-xs font-semibold border border-border bg-white hover:bg-slate-50 text-primary ${getFontClass()}`}
                    >
                      <ExternalLink className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
                      {pick('Official Portal', 'అధికారిక పోర్టల్', 'आधिकारिक पोर्टल')}
                    </a>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};
