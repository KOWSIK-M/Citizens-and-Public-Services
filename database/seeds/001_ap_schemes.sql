-- =============================================================================
-- ClaimSaathi — Seed 001: Andhra Pradesh & Central Welfare Schemes + Synthetic Profiles
-- Idempotent (`ON CONFLICT DO NOTHING`) seed matching `src/services/mockSchemeData.ts`.
-- Note: `AP-DEEPAM-2-LPG` (`ap-sch-006`) intentionally seeds `verified_at = NULL`
--       to enforce FR-09 ("PENDING VERIFICATION" hold until verified by an admin).
-- =============================================================================

BEGIN;

-- 1. Seed Government Schemes (5 Andhra Pradesh State + 1 Central)
INSERT INTO schemes (
    id, scheme_code, name_en, name_te, name_hi, level, category, status,
    benefit_summary_en, benefit_summary_te, benefit_summary_hi,
    estimated_annual_benefit_inr, health_cover_lakhs,
    description_en, description_te, description_hi,
    application_open_on, application_close_on,
    deadline_label_en, deadline_label_te, deadline_label_hi,
    sla_days, status_check_url, grievance_helpline, is_published
) VALUES
(
    'ap-sch-001', 'AP-TALLIKI-VANDANAM',
    'Talliki Vandanam Scheme', 'తల్లికి వందనం పథకం', 'तल्लिकी वंदनम योजना',
    'state', 'scholarship', 'open',
    '₹15,000 per school-going child per year credited directly to the mother’s bank account.',
    'పాఠశాలకు వెళ్లే ప్రతి బిడ్డకు సంవత్సరానికి ₹15,000 నేరుగా తల్లి బ్యాంక్ ఖాతాకు జమ.',
    'स्कूल जाने वाले प्रत्येक बच्चे के लिए प्रति वर्ष ₹15,000 सीधे माता के बैंक खाते में।',
    15000, NULL,
    'Flagship Andhra Pradesh education support grant for mothers in low-income households from Class 1 to Class 12.',
    'ఆంధ్రప్రదేశ్‌లోని తక్కువ ఆదాయ కుటుంబాల తల్లులకు 1 నుండి 12వ తరగతి వరకు చదువుతున్న ప్రతి బిడ్డ చదువు కోసం ఆర్థిక సహాయం.',
    'आंध्र प्रदेश में कम आय वाले परिवारों की माताओं को कक्षा 1 से 12 तक पढ़ने वाले प्रत्येक बच्चे की शिक्षा हेतु वार्षिक सहायता।',
    '2026-06-12', '2026-12-15',
    'Academic Cycle Closes: 15 Dec 2026', 'దరఖాస్తు గడువు: 15 డిసెంబర్ 2026', 'आवेदन की अंतिम तिथि: 15 दिसंबर 2026',
    21, 'https://gsws-nbm.ap.gov.in/', '1902 (AP Spandana Helpline)', TRUE
),
(
    'ap-sch-005', 'AP-JNANABHUMI-PMS',
    'AP Jnanabhumi Post-Matric Scholarship (RTF & MTF)',
    'జగనన్న / జ్ఞానభూమి పోస్ట్-మెట్రిక్ స్కాలర్‌షిప్ (RTF & MTF)',
    'एपी ज्ञानभूमि पोस्ट-मैट्रिक छात्रवृत्ति (RTF और MTF)',
    'state', 'scholarship', 'open',
    '100% Tuition Fee Reimbursement (RTF) + up to ₹20,000/year Maintenance Allowance (MTF).',
    '100% కళాశాల ఫీజు రీయింబర్స్‌మెంట్ (RTF) + సంవత్సరానికి ₹20,000 వరకు వసతి ఖర్చులు (MTF).',
    '100% शिक्षण शुल्क प्रतिपूर्ति (RTF) + ₹20,000/वर्ष तक भरण-पोषण भत्ता (MTF)।',
    20000, NULL,
    'State post-matric scholarship supporting low-income students transitioning into Intermediate, Polytechnic, ITI, and Degree courses.',
    '10వ తరగతి పూర్తిచేసి ఇంటర్మీడియట్, పాలిటెక్నిక్, ఐటిఐ లేదా డిగ్రీ చదువుతున్న పేద విద్యార్థులకు పూర్తి ఫీజు మరియు వసతి సహాయం.',
    'कक्षा 10 के बाद इंटरमीडिएट, पॉलिटेक्निक, आईटीआई और डिग्री पाठ्यक्रमों के छात्रों के लिए शुल्क प्रतिपूर्ति व भत्ता।',
    '2026-08-01', '2026-12-31',
    'Fresh & Renewal Window Closes: 31 Dec 2026', 'దరఖాస్తు గడువు: 31 డిసెంబర్ 2026', 'आवेदन की अंतिम तिथि: 31 दिसंबर 2026',
    30, 'https://jnanabhumi.ap.gov.in/', '08645-274025 • 1902', TRUE
),
(
    'ap-sch-002', 'AP-NTR-BHAROSA-PENSION',
    'NTR Bharosa Social Security Pension',
    'ఎన్టీఆర్ భరోసా సామాజిక భద్రతా పెన్షన్',
    'एनटीआर भरोसा सामाजिक सुरक्षा पेंशन',
    'state', 'pension', 'open',
    '₹4,000/month (₹48,000/year) for senior citizens & widows; ₹6,000/month for persons with disability.',
    'వృద్ధులు మరియు వితంతువులకు నెలకు ₹4,000 (సంవత్సరానికి ₹48,000); దివ్యాంగులకు నెలకు ₹6,000.',
    'वरिष्ठ नागरिकों व विधवाओं को ₹4,000/माह (₹48,000/वर्ष); दिव्यांगजनों को ₹6,000/माह।',
    48000, NULL,
    'Monthly doorstep social security pension delivered on the 1st of every month for low-income seniors (60+), widows (18+), and persons with disabilities.',
    'ఆంధ్రప్రదేశ్ ప్రభుత్వం (SERP) ద్వారా పేద వృద్ధులు (60+), వితంతువులు (18+) మరియు దివ్యాంగులకు ప్రతి నెలా 1వ తేదీన అందించే పెన్షన్.',
    'आंध्र प्रदेश सरकार (SERP) द्वारा वरिष्ठ नागरिकों (60+), विधवाओं (18+) और दिव्यांगजनों को हर माह की 1 तारीख को दी जाने वाली पेंशन।',
    '2026-01-01', NULL,
    'Rolling Monthly Intake (Apply before 20th)', 'నిరంతర దరఖాస్తు ప్రక్రియ', 'निरंतर मासिक आवेदन',
    21, 'https://sspensions.ap.gov.in/', '1902 (AP Spandana)', TRUE
),
(
    'ap-sch-003', 'AP-ANNADATA-SUKHIBHAVA',
    'Annadata Sukhibhava Scheme', 'అన్నదాత సుఖీభవ పథకం', 'अन्नदाता सुखीभव योजना',
    'state', 'farm', 'open',
    '₹20,000 annual crop investment support for small/marginal landholders & CCRC tenant farmers.',
    'సన్నకారు, చిన్నకారు మరియు CCRC కౌలు రైతులకు సంవత్సరానికి ₹20,000 సాగు పెట్టుబడి సాయం.',
    'छोटे, सीमांत और CCRC बटाईदार किसानों को प्रति वर्ष ₹20,000 कृषि निवेश सहायता।',
    14000, NULL,
    'Andhra Pradesh seasonal input assistance delivering ₹14,000 state share + ₹6,000 PM-KISAN (or full ₹20,000 state support for eligible CCRC tenant farmers).',
    'ఆంధ్రప్రదేశ్ రైతులకు మరియు CCRC కౌలు రైతులకు సాగు ఖర్చుల నిమిత్తం సంవత్సరానికి ₹20,000 పెట్టుబడి సాయం.',
    'आंध्र प्रदेश के छोटे/सीमांत भूमिधारक और CCRC बटाईदार किसानों को ₹20,000 वार्षिक निवेश सहायता।',
    '2026-05-15', '2026-12-05',
    'Rabi e-Panta Verification Closes: 05 Dec 2026', 'రబీ ఈ-పంట నమోదు గడువు: 05 డిసెంబర్ 2026', 'रबी ई-पंटा अंतिम तिथि: 05 दिसंबर 2026',
    15, 'https://karshak.ap.gov.in/ekarshak/', '155251 • 1902', TRUE
),
(
    'cen-sch-001', 'CEN-PM-KISAN',
    'PM-KISAN Samman Nidhi', 'పీఎం కిసాన్ సమ్మాన్ నిధి', 'पीएम किसान सम्मान निधि',
    'central', 'farm', 'open',
    '₹6,000 per year in three ₹2,000 DBT installments for landholding farmer families.',
    'భూమి కలిగిన రైతు కుటుంబాలకు సంవత్సరానికి ₹6,000 (₹2,000 చొప్పున 3 విడతలలో).',
    'भूमिधारक किसान परिवारों को प्रति वर्ष ₹6,000 (₹2,000 की तीन समान किस्तों में)।',
    6000, NULL,
    'Central sector income-support scheme by the Ministry of Agriculture & Farmers Welfare for landholding farmer families.',
    'రెవెన్యూ రికార్డులలో సాగు భూమి కలిగిన రైతు కుటుంబాలకు కేంద్ర ప్రభుత్వం అందించే వార్షిక ఆదాయ మద్దతు పథకం.',
    'राजस्व रिकॉर्ड में खेती योग्य भूमि रखने वाले किसान परिवारों के लिए केंद्र सरकार की प्रत्यक्ष आय सहायता योजना।',
    '2026-01-01', '2026-11-30',
    'e-KYC Cut-off: 30 Nov 2026', 'e-KYC గడువు: 30 నవంబర్ 2026', 'e-KYC अंतिम तिथि: 30 नवंबर 2026',
    30, 'https://pmkisan.gov.in/BeneficiaryStatus_New.aspx', '155261 / 011-24300606', TRUE
),
(
    'ap-sch-004', 'AP-NTR-VAIDYA-SEVA',
    'Dr. NTR Vaidya Seva (Cashless Family Health Cover)',
    'డాక్టర్ ఎన్టీఆర్ వైద్య సేవ (ఉచిత కుటుంబ ఆరోగ్య రక్షణ)',
    'डॉ. एनटीआर वैद्य सेवा (कैशलेस पारिवारिक स्वास्थ्य बीमा)',
    'state', 'health', 'open',
    'Up to ₹25 Lakhs per family per year in cashless hospitalization across 3,250+ procedures.',
    'కుటుంబానికి సంవత్సరానికి ₹25 లక్షల వరకు 3,250+ చికిత్సలకు పూర్తిగా ఉచిత నగదు రహిత వైద్యం.',
    '3,250+ उपचारों के लिए प्रति परिवार प्रति वर्ष ₹25 लाख तक कैशलेस अस्पताल उपचार।',
    NULL, 25.00,
    'Universal secondary and tertiary cashless healthcare protection for Andhra Pradesh families earning up to ₹5 Lakhs/year.',
    'ఆంధ్రప్రదేశ్‌లో ₹5 లక్షల లోపు వార్షిక ఆదాయం కలిగిన కుటుంబాలకు ₹25 లక్షల వరకు పూర్తి ఉచిత శస్త్రచికిత్సల సదుపాయం.',
    'आंध्र प्रदेश में ₹5 लाख/वर्ष तक आय वाले परिवारों को ₹25 लाख तक निःशुल्क कैशलेस इलाज।',
    '2026-01-01', NULL,
    '24×7 Instant Cashless Walk-In', '24×7 నెట్‌వర్క్ ఆసుపత్రులలో తక్షణ ఉచిత వైద్యం', '24×7 सूचीबद्ध अस्पतालों में तत्काल कैशलेस सेवा',
    1, 'https://www.ysraarogyasri.ap.gov.in/', '104 • 1902', TRUE
),
(
    'ap-sch-006', 'AP-DEEPAM-2-LPG',
    'Deepam 2.0 Free LPG Cylinder Refill Scheme',
    'దీపం 2.0 ఉచిత గ్యాస్ సిలిండర్ల పథకం',
    'दीपम 2.0 निःशुल्क एलपीजी सिलेंडर रिफिल योजना',
    'state', 'women_child', 'open',
    '3 free domestic LPG cylinder refills per year (1 every 4 months) via 48-hour DBT subsidy.',
    'సంవత్సరానికి 3 ఉచిత వంట గ్యాస్ సిలిండర్లు (ప్రతి 4 నెలలకు ఒకటి) — 48 గంటల్లో ఖాతాకు రీయింబర్స్‌మెంట్.',
    'प्रति वर्ष 3 निःशुल्क घरेलू गैस सिलेंडर रिफिल (हर 4 माह में 1) — 48 घंटे में डीबीटी सब्सिडी।',
    2550, NULL,
    'Clean cooking fuel subsidy reimbursing 3 LPG refills annually for eligible White Rice Card households.',
    'తెల్ల రైస్ కార్డు మరియు యాక్టివ్ గ్యాస్ కనెక్షన్ కలిగిన పేద కుటుంబాలకు ఏడాదికి 3 ఉచిత గ్యాస్ సిలిండర్ల పథకం.',
    'सफेद राइस कार्ड धारक परिवारों को प्रति वर्ष 3 एलपीजी सिलेंडर रिफिल की पूर्ण राशि वापस करने की योजना।',
    '2026-10-31', '2026-11-30',
    'Cycle-1 Booking Window Closes: 30 Nov 2026', 'మొదటి విడత బుకింగ్ గడువు: 30 నవంబర్ 2026', 'प्रथम चक्र बुकिंग अंतिम तिथि: 30 नवंबर 2026',
    2, 'https://apcivilsups.ap.gov.in/', '1967 • 1902', TRUE
)
ON CONFLICT (id) DO NOTHING;

