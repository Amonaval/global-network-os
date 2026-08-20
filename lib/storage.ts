import { supabase } from './supabase';

const BUCKET = 'profile-photos';
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp']);

export async function uploadProfilePhoto(file: File, ownerKey?: string): Promise<string> {
  if (!supabase) throw new Error('Photo storage is available only in shared mode.');
  if (!ALLOWED.has(file.type)) throw new Error('Please upload a JPG, PNG or WebP image.');
  if (file.size > MAX_BYTES) throw new Error('Photo must be 5 MB or smaller.');
  const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Please sign in before uploading a profile photo.');
  const path = `profiles/${user.id}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, { cacheControl: '3600', upsert: false, contentType: file.type });
  if (error) throw error;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadCommunityPhoto(file: File, userId: string) {
  if(!supabase) throw new Error('Shared mode is required.');
  if(file.size > 5*1024*1024) throw new Error('Photo must be 5 MB or smaller.');
  if(!['image/jpeg','image/png','image/webp'].includes(file.type)) throw new Error('Use JPG, PNG or WebP.');
  const ext=file.type==='image/png'?'png':file.type==='image/webp'?'webp':'jpg';
  const path=`community/${userId}/${crypto.randomUUID()}.${ext}`;
  const {error}=await supabase.storage.from('community-media').upload(path,file,{upsert:false,contentType:file.type});
  if(error)throw error;
  const {data}=supabase.storage.from('community-media').getPublicUrl(path); return data.publicUrl;
}
