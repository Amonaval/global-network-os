import {createProductizedAppComposition} from "../../../capabilities/template-product/composition";
import {PRODUCTIZED_NETWORK_CONFIGS} from "../../../templates/productized/config";
import type {VerticalAppComposition,VerticalSurfaceDescriptor} from "../../../core/verticals/app-composition";
const base=createProductizedAppComposition("housing-society",PRODUCTIZED_NETWORK_CONFIGS["housing-society"]);
const label=(en:string,hi:string,mr:string)=>({en,hi,mr});
const find=(viewId:string)=>[...base.primaryNavigation,...base.mobileMoreNavigation].find(s=>s.viewId===viewId)!;
const relabel=(surface:VerticalSurfaceDescriptor,en:string,hi:string,mr:string):VerticalSurfaceDescriptor=>({...surface,label:label(en,hi,mr)});
const meSurface:VerticalSurfaceDescriptor={viewId:"me",featureKey:"housing-society.core.my-flat",iconToken:"user",label:label("My Home","मेरा घर","माझे घर")};
const noticeSurface:VerticalSurfaceDescriptor={viewId:"notices",featureKey:"housing-society.ops.notices",iconToken:"calendar",label:label("Notices","सूचनाएँ","सूचना")};
const complaintSurface:VerticalSurfaceDescriptor={viewId:"complaints",featureKey:"housing-society.ops.complaints",iconToken:"settings",label:label("Complaints","शिकायतें","तक्रारी")};
const amenitySurface:VerticalSurfaceDescriptor={viewId:"amenities",featureKey:"housing-society.ops.amenities",iconToken:"calendar",label:label("Amenities","सुविधाएँ","सुविधा")};
const maintenanceSurface:VerticalSurfaceDescriptor={viewId:"maintenance",featureKey:"housing-society.finance.maintenance",iconToken:"settings",label:label("Maintenance & Dues","देखभाल व बकाया","देखभाल व थकबाकी")};
const governanceSurface:VerticalSurfaceDescriptor={viewId:"governance",featureKey:"housing-society.governance.meetings",iconToken:"book-open",label:label("Committee & Meetings","समिति व बैठकें","समिती व बैठका")};
const securitySurface:VerticalSurfaceDescriptor={viewId:"security",featureKey:"housing-society.security.visitors",iconToken:"settings",label:label("Visitors & Security","आगंतुक व सुरक्षा","पाहुणे व सुरक्षा")};
const electionsSurface:VerticalSurfaceDescriptor={viewId:"elections",iconToken:"settings",label:label("Elections & Voting","चुनाव और मतदान","निवडणूक आणि मतदान")};
export const HOUSING_SOCIETY_APP_COMPOSITION={
 ...base,
 primaryNavigation:[
  relabel(find("home"),"Home","होम","होम"),
  meSurface,
  relabel(find("directory"),"Residents","निवासी","रहिवासी"),
  noticeSurface,
  complaintSurface,
  amenitySurface,
 ],
 mobileMoreNavigation:[
  maintenanceSurface,
  governanceSurface,
  electionsSurface,
  securitySurface,
  relabel(find("explorer"),"Society Structure","सोसायटी संरचना","सोसायटी रचना"),
  relabel(find("community"),"Community","समुदाय","समुदाय"),
  relabel(find("connections"),"Neighbours","पड़ोसी","शेजारी"),
  relabel(find("guide"),"Guide & Help","मार्गदर्शिका व सहायता","मार्गदर्शक व मदत"),
  {...relabel(find("admin"),"Manage Society","सोसायटी प्रबंधन","सोसायटी व्यवस्थापन"),adminOnly:true},
 ],
 mobileBottomViewIds:["home","me","directory","complaints"],
 mobileMoreActiveViewIds:["notices","maintenance","amenities","governance","elections","security","community","explorer","connections","admin","guide"],
 guide:{...base.guide,playgroundViewIds:["home","me","directory","notices","complaints","amenities","maintenance","governance","elections","security","community","explorer","connections"]},
 launch:{...base.launch,playgroundTitle:"Housing Society Playground",playgroundDescription:"A realistic residential community centered on homes, residents, daily society life and operations.",playgroundRecommendation:"Start at Home, browse Residents and Notices, then open Complaints or Amenities. Management tools stay under More.",pilotTargetsTitle:"Founder Society commercialization pilot",pilotTargetsDescription:"Run Pilot A demo → Pilot B 20–50 real units → Pilot C full society → Pilot D second society. Measure activation, weekly usage, notice reach, complaint resolution, maintenance visibility, admin time saved and willingness to pay."},
 whatsNew:{...base.whatsNew,kicker:"New in Housing Society",fallbackTitle:"Founder Society pilot & commercialization",fallbackDescription:"The completed society vertical now includes measurable pilot readiness, adoption evidence, pricing experiments and a second-society repeatability gate."}
} satisfies VerticalAppComposition;
