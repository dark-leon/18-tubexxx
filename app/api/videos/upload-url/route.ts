import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;

    if (!accountId || !apiToken) {
      console.error('Missing env vars:', { accountId, apiToken });
      throw new Error('Cloudflare API kalitlari topilmadi');
    }

    const { metadata } = await request.json();

    // Get direct upload URL
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/direct_upload`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          maxDurationSeconds: 3600,
          meta: metadata,
          allowedOrigins: ['*']
        }),
      }
    );

    const data = await response.json();
    console.log('Cloudflare API response:', data);

    if (!response.ok) {
      console.error('Cloudflare API error:', data);
      return NextResponse.json(
        { error: data.errors?.[0]?.message || 'Cloudflare API xatosi' },
        { status: response.status }
      );
    }
    
    if (!data.success || !data.result?.uploadURL) {
      console.error('Invalid Cloudflare response:', data);
      return NextResponse.json(
        { error: 'Noto\'g\'ri API javobi' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      uploadURL: data.result.uploadURL,
      uid: data.result.uid
    });
  } catch (error: any) {
    console.error('Error getting upload URL:', error);
    return NextResponse.json(
      { error: error.message || 'Server xatosi' },
      { status: 500 }
    );
  }
} 