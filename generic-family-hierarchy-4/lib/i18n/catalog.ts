import {en,type MessageCatalog,type MessageToken} from "./messages/en";
export type LanguageCode="en"|"hi"|"mr";
export type LocaleCatalog=Partial<MessageCatalog>;
export const LANGUAGES:{code:LanguageCode;label:string}[]=[{code:"en",label:"English"},{code:"hi",label:"हिन्दी"},{code:"mr",label:"मराठी"}];
export const DEFAULT_LANGUAGE:LanguageCode="en";
export const DEFAULT_CATALOG:MessageCatalog=en;
export async function loadCatalog(language:LanguageCode):Promise<MessageCatalog>{
 let translated:LocaleCatalog={};
 if(language==="hi")translated=(await import("./messages/hi")).hi;
 else if(language==="mr")translated=(await import("./messages/mr")).mr;
 return {...en,...translated};
}
export type {MessageCatalog,MessageToken};
