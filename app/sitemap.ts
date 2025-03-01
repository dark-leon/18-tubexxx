import { getVideos } from './utils/cloudflare';

export default async function sitemap() {
  const videos = await getVideos();
  const baseUrl = 'https://yourdomain.com';

  // Asosiy sahifalar
  const routes = [''].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily',
    priority: 1,
  }));

  // Video sahifalari
  const videoRoutes = videos.map((video) => ({
    url: `${baseUrl}/watch/${video.uid}`,
    lastModified: video.modified || new Date().toISOString(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...routes, ...videoRoutes];
} 