import { supabase } from './supabase';

const PROFILE_BUCKET = 'profile-photos';
const COMMUNITY_BUCKET = 'community-media';
const MAX_BYTES = 100 * 1024; // Alpha policy: 100 KB maximum per uploaded image
const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp']);
const SIGNED_TTL = 86400; // 24 hours

// Extract the storage object path from either a bare path or a legacy Supabase public URL.
// Legacy URL pattern: .../storage/v1/object/public/{bucket}/{path}
function extractPath(urlOrPath: string): string {
  if (!urlOrPath.startsWith('http')) return urlOrPath;
  const m = urlOrPath.match(/\/storage\/v1\/object\/(?:public|sign)\/[^/]+\/(.+?)(?:\?.*)?$/);
  return m ? m[1] : urlOrPath;
}

// Resolve a list of items that each carry a photo_url to signed URLs in one batch call.
// Items with a null/empty photo_url are returned unchanged.
export async function resolveSignedUrls<T extends { photo_url?: string | null }>(
  items: T[],
  bucket: 'profile-photos' | 'community-media' = PROFILE_BUCKET
): Promise<T[]> {
  if (!supabase || items.length === 0) return items;
  const indexed = items
    .map((item, i) => ({ i, path: item.photo_url ? extractPath(item.photo_url) : null }))
    .filter((x): x is { i: number; path: string } => !!x.path);
  if (indexed.length === 0) return items;

  const { data } = await supabase.storage.from(bucket).createSignedUrls(
    indexed.map(x => x.path),
    SIGNED_TTL
  );
  if (!data) return items;

  const result = [...items];
  indexed.forEach(({ i }, k) => {
    const signed = data[k]?.signedUrl;
    if (signed) result[i] = { ...result[i], photo_url: signed };
  });
  return result;
}

// Returns the storage path (e.g. "profiles/uid/uuid.jpg").
// Callers must pass this through resolveSignedUrls before displaying.
export async function uploadProfilePhoto(file: File): Promise<string> {
  if (!supabase) throw new Error('Photo storage is available only in shared mode.');
  if (!ALLOWED.has(file.type)) throw new Error('Please upload a JPG, PNG or WebP image.');
  if (file.size > MAX_BYTES) throw new Error('Photo must be 100 KB or smaller. Please resize/compress it or use the initials avatar.');
  const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Please sign in before uploading a profile photo.');
  const path = `profiles/${user.id}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(PROFILE_BUCKET).upload(path, file, {
    cacheControl: '3600', upsert: false, contentType: file.type,
  });
  if (error) throw error;
  return path;
}

// Returns the storage path (e.g. "community/uid/uuid.jpg").
export async function uploadCommunityPhoto(file: File, userId: string): Promise<string> {
  if (!supabase) throw new Error('Shared mode is required.');
  if (file.size > MAX_BYTES) throw new Error('Photo must be 100 KB or smaller. Please resize/compress it or use the initials avatar.');
  if (!ALLOWED.has(file.type)) throw new Error('Use JPG, PNG or WebP.');
  const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
  const path = `community/${userId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(COMMUNITY_BUCKET).upload(path, file, {
    upsert: false, contentType: file.type,
  });
  if (error) throw error;
  return path;
}

// One-off signed URL for a single path (e.g. for the ProfileForm preview after upload).
export async function getSignedPhotoUrl(
  pathOrUrl: string,
  bucket: 'profile-photos' | 'community-media' = PROFILE_BUCKET
): Promise<string | null> {
  if (!supabase || !pathOrUrl) return null;
  const path = extractPath(pathOrUrl);
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, SIGNED_TTL);
  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
}
