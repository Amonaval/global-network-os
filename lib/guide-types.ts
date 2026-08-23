import type {FeatureKey} from "./features";

export type GuideAudience="anonymous"|"member"|"family_admin"|"platform_owner";
export type GuideStatus="live"|"partial"|"live_verify"|"future";
export type GuideSectionKey="understand"|"remember"|"celebrate"|"build"|"community"|"share"|"manage"|"account"|"playground"|"platform";

export type GuideEntry={
 key:string;
 title:string;
 summary:string;
 why:string;
 section:GuideSectionKey;
 status:GuideStatus;
 featureKey?:FeatureKey;
 audiences?:GuideAudience[];
 keywords:string[];
 steps:string[];
 examples:string[];
 ideas?:string[];
 permissions:string;
 privacy:string;
 faq?:{q:string;a:string}[];
 troubleshooting?:string[];
 related?:string[];
 action?:string;
 playground?:boolean;
 introduced:string;
 updated:string;
};

export type GuideFeedbackType="confusing"|"missing"|"feature_idea"|"improvement"|"bug"|"family_need"|"other"|"helpful_yes"|"helpful_no"|"future_interest";
export type GuideFeedbackStatus="new"|"reviewing"|"planned"|"already_supported"|"not_planned"|"implemented";
export type GuideFeedbackRow={id:string;guide_key?:string|null;screen?:string|null;feedback_type:GuideFeedbackType;message?:string|null;role?:string|null;experience_mode?:string|null;app_version?:string|null;status:GuideFeedbackStatus;created_at:string;network_id?:string|null;family_count?:number};
