-- Document checklists, application steps and follow-up guidance for the demo catalog.
-- IDs match the browser fixtures so saved document checklists keep working.

BEGIN;

INSERT INTO public.scheme_documents (
    id, scheme_id, canonical_key, document_name_en, document_name_te, document_name_hi,
    requirement, notes_en, notes_te, notes_hi, applies_when, sort_order
) VALUES
(
    'doc-001', 'ap-sch-001',
    'school_bonafide',
    'School Study / Bonafide Certificate (UDISE+ Child ID)',
    'పాఠశాల బోనఫైడ్ సర్టిఫికెట్ (UDISE+ విద్యార్థి ఐడి)',
    'स्कूल अध्ययन / बोनाफाइड प्रमाण पत्र (UDISE+ छात्र आईडी)',
    'mandatory',
    'Issued free by the Headmaster/Principal confirming active enrollment and 75% attendance.',
    'పాఠశాల ప్రధానోపాధ్యాయులు ఉచితంగా జారీ చేసే నమోదు మరియు 75% హాజరు ధ్రువీకరణ పత్రం.',
    'प्रधानाध्यापक द्वारा निःशुल्क जारी नामांकन एवं 75% उपस्थिति प्रमाण पत्र।',
    NULL,
    1
),
(
    'doc-002', 'ap-sch-001',
    'white_rice_card',
    'White Rice Card / Income Certificate from Sachivalayam',
    'తెల్ల రైస్ కార్డు / సచివాలయ ఆదాయ ధ్రువీకరణ పత్రం',
    'सफेद राइस कार्ड / सचिवालय आय प्रमाण पत्र',
    'mandatory',
    'Photocopy of active AP Rice Card or Digital Income Certificate.',
    'ప్రస్తుతం అమలులో ఉన్న తెల్ల రైస్ కార్డు లేదా ఆదాయ సర్టిఫికెట్ జిరాక్స్ కాపీ.',
    'सक्रिय एपी राइस कार्ड या डिजिटल आय प्रमाण पत्र की छायाप्रति।',
    NULL,
    2
),
(
    'doc-003', 'ap-sch-001',
    'bank_passbook_npci',
    'Mother’s / Guardian’s NPCI-Linked Bank Passbook Front Page',
    'తల్లి / సంరక్షకుల బ్యాంక్ పాస్‌బుక్ మొదటి పేజీ (NPCI లింక్)',
    'माता / अभिभावक की NPCI-लिंक बैंक पासबुक की प्रति',
    'mandatory',
    'Ensure NPCI DBT seeding is active at your bank or post office.',
    'మీ బ్యాంక్ లేదా పోస్టాఫీస్ ఖాతాకు NPCI DBT లింక్ అయి ఉండాలి.',
    'सुनिश्चित करें कि बैंक या डाकघर खाते में NPCI DBT सीडिंग सक्रिय है।',
    NULL,
    3
),
(
    'doc-003b', 'ap-sch-001',
    'caste_certificate',
    'Integrated Caste Certificate (SC / ST / BC)',
    'కులం ధ్రువీకరణ పత్రం (SC / ST / BC)',
    'जाति प्रमाण पत्र (SC / ST / BC)',
    'optional',
    'Required for social-welfare sub-plan tagging if belonging to SC, ST, or BC communities.',
    'SC, ST లేదా BC వర్గాలకు చెందిన వారైతే సబ్-ప్లాన్ నమోదు కోసం అవసరం.',
    'SC, ST या BC वर्ग के परिवारों के लिए आवश्यक।',
    '{"field":"social_category","values":["SC","ST","BC"],"mode":"promote_mandatory","badge_en":"Required for your selected category","badge_te":"మీ సామాజిక వర్గానికి తప్పనిసరి","badge_hi":"आपकी चुनी गई श्रेणी के लिए आवश्यक"}'::jsonb,
    4
),
(
    'doc-013', 'ap-sch-005',
    'ssc_marks_memo',
    'Class 10 (SSC) Hall Ticket / Marks Memo & College Admission Slip',
    '10వ తరగతి (SSC) మార్కుల మెమో & కాలేజీ అడ్మిషన్ రసీదు',
    'कक्षा 10 (SSC) अंक तालिका और कॉलेज प्रवेश पर्ची',
    'mandatory',
    'Used to link student academic history on the Jnanabhumi portal.',
    'జ్ఞానభూమి పోర్టల్‌లో విద్యార్థి వివరాలను అనుసంధానించడానికి అవసరం.',
    'ज्ञानभूमि पोर्टल पर शैक्षणिक विवरण जोड़ने के लिए आवश्यक।',
    NULL,
    1
),
(
    'doc-014', 'ap-sch-005',
    'white_rice_card',
    'White Rice Card or Meeseva/Sachivalayam Income Certificate',
    'తెల్ల రైస్ కార్డు లేదా ఆదాయ ధ్రువీకరణ పత్రం',
    'सफेद राइस कार्ड या आय प्रमाण पत्र',
    'mandatory',
    'Valid income proof issued within the last 4 years or active Rice Card.',
    'తెల్ల రైస్ కార్డు లేదా ఆదాయ ధ్రువీకరణ పత్రం నకలు.',
    'सक्रिय राइस कार्ड या वैध आय प्रमाण पत्र।',
    NULL,
    2
),
(
    'doc-015', 'ap-sch-005',
    'caste_certificate',
    'Integrated Caste / EWS Certificate (Sachivalayam)',
    'ఇంటిగ్రేటెడ్ కులం / EWS ధ్రువీకరణ పత్రం',
    'एकीकृत जाति / EWS प्रमाण पत्र',
    'optional',
    'Mandatory for SC, ST, BC, and Minority scholarship quotas; EWS certificate for OC.',
    'SC, ST, BC, మైనారిటీ కోటాకు కుల ధ్రువీకరణ పత్రం తప్పనిసరి; OC వారికి EWS పత్రం.',
    'SC, ST, BC व अल्पसंख्यक कोटे हेतु जाति प्रमाण पत्र अनिवार्य; सामान्य वर्ग हेतु EWS।',
    '{"field":"social_category","values":["SC","ST","BC","minority"],"mode":"promote_mandatory","badge_en":"Mandatory for your social category","badge_te":"మీ సామాజిక వర్గానికి తప్పనిసరి","badge_hi":"आपकी सामाजिक श्रेणी के लिए अनिवार्य"}'::jsonb,
    3
),
(
    'doc-016', 'ap-sch-005',
    'bank_passbook_npci',
    'Student / Mother NPCI-Seeded Bank Account Passbook',
    'విద్యార్థి / తల్లి NPCI అనుసంధానిత బ్యాంక్ పాస్‌బుక్',
    'छात्र / माता की NPCI-लिंक बैंक पासबुक',
    'mandatory',
    'Maintenance allowance (MTF) is credited directly to this account.',
    'వసతి ఖర్చుల మొత్తం (MTF) నేరుగా ఈ ఖాతాలో జమ అవుతుంది.',
    'भरण-पोषण भत्ता (MTF) सीधे इसी खाते में जमा होता है।',
    NULL,
    4
),
(
    'doc-004', 'ap-sch-002',
    'white_rice_card',
    'White Rice Card / BPL Household Proof',
    'తెల్ల రైస్ కార్డు / బిపిఎల్ కుటుంబ ధ్రువీకరణ',
    'सफेद राइस कार्ड / बीपीएल परिवार प्रमाण',
    'mandatory',
    'Photocopy verified against GSWS household database.',
    'సచివాలయ కుటుంబ డేటాబేస్‌తో సరిచూసేందుకు జిరాక్స్ కాపీ.',
    'सचिवालय परिवार डेटाबेस से मिलान हेतु छायाप्रति।',
    NULL,
    1
),
(
    'doc-005', 'ap-sch-002',
    'age_residence_proof',
    'Proof of Age & Local Residence (Voter Roll / Birth / Medical Age Certificate)',
    'వయస్సు & స్థానిక నివాస ధ్రువీకరణ పత్రం',
    'आयु एवं स्थानीय निवास प्रमाण पत्र',
    'mandatory',
    'Government medical officer age certificate is accepted if birth record is unavailable.',
    'పుట్టిన తేదీ పత్రం లేకపోతే ప్రభుత్వ వైద్యాధికారి వయస్సు ధ్రువీకరణ పత్రం చెల్లుతుంది.',
    'जन्म प्रमाण न होने पर सरकारी चिकित्सा अधिकारी का आयु प्रमाण पत्र मान्य है।',
    NULL,
    2
),
(
    'doc-006', 'ap-sch-002',
    'spouse_death_cert',
    'Spouse Death Certificate (Issued by Gram Panchayat / Municipality)',
    'భర్త మరణ ధ్రువీకరణ పత్రం (పంచాయతీ / మున్సిపాలిటీ జారీ చేసినది)',
    'पति का मृत्यु प्रमाण पत्र (ग्राम पंचायत / नगरपालिका द्वारा जारी)',
    'optional',
    'Required when applying under the Widow Pension category.',
    'వితంతు పెన్షన్ విభాగం కింద దరఖాస్తు చేసుకునే వారికి తప్పనిసరి.',
    'विधवा पेंशन श्रेणी के अंतर्गत आवेदन करने पर अनिवार्य।',
    '{"field":"is_widow_or_single_woman","values":["yes"],"mode":"promote_mandatory","badge_en":"Mandatory for Widow Pension (matched your profile)","badge_te":"వితంతు పెన్షన్ కొరకు మీకు తప్పనిసరి","badge_hi":"विधवा पेंशन हेतु आपके लिए अनिवार्य"}'::jsonb,
    3
),
(
    'doc-006b', 'ap-sch-002',
    'sadarem_cert',
    'SADAREM / UDID Benchmark Disability Certificate',
    'సదరం (SADAREM) / UDID దివ్యాంగుల ధ్రువీకరణ పత్రం',
    'सदरम (SADAREM) / UDID दिव्यांगता प्रमाण पत्र',
    'optional',
    'Required only if applying for the ₹6,000/month Disability Pension.',
    'నెలకు ₹6,000 దివ్యాంగుల పెన్షన్ కోరే వారికి మాత్రమే అవసరం.',
    'केवल ₹6,000/माह दिव्यांग पेंशन हेतु आवेदन करने पर आवश्यक।',
    '{"field":"has_disability","values":["yes"],"mode":"promote_mandatory","badge_en":"Mandatory for Disability Pension (matched your profile)","badge_te":"దివ్యాంగుల పెన్షన్ కొరకు మీకు తప్పనిసరి","badge_hi":"दिव्यांग पेंशन हेतु आपके लिए अनिवार्य"}'::jsonb,
    4
),
(
    'doc-007', 'ap-sch-003',
    'land_record_1b',
    '1B Adangal / Pattadar Passbook (Webland Verified)',
    '1B అడంగల్ / పట్టాదారు పాస్‌బుక్ (వెబ్‌ల్యాండ్ నకలు)',
    '1B अदंगल / पट्टादार पासबुक (वेबलैंड सत्यापित)',
    'mandatory',
    'Required if cultivating your own agricultural land.',
    'స్వంత భూమి సాగు చేసే రైతులకు అవసరం.',
    'अपनी भूमि पर खेती करने वाले किसानों के लिए आवश्यक।',
    '{"field":"is_tenant_farmer_ccrc","values":["no","unknown"],"mode":"highlight_relevant","badge_en":"For Landholding Farmers","badge_te":"భూ యజమాని రైతులకు","badge_hi":"भूमिधारक किसानों हेतु"}'::jsonb,
    1
),
(
    'doc-007b', 'ap-sch-003',
    'ccrc_tenant_card',
    'Crop Cultivator Rights Card (CCRC) + e-Panta Slip',
    'పంట సాగుదారు హక్కు పత్రం (CCRC కార్డు) + ఈ-పంట రసీదు',
    'फसल काश्तकार अधिकार कार्ड (CCRC) + ई-पंटा पर्ची',
    'optional',
    'Replaces Pattadar Passbook for landless tenant farmers cultivating leased land.',
    'భూమి లేని కౌలు రైతులకు పట్టాదారు పాస్‌బుక్ బదులుగా CCRC కార్డు తప్పనిసరి.',
    'भूमिहीन बटाईदार किसानों के लिए पट्टादार पासबुक के स्थान पर CCRC कार्ड अनिवार्य।',
    '{"field":"is_tenant_farmer_ccrc","values":["yes"],"mode":"promote_mandatory","badge_en":"Mandatory for Tenant Farmers (matched your profile)","badge_te":"కౌలు రైతుగా మీకు తప్పనిసరి","badge_hi":"बटाईदार किसान हेतु अनिवार्य"}'::jsonb,
    2
),
(
    'doc-008', 'ap-sch-003',
    'bank_passbook_npci',
    'NPCI-Linked Bank Passbook Copy',
    'NPCI లింక్ అయిన బ్యాంక్ పాస్‌బుక్ కాపీ',
    'NPCI-लिंक बैंक पासबुक की प्रति',
    'mandatory',
    'Seasonal input installments are credited via NPCI DBT.',
    'పెట్టుబడి సాయం విడతల వారీగా నేరుగా ఈ ఖాతాలో జమ అవుతుంది.',
    'निवेश सहायता की किस्तें सीधे इसी खाते में जमा होती हैं।',
    NULL,
    3
),
(
    'doc-009', 'cen-sch-001',
    'land_record_1b',
    'Land Ownership Record (1B / RoR / Pattadar Passbook)',
    'భూమి యాజమాన్య పత్రం (1B అడంగల్ / పట్టాదారు పాస్‌బుక్)',
    'भूमि स्वामित्व रिकॉर्ड (1B / खतौनी / पट्टादार पासबुक)',
    'mandatory',
    'Must match state Webland digital RoR mutation.',
    'రాష్ట్ర వెబ్‌ల్యాండ్ రికార్డులో మీ పేరున మ్యుటేషన్ పూర్తయి ఉండాలి.',
    'राज्य वेबलैंड डिजिटल रिकॉर्ड में नाम दर्ज होना चाहिए।',
    NULL,
    1
),
(
    'doc-010', 'cen-sch-001',
    'bank_passbook_npci',
    'NPCI DBT-Enabled Bank or India Post Payments Bank Passbook',
    'NPCI DBT అనుసంధానిత బ్యాంక్ లేదా పోస్టాఫీస్ పాస్‌బుక్',
    'NPCI DBT-सक्षम बैंक या इंडिया पोस्ट पेमेंट्स बैंक पासबुक',
    'mandatory',
    'India Post Payments Bank (IPPB) accounts open at your village post office auto-link to NPCI.',
    'గ్రామ పోస్టాఫీస్‌లో తెరిచే IPPB ఖాతా సులభంగా NPCI కి లింక్ అవుతుంది.',
    'ग्राम डाकघर में खोला गया IPPB खाता शीघ्र NPCI से जुड़ जाता है।',
    NULL,
    2
),
(
    'doc-011', 'ap-sch-004',
    'white_rice_card',
    'White Rice Card / NTR Vaidya Seva Health Card',
    'తెల్ల రైస్ కార్డు / ఎన్టీఆర్ వైద్య సేవ హెల్త్ కార్డు',
    'सफेद राइस कार्ड / एनटीआर वैद्य सेवा स्वास्थ्य कार्ड',
    'mandatory',
    'If you do not yet hold a physical Health Card, your Rice Card is accepted at the Vaidya Mithra desk.',
    'హెల్త్ కార్డు ఇంకా రాకపోయినా మీ తెల్ల రైస్ కార్డుతోనే ఉచిత వైద్యం పొందవచ్చు.',
    'भौतिक हेल्थ कार्ड न होने पर भी सफेद राइस कार्ड वैद्य मित्र डेस्क पर मान्य है।',
    NULL,
    1
),
(
    'doc-012', 'ap-sch-004',
    'medical_reports',
    'Doctor Consultation / Diagnostic Reports',
    'వైద్యుల పరీక్ష నివేదికలు / ప్రిస్క్రిప్షన్',
    'डॉक्टर का परामर्श पर्चा / जांच रिपोर्ट',
    'mandatory',
    'Free diagnostics are also conducted at the empaneled hospital if referred by a PHC.',
    'PHC రిఫరల్ ఉంటే నెట్‌వర్క్ ఆసుపత్రిలోనే ఉచితంగా పరీక్షలు నిర్వహిస్తారు.',
    'PHC रेफरल होने पर सूचीबद्ध अस्पताल में निःशुल्क जांच की जाती है।',
    NULL,
    2
),
(
    'doc-017', 'ap-sch-006',
    'white_rice_card',
    'Active White Rice Card',
    'యాక్టివ్ తెల్ల రైస్ కార్డు',
    'सक्रिय सफेद राइस कार्ड',
    'mandatory',
    'Must be mapped to your domestic LPG Consumer ID.',
    'మీ వంట గ్యాస్ కన్స్యూమర్ నంబర్‌తో అనుసంధానమై ఉండాలి.',
    'आपके घरेलू एलपीजी उपभोक्ता क्रमांक से लिंक होना चाहिए।',
    NULL,
    1
),
(
    'doc-018', 'ap-sch-006',
    'lpg_passbook',
    'Domestic LPG Connection Passbook (HP / Indane / Bharat Gas)',
    'గ్యాస్ కనెక్షన్ పాస్‌బుక్ (HP / Indane / Bharat Gas)',
    'घरेलू गैस कनेक्शन पासबुक (HP / Indane / Bharat Gas)',
    'mandatory',
    'e-KYC must be completed at your LPG distributor.',
    'గ్యాస్ ఏజెన్సీ వద్ద e-KYC పూర్తయి ఉండాలి.',
    'गैस वितरक के पास e-KYC पूर्ण होना चाहिए।',
    NULL,
    2
),
(
    'doc-019', 'ap-sch-006',
    'bank_passbook_npci',
    'NPCI-Linked Bank Passbook',
    'NPCI లింక్ అయిన బ్యాంక్ పాస్‌బుక్',
    'NPCI-लिंक बैंक पासबुक',
    'mandatory',
    'Full refill subsidy is refunded via DBT within 48 hours of delivery.',
    'సిలిండర్ అందిన 48 గంటల్లో పూర్తి సబ్సిడీ ఈ ఖాతాలో జమ అవుతుంది.',
    'डिलीवरी के 48 घंटों में पूर्ण सब्सिडी इसी खाते में वापस आती है।',
    NULL,
    3
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.application_steps (
    scheme_id, step_no, title_en, title_te, title_hi, description_en, description_te, description_hi,
    channel, official_action_url
) VALUES
(
    'ap-sch-001', 1,
    'Verify UDISE+ Child Enrollment at School',
    'పాఠశాలలో UDISE+ నమోదు నిర్ధారించుకోండి',
    'स्कूल में UDISE+ नामांकन की पुष्टि करें',
    'Ask the school Headmaster to verify that your child’s name and mother’s bank-linked status are updated in the school UDISE+ register.',
    'పాఠశాల ప్రధానోపాధ్యాయుల వద్ద UDISE+ రిజిస్టర్‌లో విద్యార్థి పేరు మరియు తల్లి వివరాలు సరిగ్గా నమోదయ్యాయో నిర్ధారించుకోండి.',
    'स्कूल प्रधानाध्यापक से पुष्टि करें कि UDISE+ रजिस्टर में बच्चे और माता का विवरण अद्यतन है।',
    'offline_office',
    NULL
),
(
    'ap-sch-001', 2,
    'Submit Free Application at Grama / Ward Sachivalayam',
    'గ్రామ / వార్డు సచివాలయంలో ఉచితంగా దరఖాస్తు చేయండి',
    'ग्राम / वार्ड सचिवालय में निःशुल्क आवेदन जमा करें',
    'Hand photocopies to the Welfare & Education Assistant at your Sachivalayam and collect the printed GSWS Acknowledgement Receipt.',
    'సచివాలయంలోని విద్యా మరియు సంక్షేమ సహాయకుడికి జిరాక్స్ పత్రాలు అందించి, అధికారిక రసీదు (Acknowledgement) తీసుకోండి.',
    'सचिवालय में कल्याण एवं शिक्षा सहायक को छायाप्रतियां दें और मुद्रित पावती रसीद प्राप्त करें।',
    'csc_sachivalayam',
    'https://gsws-nbm.ap.gov.in/'
),
(
    'ap-sch-001', 3,
    'Check Social Audit List & DBT Transfer',
    'సామాజిక తనిఖీ జాబితా & ఖాతాకు నగదు జమ',
    'सामाजिक अंकेक्षण सूची जांचें व डीबीटी प्राप्त करें',
    'Verify your name on the Sachivalayam display board during Social Audit week; ₹15,000 is credited directly via NPCI DBT.',
    'సచివాలయ బోర్డుపై ప్రదర్శించే అర్హుల జాబితాలో పేరు చూసుకోండి; ₹15,000 నేరుగా తల్లి ఖాతాలో జమ అవుతుంది.',
    'सचिवालय बोर्ड पर लाभार्थी सूची में अपना नाम जांचें; ₹15,000 सीधे माता के खाते में जमा किए जाते हैं।',
    'csc_sachivalayam',
    NULL
),
(
    'ap-sch-005', 1,
    'Submit Jnanabhumi Scholarship Form at College Scholarship Desk',
    'కళాశాలలో జ్ఞానభూమి స్కాలర్‌షిప్ ఫారం సమర్పించండి',
    'कॉलेज छात्रवृत्ति डेस्क पर ज्ञानभूमि फॉर्म जमा करें',
    'At admission, ensure your college principal’s office uploads your Jnanabhumi CET/Non-CET scholarship application free of cost.',
    'కళాశాలలో చేరే సమయంలో ప్రిన్సిపాల్ కార్యాలయం ద్వారా జ్ఞానభూమి పోర్టల్‌లో ఉచితంగా నమోదు చేయించండి.',
    'प्रवेश के समय कॉलेज प्राचार्य कार्यालय के माध्यम से ज्ञानभूमि पोर्टल पर निःशुल्क आवेदन अपलोड कराएं।',
    'online',
    'https://jnanabhumi.ap.gov.in/'
),
(
    'ap-sch-005', 2,
    'Complete Student & Mother Verification at Grama Sachivalayam',
    'గ్రామ సచివాలయంలో ధ్రువీకరణ పూర్తి చేయండి',
    'ग्राम सचिवालय में सत्यापन पूरा करें',
    'Visit your local Grama/Ward Sachivalayam Welfare Assistant once notified via SMS to confirm household details.',
    'సచివాలయ సంక్షేమ సహాయకుడిని కలిసి కుటుంబ మరియు ఖాతా వివరాలను ధ్రువీకరించండి.',
    'अपने स्थानीय ग्राम/वार्ड सचिवालय में कल्याण सहायक से मिलकर पारिवारिक विवरण सत्यापित करें।',
    'csc_sachivalayam',
    NULL
),
(
    'ap-sch-002', 1,
    'Register Free Application at Grama / Ward Sachivalayam',
    'గ్రామ / వార్డు సచివాలయంలో ఉచిత దరఖాస్తు నమోదు',
    'ग्राम / वार्ड सचिवालय में निःशुल्क आवेदन पंजीकरण',
    'Submit photocopies to the Welfare & Education Assistant at your Sachivalayam. Never pay middlemen—registration is 100% free.',
    'సచివాలయంలోని సంక్షేమ సహాయకుడికి పత్రాల నకలు ఇవ్వండి. దళారులకు ఒక్క రూపాయి కూడా ఇవ్వకండి—దరఖాస్తు పూర్తిగా ఉచితం.',
    'सचिवालय में कल्याण सहायक को छायाप्रतियां दें। किसी बिचौलिये को पैसे न दें—पंजीकरण पूर्णतः निःशुल्क है।',
    'csc_sachivalayam',
    'https://sspensions.ap.gov.in/'
),
(
    'ap-sch-002', 2,
    'Field Verification & MPDO Sanction Order',
    'క్షేత్రస్థాయి పరిశీలన & MPDO మంజూరు ఉత్తర్వులు',
    'फील्ड सत्यापन एवं MPDO स्वीकृति आदेश',
    'Sachivalayam staff verify household eligibility and forward to the Mandal Parishad Development Officer (MPDO) for sanction within 21 days.',
    'సచివాలయ సిబ్బంది వివరాలను పరిశీలించి 21 రోజుల్లో MPDO మంజూరు ఉత్తర్వుల కోసం పంపుతారు.',
    'सचिवालय कर्मचारी पात्रता का सत्यापन कर 21 दिनों के भीतर MPDO स्वीकृति हेतु भेजते हैं।',
    'offline_office',
    NULL
),
(
    'ap-sch-002', 3,
    'Doorstep Cash / DBT Delivery on the 1st of Every Month',
    'ప్రతి నెలా 1వ తేదీన ఇంటి వద్దే పెన్షన్ పంపిణీ',
    'हर माह की 1 तारीख को घर पर पेंशन वितरण',
    'Once sanctioned, Sachivalayam functionaries disburse ₹4,000 directly at your doorstep on the 1st morning of each month.',
    'మంజూరైన తర్వాత ప్రతి నెలా 1వ తేదీ ఉదయం సచివాలయ సిబ్బంది మీ ఇంటి వద్దకే వచ్చి ₹4,000 అందిస్తారు.',
    'स्वीकृति के बाद प्रत्येक माह की 1 तारीख को सचिवालय कर्मचारी घर आकर ₹4,000 प्रदान करते हैं।',
    'csc_sachivalayam',
    NULL
),
(
    'ap-sch-003', 1,
    'Complete Seasonal e-Panta (e-Crop) Booking at Rythu Seva Kendram',
    'రైతు సేవా కేంద్రంలో ఈ-పంట (e-Panta) నమోదు చేయించండి',
    'रायथु सेवा केंद्र में मौसमी ई-पंटा बुकिंग पूरी करें',
    'Meet the Village Agriculture Assistant (VAA) at your Rythu Seva Kendram to record your sown crop and land/CCRC details.',
    'మీ గ్రామ రైతు సేవా కేంద్రంలోని వ్యవసాయ సహాయకుడిని కలిసి వేసిన పంట మరియు భూమి/CCRC వివరాలను నమోదు చేయించండి.',
    'अपने ग्राम रायथु सेवा केंद्र में ग्राम कृषि सहायक से मिलकर बोई गई फसल और भूमि/CCRC का विवरण दर्ज कराएं।',
    'csc_sachivalayam',
    'https://karshak.ap.gov.in/ekarshak/'
),
(
    'ap-sch-003', 2,
    'Verify Name on RSK Social Audit Display List',
    'RSK సామాజిక తనిఖీ జాబితాలో పేరు సరిచూసుకోండి',
    'RSK सामाजिक अंकेक्षण सूची में अपना नाम जांचें',
    'Confirm that your bank NPCI status shows "Active" on the beneficiary list displayed at the Rythu Seva Kendram.',
    'రైతు సేవా కేంద్రంలో ప్రదర్శించిన జాబితాలో మీ పేరు మరియు బ్యాంక్ NPCI స్టేటస్ సరిచూసుకోండి.',
    'रायथु सेवा केंद्र की सूची में अपना नाम और सक्रिय बैंक NPCI स्थिति सुनिश्चित करें।',
    'csc_sachivalayam',
    NULL
),
(
    'ap-sch-003', 3,
    'Receive Seasonal DBT Installments',
    'విడతల వారీగా ఖాతాకు పెట్టుబడి సాయం జమ',
    'मौसमी डीबीटी किस्तें प्राप्त करें',
    'Installments are credited directly to your bank account ahead of Kharif and Rabi crop cycles.',
    'ఖరీఫ్ మరియు రబీ సీజన్లకు ముందు నేరుగా మీ బ్యాంక్ ఖాతాలో నగదు జమ అవుతుంది.',
    'खरीफ और रबी फसल चक्र से पहले सहायता राशि सीधे आपके बैंक खाते में जमा होती है।',
    'online',
    NULL
),
(
    'cen-sch-001', 1,
    'Register on PM-KISAN Farmers Corner or Local CSC / RSK',
    'పీఎం కిసాన్ పోర్టల్ (Farmers Corner) లేదా రైతు సేవా కేంద్రంలో నమోదు',
    'पीएम किसान फार्मर्स कॉर्नर या स्थानीय CSC / RSK पर पंजीकरण',
    'Submit New Farmer Registration on pmkisan.gov.in or through your village Rythu Seva Kendram.',
    'pmkisan.gov.in లో "New Farmer Registration" ద్వారా లేదా గ్రామ రైతు సేవా కేంద్రంలో నమోదు చేసుకోండి.',
    'pmkisan.gov.in पर "New Farmer Registration" से या ग्राम रायथु सेवा केंद्र पर पंजीकरण करें।',
    'online',
    'https://pmkisan.gov.in/RegistrationFormNew.aspx'
),
(
    'cen-sch-001', 2,
    'Revenue Land Seeding & OTP / Biometric e-KYC',
    'రెవెన్యూ ల్యాండ్ సీడింగ్ & e-KYC పూర్తి చేయండి',
    'राजस्व लैंड सीडिंग और e-KYC पूरा करें',
    'Mandal Revenue Officer verifies Webland ownership while you complete free e-KYC on the portal or CSC.',
    'మండల రెవెన్యూ అధికారి భూ రికార్డును ధ్రువీకరిస్తారు; పోర్టల్‌లో ఉచిత e-KYC పూర్తి చేయండి.',
    'मंडल राजस्व अधिकारी भूमि रिकॉर्ड सत्यापित करते हैं; पोर्टल पर e-KYC पूरा करें।',
    'offline_office',
    NULL
),
(
    'ap-sch-004', 1,
    'Approach the Vaidya Mithra Helpdesk at Any Empaneled Hospital',
    'నెట్‌వర్క్ ఆసుపత్రిలోని "వైద్య మిత్ర" కౌంటర్‌ను సంప్రదించండి',
    'किसी भी सूचीबद्ध अस्पताल में "वैद्य मित्र" हेल्पडेस्क से मिलें',
    'Look for the dedicated government Vaidya Mithra helpdesk at the entrance of any government or empaneled private hospital.',
    'ప్రభుత్వ లేదా గుర్తింపు పొందిన ప్రైవేట్ ఆసుపత్రి ప్రవేశ ద్వారం వద్ద ఉన్న వైద్య మిత్ర కౌంటర్‌ను కలవండి.',
    'सरकारी या सूचीबद्ध निजी अस्पताल के प्रवेश द्वार पर वैद्य मित्र सहायता केंद्र से संपर्क करें।',
    'csc_sachivalayam',
    'https://www.ysraarogyasri.ap.gov.in/'
),
(
    'ap-sch-004', 2,
    'Digital Pre-Authorization & 100% Cashless Treatment + Medicines',
    'డిజిటల్ అనుమతి & 100% నగదు రహిత చికిత్స',
    'डिजिटल पूर्व-स्वीकृति एवं 100% कैशलेस उपचार',
    'Vaidya Mithra uploads clinical notes to the Trust portal and secures cashless approval covering surgery, bed, food, and follow-up medicines.',
    'వైద్య మిత్ర ఆన్‌లైన్ అనుమతి పొందుతారు; శస్త్రచికిత్స, ఆసుపత్రి బెడ్, భోజనం మరియు తదుపరి మందులు అన్నీ ఉచితం.',
    'वैद्य मित्र पोर्टल से तत्काल स्वीकृति दिलाते हैं जिसमें सर्जरी, बेड, भोजन व दवाएं निःशुल्क शामिल हैं।',
    'online',
    NULL
),
(
    'ap-sch-006', 1,
    'Complete Free LPG e-KYC & Rice Card Mapping at Gas Agency / Sachivalayam',
    'గ్యాస్ ఏజెన్సీ / సచివాలయంలో ఉచిత e-KYC పూర్తి చేయండి',
    'गैस एजेंसी / सचिवालय में निःशुल्क एलपीजी e-KYC पूरा करें',
    'Ensure your LPG connection e-KYC and White Rice Card linkage are active.',
    'మీ గ్యాస్ కనెక్షన్ e-KYC మరియు తెల్ల రైస్ కార్డు లింక్ యాక్టివ్‌గా ఉందో నిర్ధారించుకోండి.',
    'सुनिश्चित करें कि आपका गैस कनेक्शन e-KYC और सफेद राइस कार्ड लिंकिंग सक्रिय है।',
    'csc_sachivalayam',
    NULL
),
(
    'ap-sch-006', 2,
    'Book LPG Refill Normally & Receive 100% DBT Refund in 48 Hours',
    'సాధారణంగా గ్యాస్ బుక్ చేయండి — 48 గంటల్లో పూర్తి డబ్బు ఖాతాకు జమ',
    'सामान्य रूप से रिफिल बुक करें — 48 घंटों में 100% डीबीटी रिफंड पाएं',
    'Pay the delivery agent on cylinder receipt; the full cylinder price is refunded automatically to your bank account within 48 hours.',
    'డెలివరీ సమయంలో సిలిండర్ మొత్తం చెల్లించండి; 48 గంటల్లో పూర్తి సొమ్ము మీ బ్యాంక్ ఖాతాలో తిరిగి జమ అవుతుంది.',
    'डिलीवरी पर भुगतान करें; 48 घंटों के भीतर पूरी राशि आपके बैंक खाते में वापस आ जाती है।',
    'online',
    'https://apcivilsups.ap.gov.in/'
)
ON CONFLICT (scheme_id, step_no) DO NOTHING;

UPDATE public.schemes AS scheme
SET followup_en = COALESCE(scheme.followup_en, seed.followup_en),
    followup_te = COALESCE(scheme.followup_te, seed.followup_te),
    followup_hi = COALESCE(scheme.followup_hi, seed.followup_hi)
FROM (VALUES
(
    'ap-sch-001', 'Collect your GSWS Application Acknowledgement Slip. Check the Social Audit list posted at your Grama/Ward Sachivalayam within 21 days. If omitted despite UDISE+ attendance >= 75%, file a free grievance with the Welfare & Education Assistant or call 1902.',
    'సచివాలయంలో దరఖాస్తు రసీదు (Acknowledgement) తప్పక తీసుకోండి. 21 రోజుల్లో సచివాలయ నోటీసు బోర్డులో సామాజిక తనిఖీ జాబితాను సరిచూసుకోండి. పేరు లేకపోతే విద్యా సహాయకుడిని సంప్రదించండి లేదా 1902 కు ఉచితంగా కాల్ చేయండి.',
    'सचिवालय से पावती रसीद अवश्य लें। 21 दिनों के भीतर ग्राम/वार्ड सचिवालय की सामाजिक अंकेक्षण सूची जांचें। नाम न होने पर शिक्षा सहायक से मिलें या टोल-फ्री 1902 पर शिकायत दर्ज करें।'
),
(
    'ap-sch-005', 'Track your Jnanabhumi Application ID on jnanabhumi.ap.gov.in. Complete biometric authentication at your college principal’s desk and Grama Sachivalayam within 15 days of college registration.',
    'jnanabhumi.ap.gov.in లో మీ అప్లికేషన్ ఐడితో స్థితిని తనిఖీ చేయండి. కళాశాలలో నమోదు చేసిన 15 రోజుల్లోపు సచివాలయంలో వేలిముద్ర (Biometric) ధ్రువీకరణ పూర్తి చేయండి.',
    'jnanabhumi.ap.gov.in पर अपनी आवेदन आईडी से स्थिति ट्रैक करें। कॉलेज पंजीकरण के 15 दिनों के भीतर सचिवालय में बायोमेट्रिक सत्यापन पूरा करें।'
),
(
    'ap-sch-002', 'Keep your MPDO / Sachivalayam Pension Application ID safe. Verification takes up to 21 days. Check sanction status on sspensions.ap.gov.in; if delayed past 21 days, escalate to the Mandal Parishad Development Officer (MPDO) or call 1902.',
    'సచివాలయం ఇచ్చిన పెన్షన్ దరఖాస్తు రసీదును భద్రపరచండి. 21 రోజుల్లో పరిశీలన పూర్తవుతుంది. sspensions.ap.gov.in లో స్థితి చూడవచ్చు; జాప్యం జరిగితే MPDO కార్యాలయాన్ని లేదా 1902 హెల్ప్‌లైన్‌ను సంప్రదించండి.',
    'सचिवालय की पेंशन पावती रसीद सुरक्षित रखें। 21 दिनों में सत्यापन पूरा होता है। sspensions.ap.gov.in पर स्थिति जांचें; देरी होने पर MPDO या टोल-फ्री 1902 पर संपर्क करें।'
),
(
    'ap-sch-003', 'Verify your e-Panta (e-Crop) digital receipt at your Rythu Seva Kendram (RSK). If Webland / CCRC mismatch appears on the social audit list, raise a correction ticket with the Village Agriculture Assistant within 7 days or call 155251.',
    'రైతు సేవా కేంద్రం (RSK) లో మీ ఈ-పంట (e-Panta) డిజిటల్ రసీదును సరిచూసుకోండి. వెబ్‌ల్యాండ్ లేదా CCRC జాబితాలో సవరణలు అవసరమైతే గ్రామ వ్యవసాయ సహాయకుడిని కలవండి లేదా 155251 కు కాల్ చేయండి.',
    'रायथु सेवा केंद्र (RSK) में अपनी ई-पंटा रसीद जांचें। भूमि या CCRC रिकॉर्ड में त्रुटि होने पर ग्राम कृषि सहायक से संपर्क करें या 155251 पर कॉल करें।'
),
(
    'cen-sch-001', 'Check "Know Your Status" on pmkisan.gov.in using your PM-KISAN Registration Number (no middleman needed). Ensure all three green ticks: (1) Land Seeding: YES, (2) e-KYC: YES, (3) Bank Account NPCI Seeding: YES.',
    'pmkisan.gov.in లో "Know Your Status" ద్వారా మీ రిజిస్ట్రేషన్ నంబర్‌తో స్థితిని చూడండి. (1) Land Seeding, (2) e-KYC, (3) Bank NPCI Seeding మూడూ "YES" అని ఉన్నాయో నిర్ధారించుకోండి.',
    'pmkisan.gov.in पर "Know Your Status" में पंजीकरण संख्या से स्थिति जांचें। सुनिश्चित करें कि Land Seeding, e-KYC और Bank NPCI Seeding तीनों "YES" हैं।'
),
(
    'ap-sch-004', 'Pre-authorization is processed within 6–24 hours by the hospital Vaidya Mithra desk. Never pay cash deposits at an empaneled hospital for listed procedures—call 104 immediately from the hospital counter if asked for money.',
    'ఆసుపత్రిలోని వైద్య మిత్ర కౌంటర్ ద్వారా 6–24 గంటల్లో ఉచిత చికిత్స అనుమతి లభిస్తుంది. నెట్‌వర్క్ ఆసుపత్రిలో ఎవరైనా డబ్బు అడిగితే వెంటనే అక్కడి నుండే 104 హెల్ప్‌లైన్‌కు కాల్ చేయండి.',
    'अस्पताल के वैद्य मित्र डेस्क द्वारा 6–24 घंटों में कैशलेस स्वीकृति मिलती है। यदि सूचीबद्ध अस्पताल में पैसे मांगे जाएं तो तुरंत 104 हेल्पलाइन पर कॉल करें।'
),
(
    'ap-sch-006', 'Subsidy is credited within 48 hours of cylinder delivery. If not credited after 72 hours, verify LPG e-KYC at your gas agency or call the Civil Supplies toll-free helpline 1967.',
    'సిలిండర్ డెలివరీ అయిన 48 గంటల్లో సబ్సిడీ జమ అవుతుంది. రాకపోతే గ్యాస్ ఏజెన్సీలో e-KYC సరిచూసుకోండి లేదా 1967 టోల్-ఫ్రీ నంబర్‌కు కాల్ చేయండి.',
    'सिलेंडर डिलीवरी के 48 घंटों में सब्सिडी खाते में आती है। 72 घंटों बाद भी न आने पर गैस एजेंसी में e-KYC जांचें या 1967 पर कॉल करें।'
)
) AS seed(id, followup_en, followup_te, followup_hi)
WHERE scheme.id = seed.id
  AND (scheme.followup_en IS NULL OR scheme.followup_te IS NULL OR scheme.followup_hi IS NULL);

COMMIT;
