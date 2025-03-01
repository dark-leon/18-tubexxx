'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getVideos, updateVideoMeta } from '../../../utils/cloudflare';
import type { VideoData } from '../../../utils/cloudflare';
import Navbar from '../../../components/Navbar';

const defaultCategories = [
  // Main Categories
  'Amateur',
  'Asian',
  'Blonde',
  'Brunette',
  'Ebony',
  'Latina',
  'MILF',
  'Redhead',
  'Russian',
  'Teen',
  // Features
  'Big Ass',
  'Big Tits',
  'Real',
  'Verified',
  // Actions
  'Anal',
  'Blowjob',
  'Creampie',
  'Cumshot',
  'DeepThroat',
  'Doggystyle',
  'Facial',
  'Hardcore',
  'Interracial',
  'Lesbian',
  'Masturbation',
  'Orgasm',
  'POV',
  'Public',
  'Solo',
  'Squirt',
  'Threesome',
  'Toys',
  // Pornstars
  'Abella Danger',
  'Adriana Chechik',
  'Angela White',
  'Asa Akira',
  'Brandi Love',
  'Dani Daniels',
  'Eva Elfie',
  'Gabbie Carter',
  'Jia Lissa',
  'Johnny Sins',
  'Lana Rhoades',
  'Lisa Ann',
  'Mia Khalifa',
  'Mia Malkova',
  'Nicole Aniston',
  'Riley Reid',
  'Sasha Grey',
  'Valentina Nappi'
];

interface PageProps {
  params: {
    id: string;
  };
}

export default function EditVideoPage({ params }: PageProps) {
  const router = useRouter();
  const { id } = params;
  const [video, setVideo] = useState<VideoData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [availableCategories, setAvailableCategories] = useState<string[]>(defaultCategories);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const videos = await getVideos();
        const video = videos.find((v) => v.uid === id);
        if (video) {
          setVideo(video);
          setName(video.meta.name || '');
          setDescription(video.meta.description || '');
          if (video.meta.category) {
            setSelectedCategories(video.meta.category.split(', '));
          }
        } else {
          setError('Video not found');
        }
      } catch (err) {
        setError('Error loading video');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideo();
  }, [id]);

  const handleAddCategory = () => {
    if (newCategory && !availableCategories.includes(newCategory)) {
      setAvailableCategories([...availableCategories, newCategory]);
      setSelectedCategories([...selectedCategories, newCategory]);
      setNewCategory('');
    }
  };

  const handleCategoryToggle = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await updateVideoMeta(id, {
        name,
        description,
        category: selectedCategories.join(', ')
      });
      router.push('/admin');
    } catch (err) {
      console.error('Error updating video:', err);
      setError('Failed to update video');
    } finally {
      setIsSaving(false);
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

  if (error || !video) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-8">
          <div className="text-center">
            <div className="text-xl text-red-500 mb-4">{error || 'Video not found'}</div>
            <button
              onClick={() => router.push('/admin')}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white"
            >
              Back to Admin Panel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Edit Video</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Video Preview */}
            <div className="aspect-video relative rounded-lg overflow-hidden bg-gray-800">
              <iframe
                src={`https://iframe.videodelivery.net/${video.uid}`}
                className="w-full h-full absolute top-0 left-0"
                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* Video Title */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                Title
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter video title"
              />
            </div>

            {/* Video Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter video description"
              />
            </div>

            {/* Categories */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Categories
              </label>
              <div className="flex flex-wrap gap-2 mb-4">
                {availableCategories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => handleCategoryToggle(category)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      selectedCategories.includes(category)
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Add New Category */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="flex-1 bg-gray-800 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Add new category"
              />
              <button
                type="button"
                onClick={handleAddCategory}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors"
              >
                Add
              </button>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => router.push('/admin')}
                className="px-6 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className={`px-6 py-2 rounded-lg text-white transition-colors ${
                  isSaving
                    ? 'bg-purple-400 cursor-not-allowed'
                    : 'bg-purple-600 hover:bg-purple-700'
                }`}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
