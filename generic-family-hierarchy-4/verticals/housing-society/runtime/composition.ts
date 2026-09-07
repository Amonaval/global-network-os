import {createProductizedAppComposition} from "../../../capabilities/template-product/composition";
import {PRODUCTIZED_NETWORK_CONFIGS} from "../../../templates/productized/config";
import type {VerticalAppComposition,VerticalSurfaceDescriptor} from "../../../core/verticals/app-composition";
const base=createProductizedAppComposition("housing-society",PRODUCTIZED_NETWORK_CONFIGS["housing-society"]);
const label=(en:string)=>({en,hi:en,mr:en});
const rename=(surface:VerticalSurfaceDescriptor,next:string):VerticalSurfaceDescriptor=>({...surface,label:label(next)});
const residentBase=base.primaryNavigation.filter(s=>s.viewId!=="intelligence"&&s.viewId!=="places"&&s.viewId!=="contribute").map(s=>{
 if(s.viewId==="explorer")return rename(s,"Society Structure");
 if(s.viewId==="directory")return rename(s,"Residents");
 if(s.viewId==="community")return rename(s,"Community");
 if(s.viewId==="connections")return rename(s,"Neighbours");
 if(s.viewId==="guide")return rename(s,"Guide");
 return s;
});
const meSurface:VerticalSurfaceDescriptor={viewId:"me",featureKey:"housing-society.core.my-flat",iconToken:"user",label:label("My Flat")};
const noticeSurface:VerticalSurfaceDescriptor={viewId:"notices",featureKey:"housing-society.ops.notices",iconToken:"calendar",label:label("Notices")};
const complaintSurface:VerticalSurfaceDescriptor={viewId:"complaints",featureKey:"housing-society.ops.complaints",iconToken:"settings",label:label("Complaints")};
const amenitySurface:VerticalSurfaceDescriptor={viewId:"amenities",featureKey:"housing-society.ops.amenities",iconToken:"calendar",label:label("Amenities")};
const maintenanceSurface:VerticalSurfaceDescriptor={viewId:"maintenance",featureKey:"housing-society.finance.maintenance",iconToken:"settings",label:label("Maintenance")};
const residentSurfaces=[residentBase[0],meSurface,residentBase.find(s=>s.viewId==="directory")!,noticeSurface,complaintSurface,maintenanceSurface,amenitySurface,...residentBase.filter(s=>!["home","directory"].includes(s.viewId))];
export const HOUSING_SOCIETY_APP_COMPOSITION={
 ...base,primaryNavigation:residentSurfaces,
 mobileMoreNavigation:base.mobileMoreNavigation.map(s=>s.viewId==="admin"?rename(s,"Manage Society"):s),
 mobileBottomViewIds:["home","me","directory","complaints"],mobileMoreActiveViewIds:["notices","maintenance","amenities","community","connections","admin","guide"],
 guide:{...base.guide,playgroundViewIds:["home","me","directory","notices","complaints","maintenance","amenities","community","explorer","connections"]},
 launch:{...base.launch,playgroundTitle:"Housing Society Playground",playgroundDescription:"A realistic residential community centered on flats/units, residents, households and society structure.",playgroundRecommendation:"Start at Home, explore Society Structure, then browse Residents and Community.",pilotTargetsTitle:"Housing Society daily-operations pilot",pilotTargetsDescription:"Onboard 20–50 real units, run daily operations, then represent one complete maintenance billing cycle with flat-level dues and receipts."},
 whatsNew:{...base.whatsNew,kicker:"New in Housing Society",fallbackTitle:"Housing Society maintenance & finance",fallbackDescription:"Flat-level maintenance bills, dues, receipts, arrears, funds and budget visibility now extend the daily operations foundation."}
} satisfies VerticalAppComposition;
