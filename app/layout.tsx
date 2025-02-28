import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "18-TubeXXX - Video Kutubxona",
  description: "Cloudflare Stream bilan videolar kutubxonasi",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uz">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
