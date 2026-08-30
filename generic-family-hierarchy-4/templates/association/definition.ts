import type {VerticalTemplateDefinition} from "../../core/templates/contracts";
export const ASSOCIATION_TEMPLATE:VerticalTemplateDefinition={
 id:"association",label:"Community / Association",status:"active",primaryEntityKind:"household",
 entityKinds:["household","person","committee","organization","location"],
 dimensions:[
  {key:"membership_year",label:"Membership Year"},{key:"membership_status",label:"Membership Status"},{key:"chapter",label:"Chapter"},{key:"city",label:"City"},{key:"committee",label:"Committee / Role"},{key:"interest",label:"Interest / Activity"}
 ],
 relationships:[
  {key:"represented_by",label:"Represented by",direction:"directed",fromKinds:["household"],toKinds:["person"]},
  {key:"member_of_household",label:"Member of household",direction:"directed",fromKinds:["person"],toKinds:["household"]},
  {key:"serves_on",label:"Serves on",direction:"directed",fromKinds:["person"],toKinds:["committee"]},
  {key:"supports",label:"Supports",direction:"symmetric"}
 ],
 projections:[
  {key:"households",label:"Chapter → Household",levels:["chapter","membership_status"],default:true},
  {key:"renewal",label:"Membership Year → Status",levels:["membership_year","membership_status"]},
  {key:"committee",label:"Committee → Chapter",levels:["committee","chapter"]},
  {key:"city",label:"City → Chapter",levels:["city","chapter"]}
 ],
 capabilities:["profiles","affiliation","explorer","discovery","groups","events","memories","maps","milestones","contributions","notifications","construction","media","claiming","invitations","guide","playground","launch-control"],
 terminology:{household:"Family / Household",representative:"Family Representative",renewal:"Annual Membership Renewal",committee:"Committee"},
 notes:[
  "Association membership may be household-based while people remain first-class participants inside each household.",
  "Events, RSVP, memories, announcements and groups reuse the shared Network OS activity engine.",
  "Formal elections are a governed extension and must not be conflated with lightweight polls or Pulse."
 ]
};
