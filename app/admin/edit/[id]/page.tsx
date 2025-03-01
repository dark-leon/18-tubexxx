'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getVideos, updateVideoMeta } from '../../../utils/cloudflare';
import type { VideoData } from '../../../utils/cloudflare';
import Navbar from '../../../components/Navbar';

// Kategoriyalar ro'yxati
const defaultCategories = [
  // Asosiy kategoriyalar
  {
    id: 'amateur',
    name: 'Amateur',
    slug: 'amateur',
    description: 'Amateur videos'
  },
  {
    id: 'asian',
    name: 'Asian',
    slug: 'asian',
    description: 'Asian videos'
  },
  {
    id: 'blonde',
    name: 'Blonde',
    slug: 'blonde',
    description: 'Blonde videos'
  },
  {
    id: 'brunette',
    name: 'Brunette',
    slug: 'brunette',
    description: 'Brunette videos'
  },
  {
    id: 'ebony',
    name: 'Ebony',
    slug: 'ebony',
    description: 'Ebony videos'
  },
  {
    id: 'latina',
    name: 'Latina',
    slug: 'latina',
    description: 'Latina videos'
  },
  {
    id: 'milf',
    name: 'MILF',
    slug: 'milf',
    description: 'MILF videos'
  },
  {
    id: 'redhead',
    name: 'Redhead',
    slug: 'redhead',
    description: 'Redhead videos'
  },
  {
    id: 'russian',
    name: 'Russian',
    slug: 'russian',
    description: 'Russian videos'
  },
  {
    id: 'teen',
    name: 'Teen',
    slug: 'teen',
    description: 'Teen videos'
  },
  // Xususiyatlar
  {
    id: 'big-ass',
    name: 'Big Ass',
    slug: 'big-ass',
    description: 'Big ass videos'
  },
  {
    id: 'big-tits',
    name: 'Big Tits',
    slug: 'big-tits',
    description: 'Big tits videos'
  },
  {
    id: 'real',
    name: 'Real',
    slug: 'real',
    description: 'Real videos'
  },
  {
    id: 'verified',
    name: 'Verified',
    slug: 'verified',
    description: 'Verified videos'
  },
  // Harakatlar
  {
    id: 'anal',
    name: 'Anal',
    slug: 'anal',
    description: 'Anal videos'
  },
  {
    id: 'blowjob',
    name: 'Blowjob',
    slug: 'blowjob',
    description: 'Blowjob videos'
  },
  {
    id: 'creampie',
    name: 'Creampie',
    slug: 'creampie',
    description: 'Creampie videos'
  },
  {
    id: 'cumshot',
    name: 'Cumshot',
    slug: 'cumshot',
    description: 'Cumshot videos'
  },
  {
    id: 'deepthroat',
    name: 'DeepThroat',
    slug: 'deepthroat',
    description: 'DeepThroat videos'
  },
  {
    id: 'doggystyle',
    name: 'Doggystyle',
    slug: 'doggystyle',
    description: 'Doggystyle videos'
  },
  {
    id: 'facial',
    name: 'Facial',
    slug: 'facial',
    description: 'Facial videos'
  },
  {
    id: 'hardcore',
    name: 'Hardcore',
    slug: 'hardcore',
    description: 'Hardcore videos'
  },
  {
    id: 'interracial',
    name: 'Interracial',
    slug: 'interracial',
    description: 'Interracial videos'
  },
  {
    id: 'lesbian',
    name: 'Lesbian',
    slug: 'lesbian',
    description: 'Lesbian videos'
  },
  {
    id: 'masturbation',
    name: 'Masturbation',
    slug: 'masturbation',
    description: 'Masturbation videos'
  },
  {
    id: 'orgasm',
    name: 'Orgasm',
    slug: 'orgasm',
    description: 'Orgasm videos'
  },
  {
    id: 'pov',
    name: 'POV',
    slug: 'pov',
    description: 'POV videos'
  },
  {
    id: 'public',
    name: 'Public',
    slug: 'public',
    description: 'Public videos'
  },
  {
    id: 'solo',
    name: 'Solo',
    slug: 'solo',
    description: 'Solo videos'
  },
  {
    id: 'squirt',
    name: 'Squirt',
    slug: 'squirt',
    description: 'Squirt videos'
  },
  {
    id: 'threesome',
    name: 'Threesome',
    slug: 'threesome',
    description: 'Threesome videos'
  },
  {
    id: 'toys',
    name: 'Toys',
    slug: 'toys',
    description: 'Toys videos'
  },
  // Pornstarlar
  {
    id: 'abella-danger',
    name: 'Abella Danger',
    slug: 'abella-danger',
    description: 'Abella Danger videos'
  },
  {
    id: 'adriana-chechik',
    name: 'Adriana Chechik',
    slug: 'adriana-chechik',
    description: 'Adriana Chechik videos'
  },
  {
    id: 'angela-white',
    name: 'Angela White',
    slug: 'angela-white',
    description: 'Angela White videos'
  },
  {
    id: 'asa-akira',
    name: 'Asa Akira',
    slug: 'asa-akira',
    description: 'Asa Akira videos'
  },
  {
    id: 'brandi-love',
    name: 'Brandi Love',
    slug: 'brandi-love',
    description: 'Brandi Love videos'
  },
  {
    id: 'dani-daniels',
    name: 'Dani Daniels',
    slug: 'dani-daniels',
    description: 'Dani Daniels videos'
  },
  {
    id: 'eva-elfie',
    name: 'Eva Elfie',
    slug: 'eva-elfie',
    description: 'Eva Elfie videos'
  },
  {
    id: 'gabbie-carter',
    name: 'Gabbie Carter',
    slug: 'gabbie-carter',
    description: 'Gabbie Carter videos'
  },
  {
    id: 'jia-lissa',
    name: 'Jia Lissa',
    slug: 'jia-lissa',
    description: 'Jia Lissa videos'
  },
  {
    id: 'johnny-sins',
    name: 'Johnny Sins',
    slug: 'johnny-sins',
    description: 'Johnny Sins videos'
  },
  {
    id: 'lana-rhoades',
    name: 'Lana Rhoades',
    slug: 'lana-rhoades',
    description: 'Lana Rhoades videos'
  },
  {
    id: 'lisa-ann',
    name: 'Lisa Ann',
    slug: 'lisa-ann',
    description: 'Lisa Ann videos'
  },
  {
    id: 'mia-khalifa',
    name: 'Mia Khalifa',
    slug: 'mia-khalifa',
    description: 'Mia Khalifa videos'
  },
  {
    id: 'mia-malkova',
    name: 'Mia Malkova',
    slug: 'mia-malkova',
    description: 'Mia Malkova videos'
  },
  {
    id: 'nicole-aniston',
    name: 'Nicole Aniston',
    slug: 'nicole-aniston',
    description: 'Nicole Aniston videos'
  },
  {
    id: 'riley-reid',
    name: 'Riley Reid',
    slug: 'riley-reid',
    description: 'Riley Reid videos'
  },
  {
    id: 'sasha-grey',
    name: 'Sasha Grey',
    slug: 'sasha-grey',
    description: 'Sasha Grey videos'
  },
  {
    id: 'valentina-nappi',
    name: 'Valentina Nappi',
    slug: 'valentina-nappi',
    description: 'Valentina Nappi videos'
  }
];

