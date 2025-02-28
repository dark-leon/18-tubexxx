import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "18-TubeXXX - Free Adult Videos",
  description: "Free adult videos for everyone to watch and enjoy ",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
