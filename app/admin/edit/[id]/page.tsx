'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getVideo, updateVideoMeta, VideoData } from '@/app/utils/cloudflare';
import { defaultCategories, categoryGroups } from '@/app/utils/categories';
import Navbar from '@/app/components/Navbar';

interface PageProps {
  params: {
    id: string;
  };
}

export default function EditPage({ params }: PageProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    tags: ''
  });
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  useEffect(() => {
    loadVideo();
  }, []);

  const loadVideo = async () => {
    try {
      const video = await getVideo(params.id);
      if (!video) {
        setError('Video topilmadi');
        setLoading(false);
        return;
      }

      setFormData({
        name: video.meta.name || '',
        description: video.meta.description || '',
        category: video.meta.category || '',
        tags: video.meta.tags || ''
      });

      if (video.meta.category) {
        const categoryNames = video.meta.category.split(',').map(cat => cat.trim());
        const categoryIds = categoryNames
          .map(name => {
            const category = defaultCategories.find(c => c.name === name);
            return category ? category.id : null;
          })
          .filter((id): id is string => id !== null);
        setSelectedCategories(categoryIds);
      }

      setLoading(false);
    } catch (err) {
      console.error('Error loading video:', err);
      setError('Video yuklashda xatolik yuz berdi');
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const selectedCategoryNames = selectedCategories
        .map((id: string) => defaultCategories.find(cat => cat.id === id)?.name)
        .filter(Boolean)
        .join(', ');

      await updateVideoMeta(params.id, {
        ...formData,
        category: selectedCategoryNames
      });

      router.push('/admin');
    } catch (err) {
      console.error('Error updating video:', err);
      setError('Video yangilashda xatolik yuz berdi');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030712] text-white">
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
      <div className="min-h-screen bg-[#030712] text-white">
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
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-8">
            Video tahrirlash
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-emerald-400 mb-2">
                Video nomi
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#1E293B]/60 backdrop-blur-sm rounded-lg border border-cyan-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-emerald-400 mb-2">
                Tavsif
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-2.5 bg-[#1E293B]/60 backdrop-blur-sm rounded-lg border border-cyan-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>

            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-emerald-400 mb-2">
                Teglar (vergul bilan ajrating)
              </label>
              <input
                type="text"
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#1E293B]/60 backdrop-blur-sm rounded-lg border border-cyan-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>

            {/* Asosiy kategoriyalar */}
            <div className="mb-4">
              <h3 className="text-sm font-medium text-emerald-400 mb-2">Asosiy kategoriyalar</h3>
              <div className="flex flex-wrap gap-2">
                {categoryGroups.main.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => {
                      if (selectedCategories.includes(category.id)) {
                        setSelectedCategories(prev => prev.filter(id => id !== category.id));
                      } else {
                        setSelectedCategories(prev => [...prev, category.id]);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                      selectedCategories.includes(category.id)
                        ? 'bg-gradient-to-r from-emerald-400 to-cyan-400 text-white shadow-lg shadow-emerald-500/20'
                        : 'bg-[#1E293B]/60 backdrop-blur-sm text-gray-400 border border-cyan-950'
                    }`}
                    disabled={saving}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Xususiyatlar */}
            <div className="mb-4">
              <h3 className="text-sm font-medium text-emerald-400 mb-2">Xususiyatlar</h3>
              <div className="flex flex-wrap gap-2">
                {categoryGroups.features.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => {
                      if (selectedCategories.includes(category.id)) {
                        setSelectedCategories(prev => prev.filter(id => id !== category.id));
                      } else {
                        setSelectedCategories(prev => [...prev, category.id]);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                      selectedCategories.includes(category.id)
                        ? 'bg-gradient-to-r from-emerald-400 to-cyan-400 text-white shadow-lg shadow-emerald-500/20'
                        : 'bg-[#1E293B]/60 backdrop-blur-sm text-gray-400 border border-cyan-950'
                    }`}
                    disabled={saving}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Harakatlar */}
            <div className="mb-4">
              <h3 className="text-sm font-medium text-emerald-400 mb-2">Harakatlar</h3>
              <div className="flex flex-wrap gap-2">
                {categoryGroups.actions.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => {
                      if (selectedCategories.includes(category.id)) {
                        setSelectedCategories(prev => prev.filter(id => id !== category.id));
                      } else {
                        setSelectedCategories(prev => [...prev, category.id]);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                      selectedCategories.includes(category.id)
                        ? 'bg-gradient-to-r from-emerald-400 to-cyan-400 text-white shadow-lg shadow-emerald-500/20'
                        : 'bg-[#1E293B]/60 backdrop-blur-sm text-gray-400 border border-cyan-950'
                    }`}
                    disabled={saving}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Pornstarlar */}
            <div className="mb-4">
              <h3 className="text-sm font-medium text-emerald-400 mb-2">Pornstarlar</h3>
              <div className="flex flex-wrap gap-2">
                {categoryGroups.pornstars.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => {
                      if (selectedCategories.includes(category.id)) {
                        setSelectedCategories(prev => prev.filter(id => id !== category.id));
                      } else {
                        setSelectedCategories(prev => [...prev, category.id]);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                      selectedCategories.includes(category.id)
                        ? 'bg-gradient-to-r from-emerald-400 to-cyan-400 text-white shadow-lg shadow-emerald-500/20'
                        : 'bg-[#1E293B]/60 backdrop-blur-sm text-gray-400 border border-cyan-950'
                    }`}
                    disabled={saving}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => router.push('/admin')}
                className="px-6 py-2.5 rounded-lg border border-cyan-950 hover:bg-[#1E293B]/60 transition-all"
                disabled={saving}
              >
                Bekor qilish
              </button>
              <button
                type="submit"
                disabled={saving}
                className={`px-6 py-2.5 bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-cyan-400 hover:to-emerald-400 rounded-lg text-white transition-all shadow-lg shadow-emerald-500/20 ${
                  saving ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {saving ? 'Saqlanmoqda...' : 'Saqlash'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
