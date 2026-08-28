import {CommandError} from "./errors";

export type RuntimeConfig={supabaseUrl:string;supabaseAnonKey:string;environment:string};

export function getRuntimeConfig():RuntimeConfig{
 const supabaseUrl=process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
 const supabaseAnonKey=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
 if(!supabaseUrl||!supabaseAnonKey)throw new CommandError("SERVER_NOT_CONFIGURED","Shared Supabase mode is not configured.",503);
 return {supabaseUrl,supabaseAnonKey,environment:process.env.VERCEL_ENV||process.env.NODE_ENV||"unknown"};
}

export function runtimeConfigStatus(){
 const missing:string[]=[];
 if(!process.env.NEXT_PUBLIC_SUPABASE_URL?.trim())missing.push("NEXT_PUBLIC_SUPABASE_URL");
 if(!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim())missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
 return {ok:missing.length===0,missing,environment:process.env.VERCEL_ENV||process.env.NODE_ENV||"unknown"};
}
