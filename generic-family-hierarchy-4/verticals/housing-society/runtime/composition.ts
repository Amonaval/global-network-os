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
const residentSurfaces=[residentBase[0],meSurface,...residentBase.slice(1)];
export const HOUSING_SOCIETY_APP_COMPOSITION={
 ...base,primaryNavigation:residentSurfaces,
 mobileMoreNavigation:base.mobileMoreNavigation.map(s=>s.viewId==="admin"?rename(s,"Manage Society"):s),
 mobileBottomViewIds:["home","me","directory","community"],mobileMoreActiveViewIds:["connections","admin","guide"],
 guide:{...base.guide,playgroundViewIds:["home","me","explorer","directory","community","connections"]},
 launch:{...base.launch,playgroundTitle:"Housing Society Playground",playgroundDescription:"A realistic residential community centered on flats/units, residents, households and society structure.",playgroundRecommendation:"Start at Home, explore Society Structure, then browse Residents and Community.",pilotTargetsTitle:"Housing Society foundation pilot",pilotTargetsDescription:"Use the synthetic society to validate structure and terminology before onboarding 20–50 real units."},
 whatsNew:{...base.whatsNew,kicker:"New in Housing Society",fallbackTitle:"Housing Society foundation",fallbackDescription:"Residential community structure is now a first-class TrustWeave vertical."}
} satisfies VerticalAppComposition;
