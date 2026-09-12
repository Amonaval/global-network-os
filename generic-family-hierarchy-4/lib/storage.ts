import { supabase } from './supabase';

const PROFILE_BUCKET = 'profile-photos';
const COMMUNITY_BUCKET = 'community-media';
const DEFAULT_MAX_BYTES = 100 * 1024;
const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp']);
const SIGNED_TTL = 86400;

export type MediaKind='profile'|'memory'|'event'|'announcement'|'complaint'|'post'|'other';
export type MediaBucket='profile-photos'|'community-media';
export type MediaPreset={bucket:MediaBucket;maxDimension:number;targetBytes:number;thumbnailDimension:number;thumbnailBytes:number};
export type NetworkMediaAsset={
  assetId:string; bucket:MediaBucket; path:string; thumbnailPath?:string|null; kind:MediaKind;
  entityType?:string|null; entityId?:string|null; mimeType:string; bytes:number; thumbnailBytes:number;
  width:number; height:number; url?:string|null; thumbnailUrl?:string|null;
};

export const MEDIA_PRESETS:Record<MediaKind,MediaPreset>={
  profile:{bucket:PROFILE_BUCKET,maxDimension:640,targetBytes:128*1024,thumbnailDimension:160,thumbnailBytes:24*1024},
  memory:{bucket:COMMUNITY_BUCKET,maxDimension:1600,targetBytes:220*1024,thumbnailDimension:360,thumbnailBytes:42*1024},
  event:{bucket:COMMUNITY_BUCKET,maxDimension:1600,targetBytes:220*1024,thumbnailDimension:360,thumbnailBytes:42*1024},
  announcement:{bucket:COMMUNITY_BUCKET,maxDimension:1280,targetBytes:180*1024,thumbnailDimension:320,thumbnailBytes:36*1024},
  complaint:{bucket:COMMUNITY_BUCKET,maxDimension:1600,targetBytes:240*1024,thumbnailDimension:360,thumbnailBytes:44*1024},
  post:{bucket:COMMUNITY_BUCKET,maxDimension:1280,targetBytes:180*1024,thumbnailDimension:320,thumbnailBytes:36*1024},
  other:{bucket:COMMUNITY_BUCKET,maxDimension:1280,targetBytes:180*1024,thumbnailDimension:320,thumbnailBytes:36*1024},
};

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
  if(!n) throw new Error('Choose an active network before uploading media.');
  return {networkId:String(n.network_id),enabled:!!n.photo_upload_enabled,maxBytes:Number(n.photo_max_bytes||DEFAULT_MAX_BYTES)};
}

async function imageToWebp(file:File,maxBytes:number,maxDimension:number):Promise<{file:File;width:number;height:number}> {
  if(!ALLOWED.has(file.type)) throw new Error('Please upload a JPG, PNG or WebP image.');
  const bitmap=await createImageBitmap(file);
  let width=bitmap.width,height=bitmap.height;
  if(Math.max(width,height)>maxDimension){const scale=maxDimension/Math.max(width,height);width=Math.max(1,Math.round(width*scale));height=Math.max(1,Math.round(height*scale));}
  const canvas=document.createElement('canvas');
  let last:Blob|null=null,lastWidth=width,lastHeight=height;
  for(let attempt=0;attempt<10;attempt++){
    canvas.width=Math.max(72,Math.round(width));canvas.height=Math.max(72,Math.round(height));
    const ctx=canvas.getContext('2d',{alpha:false});if(!ctx){bitmap.close();throw new Error('Image compression is unavailable in this browser.');}
    ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);
    const quality=Math.max(.38,.88-attempt*.055);
    const blob=await new Promise<Blob|null>(resolve=>canvas.toBlob(resolve,'image/webp',quality));
    if(blob){last=blob;lastWidth=canvas.width;lastHeight=canvas.height;if(blob.size<=maxBytes){bitmap.close();return {file:new File([blob],file.name.replace(/\.[^.]+$/,'.webp'),{type:'image/webp'}),width:canvas.width,height:canvas.height};}}
    width*=.84;height*=.84;
  }
  bitmap.close();
  if(last&&last.size<=Math.max(maxBytes,16*1024))return {file:new File([last],file.name.replace(/\.[^.]+$/,'.webp'),{type:'image/webp'}),width:lastWidth,height:lastHeight};
  throw new Error(`Image is still larger than ${Math.ceil(maxBytes/1024)} KB after compression. Choose a smaller image.`);
}

