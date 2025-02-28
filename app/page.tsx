import { getVideos } from './utils/cloudflare';
import type { VideoData } from './utils/cloudflare';
import Navbar from './components/Navbar';
import Link from 'next/link';

export default async function Home() {
  const videos: VideoData[] = await getVideos();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-8">
        <h1 className="text-4xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
          Video Kutubxona
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {videos.map((video: VideoData) => (
            <Link
              href={`/watch/${video.uid}`}
              key={video.uid}
              className="bg-gray-800/50 backdrop-blur-sm rounded-lg overflow-hidden transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-purple-500/20"
            >
              <div className="aspect-video relative group">
                <iframe
                  src={`https://iframe.videodelivery.net/${video.uid}`}
                  className="w-full h-full absolute top-0 left-0"
                  allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                 
                </div>
              </div>
              <div className="p-4">
                <h2 className="text-lg font-semibold text-white mb-2 truncate">
                  {video.meta.name || 'Nomsiz video'}
                </h2>
                <div className="flex items-center justify-between text-gray-400 text-sm">
                  <span className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {Math.floor(video.duration / 60)}:{String(Math.floor(video.duration % 60)).padStart(2, '0')}
                  </span>
                  <span className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    {video.meta.views || '0'} ko'rishlar
                  </span>
                </div>
                {video.meta.category && (
                  <div className="mt-2 flex gap-1 flex-wrap">
                    {video.meta.category.split(', ').map((category, index) => (
                      <span key={index} className="text-xs text-purple-400 bg-purple-400/10 px-2 py-0.5 rounded-full">
                        {category}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}

