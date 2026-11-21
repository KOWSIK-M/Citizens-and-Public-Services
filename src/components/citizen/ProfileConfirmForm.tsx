import React, { useState } from 'react';
import { useLanguage } from '@/store/useLanguageStore';
import { CitizenProfile, AgeBand, IncomeBand, OccupationCategory, LandHoldingBand, SocialCategory } from '@/types/profile';
import { AGE_BANDS, INCOME_BANDS, OCCUPATION_CATEGORIES, LAND_HOLDING_BANDS, SOCIAL_CATEGORIES, AP_DISTRICTS } from '@/config/bands';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { CheckCircle2, User, MapPin, IndianRupee, Briefcase, Landmark, Users } from 'lucide-react';

export interface ProfileConfirmFormProps {
  initialProfile: Partial<CitizenProfile>;
  onConfirm: (confirmed: CitizenProfile) => void;
  onBack: () => void;
  isLoading?: boolean;
}

export const ProfileConfirmForm: React.FC<ProfileConfirmFormProps> = ({
  initialProfile,
  onConfirm,
  onBack,
  isLoading = false,
}) => {
  const { pick, getFontClass } = useLanguage();

  const [ageBand, setAgeBand] = useState<AgeBand>(initialProfile.age_band || 'unknown');
  const [district, setDistrict] = useState<string>(initialProfile.district_code || 'Guntur');
  const [incomeBand, setIncomeBand] = useState<IncomeBand>(initialProfile.income_band || 'unknown');
  const [occupation, setOccupation] = useState<OccupationCategory>(initialProfile.occupation_category || 'unknown');
  const [landHolding, setLandHolding] = useState<LandHoldingBand>(initialProfile.land_holding_band || 'unknown');
  const [socialCategory, setSocialCategory] = useState<SocialCategory>(initialProfile.social_category || 'unknown');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const confirmed: CitizenProfile = {
      age_band: ageBand,
      state_code: 'AP',
      district_code: district,
      income_band: incomeBand,
      occupation_category: occupation,
      social_category: socialCategory,
      land_holding_band: landHolding,
      language_pref: initialProfile.language_pref || 'en',
      household_members: initialProfile.household_members || [],
      is_sample: initialProfile.is_sample ?? false,
    };
    onConfirm(confirmed);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader className="border-b border-border/60 pb-4">
          <CardTitle className={`text-lg md:text-xl flex items-center gap-2 ${getFontClass()}`}>
            <User className="h-5 w-5 text-primary" aria-hidden="true" />
            <span>
              {pick(
                'Review Extracted Profile Attributes',
                'గుర్తించిన వివరాలను పరిశీలించండి',
                'निकाले गए विवरणों की समीक्षा करें'
              )}
            </span>
          </CardTitle>
          <p className="text-xs md:text-sm text-muted">
            {pick(
              'All details are stored in coarse, non-identifying categories. No exact numbers or personal identity data are required.',
              'అన్ని వివరాలు సాధారణ కేటగిరీలుగా మాత్రమే ఉంటాయి. ఎటువంటి వ్యక్తిగత గుర్తింపు డేటా అవసరం లేదు.',
              'सभी विवरण सामान्य श्रेणियों में सहेजे जाते हैं। किसी व्यक्तिगत पहचान डेटा की आवश्यकता नहीं है।'
            )}
          </p>
        </CardHeader>

        <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Age Band */}
          <div className="space-y-2">
            <Label htmlFor="age-band" className="flex items-center gap-1.5 font-semibold text-sm">
              <User className="h-4 w-4 text-muted" aria-hidden="true" />
              <span>{pick('Age Band', 'వయోపరిమితి', 'आयु वर्ग')}</span>
            </Label>
            <select
              id="age-band"
              value={ageBand}
              onChange={(e) => setAgeBand(e.target.value as AgeBand)}
              className="w-full h-11 rounded-md border border-border bg-white px-3 text-sm focus:ring-2 focus:ring-focus focus:outline-none"
            >
              <option value="unknown">{pick('Select Age Band…', 'వయస్సును ఎంచుకోండి…', 'आयु वर्ग चुनें…')}</option>
              {AGE_BANDS.map((b) => (
                <option key={b.value} value={b.value}>
                  {pick(b.label_en, b.label_te, b.label_hi)}
                </option>
              ))}
            </select>
          </div>

          {/* District */}
          <div className="space-y-2">
            <Label htmlFor="district-select" className="flex items-center gap-1.5 font-semibold text-sm">
              <MapPin className="h-4 w-4 text-muted" aria-hidden="true" />
              <span>{pick('Andhra Pradesh District', 'ఆంధ్రప్రదేశ్ జిల్లా', 'आंध्र प्रदेश का जिला')}</span>
            </Label>
            <select
              id="district-select"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full h-11 rounded-md border border-border bg-white px-3 text-sm focus:ring-2 focus:ring-focus focus:outline-none"
            >
              {AP_DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Income Band */}
          <div className="space-y-2">
            <Label htmlFor="income-band" className="flex items-center gap-1.5 font-semibold text-sm">
              <IndianRupee className="h-4 w-4 text-muted" aria-hidden="true" />
              <span>{pick('Annual Family Income', 'కుటుంబ వార్షిక ఆదాయం', 'वार्षिक पारिवारिक आय')}</span>
            </Label>
            <select
              id="income-band"
              value={incomeBand}
              onChange={(e) => setIncomeBand(e.target.value as IncomeBand)}
              className="w-full h-11 rounded-md border border-border bg-white px-3 text-sm focus:ring-2 focus:ring-focus focus:outline-none"
            >
              <option value="unknown">{pick('Select Income Bracket…', 'ఆదాయ పరిమితిని ఎంచుకోండి…', 'आय सीमा चुनें…')}</option>
              {INCOME_BANDS.map((b) => (
                <option key={b.value} value={b.value}>
                  {pick(b.label_en, b.label_te, b.label_hi)}
                </option>
              ))}
            </select>
          </div>

          {/* Occupation */}
          <div className="space-y-2">
            <Label htmlFor="occupation-select" className="flex items-center gap-1.5 font-semibold text-sm">
              <Briefcase className="h-4 w-4 text-muted" aria-hidden="true" />
              <span>{pick('Primary Occupation', 'ప్రధాన వృత్తి', 'मुख्य व्यवसाय')}</span>
            </Label>
            <select
              id="occupation-select"
              value={occupation}
              onChange={(e) => setOccupation(e.target.value as OccupationCategory)}
              className="w-full h-11 rounded-md border border-border bg-white px-3 text-sm focus:ring-2 focus:ring-focus focus:outline-none"
            >
              <option value="unknown">{pick('Select Occupation…', 'వృత్తిని ఎంచుకోండి…', 'व्यवसाय चुनें…')}</option>
              {OCCUPATION_CATEGORIES.map((b) => (
                <option key={b.value} value={b.value}>
                  {pick(b.label_en, b.label_te, b.label_hi)}
                </option>
              ))}
            </select>
          </div>

          {/* Land Holding Band */}
          <div className="space-y-2">
            <Label htmlFor="land-band" className="flex items-center gap-1.5 font-semibold text-sm">
              <Landmark className="h-4 w-4 text-muted" aria-hidden="true" />
              <span>{pick('Agricultural Land Holding', 'వ్యవసాయ భూమి వివరాలు', 'कृषि भूमि की स्थिति')}</span>
            </Label>
            <select
              id="land-band"
              value={landHolding}
              onChange={(e) => setLandHolding(e.target.value as LandHoldingBand)}
              className="w-full h-11 rounded-md border border-border bg-white px-3 text-sm focus:ring-2 focus:ring-focus focus:outline-none"
            >
              <option value="unknown">{pick('Select Land Category…', 'భూమి వివరాలను ఎంచుకోండి…', 'भूमि श्रेणी चुनें…')}</option>
              {LAND_HOLDING_BANDS.map((b) => (
                <option key={b.value} value={b.value}>
                  {pick(b.label_en, b.label_te, b.label_hi)}
                </option>
              ))}
            </select>
          </div>

          {/* Social Category */}
          <div className="space-y-2">
            <Label htmlFor="social-category" className="flex items-center gap-1.5 font-semibold text-sm">
              <Users className="h-4 w-4 text-muted" aria-hidden="true" />
              <span>{pick('Social Category', 'సామాజిక వర్గం', 'सामाजिक श्रेणी')}</span>
            </Label>
            <select
              id="social-category"
              value={socialCategory}
              onChange={(e) => setSocialCategory(e.target.value as SocialCategory)}
              className="w-full h-11 rounded-md border border-border bg-white px-3 text-sm focus:ring-2 focus:ring-focus focus:outline-none"
            >
              <option value="unknown">{pick('Select Category (Optional)…', 'వర్గాన్ని ఎంచుకోండి…', 'श्रेणी चुनें…')}</option>
              {SOCIAL_CATEGORIES.map((b) => (
                <option key={b.value} value={b.value}>
                  {pick(b.label_en, b.label_te, b.label_hi)}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 pt-4">
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={onBack}
          disabled={isLoading}
          className="w-full sm:w-auto"
        >
          {pick('Back to Description', 'వివరణకు వెనుకకు', 'विवरण पर वापस')}
        </Button>

        <Button
          type="submit"
          variant="default"
          size="lg"
          disabled={isLoading}
          className={`w-full sm:w-auto inline-flex items-center gap-2 ${getFontClass()}`}
        >
          <CheckCircle2 className="h-5 w-5 text-emerald-300" aria-hidden="true" />
          <span>
            {pick(
              'Confirm Details & Check Eligibility',
              'వివరాలను నిర్ధారించి అర్హతను పరిశీలించండి',
              'विवरण की पुष्टि करें और पात्रता जांचें'
            )}
          </span>
        </Button>
      </div>
    </form>
  );
};