-- 2. Seed Official Sources (`src-007` intentionally has `verified_at = NULL`)
INSERT INTO scheme_sources (
    id, scheme_id, source_url, publisher, document_type, go_reference, retrieved_at, verified_at, verified_by
) VALUES
('src-001', 'ap-sch-001', 'https://cse.ap.gov.in/', 'Department of School Education, Govt. of Andhra Pradesh', 'GO', 'School Education Welfare Guidelines (UDISE+ Linked)', '2026-11-15', '2026-11-15', 'AP School Education Verification Desk'),
('src-006', 'ap-sch-005', 'https://jnanabhumi.ap.gov.in/', 'Social Welfare & Higher Education Dept, Govt. of Andhra Pradesh', 'portal', 'Jnanabhumi Post-Matric RTF/MTF Portal Rules', '2026-11-12', '2026-11-12', 'AP Higher Education Welfare Cell'),
('src-002', 'ap-sch-002', 'https://sspensions.ap.gov.in/', 'Society for Elimination of Rural Poverty (SERP), Govt. of Andhra Pradesh', 'GO', 'G.O.Ms.No. 43, Panchayat Raj & Rural Development (SERP)', '2026-11-18', '2026-11-18', 'SERP Social Security Audit Cell'),
('src-003', 'ap-sch-003', 'https://apagrisnet.gov.in/', 'Department of Agriculture, Govt. of Andhra Pradesh', 'portal', 'AP Agriculture Input Support & e-Panta Guidelines', '2026-11-16', '2026-11-16', 'AP Agriculture Welfare Cell'),
('src-004', 'cen-sch-001', 'https://pmkisan.gov.in/', 'Ministry of Agriculture & Farmers Welfare, Govt. of India', 'portal', 'PM-KISAN Operational Guidelines (Farmers Corner)', '2026-11-10', '2026-11-10', 'Central Scheme Verification Desk'),
('src-005', 'ap-sch-004', 'https://www.ysraarogyasri.ap.gov.in/', 'Dr. NTR Vaidya Seva Health Care Trust, Govt. of Andhra Pradesh', 'portal', 'NTR Vaidya Seva Trust Empaneled Hospital Guidelines', '2026-11-14', '2026-11-14', 'AP Health Trust Verification Cell'),
('src-007', 'ap-sch-006', 'https://apcivilsups.ap.gov.in/', 'Consumer Affairs, Food & Civil Supplies Dept, Govt. of Andhra Pradesh', 'GO', 'G.O.Ms.No. 17, Civil Supplies Dept (Awaiting Primary G.O. Sign-Off)', '2026-11-20', NULL, 'Pending Admin Verification')
ON CONFLICT (id) DO NOTHING;

