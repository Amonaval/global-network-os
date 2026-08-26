"use client";
import { Languages } from "lucide-react";
import { LANGUAGES, LanguageCode, useLanguage } from "../lib/i18n";

export default function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { language, setLanguage, t } = useLanguage();
  return <label className={`language-switcher${compact ? " compact" : ""}`}>
    <Languages size={16} aria-hidden="true" />
    {!compact && <span>{t("chooseLanguage")}</span>}
    <select value={language} onChange={(event) => setLanguage(event.target.value as LanguageCode)} aria-label={t("chooseLanguage")}>
      {LANGUAGES.map((item) => <option key={item.code} value={item.code}>{item.label}</option>)}
    </select>
  </label>;
}
