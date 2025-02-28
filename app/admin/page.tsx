'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getVideos, updateVideoMeta, deleteVideo } from '../utils/cloudflare';
import { logOut } from '../utils/firebase';
import type { VideoData } from '../utils/cloudflare';
import { getCategories } from '../utils/categories';
import Navbar from '../components/Navbar';
import CategorySelect from '../components/CategorySelect';
import Cookies from 'js-cookie';

export default function AdminPage() {
  const router = useRouter();
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingVideo, setEditingVideo] = useState<VideoData | null>(null);
  const [deletingVideo, setDeletingVideo] = useState<string | null>(null);

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

  const handleUpdateVideo = async (video: VideoData, updates: Partial<VideoData['meta']>) => {
    try {
      // Kategoriyalar nomlarini olish
      const allCategories = await getCategories();
      const selectedCategoryIds = updates.categories?.split(',') || [];
      const selectedCategoryNames = selectedCategoryIds
        .map(id => allCategories.find(c => c.id === id)?.name)
        .filter(Boolean)
        .join(', ');

      // Meta ma'lumotlarini yangilash
      const updatedMeta = {
        ...updates,
        category: selectedCategoryNames, // Kategoriya nomlari
      };

      const updatedVideo = await updateVideoMeta(video.uid, updatedMeta);
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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg"
          >
            Chiqish
          </button>
        </div>
        
        <div className="grid gap-6">
          {videos.map((video) => (
            <div key={video.uid} className="bg-gray-800 rounded-lg p-6">
              <div className="flex gap-6">
                <div className="w-64 aspect-video relative rounded-lg overflow-hidden bg-gray-900">
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
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateVideo(video, editingVideo.meta)}
                          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg"
                        >
                          Saqlash
                        </button>
                        <button
                          onClick={() => setEditingVideo(null)}
                          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg"
                        >
                          Bekor qilish
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold">{video.meta.name}</h2>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingVideo(video)}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg"
                          >
                            Tahrirlash
                          </button>
                          <button
                            onClick={() => handleDeleteVideo(video.uid)}
                            disabled={deletingVideo === video.uid}
                            className={`px-4 py-2 rounded-lg ${
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
                        <p className="text-gray-400 mb-4">{video.meta.description}</p>
                      )}
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div className="bg-gray-700 p-3 rounded-lg">
                          <div className="text-gray-400">Ko'rishlar</div>
                          <div className="text-lg font-semibold">{video.meta.views}</div>
                        </div>
                        <div className="bg-gray-700 p-3 rounded-lg">
                          <div className="text-gray-400">Like lar</div>
                          <div className="text-lg font-semibold">{video.meta.likes}</div>
                        </div>
                        <div className="bg-gray-700 p-3 rounded-lg">
                          <div className="text-gray-400">Dislike lar</div>
                          <div className="text-lg font-semibold">{video.meta.dislikes}</div>
                        </div>
                        <div className="bg-gray-700 p-3 rounded-lg">
                          <div className="text-gray-400">Kategoriyalar</div>
                          <div className="text-lg font-semibold">
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