-- 3. Seed Editable Deterministic Eligibility Rules (including OR-groups)
INSERT INTO scheme_rules (
    rule_id, scheme_id, source_id, field_name, rule_type, operator, value, condition_group,
    reason_en, reason_te, reason_hi, rule_version
) VALUES
('TV-R01', 'ap-sch-001', 'src-001', 'income_band', 'threshold', 'eq', 'below_1_2L', NULL,
 'Household annual income is within the BPL / White Rice Card limit (below ₹1.2 Lakhs/year).',
 'కుటుంబ వార్షిక ఆదాయం బిపిఎల్ / తెల్ల రేషన్ కార్డు పరిమితిలో (₹1.2 లక్షల లోపు) ఉంది.',
 'पारिवारिक वार्षिक आय बीपीएल / सफेद राशन कार्ड सीमा (₹1.2 लाख/वर्ष से कम) में है।', 2),
('TV-R02', 'ap-sch-001', 'src-001', 'state_code', 'location', 'eq', 'AP', NULL,
 'Resident of Andhra Pradesh.', 'ఆంధ్రప్రదేశ్ రాష్ట్ర నివాసి.', 'आंध्र प्रदेश के निवासी हैं।', 1),
('TV-R03', 'ap-sch-001', 'src-001', 'household_has_student', 'flag', 'eq', 'true', NULL,
 'Household has a child enrolled in Class 1 to 12 (or student applicant).',
 'కుటుంబంలో 1 నుండి 12వ తరగతి చదువుతున్న విద్యార్థి ఉన్నారు.',
 'परिवार में कक्षा 1 से 12 में पढ़ने वाला छात्र है।', 1),

