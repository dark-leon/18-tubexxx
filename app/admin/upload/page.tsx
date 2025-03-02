'use client';

import { useState, useRef, FormEvent, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '../../components/Navbar';
import { uploadVideo } from '@/app/utils/cloudflare';

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

function UploadPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressBarRef = useRef<HTMLProgressElement>(null);
  const [currentTag, setCurrentTag] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Iltimos, video faylini tanlang');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      await uploadVideo(
        file,
        {
          name: title,
          description,
          category: selectedCategories.map(id => defaultCategories.find(cat => cat.id === id)?.name).filter(Boolean).join(', '),
          categories: selectedCategories.join(','),
          tags: tags.join(',')
        },
        (progress) => {
          setProgress(progress);
        }
      );

      router.push('/admin');
    } catch (err) {
      console.error('Video yuklashda xatolik:', err);
      setError('Video yuklashda xatolik yuz berdi');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.05)_0%,rgba(6,182,212,0.05)_100%)] pointer-events-none"></div>
      <div className="fixed inset-0 bg-[url('/dots.png')] opacity-[0.03] mix-blend-screen pointer-events-none"></div>
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            Upload Video
          </h1>
          <p className="text-gray-400 text-center mb-8">
            Yangi video yuklash uchun quyidagi formani to'ldiring
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Video fayl tanlash */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Video Fayl
              </label>
              <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-cyan-950 rounded-lg hover:border-emerald-500/50 transition-colors">
                <div className="space-y-1 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="text-sm text-gray-400">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer rounded-md font-medium text-emerald-400 hover:text-emerald-300"
                    >
                      <span>Video faylni tanlang</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        accept="video/*"
                        className="sr-only"
                        onChange={handleFileChange}
                        disabled={uploading}
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">MP4, WebM, yoki MOV (max. 4GB)</p>
                </div>
              </div>
              {file && (
                <p className="mt-2 text-sm text-emerald-400">
                  Tanlangan fayl: {file.name}
                </p>
              )}
            </div>

            {/* Video nomi */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1.5">
                Sarlavha
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#1E293B]/60 backdrop-blur-sm rounded-lg border border-cyan-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                placeholder="Video sarlavhasini kiriting (60-70 belgi optimal)"
                maxLength={70}
                required
                disabled={uploading}
              />
              <p className="mt-1 text-xs text-gray-400">
                Tavsiyalar: 
                - Asosiy kalit so'zni sarlavha boshida ishlating
                - Qidiruv uchun muhim so'zlarni qo'shing
                - Aniq va tushunarli bo'lsin
                - {title.length}/70 belgi
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
                disabled={uploading}
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
                      disabled={uploading}
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
                      disabled={uploading}
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
                      disabled={uploading}
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
                      disabled={uploading}
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
                  disabled={uploading}
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
                      disabled={uploading}
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

            {/* Progress bar */}
            {uploading && (
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block text-emerald-400">
                      Yuklanmoqda
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold inline-block text-emerald-400">
                      {progress}%
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-emerald-400/20">
                  <div
                    style={{ width: `${progress}%` }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-emerald-400"
                  ></div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-4">
              <button
                type="button"
                onClick={() => router.push('/admin')}
                className="px-4 py-2.5 bg-[#1E293B]/60 backdrop-blur-sm rounded-lg border border-cyan-950 hover:bg-[#1E293B] transition-colors"
              >
                Bekor qilish
              </button>
              <button
                type="submit"
                disabled={!file || uploading}
                className={`px-6 py-2.5 rounded-lg text-center font-medium transition-all ${
                  !file || uploading
                    ? 'bg-emerald-400/50 cursor-not-allowed'
                    : 'bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-cyan-400 hover:to-emerald-400 shadow-lg shadow-emerald-500/20'
                }`}
              >
                {uploading ? 'Yuklanmoqda...' : 'Yuklash'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default function UploadPage() {
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
      <UploadPageContent />
    </Suspense>
  );
} 