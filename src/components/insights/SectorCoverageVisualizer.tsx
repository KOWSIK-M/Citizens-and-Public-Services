import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/store/useLanguageStore';
import { useTrackerStore } from '@/store/useTrackerStore';
import { GovernmentScheme, SchemeCategory, SchemeLevel } from '@/types/scheme';
import { CitizenProfile } from '@/types/profile';
import { TrackedApplication } from '@/types/tracker';
import { evaluateDeterministicEligibility } from '@/services/deterministicEngine';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ROUTES } from '@/config/routes';
import {
  BarChart3,
  CheckCircle2,
  Sparkles,
  Clock,
  Filter,
  BookmarkPlus,
  ArrowRight,
  IndianRupee,
} from 'lucide-react';

export type CoverageBucket = 'availed' | 'in_progress' | 'still_eligible' | 'needs_info';

export interface SectorSchemeEntry {
  scheme: GovernmentScheme;
  sector: SchemeCategory;
  bucket: CoverageBucket;
  annualBenefitInr: number;
  healthCoverLakhs: number;
  stage?: string;
}

export interface SectorSummaryRow {
  sector: SchemeCategory;
  availedCount: number;
  inProgressCount: number;
  stillEligibleCount: number;
  needsInfoCount: number;
  claimedBenefitInr: number;
  unclaimedBenefitInr: number;
  entries: SectorSchemeEntry[];
}

export const SECTOR_LABELS: Record<SchemeCategory, { en: string; te: string; hi: string }> = {
  scholarship: { en: 'Education & Scholarships', te: 'విద్య & స్కాలర్‌షిప్', hi: 'शिक्षा व छात्रवृत्ति' },
  pension: { en: 'Social Security Pensions', te: 'సామాజిక భద్రతా పెన్షన్లు', hi: 'सामाजिक सुरक्षा पेंशन' },
  farm: { en: 'Agriculture & Farmers', te: 'వ్యవసాయం & రైతు సాయం', hi: 'कृषि व किसान सहायता' },
  health: { en: 'Universal Healthcare', te: 'ఆరోగ్య సంరక్షణ', hi: 'स्वास्थ्य सुरक्षा' },
  women_child: { en: 'Women & Household / LPG', te: 'మహిళా & గృహ సంక్షేమం', hi: 'महिला व घरेलू कल्याण' },
  employment: { en: 'Employment & Livelihood', te: 'ఉపాధి & జీవనోపాధి', hi: 'रोजगार व आजीविका' },
  housing: { en: 'Housing & Shelter', te: 'గృహ నిర్మాణం', hi: 'आवास' },
  other: { en: 'Other Civic Welfare', te: 'ఇతర పౌర పథకాలు', hi: 'अन्य कल्याण योजनाएं' },
};

