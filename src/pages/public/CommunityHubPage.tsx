import React, { useState, useEffect } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { useSearchParams } from 'react-router-dom';
import { useLanguage } from '@/store/useLanguageStore';
import { useProfileStore } from '@/store/useProfileStore';
import { useCommunityStore } from '@/store/useCommunityStore';
import { AP_DISTRICT_OPTIONS } from '@/config/bands';
import { CommunityProposal } from '@/types/community';
import { inspectTextForPii } from '@/utils/piiValidator';
import { RaiseGapModal } from '@/components/community/RaiseGapModal';
import { EscalationDossierModal } from '@/components/community/EscalationDossierModal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  ThumbsUp,
  Megaphone,
  MessageSquare,
  FileText,
  ShieldCheck,
  Send,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

const PERSONA_ROLES = [
  { value: 'Smallholder Farmer', en: 'Smallholder Farmer', te: 'చిన్నకారు రైతు', hi: 'छोटा किसान' },
  { value: 'Daily-Wage Worker', en: 'Daily-Wage Worker', te: 'దినసరి కూలీ', hi: 'दिहाड़ी मजदूर' },
  { value: 'Student / Parent', en: 'Student / Parent', te: 'విద్యార్థి / తల్లిదండ్రులు', hi: 'छात्र / अभिभावक' },
  { value: 'Homemaker', en: 'Homemaker', te: 'గృహిణి', hi: 'गृहिणी' },
  { value: 'Senior Citizen', en: 'Senior Citizen', te: 'సీనియర్ సిటిజన్', hi: 'वरिष्ठ नागरिक' },
  { value: 'Self-Employed / Driver', en: 'Self-Employed / Driver', te: 'స్వయం ఉపాధి / డ్రైవర్', hi: 'स्वरोजगार / चालक' },
];

