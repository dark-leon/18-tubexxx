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

    if (query) {
      const searchLower = query.toLowerCase();
      filtered = filtered.filter(video =>
        video.meta.name?.toLowerCase().includes(searchLower) ||
        video.meta.description?.toLowerCase().includes(searchLower) ||
        video.meta.category?.toLowerCase().includes(searchLower)
      );
    }

    switch (filter) {
      case 'new':
        filtered.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());
        break;
      case 'popular':
        filtered.sort((a, b) => parseInt(b.meta.views || '0') - parseInt(a.meta.views || '0'));
        break;
      default:
        break;
    }

    setFilteredVideos(filtered);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] bg-[linear-gradient(to_bottom,rgba(0,0,0,0)_0%,rgba(0,0,0,0.8)_100%)] text-white">
        <Navbar onSearch={handleSearch} />
        <div className="container mx-auto px-4 pt-24 pb-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] bg-[linear-gradient(to_bottom,rgba(0,0,0,0)_0%,rgba(0,0,0,0.8)_100%)] text-white">
        <Navbar onSearch={handleSearch} />
        <div className="container mx-auto px-4 pt-24 pb-8">
          <div className="text-center text-xl text-pink-500">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.05)_0%,rgba(6,182,212,0.05)_100%)] pointer-events-none"></div>
      <div className="fixed inset-0 bg-[url('/dots.png')] opacity-[0.03] mix-blend-screen pointer-events-none"></div>
      <Navbar onSearch={handleSearch} />
      <main className="container mx-auto px-4 pt-24 pb-8 relative">
      

        {/* Filter buttons */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeFilter === 'all'
                ? 'bg-gradient-to-r from-emerald-400 to-cyan-400 text-white shadow-lg shadow-emerald-500/20'
                : 'bg-[#111827]/60 text-gray-400 hover:text-white hover:bg-[#1F2937]/80 hover:shadow-lg hover:shadow-cyan-500/10'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveFilter('new')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeFilter === 'new'
                ? 'bg-gradient-to-r from-emerald-400 to-cyan-400 text-white shadow-lg shadow-emerald-500/20'
                : 'bg-[#111827]/60 text-gray-400 hover:text-white hover:bg-[#1F2937]/80 hover:shadow-lg hover:shadow-cyan-500/10'
            }`}
          >
            Recently Added
          </button>
          <button
            onClick={() => setActiveFilter('popular')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeFilter === 'popular'
                ? 'bg-gradient-to-r from-emerald-400 to-cyan-400 text-white shadow-lg shadow-emerald-500/20'
                : 'bg-[#111827]/60 text-gray-400 hover:text-white hover:bg-[#1F2937]/80 hover:shadow-lg hover:shadow-cyan-500/10'
            }`}
          >
            Most Viewed
          </button>
        </div>

        {/* Search results info */}
        {searchQuery && (
          <div className="text-center mb-8">
            <p className="text-gray-500">
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
              className="group bg-[#111827]/60 backdrop-blur-sm rounded-lg overflow-hidden hover:ring-1 hover:ring-cyan-400/50 transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-cyan-500/10"
            >
              {/* Video thumbnail and preview container */}
              <Link href={`/watch/${video.uid}`} className="block">
                <div className="relative aspect-video bg-[#0A0A0F]">
                  <div className="absolute inset-0 bg-black group-hover:hidden">
                    {/* Static thumbnail (shown by default) */}
                    <img
                      src={`https://videodelivery.net/${video.uid}/thumbnails/thumbnail.jpg?time=${Math.floor(video.duration / 2)}s`}
                      alt={video.meta.name || 'Video thumbnail'}
                      className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                    />
                    {/* Play button overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
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
                  <h2 className="text-gray-100 font-medium line-clamp-2 mb-2 group-hover:text-cyan-400 transition-colors">
                    {video.meta.name || 'Untitled video'}
                  </h2>
                </Link>
                <div className="flex items-center text-sm text-gray-500 space-x-2 mb-2">
                  <span className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-1 opacity-75"
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
                      className="w-4 h-4 mr-1 opacity-75"
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
                        className="inline-block px-2 py-0.5 bg-[#1E293B]/60 backdrop-blur-sm text-gray-400 rounded-full text-xs border border-cyan-950"
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
            <p className="text-gray-500 text-lg">No videos found</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0A0A0F] bg-[linear-gradient(to_bottom,rgba(0,0,0,0)_0%,rgba(0,0,0,0.8)_100%)] text-white">
        <div className="container mx-auto px-4 pt-24 pb-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
          </div>
        </div>
      </div>
    }>
      <VideoGrid />
    </Suspense>
  );
}