export function computeSectorCoverage(
  schemes: GovernmentScheme[],
  profile: CitizenProfile | null,
  trackedApplications: TrackedApplication[],
  filters: {
    level: 'all' | SchemeLevel;
    sector: 'all' | SchemeCategory;
    status: 'all' | CoverageBucket;
  }
): {
  rows: SectorSummaryRow[];
  availedEntries: SectorSchemeEntry[];
  stillEligibleEntries: SectorSchemeEntry[];
  inProgressEntries: SectorSchemeEntry[];
  totalClaimedInr: number;
  totalUnclaimedInr: number;
  coveragePercent: number;
  availedSectorNames: string[];
  unclaimedSectorNames: string[];
} {
  const published = schemes.filter(
    (s) => s.is_published && (filters.level === 'all' || s.level === filters.level)
  );

  const trackedById = new Map<string, TrackedApplication>();
  for (const app of trackedApplications) {
    trackedById.set(app.scheme_id, app);
  }

  const evaluation = profile ? evaluateDeterministicEligibility(profile, published) : null;
  const likelyIds = new Set(evaluation?.results.likely_eligible.map((r) => r.scheme_id) || []);
  const needsInfoIds = new Set(evaluation?.results.needs_more_info.map((r) => r.scheme_id) || []);

  const allEntries: SectorSchemeEntry[] = [];

  for (const scheme of published) {
    const tracked = trackedById.get(scheme.id);
    let bucket: CoverageBucket | null = null;

    if (tracked?.stage === 'sanctioned') {
      bucket = 'availed';
    } else if (
      tracked &&
      tracked.stage !== 'rejected' &&
      tracked.stage !== 'upcoming_notify'
    ) {
      bucket = 'in_progress';
    } else if (!profile || likelyIds.has(scheme.id)) {
      bucket = 'still_eligible';
    } else if (needsInfoIds.has(scheme.id)) {
      bucket = 'needs_info';
    }

    if (!bucket) continue;
    if (filters.sector !== 'all' && scheme.category !== filters.sector) continue;
    if (filters.status !== 'all' && bucket !== filters.status) continue;

    allEntries.push({
      scheme,
      sector: scheme.category,
      bucket,
      annualBenefitInr: scheme.estimated_annual_benefit_inr || 0,
      healthCoverLakhs: scheme.health_cover_lakhs || 0,
      stage: tracked?.stage,
    });
  }

  const sectorMap = new Map<SchemeCategory, SectorSummaryRow>();
  for (const entry of allEntries) {
    const existing = sectorMap.get(entry.sector) || {
      sector: entry.sector,
      availedCount: 0,
      inProgressCount: 0,
      stillEligibleCount: 0,
      needsInfoCount: 0,
      claimedBenefitInr: 0,
      unclaimedBenefitInr: 0,
      entries: [],
    };
    if (entry.bucket === 'availed') {
      existing.availedCount += 1;
      existing.claimedBenefitInr += entry.annualBenefitInr;
    } else if (entry.bucket === 'in_progress') {
      existing.inProgressCount += 1;
      existing.unclaimedBenefitInr += entry.annualBenefitInr;
    } else if (entry.bucket === 'still_eligible') {
      existing.stillEligibleCount += 1;
      existing.unclaimedBenefitInr += entry.annualBenefitInr;
    } else {
      existing.needsInfoCount += 1;
    }
    existing.entries.push(entry);
    sectorMap.set(entry.sector, existing);
  }

  const rows = Array.from(sectorMap.values()).sort(
    (a, b) =>
      b.unclaimedBenefitInr +
      b.claimedBenefitInr -
      (a.unclaimedBenefitInr + a.claimedBenefitInr)
  );

  const availedEntries = allEntries.filter((e) => e.bucket === 'availed');
  const stillEligibleEntries = allEntries.filter((e) => e.bucket === 'still_eligible');
  const inProgressEntries = allEntries.filter((e) => e.bucket === 'in_progress');

  const totalClaimedInr = availedEntries.reduce((sum, e) => sum + e.annualBenefitInr, 0);
  const totalUnclaimedInr = stillEligibleEntries.reduce((sum, e) => sum + e.annualBenefitInr, 0);
  const eligiblePool = availedEntries.length + inProgressEntries.length + stillEligibleEntries.length;
  const coveragePercent =
    eligiblePool > 0 ? Math.round((availedEntries.length / eligiblePool) * 100) : 0;

  const availedSectorNames = Array.from(
    new Set(availedEntries.map((e) => SECTOR_LABELS[e.sector].en))
  );
  const unclaimedSectorNames = Array.from(
    new Set(stillEligibleEntries.map((e) => SECTOR_LABELS[e.sector].en))
  );

  return {
    rows,
    availedEntries,
    stillEligibleEntries,
    inProgressEntries,
    totalClaimedInr,
    totalUnclaimedInr,
    coveragePercent,
    availedSectorNames,
    unclaimedSectorNames,
  };
}

interface SectorCoverageVisualizerProps {
  schemes: GovernmentScheme[];
  profile: CitizenProfile | null;
  trackedApplications: TrackedApplication[];
}

