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
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 lg:mb-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            Video Kutubxona
          </h1>
          
          {/* Filter buttons */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-full text-sm font-medium text-gray-300 hover:text-white transition-colors">
              Barchasi
            </button>
            <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-full text-sm font-medium text-gray-300 hover:text-white transition-colors">
              Yangi qo'shilgan
            </button>
            <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-full text-sm font-medium text-gray-300 hover:text-white transition-colors">
              Ko'p ko'rilgan
            </button>
          </div>

          {/* Video grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {videos.map((video: VideoData) => (
              <Link
                href={`/watch/${video.uid}`}
                key={video.uid}
                className="group bg-gray-800/50 backdrop-blur-sm rounded-lg overflow-hidden transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-purple-500/20"
              >
                <div className="aspect-video relative">
                  <iframe
                    src={`https://iframe.videodelivery.net/${video.uid}`}
                    className="w-full h-full absolute top-0 left-0"
                    allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-white text-sm">
                      <span className="flex items-center bg-black/50 px-2 py-1 rounded-full">
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
                      <span className="flex items-center bg-black/50 px-2 py-1 rounded-full">
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
                        {video.meta.views || '0'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="p-3 sm:p-4">
                  <h2 className="text-base sm:text-lg font-semibold text-white mb-2 line-clamp-2">
                    {video.meta.name || 'Nomsiz video'}
                  </h2>
                  {video.meta.category && (
                    <div className="mt-2 flex gap-1 flex-wrap">
                      {video.meta.category.split(', ').map((category, index) => (
                        <span
                          key={index}
                          className="text-xs text-purple-400 bg-purple-400/10 px-2 py-0.5 rounded-full"
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {/* Load more button */}
          <div className="mt-8 text-center">
            <button className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium transition-colors">
              Ko'proq yuklash
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