('PMS-R01', 'ap-sch-005', 'src-006', 'income_band', 'threshold', 'lte', '1_2L_to_2_5L', NULL,
 'Annual family income is within ₹2.5 Lakhs/year post-matric scholarship ceiling.',
 'కుటుంబ వార్షిక ఆదాయం పోస్ట్-మెట్రిక్ స్కాలర్‌షిప్ పరిమితి (₹2.5 లక్షల లోపు) లో ఉంది.',
 'वार्षिक पारिवारिक आय ₹2.5 लाख/वर्ष की छात्रवृत्ति सीमा के भीतर है।', 1),
('PMS-R02', 'ap-sch-005', 'src-006', 'state_code', 'location', 'eq', 'AP', NULL,
 'Domicile / resident of Andhra Pradesh.', 'ఆంధ్రప్రదేశ్ రాష్ట్ర నివాసి.', 'आंध्र प्रदेश के मूल निवासी हैं।', 1),
('PMS-R03', 'ap-sch-005', 'src-006', 'household_has_post_matric_student', 'flag', 'eq', 'true', NULL,
 'Applicant or child in family is in Class 10 or enrolled in college.',
 'కుటుంబంలో 10వ తరగతి / ఇంటర్ / పాలిటెక్నిక్ / కాలేజీ విద్యార్థి ఉన్నారు.',
 'आवेदक या परिवार का बच्चा कक्षा 10 / इंटर / कॉलेज का छात्र है।', 1),

