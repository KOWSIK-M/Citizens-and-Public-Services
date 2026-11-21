import React from 'react';
import { useLanguage } from '@/store/useLanguageStore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { AlertCircle, ShieldAlert } from 'lucide-react';

export const DisclaimerPage: React.FC = () => {
  const { pick, getFontClass } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="space-y-2">
        <h1 className={`text-3xl font-extrabold text-primary flex items-center gap-2.5 ${getFontClass()}`}>
          <AlertCircle className="h-8 w-8 text-amber-600" aria-hidden="true" />
          <span>{pick('Statutory Legal Disclaimer', 'చట్టపరమైన నిరాకరణ', 'वैधानिक कानूनी अस्वीकरण')}</span>
        </h1>
        <p className="text-sm text-muted">
          Last updated: November 2026 | PS5 "Claim What's Yours"
        </p>
      </div>

      <Card className="border-amber-200 bg-amber-50/40">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-amber-950 flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-amber-700" />
            <span>Preliminary Guidance Only – Not an Official Government Sanction</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-slate-800 leading-relaxed">
          <p>
            ClaimSaathi is an independent, non-governmental technological decision-support and navigation tool developed for research and public service access. The assessments and recommendations produced by this platform:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-xs md:text-sm">
            <li>
              <strong>Are preliminary estimates:</strong> Statements of "Likely eligible" indicate only that your provided coarse details appear to satisfy the public eligibility conditions of a scheme.
            </li>
            <li>
              <strong>Do not constitute official approval:</strong> ClaimSaathi cannot sanction, approve, guarantee, or disburse any government benefit, scholarship, pension, or fund. Official sanctions rest entirely with the authorized government department, Grama/Ward Sachivalayam, or nodal agency.
            </li>
            <li>
              <strong>Require official verification:</strong> All criteria, document requirements, and deadlines are derived from publicly accessible government orders and portal notices. Government rules are subject to change. Always verify current guidelines at the official portal link cited on each scheme card.
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};
