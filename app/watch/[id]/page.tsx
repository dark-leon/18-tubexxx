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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video player section */}
          <div className="lg:col-span-2 space-y-4">
            <div className="aspect-video relative rounded-lg overflow-hidden bg-[#111827]/60 backdrop-blur-sm ring-1 ring-cyan-950">
              <iframe
                src={`https://iframe.videodelivery.net/${currentVideo.uid}`}
                className="w-full h-full absolute top-0 left-0"
                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="space-y-4">
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                {currentVideo.meta.name || 'Untitled video'}
              </h1>
              {currentVideo.meta.description && (
                <p className="text-sm sm:text-base text-gray-400">{currentVideo.meta.description}</p>
              )}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex flex-wrap items-center gap-4 text-gray-400">
                  <span className="flex items-center text-sm">
                    <svg
                      className="w-5 h-5 mr-2 text-cyan-400"
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
                    {currentVideo.meta.views || '0'} views
                  </span>
                  <span className="flex items-center text-sm">
                    <svg
                      className="w-5 h-5 mr-2 text-cyan-400"
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
                    {Math.floor(currentVideo.duration / 60)}:
                    {String(Math.floor(currentVideo.duration % 60)).padStart(2, '0')}
                  </span>
                  {currentVideo.meta.category && (
                    <div className="flex flex-wrap gap-2">
                      {currentVideo.meta.category.split(', ').map((category, index) => (
                        <span key={index} className="text-cyan-400 bg-[#1E293B]/60 backdrop-blur-sm px-2 py-1 rounded-full text-xs sm:text-sm border border-cyan-950">
                          {category}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={onLike}
                    className={`group flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                      hasLiked
                        ? 'bg-emerald-400 hover:bg-emerald-500 text-white'
                        : 'bg-gradient-to-r from-emerald-400/10 to-cyan-400/10 hover:from-emerald-400/20 hover:to-cyan-400/20 border border-emerald-400/20 hover:shadow-emerald-500/20'
                    }`}
                  >
                    <svg
                      className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${
                        hasLiked ? 'text-white' : 'text-emerald-400 group-hover:text-emerald-300'
                      }`}
                      fill={hasLiked ? 'currentColor' : 'none'}
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                      />
                    </svg>
                    <span className={`font-medium ${
                      hasLiked ? 'text-white' : 'text-emerald-400 group-hover:text-emerald-300'
                    } transition-colors duration-300`}>{currentVideo.meta.likes || '0'}</span>
                  </button>
                  <button
                    onClick={onDislike}
                    className={`group flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                      hasDisliked
                        ? 'bg-rose-400 hover:bg-rose-500 text-white'
                        : 'bg-gradient-to-r from-rose-500/10 to-red-500/10 hover:from-rose-500/20 hover:to-red-500/20 border border-rose-500/20 hover:shadow-rose-500/20'
                    }`}
                  >
                    <svg
                      className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${
                        hasDisliked ? 'text-white' : 'text-rose-400 group-hover:text-rose-300'
                      }`}
                      fill={hasDisliked ? 'currentColor' : 'none'}
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M10 15v4a3 3 0 003 3l4-9V2H5.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3zm7-13h2.67A2.31 2.31 0 0122 4v7a2.31 2.31 0 01-2.33 2H17" />
                    </svg>
                    <span className={`font-medium ${
                      hasDisliked ? 'text-white' : 'text-rose-400 group-hover:text-rose-300'
                    } transition-colors duration-300`}>{currentVideo.meta.dislikes || '0'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Recommended videos section */}
          <div className="lg:col-span-1">
            <h2 className="text-lg sm:text-xl font-semibold mb-6 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Recommended Videos</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
              {recommendedVideos.map((video) => (
                <Link
                  href={`/watch/${video.uid}`}
                  key={video.uid}
                  className="group block rounded-lg bg-[#111827]/60 backdrop-blur-sm hover:bg-[#1F2937]/80 transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-cyan-500/10 border border-cyan-950 overflow-hidden"
                >
                  <div className="relative aspect-video rounded-t-lg overflow-hidden bg-[#0A0A0F]">
                    <img
                      src={`https://videodelivery.net/${video.uid}/thumbnails/thumbnail.jpg?time=${Math.floor(video.duration / 2)}s`}
                      alt={video.meta.name || 'Video thumbnail'}
                      className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                    />
                    {/* Duration overlay */}
                    <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 rounded text-xs text-white">
                      {Math.floor(video.duration / 60)}:
                      {String(Math.floor(video.duration % 60)).padStart(2, '0')}
                    </div>
                    {/* Play button overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                        <svg
                          className="w-5 h-5 text-white"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-sm text-gray-100 line-clamp-2 group-hover:text-cyan-400 transition-colors">
                      {video.meta.name || 'Untitled video'}
                    </h3>
                    <div className="flex items-center text-xs text-gray-400 mt-2">
                      <span className="flex items-center">
                        <svg
                          className="w-4 h-4 mr-1 text-cyan-400/75"
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
                    {video.meta.category && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {video.meta.category.split(', ').slice(0, 2).map((category, index) => (
                          <span
                            key={index}
                            className="text-[10px] text-cyan-400 bg-[#1E293B]/60 backdrop-blur-sm px-1.5 py-0.5 rounded-full border border-cyan-950"
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
          </div>
        </div>
      </main>
    </div>
  );
} 