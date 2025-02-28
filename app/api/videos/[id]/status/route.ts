import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID}/stream/${params.id}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_CLOUDFLARE_API_TOKEN}`
        }
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Error checking video status' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return NextResponse.json({
      readyToStream: data.result?.readyToStream,
      thumbnail: data.result?.thumbnail,
      playback: data.result?.playback,
      state: data.result?.status?.state
    });
  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json(
      { error: 'Error checking video status' },
      { status: 500 }
    );
  }
} 