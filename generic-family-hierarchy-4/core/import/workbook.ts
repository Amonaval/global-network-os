import * as XLSX from "xlsx";
import type {ImportSchema} from "./contracts";

export function createImportWorkbook(schema:ImportSchema){
 const wb=XLSX.utils.book_new();
 const readme=[
  [schema.title],[schema.description],[],["Workbook / schema version",schema.version],["Vertical",schema.verticalKind],[],["How to use"],["1","Start with the sample rows and replace them with your data."],["2","Keep Stable ID values unique; use them to reference rows across sheets."],["3","Leave optional fields blank rather than guessing."],["4","Upload the workbook, review valid/warning/rejected rows, then confirm import."],[],["Duplicate behavior",schema.duplicatePolicy],[],["Privacy notes"],...schema.privacyNotes.map((x,i)=>[String(i+1),x]),[],["Sheet guide"],["Sheet","Required?","Purpose"],...schema.sheets.map(s=>[s.name,s.required?"Yes":"No",s.description])
 ];
 const rs=XLSX.utils.aoa_to_sheet(readme);rs["!cols"]=[{wch:28},{wch:105}];XLSX.utils.book_append_sheet(wb,rs,"README");
 const guide:[[string,string,string,string,string,string,string],...(string[])[]]=[["Sheet","Column","Required?","Type","Accepted values / reference","Example","Description"]];
 for(const s of schema.sheets)for(const col of s.columns)guide.push([s.name,col.label,col.required?"Yes":"No",col.type,col.acceptedValues?.join(" | ")||col.referenceSheet||"",String(col.example??""),`${col.description}${col.privacyNote?` Privacy: ${col.privacyNote}`:""}`]);
 const gs=XLSX.utils.aoa_to_sheet(guide);gs["!cols"]=[{wch:24},{wch:28},{wch:11},{wch:13},{wch:38},{wch:25},{wch:80}];XLSX.utils.book_append_sheet(wb,gs,"Column Guide");
 for(const s of schema.sheets){
  const rows=s.sampleRows.map(sample=>Object.fromEntries(s.columns.map(col=>[col.label,sample[col.key]??""])));
  const ws=XLSX.utils.json_to_sheet(rows,{header:s.columns.map(c=>c.label)});ws["!cols"]=s.columns.map(col=>({wch:Math.min(42,Math.max(14,col.label.length+3,String(col.example??"").length+3))}));XLSX.utils.book_append_sheet(wb,ws,s.name.slice(0,31));
 }
 return wb;
}
export function downloadImportWorkbook(schema:ImportSchema){const wb=createImportWorkbook(schema);XLSX.writeFile(wb,`${schema.verticalKind}-guided-import-${schema.version.replace(/[^a-z0-9.-]+/gi,"-")}.xlsx`,{compression:true});}
