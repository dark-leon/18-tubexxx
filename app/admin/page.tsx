'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getVideos, updateVideoMeta, deleteVideo } from '../utils/cloudflare';
import { logOut } from '../utils/firebase';
import type { VideoData } from '../utils/cloudflare';
import Navbar from '../components/Navbar';
import Cookies from 'js-cookie';
import Link from 'next/link';

function SearchWrapper() {
  const searchParams = useSearchParams();
  return searchParams.get('query') || '';
}

function AdminPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingVideo, setDeletingVideo] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const data = await getVideos();
      setVideos(data);
    } catch (err) {
      setError('Error loading videos');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteVideo = async (videoId: string) => {
    if (!confirm('Are you sure you want to delete this video?')) {
      return;
    }

    setDeletingVideo(videoId);
    try {
      await deleteVideo(videoId);
      setVideos(videos.filter(v => v.uid !== videoId));
    } catch (err) {
      console.error('Error deleting video:', err);
    } finally {
      setDeletingVideo(null);
    }
  };

  const handleLogout = async () => {
    try {
      await logOut();
      Cookies.remove('auth_session');
      router.push('/admin/login');
    } catch (err) {
      console.error('Error logging out:', err);
    }
  };

  const filteredVideos = videos.filter(video => 
    video.meta.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    video.meta.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    video.meta.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  if (error) {
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
    <div className="min-h-screen bg-[#030712] text-white">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.05)_0%,rgba(6,182,212,0.05)_100%)] pointer-events-none"></div>
      <div className="fixed inset-0 bg-[url('/dots.png')] opacity-[0.03] mix-blend-screen pointer-events-none"></div>
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-8">
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Admin Panel</h1>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <Link
              href="/admin/upload"
              className="px-4 py-2.5 bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-cyan-400 hover:to-emerald-400 rounded-lg text-white transition-all shadow-lg shadow-emerald-500/20 whitespace-nowrap"
            >
              + Video yuklash
            </Link>
            <div className="relative flex-1 md:w-64">
              <Suspense fallback={
                <div className="w-full pl-10 pr-4 py-2.5 bg-[#1E293B]/60 backdrop-blur-sm rounded-lg border border-cyan-950">
                  Yuklanmoqda...
                </div>
              }>
                <input
                  type="text"
                  placeholder="Videolarni qidirish..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#1E293B]/60 backdrop-blur-sm rounded-lg border border-cyan-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </Suspense>
              <svg
                className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2.5 bg-gradient-to-r from-rose-500 to-red-500 hover:from-red-500 hover:to-rose-500 rounded-lg text-white transition-all shadow-lg shadow-rose-500/20 whitespace-nowrap"
            >
              Chiqish
            </button>
          </div>
        </div>
        
        <div className="grid gap-6">
          {filteredVideos.map((video) => (
            <div key={video.uid} className="bg-[#111827]/60 backdrop-blur-sm rounded-xl border border-cyan-950 p-6 transition-all hover:shadow-lg hover:shadow-emerald-500/10">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-64 aspect-video relative rounded-lg overflow-hidden bg-[#0A0A0F] ring-1 ring-cyan-950">
                  <iframe
                    src={`https://iframe.videodelivery.net/${video.uid}`}
                    className="w-full h-full absolute top-0 left-0"
                    allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                  />
                </div>
                
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-4">
                    <h2 className="text-xl font-semibold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                      {video.meta.name || 'Untitled video'}
                    </h2>
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/edit/${video.uid}`}
                        className="px-4 py-2 bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-cyan-400 hover:to-emerald-400 rounded-lg transition-all shadow-lg shadow-emerald-500/20"
                      >
                        O'zgartirish
                      </Link>
                      <button
                        onClick={() => handleDeleteVideo(video.uid)}
                        disabled={deletingVideo === video.uid}
                        className={`px-4 py-2 rounded-lg transition-all ${
                          deletingVideo === video.uid
                            ? 'bg-rose-500/50 cursor-not-allowed'
                            : 'bg-gradient-to-r from-rose-500 to-red-500 hover:from-red-500 hover:to-rose-500 shadow-lg shadow-rose-500/20'
                        }`}
                      >
                        {deletingVideo === video.uid ? 'O\'chirilmoqda...' : 'O\'chirish'}
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
      </main>
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#030712] text-white">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        </div>
      </div>
    }>
      <AdminPageContent />
    </Suspense>
  );
} 