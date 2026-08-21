"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { ArrowLeft, ArrowRight, Database, FileSpreadsheet, Heart, ShieldCheck, Sparkles, TreePine, UsersRound } from "lucide-react";
import LanguageSwitcher from "./LanguageSwitcher";
import { Member, Relationship } from "../lib/types";
import { NetworkSettings, NETWORK_TEMPLATES } from "../lib/network";
import { useLanguage } from "../lib/i18n";
const ImportModal = dynamic(() => import("./ImportModal"), { ssr: false });

const SETUP_COPY = {
  en: { brand:"Our Family", madeFor:"Made for every generation", hero:"A beautiful home for your whole family.", heroCopy:"Bring names, relationships, photographs and memories together in a private family space that everyone can understand.", simple:"Simple for every relative", privacy:"Your family controls privacy", excel:"Easy Excel guidance included", step1:"Name your family", step2:"Add your people", begin:"Let’s begin", create:"Create your family space", intro:"Start with a familiar name. You can add photographs and more details after your family is created.", familyName:"What should we call your family?", familyPlaceholder:"e.g. The Nandra Family", familyHelp:"This is what relatives will see at the top of every page.", description:"Say something about your family", optional:"optional", descriptionPlaceholder:"A place for our family stories, relationships and memories…", continue:"Continue", back:"Back", howBegin:"How would you like to begin?", choose:"Choose the easiest option for you. Nothing is shared until you confirm it.", best:"Best for an existing list", useExcel:"Use our family Excel", useExcelCopy:"Download the guided template, fill it at your pace, then preview every person and relationship before import.", openExcel:"Open Excel guide", few:"Start with a few relatives", fewCopy:"Begin empty, add yourself and close family, then invite others to help.", createFamily:"Create family", sample:"Explore a sample family", sampleCopy:"See how a large, multi-generation family looks before adding your own information.", viewSample:"View sample", control:"Your information stays in your control.", controlCopy:"Private contact details and family-only photographs are never shown on public pages." },
  hi: { brand:"हमारा परिवार", madeFor:"हर पीढ़ी के लिए बनाया गया", hero:"आपके पूरे परिवार का सुंदर घर।", heroCopy:"नाम, रिश्ते, तस्वीरें और यादें एक सुरक्षित पारिवारिक स्थान पर साथ लाएँ, जिसे हर कोई आसानी से समझ सके।", simple:"हर रिश्तेदार के लिए आसान", privacy:"गोपनीयता आपके परिवार के नियंत्रण में", excel:"आसान Excel मार्गदर्शन", step1:"परिवार का नाम", step2:"सदस्य जोड़ें", begin:"चलिए शुरू करें", create:"अपना परिवार बनाएँ", intro:"एक परिचित नाम से शुरुआत करें। तस्वीरें और अधिक जानकारी बाद में जोड़ सकते हैं।", familyName:"आप अपने परिवार को क्या नाम देना चाहेंगे?", familyPlaceholder:"जैसे नंदरा परिवार", familyHelp:"यही नाम हर पेज के ऊपर रिश्तेदारों को दिखाई देगा।", description:"अपने परिवार के बारे में कुछ लिखें", optional:"वैकल्पिक", descriptionPlaceholder:"हमारे रिश्तों, कहानियों और यादों के लिए एक जगह…", continue:"आगे बढ़ें", back:"वापस", howBegin:"आप कैसे शुरुआत करना चाहेंगे?", choose:"जो तरीका सबसे आसान लगे उसे चुनें। पुष्टि से पहले कुछ भी साझा नहीं होगा।", best:"मौजूदा सूची के लिए सबसे अच्छा", useExcel:"हमारा पारिवारिक Excel उपयोग करें", useExcelCopy:"मार्गदर्शित टेम्पलेट डाउनलोड करें, आराम से भरें और जोड़ने से पहले हर व्यक्ति व रिश्ता देखें।", openExcel:"Excel मार्गदर्शिका खोलें", few:"कुछ रिश्तेदारों से शुरू करें", fewCopy:"खाली परिवार बनाएँ, खुद और करीबी रिश्तेदार जोड़ें, फिर दूसरों को आमंत्रित करें।", createFamily:"परिवार बनाएँ", sample:"नमूना परिवार देखें", sampleCopy:"अपनी जानकारी जोड़ने से पहले देखें कि कई पीढ़ियों वाला बड़ा परिवार कैसा दिखता है।", viewSample:"नमूना देखें", control:"आपकी जानकारी आपके नियंत्रण में है।", controlCopy:"निजी संपर्क और परिवार की तस्वीरें सार्वजनिक पेज पर नहीं दिखाई जातीं।" },
  mr: { brand:"आपले कुटुंब", madeFor:"प्रत्येक पिढीसाठी बनवलेले", hero:"आपल्या संपूर्ण कुटुंबासाठी एक सुंदर घर.", heroCopy:"नावे, नाती, छायाचित्रे आणि आठवणी एका सुरक्षित कौटुंबिक जागेत एकत्र आणा, जी प्रत्येकाला सहज समजेल.", simple:"प्रत्येक नातेवाईकासाठी सोपे", privacy:"गोपनीयता कुटुंबाच्या नियंत्रणात", excel:"सोपे Excel मार्गदर्शन", step1:"कुटुंबाचे नाव", step2:"सदस्य जोडा", begin:"चला सुरुवात करूया", create:"आपली कौटुंबिक जागा तयार करा", intro:"ओळखीच्या नावाने सुरुवात करा. छायाचित्रे आणि अधिक माहिती नंतर जोडता येईल.", familyName:"आपल्या कुटुंबाला काय नाव द्यायचे?", familyPlaceholder:"उदा. नंदरा कुटुंब", familyHelp:"हे नाव प्रत्येक पानाच्या वर नातेवाईकांना दिसेल.", description:"कुटुंबाबद्दल थोडे लिहा", optional:"ऐच्छिक", descriptionPlaceholder:"आपल्या नाती, कथा आणि आठवणींसाठी एक जागा…", continue:"पुढे", back:"मागे", howBegin:"आपण सुरुवात कशी करू इच्छिता?", choose:"आपल्याला सर्वात सोपा पर्याय निवडा. पुष्टी करेपर्यंत काहीही सामायिक होणार नाही.", best:"आधीपासून यादी असल्यास सर्वोत्तम", useExcel:"आमचे कुटुंब Excel वापरा", useExcelCopy:"मार्गदर्शित नमुना डाउनलोड करा, निवांत भरा आणि जोडण्याआधी प्रत्येक व्यक्ती व नाते तपासा.", openExcel:"Excel मार्गदर्शक उघडा", few:"काही नातेवाईकांपासून सुरू करा", fewCopy:"रिकामे कुटुंब तयार करा, स्वतःला व जवळच्या नातेवाईकांना जोडा, मग इतरांना आमंत्रित करा.", createFamily:"कुटुंब तयार करा", sample:"नमुना कुटुंब पहा", sampleCopy:"आपली माहिती जोडण्यापूर्वी मोठे, अनेक पिढ्यांचे कुटुंब कसे दिसते ते पहा.", viewSample:"नमुना पहा", control:"आपली माहिती आपल्या नियंत्रणात आहे.", controlCopy:"खाजगी संपर्क आणि कुटुंबातील छायाचित्रे सार्वजनिक पानांवर दाखवली जात नाहीत." },
} as const;

