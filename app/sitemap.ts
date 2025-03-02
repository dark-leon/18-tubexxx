import { getVideos, defaultCategories, Category, VideoData } from './utils/cloudflare';
import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.18-tubexxx.com';
  let videos: VideoData[] = [];

  try {
    videos = await getVideos();
  } catch (error) {
    console.error('Error fetching videos for sitemap:', error);
  }

  const mainRoutes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'always' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/pornstars`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    }
  ];

  const videoRoutes = videos
    .filter(video => video.status.state === 'ready') // Faqat tayyor videolarni qo'shamiz
    .sort((a, b) => new Date(b.modified).getTime() - new Date(a.modified).getTime()) // Eng yangi videolar yuqorida
    .map((video) => ({
      url: `${baseUrl}/watch/${video.uid}`,
      lastModified: new Date(video.modified),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    }));

  const categoryRoutes = defaultCategories.map((category: Category) => ({
    url: `${baseUrl}/category/${category.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }));

  const tagSet = new Set<string>();
  videos.forEach(video => {
    if (video.meta.tags) {
      video.meta.tags.split(',').forEach(tag => {
        tagSet.add(tag.trim().toLowerCase());
      });
    }
  });

  const tagRoutes = Array.from(tagSet).map(tag => ({
    url: `${baseUrl}/tag/${encodeURIComponent(tag)}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.6,
  }));

  const totalPages = Math.ceil(videos.length / 24); // Har sahifada 24 ta video
  const paginationRoutes = Array.from({ length: totalPages }, (_, i) => ({
    url: `${baseUrl}/page/${i + 1}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.5,
  }));

  return [
    ...mainRoutes,
    ...videoRoutes,
    ...categoryRoutes,
    ...tagRoutes,
    ...paginationRoutes
  ];
} 