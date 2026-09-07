import type {ImportSchema} from "./contracts";

const MAX_EXCEL_SHEET_NAME=31;
const INVALID_EXCEL_SHEET_CHARS=/[:\\/?*\[\]]/g;

function cleanSheetName(input:string){
 const cleaned=input.replace(INVALID_EXCEL_SHEET_CHARS," - ").replace(/\s+/g," ").trim().replace(/^'+|'+$/g,"");
 return cleaned||"Sheet";
}

function uniqueSheetName(base:string,used:Set<string>){
 let candidate=base.slice(0,MAX_EXCEL_SHEET_NAME).trim();
 if(!candidate)candidate="Sheet";
 let index=2;
 while(used.has(candidate.toLowerCase())){
  const suffix=` (${index++})`;
  candidate=`${base.slice(0,MAX_EXCEL_SHEET_NAME-suffix.length).trim()}${suffix}`;
 }
 used.add(candidate.toLowerCase());
 return candidate;
}

/**
 * Excel worksheet names are limited to 31 characters and cannot contain
 * : \\ / ? * [ ]. Build one deterministic, collision-safe name per schema
 * sheet while reserving the platform guide sheets.
 */
export function getImportWorkbookSheetNames(schema:ImportSchema){
 const used=new Set(["readme","column guide"]);
 const out=new Map<string,string>();
 for(const sheet of schema.sheets){
  const safeBase=cleanSheetName(sheet.name);
  out.set(sheet.key,uniqueSheetName(safeBase,used));
 }
 return out;
}
