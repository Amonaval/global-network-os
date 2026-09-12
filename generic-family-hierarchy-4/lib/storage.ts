import { supabase } from './supabase';

const PROFILE_BUCKET = 'profile-photos';
const COMMUNITY_BUCKET = 'community-media';
const DEFAULT_MAX_BYTES = 100 * 1024;
const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp']);
const SIGNED_TTL = 86400;

function extractPath(urlOrPath: string): string {
  if (!urlOrPath.startsWith('http')) return urlOrPath;
  const m = urlOrPath.match(/\/storage\/v1\/object\/(?:public|sign)\/[^/]+\/(.+?)(?:\?.*)?$/);
  return m ? m[1] : urlOrPath;
}

async function activeStoragePolicy(){
  if(!supabase) throw new Error('Photo storage is available only in shared mode.');
  const {data,error}=await supabase.rpc('get_my_networks');
  if(error) throw error;
  const n=(data||[]).find((x:any)=>x.is_active) || (data||[])[0];
  if(!n) throw new Error('Choose an active family before uploading media.');
  return {networkId:String(n.network_id),enabled:!!n.photo_upload_enabled,maxBytes:Number(n.photo_max_bytes||DEFAULT_MAX_BYTES)};
}

export async function prepareFamilyImage(file:File,maxBytes=DEFAULT_MAX_BYTES):Promise<File>{
  if(!ALLOWED.has(file.type)) throw new Error('Please upload a JPG, PNG or WebP image.');
  if(file.size<=maxBytes) return file;
  const bitmap=await createImageBitmap(file);
  let width=bitmap.width,height=bitmap.height;
  const maxDimension=1280;
  if(Math.max(width,height)>maxDimension){const s=maxDimension/Math.max(width,height);width=Math.round(width*s);height=Math.round(height*s);}
  const canvas=document.createElement('canvas');
  for(let attempt=0;attempt<7;attempt++){
    canvas.width=Math.max(120,Math.round(width)); canvas.height=Math.max(120,Math.round(height));
    const ctx=canvas.getContext('2d'); if(!ctx) break;
    ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);
    const quality=Math.max(.42,.86-attempt*.07);
    const blob=await new Promise<Blob|null>(r=>canvas.toBlob(r,'image/webp',quality));
    if(blob && blob.size<=maxBytes){bitmap.close();return new File([blob],file.name.replace(/\.[^.]+$/,'.webp'),{type:'image/webp'});}
    width*=.82;height*=.82;
  }
  bitmap.close();
  throw new Error(`Image is still larger than ${Math.ceil(maxBytes/1024)} KB after compression. Choose a smaller image or use a lightweight avatar.`);
}

export async function resolveSignedUrls<T extends { photo_url?: string | null }>(items:T[],bucket:'profile-photos'|'community-media'=PROFILE_BUCKET):Promise<T[]>{
  if(!supabase||items.length===0)return items;
  const indexed=items.map((item,i)=>({i,path:item.photo_url?extractPath(item.photo_url):null})).filter((x):x is {i:number;path:string}=>!!x.path);
  if(!indexed.length)return items;
  const {data}=await supabase.storage.from(bucket).createSignedUrls(indexed.map(x=>x.path),SIGNED_TTL); if(!data)return items;
  const result=[...items]; indexed.forEach(({i},k)=>{if(data[k]?.signedUrl)result[i]={...result[i],photo_url:data[k].signedUrl};}); return result;
}

export async function uploadProfilePhoto(file:File):Promise<string>{
  if(!supabase)throw new Error('Photo storage is available only in shared mode.');
  const policy=await activeStoragePolicy(); if(!policy.enabled)throw new Error('Photo uploads are disabled for this family.');
  const prepared=await prepareFamilyImage(file,policy.maxBytes);
  const {data:{user}}=await supabase.auth.getUser(); if(!user)throw new Error('Please sign in before uploading a profile photo.');
  const ext=prepared.type==='image/png'?'png':prepared.type==='image/webp'?'webp':'jpg';
  const path=`${policy.networkId}/profiles/${user.id}/${crypto.randomUUID()}.${ext}`;
  const {error}=await supabase.storage.from(PROFILE_BUCKET).upload(path,prepared,{cacheControl:'3600',upsert:false,contentType:prepared.type}); if(error)throw error; return path;
}

export async function uploadCommunityPhoto(file:File,userId:string):Promise<string>{
  if(!supabase)throw new Error('Shared mode is required.');
  const policy=await activeStoragePolicy(); if(!policy.enabled)throw new Error('Photo uploads are disabled for this family.');
  const prepared=await prepareFamilyImage(file,policy.maxBytes);
  const ext=prepared.type==='image/png'?'png':prepared.type==='image/webp'?'webp':'jpg';
  const path=`${policy.networkId}/community/${userId}/${crypto.randomUUID()}.${ext}`;
  const {error}=await supabase.storage.from(COMMUNITY_BUCKET).upload(path,prepared,{upsert:false,contentType:prepared.type}); if(error)throw error; return path;
}

export async function removeStoredMedia(pathOrUrl:string|undefined|null,bucket:'profile-photos'|'community-media'){
  if(!supabase||!pathOrUrl||pathOrUrl.startsWith('data:'))return;
  const path=extractPath(pathOrUrl); const {error}=await supabase.storage.from(bucket).remove([path]); if(error)throw error;
}

export async function getSignedPhotoUrl(pathOrUrl:string,bucket:'profile-photos'|'community-media'=PROFILE_BUCKET):Promise<string|null>{
  if(!supabase||!pathOrUrl)return null; const {data,error}=await supabase.storage.from(bucket).createSignedUrl(extractPath(pathOrUrl),SIGNED_TTL); return error||!data?.signedUrl?null:data.signedUrl;
}

export async function uploadComplaintPhoto(file:File):Promise<string>{
  if(!supabase)throw new Error('Shared mode is required.');
  const {data:{user}}=await supabase.auth.getUser();if(!user)throw new Error('Please sign in before uploading a complaint photo.');
  return uploadCommunityPhoto(file,user.id);
}
