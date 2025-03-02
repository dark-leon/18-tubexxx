import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: '18-Tube XXX - Free Adult Videos in HD Quality',
  description: 'Watch and download free adult videos in HD quality. The best collection of XXX content, daily updates, no ads, and fast streaming.',
  keywords: 'adult videos, xxx videos, porn videos, free porn, hd porn, streaming porn, xxx content, adult content, porn streaming',
  metadataBase: new URL('https://18-tubexxx.com'),
  openGraph: {
    title: '18-Tube XXX - Free Adult Videos in HD Quality',
    description: 'Watch and download free adult videos in HD quality. The best collection of XXX content, daily updates, no ads, and fast streaming.',
    url: 'https://18-tubexxx.com',
    siteName: '18-Tube XXX',
    images: [
      {
        url: '/icon-512.png',
        width: 512,
        height: 512,
        alt: '18-Tube XXX Logo',
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '18-Tube XXX - Free Adult Videos in HD Quality',
    description: 'Watch and download free adult videos in HD quality. The best collection of XXX content.',
    images: ['/icon-512.png'],
  },
  icons: {
    icon: [
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    shortcut: [
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' }
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/manifest.json',
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: '08d2a85c78474d34',
    other: {
      me: ['your-personal-domain-verification']
    }
  },
  alternates: {
    canonical: 'https://www.18-tubexxx.com'
  },
  authors: [{ name: '18-Tube XXX' }],
  category: 'Adult Entertainment',
  classification: 'Adult Content'
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "18-Tube XXX - Free Adult Videos in HD Quality",
    "url": "https://www.18-tubexxx.com",
    "description": "Watch and download free adult videos in HD quality. The best collection of XXX content, daily updates, no ads, and fast streaming.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://www.18-tubexxx.com/search?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    },
    "sameAs": [
      "https://twitter.com/18tubexxx",
      "https://www.instagram.com/18tubexxx"
    ],
    "publisher": {
      "@type": "Organization",
      "name": "18-Tube XXX - Free Adult Videos in HD Quality",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.18-tubexxx.com/icon-512.png",
        "width": 512,
        "height": 512
      }
    }
  };

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <link rel="canonical" href="https://www.18-tubexxx.com" />
        <link rel="alternate" hrefLang="x-default" href="https://www.18-tubexxx.com" />
        <link rel="alternate" hrefLang="en" href="https://www.18-tubexxx.com" />
        <meta name="rating" content="adult" />
        <meta name="age-rating" content="adult" />
        <meta name="mature" content="yes" />
        <meta name="adult" content="yes" />
        <meta name="rating" content="RTA-5042-1996-1400-1577-RTA" />
        <link rel="shortcut icon" type="image/png" href="/icon-512.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icon-512.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icon.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schemaData)
          }}
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
