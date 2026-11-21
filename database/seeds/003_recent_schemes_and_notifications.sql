-- ClaimSaathi v4.0 Seed: Recent Government Schemes, Start/End Date Updates & Initial Neon Community Records
-- Idempotent (`ON CONFLICT DO NOTHING`) so re-running never overwrites live admin/citizen updates.

BEGIN;

-- 1. Recent Government Schemes & Official Window Notifications
INSERT INTO public.scheme_notifications (
  id, scheme_id, notification_type,
  title_en, title_te, title_hi,
  body_en, body_te, body_hi,
  sector, start_date, end_date, official_url, is_published, published_at
) VALUES
(
  'notif-ap-talliki-2026',
  'ap-sch-001',
  'window_opening',
  'Talliki Vandanam (₹15,000/child) — Academic Year Verification Window Open',
  'తల్లికి వందనం (₹15,000/విద్యార్థి) — విద్యా సంవత్సర ధృవీకరణ ప్రారంభం',
  'तल्लिकि वंदनम (₹15,000/बच्चा) — शैक्षणिक वर्ष सत्यापन विंडो खुली',
  'School UDISE+ mother mapping and Grama/Ward Sachivalayam e-KYC verification is active. Confirm 75% attendance and NPCI-seeded mother bank account before the closing date.',
  'పాఠశాల UDISE+ తల్లి వివరాల నమోదు & సచివాలయ e-KYC ధృవీకరణ కొనసాగుతోంది. గడువు లోపు 75% హాజరు మరియు NPCI బ్యాంకు లింక్ తనిఖీ చేసుకోండి.',
  'स्कूल UDISE+ माता मैपिंग और सचिवालय e-KYC सत्यापन सक्रिय है। अंतिम तिथि से पहले 75% उपस्थिति और NPCI बैंक लिंकिंग सुनिश्चित करें।',
  'scholarship',
  '2026-11-01',
  '2026-12-31',
  'https://cse.ap.gov.in/',
  TRUE,
  NOW() - INTERVAL '1 day'
),
(
  'notif-ap-annadata-2026',
  'ap-sch-003',
  'deadline_closing',
  'Annadata Sukhibhava + PM-KISAN (₹20,000/yr) — e-Panta & CCRC Cut-Off Approaching',
  'అన్నదాత సుఖీభవ + PM-KISAN (₹20,000/సం.) — ఇ-పంట & CCRC గడువు దగ్గరపడింది',
  'अन्नदाता सुखीभव + पीएम-किसान (₹20,000/वर्ष) — ई-पंटा और CCRC अंतिम तिथि नजदीक',
  'Smallholder farmers and CCRC tenant farmers must complete biometric e-Panta crop booking at their Rythu Seva Kendra (RSK) and verify Webland 1B land seeding before the instalment deadline.',
  'సన్నకారు మరియు CCRC కౌలు రైతులు తమ రైతు సేవా కేంద్రంలో (RSK) బయోమెట్రిక్ ఇ-పంట నమోదు & వెబ్‌ల్యాండ్ 1B సీడింగ్ పూర్తి చేయాలి.',
  'छोटे और CCRC बटाईदार किसान रैतु सेवा केंद्र (RSK) में बायोमेट्रिक ई-पंटा और वेबलैंड 1B सीडिंग अंतिम तिथि से पहले पूरी करें।',
  'farm',
  '2026-10-15',
  '2026-12-15',
  'https://apagrisnet.gov.in/',
  TRUE,
  NOW() - INTERVAL '2 days'
),
(
  'notif-ap-deepam2-2026',
  'ap-sch-007',
  'recent_scheme',
  'Recent Govt Scheme Update: Deepam 2.0 (3 Free LPG Cylinders/Year) — e-KYC & Subsidy Release',
  'కొత్త ప్రభుత్వ పథకం అప్‌డేట్: దీపం 2.0 (ఏడాదికి 3 ఉచిత గ్యాస్ సిలిండర్లు)',
  'ताज़ा सरकारी योजना अपडेट: दीपम 2.0 (वर्ष में 3 निःशुल्क गैस सिलेंडर)',
  'Eligible AP White Rice Card households with active LPG connections receive 3 free refill subsidies per year (1 per 4-month block) directly via DBT after gas agency e-KYC.',
  'తెల్ల రైస్ కార్డు మరియు యాక్టివ్ గ్యాస్ కనెక్షన్ ఉన్న కుటుంబాలకు 4 నెలలకు ఒకటి చొప్పున ఏడాదికి 3 ఉచిత సిలిండర్ల సబ్సిడీ నేరుగా DBT ద్వారా జమ అవుతుంది.',
  'सफेद राइस कार्ड और सक्रिय एलपीजी कनेक्शन वाले परिवारों को प्रति वर्ष 3 निःशुल्क सिलेंडर सब्सिडी सीधे डीबीटी के माध्यम से मिलती है।',
  'women_child',
  '2026-11-01',
  '2027-03-31',
  'https://apcivilsups.ap.gov.in/',
  TRUE,
  NOW() - INTERVAL '6 hours'
),
(
  'notif-ap-ntr-pension-2026',
  'ap-sch-002',
  'policy_update',
  'NTR Bharosa Pension (₹4,000–₹6,000/month) — Doorstep Biometric & Iris Disbursement Schedule',
  'ఎన్టీఆర్ భరోసా పెన్షన్ (₹4,000–₹6,000/నెల) — 1వ తేదీన ఇంటి వద్దే పంపిణీ',
  'एनटीआर भरोसा पेंशन (₹4,000–₹6,000/माह) — 1 तारीख को घर पर वितरण कार्यक्रम',
  'New senior citizen (60+), widow, and SADAREM disability pension applications are accepted year-round at Grama/Ward Sachivalayams with Iris/Face authentication fallback for elderly citizens.',
  'కొత్త వృద్ధాప్య (60+), వితంతు, దివ్యాంగుల పెన్షన్ దరఖాస్తులు సచివాలయాలలో ఏడాది పొడవునా స్వీకరించబడతాయి. వేలిముద్రలు పడని వారికి ఐరిస్ సదుపాయం ఉంది.',
  'वरिष्ठ नागरिक (60+), विधवा और दिव्यांग पेंशन आवेदन सचिवालय में पूरे वर्ष खुले हैं, बुजुर्गों के लिए आइरिस सत्यापन उपलब्ध है।',
  'pension',
  '2026-11-01',
  '2026-12-25',
  'https://sspensions.ap.gov.in/',
  TRUE,
  NOW() - INTERVAL '3 days'
),
(
  'notif-ap-jnanabhumi-2026',
  'ap-sch-006',
  'deadline_closing',
  'AP Jnanabhumi Post-Matric Scholarship (RTF & MTF) — Renewal & Fresh Registration Open',
  'ఆంధ్రప్రదేశ్ జ్ఞానభూమి పోస్ట్-మెట్రిక్ స్కాలర్‌షిప్ — కొత్త & రెన్యువల్ నమోదు',
  'आंध्र प्रदेश ज्ञानभूमि पोस्ट-मैट्रिक छात्रवृत्ति — नया और नवीनीकरण पंजीकरण खुला',
  'Intermediate, Polytechnic, ITI, and Degree students from BC/SC/ST/EBC/Minority households should submit biometric authentication at their college desk before the semester cut-off.',
  'ఇంటర్, పాలిటెక్నిక్, ఐటీఐ మరియు డిగ్రీ విద్యార్థులు తమ కళాశాల ద్వారా జ్ఞానభూమి బయోమెట్రిక్ నమోదు గడువు లోపు పూర్తి చేయాలి.',
  'इंटर, पॉलिटेक्निक, आईटीआई और डिग्री छात्र अंतिम तिथि से पहले अपने कॉलेज में ज्ञानभूमि बायोमेट्रिक पंजीकरण पूरा करें।',
  'scholarship',
  '2026-11-05',
  '2026-12-20',
  'https://jnanabhumi.ap.gov.in/',
  TRUE,
  NOW() - INTERVAL '12 hours'
),
(
  'notif-ap-vaidyaseva-2026',
  'ap-sch-005',
  'recent_scheme',
  'Dr. NTR Vaidya Seva Universal Cashless Health Cover (Up to ₹25 Lakhs) — E-Card Update',
  'డా. ఎన్టీఆర్ వైద్య సేవ (₹25 లక్షల వరకు ఉచిత చికిత్స) — ఈ-కార్డు అప్‌డేట్',
  'डॉ. एनटीआर वैद्य सेवा (₹25 लाख तक कैशलेस इलाज) — ई-कार्ड अपडेट',
  'Network hospitals across Andhra Pradesh honour digital Aarogyasri / NTR Vaidya Seva E-Cards verified via White Rice Card or ₹5L annual income certificate.',
  'ఆంధ్రప్రదేశ్ నెట్‌వర్క్ ఆసుపత్రులలో తెల్ల రైస్ కార్డు లేదా ₹5 లక్షల ఆదాయ ధృవీకరణతో ₹25 లక్షల వరకు ఉచిత నగదు రహిత చికిత్స అందుబాటులో ఉంది.',
  'सफेद राइस कार्ड या ₹5 लाख आय प्रमाण पत्र के साथ नेटवर्क अस्पतालों में ₹25 लाख तक कैशलेस उपचार उपलब्ध है।',
  'health',
  '2026-11-01',
  NULL,
  'https://ysraarogyasri.ap.gov.in/',
  TRUE,
  NOW() - INTERVAL '4 days'
)
ON CONFLICT (id) DO NOTHING;

