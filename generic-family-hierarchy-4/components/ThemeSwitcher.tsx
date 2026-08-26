"use client";
import {Moon,Palette,Sun} from "lucide-react";
import {useTheme,type AppTheme} from "./ThemeProvider";

const OPTIONS:{value:AppTheme;label:string;icon:typeof Sun}[]=[
 {value:"light",label:"Light",icon:Sun},
 {value:"dark",label:"Dark",icon:Moon},
 {value:"aurora",label:"Aurora",icon:Palette},
];

export default function ThemeSwitcher({compact=false}:{compact?:boolean}){
 const {theme,setTheme}=useTheme();
 return <div className={`theme-switcher ${compact?"compact":""}`} role="group" aria-label="Appearance">
  {OPTIONS.map(({value,label,icon:Icon})=><button key={value} type="button" className={theme===value?"active":""} onClick={()=>setTheme(value)} title={`${label} theme`} aria-label={`${label} theme`} aria-pressed={theme===value}><Icon size={14}/>{!compact&&<span>{label}</span>}</button>)}
 </div>;
}
