import type { Metadata } from "next";
import "./globals.css";

export const metadata = {
  metadataBase: new URL('https://www.18-tubexxx.com'),
  title: '18+ Adult Videos - Watch and Download HD Porn Videos | TubeXXX',
  description: 'Watch and download free HD adult videos. Best quality porn videos online. New adult content added daily. Large collection of XXX videos in HD quality.',
  keywords: 'adult videos, porn videos, free porn, HD porn, streaming porn, download porn, xxx videos, adult content, porn tube, free adult videos',
  openGraph: {
    title: '18+ Adult Videos - Watch and Download HD Porn Videos | TubeXXX',
    description: 'Watch and download free HD adult videos. Best quality porn videos online. New adult content added daily. Large collection of XXX videos in HD quality.',
    type: 'website',
    locale: 'en_US',
    url: 'https://www.18-tubexxx.com',
    siteName: 'TubeXXX - Free Adult Videos',
    images: [
      {
        url: 'https://www.18-tubexxx.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'TubeXXX - Adult Video Site Preview'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: '18+ Adult Videos - TubeXXX',
    description: 'Watch and download free HD adult videos. Best quality porn videos online.',
    images: ['https://www.18-tubexxx.com/twitter-image.jpg']
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