/** Always re-encodes to WebP. This both reduces size and strips EXIF / camera metadata. */
export async function prepareFamilyImage(file:File,maxBytes=DEFAULT_MAX_BYTES):Promise<File>{
  return (await imageToWebp(file,maxBytes,1280)).file;
}

async function registerAsset(input:{bucket:MediaBucket;path:string;thumbnailPath?:string|null;kind:MediaKind;entityType?:string|null;entityId?:string|null;bytes:number;thumbnailBytes:number;width:number;height:number}){
  if(!supabase)throw new Error('Shared mode is required.');
  const {data,error}=await supabase.rpc('register_network_media_asset',{
    p_bucket:input.bucket,p_object_path:input.path,p_thumbnail_path:input.thumbnailPath||null,p_media_kind:input.kind,p_entity_type:input.entityType||null,p_entity_id:input.entityId||null,
    p_mime_type:'image/webp',p_bytes:input.bytes,p_thumbnail_bytes:input.thumbnailBytes,p_width:input.width,p_height:input.height,
  });
  if(error)throw error;return String(data);
}

export async function bindMediaAsset(assetId:string,entityType:string,entityId:string){
  if(!supabase||!assetId||!entityId)return;
  const {error}=await supabase.rpc('bind_network_media_asset',{p_asset_id:assetId,p_entity_type:entityType,p_entity_id:entityId});if(error)throw error;
}

export async function uploadMediaAsset(file:File,kind:MediaKind,opts:{entityType?:string;entityId?:string}={}):Promise<NetworkMediaAsset>{
  if(!supabase)throw new Error('Photo storage is available only in shared mode.');
  const policy=await activeStoragePolicy();if(!policy.enabled)throw new Error('Photo uploads are disabled for this network.');
  const {data:{user}}=await supabase.auth.getUser();if(!user)throw new Error('Please sign in before uploading media.');
  const preset=MEDIA_PRESETS[kind];
  const mainMax=Math.max(24*1024,Math.min(policy.maxBytes,preset.targetBytes));
  const thumbMax=Math.max(12*1024,Math.min(policy.maxBytes,preset.thumbnailBytes));
  const [main,thumb]=await Promise.all([imageToWebp(file,mainMax,preset.maxDimension),imageToWebp(file,thumbMax,preset.thumbnailDimension)]);
  const scope=preset.bucket===PROFILE_BUCKET?'profiles':'community';
  const token=crypto.randomUUID();
  const path=`${policy.networkId}/${scope}/${user.id}/${kind}/${token}.webp`;
  const thumbnailPath=`${policy.networkId}/${scope}/${user.id}/${kind}/thumbs/${token}.webp`;
  const bucket=supabase.storage.from(preset.bucket);
  let mainUploaded=false,thumbUploaded=false;
  try{
    let result=await bucket.upload(path,main.file,{cacheControl:'86400',upsert:false,contentType:'image/webp'});if(result.error)throw result.error;mainUploaded=true;
    result=await bucket.upload(thumbnailPath,thumb.file,{cacheControl:'86400',upsert:false,contentType:'image/webp'});if(result.error)throw result.error;thumbUploaded=true;
    const assetId=await registerAsset({bucket:preset.bucket,path,thumbnailPath,kind,entityType:opts.entityType,entityId:opts.entityId,bytes:main.file.size,thumbnailBytes:thumb.file.size,width:main.width,height:main.height});
    return {assetId,bucket:preset.bucket,path,thumbnailPath,kind,entityType:opts.entityType,entityId:opts.entityId,mimeType:'image/webp',bytes:main.file.size,thumbnailBytes:thumb.file.size,width:main.width,height:main.height};
  }catch(error){
    const remove:string[]=[];if(mainUploaded)remove.push(path);if(thumbUploaded)remove.push(thumbnailPath);if(remove.length){try{await bucket.remove(remove)}catch{}}throw error;
  }
}

