import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const videoData = await req.json();

    // Video ma'lumotlarini ma'lumotlar bazasiga saqlash
    const video = await prisma.video.create({
      data: {
        uid: videoData.uid,
        title: videoData.meta.name,
        description: videoData.meta.description,
        thumbnail: videoData.thumbnail,
        preview: videoData.preview,
        duration: videoData.duration,
        categories: videoData.meta.categories,
        tags: videoData.meta.tags,
        isApproved: false,
        readyToStream: false,
        status: "PENDING",
        progress: 0,
        playback: {
          create: {
            hls: videoData.playback.hls,
            dash: videoData.playback.dash
          }
        }
      }
    });

    return NextResponse.json({ success: true, video });
  } catch (error) {
    console.error('Video upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Video yuklanishida xatolik yuz berdi' },
      { status: 500 }
    );
  }
} 