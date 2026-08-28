"use client";
import {DEFAULT_CATALOG} from "../lib/i18n/catalog";
import {useLanguage} from "../lib/i18n";
import {Moon,Palette,Sun} from "lucide-react";
import {useTheme,type AppTheme} from "./ThemeProvider";

const OPTIONS:{value:AppTheme;label:string;icon:typeof Sun}[]=[
 {value:"light",label:DEFAULT_CATALOG.LightTxt,icon:Sun},
 {value:"dark",label:DEFAULT_CATALOG.DarkTxt,icon:Moon},
 {value:"aurora",label:DEFAULT_CATALOG.AuroraTxt,icon:Palette},
];

export default function ThemeSwitcher({compact=false}:{compact?:boolean}){
 const {t:tr}=useLanguage();
 const {theme,setTheme}=useTheme();
 return <div className={`theme-switcher ${compact?"compact":""}`} role="group" aria-label={tr("AppearanceTxt")}>
  {OPTIONS.map(({value,label,icon:Icon})=><button key={value} type="button" className={theme===value?"active":""} onClick={()=>setTheme(value)} title={`${label} theme`} aria-label={`${label} theme`} aria-pressed={theme===value}><Icon size={14}/>{!compact&&<span>{label}</span>}</button>)}
 </div>;
}
