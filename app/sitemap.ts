import { getVideos, defaultCategories, Category } from './utils/cloudflare';
import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const videos = await getVideos();
  const baseUrl = 'https://www.18-tubexxx.com';

  // Statik sahifalar
  const routes = ['', '/categories', '/pornstars'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 1,
  }));

  // Video sahifalari
  const videoRoutes = videos.map((video) => ({
    url: `${baseUrl}/watch/${video.uid}`,
    lastModified: new Date(video.modified),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Kategoriya sahifalari
  const categoryRoutes = defaultCategories.map((category: Category) => ({
    url: `${baseUrl}/category/${category.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [...routes, ...videoRoutes, ...categoryRoutes];
} 