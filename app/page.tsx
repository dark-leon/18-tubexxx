'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { getVideos } from './utils/cloudflare';
import type { VideoData } from './utils/cloudflare';
import Navbar from './components/Navbar';
import Link from 'next/link';

// VideoSkeleton komponenti
function VideoSkeleton() {
  return (
    <div className="bg-[#111827]/60 backdrop-blur-sm rounded-lg overflow-hidden">
      {/* Thumbnail skeleton */}
      <div className="relative aspect-video bg-[#1E293B] animate-pulse">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#1F2937] to-transparent skeleton-shine"></div>
      </div>

      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        {/* Title skeleton */}
        <div className="h-5 bg-[#1E293B] rounded animate-pulse w-3/4"></div>
        <div className="h-5 bg-[#1E293B] rounded animate-pulse w-1/2"></div>

        {/* Stats skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-4 w-16 bg-[#1E293B] rounded animate-pulse"></div>
            <div className="h-4 w-16 bg-[#1E293B] rounded animate-pulse"></div>
          </div>
          <div className="h-4 w-20 bg-[#1E293B] rounded animate-pulse"></div>
        </div>

        {/* Categories skeleton */}
        <div className="flex flex-wrap gap-1.5">
          <div className="h-5 w-16 bg-[#1E293B] rounded-full animate-pulse"></div>
          <div className="h-5 w-20 bg-[#1E293B] rounded-full animate-pulse"></div>
          <div className="h-5 w-14 bg-[#1E293B] rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}

function VideoGrid() {
  const searchParams = useSearchParams();
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<VideoData[]>([]);
  const [displayedVideos, setDisplayedVideos] = useState<VideoData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState(searchParams.get('filter') || 'all');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [page, setPage] = useState(1);
  const videosPerPage = 60;
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    fetchVideos();
  }, []);

  useEffect(() => {
    filterVideos(searchQuery, activeFilter);
  }, [videos, searchQuery, activeFilter]);

  useEffect(() => {
    updateDisplayedVideos();
  }, [filteredVideos, page]);

  useEffect(() => {
    const filter = searchParams.get('filter');
    if (filter) {
      setActiveFilter(filter);
    }
  }, [searchParams]);

  const updateDisplayedVideos = () => {
    const startIndex = 0;
    const endIndex = page * videosPerPage;
    const newDisplayedVideos = filteredVideos.slice(startIndex, endIndex);
    setDisplayedVideos(newDisplayedVideos);
    setHasMore(endIndex < filteredVideos.length);
  };

  const loadMore = () => {
    setIsLoadingMore(true);
    setPage(prevPage => prevPage + 1);
    setTimeout(() => {
      setIsLoadingMore(false);
    }, 500);
  };

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
        video.meta.description?.toLowerCase().includes(searchLower)
      );
    }

    // Kategoriya yoki filter bo'yicha saralash
    switch (filter) {
      case 'new':
        filtered.sort((a, b) => {
          const dateA = new Date(a.meta.uploadedAt || a.created);
          const dateB = new Date(b.meta.uploadedAt || b.created);
          return dateB.getTime() - dateA.getTime();
        });
        break;

      case 'popular':
        filtered.sort((a, b) => {
          const viewsA = parseInt(a.meta.views || '0');
          const viewsB = parseInt(b.meta.views || '0');
          if (viewsA === viewsB) {
            const likesA = parseInt(a.meta.likes || '0');
            const likesB = parseInt(b.meta.likes || '0');
            return likesB - likesA;
          }
          return viewsB - viewsA;
        });
        break;

      case 'liked':
        filtered.sort((a, b) => {
          const likesA = parseInt(a.meta.likes || '0');
          const likesB = parseInt(b.meta.likes || '0');
          return likesB - likesA;
        });
        break;

      case 'trending':
        // So'nggi 7 kunlik videolarni ko'rishlar va layklar bo'yicha saralash
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        
        filtered.sort((a, b) => {
          const dateA = new Date(a.meta.uploadedAt || a.created);
          const dateB = new Date(b.meta.uploadedAt || b.created);
          
          const isRecentA = dateA > sevenDaysAgo;
          const isRecentB = dateB > sevenDaysAgo;
          
          if (isRecentA && isRecentB) {
            const scoreA = parseInt(a.meta.views || '0') + parseInt(a.meta.likes || '0') * 2;
            const scoreB = parseInt(b.meta.views || '0') + parseInt(b.meta.likes || '0') * 2;
            return scoreB - scoreA;
          }
          
          if (isRecentA) return -1;
          if (isRecentB) return 1;
          
          return dateB.getTime() - dateA.getTime();
        });
        break;

      case 'all':
        // Standart holat - eng yangi videolar tepada
        filtered.sort((a, b) => {
          const dateA = new Date(a.meta.uploadedAt || a.created);
          const dateB = new Date(b.meta.uploadedAt || b.created);
          return dateB.getTime() - dateA.getTime();
        });
        break;

      default:
        // Kategoriya bo'yicha filterlash
        if (filter) {
          filtered = filtered.filter(video => 
            video.meta.category?.toLowerCase().includes(filter.toLowerCase())
          );
        }
        // Kategoriya ichida eng yangi videolar tepada
        filtered.sort((a, b) => {
          const dateA = new Date(a.meta.uploadedAt || a.created);
          const dateB = new Date(b.meta.uploadedAt || b.created);
          return dateB.getTime() - dateA.getTime();
        });
    }

    setFilteredVideos(filtered);
    // Sahifani qayta 1 ga o'rnatish
    setPage(1);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] bg-[linear-gradient(to_bottom,rgba(0,0,0,0)_0%,rgba(0,0,0,0.8)_100%)] text-white">
        <Navbar 
          onSearch={handleSearch} 
          onFilterChange={(filter) => setActiveFilter(filter)}
        />
        <div className="container mx-auto px-4 pt-24 pb-8">
          {/* Skeleton grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(12)].map((_, index) => (
              <VideoSkeleton key={index} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] bg-[linear-gradient(to_bottom,rgba(0,0,0,0)_0%,rgba(0,0,0,0.8)_100%)] text-white">
        <Navbar 
          onSearch={handleSearch} 
          onFilterChange={(filter) => setActiveFilter(filter)}
        />
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
      <Navbar 
        onSearch={handleSearch} 
        onFilterChange={(filter) => setActiveFilter(filter)}
      />
      <main className="container mx-auto px-4 pt-24 pb-8 relative">
        {/* Kategoriya tugmalari */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {/* All Videos tugmasi */}
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeFilter === 'all'
                ? 'bg-gradient-to-r from-emerald-400 to-cyan-400 text-white shadow-lg shadow-emerald-500/20'
                : 'bg-[#111827]/60 text-gray-400 hover:text-white hover:bg-[#1F2937]/80 hover:shadow-lg hover:shadow-cyan-500/10'
            }`}
          >
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              <span>All Videos (18+)</span>
            </div>
          </button>

          {/* Main Categories dropdown */}
          <div className="relative group">
            <button
              className={`px-4 py-2 rounded-lg transition-all bg-[#111827]/60 text-gray-400 hover:text-white hover:bg-[#1F2937]/80 hover:shadow-lg hover:shadow-cyan-500/10 flex items-center gap-2`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              <span>Main</span>
            </button>
            <div className="absolute z-50 left-0 mt-2 w-48 rounded-lg bg-[#1F2937] shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2">
              {['Amateur', 'Asian', 'Blonde', 'Brunette', 'Ebony', 'Latina', 'MILF', 'Redhead', 'Russian', 'Teen'].map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveFilter(category.toLowerCase())}
                  className={`w-full px-4 py-2 text-left transition-all ${
                    activeFilter === category.toLowerCase()
                      ? 'bg-gradient-to-r from-emerald-400 to-cyan-400 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-[#111827]'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Features dropdown */}
          <div className="relative group">
            <button
              className={`px-4 py-2 rounded-lg transition-all bg-[#111827]/60 text-gray-400 hover:text-white hover:bg-[#1F2937]/80 hover:shadow-lg hover:shadow-cyan-500/10 flex items-center gap-2`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              <span>Features</span>
            </button>
            <div className="absolute z-50 left-0 mt-2 w-48 rounded-lg bg-[#1F2937] shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2">
              {['Big Ass', 'Big Tits', 'Real', 'Verified'].map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveFilter(category.toLowerCase())}
                  className={`w-full px-4 py-2 text-left transition-all ${
                    activeFilter === category.toLowerCase()
                      ? 'bg-gradient-to-r from-emerald-400 to-cyan-400 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-[#111827]'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Actions dropdown */}
          <div className="relative group">
            <button
              className={`px-4 py-2 rounded-lg transition-all bg-[#111827]/60 text-gray-400 hover:text-white hover:bg-[#1F2937]/80 hover:shadow-lg hover:shadow-cyan-500/10 flex items-center gap-2`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              <span>Actions</span>
            </button>
            <div className="absolute z-50 left-0 mt-2 w-48 rounded-lg bg-[#1F2937] shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2">
              {['Anal', 'Blowjob', 'Creampie', 'Cumshot', 'DeepThroat', 'Doggystyle', 'Facial', 'Hardcore', 'Interracial', 'Lesbian', 'Masturbation', 'Orgasm', 'POV', 'Public', 'Solo', 'Squirt', 'Threesome', 'Toys'].map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveFilter(category.toLowerCase())}
                  className={`w-full px-4 py-2 text-left transition-all ${
                    activeFilter === category.toLowerCase()
                      ? 'bg-gradient-to-r from-emerald-400 to-cyan-400 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-[#111827]'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
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
          {displayedVideos.map((video) => (
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
              <div className="p-4 space-y-3">
                <Link href={`/watch/${video.uid}`} className="block">
                  <h2 className="text-lg font-semibold text-white hover:text-cyan-400 transition-colors">
                    {video.meta.name || 'Untitled Video'}
                  </h2>
                </Link>
                <p className="text-gray-400">{video.meta.description || 'No description'}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-gray-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span>{video.meta.views || '0'}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                      </svg>
                      <span>{video.meta.likes || '0'}</span>
                    </div>
                  </div>
                  <div className="text-gray-400">
                    {new Date(video.meta.uploadedAt || video.created).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {video.meta.category?.split(',').map((category) => (
                    <span
                      key={category}
                      className="px-2 py-1 bg-[#1F2937] rounded-full text-xs text-gray-400"
                    >
                      {category.trim()}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load more button */}
        {hasMore && (
          <div className="text-center mt-8">
            <button
              onClick={loadMore}
              disabled={isLoadingMore}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-400 to-cyan-400 text-white shadow-lg shadow-emerald-500/20 hover:shadow-cyan-500/30 transition-all"
            >
              {isLoadingMore ? 'Loading...' : 'Load More'}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

function HomePageContent() {
  const searchParams = useSearchParams();
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<VideoData[]>([]);
  const [displayedVideos, setDisplayedVideos] = useState<VideoData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState(searchParams.get('filter') || 'all');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [page, setPage] = useState(1);
  const videosPerPage = 60;
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    fetchVideos();
  }, []);

  useEffect(() => {
    filterVideos(searchQuery, activeFilter);
  }, [videos, searchQuery, activeFilter]);

  useEffect(() => {
    updateDisplayedVideos();
  }, [filteredVideos, page]);

  useEffect(() => {
    const filter = searchParams.get('filter');
    if (filter) {
      setActiveFilter(filter);
    }
  }, [searchParams]);

  const updateDisplayedVideos = () => {
    const startIndex = 0;
    const endIndex = page * videosPerPage;
    const newDisplayedVideos = filteredVideos.slice(startIndex, endIndex);
    setDisplayedVideos(newDisplayedVideos);
    setHasMore(endIndex < filteredVideos.length);
  };

  const loadMore = () => {
    setIsLoadingMore(true);
    setPage(prevPage => prevPage + 1);
    setTimeout(() => {
      setIsLoadingMore(false);
    }, 500);
  };

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
        video.meta.description?.toLowerCase().includes(searchLower)
      );
    }

    // Kategoriya yoki filter bo'yicha saralash
    switch (filter) {
      case 'new':
        filtered.sort((a, b) => {
          const dateA = new Date(a.meta.uploadedAt || a.created);
          const dateB = new Date(b.meta.uploadedAt || b.created);
          return dateB.getTime() - dateA.getTime();
        });
        break;

      case 'popular':
        filtered.sort((a, b) => {
          const viewsA = parseInt(a.meta.views || '0');
          const viewsB = parseInt(b.meta.views || '0');
          if (viewsA === viewsB) {
            const likesA = parseInt(a.meta.likes || '0');
            const likesB = parseInt(b.meta.likes || '0');
            return likesB - likesA;
          }
          return viewsB - viewsA;
        });
        break;

      case 'liked':
        filtered.sort((a, b) => {
          const likesA = parseInt(a.meta.likes || '0');
          const likesB = parseInt(b.meta.likes || '0');
          return likesB - likesA;
        });
        break;

      case 'trending':
        // So'nggi 7 kunlik videolarni ko'rishlar va layklar bo'yicha saralash
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        
        filtered.sort((a, b) => {
          const dateA = new Date(a.meta.uploadedAt || a.created);
          const dateB = new Date(b.meta.uploadedAt || b.created);
          
          const isRecentA = dateA > sevenDaysAgo;
          const isRecentB = dateB > sevenDaysAgo;
          
          if (isRecentA && isRecentB) {
            const scoreA = parseInt(a.meta.views || '0') + parseInt(a.meta.likes || '0') * 2;
            const scoreB = parseInt(b.meta.views || '0') + parseInt(b.meta.likes || '0') * 2;
            return scoreB - scoreA;
          }
          
          if (isRecentA) return -1;
          if (isRecentB) return 1;
          
          return dateB.getTime() - dateA.getTime();
        });
        break;

      case 'all':
        // Standart holat - eng yangi videolar tepada
        filtered.sort((a, b) => {
          const dateA = new Date(a.meta.uploadedAt || a.created);
          const dateB = new Date(b.meta.uploadedAt || b.created);
          return dateB.getTime() - dateA.getTime();
        });
        break;

      default:
        // Kategoriya bo'yicha filterlash
        if (filter) {
          filtered = filtered.filter(video => 
            video.meta.category?.toLowerCase().includes(filter.toLowerCase())
          );
        }
        // Kategoriya ichida eng yangi videolar tepada
        filtered.sort((a, b) => {
          const dateA = new Date(a.meta.uploadedAt || a.created);
          const dateB = new Date(b.meta.uploadedAt || b.created);
          return dateB.getTime() - dateA.getTime();
        });
    }

    setFilteredVideos(filtered);
    // Sahifani qayta 1 ga o'rnatish
    setPage(1);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] bg-[linear-gradient(to_bottom,rgba(0,0,0,0)_0%,rgba(0,0,0,0.8)_100%)] text-white">
        <Navbar 
          onSearch={handleSearch} 
          onFilterChange={(filter) => setActiveFilter(filter)}
        />
        <div className="container mx-auto px-4 pt-24 pb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(12)].map((_, index) => (
              <VideoSkeleton key={index} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] bg-[linear-gradient(to_bottom,rgba(0,0,0,0)_0%,rgba(0,0,0,0.8)_100%)] text-white">
        <Navbar 
          onSearch={handleSearch} 
          onFilterChange={(filter) => setActiveFilter(filter)}
        />
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
      <Navbar 
        onSearch={handleSearch} 
        onFilterChange={(filter) => setActiveFilter(filter)}
      />
      <main className="container mx-auto px-4 pt-24 pb-8 relative">
        {/* Kategoriya tugmalari */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {/* All Videos tugmasi */}
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeFilter === 'all'
                ? 'bg-gradient-to-r from-emerald-400 to-cyan-400 text-white shadow-lg shadow-emerald-500/20'
                : 'bg-[#111827]/60 text-gray-400 hover:text-white hover:bg-[#1F2937]/80 hover:shadow-lg hover:shadow-cyan-500/10'
            }`}
          >
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              <span>All Videos (18+)</span>
            </div>
          </button>

          {/* Main Categories dropdown */}
          <div className="relative group">
            <button
              className={`px-4 py-2 rounded-lg transition-all bg-[#111827]/60 text-gray-400 hover:text-white hover:bg-[#1F2937]/80 hover:shadow-lg hover:shadow-cyan-500/10 flex items-center gap-2`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              <span>Main</span>
            </button>
            <div className="absolute z-50 left-0 mt-2 w-48 rounded-lg bg-[#1F2937] shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2">
              {['Amateur', 'Asian', 'Blonde', 'Brunette', 'Ebony', 'Latina', 'MILF', 'Redhead', 'Russian', 'Teen'].map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveFilter(category.toLowerCase())}
                  className={`w-full px-4 py-2 text-left transition-all ${
                    activeFilter === category.toLowerCase()
                      ? 'bg-gradient-to-r from-emerald-400 to-cyan-400 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-[#111827]'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Features dropdown */}
          <div className="relative group">
            <button
              className={`px-4 py-2 rounded-lg transition-all bg-[#111827]/60 text-gray-400 hover:text-white hover:bg-[#1F2937]/80 hover:shadow-lg hover:shadow-cyan-500/10 flex items-center gap-2`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              <span>Features</span>
            </button>
            <div className="absolute z-50 left-0 mt-2 w-48 rounded-lg bg-[#1F2937] shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2">
              {['Big Ass', 'Big Tits', 'Real', 'Verified'].map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveFilter(category.toLowerCase())}
                  className={`w-full px-4 py-2 text-left transition-all ${
                    activeFilter === category.toLowerCase()
                      ? 'bg-gradient-to-r from-emerald-400 to-cyan-400 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-[#111827]'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Actions dropdown */}
          <div className="relative group">
            <button
              className={`px-4 py-2 rounded-lg transition-all bg-[#111827]/60 text-gray-400 hover:text-white hover:bg-[#1F2937]/80 hover:shadow-lg hover:shadow-cyan-500/10 flex items-center gap-2`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              <span>Actions</span>
            </button>
            <div className="absolute z-50 left-0 mt-2 w-48 rounded-lg bg-[#1F2937] shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2">
              {['Anal', 'Blowjob', 'Creampie', 'Cumshot', 'DeepThroat', 'Doggystyle', 'Facial', 'Hardcore', 'Interracial', 'Lesbian', 'Masturbation', 'Orgasm', 'POV', 'Public', 'Solo', 'Squirt', 'Threesome', 'Toys'].map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveFilter(category.toLowerCase())}
                  className={`w-full px-4 py-2 text-left transition-all ${
                    activeFilter === category.toLowerCase()
                      ? 'bg-gradient-to-r from-emerald-400 to-cyan-400 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-[#111827]'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
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
          {displayedVideos.map((video) => (
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
              <div className="p-4 space-y-3">
                <Link href={`/watch/${video.uid}`} className="block">
                  <h2 className="text-lg font-semibold text-white hover:text-cyan-400 transition-colors">
                    {video.meta.name || 'Untitled Video'}
                  </h2>
                </Link>
                <p className="text-gray-400">{video.meta.description || 'No description'}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-gray-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span>{video.meta.views || '0'}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                      </svg>
                      <span>{video.meta.likes || '0'}</span>
                    </div>
                  </div>
                  <div className="text-gray-400">
                    {new Date(video.meta.uploadedAt || video.created).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {video.meta.category?.split(',').map((category) => (
                    <span
                      key={category}
                      className="px-2 py-1 bg-[#1F2937] rounded-full text-xs text-gray-400"
                    >
                      {category.trim()}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load more button */}
        {hasMore && (
          <div className="text-center mt-8">
            <button
              onClick={loadMore}
              disabled={isLoadingMore}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-400 to-cyan-400 text-white shadow-lg shadow-emerald-500/20 hover:shadow-cyan-500/30 transition-all"
            >
              {isLoadingMore ? 'Loading...' : 'Load More'}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#030712] text-white">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(12)].map((_, index) => (
              <VideoSkeleton key={index} />
            ))}
          </div>
        </div>
      </div>
    }>
      <HomePageContent />
    </Suspense>
  );
}