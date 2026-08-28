import type {VerticalTemplateDefinition} from "../../core/templates/contracts";

export const PROFESSIONAL_TEMPLATE:VerticalTemplateDefinition={
 id:"professional",
 label:"Trusted Expertise & Professional Network",
 status:"active",
 primaryEntityKind:"person",
 entityKinds:["person","organization","location"],
 dimensions:[
  {key:"profession",label:"Profession"},
  {key:"specialty",label:"Specialty / Expertise"},
  {key:"industry",label:"Industry"},
  {key:"service",label:"Service"},
  {key:"city",label:"City"},
  {key:"country",label:"Country"},
  {key:"credential",label:"Credential / Qualification"}
 ],
 relationships:[
  {key:"worked_with",label:"Worked with",direction:"symmetric",fromKinds:["person","organization"],toKinds:["person","organization"]},
  {key:"referred_by",label:"Referred by",direction:"directed",inverseLabel:"Referred",fromKinds:["person","organization"],toKinds:["person","organization"]},
  {key:"collaborates_with",label:"Collaborates with",direction:"symmetric",fromKinds:["person","organization"],toKinds:["person","organization"]},
  {key:"mentors",label:"Mentors",direction:"directed",inverseLabel:"Mentored by",fromKinds:["person"],toKinds:["person"]}
 ],
 projections:[
  {key:"expertise-location",label:"Expertise → Country → City",levels:["specialty","country","city"]},
  {key:"profession-service",label:"Profession → Service → Specialty",levels:["profession","service","specialty"]},
  {key:"industry-expertise",label:"Industry → Expertise → City",levels:["industry","specialty","city"]}
 ],
 capabilities:["profiles","affiliation","explorer","discovery","groups","events","memories","maps","milestones","contributions","connection-paths","notifications","claiming","invitations","guide","playground","launch-control"],
 terminology:{entity:"Professional",entities:"Professionals",relationship:"Trusted professional connection"},
 notes:["Designed for professional associations, expert communities and referral networks.","Healthcare patient data and regulated clinical workflows are explicitly out of scope for this first commercial proof."]
};