-- 2. Initial Neon Community Proposals (No Hardcoded Runtime Fallbacks Needed!)
INSERT INTO public.community_proposals (
  id, title, description, category, district, target_cohort,
  escalation_target, author_persona_label, upvotes_count,
  escalation_threshold, is_validated, is_sample, created_at
) VALUES
(
  'prop-ap-gig-monsoon-01',
  'Monsoon Income & Accident Relief Scheme for Urban Delivery & Auto Workers',
  'Platform delivery riders and rented-auto drivers in Visakhapatnam, Vijayawada, and Tirupati lose livelihood during cyclone/heavy-rain alerts and do not qualify under farm or formal labour schemes. Requesting seasonal livelihood cover and cashless outpatient trauma link.',
  'employment',
  'Visakhapatnam',
  'Gig Riders & Rented-Auto Drivers (Income < ₹2.5L)',
  'ap_gsws_1902',
  'Self-Employed Driver • Visakhapatnam',
  9,
  10,
  TRUE,
  FALSE,
  '2026-11-19T09:30:00.000Z'
),
(
  'prop-ap-weaver-coop-02',
  'Extend Power-Loom & Yarn Subsidy to Independent Household Handloom Helpers',
  'Auxiliary handloom/warping daily-wage helpers in Guntur, Bapatla, and Prakasam who do not own a registered loom miss weaver support despite White Rice Card status. Proposing Sachivalayam occupational verification for helper households.',
  'employment',
  'Guntur',
  'Handloom Auxiliary Daily-Wage Families',
  'district_collectorate',
  'Daily-Wage Artisan • Guntur',
  14,
  10,
  TRUE,
  FALSE,
  '2026-11-17T14:15:00.000Z'
),
(
  'prop-ap-ccrc-delay-03',
  'Simplified Gram Sabha Attestation When Absentee Landlords Delay CCRC Signing',
  'Oral-lease tenant farmers in Kurnool and Nandyal miss Annadata Sukhibhava when out-of-town landowners cannot visit the village to sign CCRC forms. Requesting RSK + NGO legal-aid facilitation camps before Kharif.',
  'farm',
  'Kurnool',
  'Oral-Lease Tenant Farmers (Koulu Rythulu)',
  'ngo_legal_aid',
  'Tenant Farmer • Kurnool',
  11,
  10,
  TRUE,
  FALSE,
  '2026-11-16T11:00:00.000Z'
),
(
  'prop-ap-inter-buspass-04',
  'Zero-Cost APSRTC Rural Hostel-to-Polytechnic Pass Add-On for Low-Income Girls',
  'Students commuting >18 km from mandal villages in Chittoor and Ananthapuramu face monthly transport expenses before Post-Matric reimbursement arrives. Requesting direct APSRTC digital pass integration via Jnanabhumi.',
  'scholarship',
  'Tirupati',
  'Rural Girls in Polytechnic / Govt Junior Colleges',
  'ap_gsws_1902',
  'College Student • Tirupati',
  6,
  10,
  TRUE,
  FALSE,
  '2026-11-20T07:45:00.000Z'
)
ON CONFLICT (id) DO NOTHING;

