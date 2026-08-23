"use client";

import { useEffect, useRef, useState } from "react";
import * as XLSX from "xlsx";
import { AlertTriangle, ArrowLeft, ArrowRight, CheckCircle2, Download, FileCheck2, FileSpreadsheet, ShieldCheck, UploadCloud, X } from "lucide-react";
import { Member, Relationship, ValidationIssue } from "../lib/types";
import { validateImportRows } from "../lib/validation";
import { useLanguage } from "../lib/i18n";

const IMPORT_COPY = {
  en:{assistant:"Family Excel assistant",title:"Bring your family list",intro:"We guide you from a simple template to a safe preview. Nothing is imported without your confirmation.",templateStep:"Get template",uploadStep:"Upload",reviewStep:"Review",templateTitle:"Start with the guided workbook",templateCopy:"It contains a realistic example and separate sheets for people and relationships.",download:"Download family Excel",how:"How it works",one:"Add each person once.",oneHelp:"Use simple IDs such as P001. Never use Aadhaar or another sensitive ID.",two:"Connect people.",twoHelp:"Choose Parent, Child or Spouse in the Relationships sheet.",three:"Leave unknown details blank.",threeHelp:"Only a name, ID and generation are needed to begin.",scripts:"Names can be written in English, हिन्दी, मराठी or any other script.",already:"Already have a completed file?",drop:"Drop it here or choose XLSX, XLS or CSV",cancel:"Cancel",back:"Back",check:"Check family file",checking:"Checking your family…",add:"Add to family",adding:"Adding your family…",looks:"Does this look right?",looksHelp:"Here are the first few people. We will check every row in the next step.",ready:"Your family is ready to add",attention:"A few things need your attention",fix:"Please fix this",review:"Please review",safe:"Safe to continue",safeHelp:"Existing relationships are preserved, uncertain changes are never invented, and private details follow family visibility rules.",chooseAnother:"Choose another"},
  hi:{assistant:"परिवार Excel सहायक",title:"अपनी परिवार सूची जोड़ें",intro:"सरल टेम्पलेट से सुरक्षित झलक तक हम आपका मार्गदर्शन करेंगे। आपकी पुष्टि के बिना कुछ नहीं जुड़ेगा।",templateStep:"टेम्पलेट लें",uploadStep:"अपलोड",reviewStep:"जाँच",templateTitle:"मार्गदर्शित workbook से शुरू करें",templateCopy:"इसमें वास्तविक उदाहरण और लोगों व रिश्तों के लिए अलग sheets हैं।",download:"पारिवारिक Excel डाउनलोड करें",how:"यह कैसे काम करता है",one:"हर व्यक्ति को एक बार जोड़ें।",oneHelp:"P001 जैसे सरल ID रखें। Aadhaar या अन्य संवेदनशील ID कभी न डालें।",two:"लोगों को रिश्तों से जोड़ें।",twoHelp:"Relationships sheet में Parent, Child या Spouse चुनें।",three:"अनजान जानकारी खाली छोड़ें।",threeHelp:"शुरुआत के लिए केवल नाम, ID और पीढ़ी चाहिए।",scripts:"नाम English, हिन्दी, मराठी या किसी भी लिपि में लिख सकते हैं।",already:"क्या file पहले से तैयार है?",drop:"यहाँ डालें या XLSX, XLS अथवा CSV चुनें",cancel:"रद्द करें",back:"वापस",check:"परिवार file जाँचें",checking:"परिवार की जाँच हो रही है…",add:"परिवार में जोड़ें",adding:"परिवार जोड़ा जा रहा है…",looks:"क्या यह सही दिख रहा है?",looksHelp:"यहाँ कुछ शुरुआती सदस्य हैं। अगले चरण में हर row जाँची जाएगी।",ready:"आपका परिवार जोड़ने के लिए तैयार है",attention:"कुछ चीज़ों पर ध्यान देना है",fix:"इसे ठीक करें",review:"कृपया जाँचें",safe:"आगे बढ़ना सुरक्षित है",safeHelp:"मौजूदा रिश्ते सुरक्षित रहेंगे, अनिश्चित बदलाव नहीं बनाए जाएँगे और निजी जानकारी family privacy के अनुसार रहेगी।",chooseAnother:"दूसरी file चुनें"},
  mr:{assistant:"कुटुंब Excel सहाय्यक",title:"आपली कुटुंब यादी जोडा",intro:"सोप्या नमुन्यापासून सुरक्षित पूर्वदृश्यापर्यंत आम्ही मार्गदर्शन करतो. आपल्या पुष्टीशिवाय काहीही जोडले जाणार नाही.",templateStep:"नमुना घ्या",uploadStep:"अपलोड",reviewStep:"तपासणी",templateTitle:"मार्गदर्शित workbook ने सुरुवात करा",templateCopy:"यात वास्तव उदाहरण आणि व्यक्ती व नात्यांसाठी स्वतंत्र sheets आहेत.",download:"कुटुंब Excel डाउनलोड करा",how:"हे कसे काम करते",one:"प्रत्येक व्यक्ती एकदाच जोडा.",oneHelp:"P001 सारखे सोपे ID वापरा. Aadhaar किंवा संवेदनशील ID कधीही वापरू नका.",two:"व्यक्तींना नात्यांनी जोडा.",twoHelp:"Relationships sheet मध्ये Parent, Child किंवा Spouse निवडा.",three:"माहित नसलेली माहिती रिकामी ठेवा.",threeHelp:"सुरुवातीला फक्त नाव, ID आणि पिढी आवश्यक आहे.",scripts:"नावे English, हिन्दी, मराठी किंवा कोणत्याही लिपीत लिहू शकता.",already:"file आधीच तयार आहे?",drop:"येथे टाका किंवा XLSX, XLS अथवा CSV निवडा",cancel:"रद्द करा",back:"मागे",check:"कुटुंब file तपासा",checking:"कुटुंब तपासत आहोत…",add:"कुटुंबात जोडा",adding:"कुटुंब जोडत आहोत…",looks:"हे बरोबर दिसते का?",looksHelp:"येथे सुरुवातीच्या काही व्यक्ती आहेत. पुढील टप्प्यात प्रत्येक row तपासली जाईल.",ready:"आपले कुटुंब जोडण्यासाठी तयार आहे",attention:"काही गोष्टींकडे लक्ष देणे आवश्यक आहे",fix:"हे दुरुस्त करा",review:"कृपया तपासा",safe:"पुढे जाणे सुरक्षित आहे",safeHelp:"आधीची नाती सुरक्षित राहतील, अनिश्चित बदल बनवले जाणार नाहीत आणि खाजगी माहिती कुटुंबाच्या नियमांनुसार राहील.",chooseAnother:"दुसरी file निवडा"},
} as const;

