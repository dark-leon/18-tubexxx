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
      changeFrequency: 'hourly' as const,
      priority: 0.9,
      alternateRefs: [
        {
          href: `${baseUrl}/watch/${video.uid}`,
          hreflang: 'x-default'
        },
        {
          href: `${baseUrl}/watch/${video.uid}`,
          hreflang: 'en'
        }
      ]
    }));

  // Kategoriya sahifalari
  const categoryRoutes = defaultCategories.map((category: Category) => ({
    url: `${baseUrl}/category/${category.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
    alternateRefs: [
      {
        href: `${baseUrl}/category/${category.slug}`,
        hreflang: 'x-default'
      },
      {
        href: `${baseUrl}/category/${category.slug}`,
        hreflang: 'en'
      }
    ]
  }));

  // Tag sahifalari
  const tagSet = new Set<string>();
  videos
    .filter(video => video.status?.state === 'ready' && video.meta?.isApproved !== "false")
    .forEach(video => {
      if (video.meta?.tags) {
        video.meta.tags.split(',').forEach(tag => {
          tagSet.add(tag.trim().toLowerCase());
        });
      }
    });

  const tagRoutes = Array.from(tagSet).map(tag => ({
    url: `${baseUrl}/tag/${encodeURIComponent(tag)}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.7,
    alternateRefs: [
      {
        href: `${baseUrl}/tag/${encodeURIComponent(tag)}`,
        hreflang: 'x-default'
      },
      {
        href: `${baseUrl}/tag/${encodeURIComponent(tag)}`,
        hreflang: 'en'
      }
    ]
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
    changeFrequency: 'hourly' as const,
    priority: i === 0 ? 0.9 : 0.7,
    alternateRefs: [
      {
        href: `${baseUrl}/page/${i + 1}`,
        hreflang: 'x-default'
      },
      {
        href: `${baseUrl}/page/${i + 1}`,
        hreflang: 'en'
      }
    ]
  }));

  // Barcha routelarni birlashtirish
  return [
    ...mainRoutes,
    ...videoRoutes,
    ...categoryRoutes,
    ...tagRoutes,
    ...paginationRoutes
  ];
} 