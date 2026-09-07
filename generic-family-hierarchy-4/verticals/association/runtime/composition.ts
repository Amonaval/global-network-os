import {createProductizedAppComposition} from "../../../capabilities/template-product/composition";
import {PRODUCTIZED_NETWORK_CONFIGS} from "../../../templates/productized/config";
import type {VerticalAppComposition,VerticalSurfaceDescriptor} from "../../../core/verticals/app-composition";

const base=createProductizedAppComposition("association",PRODUCTIZED_NETWORK_CONFIGS.association);
const label=(en:string)=>({en,hi:en,mr:en});
const rename=(surface:VerticalSurfaceDescriptor,next:string):VerticalSurfaceDescriptor=>({...surface,label:label(next)});

export const ASSOCIATION_APP_COMPOSITION={
 ...base,
 primaryNavigation:[...base.primaryNavigation.slice(0,1),{viewId:"me",featureKey:"association.core.me",iconToken:"user",label:label("Me & My Family")},...base.primaryNavigation.slice(1)].map(surface=>{
  if(surface.viewId==="explorer")return rename(surface,"Family Structure");
  if(surface.viewId==="directory")return rename(surface,"Families & Members");
  if(surface.viewId==="community")return rename(surface,"Community Life");
  if(surface.viewId==="connections")return rename(surface,"Relationships");
  if(surface.viewId==="contribute")return rename(surface,"Update Network");
  if(surface.viewId==="guide")return rename(surface,"Explore & Guide");
  return surface;
 }),
 mobileBottomViewIds:["home","me","directory","community"],
 mobileMoreActiveViewIds:[...base.mobileMoreActiveViewIds,"explorer"],
 launch:{...base.launch,playgroundTitle:"Community / Association Playground",playgroundDescription:"A family-grade member association with household structure, full people profiles, celebrations, annual membership, committees and community history.",playgroundRecommendation:"Start at Home, open Families & Members, then explore household relationships and Community Life."},
} satisfies VerticalAppComposition;
