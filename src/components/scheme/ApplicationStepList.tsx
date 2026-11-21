import React from 'react';
import { useLanguage } from '@/store/useLanguageStore';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { ApplicationStep } from '@/types/scheme';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Navigation,
  ExternalLink,
  Building2,
  Laptop,
  Clock,
  PhoneCall,
  Volume2,
  VolumeX,
  CheckSquare,
} from 'lucide-react';

export interface ApplicationStepListProps {
  schemeId?: string;
  steps: ApplicationStep[];
  officialPortalUrl: string;
  statusCheckUrl?: string;
  slaDays?: number;
  grievanceHelpline?: string;
  followupEn?: string;
  followupTe?: string;
  followupHi?: string;
}

export const ApplicationStepList: React.FC<ApplicationStepListProps> = ({
  schemeId = 'steps-guide',
  steps,
  officialPortalUrl,
  statusCheckUrl,
  slaDays,
  grievanceHelpline,
  followupEn,
  followupTe,
  followupHi,
}) => {
  const { pick, getFontClass, language } = useLanguage();
  const { isSupported: ttsSupported, isSpeaking, toggleSpeak } = useSpeechSynthesis();

  const ttsKey = `steps-${schemeId}`;
  const speakingNow = isSpeaking(ttsKey);

  const handleListenSteps = () => {
    const stepSpeech = steps
      .map(
        (s) =>
          `${pick('Step', 'దశ', 'चरण')} ${s.step_no}: ${pick(
            s.title_en,
            s.title_te,
            s.title_hi
          )}. ${pick(s.description_en, s.description_te, s.description_hi)}`
      )
      .join(' ');
    const followupSpeech = followupEn ? pick(followupEn, followupTe, followupHi) : '';
    toggleSpeak(ttsKey, `${stepSpeech} ${followupSpeech}`, language);
  };

  const getChannelBadge = (channel: ApplicationStep['channel']) => {
    switch (channel) {
      case 'online':
        return (
          <Badge variant="info" className={`inline-flex items-center gap-1 text-sm ${getFontClass()}`}>
            <Laptop className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{pick('Online Portal', 'ఆన్‌లైన్ పోర్టల్', 'ऑनलाइन पोर्टल')}</span>
          </Badge>
        );
      case 'csc_sachivalayam':
        return (
          <Badge variant="success" className={`inline-flex items-center gap-1 text-sm ${getFontClass()}`}>
            <Building2 className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{pick('Grama/Ward Sachivalayam', 'గ్రామ/వార్డు సచివాలయం', 'ग्राम/वार्ड सचिवालय')}</span>
          </Badge>
        );
      case 'offline_office':
      default:
        return (
          <Badge variant="secondary" className={`inline-flex items-center gap-1 text-sm ${getFontClass()}`}>
            <Building2 className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{pick('Department / School Desk', 'సంబంధిత శాఖ కార్యాలయం', 'विभागीय कार्यालय')}</span>
          </Badge>
        );
    }
  };

  if (!steps || steps.length === 0) {
    return (
      <Card className="border border-border shadow-sm my-6 p-6 text-center text-sm text-muted">
        {pick(
          'Application steps are being verified against the official Government Order.',
          'దరఖాస్తు విధానం అధికారిక ప్రభుత్వ ఉత్తర్వుల ఆధారంగా ధృవీకరించబడుతోంది.',
          'आधिकारिक सरकारी आदेश के अनुसार आवेदन चरण सत्यापित किए जा रहे हैं।'
        )}
      </Card>
    );
  }

  return (
    <Card className="border border-border shadow-sm my-6 print-card">
      <CardHeader className="p-5 md:p-6 pb-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <CardTitle className={`text-lg md:text-xl flex items-center gap-2 ${getFontClass()}`}>
            <Navigation className="h-5 w-5 text-primary shrink-0" aria-hidden="true" />
            <span>
              {pick(
                'Step-by-Step Application & Follow-Up Guide',
                'దరఖాస్తు & తదుపరి పరిశీలన మార్గదర్శి',
                'चरण-दर-चरण आवेदन व फॉलो-अप मार्गदर्शिका'
              )}
            </span>
          </CardTitle>
          <p className={`text-sm text-muted mt-1 ${getFontClass()}`}>
            {pick(
              'Follow this verified sequence directly—zero middleman fee required.',
              'దళారుల అవసరం లేకుండా నేరుగా ఈ అధికారిక క్రమాన్ని పాటించండి.',
              'बिना किसी बिचौलिये के सीधे इस आधिकारिक प्रक्रिया का पालन करें।'
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 no-print">
          {ttsSupported && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleListenSteps}
              className={`min-h-[44px] px-3.5 text-sm inline-flex items-center gap-1.5 ${
                speakingNow ? 'bg-primary text-white border-primary' : 'bg-white text-primary border-primary/40'
              } ${getFontClass()}`}
            >
              {speakingNow ? (
                <VolumeX className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Volume2 className="h-4 w-4" aria-hidden="true" />
              )}
              <span>{speakingNow ? pick('Stop', 'ఆపండి', 'रोकें') : pick('Listen Steps', 'దశలు వినండి', 'चरण सुनें')}</span>
            </Button>
          )}

          <Button
            asChild
            variant="default"
            size="sm"
            className={`min-h-[44px] text-sm px-4 inline-flex items-center gap-1.5 ${getFontClass()}`}
          >
            <a href={officialPortalUrl} target="_blank" rel="noopener noreferrer">
              <span>{pick('Open Official Portal', 'అధికారిక పోర్టల్ తెరవండి', 'आधिकारिक पोर्टल खोलें')}</span>
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </a>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-5 md:p-6 space-y-6">
        <ol className="relative border-l-2 border-primary/30 ml-4 space-y-6 my-2">
          {steps.map((step) => (
            <li key={step.step_no} className="ml-6 relative">
              <span className="absolute -left-[37px] flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white font-bold text-sm shadow-sm">
                {step.step_no}
              </span>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <h3 className={`text-base font-bold text-body ${getFontClass()}`}>
                    {pick(step.title_en, step.title_te, step.title_hi)}
                  </h3>
                  {getChannelBadge(step.channel)}
                </div>

                <p className={`text-sm text-slate-700 leading-relaxed ${getFontClass()}`}>
                  {pick(step.description_en, step.description_te, step.description_hi)}
                </p>

                {step.official_action_url && (
                  <div className="mt-3">
                    <a
                      href={step.official_action_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`min-h-[44px] inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline ${getFontClass()}`}
                    >
                      <span>{pick('Open Direct Registration / Portal Link', 'నేరుగా అధికారిక లింక్ తెరవండి', 'सीधा आधिकारिक लिंक खोलें')}</span>
                      <ExternalLink className="h-4 w-4" aria-hidden="true" />
                    </a>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ol>

        {/* Scheme-Specific Follow-up & Escalation Playbook */}
        <div className="rounded-lg bg-blue-50/90 border border-blue-200 p-5 text-sm text-blue-950 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className={`text-base font-bold flex items-center gap-2 ${getFontClass()}`}>
              <Clock className="h-5 w-5 text-blue-800 shrink-0" aria-hidden="true" />
              <span>
                {pick(
                  'How to Follow Up & Escalate If Delayed',
                  'దరఖాస్తు తర్వాత స్థితి తనిఖీ & ఫిర్యాదు విధానం',
                  'आवेदन के बाद स्थिति जांच और शिकायत निवारण'
                )}
              </span>
            </h3>
            {slaDays && (
              <Badge variant="info" className={`text-sm font-bold ${getFontClass()}`}>
                {pick(
                  `Expected Processing SLA: ~${slaDays} day${slaDays > 1 ? 's' : ''}`,
                  `సాధారణ పరిశీలన సమయం: ~${slaDays} రోజులు`,
                  `अनुमानित समय-सीमा: ~${slaDays} दिन`
                )}
              </Badge>
            )}
          </div>

          <p className={`leading-relaxed text-slate-800 ${getFontClass()}`}>
            {followupEn
              ? pick(followupEn, followupTe, followupHi)
              : pick(
                  'Always collect an official printed GSWS acknowledgement receipt from Sachivalayam staff. If no update arrives within the SLA window, escalate free of cost via AP Helpline 1902.',
                  'సచివాలయ సిబ్బంది నుండి ఎల్లప్పుడూ అధికారిక రసీదు తీసుకోండి. నిర్ణీత గడువులో సమాచారం రాకపోతే 1902 టోల్-ఫ్రీ నంబర్‌కు కాల్ చేయండి.',
                  'हमेशा सचिवालय से आधिकारिक मुद्रित पावती रसीद प्राप्त करें। समय-सीमा में अपडेट न मिलने पर टोल-फ्री 1902 पर संपर्क करें।'
                )}
          </p>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-blue-200/80">
            <div className="flex items-center gap-2 font-semibold text-blue-950">
              <PhoneCall className="h-4 w-4 text-blue-800 shrink-0" aria-hidden="true" />
              <span>
                {grievanceHelpline || '1902 (AP Public Grievance Helpline) • Mana Mitra WhatsApp: 9552300009'}
              </span>
            </div>

            {statusCheckUrl && (
              <Button
                asChild
                variant="outline"
                size="sm"
                className={`no-print min-h-[44px] bg-white border-blue-400 text-blue-900 hover:bg-blue-100 text-sm inline-flex items-center gap-1.5 ${getFontClass()}`}
              >
                <a href={statusCheckUrl} target="_blank" rel="noopener noreferrer">
                  <CheckSquare className="h-4 w-4" aria-hidden="true" />
                  <span>{pick('Check Application Status Online', 'ఆన్‌లైన్‌లో దరఖాస్తు స్థితి చూడండి', 'ऑनलाइन आवेदन स्थिति जांचें')}</span>
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
