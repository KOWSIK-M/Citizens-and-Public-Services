import React from 'react';
import { useLanguage } from '@/store/useLanguageStore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { AlertCircle, ShieldAlert } from 'lucide-react';

export const DisclaimerPage: React.FC = () => {
  const { pick, getFontClass } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="space-y-2">
        <h1 className={`text-2xl md:text-3xl font-extrabold text-primary flex items-center gap-2.5 ${getFontClass()}`}>
          <AlertCircle className="h-8 w-8 text-amber-700 shrink-0" aria-hidden="true" />
          <span>{pick('Statutory Legal Disclaimer', 'చట్టపరమైన నిరాకరణ & ముఖ్య గమనిక', 'वैधानिक कानूनी अस्वीकरण')}</span>
        </h1>
        <p className={`text-sm text-muted ${getFontClass()}`}>
          {pick(
            'Last updated: November 2026 • Problem Statement 5: "Claim What’s Yours"',
            'చివరిగా నవీకరించబడింది: నవంబర్ 2026 • సమస్య ప్రకటన 5: "మీ హక్కులను పొందండి"',
            'अंतिम अपडेट: नवंबर 2026 • समस्या विवरण 5: "अपने हक़ का लाभ पाएं"'
          )}
        </p>
      </div>

      <Card className="border-amber-300 bg-amber-50/50 shadow-sm">
        <CardHeader className="p-6 pb-3">
          <CardTitle className={`text-lg md:text-xl font-bold text-amber-950 flex items-center gap-2 ${getFontClass()}`}>
            <ShieldAlert className="h-5 w-5 text-amber-800 shrink-0" aria-hidden="true" />
            <span>
              {pick(
                'Preliminary Guidance Only — Never an Official Government Guarantee',
                'ప్రాథమిక సమాచారం మాత్రమే — అధికారిక ప్రభుత్వ మంజూరు లేదా గ్యారెంటీ కాదు',
                'केवल प्रारंभिक मार्गदर्शन — यह कोई आधिकारिक सरकारी स्वीकृति या गारंटी नहीं है'
              )}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className={`p-6 pt-2 space-y-4 text-sm md:text-base text-slate-800 leading-relaxed ${getFontClass()}`}>
          <p>
            {pick(
              'ClaimSaathi is an independent, citizen-assistance navigation tool built on publicly available government scheme information. It is not affiliated with or operated by any state or central government ministry. Please note:',
              'క్లెయిమ్ సాథీ అనేది బహిరంగంగా అందుబాటులో ఉన్న ప్రభుత్వ పథకాల సమాచారం ఆధారంగా రూపొందించబడిన స్వతంత్ర పౌర సహాయక వేదిక. ఇది ప్రభుత్వ అధికారిక వెబ్‌సైట్ కాదు. ముఖ్య విషయాలు:',
              'क्लेम साथी सार्वजनिक रूप से उपलब्ध सरकारी योजना जानकारी पर आधारित एक स्वतंत्र नागरिक सहायता मंच है। यह किसी सरकारी मंत्रालय द्वारा संचालित नहीं है। कृपया ध्यान दें:'
            )}
          </p>
          <ul className="list-disc pl-5 space-y-3 text-sm md:text-base">
            <li>
              <strong>
                {pick(
                  '"Likely Eligible" — Never "Guaranteed":',
                  '"అర్హత పొందే అవకాశం ఉంది" — "గ్యారెంటీ" కాదు:',
                  '"पात्र होने की संभावना" — "गारंटी" कभी नहीं:'
                )}
              </strong>{' '}
              {pick(
                'Results indicate only that your coarse household profile appears to match published scheme rules. Final verification and sanction rest solely with your Grama/Ward Sachivalayam or government department.',
                'ఫలితాలు కేవలం మీ సాధారణ వివరాలు ప్రభుత్వ నిబంధనలకు సరిపోతున్నాయని మాత్రమే సూచిస్తాయి. తుది పరిశీలన మరియు మంజూరు అధికారం పూర్తిగా గ్రామ/వార్డు సచివాలయం మరియు సంబంధిత ప్రభుత్వ శాఖదే.',
                'परिणाम केवल यह दर्शाते हैं कि आपका सामान्य विवरण प्रकाशित नियमों से मेल खाता है। अंतिम सत्यापन और स्वीकृति का अधिकार केवल ग्राम/वार्ड सचिवालय और संबंधित सरकारी विभाग का है।'
              )}
            </li>
            <li>
              <strong>
                {pick(
                  'Zero Sensitive Personal Data:',
                  'ఎటువంటి వ్యక్తిగత గుర్తింపు డేటా సేకరించబడదు:',
                  'शून्य संवेदनशील व्यक्तिगत डेटा:'
                )}
              </strong>{' '}
              {pick(
                'Do not enter Aadhaar numbers, PAN cards, Voter IDs, bank account numbers, or mobile numbers anywhere on this platform. Testing and demonstrations use synthetic sample profiles only.',
                'ఈ వేదికపై ఎక్కడా ఆధార్, పాన్, ఓటర్ ఐడి, బ్యాంక్ ఖాతా లేదా ఫోన్ నంబర్లను నమోదు చేయవద్దు. పరీక్షల కోసం నమూనా ప్రొఫైల్స్ మాత్రమే ఉపయోగించబడతాయి.',
                'इस प्लेटफॉर्म पर कहीं भी आधार नंबर, पैन कार्ड, वोटर आईडी, बैंक खाता या मोबाइल नंबर दर्ज न करें। परीक्षण केवल सिंथेटिक नमूना प्रोफ़ाइल के साथ किया जाता है।'
              )}
            </li>
            <li>
              <strong>
                {pick(
                  'Verify Against Official Sources & Never Pay Middlemen:',
                  'అధికారిక పోర్టల్‌లో సరిచూసుకోండి & దళారులకు డబ్బు ఇవ్వకండి:',
                  'आधिकारिक पोर्टल पर पुष्टि करें और बिचौलियों को शुल्क न दें:'
                )}
              </strong>{' '}
              {pick(
                'Scheme guidelines and deadlines change periodically through new Government Orders (G.O.s). Always verify current rules on the official portal linked on each scheme card, and apply free at your Grama/Ward Sachivalayam.',
                'ప్రభుత్వ ఉత్తర్వుల (G.O.) ద్వారా నిబంధనలు మారవచ్చు. ప్రతి పథకం కార్డుపై ఉన్న అధికారిక పోర్టల్ లింక్‌లో తాజా వివరాలను చూసుకోండి మరియు సచివాలయంలో ఉచితంగా దరఖాస్తు చేయండి.',
                'सरकारी आदेशों (G.O.) के माध्यम से नियम बदल सकते हैं। प्रत्येक योजना कार्ड पर दिए गए आधिकारिक पोर्टल लिंक की जांच करें और सचिवालय में निःशुल्क आवेदन करें।'
              )}
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};
