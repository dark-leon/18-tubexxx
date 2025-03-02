import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: '18-Tube XXX - Adult Video Platform',
  description: 'Watch adult videos in HD quality',
  metadataBase: new URL('https://18-tube.xxx'),
  openGraph: {
    title: '18-Tube XXX - Adult Video Platform',
    description: 'Watch adult videos in HD quality',
    url: 'https://18-tube.xxx',
    siteName: '18-Tube XXX',
    images: [
      {
        url: '/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: '18-Tube XXX Logo',
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '18-Tube XXX - Adult Video Platform',
    description: 'Watch adult videos in HD quality',
    images: ['/opengraph-image.png'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/manifest.json',
  themeColor: '#030712',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  robots: {
    index: true,
    follow: true,
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
  },
  alternates: {
    canonical: 'https://www.18-tubexxx.com'
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "TubeXXX - Free Adult Videos",
    "url": "https://www.18-tubexxx.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://www.18-tubexxx.com/search?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#030712" />
        <link rel="canonical" href="https://www.18-tubexxx.com" />
        <link rel="alternate" hrefLang="x-default" href="https://www.18-tubexxx.com" />
        <link rel="alternate" hrefLang="en" href="https://www.18-tubexxx.com" />
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
