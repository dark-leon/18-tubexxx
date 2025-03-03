import { getVideos } from '../utils/cloudflare';

function escapeXml(unsafe: string): string {
  if (!unsafe) return '';
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

function formatDate(date: string) {
  return new Date(date).toISOString();
}

export async function GET() {
  try {
    const videos = await getVideos();
    const baseUrl = 'https://www.18-tubexxx.com';

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
      ${videos
        .filter(video => video.status?.state === 'ready')
        .map(video => {
          const title = escapeXml(video.meta?.name || 'Adult Video');
          const description = escapeXml(video.meta?.description || `Watch ${title} in HD quality`);
          const tags = video.meta?.tags ? video.meta.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [];
          const category = video.meta?.category ? video.meta.category.split(',').map(cat => cat.trim())[0] : '';
          const thumbnailUrl = `https://videodelivery.net/${video.uid}/thumbnails/thumbnail.jpg`;
          const contentUrl = `${baseUrl}/watch/${video.uid}`;
          const embedUrl = `${baseUrl}/embed/${video.uid}`;
          const durationInSeconds = Math.floor(video.duration || 0);

          return `
    <url>
      <loc>${contentUrl}</loc>
      <lastmod>${formatDate(video.modified || video.created)}</lastmod>
      <changefreq>daily</changefreq>
      <priority>0.8</priority>
      <video:video>
        <video:thumbnail_loc>${thumbnailUrl}</video:thumbnail_loc>
        <video:title>${title}</video:title>
        <video:description>${description}</video:description>
        <video:player_loc allow_embed="yes"
                         autoplay="autoplay=1">${embedUrl}</video:player_loc>
        <video:duration>${durationInSeconds}</video:duration>
        <video:publication_date>${formatDate(video.created)}</video:publication_date>
        <video:view_count>${video.meta?.views || 0}</video:view_count>
        <video:family_friendly>no</video:family_friendly>
        <video:uploader info="${baseUrl}/about">18-Tube XXX</video:uploader>
        <video:platform relationship="allow">web mobile</video:platform>
        <video:live>no</video:live>
        ${category ? `<video:category>${escapeXml(category)}</video:category>` : ''}
        ${tags.map(tag => `<video:tag>${escapeXml(tag)}</video:tag>`).join('\n        ')}
      </video:video>
    </url>`;
        })
        .join('\n')}
    </urlset>`;

    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=1800, stale-while-revalidate=3600'
      }
    });
  } catch (error) {
    console.error('Error generating video sitemap:', error);
    return new Response('Error generating sitemap', { status: 500 });
  }
} 