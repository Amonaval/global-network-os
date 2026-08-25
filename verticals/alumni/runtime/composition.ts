import type { VerticalAppComposition } from "../../../core/verticals/app-composition";

export const ALUMNI_APP_COMPOSITION = {
  kind:"alumni",
  renderStatus:"skeleton",
  featureCatalogId:"alumni",
  primaryNavigation:[],
  mobileMoreNavigation:[],
  mobileBottomViewIds:[],
  mobileMoreActiveViewIds:[],
  guide:{registryId:"alumni-guide-skeleton",guideByView:{},actionToView:{},playgroundViewIds:[]},
  playground:{enabled:false,startView:"home"},
  launch:{bundles:[],playgroundExcludedBundles:[],playgroundTitle:"",playgroundDescription:"",playgroundRecommendation:"",dayOneTitle:"",dayOneDescription:"",pilotTargetsTitle:"",pilotTargetsDescription:"",footnoteTitle:"",footnoteDescription:""},
  whatsNew:{featureToView:{},defaultView:"home",kicker:"",fallbackTitle:"",fallbackDescription:""},
} satisfies VerticalAppComposition;
