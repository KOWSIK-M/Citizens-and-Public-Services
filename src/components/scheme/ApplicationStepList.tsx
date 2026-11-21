import React from 'react';
import { useLanguage } from '@/store/useLanguageStore';
import { ApplicationStep } from '@/types/scheme';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Navigation, ExternalLink, Building2, Laptop, Clock } from 'lucide-react';

export interface ApplicationStepListProps {
  steps: ApplicationStep[];
  officialPortalUrl: string;
}

export const ApplicationStepList: React.FC<ApplicationStepListProps> = ({
  steps,
  officialPortalUrl,
}) => {
  const { pick, getFontClass } = useLanguage();

  const getChannelBadge = (channel: ApplicationStep['channel']) => {
    switch (channel) {
      case 'online':
        return (
          <Badge variant="info" className="inline-flex items-center gap-1 text-[11px]">
            <Laptop className="h-3 w-3" aria-hidden="true" />
            <span>{pick('Online Portal', 'ఆన్‌లైన్ పోర్టల్', 'ऑनलाइन पोर्टल')}</span>
          </Badge>
        );
      case 'csc_sachivalayam':
        return (
          <Badge variant="success" className="inline-flex items-center gap-1 text-[11px]">
            <Building2 className="h-3 w-3" aria-hidden="true" />
            <span>{pick('Grama/Ward Sachivalayam', 'గ్రామ/వార్డు సచివాలయం', 'ग्राम/वार्ड सचिवालय')}</span>
          </Badge>
        );
      case 'offline_office':
      default:
        return (
          <Badge variant="secondary" className="inline-flex items-center gap-1 text-[11px]">
            <Building2 className="h-3 w-3" aria-hidden="true" />
            <span>{pick('Department Office', 'సంబంధిత శాఖ కార్యాలయం', 'विभागीय कार्यालय')}</span>
          </Badge>
        );
    }
  };

  return (
    <Card className="border border-border shadow-xs my-6 print-card">
      <CardHeader className="p-5 md:p-6 pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <CardTitle className={`text-lg md:text-xl flex items-center gap-2 ${getFontClass()}`}>
            <Navigation className="h-5 w-5 text-primary" aria-hidden="true" />
            <span>{pick('Step-by-Step Application Guide', 'దరఖాస్తు విధాన మార్గదర్శి', 'चरण-दर-चरण आवेदन मार्गदर्शिका')}</span>
          </CardTitle>
          <p className="text-xs md:text-sm text-muted mt-1">
            {pick(
              'Follow the official verified sequence to apply without paying middlemen.',
              'దళారులను ఆశ్రయించకుండా అధికారిక పద్ధతిలో దరఖాస్తు చేసుకోండి.',
              'बिचौलियों के बिना आधिकारिक प्रक्रिया का पालन करके आवेदन करें।'
            )}
          </p>
        </div>

        <a
          href={officialPortalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="no-print"
        >
          <Button variant="default" size="sm" className="text-xs h-9 inline-flex items-center gap-1.5">
            <span>{pick('Open Official Portal', 'అధికారిక పోర్టల్ ఓపెన్ చేయండి', 'आधिकारिक पोर्टल खोलें')}</span>
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </Button>
        </a>
      </CardHeader>

      <CardContent className="p-5 md:p-6">
        <ol className="relative border-l-2 border-primary/30 ml-4 space-y-8 my-2">
          {steps.map((step) => (
            <li key={step.step_no} className="ml-6 relative">
              {/* Step number badge */}
              <span className="absolute -left-[35px] flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white font-bold text-sm shadow-xs">
                {step.step_no}
              </span>

              <div className="bg-slate-50/80 border border-slate-200/80 rounded-lg p-4">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <h4 className={`text-base font-bold text-body ${getFontClass()}`}>
                    {pick(step.title_en, step.title_te, step.title_hi)}
                  </h4>
                  {getChannelBadge(step.channel)}
                </div>

                <p className={`text-xs md:text-sm text-slate-700 leading-relaxed ${getFontClass()}`}>
                  {pick(step.description_en, step.description_te, step.description_hi)}
                </p>

                {step.official_action_url && (
                  <div className="mt-3">
                    <a
                      href={step.official_action_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                    >
                      <span>{pick('Proceed to Official Link', 'అధికారిక లింక్‌కు వెళ్ళండి', 'आधिकारिक लिंक पर जाएं')}</span>
                      <ExternalLink className="h-3 w-3" aria-hidden="true" />
                    </a>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ol>

        {/* Follow-up Note */}
        <div className="mt-8 rounded-lg bg-blue-50 border border-blue-200 p-4 text-xs md:text-sm text-blue-950 flex items-start gap-3">
          <Clock className="h-5 w-5 text-blue-700 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="space-y-1">
            <h5 className="font-bold">
              {pick(
                'How to Follow Up After Submitting',
                'దరఖాస్తు సమర్పించిన తర్వాత ఏమి చేయాలి?',
                'आवेदन जमा करने के बाद क्या करें?'
              )}
            </h5>
            <p className="leading-relaxed">
              {pick(
                'Always collect an official acknowledgement receipt or reference number from the Sachivalayam staff or online portal. Welfare audits are published monthly in Grama Sachivalayams.',
                'సచివాలయం లేదా పోర్టల్ నుండి ఎల్లప్పుడూ అధికారిక రసీదు లేదా రిఫరెన్స్ నంబర్ తీసుకోండి. అర్హుల జాబితా ప్రతి నెలా ప్రదర్శించబడుతుంది.',
                'हमेशा सचिवालय कर्मचारी या ऑनलाइन पोर्टल से आधिकारिक रसीद या संदर्भ संख्या प्राप्त करें। पात्र लाभार्थियों की सूची हर महीने प्रकाशित की जाती है।'
              )}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
