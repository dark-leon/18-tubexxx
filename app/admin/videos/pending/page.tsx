'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getVideos, updateVideoMeta } from '../../../utils/cloudflare';
import type { VideoData } from '../../../utils/cloudflare';
import Navbar from '../../../components/Navbar';

export default function PendingVideosPage() {
  const router = useRouter();
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [approvingVideo, setApprovingVideo] = useState<string | null>(null);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const allVideos = await getVideos();
      // Faqat tasdiqlanmagan videolarni filtrlash
      const pendingVideos = allVideos.filter(video => video.meta.isApproved === "false");
      setVideos(pendingVideos);
    } catch (err) {
      console.error('Videolarni yuklashda xatolik:', err);
      setError('Videolarni yuklashda xatolik yuz berdi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveVideo = async (video: VideoData) => {
    if (!confirm('Ushbu videoni tasdiqlashni xohlaysizmi?')) {
      return;
    }

    setApprovingVideo(video.uid);
    try {
      await updateVideoMeta(video.uid, {
        ...video.meta,
        isApproved: "true"
      });
      
      // Videoni ro'yxatdan olib tashlash
      setVideos(prevVideos => prevVideos.filter(v => v.uid !== video.uid));
    } catch (err) {
      console.error('Videoni tasdiqlashda xatolik:', err);
      alert('Videoni tasdiqlashda xatolik yuz berdi. Iltimos qaytadan urinib ko\'ring.');
    } finally {
      setApprovingVideo(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#030712] text-white">
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.05)_0%,rgba(6,182,212,0.05)_100%)] pointer-events-none"></div>
        <div className="fixed inset-0 bg-[url('/dots.png')] opacity-[0.03] mix-blend-screen pointer-events-none"></div>
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-400"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#030712] text-white">
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.05)_0%,rgba(6,182,212,0.05)_100%)] pointer-events-none"></div>
        <div className="fixed inset-0 bg-[url('/dots.png')] opacity-[0.03] mix-blend-screen pointer-events-none"></div>
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-8">
          <div className="text-center">
            <div className="text-xl text-red-400 mb-4">{error}</div>
            <button
              onClick={() => router.push('/admin')}
              className="px-4 py-2 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-lg text-white"
            >
              Admin panelga qaytish
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.05)_0%,rgba(6,182,212,0.05)_100%)] pointer-events-none"></div>
      <div className="fixed inset-0 bg-[url('/dots.png')] opacity-[0.03] mix-blend-screen pointer-events-none"></div>
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            Tasdiqlanmagan Videolar
          </h1>
          <button
            onClick={() => router.push('/admin')}
            className="px-4 py-2 bg-[#1E293B]/60 backdrop-blur-sm rounded-lg border border-cyan-950 hover:bg-[#1E293B] transition-colors"
          >
            Admin panelga qaytish
          </button>
        </div>

        {videos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">Tasdiqlanmagan videolar mavjud emas</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {videos.map((video) => (
              <div key={video.uid} className="bg-[#111827]/60 backdrop-blur-sm rounded-xl border border-cyan-950 p-6 transition-all hover:shadow-lg hover:shadow-emerald-500/10">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="w-full md:w-64 aspect-video relative rounded-lg overflow-hidden bg-[#0A0A0F] ring-1 ring-cyan-950">
                    <iframe
                      src={`https://iframe.videodelivery.net/${video.uid}`}
                      className="w-full h-full absolute top-0 left-0"
                      allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-4">
                      <h2 className="text-xl font-semibold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                        {video.meta.name || 'Nomsiz video'}
                      </h2>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApproveVideo(video)}
                          disabled={approvingVideo === video.uid}
                          className={`px-4 py-2 rounded-lg transition-all ${
                            approvingVideo === video.uid
                              ? 'bg-emerald-500/50 cursor-not-allowed'
                              : 'bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-cyan-400 hover:to-emerald-400 shadow-lg shadow-emerald-500/20'
                          }`}
                        >
                          {approvingVideo === video.uid ? 'Tasdiqlanmoqda...' : 'Tasdiqlash'}
                        </button>
                      </div>
                    </div>
                    {video.meta.description && (
                      <p className="text-gray-400 mb-4">{video.meta.description}</p>
                    )}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="bg-[#1E293B]/60 backdrop-blur-sm p-3 rounded-lg border border-cyan-950">
                        <div className="text-gray-400 mb-1">Ko'rishlar</div>
                        <div className="text-lg font-semibold text-emerald-400">{video.meta.views || '0'}</div>
                      </div>
                      <div className="bg-[#1E293B]/60 backdrop-blur-sm p-3 rounded-lg border border-cyan-950">
                        <div className="text-gray-400 mb-1">Like</div>
                        <div className="text-lg font-semibold text-emerald-400">{video.meta.likes || '0'}</div>
                      </div>
                      <div className="bg-[#1E293B]/60 backdrop-blur-sm p-3 rounded-lg border border-cyan-950">
                        <div className="text-gray-400 mb-1">Dislike</div>
                        <div className="text-lg font-semibold text-emerald-400">{video.meta.dislikes || '0'}</div>
                      </div>
                      <div className="bg-[#1E293B]/60 backdrop-blur-sm p-3 rounded-lg border border-cyan-950">
                        <div className="text-gray-400 mb-1">Kategoriyalar</div>
                        <div className="text-lg font-semibold">
                          {video.meta.category ? (
                            <div className="flex flex-wrap gap-1">
                              {video.meta.category.split(', ').map((category, index) => (
                                <span
                                  key={index}
                                  className="inline-block px-2 py-1 bg-emerald-400/10 text-emerald-400 rounded-full text-xs border border-emerald-400/20"
                                >
                                  {category}
                                </span>
                              ))}
                            </div>
                          ) : (
                            '-'
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
} 