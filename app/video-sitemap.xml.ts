import { getVideos, VideoData } from './utils/cloudflare';

function escapeHTML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  const baseUrl = 'https://www.18-tubexxx.com';
  let videos: VideoData[] = [];

  try {
    videos = await getVideos();
  } catch (error) {
    console.error('Error fetching videos for video sitemap:', error);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
            xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
      ${videos
        .filter(video => video.status?.state === 'ready')
        .map(video => `
          <url>
            <loc>${baseUrl}/watch/${video.uid}</loc>
            <video:video>
              <video:thumbnail_loc>${escapeHTML(video.thumbnail)}</video:thumbnail_loc>
              <video:title>${escapeHTML(video.meta.name)}</video:title>
              <video:description>${escapeHTML(video.meta.description || '')}</video:description>
              <video:content_loc>${escapeHTML(`${baseUrl}/api/stream/${video.uid}`)}</video:content_loc>
              <video:player_loc>${escapeHTML(`${baseUrl}/watch/${video.uid}`)}</video:player_loc>
              <video:duration>${video.duration || 0}</video:duration>
              <video:publication_date>${video.meta.uploadedAt || video.created}</video:publication_date>
              <video:family_friendly>no</video:family_friendly>
              <video:requires_subscription>no</video:requires_subscription>
              <video:live>no</video:live>
              ${video.meta.tags ? `<video:tag>${escapeHTML(video.meta.tags)}</video:tag>` : ''}
              ${video.meta.category ? `<video:category>${escapeHTML(video.meta.category)}</video:category>` : ''}
              <video:uploader info="${baseUrl}">18-tubexxx</video:uploader>
              <video:view_count>${video.meta.views || 0}</video:view_count>
            </video:video>
          </url>
        `).join('')}
    </urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600'
    }
  });
} 