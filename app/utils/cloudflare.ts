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
    tags?: string;
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
    
    const videos = data.result.map((video: VideoData) => ({
      ...video,
      meta: {
        name: video.meta?.name || '18+ Free Adult Video',
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

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export const defaultCategories: Category[] = [
  {
    id: 'amateur',
    name: 'Amateur',
    slug: 'amateur',
    description: 'Amateur videos'
  },
  {
    id: 'anal',
    name: 'Anal',
    slug: 'anal',
    description: 'Anal videos'
  },
  {
    id: 'asian',
    name: 'Asian',
    slug: 'asian',
    description: 'Asian videos'
  },
  {
    id: 'bdsm',
    name: 'BDSM',
    slug: 'bdsm',
    description: 'BDSM videos'
  }
];

interface VideoMeta {
  name?: string;
  description?: string;
  category?: string;
  categories?: string;
  tags?: string;
  views?: string;
  likes?: string;
  dislikes?: string;
  uploadedAt?: string;
}

export async function updateVideoMeta(videoId: string, meta: VideoMeta) {
  try {
    // Avval joriy video ma'lumotlarini olish
    const currentResponse = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID}/stream/${videoId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_CLOUDFLARE_API_TOKEN}`,
        },
      }
    );

    if (!currentResponse.ok) {
      throw new Error('Error fetching current video data');
    }

    const currentData = await currentResponse.json();
    const currentMeta = currentData.result.meta || {};

    // Yangi meta ma'lumotlarini joriy ma'lumotlar bilan birlashtirish
    const updatedMeta = {
      ...currentMeta,
      ...meta
    };

    // Yangilangan ma'lumotlarni yuborish
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID}/stream/${videoId}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_CLOUDFLARE_API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          meta: updatedMeta
        })
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
    return data.result;
  } catch (error) {
    console.error('Error updating metadata:', error);
    throw error;
  }
}

export async function incrementViews(videoId: string, currentViews: string) {
  try {
    const newViews = (parseInt(currentViews || '0') + 1).toString();
    const result = await updateVideoMeta(videoId, { views: newViews });
    return result.meta.views;
  } catch (error) {
    console.error('Error incrementing views:', error);
    return currentViews;
  }
}

export async function handleLike(videoId: string, currentLikes: string) {
  try {
    const newLikes = (parseInt(currentLikes || '0') + 1).toString();
    const result = await updateVideoMeta(videoId, { likes: newLikes });
    return result.meta.likes;
  } catch (error) {
    console.error('Error handling like:', error);
    return currentLikes;
  }
}

export async function handleDislike(videoId: string, currentDislikes: string) {
  try {
    const newDislikes = (parseInt(currentDislikes || '0') + 1).toString();
    const result = await updateVideoMeta(videoId, { dislikes: newDislikes });
    return result.meta.dislikes;
  } catch (error) {
    console.error('Error handling dislike:', error);
    return currentDislikes;
  }
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
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        const progress = Math.round((event.loaded / event.total) * 70);
        onProgress(progress);
      }
    };

    xhr.onload = async () => {
      try {
        if (xhr.status >= 200 && xhr.status < 300) {
          const result = JSON.parse(xhr.responseText);
          
          if (!result.success || !result.result?.uid) {
            reject(new Error('Video yuklashda xatolik yuz berdi'));
            return;
          }

          const videoId = result.result.uid;
          
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
                  name: metadata.name || '18+ Free Adult Video',
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
            console.error('Error updating metadata: ', await metaResponse.text());
          }

          let attempts = 0;
          const maxAttempts = 30;
          const pollInterval = 2000;

          const checkStatus = async () => {
            if (attempts >= maxAttempts) {
              resolve({
                uid: videoId,
                thumbnail: '',
                playback: { hls: '', dash: '' },
                status: { state: 'processing', pctComplete: 100 }
              });
              return;
            }

            try {
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

                if (status.result?.readyToStream) {
                  if (onProgress) onProgress(100);
                  resolve({
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
                  });
                  return;
                }

                if (onProgress) {
                  const processingProgress = Math.min(95, 70 + (attempts * 25 / maxAttempts));
                  onProgress(processingProgress);
                }
              }

              attempts++;
              await new Promise(resolve => setTimeout(resolve, pollInterval));
              await checkStatus();
            } catch (error) {
              console.error('Error checking video status: ', error);
              resolve({
                uid: videoId,
                thumbnail: '',
                playback: { hls: '', dash: '' },
                status: { state: 'processing', pctComplete: 100 }
              });
            }
          };

          await checkStatus();
        } else {
          reject(new Error('Error uploading video '));
        }
      } catch (error) {
        reject(error);
      }
    };

    xhr.onerror = () => {
      reject(new Error('Error uploading video '));
    };

    const formData = new FormData();
    formData.append('file', file);

    xhr.open('POST', `https://api.cloudflare.com/client/v4/accounts/${process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID}/stream`);
    xhr.setRequestHeader('Authorization', `Bearer ${process.env.NEXT_PUBLIC_CLOUDFLARE_API_TOKEN}`);
    xhr.send(formData);
  });
}