export const SectorCoverageVisualizer: React.FC<SectorCoverageVisualizerProps> = ({
  schemes,
  profile,
  trackedApplications,
}) => {
  const { pick, getFontClass } = useLanguage();
  const { trackSchemeFromResult, isSchemeTracked } = useTrackerStore();
  const navigate = useNavigate();

  const [levelFilter, setLevelFilter] = useState<'all' | SchemeLevel>('all');
  const [sectorFilter, setSectorFilter] = useState<'all' | SchemeCategory>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | CoverageBucket>('all');
  const [sortBy, setSortBy] = useState<'value' | 'count'>('value');

  const computed = useMemo(
    () =>
      computeSectorCoverage(schemes, profile, trackedApplications, {
        level: levelFilter,
        sector: sectorFilter,
        status: statusFilter,
      }),
    [schemes, profile, trackedApplications, levelFilter, sectorFilter, statusFilter]
  );

  const sortedRows = useMemo(() => {
    const copy = [...computed.rows];
    if (sortBy === 'count') {
      copy.sort((a, b) => b.entries.length - a.entries.length);
    }
    return copy;
  }, [computed.rows, sortBy]);

  const maxRowTotal = Math.max(1, ...sortedRows.map((r) => r.entries.length));
  const donutRadius = 42;
  const donutCircumference = 2 * Math.PI * donutRadius;
  const donutStrokeDashoffset =
    donutCircumference - (computed.coveragePercent / 100) * donutCircumference;

  return (
    <div className="space-y-6">
      {/* Header & Filter Bar */}
      <Card className="border-border bg-white shadow-sm">
        <CardHeader className="pb-3 border-b border-slate-100">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle className={`text-lg sm:text-xl font-extrabold text-primary flex items-center gap-2 ${getFontClass()}`}>
                <BarChart3 className="h-5 w-5 text-indigo-700 shrink-0" aria-hidden="true" />
                <span>
                  {pick(
                    'Welfare Sector Coverage: Availed vs. Still Likely Eligible',
                    'సంక్షేమ రంగాల విశ్లేషణ: పొందినవి vs ఇంకా అర్హత ఉన్నవి',
                    'कल्याण क्षेत्र विश्लेषण: प्राप्त बनाम शेष संभावित पात्र योजनाएं'
                  )}
                </span>
              </CardTitle>
              <p className={`text-xs sm:text-sm text-muted mt-1 ${getFontClass()}`}>
                {profile
                  ? pick(
                      'Personalised against your saved household profile and Neon application tracker. Click any sector bar or filter below to drill down.',
                      'మీ ప్రొఫైల్ & దరఖాస్తు ట్రాకర్ ఆధారంగా ఏ రంగాలలో లబ్ధి పొందారో, ఏ రంగాలలో ఇంకా అర్హత ఉందో ఇక్కడ చూడండి.',
                      'आपकी प्रोफ़ाइल और आवेदन ट्रैकर के आधार पर प्राप्त और शेष पात्र क्षेत्रों की तुलना देखें।'
                    )
                  : pick(
                      'Save your personalised profile or run an eligibility check to personalize this chart. Showing all published Neon schemes.',
                      'మీ వ్యక్తిగత ప్రొఫైల్ సేవ్ చేస్తే మీకు సరిపోయే రంగాలు చూపబడతాయి.',
                      'व्यक्तिगत विश्लेषण के लिए अपनी प्रोफ़ाइल सहेजें।'
                    )}
              </p>
            </div>

            <Badge variant="outline" className="text-xs font-semibold text-primary">
              <Filter className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
              {pick('Interactive Filters', 'ఇంటరాక్టివ్ ఫిల్టర్లు', 'इंटरैक्टिव फ़िल्टर')}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label htmlFor="viz-level" className="block text-[11px] font-bold text-primary mb-1">
                {pick('Government Level', 'ప్రభుత్వ స్థాయి', 'सरकारी स्तर')}
              </label>
              <select
                id="viz-level"
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value as 'all' | SchemeLevel)}
                className="w-full min-h-[40px] rounded-md border border-input bg-white px-2.5 text-xs font-medium text-body"
              >
                <option value="all">{pick('All (State + Central)', 'అన్నీ (రాష్ట్ర + కేంద్ర)', 'सभी (राज्य + केंद्र)')}</option>
                <option value="state">{pick('Andhra Pradesh State', 'ఆంధ్రప్రదేశ్ రాష్ట్రం', 'आंध्र प्रदेश राज्य')}</option>
                <option value="central">{pick('Central Government', 'కేంద్ర ప్రభుత్వం', 'केंद्र सरकार')}</option>
              </select>
            </div>

            <div>
              <label htmlFor="viz-sector" className="block text-[11px] font-bold text-primary mb-1">
                {pick('Welfare Sector', 'సంక్షేమ రంగం', 'कल्याण क्षेत्र')}
              </label>
              <select
                id="viz-sector"
                value={sectorFilter}
                onChange={(e) => setSectorFilter(e.target.value as 'all' | SchemeCategory)}
                className="w-full min-h-[40px] rounded-md border border-input bg-white px-2.5 text-xs font-medium text-body"
              >
                <option value="all">{pick('All Sectors', 'అన్ని రంగాలు', 'सभी क्षेत्र')}</option>
                {(Object.keys(SECTOR_LABELS) as SchemeCategory[]).map((cat) => (
                  <option key={cat} value={cat}>
                    {pick(SECTOR_LABELS[cat].en, SECTOR_LABELS[cat].te, SECTOR_LABELS[cat].hi)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="viz-status" className="block text-[11px] font-bold text-primary mb-1">
                {pick('Coverage Status', 'అర్హత / లబ్ధి స్థితి', 'लाभ की स्थिति')}
              </label>
              <select
                id="viz-status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | CoverageBucket)}
                className="w-full min-h-[40px] rounded-md border border-input bg-white px-2.5 text-xs font-medium text-body"
              >
                <option value="all">{pick('All Statuses', 'అన్ని స్థితులు', 'सभी स्थितियाँ')}</option>
                <option value="availed">{pick('Availed / Sanctioned', 'పొందినవి / మంజూరైనవి', 'प्राप्त / स्वीकृत')}</option>
                <option value="in_progress">{pick('In Progress / Applied', 'దరఖాస్తు ప్రక్రియలో', 'आवेदन प्रगति पर')}</option>
                <option value="still_eligible">{pick('Still Likely Eligible (Unclaimed)', 'ఇంకా అర్హత ఉన్నవి', 'शेष संभावित पात्र')}</option>
                <option value="needs_info">{pick('Needs More Info', 'మరిన్ని వివరాలు అవసరం', 'अधिक जानकारी आवश्यक')}</option>
              </select>
            </div>

            <div>
              <label htmlFor="viz-sort" className="block text-[11px] font-bold text-primary mb-1">
                {pick('Sort Sectors By', 'క్రమం', 'क्रमबद्ध करें')}
              </label>
              <select
                id="viz-sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'value' | 'count')}
                className="w-full min-h-[40px] rounded-md border border-input bg-white px-2.5 text-xs font-medium text-body"
              >
                <option value="value">{pick('Estimated Annual Benefit (₹)', 'వార్షిక ప్రయోజనం (₹)', 'वार्षिक लाभ (₹)')}</option>
                <option value="count">{pick('Number of Schemes', 'పథకాల సంఖ్య', 'योजनाओं की संख्या')}</option>
              </select>
            </div>
          </div>

          {/* KPI Summary Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5">
              <div className="text-[11px] font-bold text-emerald-900 uppercase">
                {pick('Sectors Availed', 'పొందిన రంగాలు', 'प्राप्त क्षेत्र')}
              </div>
              <div className="text-2xl font-extrabold text-emerald-800 mt-0.5">
                {computed.availedSectorNames.length}
              </div>
              <div className="text-[11px] text-emerald-900/80">
                {computed.availedEntries.length} {pick('scheme(s) sanctioned', 'పథకం మంజూరు', 'योजना स्वीकृत')}
              </div>
            </div>

            <div className="rounded-xl border border-amber-300 bg-amber-50/70 p-3.5">
              <div className="text-[11px] font-bold text-amber-950 uppercase">
                {pick('Still Likely Eligible', 'ఇంకా అర్హత ఉన్న రంగాలు', 'शेष संभावित पात्र')}
              </div>
              <div className="text-2xl font-extrabold text-amber-800 mt-0.5">
                {computed.unclaimedSectorNames.length}
              </div>
              <div className="text-[11px] text-amber-900">
                {computed.stillEligibleEntries.length} {pick('unclaimed scheme(s)', 'క్లెయిమ్ చేయని పథకాలు', 'अदावाकृत योजनाएं')}
              </div>
            </div>

            <div className="rounded-xl border border-emerald-200 bg-white p-3.5">
              <div className="text-[11px] font-bold text-muted uppercase flex items-center gap-1">
                <IndianRupee className="h-3.5 w-3.5 text-emerald-700" aria-hidden="true" />
                {pick('Claimed / Yr', 'పొందిన లబ్ధి / సం.', 'प्राप्त लाभ / वर्ष')}
              </div>
              <div className="text-xl sm:text-2xl font-extrabold text-emerald-700 mt-0.5">
                ₹{computed.totalClaimedInr.toLocaleString('en-IN')}
              </div>
            </div>

            <div className="rounded-xl border border-amber-200 bg-white p-3.5">
              <div className="text-[11px] font-bold text-muted uppercase flex items-center gap-1">
                <IndianRupee className="h-3.5 w-3.5 text-amber-700" aria-hidden="true" />
                {pick('Unclaimed Opportunity', 'ఇంకా పొందగల లబ్ధి', 'शेष संभावित लाभ')}
              </div>
              <div className="text-xl sm:text-2xl font-extrabold text-amber-700 mt-0.5">
                ₹{computed.totalUnclaimedInr.toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          {/* Visual Charts Row: Coverage Ring + Stacked Sector Comparison Bars */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-2 items-center">
            {/* SVG Coverage Donut */}
            <div className="lg:col-span-4 flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-2">
              <svg
                viewBox="0 0 110 110"
                className="w-32 h-32"
                role="img"
                aria-label={`Welfare coverage ${computed.coveragePercent}% availed`}
              >
                <circle
                  cx="55"
                  cy="55"
                  r={donutRadius}
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="12"
                />
                <circle
                  cx="55"
                  cy="55"
                  r={donutRadius}
                  fill="none"
                  stroke="#059669"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={donutCircumference}
                  strokeDashoffset={donutStrokeDashoffset}
                  transform="rotate(-90 55 55)"
                />
                <text
                  x="55"
                  y="52"
                  textAnchor="middle"
                  className="fill-slate-900 font-extrabold text-[18px]"
                >
                  {computed.coveragePercent}%
                </text>
                <text
                  x="55"
                  y="68"
                  textAnchor="middle"
                  className="fill-slate-500 font-semibold text-[9px]"
                >
                  AVAILED
                </text>
              </svg>
              <p className={`text-xs text-center text-muted font-medium ${getFontClass()}`}>
                {pick(
                  `${computed.availedEntries.length} availed, ${computed.inProgressEntries.length} in progress, ${computed.stillEligibleEntries.length} still likely eligible`,
                  `${computed.availedEntries.length} పొందారు, ${computed.inProgressEntries.length} ప్రక్రియలో, ${computed.stillEligibleEntries.length} ఇంకా అర్హత`,
                  `${computed.availedEntries.length} प्राप्त, ${computed.inProgressEntries.length} प्रगति में, ${computed.stillEligibleEntries.length} शेष पात्र`
                )}
              </p>
            </div>

            {/* Stacked Sector Horizontal Bar Chart */}
            <div className="lg:col-span-8 space-y-3">
              <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold text-muted">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm bg-emerald-600" />
                  {pick('Availed / Sanctioned', 'పొందినవి', 'प्राप्त')}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm bg-blue-600" />
                  {pick('In Progress', 'ప్రక్రియలో', 'प्रगति पर')}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm bg-amber-500" />
                  {pick('Still Likely Eligible', 'ఇంకా అర్హత ఉన్నవి', 'शेष संभावित पात्र')}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm bg-slate-300" />
                  {pick('Needs Info', 'వివరాలు కావాలి', 'अधिक जानकारी')}
                </span>
              </div>

              {sortedRows.length === 0 ? (
                <p className="text-xs text-muted py-6 text-center border border-dashed rounded-lg">
                  {pick(
                    'No schemes match the active filter combination. Reset filters to view all sectors.',
                    'ఎంచుకున్న ఫిల్టర్లకు పథకాలు లేవు. ఫిల్టర్లను మార్చండి.',
                    'चयनित फ़िल्टर के लिए कोई योजना नहीं मिली।'
                  )}
                </p>
              ) : (
                <div className="space-y-2.5">
                  {sortedRows.map((row) => {
                    const label = pick(
                      SECTOR_LABELS[row.sector].en,
                      SECTOR_LABELS[row.sector].te,
                      SECTOR_LABELS[row.sector].hi
                    );
                    const total = row.entries.length;
                    const barWidthPct = Math.max(18, Math.round((total / maxRowTotal) * 100));
                    const wAvailed = Math.round((row.availedCount / total) * 100);
                    const wProg = Math.round((row.inProgressCount / total) * 100);
                    const wEligible = Math.round((row.stillEligibleCount / total) * 100);
                    const wInfo = Math.max(0, 100 - wAvailed - wProg - wEligible);

                    return (
                      <button
                        key={row.sector}
                        type="button"
                        onClick={() =>
                          setSectorFilter((prev) => (prev === row.sector ? 'all' : row.sector))
                        }
                        className={`w-full text-left rounded-lg p-2.5 border transition-colors ${
                          sectorFilter === row.sector
                            ? 'border-primary bg-primary/5'
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-bold text-primary mb-1.5 gap-2">
                          <span className={getFontClass()}>{label}</span>
                          <span className="text-[11px] text-muted shrink-0">
                            {row.availedCount} availed • {row.stillEligibleCount} eligible
                            {row.unclaimedBenefitInr > 0
                              ? ` (₹${row.unclaimedBenefitInr.toLocaleString('en-IN')}/yr unclaimed)`
                              : ''}
                          </span>
                        </div>
                        <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${barWidthPct}%` }}
                            className="h-full flex rounded-full overflow-hidden"
                          >
                            {wAvailed > 0 && (
                              <div style={{ width: `${wAvailed}%` }} className="bg-emerald-600 h-full" />
                            )}
                            {wProg > 0 && (
                              <div style={{ width: `${wProg}%` }} className="bg-blue-600 h-full" />
                            )}
                            {wEligible > 0 && (
                              <div style={{ width: `${wEligible}%` }} className="bg-amber-500 h-full" />
                            )}
                            {wInfo > 0 && (
                              <div style={{ width: `${wInfo}%` }} className="bg-slate-300 h-full" />
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Two-Column Actionable Drilldown: Availed vs Still Likely Eligible */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Column 1: Actually Availed Sectors */}
        <Card className="border-emerald-300 bg-white">
          <CardHeader className="pb-3 border-b border-emerald-100 bg-emerald-50/40">
            <CardTitle className={`text-base font-extrabold text-emerald-950 flex items-center gap-2 ${getFontClass()}`}>
              <CheckCircle2 className="h-5 w-5 text-emerald-700 shrink-0" aria-hidden="true" />
              <span>
                {pick(
                  `Sectors & Schemes You Actually Availed (${computed.availedEntries.length})`,
                  `మీరు ఇప్పటికే పొందిన పథకాలు (${computed.availedEntries.length})`,
                  `आपके द्वारा प्राप्त योजनाएं (${computed.availedEntries.length})`
                )}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {computed.availedEntries.length === 0 ? (
              <p className={`text-xs sm:text-sm text-muted py-4 ${getFontClass()}`}>
                {pick(
                  'No schemes marked as "Availed / Sanctioned" yet. Mark any sanctioned scheme in My Tracker to update your claimed coverage chart.',
                  'ఇంకా ఏ పథకాన్ని "మంజూరైనవి"గా గుర్తించలేదు. నా ట్రాకర్‌లో అప్‌డేట్ చేయండి.',
                  'अभी तक कोई योजना "प्राप्त / स्वीकृत" चिह्नित नहीं है। मेरे ट्रैकर में स्थिति अपडेट करें।'
                )}
              </p>
            ) : (
              computed.availedEntries.map((entry) => (
                <div
                  key={entry.scheme.id}
                  className="rounded-lg border border-emerald-200 bg-emerald-50/30 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div>
                    <Badge className="bg-emerald-100 text-emerald-900 border-emerald-300 text-[11px] mb-1">
                      {pick(
                        SECTOR_LABELS[entry.sector].en,
                        SECTOR_LABELS[entry.sector].te,
                        SECTOR_LABELS[entry.sector].hi
                      )}
                    </Badge>
                    <p className={`text-sm font-bold text-primary ${getFontClass()}`}>
                      {pick(entry.scheme.name_en, entry.scheme.name_te, entry.scheme.name_hi)}
                    </p>
                    <p className="text-xs text-muted">
                      {pick(
                        entry.scheme.benefit_summary_en,
                        entry.scheme.benefit_summary_te,
                        entry.scheme.benefit_summary_hi
                      )}
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(ROUTES.MY_SCHEMES)}
                    className="min-h-[36px] text-xs shrink-0 bg-white"
                  >
                    <Clock className="h-3.5 w-3.5 mr-1 text-emerald-700" aria-hidden="true" />
                    {pick('Renewal Alert', 'రెన్యువల్', 'नवीनीकरण')}
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Column 2: Other Sectors Still Likely Eligible */}
        <Card className="border-amber-300 bg-white">
          <CardHeader className="pb-3 border-b border-amber-100 bg-amber-50/40">
            <CardTitle className={`text-base font-extrabold text-amber-950 flex items-center gap-2 ${getFontClass()}`}>
              <Sparkles className="h-5 w-5 text-amber-600 shrink-0" aria-hidden="true" />
              <span>
                {pick(
                  `Other Sectors You Are Still Likely Eligible For (${computed.stillEligibleEntries.length})`,
                  `మీకు ఇంకా అర్హత ఉండే అవకాశం ఉన్న ఇతర రంగాలు (${computed.stillEligibleEntries.length})`,
                  `अन्य क्षेत्र जिनके लिए आप अभी भी संभावित पात्र हैं (${computed.stillEligibleEntries.length})`
                )}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {computed.stillEligibleEntries.length === 0 ? (
              <p className={`text-xs sm:text-sm text-muted py-4 ${getFontClass()}`}>
                {pick(
                  'All matching likely-eligible schemes under these filters are already tracked or availed!',
                  'ఈ ఫిల్టర్లలో అర్హత ఉన్న అన్ని పథకాలు ఇప్పటికే ట్రాక్ చేయబడ్డాయి!',
                  'इस फ़िल्टर के अंतर्गत सभी संभावित पात्र योजनाएं पहले ही ट्रैक की जा चुकी हैं!'
                )}
              </p>
            ) : (
              computed.stillEligibleEntries.map((entry) => {
                const tracked = isSchemeTracked(entry.scheme.id);
                return (
                  <div
                    key={entry.scheme.id}
                    className="rounded-lg border border-amber-200 bg-amber-50/30 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                  >
                    <div className="space-y-0.5">
                      <Badge className="bg-amber-100 text-amber-950 border-amber-300 text-[11px]">
                        {pick(
                          SECTOR_LABELS[entry.sector].en,
                          SECTOR_LABELS[entry.sector].te,
                          SECTOR_LABELS[entry.sector].hi
                        )}
                      </Badge>
                      <p className={`text-sm font-bold text-primary ${getFontClass()}`}>
                        {pick(entry.scheme.name_en, entry.scheme.name_te, entry.scheme.name_hi)}
                      </p>
                      <p className="text-xs text-muted">
                        {pick(
                          entry.scheme.benefit_summary_en,
                          entry.scheme.benefit_summary_te,
                          entry.scheme.benefit_summary_hi
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {!tracked && (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => trackSchemeFromResult(entry.scheme)}
                          className="min-h-[36px] text-xs bg-white"
                        >
                          <BookmarkPlus className="h-3.5 w-3.5 mr-1 text-primary" aria-hidden="true" />
                          {pick('Track', 'ట్రాక్', 'ट्रैक')}
                        </Button>
                      )}
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => navigate(ROUTES.APPLICATION_GUIDE(entry.scheme.id))}
                        className="min-h-[36px] text-xs font-bold"
                      >
                        {pick('Apply', 'దరఖాస్తు', 'आवेदन')}
                        <ArrowRight className="h-3.5 w-3.5 ml-1" aria-hidden="true" />
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
