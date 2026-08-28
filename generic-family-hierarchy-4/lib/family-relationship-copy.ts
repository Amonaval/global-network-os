export type FamilyCopyLanguage = "en" | "hi" | "mr";

const EXACT: Record<FamilyCopyLanguage, Record<string, string>> = {
  en: {
    You: "You", Father: "Father", Mother: "Mother", Parent: "Parent", Son: "Son", Daughter: "Daughter", Child: "Child",
    Husband: "Husband", Wife: "Wife", Partner: "Partner", Grandfather: "Grandfather", Grandmother: "Grandmother", Grandparent: "Grandparent",
    Grandson: "Grandson", Granddaughter: "Granddaughter", Grandchild: "Grandchild", Brother: "Brother", Sister: "Sister", Sibling: "Sibling",
    Uncle: "Uncle", Aunt: "Aunt", "Aunt / Uncle": "Aunt / Uncle", Nephew: "Nephew", Niece: "Niece", "Niece / Nephew": "Niece / Nephew",
    Cousin: "Cousin", "Close family": "Close family", "Family relative": "Family relative",
  },
  hi: {
    You: "आप", Father: "पिता", Mother: "माता", Parent: "माता-पिता", Son: "बेटा", Daughter: "बेटी", Child: "संतान",
    Husband: "पति", Wife: "पत्नी", Partner: "जीवनसाथी", Grandfather: "दादा/नाना", Grandmother: "दादी/नानी", Grandparent: "दादा-दादी/नाना-नानी",
    Grandson: "पोता/नाती", Granddaughter: "पोती/नातिन", Grandchild: "पोता/पोती", Brother: "भाई", Sister: "बहन", Sibling: "भाई/बहन",
    Uncle: "चाचा/मामा", Aunt: "चाची/मौसी", "Aunt / Uncle": "चाचा/मामा/मौसी", Nephew: "भतीजा/भांजा", Niece: "भतीजी/भांजी", "Niece / Nephew": "भतीजा/भांजा/भतीजी/भांजी",
    Cousin: "कज़िन", "Close family": "करीबी परिवार", "Family relative": "परिवार के रिश्तेदार",
  },
  mr: {
    You: "तुम्ही", Father: "वडील", Mother: "आई", Parent: "आई-वडील", Son: "मुलगा", Daughter: "मुलगी", Child: "अपत्य",
    Husband: "पती", Wife: "पत्नी", Partner: "जीवनसाथी", Grandfather: "आजोबा", Grandmother: "आजी", Grandparent: "आजी-आजोबा",
    Grandson: "नातू", Granddaughter: "नात", Grandchild: "नातवंड", Brother: "भाऊ", Sister: "बहीण", Sibling: "भाऊ/बहीण",
    Uncle: "काका/मामा", Aunt: "काकू/मावशी", "Aunt / Uncle": "काका/मामा/मावशी", Nephew: "पुतण्या/भाचा", Niece: "पुतणी/भाची", "Niece / Nephew": "पुतण्या/भाचा/पुतणी/भाची",
    Cousin: "चुलत/मामे नातेवाईक", "Close family": "जवळचे कुटुंब", "Family relative": "कुटुंबातील नातेवाईक",
  },
};

export function localizeRelationshipLabel(label: string | null | undefined, language: FamilyCopyLanguage): string {
  if (!label) return language === "hi" ? "परिवार के रिश्तेदार" : language === "mr" ? "कुटुंबातील नातेवाईक" : "Family relative";
  if (EXACT[language][label]) return EXACT[language][label];
  if (/cousin/i.test(label)) return EXACT[language].Cousin;
  return label;
}

export function relationshipSentence(name: string, label: string | null | undefined, language: FamilyCopyLanguage): string {
  const localized = localizeRelationshipLabel(label, language);
  if (language === "hi") return `${name} आपके ${localized} हैं।`;
  if (language === "mr") return `${name} तुमचे ${localized} आहेत.`;
  return `${name} is your ${localized.toLowerCase()}.`;
}

export function relationBadge(label: string | null | undefined, language: FamilyCopyLanguage): string {
  const localized = localizeRelationshipLabel(label, language);
  if (label === "You") return language === "hi" ? "यह आप हैं" : language === "mr" ? "हे तुम्ही आहात" : "This is you";
  return language === "hi" ? `आपके ${localized}` : language === "mr" ? `तुमचे ${localized}` : `Your ${localized.toLowerCase()}`;
}
