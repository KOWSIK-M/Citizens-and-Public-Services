import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/store/useLanguageStore';
import { addOrUpdate } from '@/store/useTrackingStore';
import { MOCK_GOVERNMENT_SCHEMES } from '@/services/mockSchemeData';
import { VerificationBadge } from '@/components/common/VerificationBadge';
import { DocumentChecklist } from '@/components/scheme/DocumentChecklist';
import { ApplicationStepList } from '@/components/scheme/ApplicationStepList';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ROUTES } from '@/config/routes';
import {
  ArrowLeft,
  FileCheck,
  Navigation,
  Info,
  ExternalLink,
  IndianRupee,
  Building,
  CheckCircle2,
} from 'lucide-react';

export const SchemeDetailPage: React.FC = () => {
  const { schemeId } = useParams<{ schemeId: string }>();
  const navigate = useNavigate();
  const { pick, getFontClass } = useLanguage();

  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'steps'>('overview');

  const scheme = MOCK_GOVERNMENT_SCHEMES.find((s) => s.id === schemeId);

  if (!scheme) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center space-y-4">
        <h2 className="text-xl font-bold text-body">
          {pick('Scheme not found', 'పథకం కనుగొనబడలేదు', 'योजना नहीं मिली')}
        </h2>
        <Button onClick={() => navigate(ROUTES.RESULTS)}>
          {pick('Back to Results', 'ఫలితాలకు వెనుకకు', 'परिणामों पर वापस')}
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-6 md:py-10 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Back button */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(ROUTES.RESULTS)}
          className="text-xs text-muted hover:text-body inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>{pick('Back to Results', 'ఫలితాలకు వెనుకకు', 'परिणामों पर वापस')}</span>
        </Button>
      </div>

      {/* Scheme Header Hero */}
      <Card className="border border-border shadow-xs bg-white">
        <CardHeader className="p-6 md:p-8 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="border-primary/40 text-primary font-semibold text-xs">
                {scheme.level === 'state'
                  ? pick('Andhra Pradesh State Scheme', 'ఆంధ్రప్రదేశ్ రాష్ట్ర పథకం', 'आंध्र प्रदेश राज्य योजना')
                  : pick('Central Scheme', 'కేంద్ర పథకం', 'केंद्रीय योजना')}
              </Badge>
              <Badge variant="secondary" className="text-xs capitalize">
                {scheme.category}
              </Badge>
            </div>
            <VerificationBadge isVerified={!!scheme.source.verified_at} verifiedAt={scheme.source.verified_at} />
          </div>

          <h1 className={`text-2xl md:text-3xl font-extrabold text-body leading-tight ${getFontClass()}`}>
            {pick(scheme.name_en, scheme.name_te, scheme.name_hi)}
          </h1>

          <div className="flex items-start gap-2 bg-slate-50 border border-slate-200/80 rounded-md p-4 text-sm font-semibold text-slate-800">
            <IndianRupee className="h-5 w-5 text-primary shrink-0 mt-0.5" aria-hidden="true" />
            <span className={getFontClass()}>
              {pick(scheme.benefit_summary_en, scheme.benefit_summary_te, scheme.benefit_summary_hi)}
            </span>
          </div>

          <div>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                addOrUpdate({
                  schemeId: scheme.id,
                  status: 'not_started',
                  deadline: null,
                  updatedAt: new Date().toISOString(),
                })
              }
            >
              Track this application
            </Button>
          </div>
        </CardHeader>

        {/* Tab Navigation Controls */}
        <div className="border-t border-slate-200 px-6 flex items-center gap-2 overflow-x-auto bg-slate-50/50">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`py-3.5 px-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap inline-flex items-center gap-2 ${
              activeTab === 'overview'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted hover:text-body'
            } ${getFontClass()}`}
          >
            <Info className="h-4 w-4" aria-hidden="true" />
            <span>{pick('Overview & Rules', 'సమీక్ష & నిబంధనలు', 'अवलोकन और नियम')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('documents')}
            className={`py-3.5 px-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap inline-flex items-center gap-2 ${
              activeTab === 'documents'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted hover:text-body'
            } ${getFontClass()}`}
          >
            <FileCheck className="h-4 w-4" aria-hidden="true" />
            <span>{pick('Document Checklist', 'పత్రాల జాబితా', 'दस्तावेज़ सूची')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('steps')}
            className={`py-3.5 px-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap inline-flex items-center gap-2 ${
              activeTab === 'steps'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted hover:text-body'
            } ${getFontClass()}`}
          >
            <Navigation className="h-4 w-4" aria-hidden="true" />
            <span>{pick('How to Apply', 'దరఖాస్తు విధానం', 'आवेदन कैसे करें')}</span>
          </button>
        </div>
      </Card>

      {/* Tab 1: Overview & Rules */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <Card>
            <CardHeader className="p-6">
              <CardTitle className="text-lg font-bold">
                {pick('Scheme Description', 'పథకం వివరణ', 'योजना का विवरण')}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6 pt-0 text-sm md:text-base text-slate-700 leading-relaxed">
              <p className={getFontClass()}>
                {pick(scheme.description_en, scheme.description_te, scheme.description_hi)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-6">
              <CardTitle className="text-lg font-bold">
                {pick('Eligibility Criteria & Conditions', 'అర్హత నిబంధనలు & షరతులు', 'पात्रता मानदंड और शर्तें')}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6 pt-0 space-y-3">
              {scheme.rules.map((rule) => (
                <div key={rule.rule_id} className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" aria-hidden="true" />
                  <div className="text-sm">
                    <span className="font-semibold text-body">
                      {rule.field_name.replace(/_/g, ' ').toUpperCase()}: {rule.operator} {rule.value}
                    </span>
                    <p className={`text-slate-600 mt-1 leading-relaxed ${getFontClass()}`}>
                      {pick(rule.reason_en, rule.reason_te, rule.reason_hi)}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Official Source Card */}
          <Card className="bg-slate-50 border-slate-200">
            <CardHeader className="p-6 pb-3">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
                <Building className="h-4 w-4 text-primary" aria-hidden="true" />
                <span>{pick('Official Source Metadata', 'అధికారిక ఆధార పత్రాలు', 'आधिकारिक स्रोत विवरण')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0 text-xs md:text-sm text-slate-700 space-y-1">
              <p>
                <strong>Publisher:</strong> {scheme.source.publisher}
              </p>
              <p>
                <strong>Document Type:</strong> {scheme.source.document_type}
              </p>
              <p>
                <strong>Verified by:</strong> {scheme.source.verified_by} ({scheme.source.verified_at || 'Pending'})
              </p>
              <div className="pt-2">
                <a
                  href={scheme.source.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center gap-1 font-semibold"
                >
                  <span>{scheme.source.source_url}</span>
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 2: Document Checklist */}
      {activeTab === 'documents' && (
        <DocumentChecklist
          schemeNameEn={scheme.name_en}
          schemeNameTe={scheme.name_te}
          schemeNameHi={scheme.name_hi}
          documents={scheme.documents}
        />
      )}

      {/* Tab 3: Step-by-Step Guide */}
      {activeTab === 'steps' && (
        <ApplicationStepList
          steps={scheme.steps}
          officialPortalUrl={scheme.source.source_url}
        />
      )}
    </div>
  );
};
