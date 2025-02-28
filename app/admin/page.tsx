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
import Link from 'next/link';

export default function AdminPanel() {
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
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-4">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
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
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
          <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            Admin Panel
          </h1>
          <div className="flex gap-4">
            <Link
              href="/"
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white transition-colors text-sm"
            >
              Back to Home
            </Link>
            <Link
              href="/admin/upload"
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors text-sm"
            >
              Upload Video
            </Link>
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-900/50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Video
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider hidden sm:table-cell">
                    Duration
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider hidden md:table-cell">
                    Views
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider hidden lg:table-cell">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {videos.map((video) => (
                  <tr key={video.uid} className="hover:bg-gray-700/30">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 w-24 h-16 relative rounded overflow-hidden">
                          <iframe
                            src={`https://iframe.videodelivery.net/${video.uid}`}
                            className="absolute inset-0 w-full h-full"
                            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate max-w-xs">
                            {video.meta.name || 'Untitled video'}
                          </p>
                          <p className="text-sm text-gray-400 truncate">
                            ID: {video.uid}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap hidden sm:table-cell">
                      <span className="text-sm text-gray-300">
                        {Math.floor(video.duration / 60)}:{String(
                          Math.floor(video.duration % 60)
                        ).padStart(2, '0')}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap hidden md:table-cell">
                      <span className="text-sm text-gray-300">
                        {video.meta.views || '0'} views
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap hidden lg:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {video.meta.category?.split(', ').map((category, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-400/10 text-purple-400"
                          >
                            {category}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/edit/${video.uid}`}
                          className="text-purple-400 hover:text-purple-300 transition-colors"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDeleteVideo(video.uid)}
                          disabled={deletingVideo === video.uid}
                          className={`text-red-400 hover:text-red-300 transition-colors ${
                            deletingVideo === video.uid ? 'cursor-not-allowed' : ''
                          }`}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 