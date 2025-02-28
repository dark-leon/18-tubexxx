import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const accountId = process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID;
    const apiToken = process.env.NEXT_PUBLIC_CLOUDFLARE_API_TOKEN;

    if (!accountId || !apiToken) {
      console.error('Missing env vars:', { accountId, apiToken });
      throw new Error('Cloudflare API kalitlari topilmadi');
    }

    const meta = await request.json();
    const videoId = params.id;

    // Get current video metadata first
    const currentResponse = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/${videoId}`,
      {
        headers: {
          Authorization: `Bearer ${apiToken}`,
        },
      }
    );

    if (!currentResponse.ok) {
      throw new Error('Failed to fetch current video metadata');
    }

    const currentVideo = await currentResponse.json();
    
    // Merge existing metadata with new metadata
    const updatedMeta = {
      ...currentVideo.result.meta,
      ...meta,
    };

    // Update video with merged metadata
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/${videoId}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          meta: updatedMeta
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to update video metadata');
    }

    const data = await response.json();
    return NextResponse.json(data.result);
  } catch (error: any) {
    console.error('Error updating video metadata:', error);
    return NextResponse.json(
      { error: error.message || 'Server xatosi' },
      { status: 500 }
    );
  }
} 