-- 3. Initial Neon Community Discussion Messages
INSERT INTO public.community_messages (
  id, district, topic_category, author_persona_label,
  message_body, helpful_count, linked_proposal_id, is_sample, created_at
) VALUES
(
  'msg-ap-01',
  'Guntur',
  'dbt_help',
  'Smallholder Farmer • Guntur',
  'Tip for fellow farmers: If your Annadata Sukhibhava status says NPCI inactive, take your Rice Card to the Head Post Office IPPB counter—they seeded my DBT mapper in 10 minutes free of cost.',
  12,
  NULL,
  FALSE,
  '2026-11-20T10:15:00.000Z'
),
(
  'msg-ap-02',
  'Visakhapatnam',
  'scheme_gap',
  'Self-Employed Driver • Visakhapatnam',
  'Rented auto & food-delivery riders do not fit farm or organised-sector schemes when heavy rains shut roads. Please review and vote on our Monsoon Relief proposal on the Voting tab—only 1 vote left to reach 10!',
  8,
  'prop-ap-gig-monsoon-01',
  FALSE,
  '2026-11-20T16:40:00.000Z'
),
(
  'msg-ap-03',
  'Kurnool',
  'sachivalayam_tip',
  'Parent of Class 9 Student • Kurnool',
  'Before Talliki Vandanam verification closes, check with your school Headmaster that UDISE+ has the mother’s bank-seeded household entry marked active.',
  9,
  NULL,
  FALSE,
  '2026-11-21T06:20:00.000Z'
),
(
  'msg-ap-04',
  'Krishna',
  'pension_ekyc',
  'Senior Citizen Household • Krishna',
  'If an elderly family member’s thumbprint fails during NTR Bharosa e-KYC, ask the Sachivalayam Digital Assistant for Iris Scanner authentication—it worked immediately for us.',
  15,
  NULL,
  FALSE,
  '2026-11-21T08:05:00.000Z'
)
ON CONFLICT (id) DO NOTHING;

COMMIT;
