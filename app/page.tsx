'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { getVideos } from './utils/cloudflare';
import type { VideoData } from './utils/cloudflare';
import Navbar from './components/Navbar';
import Link from 'next/link';

function VideoGrid() {
  const searchParams = useSearchParams();
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<VideoData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

  useEffect(() => {
    fetchVideos();
  }, []);

  useEffect(() => {
    filterVideos(searchQuery, activeFilter);
  }, [videos, searchQuery, activeFilter]);

  const fetchVideos = async () => {
    try {
      const data = await getVideos();
      setVideos(data);
      filterVideos(searchQuery, activeFilter, data);
    } catch (err) {
      setError('Error loading videos');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const filterVideos = (query: string, filter: string, videoList = videos) => {
    let filtered = [...videoList];

    // Apply search filter
    if (query) {
      const searchLower = query.toLowerCase();
      filtered = filtered.filter(video =>
        video.meta.name?.toLowerCase().includes(searchLower) ||
        video.meta.description?.toLowerCase().includes(searchLower) ||
        video.meta.category?.toLowerCase().includes(searchLower)
      );
    }

    // Apply category filter
    switch (filter) {
      case 'new':
        filtered.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());
        break;
      case 'popular':
        filtered.sort((a, b) => parseInt(b.meta.views || '0') - parseInt(a.meta.views || '0'));
        break;
      default:
        // 'all' - no additional filtering needed
        break;
    }

    setFilteredVideos(filtered);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
        <Navbar onSearch={handleSearch} />
        <div className="container mx-auto px-4 pt-24 pb-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
        <Navbar onSearch={handleSearch} />
        <div className="container mx-auto px-4 pt-24 pb-8">
          <div className="text-center text-xl text-red-500">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <Navbar onSearch={handleSearch} />
      <main className="container mx-auto px-4 pt-24 pb-8">
        <h1 className="text-4xl font-bold text-center mb-8">Free Adult Videos</h1>

        {/* Filter buttons */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeFilter === 'all'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveFilter('new')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeFilter === 'new'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Recently Added
          </button>
          <button
            onClick={() => setActiveFilter('popular')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeFilter === 'popular'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Most Viewed
          </button>
        </div>

        {/* Search results info */}
        {searchQuery && (
          <div className="text-center mb-8">
            <p className="text-gray-400">
              {filteredVideos.length === 0
                ? 'No videos found'
                : `Found ${filteredVideos.length} video${filteredVideos.length === 1 ? '' : 's'}`}
            </p>
          </div>
        )}

        {/* Video grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredVideos.map((video) => (
            <div
              key={video.uid}
              className="group bg-gray-800 rounded-lg overflow-hidden hover:ring-2 hover:ring-purple-500 transition-all"
            >
              {/* Video thumbnail and preview container */}
              <Link href={`/watch/${video.uid}`} className="block">
                <div className="relative aspect-video">
                  <div className="absolute inset-0 bg-black group-hover:hidden">
                    {/* Static thumbnail (shown by default) */}
                    <img
                      src={`https://videodelivery.net/${video.uid}/thumbnails/thumbnail.jpg?time=${Math.floor(video.duration / 2)}s`}
                      alt={video.meta.name || 'Video thumbnail'}
                      className="w-full h-full object-cover"
                    />
                    {/* Play button overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-purple-600/80 flex items-center justify-center">
                        <svg
                          className="w-6 h-6 text-white"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  {/* Video preview (shown on hover) */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <iframe
                      src={`https://iframe.videodelivery.net/${video.uid}?autoplay=true&loop=true&muted=true&controls=false&preload=metadata&poster=${encodeURIComponent(`https://videodelivery.net/${video.uid}/thumbnails/thumbnail.jpg?time=${Math.floor(video.duration / 2)}s`)}`}
                      className="w-full h-full pointer-events-none"
                      allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                    />
                  </div>
                  {/* Video duration overlay */}
                  <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 rounded text-xs text-white">
                    {Math.floor(video.duration / 60)}:
                    {String(Math.floor(video.duration % 60)).padStart(2, '0')}
                  </div>
                </div>
              </Link>

              {/* Video info */}
              <div className="p-4">
                <Link href={`/watch/${video.uid}`} className="block">
                  <h2 className="text-white font-semibold line-clamp-2 mb-2 hover:text-purple-400 transition-colors">
                    {video.meta.name || 'Untitled video'}
                  </h2>
                </Link>
                <div className="flex items-center text-sm text-gray-400 space-x-2 mb-2">
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
                    {video.meta.views || '0'} views
                  </span>
                  <span>•</span>
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
                    {Math.floor(video.duration / 60)}:
                    {String(Math.floor(video.duration % 60)).padStart(2, '0')}
                  </span>
                </div>
                {video.meta.category && (
                  <div className="flex flex-wrap gap-1">
                    {video.meta.category.split(', ').map((category, index) => (
                      <span
                        key={index}
                        className="inline-block px-2 py-0.5 bg-purple-600/20 text-purple-400 rounded-full text-xs"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* No results message */}
        {filteredVideos.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No videos found</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
        <div className="container mx-auto px-4 pt-24 pb-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        </div>
      </div>
    }>
      <VideoGrid />
    </Suspense>
  );
}

