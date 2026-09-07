import {createProductizedAppComposition} from "../../../capabilities/template-product/composition";
import {PRODUCTIZED_NETWORK_CONFIGS} from "../../../templates/productized/config";
import type {VerticalAppComposition,VerticalSurfaceDescriptor} from "../../../core/verticals/app-composition";
const base=createProductizedAppComposition("family-association",PRODUCTIZED_NETWORK_CONFIGS["family-association"]);
const label=(en:string)=>({en,hi:en,mr:en});
const rename=(s:VerticalSurfaceDescriptor,next:string):VerticalSurfaceDescriptor=>({...s,label:label(next)});
const memberSurfaces=base.primaryNavigation.filter(s=>s.viewId!=="intelligence"&&s.viewId!=="places").map(s=>{
 if(s.viewId==="explorer")return rename(s,"Family Structure");
 if(s.viewId==="directory")return rename(s,"Families & Members");
 if(s.viewId==="community")return rename(s,"Community Life");
 if(s.viewId==="connections")return rename(s,"Family & Community Links");
 if(s.viewId==="contribute")return rename(s,"Build Together");
 if(s.viewId==="guide")return rename(s,"Explore & Guide");
 return s;
});
export const FAMILY_ASSOCIATION_APP_COMPOSITION={
 ...base,
 primaryNavigation:[...memberSurfaces.slice(0,1),{viewId:"me",featureKey:"family-association.core.me",iconToken:"user",label:label("Me & My Family")},...memberSurfaces.slice(1)],
 mobileBottomViewIds:["home","me","directory","community"],
 mobileMoreActiveViewIds:["explorer","connections","contribute","admin","guide"],
 guide:{...base.guide,playgroundViewIds:["home","me","explorer","directory","community","connections","contribute"]},
 launch:{...base.launch,playgroundTitle:"Family Community Association Playground",playgroundDescription:"Family-grade people and hierarchy plus annual membership, celebrations, committees, history and community participation.",playgroundRecommendation:"Start at Home, explore Families & Members, then open Community Life and Me & My Family."},
} satisfies VerticalAppComposition;
