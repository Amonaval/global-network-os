"use client";
import {Moon,Palette,Sun} from "lucide-react";
import {useTheme,type AppTheme} from "./ThemeProvider";
import {useLanguage} from "../lib/i18n";

const OPTIONS:{value:AppTheme;icon:typeof Sun}[]=[
 {value:"light",icon:Sun},
 {value:"dark",icon:Moon},
 {value:"aurora",icon:Palette},
];

export default function ThemeSwitcher({compact=false}:{compact?:boolean}){
 const {theme,setTheme}=useTheme();
 const {language}=useLanguage();
 const copy=language==="hi"?{appearance:"रूप",light:"हल्का",dark:"गहरा",aurora:"ऑरोरा",theme:"थीम"}:language==="mr"?{appearance:"रूप",light:"हलकी",dark:"गडद",aurora:"ऑरोरा",theme:"थीम"}:{appearance:"Appearance",light:"Light",dark:"Dark",aurora:"Aurora",theme:"theme"};
 return <div className={`theme-switcher ${compact?"compact":""}`} role="group" aria-label={copy.appearance}>
  {OPTIONS.map(({value,icon:Icon})=>{const label=copy[value];return <button key={value} type="button" className={theme===value?"active":""} onClick={()=>setTheme(value)} title={`${label} ${copy.theme}`} aria-label={`${label} ${copy.theme}`} aria-pressed={theme===value}><Icon size={14}/>{!compact&&<span>{label}</span>}</button>})}
 </div>;
}
