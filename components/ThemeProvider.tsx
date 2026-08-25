"use client";
import {createContext,useContext,useEffect,useMemo,useState,type ReactNode} from "react";

export type AppTheme="light"|"dark"|"aurora";
type ThemeContextValue={theme:AppTheme;setTheme:(theme:AppTheme)=>void};
const ThemeContext=createContext<ThemeContextValue|undefined>(undefined);
const STORAGE_KEY="network-os-theme";

function applyTheme(theme:AppTheme){
 if(typeof document==="undefined")return;
 document.documentElement.dataset.theme=theme;
 document.documentElement.style.colorScheme=theme==="dark"?"dark":"light";
}

export function ThemeProvider({children}:{children:ReactNode}){
 const [theme,setThemeState]=useState<AppTheme>("light");
 useEffect(()=>{
  const stored=window.localStorage.getItem(STORAGE_KEY) as AppTheme|null;
  const initial=stored&&["light","dark","aurora"].includes(stored)?stored:"light";
  setThemeState(initial);applyTheme(initial);
 },[]);
 const setTheme=(next:AppTheme)=>{setThemeState(next);applyTheme(next);try{window.localStorage.setItem(STORAGE_KEY,next)}catch{}};
 const value=useMemo(()=>({theme,setTheme}),[theme]);
 return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(){
 const ctx=useContext(ThemeContext);
 if(!ctx)throw new Error("useTheme must be used within ThemeProvider");
 return ctx;
}
