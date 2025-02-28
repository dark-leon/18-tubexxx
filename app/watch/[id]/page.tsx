'use client';

import { useState, useEffect } from 'react';
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
  const { id } = params;
  const [currentVideo, setCurrentVideo] = useState<VideoData | null>(null);
  const [recommendedVideos, setRecommendedVideos] = useState<VideoData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const videos = await getVideos();
        const video = videos.find((v) => v.uid === id);
        if (video) {
          // Increment view count when video is found
          const updatedVideo = await incrementViews(video.uid, video.meta.views || '0');
          setCurrentVideo(updatedVideo);
          setRecommendedVideos(videos.filter((v) => v.uid !== id));
        } else {
          setError('Video topilmadi');
        }
      } catch (err) {
        setError('Xatolik yuz berdi');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const onLike = async () => {
    if (!currentVideo) return;
    try {
      const updatedVideo = await handleLike(currentVideo.uid, currentVideo.meta.likes || '0');
      setCurrentVideo(updatedVideo);
    } catch (err) {
      console.error('Like qo\'yishda xatolik:', err);
    }
  };

  const onDislike = async () => {
    if (!currentVideo) return;
    try {
      const updatedVideo = await handleDislike(currentVideo.uid, currentVideo.meta.dislikes || '0');
      setCurrentVideo(updatedVideo);
    } catch (err) {
      console.error('Dislike qo\'yishda xatolik:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !currentVideo) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-8">
          <div className="text-center text-xl text-red-500">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video player section */}
          <div className="lg:col-span-2">
            <div className="aspect-video relative rounded-lg overflow-hidden bg-gray-800">
              <iframe
                src={`https://iframe.videodelivery.net/${currentVideo.uid}`}
                className="w-full h-full absolute top-0 left-0"
                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="mt-4">
              <h1 className="text-2xl font-bold text-white">
                {currentVideo.meta.name || 'Nomsiz video'}
              </h1>
              {currentVideo.meta.description && (
                <p className="mt-2 text-gray-400">{currentVideo.meta.description}</p>
              )}
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center space-x-6 text-gray-400">
                  <span className="flex items-center">
                    <svg
                      className="w-5 h-5 mr-2"
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
                    {currentVideo.meta.views || '0'} ko'rishlar
                  </span>
                  <span className="flex items-center">
                    <svg
                      className="w-5 h-5 mr-2"
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
                    <div className="flex gap-2 flex-wrap">
                      {currentVideo.meta.category.split(', ').map((category, index) => (
                        <span key={index} className="text-purple-400 bg-purple-400/10 px-2 py-1 rounded-full text-sm">
                          {category}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={onLike}
                    className="flex items-center space-x-1 px-4 py-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
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
                    <span>{currentVideo.meta.likes || '0'}</span>
                  </button>
                  <button
                    onClick={onDislike}
                    className="flex items-center space-x-1 px-4 py-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018c.163 0 .326.02.485.06L17 4m-7 10v2a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5 6h2a2 2 0 002-2v-6a2 2 0 00-2-2h-2.5"
                      />
                    </svg>
                    <span>{currentVideo.meta.dislikes || '0'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Recommended videos section */}
          <div className="lg:col-span-1">
            <h2 className="text-xl font-semibold mb-4 text-gray-200">Tavsiya etilgan videolar</h2>
            <div className="grid grid-cols-1 gap-4">
              {recommendedVideos.map((video) => (
                <Link
                  href={`/watch/${video.uid}`}
                  key={video.uid}
                  className="flex gap-4 p-2 rounded-lg hover:bg-gray-800/50 transition-colors"
                >
                  <div className="relative w-40 aspect-video rounded-lg overflow-hidden bg-gray-800">
                    <iframe
                      src={`https://iframe.videodelivery.net/${video.uid}`}
                      className="w-full h-full absolute top-0 left-0"
                      allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                    />
                  </div>
                  <div className="flex flex-col flex-1">
                    <h3 className="font-medium text-white line-clamp-2">
                      {video.meta.name || 'Nomsiz video'}
                    </h3>
                    <div className="flex items-center text-sm text-gray-400 mt-1 space-x-2">
                      <span>{video.meta.views || '0'} ko'rishlar</span>
                      <span>•</span>
                      <span>
                        {Math.floor(video.duration / 60)}:
                        {String(Math.floor(video.duration % 60)).padStart(2, '0')}
                      </span>
                      {video.meta.categories && (
                        <div className="flex gap-2 flex-wrap">
                          {video.meta.categories.split(',').map((category, index) => (
                            <span key={index} className="text-purple-400 bg-purple-400/10 px-2 py-1 rounded-full text-sm">
                              {category.trim()}
                            </span>
                          ))}
                        </div>
                      )}
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