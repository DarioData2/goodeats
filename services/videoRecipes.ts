export type VideoSource = { url: string; platform: 'YouTube' | 'TikTok'; author?: string };
export type VideoBookmark = { id: string; title: string; source: VideoSource };

/** Only store video links; never fetch the supplied URL or resolve redirects. */
export function parseVideoUrl(input: string): VideoSource {
  const invalid = () => new Error('Pega un enlace HTTPS a un video de YouTube o TikTok.');
  if (typeof input !== 'string' || input.length > 2048 || /[\s\\]/.test(input.trim())) throw invalid();
  let url: URL;
  try { url = new URL(input.trim()); } catch { throw invalid(); }
  if (url.protocol !== 'https:' || url.username || url.password || url.port) throw invalid();
  const host = url.hostname.toLowerCase();
  let id: string | undefined;
  if (['youtube.com', 'www.youtube.com', 'm.youtube.com'].includes(host)) {
    id = url.pathname === '/watch' ? url.searchParams.get('v') ?? undefined : url.pathname.match(/^\/(?:shorts|live)\/([\w-]{11})\/?$/)?.[1];
  } else if (host === 'youtu.be') id = url.pathname.match(/^\/([\w-]{11})\/?$/)?.[1];
  if (id && /^[\w-]{11}$/.test(id)) return { platform: 'YouTube', url: `https://www.youtube.com/watch?v=${id}` };
  if (['tiktok.com', 'www.tiktok.com', 'm.tiktok.com'].includes(host)) {
    const video = url.pathname.match(/^\/@([\w.]+)\/video\/(\d{10,25})\/?$/);
    if (video) return { platform: 'TikTok', url: `https://www.tiktok.com/@${video[1]}/video/${video[2]}` };
    const short = url.pathname.match(/^\/t\/([a-zA-Z0-9]{5,40})\/?$/);
    if (short) return { platform: 'TikTok', url: `https://www.tiktok.com/t/${short[1]}/` };
  }
  if (['vm.tiktok.com', 'vt.tiktok.com'].includes(host) && /^\/[a-zA-Z0-9]{5,40}\/?$/.test(url.pathname)) {
    return { platform: 'TikTok', url: `https://${host}/${url.pathname.split('/')[1]}/` };
  }
  throw invalid();
}

export function validateVideoSource(source: VideoSource): VideoSource {
  const parsed = parseVideoUrl(source.url);
  if (source.platform !== parsed.platform || (source.author !== undefined && (typeof source.author !== 'string' || source.author.length > 120))) throw new Error('Fuente de video inválida.');
  return { ...parsed, ...(source.author?.trim() ? { author: source.author.trim() } : {}) };
}

export function validateVideoBookmark(bookmark: VideoBookmark): VideoBookmark {
  if (typeof bookmark.id !== 'string' || !bookmark.id || typeof bookmark.title !== 'string' || !bookmark.title.trim() || bookmark.title.length > 120) throw new Error('Revisa el nombre del video.');
  return { id: bookmark.id, title: bookmark.title.trim(), source: validateVideoSource(bookmark.source) };
}
