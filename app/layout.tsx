import type { Metadata } from "next";
import "./globals.css";

export const metadata = {
  metadataBase: new URL('https://yourdomain.com'),
  title: '18+ Adult Videos - Watch and Download HD Porn Videos | TubeXXX',
  description: 'Watch and download free HD adult videos. Best quality porn videos online. New adult content added daily. Large collection of XXX videos in HD quality.',
  keywords: 'adult videos, porn videos, free porn, HD porn, streaming porn, download porn, xxx videos, adult content, porn tube, free adult videos',
  openGraph: {
    title: '18+ Adult Videos - Watch and Download HD Porn Videos | TubeXXX',
    description: 'Watch and download free HD adult videos. Best quality porn videos online. New adult content added daily. Large collection of XXX videos in HD quality.',
    type: 'website',
    locale: 'en_US',
    url: 'https://yourdomain.com',
    siteName: 'TubeXXX - Free Adult Videos',
    images: [
      {
        url: 'https://yourdomain.com/og-image.jpg',
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
    images: ['https://yourdomain.com/twitter-image.jpg']
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
    canonical: 'https://yourdomain.com'
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#030712" />
        <link rel="canonical" href="https://yourdomain.com" />
        <link rel="alternate" hrefLang="x-default" href="https://yourdomain.com" />
        <link rel="alternate" hrefLang="en" href="https://yourdomain.com" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
