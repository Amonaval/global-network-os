import {createProductizedAppComposition} from "../../../capabilities/template-product/composition";
import {PRODUCTIZED_NETWORK_CONFIGS} from "../../../templates/productized/config";
import type {VerticalAppComposition,VerticalSurfaceDescriptor} from "../../../core/verticals/app-composition";
const base=createProductizedAppComposition("family-association",PRODUCTIZED_NETWORK_CONFIGS["family-association"]);
const label=(en:string,hi:string,mr:string)=>({en,hi,mr});
const find=(viewId:string)=>[...base.primaryNavigation,...base.mobileMoreNavigation].find(s=>s.viewId===viewId)!;
const relabel=(surface:VerticalSurfaceDescriptor,en:string,hi:string,mr:string):VerticalSurfaceDescriptor=>({...surface,label:label(en,hi,mr)});
const meSurface:VerticalSurfaceDescriptor={viewId:"me",featureKey:"family-association.core.me",iconToken:"user",label:label("Me & My Family","मैं और मेरा परिवार","मी आणि माझे कुटुंब")};
const fundsSurface:VerticalSurfaceDescriptor={viewId:"funds",iconToken:"settings",label:label("Funds & Collections","फंड और संग्रह","निधी आणि संकलन")};
const electionsSurface:VerticalSurfaceDescriptor={viewId:"elections",iconToken:"settings",label:label("Elections & Voting","चुनाव और मतदान","निवडणूक आणि मतदान")};
export const FAMILY_ASSOCIATION_APP_COMPOSITION={
 ...base,
 primaryNavigation:[
  relabel(find("home"),"Home","होम","होम"),
  meSurface,
  relabel(find("directory"),"Families","परिवार","कुटुंबे"),
  relabel(find("community"),"Community Life","सामुदायिक जीवन","समुदाय जीवन"),
  relabel(find("guide"),"Guide & Help","मार्गदर्शिका व सहायता","मार्गदर्शक व मदत"),
 ],
 mobileMoreNavigation:[
  fundsSurface,
  electionsSurface,
  relabel(find("explorer"),"Family Structure","परिवार संरचना","कुटुंब रचना"),
  relabel(find("connections"),"Family & Community Links","परिवार व समुदाय संबंध","कुटुंब व समुदाय जोडणी"),
  relabel(find("contribute"),"Build Together","मिलकर बनाएँ","एकत्र उभारा"),
  {...relabel(find("admin"),"Manage Community","समुदाय प्रबंधन","समुदाय व्यवस्थापन"),adminOnly:true},
 ],
 mobileBottomViewIds:["home","me","directory","community"],
 mobileMoreActiveViewIds:["funds","elections","explorer","connections","contribute","admin","guide"],
 guide:{...base.guide,playgroundViewIds:["home","me","directory","community","funds","elections","explorer","connections","contribute"]},
 launch:{...base.launch,playgroundTitle:"Family Community Association Playground",playgroundDescription:"Family-grade people and hierarchy plus annual membership, celebrations, committees, history and community participation.",playgroundRecommendation:"Start at Home, explore Families, then open Community Life and Me & My Family."},
} satisfies VerticalAppComposition;