const uuid = () => globalThis.crypto?.randomUUID?.() || "00000000-0000-4000-8000-" + Math.random().toString(16).slice(2).padEnd(12, "0").slice(0, 12);
const isUuid = (value: unknown) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value || ""));
const text = (value: unknown) => String(value ?? "").trim();
const number = (value: unknown) => { const parsed = Number(value); return Number.isFinite(parsed) ? parsed : undefined; };
const normalizedRow = (row: Record<string, unknown>) => Object.fromEntries(Object.entries(row).map(([key, value]) => [key.toLowerCase().trim().replace(/[\s-]+/g, "_"), value]));
const excelDate = (value: unknown) => {
  if (value === "" || value === null || value === undefined) return undefined;
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value.toISOString().slice(0, 10);
  if (typeof value === "number") {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (parsed) return `${parsed.y}-${String(parsed.m).padStart(2, "0")}-${String(parsed.d).padStart(2, "0")}`;
  }
  const raw = text(value);
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw) && !Number.isNaN(new Date(`${raw}T00:00:00`).getTime())) return raw;
  const parsed = new Date(raw);
  if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);
  throw new Error(`“${raw}” is not a valid date. Use YYYY-MM-DD, for example 1990-08-21.`);
};

const friendlyIssue = (issue: ValidationIssue, language: "en" | "hi" | "mr") => {
  const english: Record<string, string> = {
    IMPORT_DUPLICATE: "This person may already exist in your family.",
    DUPLICATE_MEMBER: "Two rows appear to describe the same person.",
    ORPHAN_RELATIONSHIP: "A relationship refers to a person we could not find.",
    SELF_RELATIONSHIP: "A person cannot have a relationship with themselves.",
    PARENT_CYCLE: "These parent relationships create an impossible family loop.",
    GENERATION_CONFLICT: "The generation numbers do not match the recorded parent and child relationship.",
    RELATIONSHIP_ALREADY_EXISTS: "This family relationship is already recorded and will be safely merged.",
  };
  const hindi: Record<string, string> = { IMPORT_DUPLICATE:"यह व्यक्ति परिवार में पहले से मौजूद हो सकता है।", DUPLICATE_MEMBER:"दो rows एक ही व्यक्ति की लगती हैं।", ORPHAN_RELATIONSHIP:"एक रिश्ता ऐसे व्यक्ति को बताता है जो Family Members में नहीं मिला।", SELF_RELATIONSHIP:"किसी व्यक्ति का रिश्ता स्वयं से नहीं हो सकता।", PARENT_CYCLE:"इन parent रिश्तों से असंभव पारिवारिक चक्र बन रहा है।", GENERATION_CONFLICT:"पीढ़ी संख्या parent और child के रिश्ते से मेल नहीं खाती।", RELATIONSHIP_ALREADY_EXISTS:"यह रिश्ता पहले से मौजूद है और सुरक्षित रूप से जोड़ा जाएगा।" };
  const marathi: Record<string, string> = { IMPORT_DUPLICATE:"ही व्यक्ती कुटुंबात आधीपासून असू शकते.", DUPLICATE_MEMBER:"दोन rows एकाच व्यक्तीच्या वाटतात.", ORPHAN_RELATIONSHIP:"एका नात्यातील व्यक्ती Family Members मध्ये सापडली नाही.", SELF_RELATIONSHIP:"व्यक्तीचे नाते स्वतःशी असू शकत नाही.", PARENT_CYCLE:"या parent नात्यांमुळे अशक्य कौटुंबिक चक्र तयार होते.", GENERATION_CONFLICT:"पिढी क्रमांक parent आणि child नात्याशी जुळत नाही.", RELATIONSHIP_ALREADY_EXISTS:"हे नाते आधीपासून आहे आणि सुरक्षितपणे जोडले जाईल." };
  const replacements = language === "hi" ? hindi : language === "mr" ? marathi : english;
  return replacements[issue.code] || (language === "en" ? issue.message : "या नोंदीची माहिती तपासा.");
};

