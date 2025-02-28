'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getVideos, updateVideoMeta, deleteVideo } from '../utils/cloudflare';
import { logOut } from '../utils/firebase';
import type { VideoData } from '../utils/cloudflare';
import Navbar from '../components/Navbar';
import Cookies from 'js-cookie';
import Link from 'next/link';

export default function AdminPage() {
  const router = useRouter();
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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-8">
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <input
              type="text"
              placeholder="Search videos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 md:w-64 px-4 py-2 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg whitespace-nowrap"
            >
              Log Out
            </button>
          </div>
        </div>
        
        <div className="grid gap-6">
          {filteredVideos.map((video) => (
            <div key={video.uid} className="bg-gray-800 rounded-lg p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-64 aspect-video relative rounded-lg overflow-hidden bg-gray-900">
                  <iframe
                    src={`https://iframe.videodelivery.net/${video.uid}`}
                    className="w-full h-full absolute top-0 left-0"
                    allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                  />
                </div>
                
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-4">
                    <h2 className="text-xl font-semibold">{video.meta.name || 'Untitled video'}</h2>
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/edit/${video.uid}`}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDeleteVideo(video.uid)}
                        disabled={deletingVideo === video.uid}
                        className={`px-4 py-2 rounded-lg ${
                          deletingVideo === video.uid
                            ? 'bg-red-800 cursor-not-allowed'
                            : 'bg-red-600 hover:bg-red-700'
                        }`}
                      >
                        {deletingVideo === video.uid ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                  {video.meta.description && (
                    <p className="text-gray-400 mb-4">{video.meta.description}</p>
                  )}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="bg-gray-700 p-3 rounded-lg">
                      <div className="text-gray-400">Views</div>
                      <div className="text-lg font-semibold">{video.meta.views || '0'}</div>
                    </div>
                    <div className="bg-gray-700 p-3 rounded-lg">
                      <div className="text-gray-400">Likes</div>
                      <div className="text-lg font-semibold">{video.meta.likes || '0'}</div>
                    </div>
                    <div className="bg-gray-700 p-3 rounded-lg">
                      <div className="text-gray-400">Dislikes</div>
                      <div className="text-lg font-semibold">{video.meta.dislikes || '0'}</div>
                    </div>
                    <div className="bg-gray-700 p-3 rounded-lg">
                      <div className="text-gray-400">Categories</div>
                      <div className="text-lg font-semibold">
                        {video.meta.category ? (
                          <div className="flex flex-wrap gap-1">
                            {video.meta.category.split(', ').map((category, index) => (
                              <span
                                key={index}
                                className="inline-block px-2 py-1 bg-purple-600/20 text-purple-400 rounded-full text-xs"
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