export async function fetchEntityMediaAssets(entityType:string,entityIds:string[]):Promise<NetworkMediaAsset[]>{
  if(!supabase||entityIds.length===0)return [];
  const {data,error}=await supabase.rpc('get_network_media_assets',{p_entity_type:entityType,p_entity_ids:entityIds});if(error)throw error;
  const rows=(data||[]) as any[];
  return Promise.all(rows.map(async row=>{
    const bucket=row.bucket as MediaBucket;
    const [main,thumb]=await Promise.all([getSignedPhotoUrl(row.object_path,bucket),row.thumbnail_path?getSignedPhotoUrl(row.thumbnail_path,bucket):Promise.resolve(null)]);
    return {assetId:String(row.id),bucket,path:String(row.object_path),thumbnailPath:row.thumbnail_path||null,kind:row.media_kind as MediaKind,entityType:row.entity_type,entityId:row.entity_id,mimeType:row.mime_type||'image/webp',bytes:Number(row.bytes||0),thumbnailBytes:Number(row.thumbnail_bytes||0),width:Number(row.width||0),height:Number(row.height||0),url:main,thumbnailUrl:thumb};
  }));
}

export async function resolveSignedUrls<T extends { photo_url?: string | null }>(items:T[],bucket:MediaBucket=PROFILE_BUCKET):Promise<T[]>{
  if(!supabase||items.length===0)return items;
  const indexed=items.map((item,i)=>({i,path:item.photo_url?extractPath(item.photo_url):null})).filter((x):x is {i:number;path:string}=>!!x.path);
  if(!indexed.length)return items;
  const {data}=await supabase.storage.from(bucket).createSignedUrls(indexed.map(x=>x.path),SIGNED_TTL); if(!data)return items;
  const result=[...items]; indexed.forEach(({i},k)=>{if(data[k]?.signedUrl)result[i]={...result[i],photo_url:data[k].signedUrl};}); return result;
}

export async function uploadProfilePhoto(file:File,entityId?:string):Promise<string>{
  const asset=await uploadMediaAsset(file,'profile',{entityType:'profile',entityId});return asset.path;
}

/** Backward-compatible memory/community helper. New code should prefer uploadMediaAsset. */
export async function uploadCommunityPhoto(file:File,_userId?:string):Promise<string>{
  const asset=await uploadMediaAsset(file,'memory');return asset.path;
}

export async function uploadComplaintMedia(file:File):Promise<NetworkMediaAsset>{return uploadMediaAsset(file,'complaint')}
export async function uploadComplaintPhoto(file:File):Promise<string>{return (await uploadComplaintMedia(file)).path}
export async function uploadMemoryMedia(file:File):Promise<NetworkMediaAsset>{return uploadMediaAsset(file,'memory')}
export async function uploadActivityMedia(file:File,kind:'event'|'memory'|'announcement'):Promise<NetworkMediaAsset>{return uploadMediaAsset(file,kind)}
export async function uploadEntityProfileMedia(file:File,entityId?:string):Promise<NetworkMediaAsset>{return uploadMediaAsset(file,'profile',{entityType:'network_entity',entityId})}

export async function removeStoredMedia(pathOrUrl:string|undefined|null,bucket:MediaBucket){
  if(!supabase||!pathOrUrl||pathOrUrl.startsWith('data:'))return;
  const path=extractPath(pathOrUrl);
  // Remove registered thumbnail with the main object when known.
  let thumbnail:string|undefined;
  try{const {data}=await supabase.rpc('get_network_media_assets',{p_entity_type:null,p_entity_ids:null});const row=(data||[]).find((x:any)=>x.bucket===bucket&&x.object_path===path);thumbnail=row?.thumbnail_path||undefined;}catch{}
  const paths=[path,...(thumbnail?[thumbnail]:[])];const {error}=await supabase.storage.from(bucket).remove(paths);if(error)throw error;
  try{await supabase.rpc('forget_network_media_asset_by_path',{p_bucket:bucket,p_object_path:path})}catch{}
}

export async function removeMediaAsset(asset:NetworkMediaAsset){
  if(!supabase)return;const paths=[asset.path,...(asset.thumbnailPath?[asset.thumbnailPath]:[])];const {error}=await supabase.storage.from(asset.bucket).remove(paths);if(error)throw error;try{await supabase.rpc('forget_network_media_asset_by_path',{p_bucket:asset.bucket,p_object_path:asset.path})}catch{}
}

export async function getSignedPhotoUrl(pathOrUrl:string,bucket:MediaBucket=PROFILE_BUCKET):Promise<string|null>{
  if(!supabase||!pathOrUrl)return null; const {data,error}=await supabase.storage.from(bucket).createSignedUrl(extractPath(pathOrUrl),SIGNED_TTL); return error||!data?.signedUrl?null:data.signedUrl;
}
