'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getVideos, updateVideoMeta, deleteVideo } from '../utils/cloudflare';
import { logOut } from '../utils/firebase';
import type { VideoData } from '../utils/cloudflare';
import Navbar from '../components/Navbar';
import CategorySelect from '../components/CategorySelect';
import Cookies from 'js-cookie';
import Link from 'next/link';

export default function AdminPage() {
  const router = useRouter();
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingVideo, setEditingVideo] = useState<VideoData | null>(null);
  const [deletingVideo, setDeletingVideo] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const checkAuth = () => {
      const authSession = Cookies.get('auth_session');
      if (!authSession) {
        router.push('/admin/login');
      }
    };

    checkAuth();
    fetchVideos();
  }, [router]);

  const fetchVideos = async () => {
    try {
      const data = await getVideos();
      setVideos(data);
    } catch (err) {
      setError('Videolarni yuklashda xatolik yuz berdi');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleUpdateVideo = async (video: VideoData, updates: Partial<VideoData['meta']>) => {
    try {
      const updatedVideo = await updateVideoMeta(video.uid, updates);
      setVideos(videos.map(v => v.uid === video.uid ? updatedVideo : v));
      setEditingVideo(null);
    } catch (err) {
      console.error('Video yangilashda xatolik:', err);
    }
  };

  const handleDeleteVideo = async (videoId: string) => {
    if (!confirm('Videoni o\'chirishni xohlaysizmi?')) {
      return;
    }

    setDeletingVideo(videoId);
    try {
      await deleteVideo(videoId);
      setVideos(videos.filter(v => v.uid !== videoId));
    } catch (err) {
      console.error('Video o\'chirishda xatolik:', err);
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
      console.error('Chiqishda xatolik:', err);
    }
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

  const filteredVideos = videos.filter(video => 
    video.meta.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    video.meta.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <Navbar onSearch={handleSearch} />
      <main className="container mx-auto px-4 pt-24 pb-8">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            Admin Panel
          </h1>
          <div className="flex gap-2 sm:gap-4">
            <Link
              href="/"
              className="px-3 sm:px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white text-sm transition-colors"
            >
              Back to Home
            </Link>
            <button
              onClick={handleLogout}
              className="px-3 sm:px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white text-sm transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
        
        <div className="grid gap-4 sm:gap-6">
          {filteredVideos.map((video) => (
            <div key={video.uid} className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                <div className="w-full sm:w-64 aspect-video relative rounded-lg overflow-hidden bg-gray-900">
                  <iframe
                    src={`https://iframe.videodelivery.net/${video.uid}`}
                    className="w-full h-full absolute top-0 left-0"
                    allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                  />
                </div>
                
                <div className="flex-1">
                  {editingVideo?.uid === video.uid ? (
                    <div className="space-y-4">
                      <input
                        type="text"
                        value={editingVideo.meta.name}
                        onChange={(e) => setEditingVideo({
                          ...editingVideo,
                          meta: { ...editingVideo.meta, name: e.target.value }
                        })}
                        className="w-full px-3 py-2 bg-gray-700 rounded-lg"
                        placeholder="Video nomi"
                      />
                      <textarea
                        value={editingVideo.meta.description || ''}
                        onChange={(e) => setEditingVideo({
                          ...editingVideo,
                          meta: { ...editingVideo.meta, description: e.target.value }
                        })}
                        className="w-full px-3 py-2 bg-gray-700 rounded-lg"
                        placeholder="Tavsif"
                        rows={3}
                      />
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-400">
                          Kategoriyalar
                        </label>
                        <CategorySelect
                          selectedCategories={editingVideo.meta.categories ? editingVideo.meta.categories.split(',') : []}
                          onChange={(categories) => setEditingVideo({
                            ...editingVideo,
                            meta: { ...editingVideo.meta, categories: categories.join(',') }
                          })}
                        />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleUpdateVideo(video, editingVideo.meta)}
                          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm"
                        >
                          Saqlash
                        </button>
                        <button
                          onClick={() => setEditingVideo(null)}
                          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-sm"
                        >
                          Bekor qilish
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
                        <h2 className="text-lg sm:text-xl font-semibold">{video.meta.name}</h2>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingVideo(video)}
                            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm"
                          >
                            Tahrirlash
                          </button>
                          <button
                            onClick={() => handleDeleteVideo(video.uid)}
                            disabled={deletingVideo === video.uid}
                            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-sm ${
                              deletingVideo === video.uid
                                ? 'bg-red-800 cursor-not-allowed'
                                : 'bg-red-600 hover:bg-red-700'
                            }`}
                          >
                            {deletingVideo === video.uid ? 'O\'chirilmoqda...' : 'O\'chirish'}
                          </button>
                        </div>
                      </div>
                      {video.meta.description && (
                        <p className="text-gray-400 mb-4 text-sm sm:text-base">{video.meta.description}</p>
                      )}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 text-sm">
                        <div className="bg-gray-700/50 p-3 rounded-lg">
                          <div className="text-gray-400 text-xs sm:text-sm">Ko'rishlar</div>
                          <div className="text-base sm:text-lg font-semibold">{video.meta.views || '0'}</div>
                        </div>
                        <div className="bg-gray-700/50 p-3 rounded-lg">
                          <div className="text-gray-400 text-xs sm:text-sm">Like lar</div>
                          <div className="text-base sm:text-lg font-semibold">{video.meta.likes || '0'}</div>
                        </div>
                        <div className="bg-gray-700/50 p-3 rounded-lg">
                          <div className="text-gray-400 text-xs sm:text-sm">Dislike lar</div>
                          <div className="text-base sm:text-lg font-semibold">{video.meta.dislikes || '0'}</div>
                        </div>
                        <div className="bg-gray-700/50 p-3 rounded-lg">
                          <div className="text-gray-400 text-xs sm:text-sm">Kategoriyalar</div>
                          <div className="text-base sm:text-lg font-semibold truncate">
                            {video.meta.categories ? video.meta.categories.split(',').join(', ') : '-'}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
} 