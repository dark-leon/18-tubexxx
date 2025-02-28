'use client';

import { useState, useEffect } from 'react';
import { getVideos } from './utils/cloudflare';
import type { VideoData } from './utils/cloudflare';
import Navbar from './components/Navbar';
import Link from 'next/link';

export default function Home() {
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<VideoData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const data = await getVideos();
        setVideos(data);
        setFilteredVideos(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching videos:', error);
        setIsLoading(false);
      }
    };

    fetchVideos();
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    filterVideos(query, activeFilter);
  };

  const filterVideos = (query: string, filter: string) => {
    let filtered = [...videos];

    // Apply search filter
    if (query) {
      filtered = filtered.filter((video) =>
        (video.meta.name?.toLowerCase() || '').includes(query.toLowerCase()) ||
        (video.meta.category?.toLowerCase() || '').includes(query.toLowerCase())
      );
    }

    // Apply category filter
    switch (filter) {
      case 'recent':
        filtered.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());
        break;
      case 'popular':
        filtered.sort((a, b) => {
          const viewsA = parseInt(b.meta.views || '0', 10);
          const viewsB = parseInt(a.meta.views || '0', 10);
          return viewsA - viewsB;
        });
        break;
      default:
        // 'all' - no additional filtering needed
        break;
    }

    setFilteredVideos(filtered);
  };

  const handleFilterClick = (filter: string) => {
    setActiveFilter(filter);
    filterVideos(searchQuery, filter);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
        <Navbar onSearch={handleSearch} />
        <main className="container mx-auto px-4 pt-24 pb-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <Navbar onSearch={handleSearch} />
      <main className="container mx-auto px-4 pt-24 pb-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 lg:mb-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            Free Adult Videos
          </h1>
          
          {/* Filter buttons */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => handleFilterClick('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeFilter === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => handleFilterClick('recent')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeFilter === 'recent'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              Recently Added
            </button>
            <button
              onClick={() => handleFilterClick('popular')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeFilter === 'popular'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              Most Viewed
            </button>
          </div>

          {/* Video grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredVideos.map((video: VideoData) => (
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
                        {video.meta.views || '0'} views
                      </span>
                    </div>
                  </div>
                </div>
                <div className="p-3 sm:p-4">
                  <h2 className="text-base sm:text-lg font-semibold text-white mb-2 line-clamp-2">
                    {video.meta.name || 'Untitled video'}
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
              Load More
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

