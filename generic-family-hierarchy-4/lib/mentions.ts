export function extractMentions(text:string){
 const seen=new Set<string>();for(const match of text.matchAll(/(^|\s)@([\p{L}\p{N}][\p{L}\p{N}._-]{1,60})/gu))seen.add(`@${match[2]}`);return [...seen];
}
export function normalizeMentionRole(value:string){return value.replace(/^@/,"").trim().toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")}
