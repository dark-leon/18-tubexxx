import { getVideos } from './utils/cloudflare';

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case "'": return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

export async function GET() {
  const videos = await getVideos();
  const baseUrl = 'https://www.18-tubexxx.com';

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
            xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
      ${videos
        .filter(video => video.status?.state === 'ready')
        .map(video => {
          const title = escapeXml(video.meta?.name || 'Adult Video');
          const description = escapeXml(video.meta?.description || 'Watch HD quality adult video');
          const tags = video.meta?.tags ? escapeXml(video.meta.tags) : '';
          const category = video.meta?.category ? escapeXml(video.meta.category) : '';
          const thumbnailUrl = `https://videodelivery.net/${video.uid}/thumbnails/thumbnail.jpg?time=${Math.floor(video.duration / 2)}s`;
          const playerUrl = `${baseUrl}/embed/${video.uid}`;
          const contentUrl = `${baseUrl}/watch/${video.uid}`;
          const durationInSeconds = Math.floor(video.duration);
          const minutes = Math.floor(durationInSeconds / 60);
          const seconds = durationInSeconds % 60;

          return `
            <url>
              <loc>${contentUrl}</loc>
              <video:video>
                <video:thumbnail_loc>${thumbnailUrl}</video:thumbnail_loc>
                <video:title>${title}</video:title>
                <video:description>${description}</video:description>
                <video:content_loc>${contentUrl}</video:content_loc>
                <video:player_loc>${playerUrl}</video:player_loc>
                <video:duration>${durationInSeconds}</video:duration>
                <video:publication_date>${video.created}</video:publication_date>
                <video:view_count>${video.meta?.views || 0}</video:view_count>
                <video:family_friendly>no</video:family_friendly>
                <video:restriction relationship="allow">IE GB US CA AU</video:restriction>
                <video:requires_subscription>no</video:requires_subscription>
                <video:live>no</video:live>
                ${category ? `<video:category>${category}</video:category>` : ''}
                ${tags ? tags.split(',').map(tag => `<video:tag>${tag.trim()}</video:tag>`).join('') : ''}
              </video:video>
            </url>`;
        })
        .join('\n')}
    </urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600'
    }
  });
} 