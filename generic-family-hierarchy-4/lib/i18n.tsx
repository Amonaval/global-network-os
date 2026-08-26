"use client";

import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";

export type LanguageCode = "en" | "hi" | "mr";

export const LANGUAGES: { code: LanguageCode; label: string }[] = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी" },
  { code: "mr", label: "मराठी" },
];

const messages = {
  en: { familyTree:"Family Tree", familyDirectory:"Family", timeline:"Timeline", stories:"Stories", places:"Places", familySettings:"Family settings", guide:"Help", addRelative:"Add relative", myProfile:"My profile", searchFamily:"Search by name, city or profession…", yourFamilyTogether:"Your family, together", welcomeCopy:"Explore your generations, find someone you love, and preserve the stories that connect you.", people:"people", generations:"generations", connections:"connections", findSomeone:"Find someone", exploreTree:"Explore tree", recentMoments:"Recent moments", chooseLanguage:"Language", sharedFamily:"Shared family", localFamily:"Private preview", signOut:"Sign out", publicPreview:"Public preview", memberView:"Family member view", adminView:"Family admin view", loading:"Bringing your family together…", familyProfile:"Family profile", profession:"Profession", location:"Location", generation:"Generation", birthday:"Birthday", notAdded:"Not added yet", privateContact:"Contact details are shared only with people this family has allowed.", lifeJourney:"Life journey", memories:"Memories", familyConnections:"Family connections", viewInTree:"View in family tree", howRelated:"How am I related?", editProfile:"Update profile", manageRelationships:"Update relationships" },
  hi: { familyTree:"परिवार वृक्ष", familyDirectory:"परिवार", timeline:"समयरेखा", stories:"कहानियाँ", places:"स्थान", familySettings:"परिवार सेटिंग", guide:"सहायता", addRelative:"रिश्तेदार जोड़ें", myProfile:"मेरी प्रोफ़ाइल", searchFamily:"नाम, शहर या पेशे से खोजें…", yourFamilyTogether:"आपका परिवार, एक साथ", welcomeCopy:"पीढ़ियों को जानें, अपनों को खोजें और परिवार को जोड़ने वाली यादें सहेजें।", people:"सदस्य", generations:"पीढ़ियाँ", connections:"रिश्ते", findSomeone:"किसी को खोजें", exploreTree:"परिवार वृक्ष देखें", recentMoments:"नई यादें", chooseLanguage:"भाषा", sharedFamily:"साझा परिवार", localFamily:"निजी झलक", signOut:"साइन आउट", publicPreview:"सार्वजनिक झलक", memberView:"परिवार सदस्य दृश्य", adminView:"परिवार प्रबंधक दृश्य", loading:"आपके परिवार को एक साथ ला रहे हैं…", familyProfile:"परिवार प्रोफ़ाइल", profession:"पेशा", location:"स्थान", generation:"पीढ़ी", birthday:"जन्मदिन", notAdded:"अभी नहीं जोड़ा गया", privateContact:"संपर्क जानकारी केवल परिवार द्वारा अनुमति प्राप्त लोगों को दिखाई जाती है।", lifeJourney:"जीवन यात्रा", memories:"यादें", familyConnections:"पारिवारिक रिश्ते", viewInTree:"परिवार वृक्ष में देखें", howRelated:"हमारा रिश्ता क्या है?", editProfile:"प्रोफ़ाइल अपडेट करें", manageRelationships:"रिश्ते अपडेट करें" },
  mr: { familyTree:"कुटुंब वृक्ष", familyDirectory:"कुटुंब", timeline:"कालरेषा", stories:"आठवणी", places:"ठिकाणे", familySettings:"कुटुंब सेटिंग", guide:"मदत", addRelative:"नातेवाईक जोडा", myProfile:"माझी प्रोफाइल", searchFamily:"नाव, शहर किंवा व्यवसायाने शोधा…", yourFamilyTogether:"आपले कुटुंब, एकत्र", welcomeCopy:"पिढ्या जाणून घ्या, आपल्या माणसांना शोधा आणि कुटुंबाला जोडणाऱ्या आठवणी जपा.", people:"सदस्य", generations:"पिढ्या", connections:"नाती", findSomeone:"कोणाला तरी शोधा", exploreTree:"कुटुंब वृक्ष पहा", recentMoments:"नवीन आठवणी", chooseLanguage:"भाषा", sharedFamily:"सामायिक कुटुंब", localFamily:"खाजगी झलक", signOut:"साइन आउट", publicPreview:"सार्वजनिक झलक", memberView:"कुटुंब सदस्य दृश्य", adminView:"कुटुंब व्यवस्थापक दृश्य", loading:"आपले कुटुंब एकत्र आणत आहोत…", familyProfile:"कुटुंब प्रोफाइल", profession:"व्यवसाय", location:"ठिकाण", generation:"पिढी", birthday:"वाढदिवस", notAdded:"अजून जोडलेले नाही", privateContact:"संपर्क माहिती फक्त कुटुंबाने परवानगी दिलेल्या लोकांनाच दिसते.", lifeJourney:"जीवन प्रवास", memories:"आठवणी", familyConnections:"कौटुंबिक नाती", viewInTree:"कुटुंब वृक्षात पहा", howRelated:"आपले नाते काय?", editProfile:"प्रोफाइल अपडेट करा", manageRelationships:"नाती अपडेट करा" },
} as const;

type MessageKey = keyof typeof messages.en;
type LanguageContextValue = { language: LanguageCode; setLanguage: (language: LanguageCode) => void; t: (key: MessageKey) => string };
const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>("en");
  useEffect(() => {
    const saved = localStorage.getItem("family-language") as LanguageCode | null;
    if (saved && LANGUAGES.some((item) => item.code === saved)) {
      setLanguageState(saved);
      document.documentElement.lang = saved;
    } else document.documentElement.lang = "en";
  }, []);
  const setLanguage = (next: LanguageCode) => {
    setLanguageState(next);
    localStorage.setItem("family-language", next);
    document.documentElement.lang = next;
  };
  const value = useMemo(() => ({ language, setLanguage, t: (key: MessageKey) => messages[language][key] || messages.en[key] }), [language]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
}