export const CommunityHubPage: React.FC = () => {
  const { pick, getFontClass } = useLanguage();
  const { confirmedProfile } = useProfileStore();
  const {
    proposals,
    messages,
    votedProposalIds,
    refreshCommunityData,
    upvoteProposal,
    postChatMessage,
    markMessageHelpful,
  } = useCommunityStore();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialTab = searchParams.get('tab') === 'chat' ? 'chat' : 'proposals';
  const [activeTab, setActiveTab] = useState<'proposals' | 'chat'>(initialTab);
  const [districtFilter, setDistrictFilter] = useState<string>('All AP');
  const [raiseModalOpen, setRaiseModalOpen] = useState<boolean>(
    searchParams.get('raise') === '1'
  );
  const [prefillProposalText, setPrefillProposalText] = useState<string>('');
  const [dossierProposal, setDossierProposal] = useState<CommunityProposal | null>(null);
  const [escalationBannerMsg, setEscalationBannerMsg] = useState<string | null>(null);

  // Chat compose state
  const defaultDistrict =
    confirmedProfile?.district_code && confirmedProfile.district_code !== 'unknown'
      ? confirmedProfile.district_code
      : 'Guntur';
  const [chatDistrict, setChatDistrict] = useState<string>(defaultDistrict);
  const [personaRole, setPersonaRole] = useState<string>(PERSONA_ROLES[0].value);
  const [chatInput, setChatInput] = useState<string>('');
  const [chatError, setChatError] = useState<string | null>(null);
  const [postingChat, setPostingChat] = useState<boolean>(false);

  useEffect(() => {
    void refreshCommunityData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredProposals = proposals.filter(
    (p) =>
      districtFilter === 'All AP' ||
      p.district === 'All AP' ||
      p.district.toLowerCase() === districtFilter.toLowerCase()
  );

  const filteredMessages = messages.filter(
    (m) =>
      districtFilter === 'All AP' ||
      m.district === 'All AP' ||
      m.district.toLowerCase() === districtFilter.toLowerCase()
  );

  const liveChatPii = inspectTextForPii(chatInput);

  const handleTabChange = (val: string) => {
    const next = val === 'chat' ? 'chat' : 'proposals';
    setActiveTab(next);
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('tab', next);
    nextParams.delete('raise');
    setSearchParams(nextParams, { replace: true });
  };

  const handleUpvote = async (proposal: CommunityProposal) => {
    const wasBelow = proposal.upvotes_count < proposal.escalation_threshold;
    const { thresholdReached } = await upvoteProposal(proposal.id);
    if (wasBelow && thresholdReached) {
      setEscalationBannerMsg(
        pick(
          `Threshold Reached (10 Votes)! "${proposal.title}" is now unlocked for AP Collectorate / 1902 & NGO Escalation!`,
          `10 ఓట్లు పూర్తయ్యాయి! "${proposal.title}" ఇప్పుడు ప్రభుత్వ (1902 / కలెక్టరేట్) & NGO ఎస్కలేషన్‌కు సిద్ధంగా ఉంది!`,
          `10 वोट पूरे! "${proposal.title}" अब सरकारी (1902 / कलेक्टरेट) व NGO एस्केलेशन के लिए अनलॉक हो गया है!`
        )
      );
    }
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (liveChatPii.hasPii) {
      setChatError(
        pick(
          'Remove Aadhaar, phone, PAN, or bank numbers before posting.',
          'ఆధార్, ఫోన్ లేదా బ్యాంకు నంబర్లు తొలగించండి.',
          'पोस्ट करने से पहले आधार, फ़ोन या बैंक नंबर हटाएं।'
        )
      );
      return;
    }
    if (chatInput.trim().length < 5) {
      setChatError(
        pick(
          'Write at least a short message (5+ characters).',
          'కనీసం 5 అక్షరాల సందేశం రాయండి.',
          'कम से कम 5 अक्षरों का संदेश लिखें।'
        )
      );
      return;
    }

    setPostingChat(true);
    setChatError(null);
    const res = await postChatMessage({
      district: chatDistrict,
      topic_category: 'local_help',
      author_persona_label: `${personaRole} • ${chatDistrict}`,
      message_body: chatInput.trim(),
    });
    setPostingChat(false);

    if (!res.ok) {
      setChatError(res.error || 'Could not post message.');
      return;
    }
    setChatInput('');
  };

  return (
    <div className="max-w-6xl mx-auto py-8 md:py-10 px-4 sm:px-6 lg:px-8 space-y-7">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-indigo-100 text-indigo-900 border border-indigo-300 font-semibold">
              <ShieldCheck className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
              {pick(
                'PII-Shielded Civic Forum • Zero Real Names or IDs',
                'PII-రక్షిత ప్రజా వేదిక • ఆధార్/ఫోన్ లేకుండా',
                'PII-सुरक्षित नागरिक मंच • बिना किसी व्यक्तिगत नंबर के'
              )}
            </Badge>
          </div>
          <h1 className={`text-2xl md:text-3xl font-extrabold text-primary flex items-center gap-2.5 ${getFontClass()}`}>
            <Users className="h-7 w-7 text-indigo-700 shrink-0" aria-hidden="true" />
            <span>
              {pick(
                'Local Citizen Community & New Scheme Escalation Board',
                'స్థానిక ప్రజా వేదిక & కొత్త సంక్షేమ పథకాల ఓటింగ్ బోర్డు',
                'स्थानीय नागरिक समुदाय एवं नई योजना मतदान बोर्ड'
              )}
            </span>
          </h1>
          <p className={`text-sm md:text-base text-muted max-w-3xl ${getFontClass()}`}>
            {pick(
              'Chat with fellow Andhra Pradesh citizens, propose missing welfare schemes, and vote. Proposals reaching 10+ votes unlock a structured Government (1902 / Collectorate) & NGO Escalation Dossier.',
              'ఆంధ్రప్రదేశ్ ప్రజలతో చర్చించండి, కొత్త పథకాలను ప్రతిపాదించి ఓటు వేయండి. 10+ ఓట్లు దాటిన ప్రతిపాదనలకు ప్రభుత్వ (1902 / కలెక్టరేట్) & NGO ఎస్కలేషన్ నివేదిక సిద్ధమవుతుంది.',
              'स्थानीय नागरिकों से चर्चा करें, नई योजना का प्रस्ताव रखें और वोट दें। 10+ वोट पार करने पर सरकारी (1902 / कलेक्टरेट) और NGO एस्केलेशन डोज़ियर तैयार होता है।'
            )}
          </p>
        </div>

        <Button
          type="button"
          onClick={() => {
            setPrefillProposalText('');
            setRaiseModalOpen(true);
          }}
          className={`min-h-[46px] bg-amber-600 hover:bg-amber-700 text-white font-bold shrink-0 ${getFontClass()}`}
        >
          <Megaphone className="h-4 w-4 mr-2" aria-hidden="true" />
          {pick('Propose New Scheme / Gap', 'కొత్త పథకం ప్రతిపాదించండి', 'नई योजना का प्रस्ताव रखें')}
        </Button>
      </div>

      {escalationBannerMsg && (
        <div
          role="status"
          className={`rounded-xl border-2 border-emerald-500 bg-emerald-50 p-4 flex items-center gap-3 text-sm font-bold text-emerald-950 ${getFontClass()}`}
        >
          <CheckCircle2 className="h-5 w-5 text-emerald-700 shrink-0" aria-hidden="true" />
          <span>{escalationBannerMsg}</span>
        </div>
      )}

      {/* District Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-border rounded-xl p-3.5">
        <div className="flex items-center gap-2">
          <label
            htmlFor="community-district-filter"
            className={`text-xs sm:text-sm font-bold text-primary ${getFontClass()}`}
          >
            {pick('Filter by AP District:', 'జిల్లా ఎంచుకోండి:', 'जिला चुनें:')}
          </label>
          <select
            id="community-district-filter"
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
            className="min-h-[40px] rounded-md border border-input bg-white px-3 text-xs sm:text-sm font-medium text-body"
          >
            <option value="All AP">
              {pick('All Andhra Pradesh', 'మొత్తం ఆంధ్రప్రదేశ్', 'संपूर्ण आंध्र प्रदेश')}
            </option>
            {AP_DISTRICT_OPTIONS.map((d) => (
              <option key={d.value} value={d.value}>
                {pick(d.label_en, d.label_te, d.label_hi)}
              </option>
            ))}
          </select>
        </div>

        <p className={`text-xs text-muted ${getFontClass()}`}>
          {pick(
            'Escalation Threshold: 10 Citizen Votes -> Unlocks 1902 / Collectorate & NGO Brief',
            'ఎస్కలేషన్ లక్ష్యం: 10 ఓట్లు -> 1902 / కలెక్టరేట్ & NGO నివేదిక అన్‌లాక్',
            'एस्केलेशन सीमा: 10 नागरिक वोट -> 1902 / कलेक्टरेट व NGO डोज़ियर अनलॉक'
          )}
        </p>
      </div>

      {/* Radix Tabs: Proposals & Voting vs Local Community Chat */}
      <Tabs.Root value={activeTab} onValueChange={handleTabChange} className="space-y-5">
        <Tabs.List
          aria-label="Community Hub Sections"
          className="flex flex-wrap gap-2 border-b border-border pb-2"
        >
          <Tabs.Trigger
            value="proposals"
            className={`min-h-[44px] px-4 py-2 rounded-lg text-sm font-bold inline-flex items-center gap-2 transition-colors data-[state=active]:bg-primary data-[state=active]:text-white data-[state=inactive]:bg-white data-[state=inactive]:text-body border border-border ${getFontClass()}`}
          >
            <Megaphone className="h-4 w-4" aria-hidden="true" />
            <span>
              {pick(
                `Scheme Proposals & Voting (${filteredProposals.length})`,
                `పథకాల ప్రతిపాదనలు & ఓటింగ్ (${filteredProposals.length})`,
                `योजना प्रस्ताव व मतदान (${filteredProposals.length})`
              )}
            </span>
          </Tabs.Trigger>

          <Tabs.Trigger
            value="chat"
            className={`min-h-[44px] px-4 py-2 rounded-lg text-sm font-bold inline-flex items-center gap-2 transition-colors data-[state=active]:bg-primary data-[state=active]:text-white data-[state=inactive]:bg-white data-[state=inactive]:text-body border border-border ${getFontClass()}`}
          >
            <MessageSquare className="h-4 w-4" aria-hidden="true" />
            <span>
              {pick(
                `Local Citizen Chat (${filteredMessages.length})`,
                `స్థానిక ప్రజా చర్చ (${filteredMessages.length})`,
                `स्थानीय नागरिक चैट (${filteredMessages.length})`
              )}
            </span>
          </Tabs.Trigger>
        </Tabs.List>

        {/* TAB 1: Scheme Proposals & Escalation Voting */}
        <Tabs.Content value="proposals" className="space-y-4 focus:outline-none">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredProposals.map((prop) => {
              const hasVoted = Boolean(votedProposalIds[prop.id]);
              const isEscalationReady = prop.upvotes_count >= prop.escalation_threshold;
              const pct = Math.min(
                100,
                Math.round((prop.upvotes_count / prop.escalation_threshold) * 100)
              );

              return (
                <Card
                  key={prop.id}
                  className={`border-2 flex flex-col justify-between ${
                    isEscalationReady
                      ? 'border-emerald-500/80 bg-white shadow-sm'
                      : 'border-border bg-white'
                  }`}
                >
                  <CardHeader className="pb-2 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <Badge variant="secondary" className="text-xs font-semibold">
                        {prop.district} • {prop.category.toUpperCase()}
                      </Badge>

                      {isEscalationReady ? (
                        <Badge className="bg-emerald-100 text-emerald-950 border border-emerald-400 text-xs font-bold">
                          {pick(
                            'Escalation Ready (10+ Votes)',
                            'ఎస్కలేషన్ సిద్ధం (10+ ఓట్లు)',
                            'एस्केलेशन तैयार (10+ वोट)'
                          )}
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-100 text-amber-950 border border-amber-300 text-xs font-semibold">
                          {prop.upvotes_count} / {prop.escalation_threshold}{' '}
                          {pick('Votes', 'ఓట్లు', 'वोट')}
                        </Badge>
                      )}
                    </div>

                    <CardTitle className={`text-base sm:text-lg font-extrabold text-primary leading-snug ${getFontClass()}`}>
                      {prop.title}
                    </CardTitle>
                    <p className="text-[11px] font-medium text-muted">
                      {pick('Raised by:', 'ప్రతిపాదించిన వారు:', 'प्रस्तावक:')}{' '}
                      {prop.author_persona_label} •{' '}
                      {pick('Target:', 'లక్ష్య వర్గం:', 'समूह:')} {prop.target_cohort}
                    </p>
                  </CardHeader>

                  <CardContent className="space-y-4 pt-1">
                    <p className={`text-xs sm:text-sm text-body leading-relaxed ${getFontClass()}`}>
                      {prop.description}
                    </p>

                    {/* Vote Progress Bar */}
                    <div className="space-y-1">
                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          style={{ width: `${pct}%` }}
                          className={`h-full transition-all ${
                            isEscalationReady ? 'bg-emerald-600' : 'bg-amber-500'
                          }`}
                        />
                      </div>
                      <p className="text-[11px] text-muted flex justify-between">
                        <span>
                          {prop.upvotes_count}{' '}
                          {pick('community votes', 'ప్రజల ఓట్లు', 'सामुदायिक वोट')}
                        </span>
                        <span>
                          {isEscalationReady
                            ? pick(
                                'Ready for Collectorate / 1902 / NGO',
                                '1902 / కలెక్టరేట్ / NGO కి సిద్ధం',
                                '1902 / कलेक्टरेट / NGO हेतु तैयार'
                              )
                            : `${prop.escalation_threshold - prop.upvotes_count} ${pick(
                                'more to escalate',
                                'ఓట్లు అవసరం',
                                'वोट और चाहिए'
                              )}`}
                        </span>
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <Button
                        type="button"
                        variant={hasVoted ? 'outline' : 'default'}
                        onClick={() => handleUpvote(prop)}
                        disabled={hasVoted}
                        className={`min-h-[42px] text-xs sm:text-sm font-bold ${getFontClass()}`}
                      >
                        <ThumbsUp className="h-4 w-4 mr-1.5" aria-hidden="true" />
                        {hasVoted
                          ? `${pick('Voted', 'ఓటు వేశారు', 'वोट दिया')} (${prop.upvotes_count})`
                          : `${pick('+1 Vote to Escalate', '+1 ఓటు వేయండి', '+1 वोट दें')} (${prop.upvotes_count})`}
                      </Button>

                      {isEscalationReady && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setDossierProposal(prop)}
                          className={`min-h-[42px] text-xs sm:text-sm font-bold border-emerald-600 text-emerald-900 bg-emerald-50 hover:bg-emerald-100 ${getFontClass()}`}
                        >
                          <FileText className="h-4 w-4 mr-1.5 text-emerald-700" aria-hidden="true" />
                          {pick(
                            'Open Escalation Dossier',
                            'ఎస్కలేషన్ నివేదిక తెరవండి',
                            'एस्केलेशन डोज़ियर खोलें'
                          )}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </Tabs.Content>

        {/* TAB 2: Local Citizen Community Chat */}
        <Tabs.Content value="chat" className="space-y-5 focus:outline-none">
          {/* Chat Compose Card */}
          <Card className="border-indigo-200 bg-indigo-50/30">
            <CardContent className="p-4 sm:p-5">
              <form onSubmit={handleSendChat} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="chat-persona-role"
                      className="block text-xs font-bold text-primary mb-1"
                    >
                      {pick(
                        'Your Anonymous Role Tag (No Real Name)',
                        'మీ అజ్ఞాత పాత్ర (పేరు అవసరం లేదు)',
                        'आपकी गुमनाम भूमिका (नाम आवश्यक नहीं)'
                      )}
                    </label>
                    <select
                      id="chat-persona-role"
                      value={personaRole}
                      onChange={(e) => setPersonaRole(e.target.value)}
                      className="w-full min-h-[40px] rounded-md border border-input bg-white px-3 text-xs font-medium text-body"
                    >
                      {PERSONA_ROLES.map((r) => (
                        <option key={r.value} value={r.value}>
                          {pick(r.en, r.te, r.hi)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="chat-district-select"
                      className="block text-xs font-bold text-primary mb-1"
                    >
                      {pick('Local District Channel', 'మీ జిల్లా ఛానల్', 'आपका जिला चैनल')}
                    </label>
                    <select
                      id="chat-district-select"
                      value={chatDistrict}
                      onChange={(e) => setChatDistrict(e.target.value)}
                      className="w-full min-h-[40px] rounded-md border border-input bg-white px-3 text-xs font-medium text-body"
                    >
                      {AP_DISTRICT_OPTIONS.map((d) => (
                        <option key={d.value} value={d.value}>
                          {pick(d.label_en, d.label_te, d.label_hi)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="chat-message-box" className="sr-only">
                    Community message
                  </label>
                  <textarea
                    id="chat-message-box"
                    rows={3}
                    maxLength={550}
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder={pick(
                      'Share a local Sachivalayam tip, ask fellow citizens about document steps, or discuss a missing scheme (Never post Aadhaar or phone numbers)…',
                      'సచివాలయ సూచనలు పంచుకోండి, పత్రాల సందేహాలు అడగండి లేదా కొత్త పథకం గురించి చర్చించండి (ఆధార్/ఫోన్ రాయవద్దు)…',
                      'सचिवालय अनुभव साझा करें, दस्तावेज़ सवाल पूछें या नई योजना पर चर्चा करें (आधार/फ़ोन न लिखें)…'
                    )}
                    className={`w-full rounded-lg border border-input bg-white p-3 text-xs sm:text-sm text-body focus:outline-none focus:ring-2 focus:ring-focus ${getFontClass()}`}
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2">
                  {liveChatPii.hasPii ? (
                    <span className="text-xs font-bold text-rose-700 inline-flex items-center gap-1.5">
                      <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
                      {pick(
                        'Blocked: Sensitive Aadhaar / phone / bank digits detected.',
                        'నిలిపివేయబడింది: ఆధార్ / ఫోన్ అంకెలు తొలగించండి.',
                        'रोका गया: संवेदनशील नंबर हटाएं।'
                      )}
                    </span>
                  ) : (
                    <span className="text-[11px] text-emerald-800 inline-flex items-center gap-1.5">
                      <ShieldCheck className="h-4 w-4 text-emerald-700 shrink-0" aria-hidden="true" />
                      {pick(
                        'Live PII Shield Active: Personal IDs & phone numbers are blocked automatically.',
                        'PII షీల్డ్ ఆన్ ఉంది: ఆధార్ & ఫోన్ నంబర్లు ఆటోమేటిక్‌గా నిరోధించబడతాయి.',
                        'PII शील्ड सक्रिय: व्यक्तिगत नंबर स्वतः ब्लॉक किए जाते हैं।'
                      )}
                    </span>
                  )}

                  <Button
                    type="submit"
                    disabled={postingChat || liveChatPii.hasPii || !chatInput.trim()}
                    className={`min-h-[42px] font-bold ${getFontClass()}`}
                  >
                    <Send className="h-4 w-4 mr-1.5" aria-hidden="true" />
                    {postingChat
                      ? pick('Posting…', 'పోస్ట్ అవుతోంది…', 'पोस्ट हो रहा है…')
                      : pick('Post to Community', 'చర్చలో పోస్ట్ చేయండి', 'समुदाय में पोस्ट करें')}
                  </Button>
                </div>

                {chatError && (
                  <p role="alert" className="text-xs font-bold text-rose-700">
                    {chatError}
                  </p>
                )}
              </form>
            </CardContent>
          </Card>

          {/* Messages Feed */}
          <div className="space-y-3">
            {filteredMessages.map((msg) => (
              <Card key={msg.id} className="border-border bg-white">
                <CardContent className="p-4 space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs font-bold text-primary">
                        {msg.author_persona_label}
                      </Badge>
                      <Badge variant="secondary" className="text-[11px]">
                        {msg.district}
                      </Badge>
                    </div>
                    <span className="text-[11px] text-muted">
                      {new Date(msg.created_at).toISOString().slice(0, 10)}
                    </span>
                  </div>

                  <p className={`text-xs sm:text-sm text-body leading-relaxed ${getFontClass()}`}>
                    {msg.message_body}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => markMessageHelpful(msg.id)}
                      className="min-h-[36px] text-xs"
                    >
                      <ThumbsUp className="h-3.5 w-3.5 mr-1.5 text-emerald-700" aria-hidden="true" />
                      {pick('Helpful', 'ఉపయోగకరం', 'उपयोगी')} ({msg.helpful_count})
                    </Button>

                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setPrefillProposalText(msg.message_body);
                        setRaiseModalOpen(true);
                      }}
                      className="min-h-[36px] text-xs text-indigo-800 hover:bg-indigo-50 font-semibold"
                    >
                      <Sparkles className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
                      {pick(
                        'Turn into Scheme Proposal',
                        'కొత్త పథకం ప్రతిపాదనగా మార్చండి',
                        'योजना प्रस्ताव में बदलें'
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </Tabs.Content>
      </Tabs.Root>

      <RaiseGapModal
        open={raiseModalOpen}
        onOpenChange={setRaiseModalOpen}
        prefillText={prefillProposalText}
        onCreated={() => {
          setActiveTab('proposals');
        }}
      />

      {dossierProposal && (
        <EscalationDossierModal
          open={Boolean(dossierProposal)}
          onOpenChange={(isOpen) => {
            if (!isOpen) setDossierProposal(null);
          }}
          proposal={dossierProposal}
        />
      )}
    </div>
  );
};