('NTR-R01A', 'ap-sch-002', 'src-002', 'age_band', 'age_range', 'eq', '60_plus', 'pension_vulnerability',
 'Meets Old-Age Pension age requirement (60+ years).',
 'వృద్ధాప్య పెన్షన్ వయోపరిమితి (60 ఏళ్లు పైబడిన వారు) నెరవేరింది.',
 'वृद्धावस्था पेंशन आयु मानदंड (60+ वर्ष) पूरा होता है।', 2),
('NTR-R01B', 'ap-sch-002', 'src-002', 'is_widow_or_single_woman', 'flag', 'eq', 'yes', 'pension_vulnerability',
 'Eligible under Widow / Destitute Single Woman pension category (18+ years).',
 'వితంతు / ఒంటరి మహిళా పెన్షన్ విభాగం కింద అర్హత ఉంది.',
 'विधवा / एकल महिला पेंशन श्रेणी के अंतर्गत पात्र।', 2),
('NTR-R01C', 'ap-sch-002', 'src-002', 'has_disability', 'flag', 'eq', 'yes', 'pension_vulnerability',
 'Eligible under SADAREM Disability Pension category.',
 'సదరం (SADAREM) దివ్యాంగుల పెన్షన్ విభాగం కింద అర్హత ఉంది.',
 'दिव्यांगजन पेंशन श्रेणी (SADAREM) के अंतर्गत पात्र।', 2),
