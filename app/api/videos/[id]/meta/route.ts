import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const metadata = await request.json();

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID}/stream/${params.id}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_CLOUDFLARE_API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ meta: metadata })
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Error updating video metadata' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data.result);
  } catch (error) {
    console.error('Metadata update error:', error);
    return NextResponse.json(
      { error: 'Error updating video metadata' },
      { status: 500 }
    );
  }
} 