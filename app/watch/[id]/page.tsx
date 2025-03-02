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
  const [showCopyNotification, setShowCopyNotification] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [isNativeShareSupported, setIsNativeShareSupported] = useState(false);

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

  // Check if native share is supported
  useEffect(() => {
    setIsNativeShareSupported(!!navigator.share);
  }, []);

  // Native share handler
  const handleNativeShare = async () => {
    try {
      await navigator.share({
        title: currentVideo?.meta.name || 'Check out this video',
        text: currentVideo?.meta.description || 'Interesting video to watch',
        url: window.location.href
      });
    } catch (err) {
      console.error('Error sharing:', err);
      // Fallback to custom share menu if native share fails
      setShowShareMenu(true);
    }
  };

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
      <main className="container mx-auto px-4 pt-16 sm:pt-24 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Video player section */}
          <div className="lg:col-span-3 space-y-4 sm:space-y-6">
            {/* Video player */}
            <div className="aspect-video relative -mx-4 sm:mx-0 rounded-none sm:rounded-lg overflow-hidden bg-[#111827]/60 backdrop-blur-sm ring-0 sm:ring-1 ring-cyan-950">
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
            <div className="space-y-4 bg-[#111827]/60 backdrop-blur-sm rounded-none sm:rounded-lg p-3 sm:p-4 ring-0 sm:ring-1 ring-cyan-950">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                {currentVideo.meta.name || 'Untitled video'}
              </h1>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 text-gray-400 border-b border-cyan-950 pb-4">
                <div className="flex flex-wrap items-center gap-4">
                  <span className="flex items-center text-xs sm:text-sm">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    {currentVideo.meta.views || '0'} views
                  </span>
                  <span className="flex items-center text-xs sm:text-sm">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {Math.floor(currentVideo.duration / 60)}:
                    {String(Math.floor(currentVideo.duration % 60)).padStart(2, '0')}
                  </span>
                </div>
                <div className="flex items-center gap-2 sm:gap-4 sm:ml-auto w-full sm:w-auto">
                  <div className="relative flex-1 sm:flex-none">
                    <button
                      onClick={() => {
                        if (isNativeShareSupported) {
                          handleNativeShare();
                        } else {
                          setShowShareMenu(!showShareMenu);
                        }
                      }}
                      className="w-full sm:w-auto group relative flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-lg transition-all text-gray-400 hover:text-white hover:bg-gradient-to-r hover:from-emerald-400 hover:to-cyan-400 hover:shadow-lg hover:shadow-emerald-500/20"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                      <span className="text-sm">Share</span>
                    </button>
                    
                    {/* Custom share menu (shown only when native share is not supported) */}
                    {!isNativeShareSupported && showShareMenu && (
                      <div className="absolute right-0 mt-2 w-56 rounded-lg bg-[#1F2937] shadow-lg ring-1 ring-cyan-950 z-50">
                        <div className="p-2 space-y-1">
                          <button
                            onClick={() => {
                              const url = encodeURIComponent(window.location.href);
                              const text = encodeURIComponent(currentVideo?.meta.name || 'Check out this video');
                              window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank');
                            }}
                            className="flex items-center gap-3 w-full px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-[#374151] rounded-lg transition-all"
                          >
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 2c5.514 0 10 4.486 10 10s-4.486 10-10 10S2 17.514 2 12 6.486 2 12 2zm-2 14.5v-7l6 3.5-6 3.5z"/>
                            </svg>
                            Telegram orqali ulashish
                          </button>
                          
                          <button
                            onClick={() => {
                              const url = encodeURIComponent(window.location.href);
                              window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
                            }}
                            className="flex items-center gap-3 w-full px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-[#374151] rounded-lg transition-all"
                          >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                            </svg>
                            Facebook orqali ulashish
                          </button>

                          <button
                            onClick={async () => {
                              try {
                                const url = window.location.href;
                                await navigator.clipboard.writeText(url);
                                setShowCopyNotification(true);
                                setTimeout(() => setShowCopyNotification(false), 2000);
                                setShowShareMenu(false);
                              } catch (err) {
                                console.error('Failed to copy:', err);
                              }
                            }}
                            className="flex items-center gap-3 w-full px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-[#374151] rounded-lg transition-all"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                            </svg>
                            URL manzilni nusxalash
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {showCopyNotification && (
                      <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-emerald-400 text-white text-sm rounded shadow-lg whitespace-nowrap">
                        URL nusxalandi!
                      </div>
                    )}
                  </div>
                  <button
                    onClick={onLike}
                    className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-lg transition-all text-sm ${
                      hasLiked
                        ? 'bg-gradient-to-r from-emerald-400 to-cyan-400 text-white shadow-lg shadow-emerald-500/20'
                        : 'text-gray-400 hover:text-white hover:bg-[#1F2937]'
                    }`}
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                    </svg>
                    <span>{currentVideo.meta.likes || '0'}</span>
                  </button>
                  <button
                    onClick={onDislike}
                    className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-lg transition-all text-sm ${
                      hasDisliked
                        ? 'bg-gradient-to-r from-pink-500 to-red-500 text-white shadow-lg shadow-red-500/20'
                        : 'text-gray-400 hover:text-white hover:bg-[#1F2937]'
                    }`}
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018c.163 0 .326.02.485.06L17 4m-7 10v2a2 2 0 002 2h.095c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5 0h2a2 2 0 002-2v-6a2 2 0 00-2-2h-2.5" />
                    </svg>
                    <span>{currentVideo.meta.dislikes || '0'}</span>
                  </button>
                </div>
              </div>

              {currentVideo.meta.description && (
                <p className="text-xs sm:text-sm md:text-base text-gray-400 pt-4">{currentVideo.meta.description}</p>
              )}

              {currentVideo.meta.category && (
                <div className="flex flex-wrap gap-2 pt-4">
                  {currentVideo.meta.category.split(',').map((category, index) => (
                    <Link 
                      key={index} 
                      href={`/?filter=${encodeURIComponent(category.trim().toLowerCase())}`}
                      className="text-cyan-400 bg-[#1E293B]/60 backdrop-blur-sm px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm border border-cyan-950 hover:bg-gradient-to-r hover:from-emerald-400 hover:to-cyan-400 hover:text-white transition-all hover:border-transparent"
                    >
                      {category.trim()}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom recommended videos */}
            <div className="space-y-4">
              <h2 className="text-base sm:text-lg font-semibold text-white">More videos you might like</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
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
                      <div className="absolute bottom-1 sm:bottom-2 right-1 sm:right-2 flex items-center gap-1 sm:gap-2">
                        <div className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-black/80 rounded text-[10px] sm:text-xs text-white">
                          {Math.floor(video.duration / 60)}:
                          {String(Math.floor(video.duration % 60)).padStart(2, '0')}
                        </div>
                        <div className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-emerald-500/80 rounded text-[10px] sm:text-xs font-medium text-white">
                          HD
                        </div>
                      </div>
                    </div>
                    <div className="p-2 sm:p-3 space-y-1">
                      <h3 className="text-xs sm:text-sm font-medium text-white line-clamp-2 group-hover:text-cyan-400 transition-colors">
                        {video.meta.name || 'Untitled Video'}
                      </h3>
                      <div className="flex items-center justify-between text-[10px] sm:text-xs text-gray-400">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <span className="flex items-center gap-1">
                            <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            {video.meta.views || '0'}
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            <h2 className="text-base sm:text-lg font-semibold text-white">Up next</h2>
            <div className="space-y-3 sm:space-y-4">
              {recommendedVideos.slice(0, 6).map((video) => (
                <Link
                  key={video.uid}
                  href={`/watch/${video.uid}`}
                  className="group bg-[#111827]/60 backdrop-blur-sm rounded-lg overflow-hidden hover:ring-1 hover:ring-cyan-400/50 transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-cyan-500/10 flex"
                >
                  <div className="relative w-32 sm:w-40 aspect-video bg-[#0A0A0F] flex-shrink-0">
                    <img
                      src={`https://videodelivery.net/${video.uid}/thumbnails/thumbnail.jpg?time=${Math.floor(video.duration / 2)}s`}
                      alt={video.meta.name || 'Video thumbnail'}
                      className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                    />
                    <div className="absolute bottom-1 sm:bottom-2 right-1 sm:right-2 flex items-center gap-1 sm:gap-2">
                      <div className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-black/80 rounded text-[10px] sm:text-xs text-white">
                        {Math.floor(video.duration / 60)}:
                        {String(Math.floor(video.duration % 60)).padStart(2, '0')}
                      </div>
                    </div>
                  </div>
                  <div className="p-2 sm:p-3 flex-grow min-w-0">
                    <h3 className="text-xs sm:text-sm font-medium text-white line-clamp-2 group-hover:text-cyan-400 transition-colors mb-1 sm:mb-2">
                      {video.meta.name || 'Untitled Video'}
                    </h3>
                    <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {video.meta.views || '0'}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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