('NTR-R02', 'ap-sch-002', 'src-002', 'income_band', 'threshold', 'eq', 'below_1_2L', NULL,
 'Household annual income falls within the rural BPL / White Rice Card limit.',
 'కుటుంబ ఆదాయం గ్రామీణ పేదరిక రేఖ (₹1.2 లక్షల లోపు) పరిధిలో ఉంది.',
 'पारिवारिक आय ग्रामीण बीपीएल सीमा (₹1.2 लाख से कम) के अंतर्गत है।', 1),
('NTR-R03', 'ap-sch-002', 'src-002', 'land_holding_band', 'threshold', 'lte', 'marginal_under_2_5_acres', NULL,
 'Landholding is landless or marginal (within wet/dry pension ceiling).',
 'భూమి లేని వారు లేదా సన్నకారు భూమి పరిమితిలో ఉన్నారు.',
 'भूमिहीन या सीमांत भूमि सीमा के भीतर हैं।', 2),
('NTR-R04', 'ap-sch-002', 'src-002', 'state_code', 'location', 'eq', 'AP', NULL,
 'Permanent resident of Andhra Pradesh.', 'ఆంధ్రప్రదేశ్ శాశ్వత నివాసి.', 'आंध्र प्रदेश के स्थायी निवासी हैं।', 1),

('AS-R01', 'ap-sch-003', 'src-003', 'occupation_category', 'category', 'eq', 'farmer', NULL,
 'Primary occupation is farming / crop cultivation.',
 'ప్రధాన వృత్తి వ్యవసాయం / పంట సాగు.', 'मुख्य व्यवसाय कृषि / फसल उत्पादन है।', 1),
('AS-R02A', 'ap-sch-003', 'src-003', 'land_holding_band', 'threshold', 'in', 'marginal_under_2_5_acres,small_2_5_to_5_acres', 'cultivator_eligibility',
 'Owns marginal or small agricultural farmland (up to 5 acres).',
 'సన్నకారు లేదా చిన్నకారు స్వంత సాగు భూమి (5 ఎకరాల లోపు) ఉంది.',
 'सीमांत या छोटी निजी कृषि भूमि (5 एकड़ तक) है।', 2),
('AS-R02B', 'ap-sch-003', 'src-003', 'is_tenant_farmer_ccrc', 'flag', 'eq', 'yes', 'cultivator_eligibility',
 'Eligible as a landless Tenant Farmer holding a Crop Cultivator Rights Card (CCRC).',
 'పంట సాగుదారు హక్కు పత్రం (CCRC) కలిగిన కౌలు రైతుగా అర్హత ఉంది.',
 'फसल काश्तकार अधिकार कार्ड (CCRC) धारक बटाईदार किसान के रूप में पात्र।', 2),
('AS-R03', 'ap-sch-003', 'src-003', 'state_code', 'location', 'eq', 'AP', NULL,
 'Cultivated farmland is in Andhra Pradesh.', 'సాగు భూమి ఆంధ్రప్రదేశ్ రాష్ట్రంలో ఉంది.', 'कृषि भूमि आंध्र प्रदेश में स्थित है।', 1),

('PMK-R01', 'cen-sch-001', 'src-004', 'occupation_category', 'category', 'eq', 'farmer', NULL,
 'Applicant is an active agricultural farmer.', 'దరఖాస్తుదారుడు వ్యవసాయం చేస్తున్న రైతు.', 'आवेदक सक्रिय कृषि किसान है।', 1),
