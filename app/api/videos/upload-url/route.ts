import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { metadata } = await request.json();

    const tusResponse = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID}/stream?direct_user=true`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_CLOUDFLARE_API_TOKEN}`,
          'Tus-Resumable': '1.0.0',
        }
      }
    );

    if (!tusResponse.ok) {
      console.error('TUS initialization error:', await tusResponse.text());
      return NextResponse.json(
        { error: 'Video yuklashni boshlashda xatolik' },
        { status: 500 }
      );
    }

    const uploadURL = tusResponse.headers.get('Location');
    if (!uploadURL) {
      return NextResponse.json(
        { error: 'Upload URL olinmadi' },
        { status: 500 }
      );
    }

    const uid = uploadURL.split('/').pop();
    if (!uid) {
      return NextResponse.json(
        { error: 'Video ID olinmadi' },
        { status: 500 }
      );
    }

    return NextResponse.json({ uploadURL, uid });
  } catch (error) {
    console.error('Upload URL error:', error);
    return NextResponse.json(
      { error: 'Video yuklash URL olishda xatolik' },
      { status: 500 }
    );
  }
} 