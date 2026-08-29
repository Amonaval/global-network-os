"use client";

import {ArrowRight, Cake, ChevronRight, GitBranch, Heart, Image, Plus, Sparkles, TreePine, UserRound, UsersRound} from "lucide-react";
import {useMemo} from "react";
import type {LifeEvent, Member, Memory, Relationship} from "../lib/types";
import {buildFamilySignatureModel} from "../lib/family-signature";
import {localizeRelationshipLabel, relationshipSentence} from "../lib/family-relationship-copy";
import {useLanguage} from "../lib/i18n";

type HomeView = "community" | "participation" | "tree";

type Props = {
  members: Member[];
  events: LifeEvent[];
  memories: Memory[];
  relationships: Relationship[];
  networkName?: string;
  viewerMemberId?: string;
  onSelect: (m: Member) => void;
  onGo: (v: HomeView) => void;
  onAddRelative: () => void;
  showMemories?: boolean;
  showContributions?: boolean;
  canAddRelative?: boolean;
  simple?: boolean;
  readOnly?: boolean;
};

const initials = (name: string) => name.split(/\s+/).map(part => part[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();

export default function FamilySignatureExperience({members, events, memories, relationships, networkName, viewerMemberId, onSelect, onGo, onAddRelative, showMemories=true, showContributions=true, canAddRelative=true, simple=false, readOnly=false}: Props) {
  const {language, t} = useLanguage();
  const model = useMemo(() => buildFamilySignatureModel({members, relationships, events, memories, viewerMemberId}), [members, relationships, events, memories, viewerMemberId]);
  const copy = language === "hi" ? {
    kicker:"मेरे रिश्तों से मेरा परिवार", title:"मेरा परिवार, मेरी नज़र से", intro:"अपने आप से शुरू करें। किसी रिश्तेदार को समझें, रास्ता देखें और धीरे-धीरे पूरे परिवार से जुड़ें।",
    viewer:"यहाँ से शुरू करें", worth:"आज जानने लायक एक रिश्ता", path:"आप दोनों कैसे जुड़े हैं", open:"इनकी प्रोफ़ाइल देखें", tree:"परिवार वृक्ष में देखें", closest:"आपके सबसे करीब", moment:"आज का एक पारिवारिक पल", secondary:"और क्या करना है?", add:"रिश्तेदार जोड़ें", memories:"यादें देखें", help:"परिवार की मदद करें", private:"यह अनुभव केवल इस परिवार के अनुमत डेटा का उपयोग करता है।", unknown:"अभी आपके रिश्ते का रास्ता उपलब्ध नहीं है।",
    birthday:"जन्मदिन", anniversary:"विवाह वर्षगाँठ", today:"आज", away:"दिन बाद", preserve:"इनकी कहानी पूरी करने में मदद करें", preserveBody:"एक फोटो, शहर या छोटी-सी कहानी भी अगली पीढ़ी के लिए बहुत मायने रख सकती है।", memory:"एक याद फिर से देखें", grow:"परिवार को थोड़ा और पूरा करें", growBody:"एक छोटी सही जानकारी भी परिवार को समझना आसान बनाती है।"
  } : language === "mr" ? {
    kicker:"माझ्या नात्यांतून माझे कुटुंब", title:"माझे कुटुंब, माझ्या नजरेतून", intro:"स्वतःपासून सुरुवात करा. एखादे नाते समजा, जोडणीचा मार्ग पहा आणि हळूहळू संपूर्ण कुटुंबाशी जोडा.",
    viewer:"इथून सुरुवात करा", worth:"आज समजून घेण्यासारखे एक नाते", path:"तुम्ही दोघे कसे जोडलेले आहात", open:"प्रोफाइल पहा", tree:"कुटुंब वृक्षात पहा", closest:"तुमच्या सर्वात जवळचे", moment:"आजचा एक कौटुंबिक क्षण", secondary:"आणखी काही करायचे आहे?", add:"नातेवाईक जोडा", memories:"आठवणी पहा", help:"कुटुंबाला मदत करा", private:"हा अनुभव फक्त या कुटुंबात तुम्हाला परवानगी असलेली माहिती वापरतो.", unknown:"या नात्याचा मार्ग अद्याप उपलब्ध नाही.",
    birthday:"वाढदिवस", anniversary:"लग्नाचा वाढदिवस", today:"आज", away:"दिवसांनी", preserve:"यांची कथा पूर्ण करण्यात मदत करा", preserveBody:"एक फोटो, शहर किंवा छोटी आठवणही पुढच्या पिढीसाठी मौल्यवान ठरू शकते.", memory:"एक आठवण पुन्हा पहा", grow:"कुटुंब थोडे अधिक पूर्ण करा", growBody:"एक छोटी अचूक माहितीही कुटुंब समजणे सोपे करते."
  } : {
    kicker:"My family through my relationships", title:"My Family, Through Me", intro:"Start with yourself. Understand one relative, see the path, then explore outward without facing a dashboard full of features.",
    viewer:"Start here", worth:"One connection worth knowing", path:"How you are connected", open:"View profile", tree:"See in family tree", closest:"Closest to you", moment:"One family moment", secondary:"Need something else?", add:"Add a relative", memories:"Open memories", help:"Help the family", private:"This experience uses only information you are already allowed to see inside this family.", unknown:"A relationship path is not available yet.",
    birthday:"Birthday", anniversary:"Anniversary", today:"Today", away:"days away", preserve:"Help preserve this person's story", preserveBody:"A photo, city or two-line memory can make this person more real for the next generation.", memory:"Rediscover a family memory", grow:"Make one family detail better", growBody:"One accurate detail can make the wider family easier to understand."
  };

  const viewer = model.viewer;
  const spotlight = model.spotlight;
  const pathMembers = spotlight?.pathMemberIds.map(id => members.find(member => member.id === id)).filter(Boolean) as Member[] | undefined;
  const moment = model.moment;

  const momentContent = (() => {
    if (!moment) return null;
    if (moment.kind === "special-day" && moment.member) {
      const when = moment.daysAway === 0 ? copy.today : `${moment.daysAway} ${copy.away}`;
      return {icon:<Cake size={20}/>, title:moment.member.full_name, body:`${moment.eventLabel === "birthday" ? copy.birthday : copy.anniversary} · ${when}`, action:()=>onSelect(moment.member!)};
    }
    if (moment.kind === "memory" && moment.memory) return {icon:moment.memory.photo_url ? <img src={moment.memory.photo_url} alt=""/> : <Image size={20}/>, title:moment.memory.title || copy.memory, body:moment.memory.story?.slice(0, 120) || copy.memory, action:()=>onGo("community")};
    if (moment.kind === "preserve" && moment.member) return {icon:<Heart size={20}/>, title:`${copy.preserve}: ${moment.member.full_name}`, body:copy.preserveBody, action:()=>onSelect(moment.member!)};
    return {icon:<Sparkles size={20}/>, title:copy.grow, body:copy.growBody, action:()=>showContributions ? onGo("participation") : onGo("tree")};
  })();

  return <section className={`family-signature ${simple ? "is-simple" : ""}`}>
    <section className="family-signature-intro">
      <div className="family-signature-intro-copy">
        <span className="warm-kicker"><Sparkles size={12}/>{copy.kicker}</span>
        <h1>{copy.title}</h1>
        <p>{copy.intro}</p>
        {viewer && <button className="family-signature-viewer" onClick={()=>onSelect(viewer)}>
          <span className="family-signature-avatar">{viewer.photo_url ? <img src={viewer.photo_url} alt=""/> : initials(viewer.full_name)}</span>
          <span><small>{copy.viewer}</small><b>{viewer.full_name}</b></span><ChevronRight size={16}/>
        </button>}
      </div>
      <div className="family-signature-network-mark"><TreePine size={23}/><strong>{networkName || t("FamTogetherTitleTxt")}</strong><span>{members.length} {t("PeopleTxt")}</span><small>{copy.private}</small></div>
    </section>

    <section className="family-signature-stage">
      <div className="family-signature-spotlight">
        <div className="family-signature-section-label"><UsersRound size={15}/>{copy.worth}</div>
        {viewer && spotlight ? <>
          <div className="family-signature-person">
            <button className="family-signature-person-avatar" onClick={()=>onSelect(spotlight.member)}>{spotlight.member.photo_url ? <img src={spotlight.member.photo_url} alt=""/> : initials(spotlight.member.full_name)}</button>
            <div><h2>{spotlight.member.full_name}</h2><span className="family-signature-relation">{localizeRelationshipLabel(spotlight.relationshipLabel, language)}</span><p>{relationshipSentence(spotlight.member.full_name, spotlight.relationshipLabel, language)}</p></div>
          </div>
          <div className="family-signature-path-wrap">
            <small>{copy.path}</small>
            <div className="family-signature-path" tabIndex={0} aria-label={copy.path}>
              {(pathMembers || []).map((member, index)=><div className="family-signature-path-step" key={member.id}>
                <button onClick={()=>onSelect(member)} className={member.id===viewer.id?"is-viewer":member.id===spotlight.member.id?"is-target":""}><span>{member.photo_url?<img src={member.photo_url} alt=""/>:initials(member.full_name)}</span><b>{member.id===viewer.id ? (language==="hi"?"आप":language==="mr"?"तुम्ही":"You") : member.full_name.split(/\s+/)[0]}</b></button>
                {index < (pathMembers?.length || 0)-1 && <ArrowRight size={15}/>} 
              </div>)}
            </div>
          </div>
          <div className="family-signature-actions"><button className="btn primary" onClick={()=>onSelect(spotlight.member)}><UserRound size={16}/>{copy.open}</button><button className="btn" onClick={()=>onGo("tree")}><GitBranch size={16}/>{copy.tree}</button></div>
        </> : <div className="family-signature-empty"><UsersRound size={28}/><h2>{viewer ? copy.unknown : t("AddRelativeTxt")}</h2><p>{viewer ? copy.growBody : copy.intro}</p>{canAddRelative && !readOnly && <button className="btn primary" onClick={onAddRelative}><Plus size={16}/>{copy.add}</button>}</div>}
      </div>

      {momentContent && <button className="family-signature-moment" onClick={momentContent.action}>
        <span className="family-signature-section-label"><Sparkles size={15}/>{copy.moment}</span>
        <span className="family-signature-moment-icon">{momentContent.icon}</span>
        <strong>{momentContent.title}</strong><p>{momentContent.body}</p><span className="family-signature-moment-action">{language==="hi"?"खोलें":language==="mr"?"उघडा":"Open"}<ArrowRight size={15}/></span>
      </button>}
    </section>

    {model.closest.length > 0 && <section className="family-signature-closest"><div className="family-signature-section-label"><Heart size={15}/>{copy.closest}</div><div className="family-signature-closest-row">{model.closest.map(item=><button key={item.member.id} onClick={()=>onSelect(item.member)}><span className="family-signature-avatar small">{item.member.photo_url?<img src={item.member.photo_url} alt=""/>:initials(item.member.full_name)}</span><span><b>{item.member.full_name.split(/\s+/)[0]}</b><small>{localizeRelationshipLabel(item.label, language)}</small></span></button>)}</div></section>}

    <details className="family-signature-more">
      <summary>{copy.secondary}</summary>
      <div>
        {canAddRelative && !readOnly && <button className="btn" onClick={onAddRelative}><Plus size={15}/>{copy.add}</button>}
        {showMemories && <button className="btn" onClick={()=>onGo("community")}><Heart size={15}/>{copy.memories}</button>}
        {showContributions && !readOnly && <button className="btn" onClick={()=>onGo("participation")}><Sparkles size={15}/>{copy.help}</button>}
        <button className="btn" onClick={()=>onGo("tree")}><TreePine size={15}/>{copy.tree}</button>
      </div>
    </details>
  </section>;
}