('PMK-R02', 'cen-sch-001', 'src-004', 'land_holding_band', 'threshold', 'gte', 'marginal_under_2_5_acres', NULL,
 'Owns cultivable agricultural land recorded in state RoR / Webland.',
 'రాష్ట్ర భూ రికార్డులలో (Webland) స్వంత సాగు భూమి కలిగి ఉన్నారు.',
 'राज्य भूमि अभिलेख (Webland) में अपने नाम पर कृषि भूमि है।', 2),
('PMK-R03', 'cen-sch-001', 'src-004', 'income_band', 'threshold', 'neq', 'above_5L', NULL,
 'Not in the high-income / income-tax-paying exclusion bracket.',
 'ఆదాయపు పన్ను చెల్లించే అధిక ఆదాయ పరిధిలో లేరు.',
 'आयकरदाता / उच्च आय अपवर्जन श्रेणी में नहीं हैं।', 1),

('VS-R01', 'ap-sch-004', 'src-005', 'income_band', 'threshold', 'lte', '2_5L_to_5L', NULL,
 'Annual family income is up to ₹5 Lakhs/year universal health threshold.',
 'కుటుంబ వార్షిక ఆదాయం ₹5 లక్షల ఆరోగ్య రక్షణ పరిమితిలో ఉంది.',
 'पारिवारिक वार्षिक आय ₹5 लाख स्वास्थ्य सुरक्षा सीमा के भीतर है।', 2),
('VS-R02', 'ap-sch-004', 'src-005', 'state_code', 'location', 'eq', 'AP', NULL,
 'Resident family of Andhra Pradesh.', 'ఆంధ్రప్రదేశ్ రాష్ట్ర నివాస కుటుంబం.', 'आंध्र प्रदेश का निवासी परिवार।', 1),

('DP2-R01', 'ap-sch-006', 'src-007', 'income_band', 'threshold', 'eq', 'below_1_2L', NULL,
 'Household holds BPL / White Rice Card income eligibility.',
 'కుటుంబం తెల్ల రైస్ కార్డు / బిపిఎల్ ఆదాయ పరిధిలో ఉంది.',
 'परिवार सफेद राइस कार्ड / बीपीएल आय सीमा में है।', 1),
('DP2-R02', 'ap-sch-006', 'src-007', 'state_code', 'location', 'eq', 'AP', NULL,
 'Resident household in Andhra Pradesh.', 'ఆంధ్రప్రదేశ్ రాష్ట్ర నివాస కుటుంబం.', 'आंध्र प्रदेश का निवासी परिवार।', 1)
ON CONFLICT (rule_id) DO NOTHING;

-- 4. Seed Synthetic Demo Citizen Profiles (`is_sample = true` ONLY — Zero Real Citizen Records)
INSERT INTO citizen_profiles (
    id, owner_session_id, age_band, state_code, district_code, income_band,
    occupation_category, social_category, land_holding_band, language_pref,
    has_school_student, has_college_student, is_widow_or_single_woman,
    has_disability, is_tenant_farmer_ccrc, has_white_ration_card, is_sample
) VALUES
(
    '00000000-0000-4000-8000-000000000001', 'synthetic-scenario-a',
    'under_18', 'AP', 'Guntur', 'below_1_2L', 'student', 'BC', 'none', 'en',
    'yes', 'yes', 'no', 'no', 'no', 'yes', TRUE
),
(
    '00000000-0000-4000-8000-000000000002', 'synthetic-scenario-b',
    '60_plus', 'AP', 'Krishna', 'below_1_2L', 'homemaker', 'OC', 'none', 'te',
    'no', 'no', 'yes', 'no', 'no', 'yes', TRUE
),
(
    '00000000-0000-4000-8000-000000000003', 'synthetic-scenario-c',
    '41_60', 'AP', 'Kurnool', '1_2L_to_2_5L', 'farmer', 'BC', 'marginal_under_2_5_acres', 'hi',
    'yes', 'yes', 'no', 'no', 'no', 'no', TRUE
)
ON CONFLICT (id) DO NOTHING;

COMMIT;
