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
  return new Promise((resolve, reject) => {
    // 1. XMLHttpRequest yaratish
    const xhr = new XMLHttpRequest();
    
    // Progress ni kuzatish
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        const progress = Math.round((event.loaded / event.total) * 70);
        onProgress(progress);
      }
    };

    // Yuklash tugaganda
    xhr.onload = async () => {
      try {
        if (xhr.status >= 200 && xhr.status < 300) {
          const result = JSON.parse(xhr.responseText);
          
          if (!result.success || !result.result?.uid) {
            reject(new Error('Video yuklashda xatolik yuz berdi'));
            return;
          }

          const videoId = result.result.uid;
          
          // 2. Meta ma'lumotlarni yangilash
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
            console.error('Meta ma\'lumotlarni yangilashda xatolik:', await metaResponse.text());
          }

          // 3. Video holatini tekshirish
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

                // Progress ni yangilash (70-95%)
                if (onProgress) {
                  const processingProgress = Math.min(95, 70 + (attempts * 25 / maxAttempts));
                  onProgress(processingProgress);
                }
              }

              attempts++;
              await new Promise(resolve => setTimeout(resolve, pollInterval));
              await checkStatus();
            } catch (error) {
              console.error('Video holatini tekshirishda xatolik:', error);
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
          reject(new Error('Video yuklashda xatolik yuz berdi'));
        }
      } catch (error) {
        reject(error);
      }
    };

    // Xatolik yuz berganda
    xhr.onerror = () => {
      reject(new Error('Video yuklashda tarmoq xatosi yuz berdi'));
    };

    // 4. Video yuklash
    const formData = new FormData();
    formData.append('file', file);

    xhr.open('POST', `https://api.cloudflare.com/client/v4/accounts/${process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID}/stream`);
    xhr.setRequestHeader('Authorization', `Bearer ${process.env.NEXT_PUBLIC_CLOUDFLARE_API_TOKEN}`);
    xhr.send(formData);
  });
}