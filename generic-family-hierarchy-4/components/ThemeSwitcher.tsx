"use client";
import {useLanguage,type MessageToken} from "../lib/i18n";
import {Heart,Moon,Palette,Sparkles,Sun} from "lucide-react";
import {useTheme,type AppTheme} from "./ThemeProvider";

const OPTIONS:{value:AppTheme;labelKey:MessageToken;icon:typeof Sun}[]=[
 {value:"light",labelKey:"LightTxt",icon:Sun},
 {value:"warm",labelKey:"WarmThemeTxt",icon:Heart},
 {value:"modern",labelKey:"ModernThemeTxt",icon:Palette},
 {value:"aurora",labelKey:"AuroraTxt",icon:Sparkles},
 {value:"dark",labelKey:"DarkTxt",icon:Moon},
];

export default function ThemeSwitcher({compact=false}:{compact?:boolean}){
 const {t:tr}=useLanguage();
 const {theme,setTheme}=useTheme();
 return <div className={`theme-switcher ${compact?"compact":""}`} role="group" aria-label={tr("AppearanceTxt")}>
  {OPTIONS.map(({value,labelKey,icon:Icon})=>{const label=tr(labelKey);return <button key={value} type="button" className={theme===value?"active":""} onClick={()=>setTheme(value)} title={`${label} · ${tr("AppearanceTxt")}`} aria-label={`${label} · ${tr("AppearanceTxt")}`} aria-pressed={theme===value}><Icon size={14}/>{!compact&&<span>{label}</span>}</button>})}
 </div>;
}
