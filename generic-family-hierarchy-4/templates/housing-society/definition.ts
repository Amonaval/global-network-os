import type {VerticalTemplateDefinition} from "../../core/templates/contracts";

/** HS-0 contract: Unit/Flat is the operating object; people and households remain independent identities. */
export const HOUSING_SOCIETY_TEMPLATE:VerticalTemplateDefinition={
 id:"housing-society",label:"Residential Community / Housing Society",status:"active",primaryEntityKind:"unit",
 entityKinds:["unit","household","person","building","wing","organization","location"],
 dimensions:[
  {key:"building",label:"Building / Tower"},{key:"wing",label:"Wing"},{key:"floor",label:"Floor"},{key:"unit_type",label:"Unit Type"},
  {key:"occupancy_status",label:"Occupancy Status"},{key:"resident_type",label:"Resident Type"},{key:"parking_zone",label:"Parking Zone"}
 ],
 relationships:[
  {key:"owned_by",label:"Owned by",direction:"directed",fromKinds:["unit"],toKinds:["person"],inverseLabel:"Owns"},
  {key:"co_owned_by",label:"Co-owned by",direction:"directed",fromKinds:["unit"],toKinds:["person"],inverseLabel:"Co-owns"},
  {key:"occupied_by",label:"Occupied by",direction:"directed",fromKinds:["unit"],toKinds:["household"],inverseLabel:"Occupies"},
  {key:"tenanted_by",label:"Tenanted by",direction:"directed",fromKinds:["unit"],toKinds:["household"],inverseLabel:"Rents"},
  {key:"member_of_household",label:"Household member",direction:"directed",fromKinds:["person"],toKinds:["household"],inverseLabel:"Has member"},
  {key:"resident_of",label:"Resident of",direction:"directed",fromKinds:["person"],toKinds:["unit"],inverseLabel:"Has resident"},
  {key:"serves_on",label:"Serves on",direction:"directed",fromKinds:["person"],toKinds:["organization"],inverseLabel:"Has committee member"},
  {key:"supports",label:"Supports",direction:"directed"}
 ],
 projections:[
  {key:"property-hierarchy",label:"Building → Wing → Floor → Unit",levels:["building","wing","floor"]},
  {key:"occupancy",label:"Building → Occupancy",levels:["building","occupancy_status"]},
  {key:"resident-type",label:"Resident Type → Building",levels:["resident_type","building"]},
  {key:"parking",label:"Parking Zone → Building",levels:["parking_zone","building"]}
 ],
 capabilities:["profiles","affiliation","explorer","discovery","groups","events","memories","maps","milestones","contributions","connection-paths","notifications","notices","complaints","vendors","amenities","bookings","maintenance","billing","dues","finance","governance","meetings","resolutions","polls","documents","security","visitors","staff","approvals","assets","compliance","emergency","claiming","invitations","guide","playground","launch-control"],
 terminology:{home:"Home",unit:"Flat / Unit",resident:"Resident",admin:"Manage Society"},
 notes:[
  "HS-1 adds append-only ownership, co-ownership, tenancy and occupancy history while retaining graph edges for discovery/current structure.",
  "Official property facts remain committee/admin governed; a tenant must never be able to mutate ownership.",
  "Vehicles, parking, My Flat, verified-email claiming and mapped bulk onboarding are HS-1 core. HS-2 adds daily operations; HS-3 adds maintenance billing, dues, funds and budget visibility while payment gateways remain deferred. HS-4 adds committee history, meetings, minutes, action items, resolutions and controlled member voting; election-grade secret ballots remain deferred. HS-5 adds scoped security operations, move/renovation approvals, asset service history, compliance calendar and emergency contacts."
 ]
};