function downloadStaticSample(path: string, filename: string) {
  const anchor = document.createElement("a");
  anchor.href = path;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

function downloadFamilyTemplate() {
  const exampleMembers = [
    { person_id: "P001", full_name: "Mohan Sharma", gender: "Male", date_of_birth: "1948-06-12", living_status: "Living", generation: 1, city: "Pune", profession: "Teacher", phone: "", email: "", short_introduction: "Our family storyteller" },
    { person_id: "P002", full_name: "Meena Sharma", gender: "Female", date_of_birth: "1952-11-03", living_status: "Living", generation: 1, city: "Pune", profession: "", phone: "", email: "", short_introduction: "" },
    { person_id: "P003", full_name: "Rahul Sharma", gender: "Male", date_of_birth: "1978-02-18", living_status: "Living", generation: 2, city: "Mumbai", profession: "Architect", phone: "", email: "", short_introduction: "" },
    { person_id: "P004", full_name: "Anita Sharma", gender: "Female", date_of_birth: "1981-09-25", living_status: "Living", generation: 2, city: "Mumbai", profession: "Designer", phone: "", email: "", short_introduction: "" },
    { person_id: "P005", full_name: "Aarav Sharma", gender: "Male", date_of_birth: "2010-01-08", living_status: "Living", generation: 3, city: "Mumbai", profession: "Student", phone: "", email: "", short_introduction: "" },
  ];
  const exampleRelationships = [
    { person_id: "P001", related_person_id: "P002", relationship: "Spouse", note: "Mohan is Meena's spouse" },
    { person_id: "P001", related_person_id: "P003", relationship: "Parent", note: "Mohan is Rahul's parent" },
    { person_id: "P002", related_person_id: "P003", relationship: "Parent", note: "Meena is Rahul's parent" },
    { person_id: "P003", related_person_id: "P004", relationship: "Spouse", note: "Rahul is Anita's spouse" },
    { person_id: "P003", related_person_id: "P005", relationship: "Parent", note: "Rahul is Aarav's parent" },
    { person_id: "P004", related_person_id: "P005", relationship: "Parent", note: "Anita is Aarav's parent" },
  ];
  const instructions = [
    { Step: "1", What_to_do: "Add every person once in the Family Members sheet.", Helpful_example: "Use simple IDs such as P001, P002 and P003." },
    { Step: "2", What_to_do: "Keep each person_id unique. It is only used to connect people.", Helpful_example: "Do not use Aadhaar, PAN or another sensitive number." },
    { Step: "3", What_to_do: "Add one relationship per row in the Relationships sheet.", Helpful_example: "P001 → P003 → Parent means P001 is P003's parent." },
    { Step: "4", What_to_do: "Use Parent, Child or Spouse in the relationship column.", Helpful_example: "Siblings are understood when they share a parent." },
    { Step: "5", What_to_do: "Use dates as YYYY-MM-DD. Leave unknown information blank.", Helpful_example: "1990-08-21" },
    { Step: "6", What_to_do: "You may write names and descriptions in English, हिन्दी, मराठी or another script.", Helpful_example: "Names are never automatically translated." },
    { Step: "7", What_to_do: "Phone, email, birth date and introduction are optional.", Helpful_example: "You can add private details later inside the app." },
    { Step: "8", What_to_do: "Upload the file and review the preview before confirming.", Helpful_example: "Nothing is imported until you choose Add to family." },
    { Step: "Allowed values", What_to_do: "gender: Male, Female or Other · living_status: Living or Deceased", Helpful_example: "Keep spelling exactly as shown." },
    { Step: "Allowed relationships", What_to_do: "relationship: Parent, Child or Spouse", Helpful_example: "P001 → P003 → Parent means P001 is P003's parent." },
  ];
  const workbook = XLSX.utils.book_new();
  const memberHeaders = ["person_id","full_name","gender","date_of_birth","date_of_death","living_status","generation","city","profession","phone","email","short_introduction"];
  const relationshipHeaders = ["person_id","related_person_id","relationship","note"];
  const memberSheet = XLSX.utils.aoa_to_sheet([memberHeaders]);
  const relationshipSheet = XLSX.utils.aoa_to_sheet([relationshipHeaders]);
  const instructionSheet = XLSX.utils.json_to_sheet(instructions);
  const exampleSheet = XLSX.utils.aoa_to_sheet([
    ["EXAMPLE ONLY — do not edit or import this sheet"],
    [],
    ["Example people"],
    memberHeaders,
    ...exampleMembers.map((row) => memberHeaders.map((header) => (row as any)[header] ?? "")),
    [],
    ["Example relationships"],
    relationshipHeaders,
    ...exampleRelationships.map((row) => relationshipHeaders.map((header) => (row as any)[header] ?? "")),
  ]);
  memberSheet["!cols"] = [{wch:12},{wch:24},{wch:12},{wch:16},{wch:14},{wch:12},{wch:18},{wch:20},{wch:16},{wch:26},{wch:34}];
  relationshipSheet["!cols"] = [{wch:14},{wch:20},{wch:16},{wch:34}];
  instructionSheet["!cols"] = [{wch:8},{wch:70},{wch:48}];
  exampleSheet["!cols"] = memberSheet["!cols"];
  memberSheet["!autofilter"] = { ref: `A1:L1` };
  relationshipSheet["!autofilter"] = { ref: `A1:D1` };
  XLSX.utils.book_append_sheet(workbook, memberSheet, "Family Members");
  XLSX.utils.book_append_sheet(workbook, relationshipSheet, "Relationships");
  XLSX.utils.book_append_sheet(workbook, instructionSheet, "Read Me First");
  XLSX.utils.book_append_sheet(workbook, exampleSheet, "Example Family — Do Not Import");
  XLSX.writeFile(workbook, "Our-Family-Excel-Template.xlsx");
}

export default function ImportModal({ onClose, onImport, existingMembers = [], existingRelationships = [] }: { onClose: () => void; onImport: (members: Member[], rels: Relationship[]) => void; existingMembers?: Member[]; existingRelationships?: Relationship[] }) {
  const { language } = useLanguage();
  const c = IMPORT_COPY[language];
  const [stage, setStage] = useState<"guide" | "upload" | "review">("guide");
  const [memberRows, setMemberRows] = useState<Record<string, unknown>[]>([]);
  const [relationshipRows, setRelationshipRows] = useState<Record<string, unknown>[]>([]);
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");
  const [busy, setBusy] = useState(false);
  const [report, setReport] = useState<ReturnType<typeof validateImportRows> | null>(null);
  const [parsed, setParsed] = useState<{ members: Member[]; relationships: Relationship[] } | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    closeButtonRef.current?.focus();
    const escape = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", escape);
    return () => window.removeEventListener("keydown", escape);
  }, [onClose]);

  async function handleFile(file: File) {
    setError(""); setReport(null); setParsed(null); setFileName(file.name); setBusy(true);
    try {
      const workbook = XLSX.read(await file.arrayBuffer(), { type: "array", cellDates: true });
      const memberSheetName = workbook.SheetNames.find((name) => /family members|members|people/i.test(name)) || workbook.SheetNames[0];
      const relationshipSheetName = workbook.SheetNames.find((name) => /relationship/i.test(name));
      const members = XLSX.utils.sheet_to_json<Record<string, unknown>>(workbook.Sheets[memberSheetName], { defval: "" }).map(normalizedRow);
      const relationships = relationshipSheetName ? XLSX.utils.sheet_to_json<Record<string, unknown>>(workbook.Sheets[relationshipSheetName], { defval: "" }).map(normalizedRow) : [];
      if (!members.length) throw new Error("We could not find any people in this file. Check the Family Members sheet and try again.");
      setMemberRows(members); setRelationshipRows(relationships); setStage("upload");
    } catch (exception: any) {
      setMemberRows([]); setRelationshipRows([]); setError(exception.message || "We could not read this Excel file. Please use the family template and try again.");
    } finally { setBusy(false); }
  }

  function build() {
    const newMembers: Member[] = [];
    const sourceToId = new Map<string, string>();
    const nameToId = new Map<string, string>();
    const errors: string[] = [];
    memberRows.forEach((raw, index) => {
      const row = normalizedRow(raw);
      const name = text(row.full_name || row.name);
      const source = text(row.person_id || row.id || row.source_id || row.member_id);
      if (!name) { errors.push(`Person ${index + 1} has no name.`); return; }
      if (source && sourceToId.has(source)) errors.push(`${name} uses the same person ID as another row (${source}).`);
      const id = isUuid(source) ? source : uuid();
      const generation = Number(row.generation || row.generation_level || 1);
      if (!Number.isInteger(generation) || generation < 1) errors.push(`${name} needs a generation number such as 1, 2 or 3.`);
      const livingStatus = text(row.living_status).toLowerCase();
      const genderText = text(row.gender);
      const gender = ["Male", "Female", "Other"].includes(genderText) ? genderText as Member["gender"] : undefined;
      let dateOfBirth: string | undefined;
      let dateOfDeath: string | undefined;
      try { dateOfBirth = excelDate(row.date_of_birth); dateOfDeath = excelDate(row.date_of_death); }
      catch (exception: any) { errors.push(`${name}: ${exception.message}`); }
      if (livingStatus === "deceased" && !dateOfDeath) errors.push(`${name} is marked Deceased. Add a date of death, or leave living status blank until it is known.`);
      if (dateOfBirth && dateOfDeath && dateOfDeath < dateOfBirth) errors.push(`${name}: date of death cannot be earlier than date of birth.`);
      const member: Member = { id, full_name: name, date_of_birth: dateOfBirth, date_of_death: dateOfDeath, generation_level: Math.max(1, Number.isFinite(generation) ? generation : 1), profession: text(row.profession) || undefined, city: text(row.city) || undefined, country: text(row.country) || "India", latitude: number(row.latitude), longitude: number(row.longitude), photo_url: text(row.photo_url), bio: text(row.short_introduction || row.bio), phone: text(row.phone) || undefined, email: text(row.email) || undefined, profile_status: "approved", gender };
      newMembers.push(member);
      if (source) sourceToId.set(source.toLowerCase(), id);
      nameToId.set(name.toLowerCase(), id);
    });
    if (errors.length) throw new Error(errors.slice(0, 10).join("\n"));
    const resolve = (value: unknown) => { const key = text(value).toLowerCase(); return sourceToId.get(key) || nameToId.get(key) || (isUuid(key) && newMembers.some((member) => member.id === key) ? key : undefined); };
    const relationships: Relationship[] = [];
    const seen = new Set<string>();
    const add = (personId: string | undefined, relatedId: string | undefined, relationshipType: Relationship["relationship_type"]) => {
      if (!personId || !relatedId) return;
      const key = relationshipType === "spouse" ? `${relationshipType}|${[personId, relatedId].sort().join("|")}` : `${relationshipType}|${personId}|${relatedId}`;
      if (!seen.has(key)) { seen.add(key); relationships.push({ id: uuid(), person_id: personId, related_person_id: relatedId, relationship_type: relationshipType }); }
    };
    if (relationshipRows.length) {
      relationshipRows.forEach((raw, index) => {
        const row = normalizedRow(raw);
        const first = resolve(row.person_id || row.person || row.full_name);
        const second = resolve(row.related_person_id || row.related_person || row.relative);
        const relationship = text(row.relationship || row.relationship_type).toLowerCase();
        if (!first || !second) { errors.push(`Relationship row ${index + 2} refers to a person ID that is not in Family Members.`); return; }
        if (relationship === "parent") add(first, second, "parent");
        else if (relationship === "child") add(second, first, "parent");
        else if (relationship === "spouse") add(first, second, "spouse");
        else errors.push(`Relationship row ${index + 2} should use Parent, Child or Spouse.`);
      });
    } else {
      memberRows.forEach((raw) => {
        const row = normalizedRow(raw);
        const person = resolve(row.person_id || row.id || row.source_id || row.member_id) || resolve(row.full_name || row.name);
        ["father_id", "mother_id", "parent_id", "father", "mother", "parent"].forEach((key) => add(resolve(row[key]), person, "parent"));
        add(person, resolve(row.spouse_id || row.spouse), "spouse");
      });
    }
    if (errors.length) throw new Error(errors.slice(0, 10).join("\n"));
    return { members: newMembers, relationships };
  }

  function validate() {
    setBusy(true); setError("");
    try {
      const data = build();
      const result = validateImportRows(data.members, data.relationships, existingMembers, existingRelationships);
      setParsed(data); setReport(result); setStage("review");
      if (result.errors.length) setError(`${result.errors.length} item${result.errors.length === 1 ? "" : "s"} need attention before we can add this family.`);
    } catch (exception: any) { setParsed(null); setReport(null); setError(exception.message || "We could not check this family file."); }
    finally { setBusy(false); }
  }

  const importNow = () => { if (!parsed || !report || report.errors.length) return; setBusy(true); try { onImport(parsed.members, parsed.relationships); } catch (exception: any) { setError(exception.message || "We could not add this family. Please try again."); setBusy(false); } };

  return <div className="modal-overlay excel-overlay"><div className="modal excel-modal" role="dialog" aria-modal="true" aria-labelledby="excel-title">
    <div className="excel-head"><div><span className="warm-kicker"><FileSpreadsheet size={13} /> {c.assistant}</span><h2 id="excel-title">{c.title}</h2><p>{c.intro}</p></div><button ref={closeButtonRef} className="icon-button" aria-label="Close" onClick={onClose}><X size={19} /></button></div>
    <div className="excel-steps"><span className={stage === "guide" ? "active" : "done"}><b>1</b> {c.templateStep}</span><i /><span className={stage === "upload" ? "active" : stage === "review" ? "done" : ""}><b>2</b> {c.uploadStep}</span><i /><span className={stage === "review" ? "active" : ""}><b>3</b> {c.reviewStep}</span></div>

    {stage === "guide" && <div className="excel-guide-grid">
      <div className="template-card"><div className="template-visual"><FileSpreadsheet size={42} /><span>Our Family</span><small>Members · Relationships · Guidance</small></div><h3>{c.templateTitle}</h3><p>{c.templateCopy}</p><button className="btn primary" onClick={downloadFamilyTemplate}><Download size={16} /> {c.download}</button>
        <div className="sample-workbook-actions">
          <button className="btn" onClick={()=>downloadStaticSample("/family-demo-small-naval.xlsx","family-demo-small-naval.xlsx")}><Download size={16} /> Small demo · Naval family</button>
          <button className="btn" onClick={()=>downloadStaticSample("/sample-data-150.xlsx","family-demo-full-150.xlsx")}><Download size={16} /> Full demo · 150 people</button>
        </div>
        <small className="sample-workbook-note">Use the small sample for a quick test. The 150-person workbook remains the full/default scale example.</small>
      </div>
      <div className="excel-how"><h3>{c.how}</h3><ol><li><b>{c.one}</b><span>{c.oneHelp}</span></li><li><b>{c.two}</b><span>{c.twoHelp}</span></li><li><b>{c.three}</b><span>{c.threeHelp}</span></li></ol><div className="excel-language-note">{c.scripts}</div></div>
    </div>}

    {stage === "upload" && <div className="excel-upload-stage">
      <div className="file-success"><FileCheck2 /><div><b>{fileName}</b><span>{memberRows.length} people and {relationshipRows.length} relationships found</span></div><button className="btn small" onClick={() => { setMemberRows([]); setRelationshipRows([]); setFileName(""); setStage("guide"); }}>{c.chooseAnother}</button></div>
      <h3>{c.looks}</h3><p className="page-subtitle">{c.looksHelp}</p>
      <div className="family-preview-list">{memberRows.slice(0, 5).map((row, index) => <div key={index}><span className="avatar">{text(row.full_name || row.name).split(/\s+/).map((part) => part[0]).slice(0,2).join("")}</span><span><b>{text(row.full_name || row.name) || "Name missing"}</b><small>{[text(row.city), text(row.profession)].filter(Boolean).join(" · ") || "Details can be added later"}</small></span><em>{text(row.generation || row.generation_level) ? `Generation ${text(row.generation || row.generation_level)}` : "Generation not added"}</em></div>)}</div>
      {memberRows.length > 5 && <div className="preview-more">+ {memberRows.length - 5} more people will be checked</div>}
    </div>}

    {stage === "review" && report && parsed && <div className="excel-review-stage">
      <div className={`review-hero ${report.errors.length ? "needs-help" : "ready"}`}>{report.errors.length ? <AlertTriangle /> : <CheckCircle2 />}<div><h3>{report.errors.length ? c.attention : c.ready}</h3><p>{parsed.members.length} people · {parsed.relationships.length} relationships · {report.warnings.length} helpful note{report.warnings.length === 1 ? "" : "s"}</p></div></div>
      {(report.errors.length > 0 || report.warnings.length > 0) && <div className="friendly-issues">{report.errors.map((issue, index) => <div className="issue-row error" key={`error-${index}`}><AlertTriangle /><span><b>{c.fix}</b>{friendlyIssue(issue, language)} {language === "en" && <small>{issue.message !== friendlyIssue(issue, language) ? issue.message : ""}</small>}</span></div>)}{report.warnings.map((issue, index) => <div className="issue-row warning" key={`warning-${index}`}><AlertTriangle /><span><b>{c.review}</b>{friendlyIssue(issue, language)} {language === "en" && <small>{issue.message !== friendlyIssue(issue, language) ? issue.message : ""}</small>}</span></div>)}</div>}
      {!report.errors.length && <div className="import-assurance"><ShieldCheck /><span><b>{c.safe}</b> {c.safeHelp}</span></div>}
    </div>}

    {stage === "guide" && <label className="excel-dropzone"><input className="visually-hidden-file" type="file" accept=".xlsx,.xls,.csv" onChange={(event) => event.target.files?.[0] && handleFile(event.target.files[0])} /><UploadCloud /><span><b>{c.already}</b><small>{c.drop}</small><small>CSV can contain people; use XLSX when relationships are on a separate sheet.</small></span></label>}
    {error && <div className="notice danger-text excel-error" style={{ whiteSpace: "pre-line" }}><AlertTriangle size={16} /> {error}</div>}
    <div className="excel-actions"><button className="btn" onClick={stage === "guide" ? onClose : () => { setError(""); setStage(stage === "review" ? "upload" : "guide"); }}><ArrowLeft size={15} /> {stage === "guide" ? c.cancel : c.back}</button>{stage === "upload" && <button className="btn primary" disabled={busy || !memberRows.length} onClick={validate}>{busy ? c.checking : <>{c.check} <ArrowRight size={15} /></>}</button>}{stage === "review" && <button className="btn primary" disabled={busy || !!report?.errors.length} onClick={importNow}>{busy ? c.adding : <>{c.add} <ArrowRight size={15} /></>}</button>}</div>
  </div></div>;
}
