import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/store/useLanguageStore';
import { useProfileStore } from '@/store/useProfileStore';
import { useAssessmentStore } from '@/store/useAssessmentStore';
import { ProfileConfirmForm } from '@/components/citizen/ProfileConfirmForm';
import { evaluateDeterministicEligibility } from '@/services/deterministicEngine';
import { CitizenProfile } from '@/types/profile';
import { ROUTES } from '@/config/routes';

export const ConfirmProfilePage: React.FC = () => {
  const { pick, getFontClass } = useLanguage();
  const { proposedProfile, setConfirmedProfile, isSample } = useProfileStore();
  const { setAssessment, setLoading } = useAssessmentStore();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = (confirmed: CitizenProfile) => {
    setIsSubmitting(true);
    setLoading(true);

    // Keep is_sample flag preserved
    confirmed.is_sample = isSample;
    setConfirmedProfile(confirmed);

    setTimeout(() => {
      // Run deterministic eligibility evaluation
      const assessmentResults = evaluateDeterministicEligibility(confirmed);
      setAssessment(assessmentResults);
      setIsSubmitting(false);
      setLoading(false);
      navigate(ROUTES.RESULTS);
    }, 500);
  };

  const handleBack = () => {
    navigate(ROUTES.DESCRIBE);
  };

  return (
    <div className="space-y-6">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <h1 className={`text-2xl md:text-3xl font-extrabold text-primary ${getFontClass()}`}>
          {pick(
            'Confirm Your Profile Details',
            'మీ వివరాలను నిర్ధారించండి',
            'अपने प्रोफ़ाइल विवरण की पुष्टि करें'
          )}
        </h1>
        <p className="text-sm md:text-base text-muted leading-relaxed">
          {pick(
            'Review the coarse attributes extracted from your description. You can adjust any detail before checking eligibility.',
            'మీ వివరణ ఆధారంగా సేకరించిన వివరాలను సరిచూసుకోండి. మార్పులు అవసరమైతే సవరించవచ్చు.',
            'अपने विवरण से निकाली गई श्रेणियों की समीक्षा करें। आप पात्रता जांचने से पहले कोई भी विवरण बदल सकते हैं।'
          )}
        </p>
      </div>

      <ProfileConfirmForm
        initialProfile={proposedProfile}
        onConfirm={handleConfirm}
        onBack={handleBack}
        isLoading={isSubmitting}
      />
    </div>
  );
};
