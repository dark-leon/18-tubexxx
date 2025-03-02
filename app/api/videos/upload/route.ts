import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const videoData = await req.json();

    // Video ma'lumotlarini to'g'ridan-to'g'ri qaytarish
    return NextResponse.json({ 
      success: true, 
      video: {
        uid: videoData.uid,
        meta: {
          name: videoData.meta.name,
          description: videoData.meta.description,
          categories: videoData.meta.categories,
          tags: videoData.meta.tags,
          isApproved: "false",
          uploadedAt: new Date().toISOString()
        },
        thumbnail: videoData.thumbnail,
        preview: videoData.preview,
        duration: videoData.duration,
        playback: {
          hls: videoData.playback.hls,
          dash: videoData.playback.dash
        }
      }
    });
  } catch (error) {
    console.error('Video upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Video yuklanishida xatolik yuz berdi' },
      { status: 500 }
    );
  }
} 