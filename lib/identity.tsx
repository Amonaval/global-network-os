"use client";
import {CircleUserRound,Heart,Leaf,Sparkles,Sun,UserRound} from "lucide-react";
import type {Member} from "./types";

export const AVATAR_STYLES=["initials","leaf","sun","sparkles","heart","person"] as const;
export type AvatarStyle=(typeof AVATAR_STYLES)[number];
export const avatarLabels:Record<AvatarStyle,string>={initials:"Initials",leaf:"Leaf",sun:"Sun",sparkles:"Sparkles",heart:"Heart",person:"Person"};
export function initials(name:string){return name.split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join("").toUpperCase()||"?"}
export function IdentityAvatar({member,size="md",className=""}:{member:Pick<Member,"full_name"|"photo_url"|"avatar_style">;size?:"sm"|"md"|"lg";className?:string}){
 const style=(member.avatar_style||"initials") as AvatarStyle; const Icon=style==="leaf"?Leaf:style==="sun"?Sun:style==="sparkles"?Sparkles:style==="heart"?Heart:style==="person"?UserRound:CircleUserRound;
 return <span className={`identity-avatar identity-avatar-${size} identity-avatar-${style} ${className}`.trim()}>{member.photo_url?<img src={member.photo_url} alt=""/>:style==="initials"?<b>{initials(member.full_name)}</b>:<Icon aria-hidden="true"/>}</span>
}
export type SocialKind="facebook"|"instagram"|"other";
export function normalizeSocialUrl(value:string,kind:SocialKind){const raw=value.trim();if(!raw)return "";let url:URL;try{url=new URL(raw)}catch{throw new Error("Enter a complete link beginning with https://")};if(url.protocol!=="https:")throw new Error("Social links must use https://");if(url.username||url.password)throw new Error("Social links cannot contain credentials");const host=url.hostname.toLowerCase().replace(/^www\./,"");if(kind==="facebook"&&host!=="facebook.com"&&host!=="m.facebook.com")throw new Error("Enter a Facebook profile link from facebook.com");if(kind==="instagram"&&host!=="instagram.com")throw new Error("Enter an Instagram profile link from instagram.com");return url.toString()}
export function safeExternalUrl(value?:string){if(!value)return undefined;try{const u=new URL(value);return u.protocol==="https:"?u.toString():undefined}catch{return undefined}}
