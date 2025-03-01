'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getVideos, incrementViews, handleLike, handleDislike } from '../../utils/cloudflare';
import type { VideoData } from '../../utils/cloudflare';
import Navbar from '../../components/Navbar';
import Link from 'next/link';

interface PageProps {
  params: {
    id: string;
  };
}

export default function WatchPage({ params }: PageProps) {
  const router = useRouter();
  const { id } = params;
  const [currentVideo, setCurrentVideo] = useState<VideoData | null>(null);
  const [recommendedVideos, setRecommendedVideos] = useState<VideoData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasLiked, setHasLiked] = useState(false);
  const [hasDisliked, setHasDisliked] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const videos = await getVideos();
        const video = videos.find((v) => v.uid === id);
        
        if (video) {
          // Ko'rishlar sonini yangilash
          const newViews = (parseInt(video.meta.views || '0') + 1).toString();
          await incrementViews(video.uid, video.meta.views || '0');
          
          // Video ma'lumotlarini yangilash
          const updatedVideo = {
            ...video,
            meta: {
              ...video.meta,
              views: newViews
            }
          };
          setCurrentVideo(updatedVideo);
          
          // O'xshash videolarni filtrlash
          const filtered = videos
            .filter((v) => v.uid !== id)
            .filter((v) => {
              if (video.meta.category) {
                const currentCategories = video.meta.category.toLowerCase().split(',').map(c => c.trim());
                const videoCategories = v.meta.category?.toLowerCase().split(',').map(c => c.trim()) || [];
                return currentCategories.some(cat => videoCategories.includes(cat));
              }
              return true;
            })
            .sort(() => Math.random() - 0.5)
            .slice(0, 12);
          
          setRecommendedVideos(filtered);
          
          // Like/Dislike holatini tekshirish
          const likeStatus = localStorage.getItem(`video_${id}_like_status`);
          if (likeStatus === 'liked') setHasLiked(true);
          if (likeStatus === 'disliked') setHasDisliked(true);
        } else {
          setError('Video not found');
        }
      } catch (err) {
        console.error('Error fetching video:', err);
        setError('An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    router.push(`/?search=${encodeURIComponent(query)}`);
  };

  const onLike = async () => {
    if (!currentVideo || hasLiked) return;
    try {
      const newLikes = (parseInt(currentVideo.meta.likes || '0') + 1).toString();
      await handleLike(currentVideo.uid, currentVideo.meta.likes || '0');
      setCurrentVideo({
        ...currentVideo,
        meta: {
          ...currentVideo.meta,
          likes: newLikes
        }
      });
      setHasLiked(true);
      setHasDisliked(false);
      localStorage.setItem(`video_${id}_like_status`, 'liked');
    } catch (err) {
      console.error('Error adding like:', err);
    }
  };

  const onDislike = async () => {
    if (!currentVideo || hasDisliked) return;
    try {
      const newDislikes = (parseInt(currentVideo.meta.dislikes || '0') + 1).toString();
      await handleDislike(currentVideo.uid, currentVideo.meta.dislikes || '0');
      setCurrentVideo({
        ...currentVideo,
        meta: {
          ...currentVideo.meta,
          dislikes: newDislikes
        }
      });
      setHasDisliked(true);
      setHasLiked(false);
      localStorage.setItem(`video_${id}_like_status`, 'disliked');
    } catch (err) {
      console.error('Error adding dislike:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#030712] text-white">
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.05)_0%,rgba(6,182,212,0.05)_100%)] pointer-events-none"></div>
        <div className="fixed inset-0 bg-[url('/dots.png')] opacity-[0.03] mix-blend-screen pointer-events-none"></div>
        <Navbar onSearch={handleSearch} />
        <div className="container mx-auto px-4 pt-24 pb-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-400"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !currentVideo) {
    return (
      <div className="min-h-screen bg-[#030712] text-white">
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.05)_0%,rgba(6,182,212,0.05)_100%)] pointer-events-none"></div>
        <div className="fixed inset-0 bg-[url('/dots.png')] opacity-[0.03] mix-blend-screen pointer-events-none"></div>
        <Navbar onSearch={handleSearch} />
        <div className="container mx-auto px-4 pt-24 pb-8">
          <div className="text-center">
            <div className="text-xl text-red-400 mb-4">{error || 'Video not found'}</div>
            <Link
              href="/"
              className="inline-block px-4 py-2 bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-cyan-400 hover:to-emerald-400 rounded-lg text-white transition-all shadow-lg shadow-emerald-500/20"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.05)_0%,rgba(6,182,212,0.05)_100%)] pointer-events-none"></div>
      <div className="fixed inset-0 bg-[url('/dots.png')] opacity-[0.03] mix-blend-screen pointer-events-none"></div>
      <Navbar onSearch={handleSearch} />
      <main className="container mx-auto px-4 pt-24 pb-8">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Video player section */}
          <div className="xl:col-span-3 space-y-6">
            {/* Video player */}
            <div className="aspect-video relative rounded-lg overflow-hidden bg-[#111827]/60 backdrop-blur-sm ring-1 ring-cyan-950">
              <iframe
                src={`https://iframe.videodelivery.net/${currentVideo.uid}`}
                className="w-full h-full absolute top-0 left-0"
                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
                onLoad={(e) => {
                  const iframe = e.target as HTMLIFrameElement;
                  if (iframe.contentWindow) {
                    iframe.contentWindow.postMessage(
                      { type: 'setPlaybackQuality', value: 'auto' },
                      '*'
                    );
                  }
                }}
              />
            </div>

            {/* Video info */}
            <div className="space-y-4 bg-[#111827]/60 backdrop-blur-sm rounded-lg p-4 ring-1 ring-cyan-950">
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                {currentVideo.meta.name || 'Untitled video'}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 text-gray-400 border-b border-cyan-950 pb-4">
                <span className="flex items-center text-sm">
                  <svg className="w-5 h-5 mr-2 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  {currentVideo.meta.views || '0'} views
                </span>
                <span className="flex items-center text-sm">
                  <svg className="w-5 h-5 mr-2 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {Math.floor(currentVideo.duration / 60)}:
                  {String(Math.floor(currentVideo.duration % 60)).padStart(2, '0')}
                </span>
                <div className="flex items-center gap-4 ml-auto">
                  <button
                    onClick={onLike}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      hasLiked
                        ? 'bg-gradient-to-r from-emerald-400 to-cyan-400 text-white shadow-lg shadow-emerald-500/20'
                        : 'text-gray-400 hover:text-white hover:bg-[#1F2937]'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                    </svg>
                    <span>{currentVideo.meta.likes || '0'}</span>
                  </button>
                  <button
                    onClick={onDislike}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      hasDisliked
                        ? 'bg-gradient-to-r from-pink-500 to-red-500 text-white shadow-lg shadow-red-500/20'
                        : 'text-gray-400 hover:text-white hover:bg-[#1F2937]'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018c.163 0 .326.02.485.06L17 4m-7 10v2a2 2 0 002 2h.095c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5 0h2a2 2 0 002-2v-6a2 2 0 00-2-2h-2.5" />
                    </svg>
                    <span>{currentVideo.meta.dislikes || '0'}</span>
                  </button>
                </div>
              </div>

              {currentVideo.meta.description && (
                <p className="text-sm sm:text-base text-gray-400 pt-4">{currentVideo.meta.description}</p>
              )}

              {currentVideo.meta.category && (
                <div className="flex flex-wrap gap-2 pt-4">
                  {currentVideo.meta.category.split(',').map((category, index) => (
                    <Link 
                      key={index} 
                      href={`/?filter=${encodeURIComponent(category.trim().toLowerCase())}`}
                      className="text-cyan-400 bg-[#1E293B]/60 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs sm:text-sm border border-cyan-950 hover:bg-gradient-to-r hover:from-emerald-400 hover:to-cyan-400 hover:text-white transition-all hover:border-transparent"
                    >
                      {category.trim()}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom recommended videos */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white">More videos you might like</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {recommendedVideos.slice(6).map((video) => (
                  <Link
                    key={video.uid}
                    href={`/watch/${video.uid}`}
                    className="group bg-[#111827]/60 backdrop-blur-sm rounded-lg overflow-hidden hover:ring-1 hover:ring-cyan-400/50 transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-cyan-500/10"
                  >
                    <div className="relative aspect-video bg-[#0A0A0F]">
                      <img
                        src={`https://videodelivery.net/${video.uid}/thumbnails/thumbnail.jpg?time=${Math.floor(video.duration / 2)}s`}
                        alt={video.meta.name || 'Video thumbnail'}
                        className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                      />
                      <div className="absolute bottom-2 right-2 flex items-center gap-2">
                        <div className="px-2 py-1 bg-black/80 rounded text-xs text-white">
                          {Math.floor(video.duration / 60)}:
                          {String(Math.floor(video.duration % 60)).padStart(2, '0')}
                        </div>
                        <div className="px-2 py-1 bg-emerald-500/80 rounded text-xs font-medium text-white">
                          HD
                        </div>
                      </div>
                    </div>
                    <div className="p-3 space-y-1">
                      <h3 className="text-sm font-medium text-white line-clamp-2 group-hover:text-cyan-400 transition-colors">
                        {video.meta.name || 'Untitled Video'}
                      </h3>
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            {video.meta.views || '0'}
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                            </svg>
                            {video.meta.likes || '0'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Right sidebar recommended videos */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white">Up next</h2>
            <div className="space-y-4">
              {recommendedVideos.slice(0, 6).map((video) => (
                <Link
                  key={video.uid}
                  href={`/watch/${video.uid}`}
                  className="group bg-[#111827]/60 backdrop-blur-sm rounded-lg overflow-hidden hover:ring-1 hover:ring-cyan-400/50 transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-cyan-500/10 flex"
                >
                  <div className="relative w-40 aspect-video bg-[#0A0A0F] flex-shrink-0">
                    <img
                      src={`https://videodelivery.net/${video.uid}/thumbnails/thumbnail.jpg?time=${Math.floor(video.duration / 2)}s`}
                      alt={video.meta.name || 'Video thumbnail'}
                      className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                    />
                    <div className="absolute bottom-2 right-2 flex items-center gap-2">
                      <div className="px-2 py-1 bg-black/80 rounded text-xs text-white">
                        {Math.floor(video.duration / 60)}:
                        {String(Math.floor(video.duration % 60)).padStart(2, '0')}
                      </div>
                    </div>
                  </div>
                  <div className="p-3 flex-grow min-w-0">
                    <h3 className="text-sm font-medium text-white line-clamp-2 group-hover:text-cyan-400 transition-colors mb-2">
                      {video.meta.name || 'Untitled Video'}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {video.meta.views || '0'}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                        </svg>
                        {video.meta.likes || '0'}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 