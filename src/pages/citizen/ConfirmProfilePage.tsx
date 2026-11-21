import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '@/store/useLanguageStore';
import { useProfileStore } from '@/store/useProfileStore';
import { useAssessmentStore } from '@/store/useAssessmentStore';
import { useSchemeStore } from '@/store/useSchemeStore';
import { ProfileConfirmForm } from '@/components/citizen/ProfileConfirmForm';
import { evaluateDeterministicEligibility } from '@/services/deterministicEngine';
import { CitizenProfile } from '@/types/profile';
import { ROUTES } from '@/config/routes';

export const ConfirmProfilePage: React.FC = () => {
  const { pick, getFontClass } = useLanguage();
  const {
    proposedProfile,
    confirmedProfile,
    extractedFields,
    clarifyingQuestions,
    setConfirmedProfile,
    isSample,
    resetCounter,
  } = useProfileStore();
  const { setAssessment, setLoading } = useAssessmentStore();
  const { schemes } = useSchemeStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const focusField = searchParams.get('focus');

  // Preserve manual edits when returning from /results ("Adjust Profile" or "+ Add Missing Detail")
  const activeInitialProfile = confirmedProfile ?? proposedProfile;

  const handleConfirm = (confirmed: CitizenProfile) => {
    setIsSubmitting(true);
    setLoading(true);

    const profileWithSampleFlag: CitizenProfile = {
      ...confirmed,
      is_sample: isSample,
    };
    setConfirmedProfile(profileWithSampleFlag);

    // Evaluate deterministically against the live scheme registry store!
    const assessmentResults = evaluateDeterministicEligibility(profileWithSampleFlag, schemes);
    setAssessment(assessmentResults);
    setIsSubmitting(false);
    setLoading(false);
    navigate(ROUTES.RESULTS);
  };

  const handleBack = () => {
    navigate(ROUTES.DESCRIBE);
  };

  return (
    <div className="space-y-6">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <h1 className={`text-2xl md:text-3xl font-extrabold text-primary ${getFontClass()}`}>
          {pick(
            'Review & Confirm Your Household Details',
            'మీ కుటుంబ వివరాలను సరిచూసి నిర్ధారించండి',
            'अपने पारिवारिक विवरण की समीक्षा और पुष्टि करें'
          )}
        </h1>
        <p className={`text-sm md:text-base text-muted leading-relaxed ${getFontClass()}`}>
          {pick(
            'Check what we understood from your story, answer any quick missing cards if you know them (or skip), and view your scheme matches.',
            'మీ కథనం నుండి గుర్తించిన వివరాలను చూడండి; మిగిలిన చిన్న ప్రశ్నలకు తెలిసినంతవరకు సమాధానం ఇవ్వండి (లేదా దాటవేయండి).',
            'आपकी कहानी से समझे गए विवरण देखें, छूटे हुए आसान प्रश्नों का उत्तर दें (या छोड़ें) और पात्र योजनाएं देखें।'
          )}
        </p>
      </div>

      <ProfileConfirmForm
        key={`confirm-form-${resetCounter}`}
        initialProfile={activeInitialProfile}
        extractedFields={extractedFields}
        clarifyingQuestions={clarifyingQuestions}
        focusField={focusField}
        onConfirm={handleConfirm}
        onBack={handleBack}
        isLoading={isSubmitting}
      />
    </div>
  );
};
