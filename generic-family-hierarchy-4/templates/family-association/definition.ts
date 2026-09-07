import type {VerticalTemplateDefinition} from "../../core/templates/contracts";

export const FAMILY_ASSOCIATION_TEMPLATE:VerticalTemplateDefinition={
 id:"family-association",label:"Family Community / Cultural Association",status:"active",primaryEntityKind:"family",
 entityKinds:["family","person","committee","organization","location"],
 dimensions:[
  {key:"membership_year",label:"Membership Year"},{key:"membership_status",label:"Membership Status"},{key:"chapter",label:"Chapter"},{key:"city",label:"City"},{key:"area",label:"Area / Locality"},{key:"profession",label:"Profession"},{key:"committee",label:"Committee / Role"},{key:"interest",label:"Interest / Activity"}
 ],
 relationships:[
  {key:"represented_by",label:"Represented by",direction:"directed",fromKinds:["family"],toKinds:["person"]},
  {key:"member_of_family",label:"Member of family",direction:"directed",fromKinds:["person"],toKinds:["family"]},
  {key:"spouse_of",label:"Spouse of",direction:"symmetric",fromKinds:["person"],toKinds:["person"]},
  {key:"parent_of",label:"Parent of",direction:"directed",fromKinds:["person"],toKinds:["person"]},
  {key:"serves_on",label:"Serves on",direction:"directed",fromKinds:["person"],toKinds:["committee"]},
  {key:"supports",label:"Supports",direction:"symmetric"}
 ],
 projections:[
  {key:"families",label:"Chapter → Family",levels:["chapter","membership_status"],default:true},
  {key:"renewal",label:"Membership Year → Status",levels:["membership_year","membership_status"]},
  {key:"area",label:"City → Area → Family",levels:["city","area"]},
  {key:"profession",label:"Profession → Area",levels:["profession","area"]},
  {key:"committee",label:"Committee → Chapter",levels:["committee","chapter"]}
 ],
 capabilities:["profiles","affiliation","explorer","discovery","groups","events","memories","maps","milestones","contributions","notifications","construction","media","claiming","invitations","guide","playground","launch-control"],
 terminology:{family:"Registered Family",representative:"Family Representative",renewal:"Annual Membership Renewal",committee:"Committee",member:"Family Member"},
 notes:[
  "Family is the annual paid membership unit; representative, spouse and eligible children remain first-class people with full profiles.",
  "Generic Association remains a separate template. This composition reuses Family-grade identity/hierarchy with Association-grade annual operations.",
  "Membership, committee terms, designations, awards and contribution history are temporal and use controlled catalogs where analytics matter.",
  "Advanced TrustWeave federation/intelligence machinery stays hidden from ordinary member UX and can be activated later through governed parent/umbrella links."
 ]
};
