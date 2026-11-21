// "Claim Doctor" AP Welfare Rejection & DBT Failure Diagnostics Knowledge Base
// Covers the 6 primary reasons citizens face DBT payment rejection or Six-Step Verification holds
// in Andhra Pradesh, with exact remediation steps & zero-PII 1902 Grievance Slip templates.

export interface RejectionReasonDiagnostic {
  code: string;
  title_en: string;
  title_te: string;
  title_hi: string;
  symptom_en: string;
  symptom_te: string;
  symptom_hi: string;
  fixSteps_en: string[];
  fixSteps_te: string[];
  fixSteps_hi: string[];
  whereToGo_en: string;
  whereToGo_te: string;
  whereToGo_hi: string;
  grievanceCategoryCode: string;
}

export const AP_REJECTION_DIAGNOSTICS: RejectionReasonDiagnostic[] = [
  {
    code: 'npci_dbt_inactive',
    title_en: 'Bank Account Not Seeded on NPCI DBT Mapper',
    title_te: 'ఆధార్–NPCI DBT బ్యాంకు లింక్ యాక్టివ్‌గా లేకపోవడం',
    title_hi: 'बैंक खाता NPCI DBT मैपर पर सक्रिय नहीं होना',
    symptom_en: 'Scheme shows sanctioned/eligible, but DBT cash did not credit into bank account.',
    symptom_te: 'పథకం మంజూరైనట్లు కనిపిస్తున్నా బ్యాంకు ఖాతాలో డబ్బు జమ కాలేదు.',
    symptom_hi: 'योजना स्वीकृत दिख रही है, लेकिन बैंक खाते में राशि जमा नहीं हुई।',
    fixSteps_en: [
      'Visit your home bank branch and submit the "NPCI Aadhaar Seeding & DBT Mandate Form" (not just normal KYC).',
      'Alternatively, open an India Post Payments Bank (IPPB) DBT-seeded account in 10 minutes at your nearest Post Office.',
      'Inform your Grama/Ward Sachivalayam Welfare Assistant once NPCI status turns ACTIVE for next-cycle re-trigger.',
    ],
    fixSteps_te: [
      'మీ బ్యాంకు బ్రాంచ్‌లో "NPCI ఆధార్ సీడింగ్ & DBT మ్యాండేట్ ఫారం" సమర్పించండి (సాధారణ KYC సరిపోదు).',
      'లేదా సమీప పోస్టాఫీసులో 10 నిమిషాల్లో IPPB DBT ఖాతా తెరవండి.',
      'NPCI యాక్టివ్ అయిన తర్వాత సచివాలయ వెల్ఫేర్ అసిస్టెంట్‌కు తెలియజేయండి.',
    ],
    fixSteps_hi: [
      'अपनी बैंक शाखा में "NPCI आधार सीडिंग एवं DBT मैंडेट फॉर्म" जमा करें।',
      'या नजदीकी डाकघर में 10 मिनट में IPPB DBT खाता खुलवाएं।',
      'सक्रिय होने पर सचिवालय कल्याण सहायक को सूचित करें।',
    ],
    whereToGo_en: 'Bank Branch / Nearest Post Office (IPPB) + Sachivalayam',
    whereToGo_te: 'బ్యాంకు బ్రాంచ్ / సమీప పోస్టాఫీసు (IPPB) + సచివాలయం',
    whereToGo_hi: 'बैंक शाखा / नजदीकी डाकघर (IPPB) + सचिवालय',
    grievanceCategoryCode: 'GSWS-DBT-NPCI-RETRIGGER',
  },
  {
    code: 'six_step_electricity_vehicle',
    title_en: 'Six-Step Verification Flag (Electricity >300 Units or Sold 4-Wheeler)',
    title_te: 'ఆరు దశల ధృవీకరణ అభ్యంతరం (కరెంట్ బిల్లు >300 యూనిట్లు / 4-చక్రాల వాహనం)',
    title_hi: 'छह-चरणीय सत्यापन आपत्ति (बिजली >300 यूनिट या चार-पहिया वाहन त्रुटि)',
    symptom_en: 'Marked ineligible due to shared joint-family electricity meter or old/sold vehicle record.',
    symptom_te: 'ఉమ్మడి కరెంట్ మీటర్ లేదా అమ్మేసిన వాహనం వల్ల అనర్హతగా చూపుతోంది.',
    symptom_hi: 'संयुक्त बिजली मीटर या पुराने बेचे गए वाहन के कारण अपात्र दिखाया गया।',
    fixSteps_en: [
      'Obtain a 12-month consumption statement from EPDCL/SPDCL/CPDCL showing your individual portion or meter split.',
      'If flagged for a sold/taxi 4-wheeler, get an RTA "B-Register / Non-Ownership / Taxi Permit Extract".',
      'Submit a Six-Step Re-Verification Grievance at Grama/Ward Sachivalayam for field panchanama by the Welfare Assistant.',
    ],
    fixSteps_te: [
      'విద్యుత్ కార్యాలయం నుండి 12 నెలల వినియోగ స్టేట్‌మెంట్ / మీటర్ విభజన ధృవీకరణ తీసుకోండి.',
      'అమ్మేసిన లేదా ట్యాక్సీ వాహనమైతే RTA కార్యాలయం నుండి B-రిజిస్టర్ కాపీ తీసుకోండి.',
      'సచివాలయంలో "సిక్స్-స్టెప్ పునఃపరిశీలన ఫిర్యాదు" సమర్పించి క్షేత్ర పరిశీలన కోరండి.',
    ],
    fixSteps_hi: [
      'बिजली विभाग से 12 महीने का उपभोग विवरण प्राप्त करें।',
      'यदि वाहन बेच दिया है या टैक्सी है, तो RTA से B-रजिस्टर प्रमाण लें।',
      'सचिवालय में "छह-चरणीय पुनर्सत्यापन शिकायत" दर्ज करें।',
    ],
    whereToGo_en: 'Grama/Ward Sachivalayam + DISCOM / RTA Office',
    whereToGo_te: 'గ్రామ/వార్డు సచివాలయం + విద్యుత్ / RTA కార్యాలయం',
    whereToGo_hi: 'ग्राम/वार्ड सचिवालय + बिजली / RTA कार्यालय',
    grievanceCategoryCode: 'GSWS-SIXSTEP-APPEAL',
  },
  {
    code: 'webland_epanta_mismatch',
    title_en: 'Webland 1B / e-Panta Crop Booking Mismatch (Farm Schemes)',
    title_te: 'వెబ్‌ల్యాండ్ 1B / ఇ-పంట నమోదు అసంపూర్తి (రైతు పథకాలు)',
    title_hi: 'वेबलैंड 1B / ई-पंटा फसल पंजीकरण त्रुटि (कृषि योजनाएं)',
    symptom_en: 'Annadata Sukhibhava or PM-KISAN installment held due to unseeded land survey or missing e-Panta.',
    symptom_te: 'భూమి రికార్డు సీడింగ్ లేదా ఇ-పంట నమోదు కాకపోవడం వల్ల అన్నదాత సుఖీభవ / PM-KISAN నిలిచిపోయింది.',
    symptom_hi: 'भूमि रिकॉर्ड या ई-पंटा लंबित होने से किसान किस्त रुकी हुई है।',
    fixSteps_en: [
      'Meet the Village Agriculture Assistant (VAA) at your Rythu Seva Kendra (RSK) with Pattadar Passbook / CCRC card.',
      'Verify Webland 1B survey number linking and complete biometric e-Panta crop booking.',
      'Check PM-KISAN Land Seeding = YES status on pmkisan.gov.in via RSK desk.',
    ],
    fixSteps_te: [
      'పట్టాదారు పాస్‌బుక్ / CCRC కార్డుతో రైతు సేవా కేంద్రం (RSK) లో వ్యవసాయ సహాయకుడిని (VAA) కలవండి.',
      'వెబ్‌ల్యాండ్ 1B సీడింగ్ మరియు ఇ-పంట బయోమెట్రిక్ నమోదు పూర్తి చేయండి.',
      'PM-KISAN పోర్టల్‌లో Land Seeding = YES ఉందో లేదో తనిఖీ చేయండి.',
    ],
    fixSteps_hi: [
      'पट्टाधारक पासबुक / CCRC कार्ड के साथ रैतु सेवा केंद्र (RSK) में कृषि सहायक से मिलें।',
      'वेबलैंड 1B लिंकिंग और ई-पंटा बायोमेट्रिक पंजीकरण पूरा करें।',
      'PM-KISAN पोर्टल पर Land Seeding = YES की पुष्टि करें।',
    ],
    whereToGo_en: 'Mandal / Village Rythu Seva Kendra (Helpline 155251)',
    whereToGo_te: 'రైతు సేవా కేంద్రం (హెల్ప్‌లైన్ 155251)',
    whereToGo_hi: 'रैतु सेवा केंद्र (हेल्पलाइन 155251)',
    grievanceCategoryCode: 'RSK-WEBLAND-EPANTA',
  },
  {
    code: 'udise_attendance_mismatch',
    title_en: 'School UDISE+ Mother Mapping or Attendance Hold (Education)',
    title_te: 'పాఠశాల UDISE+ తల్లి వివరాలు లేదా 75% హాజరు సమస్య (విద్యా పథకాలు)',
    title_hi: 'स्कूल UDISE+ माता विवरण या उपस्थिति त्रुटि (शिक्षा योजनाएं)',
    symptom_en: 'Talliki Vandanam / Scholarship held in school/college verification list.',
    symptom_te: 'తల్లికి వందనం / స్కాలర్‌షిప్ పాఠశాల ధృవీకరణ జాబితాలో పెండింగ్‌లో ఉంది.',
    symptom_hi: 'तल्लिकि वंदनम / छात्रवृत्ति स्कूल सत्यापन सूची में रुकी है।',
    fixSteps_en: [
      'Check with the School Headmaster / College Principal that the student’s UDISE+ / Jnanabhumi record maps accurately to the mother/guardian household.',
      'If attendance dipped below 75% due to medical illness, submit the Govt Hospital Medical Certificate to the Headmaster.',
      'Get the updated entry endorsed by the Sachivalayam Welfare & Education Assistant.',
    ],
    fixSteps_te: [
      'పాఠశాల ప్రధానోపాధ్యాయుడిని కలిసి UDISE+ / జ్ఞానభూమిలో తల్లి & కుటుంబ మ్యాపింగ్ సరిచేయించండి.',
      'అనారోగ్యం వల్ల 75% హాజరు తగ్గితే ప్రభుత్వ ఆసుపత్రి మెడికల్ సర్టిఫికెట్ ఇవ్వండి.',
      'సచివాలయ వెల్ఫేర్ & ఎడ్యుకేషన్ అసిస్టెంట్ ధృవీకరణ పొందండి.',
    ],
    fixSteps_hi: [
      'प्रधानाध्यापक से मिलकर UDISE+ / ज्ञानभूमि में माता/अभिभावक मैपिंग ठीक कराएं।',
      'बीमारी के कारण उपस्थिति कम होने पर सरकारी अस्पताल का प्रमाण पत्र दें।',
      'सचिवालय शिक्षा सहायक से पुष्टि कराएं।',
    ],
    whereToGo_en: 'School Headmaster + Sachivalayam Education Assistant',
    whereToGo_te: 'పాఠశాల హెడ్‌మాస్టర్ + సచివాలయ ఎడ్యుకేషన్ అసిస్టెంట్',
    whereToGo_hi: 'स्कूल प्रधानाध्यापक + सचिवालय शिक्षा सहायक',
    grievanceCategoryCode: 'EDU-UDISE-JNANABHUMI',
  },
  {
    code: 'rice_card_household_mapping',
    title_en: 'Unsplit Joint-Family Rice Card Exceeding Threshold',
    title_te: 'ఉమ్మడి కుటుంబ రైస్ కార్డు విభజన పెండింగ్',
    title_hi: 'संयुक्त परिवार राइस कार्ड विभाजन लंबित',
    symptom_en: 'Nuclear family rejected because another relative on the same old Rice Card pays income tax or owns land.',
    symptom_te: 'ఉమ్మడి రైస్ కార్డులో ఉన్న ఇతర బంధువుల ఆదాయం/భూమి వల్ల మీ దరఖాస్తు తిరస్కరించబడింది.',
    symptom_hi: 'पुराने संयुक्त राइस कार्ड में अन्य रिश्तेदार की आय/भूमि जुड़ने से अस्वीकृति।',
    fixSteps_en: [
      'Apply for "Rice Card Family Split / Member Deletion-Addition" at MeeSeva or Grama/Ward Sachivalayam with marriage/residence proof.',
      'Wait for VRO / Tahsildar digital approval of the separate household mapping.',
      'File a fresh scheme re-verification request citing the updated household card.',
    ],
    fixSteps_te: [
      'నివాస/వివాహ ఆధారాలతో సచివాలయం లేదా మీసేవలో "రైస్ కార్డు కుటుంబ విభజన" కోసం దరఖాస్తు చేయండి.',
      'VRO / తహసీల్దార్ ఆమోదం తర్వాత కొత్త కుటుంబ కార్డుతో పునఃపరిశీలన కోరండి.',
      '1902 కి కాల్ చేసి ఫిర్యాదు స్థితిని ట్రాక్ చేయండి.',
    ],
    fixSteps_hi: [
      'निवास/विवाह प्रमाण के साथ मीसेवा या सचिवालय में "राइस कार्ड परिवार विभाजन" का आवेदन करें।',
      'तहसीलदार की मंजूरी के बाद योजना पुनर्सत्यापन दर्ज करें।',
      '1902 पर शिकायत स्थिति ट्रैक करें।',
    ],
    whereToGo_en: 'Grama/Ward Sachivalayam / MeeSeva (Helpline 1100)',
    whereToGo_te: 'గ్రామ/వార్డు సచివాలయం / మీసేవ (హెల్ప్‌లైన్ 1100)',
    whereToGo_hi: 'ग्राम/वार्ड सचिवालय / मीसेवा (हेल्पलाइन 1100)',
    grievanceCategoryCode: 'EPDS-HH-SPLIT-APPEAL',
  },
  {
    code: 'biometric_ekyc_pending',
    title_en: 'Biometric / Iris / Facial e-KYC Incomplete',
    title_te: 'బయోమెట్రిక్ / ఐరిస్ / ముఖ గుర్తింపు e-KYC పెండింగ్',
    title_hi: 'बायोमेट्रिक / आइरिस / फेस e-KYC अपूर्ण',
    symptom_en: 'Fingerprint worn out (elderly/farm workers) or beneficiary was away during e-KYC drive.',
    symptom_te: 'వేలిముద్రలు పడకపోవడం (వృద్ధులు/కూలీలు) లేదా e-KYC సమయంలో అందుబాటులో లేకపోవడం.',
    symptom_hi: 'बुजुर्गों/मजदूरों के फिंगरप्रिंट न आने या e-KYC छूट जाने से रोक।',
    fixSteps_en: [
      'Request Iris Scanner or Aadhaar FaceRD authentication at the Sachivalayam Digital Assistant counter (mandatory alternative when fingerprints fail).',
      'For bedridden seniors/disabled citizens, request a doorstep Welfare Assistant / Volunteer home visit via 1902.',
    ],
    fixSteps_te: [
      'వేలిముద్రలు పడకపోతే సచివాలయంలో ఐరిస్ (కంటి పాప) లేదా ఫేస్ ఆథెంటికేషన్ ద్వారా e-KYC పూర్తి చేయండి.',
      'నడవలేని వృద్ధులు/దివ్యాంగుల కోసం 1902 కి కాల్ చేసి ఇంటి వద్దే e-KYC కోరండి.',
    ],
    fixSteps_hi: [
      'फिंगरप्रिंट न आने पर सचिवालय में आइरिस स्कैनर या फेस ऑथेंटिकेशन का उपयोग करें।',
      'अशक्त बुजुर्गों के लिए 1902 पर कॉल कर घर पर सत्यापन का अनुरोध करें।',
    ],
    whereToGo_en: 'Sachivalayam Digital Assistant Counter (or 1902 Home Visit)',
    whereToGo_te: 'సచివాలయ డిజిటల్ అసిస్టెంట్ కౌంటర్ (లేదా 1902 హోమ్ విజిట్)',
    whereToGo_hi: 'सचिवालय डिजिटल सहायक काउंटर (या 1902 होम विज़िट)',
    grievanceCategoryCode: 'GSWS-EKYC-ALT-AUTH',
  },
];