type Props = {
  onCreate: (settings: NetworkSettings, mode: "empty" | "demo" | "import", members?: Member[], relationships?: Relationship[]) => Promise<void> | void;
  shared: boolean;
  canSetup: boolean;
};

export default function SetupScreen({ onCreate, shared, canSetup }: Props) {
  const { language } = useLanguage();
  const c = SETUP_COPY[language];
  const nameError = language === "hi" ? "कृपया अपने परिवार को एक नाम दें।" : language === "mr" ? "कृपया आपल्या कुटुंबाला नाव द्या." : "Please give your family space a name.";
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [error, setError] = useState("");
  const familyTemplate = NETWORK_TEMPLATES.find((item) => item.id === "family") || NETWORK_TEMPLATES[0];

  const create = async (mode: "empty" | "demo" | "import", members: Member[] = [], relationships: Relationship[] = []) => {
    setError("");
    if (!name.trim()) { setStep(1); setError(nameError); return; }
    setBusy(true);
    try {
      await onCreate({ id: "network", name: name.trim(), description: description.trim(), entity_label: familyTemplate.entity_label, entity_label_plural: familyTemplate.entity_label_plural, level_label: familyTemplate.level_label, level_label_plural: familyTemplate.level_label_plural, parent_label: familyTemplate.parent_label, child_label: familyTemplate.child_label, peer_label: familyTemplate.peer_label, network_template: "family" }, mode, members, relationships);
    } catch (e: any) {
      setError(e.message || "We could not create your family space. Please try again.");
    } finally { setBusy(false); }
  };

  const continueSetup = () => {
    if (!name.trim()) { setError(nameError); return; }
    setError(""); setStep(2);
  };

  return <div className="family-onboarding">
    <div className="onboarding-decor decor-one" /><div className="onboarding-decor decor-two" />
    <header className="onboarding-topbar">
      <div className="onboarding-brand"><span><TreePine size={20} /></span> {c.brand}</div>
      <LanguageSwitcher />
    </header>
    <main className="onboarding-wrap">
      <section className="onboarding-story">
        <span className="warm-kicker"><Heart size={13} fill="currentColor" /> {c.madeFor}</span>
        <h1>{c.hero}</h1>
        <p>{c.heroCopy}</p>
        <div className="onboarding-promises">
          <span><UsersRound /> {c.simple}</span><span><ShieldCheck /> {c.privacy}</span><span><FileSpreadsheet /> {c.excel}</span>
        </div>
      </section>
      <section className="onboarding-card">
        <div className="setup-progress" aria-label={`Step ${step} of 2`}><span className={step >= 1 ? "active" : ""}><b>1</b> {c.step1}</span><i /><span className={step >= 2 ? "active" : ""}><b>2</b> {c.step2}</span></div>
        {step === 1 ? <>
          <div className="setup-heading"><div className="brand-mark"><TreePine size={24} /></div><div><span className="setup-eyebrow">{c.begin}</span><h2>{c.create}</h2></div></div>
          <p className="setup-intro">{c.intro}</p>
          <div className="field spacious"><label htmlFor="family-name">{c.familyName}</label><input id="family-name" className="text-input" value={name} onChange={(event) => setName(event.target.value)} placeholder={c.familyPlaceholder} autoFocus aria-describedby="family-name-help" onKeyDown={(event) => event.key === "Enter" && continueSetup()} /><small id="family-name-help">{c.familyHelp}</small></div>
          <div className="field spacious"><label htmlFor="family-description">{c.description} <em>{c.optional}</em></label><textarea id="family-description" className="text-input" rows={3} value={description} onChange={(event) => setDescription(event.target.value)} placeholder={c.descriptionPlaceholder} /></div>
          {shared && !canSetup && <div className="notice"><Database size={15} /> Ask a family administrator to complete this first-time setup.</div>}
          {error && <div className="notice danger-text">{error}</div>}
          <button className="btn primary setup-next" disabled={!canSetup} onClick={continueSetup}>{c.continue} <ArrowRight size={17} /></button>
        </> : <>
          <button className="setup-back" onClick={() => setStep(1)}><ArrowLeft size={15} /> {c.back}</button>
          <div className="setup-heading compact-heading"><div><span className="setup-eyebrow">{name}</span><h2>{c.howBegin}</h2></div></div>
          <p className="setup-intro">{c.choose}</p>
          <div className="family-start-options">
            <button className="family-start-card recommended" disabled={busy || !canSetup} onClick={() => setShowImport(true)}><span className="start-icon"><FileSpreadsheet /></span><span className="recommended-pill">{c.best}</span><strong>{c.useExcel}</strong><small>{c.useExcelCopy}</small><b>{c.openExcel} <ArrowRight size={15} /></b></button>
            <button className="family-start-card" disabled={busy || !canSetup} onClick={() => create("empty")}><span className="start-icon"><UsersRound /></span><strong>{c.few}</strong><small>{c.fewCopy}</small><b>{c.createFamily} <ArrowRight size={15} /></b></button>
            <button className="family-start-card" disabled={busy || !canSetup} onClick={() => create("demo")}><span className="start-icon"><Sparkles /></span><strong>{c.sample}</strong><small>{c.sampleCopy}</small><b>{c.viewSample} <ArrowRight size={15} /></b></button>
          </div>
          <div className="setup-privacy"><ShieldCheck size={17} /><span><b>{c.control}</b> {c.controlCopy}</span></div>
          {error && <div className="notice danger-text">{error}</div>}
        </>}
      </section>
    </main>
    {showImport && <ImportModal onClose={() => setShowImport(false)} onImport={(members, relationships) => { setShowImport(false); create("import", members, relationships); }} />}
  </div>;
}
