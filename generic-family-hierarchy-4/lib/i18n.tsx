"use client";
import {createContext,ReactNode,useContext,useEffect,useMemo,useState} from "react";
import {DEFAULT_CATALOG,DEFAULT_LANGUAGE,LANGUAGES,loadCatalog,type LanguageCode,type MessageCatalog,type MessageToken} from "./i18n/catalog";
export type {LanguageCode,MessageToken};
export {LANGUAGES};
type LanguageContextValue={language:LanguageCode;setLanguage:(language:LanguageCode)=>void;t:(key:MessageToken)=>string};
const LanguageContext=createContext<LanguageContextValue|null>(null);
export function LanguageProvider({children}:{children:ReactNode}){
 const [language,setLanguageState]=useState<LanguageCode>(DEFAULT_LANGUAGE);
 const [catalog,setCatalog]=useState<MessageCatalog>(DEFAULT_CATALOG);
 const applyLanguage=async(next:LanguageCode)=>{const loaded=await loadCatalog(next);setCatalog(loaded);setLanguageState(next);if(typeof document!=="undefined")document.documentElement.lang=next;};
 useEffect(()=>{let active=true;const saved=typeof window!=="undefined"?window.localStorage.getItem("family-language") as LanguageCode|null:null;const next=saved&&LANGUAGES.some(x=>x.code===saved)?saved:DEFAULT_LANGUAGE;void loadCatalog(next).then(loaded=>{if(!active)return;setCatalog(loaded);setLanguageState(next);document.documentElement.lang=next;});return()=>{active=false}},[]);
 const setLanguage=(next:LanguageCode)=>{if(typeof window!=="undefined")window.localStorage.setItem("family-language",next);void applyLanguage(next)};
 const value=useMemo(()=>({language,setLanguage,t:(key:MessageToken)=>catalog[key]??DEFAULT_CATALOG[key]}),[language,catalog]);
 return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
export function useLanguage(){const context=useContext(LanguageContext);if(!context)throw new Error("useLanguage must be used within LanguageProvider");return context;}
