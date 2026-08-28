import {en,type MessageCatalog} from "./messages/en";
export type LanguageCode="en"|"hi"|"mr";
export const LANGUAGES:{code:LanguageCode;label:string}[]=[{code:"en",label:"English"},{code:"hi",label:"हिन्दी"},{code:"mr",label:"मराठी"}];
export const DEFAULT_LANGUAGE:LanguageCode="en";
export const DEFAULT_CATALOG:MessageCatalog=en;
export async function loadCatalog(language:LanguageCode):Promise<MessageCatalog>{
 if(language==="hi")return (await import("./messages/hi")).hi;
 if(language==="mr")return (await import("./messages/mr")).mr;
 return en;
}
export type {MessageCatalog,MessageToken} from "./messages/en";
