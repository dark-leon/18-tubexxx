import { getVideos, VideoData } from './utils/cloudflare';
import { defaultCategories, Category } from './utils/categories';
import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.18-tubexxx.com';
  let videos: VideoData[] = [];

  try {
    videos = await getVideos();
  } catch (error) {
    console.error('Error fetching videos for sitemap:', error);
  }

  // Asosiy sahifalar
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

  // Video sahifalari
  const videoRoutes = videos
    .filter(video => video.status?.state === 'ready' && video.meta?.isApproved !== "false")
    .map((video) => ({
      url: `${baseUrl}/watch/${video.uid}`,
      lastModified: new Date(video.modified || video.created),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    }));

  // Kategoriya sahifalari
  const categoryRoutes = defaultCategories
    .filter(category => category.slug) // Faqat slug'i bor kategoriyalarni olish
    .map((category: Category) => ({
      url: `${baseUrl}/category/${encodeURIComponent(category.slug)}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    }));

  // Tag sahifalari
  const tagSet = new Set<string>();
  videos
    .filter(video => video.status?.state === 'ready' && video.meta?.isApproved !== "false")
    .forEach(video => {
      if (video.meta?.tags) {
        video.meta.tags.split(',').forEach(tag => {
          const cleanTag = tag.trim().toLowerCase()
            .replace(/[^a-z0-9-]/g, '-') // Xavfsiz URL yaratish
            .replace(/-+/g, '-') // Ketma-ket chiziqchalarni bitta qilish
            .replace(/^-|-$/g, ''); // Boshi va oxiridagi chiziqchalarni olib tashlash
          if (cleanTag) {
            tagSet.add(cleanTag);
          }
        });
      }
    });

  const tagRoutes = Array.from(tagSet).map(tag => ({
    url: `${baseUrl}/tag/${encodeURIComponent(tag)}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }));

  // Paginatsiya sahifalari
  const videosPerPage = 24;
  const approvedVideos = videos.filter(video => 
    video.status?.state === 'ready' && video.meta?.isApproved !== "false"
  );
  const totalPages = Math.ceil(approvedVideos.length / videosPerPage);

  const paginationRoutes = Array.from({ length: totalPages }, (_, i) => ({
    url: `${baseUrl}/page/${i + 1}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: i === 0 ? 0.9 : 0.7,
  }));

  // Barcha routelarni birlashtirish va filtrlash
  const allRoutes = [
    ...mainRoutes,
    ...videoRoutes,
    ...categoryRoutes,
    ...tagRoutes,
    ...paginationRoutes
  ].filter(route => {
    try {
      // URL validatsiyasi
      new URL(route.url);
      return true;
    } catch {
      console.error('Invalid URL in sitemap:', route.url);
      return false;
    }
  });

  return allRoutes;
} 