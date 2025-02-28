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

export async function updateVideoMeta(videoId: string, meta: Partial<VideoData['meta']>) {
  try {
    // Get current video metadata first
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID}/stream/${videoId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_CLOUDFLARE_API_TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch current video metadata');
    }

    const currentVideo = await response.json();
    
    // Merge existing metadata with new metadata
    const updatedMeta = {
      ...currentVideo.result.meta,
      ...meta,
    };

    // Update video with merged metadata
    const updateResponse = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID}/stream/${videoId}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_CLOUDFLARE_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          meta: updatedMeta
        }),
      }
    );

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      console.error('Update Error:', errorText);
      throw new Error('Failed to update video metadata');
    }

    const updatedData = await updateResponse.json();
    return updatedData.result;
  } catch (error) {
    console.error('Error updating video metadata:', error);
    throw error;
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