interface PageProps {
  params: {
    id: string;
  };
}

export default function EditVideoPage({ params }: PageProps) {
  const { id } = params;
  const router = useRouter();
  const [video, setVideo] = useState<VideoData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const videos = await getVideos();
        const video = videos.find(v => v.uid === id);
        if (video) {
          setVideo(video);
          setName(video.meta.name || '');
          setDescription(video.meta.description || '');
          setSelectedCategories(video.meta.categories?.split(',') || []);
          setTags(video.meta.tags?.split(',').filter(Boolean) || []);
        } else {
          setError('Video topilmadi');
        }
      } catch (err) {
        console.error('Error fetching video:', err);
        setError('Video ma\'lumotlarini yuklashda xatolik');
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideo();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await updateVideoMeta(id, {
        name,
        description,
        category: selectedCategories.map(id => defaultCategories.find(cat => cat.id === id)?.name).filter(Boolean).join(', '),
        categories: selectedCategories.join(','),
        tags: tags.join(',')
      });
      router.push('/admin');
    } catch (err) {
      console.error('Error updating video:', err);
      setError('Video ma\'lumotlarini yangilashda xatolik');
    } finally {
      setIsSaving(false);
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

  if (error || !video) {
    return (
      <div className="min-h-screen bg-[#030712] text-white">
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.05)_0%,rgba(6,182,212,0.05)_100%)] pointer-events-none"></div>
        <div className="fixed inset-0 bg-[url('/dots.png')] opacity-[0.03] mix-blend-screen pointer-events-none"></div>
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-8">
          <div className="text-center">
            <div className="text-xl text-red-400 mb-4">{error || 'Video topilmadi'}</div>
            <button
              onClick={() => router.push('/admin')}
              className="px-4 py-2 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-lg text-white"
            >
              Back to admin panel
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
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            Edit video
          </h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Video Preview */}
            <div className="aspect-video relative rounded-lg overflow-hidden bg-[#111827]/60 backdrop-blur-sm ring-1 ring-cyan-950">
              <iframe
                src={`https://iframe.videodelivery.net/${video.uid}`}
                className="w-full h-full absolute top-0 left-0"
                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* Video nomi */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1.5">
                Sarlavha
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#1E293B]/60 backdrop-blur-sm rounded-lg border border-cyan-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                placeholder="Video sarlavhasini kiriting (60-70 belgi optimal)"
                maxLength={70}
                required
                disabled={isSaving}
              />
              <p className="mt-1 text-xs text-gray-400">
                Tavsiyalar: 
                - Asosiy kalit so'zni sarlavha boshida ishlating
                - Qidiruv uchun muhim so'zlarni qo'shing
                - Aniq va tushunarli bo'lsin
                - {name.length}/70 belgi
              </p>
            </div>

            {/* Video tavsifi */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1.5">
                Tavsif
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-4 py-2.5 bg-[#1E293B]/60 backdrop-blur-sm rounded-lg border border-cyan-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                placeholder="Video haqida qisqacha ma'lumot (150-160 belgi optimal)"
                maxLength={160}
                disabled={isSaving}
              />
              <p className="mt-1 text-xs text-gray-400">
                Tavsiyalar:
                - Asosiy mazmunni birinchi jumlada yozing
                - Kalit so'zlarni tabiiy ravishda qo'shing
                - Qo'shimcha ma'lumotlar va teglarni qo'shing
                - {description.length}/160 belgi
              </p>
            </div>

            {/* Kategoriyalar */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Kategoriyalar
              </label>
              
              {/* Asosiy kategoriyalar */}
              <div className="mb-4">
                <h3 className="text-sm font-medium text-emerald-400 mb-2">Asosiy kategoriyalar</h3>
                <div className="flex flex-wrap gap-2">
                  {defaultCategories.slice(0, 10).map((category) => (
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
                      disabled={isSaving}
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
                  {defaultCategories.slice(10, 14).map((category) => (
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
                      disabled={isSaving}
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
                  {defaultCategories.slice(14, 32).map((category) => (
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
                      disabled={isSaving}
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
                  {defaultCategories.slice(32).map((category) => (
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
                      disabled={isSaving}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>

              <p className="mt-1 text-xs text-gray-400">
                Tavsiyalar:
                - Eng mos kategoriyalarni tanlang
                - Bir nechta kategoriya tanlash mumkin
                - Aniq va to'g'ri kategoriyalarni tanlang
              </p>
            </div>

            {/* Teglar */}
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-300 mb-1.5">
                Teglar
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="tags"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && currentTag.trim()) {
                      e.preventDefault();
                      if (!tags.includes(currentTag.trim())) {
                        setTags([...tags, currentTag.trim()]);
                      }
                      setCurrentTag('');
                    }
                  }}
                  className="w-full px-4 py-2.5 bg-[#1E293B]/60 backdrop-blur-sm rounded-lg border border-cyan-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  placeholder="Teg kiriting va Enter bosing"
                  disabled={isSaving}
                />
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-[#1E293B]/60 backdrop-blur-sm text-emerald-400 border border-emerald-400/20"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => setTags(tags.filter((_, i) => i !== index))}
                      className="ml-2 text-emerald-400 hover:text-emerald-300"
                      disabled={isSaving}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <p className="mt-1 text-xs text-gray-400">
                Tavsiyalar:
                - Videoga aloqador kalit so'zlarni teg sifatida qo'shing
                - Qidiruv uchun muhim so'zlarni teg qiling
                - Ko'p ishlatiladigan teglardan foydalaning
              </p>
            </div>

            {/* Submit buttons */}
            <div className="flex items-center justify-end gap-4">
              <button
                type="button"
                onClick={() => router.push('/admin')}
                className="px-4 py-2.5 bg-[#1E293B]/60 backdrop-blur-sm rounded-lg border border-cyan-950 hover:bg-[#1E293B] transition-colors"
                disabled={isSaving}
              >
                Bekor qilish
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className={`px-6 py-2.5 rounded-lg text-center font-medium transition-all ${
                  isSaving
                    ? 'bg-emerald-400/50 cursor-not-allowed'
                    : 'bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-cyan-400 hover:to-emerald-400 shadow-lg shadow-emerald-500/20'
                }`}
              >
                {isSaving ? 'Saqlanmoqda...' : 'Saqlash'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
