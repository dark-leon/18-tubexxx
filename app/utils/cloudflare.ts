export interface VideoData {
  uid: string;
  preview: string;
  thumbnail: string;
  duration: number;
  status: {
    state: string;
  };
  meta: {
    name: string;
    views: string;
    likes: string;
    dislikes: string;
    categories?: string;
    category?: string;
    description?: string;
    uploadedAt?: string;
  };
  input?: {
    width: number;
    height: number;
  };
  created: string;
  modified: string;
}

export async function getVideos(): Promise<VideoData[]> {
  try {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID}/stream`,
      {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_CLOUDFLARE_API_TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Initialize default values for videos that don't have metadata
    const videos = data.result.map((video: VideoData) => ({
      ...video,
      meta: {
        name: video.meta?.name || 'Nomsiz video',
        views: video.meta?.views || '0',
        likes: video.meta?.likes || '0',
        dislikes: video.meta?.dislikes || '0',
        category: video.meta?.category,
        description: video.meta?.description,
        uploadedAt: video.meta?.uploadedAt || video.created
      }
    }));

    return videos;
  } catch (error) {
    console.error('Error fetching videos:', error);
    throw error;
  }
}

interface VideoMeta {
  name?: string;
  description?: string;
  category?: string;
  categories?: string;
  views?: string;
  likes?: string;
  dislikes?: string;
  uploadedAt?: string;
}

export async function updateVideoMeta(videoId: string, meta: VideoMeta) {
  try {
    const response = await fetch(`/api/videos/${videoId}/meta`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(meta),
    });

    if (!response.ok) {
      throw new Error('Video ma\'lumotlarini yangilashda xatolik');
    }

    return await response.json();
  } catch (error) {
    throw new Error('Video ma\'lumotlarini yangilashda xatolik');
  }
}

export async function incrementViews(videoId: string, currentViews: string) {
  const newViews = (parseInt(currentViews || '0') + 1).toString();
  return updateVideoMeta(videoId, { views: newViews });
}

export async function handleLike(videoId: string, currentLikes: string) {
  const newLikes = (parseInt(currentLikes || '0') + 1).toString();
  return updateVideoMeta(videoId, { likes: newLikes });
}

export async function handleDislike(videoId: string, currentDislikes: string) {
  const newDislikes = (parseInt(currentDislikes || '0') + 1).toString();
  return updateVideoMeta(videoId, { dislikes: newDislikes });
}

export async function deleteVideo(videoId: string) {
  try {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID}/stream/${videoId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_CLOUDFLARE_API_TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Delete Error:', errorText);
      throw new Error('Failed to delete video');
    }

    return true;
  } catch (error) {
    console.error('Error deleting video:', error);
    throw error;
  }
}

interface UploadResult {
  uid: string;
  thumbnail: string;
  playback: {
    hls: string;
    dash: string;
  };
  status: {
    state: string;
    pctComplete: number;
  };
}

export async function uploadVideo(
  file: File,
  metadata: VideoMeta,
  onProgress?: (progress: number) => void
): Promise<UploadResult> {
  try {
    // 1. Cloudflare Stream API ga to'g'ridan-to'g'ri yuklash
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID}/stream`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_CLOUDFLARE_API_TOKEN}`,
        },
        body: formData
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('Upload error:', error);
      throw new Error('Video yuklashda xatolik yuz berdi');
    }

    const result = await response.json();
    console.log('Upload result:', result);

    if (!result.success || !result.result?.uid) {
      throw new Error('Video yuklashda xatolik yuz berdi');
    }

    const videoId = result.result.uid;

    // 2. Video metama'lumotlarini yangilash
    const metaResponse = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID}/stream/${videoId}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_CLOUDFLARE_API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          meta: {
            name: metadata.name || 'Nomsiz video',
            description: metadata.description || '',
            category: metadata.category || '',
            categories: metadata.categories || '',
            views: '0',
            likes: '0',
            dislikes: '0',
            uploadedAt: new Date().toISOString()
          }
        })
      }
    );

    if (!metaResponse.ok) {
      console.error('Metadata update error:', await metaResponse.text());
    }

    // 3. Video holatini tekshirish
    let attempts = 0;
    const maxAttempts = 30; // 1 minut
    const pollInterval = 2000; // 2 sekund

    while (attempts < maxAttempts) {
      const statusResponse = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID}/stream/${videoId}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_CLOUDFLARE_API_TOKEN}`
          }
        }
      );

      if (statusResponse.ok) {
        const status = await statusResponse.json();
        console.log('Video status:', status);

        if (status.result?.readyToStream) {
          return {
            uid: videoId,
            thumbnail: status.result.thumbnail || '',
            playback: {
              hls: status.result.playback?.hls || '',
              dash: status.result.playback?.dash || '',
            },
            status: {
              state: 'ready',
              pctComplete: 100,
            },
          };
        }

        if (status.result?.status?.state === 'error') {
          throw new Error('Video qayta ishlashda xatolik yuz berdi');
        }
      }

      attempts++;
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }

    // Vaqt tugadi, lekin video hali ham qayta ishlanmoqda
    return {
      uid: videoId,
      thumbnail: '',
      playback: { hls: '', dash: '' },
      status: { state: 'processing', pctComplete: 100 }
    };
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
} 