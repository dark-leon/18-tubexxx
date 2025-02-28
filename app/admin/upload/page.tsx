'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import { uploadVideo, updateVideoMeta } from '../../utils/cloudflare';

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categories, setCategories] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Iltimos, video faylni tanlang');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      // Upload video with metadata
      const result = await uploadVideo(
        file,
        {
          name: title,
          description,
          category: categories,
          categories: 'default' // Bu yerga kerakli qiymatni qo'ying
        },
        (progress) => {
          setUploadProgress(progress);
        }
      );

      router.push('/admin');
    } catch (err: any) {
      setError(err.message || 'Video yuklashda xatolik yuz berdi');
    } finally {
      setIsUploading(false);
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
            Video Yuklash
          </h1>
          <p className="text-gray-400 text-center mb-8">
            Yangi video yuklash uchun quyidagi formani to'ldiring
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-rose-500/10 border border-rose-500 text-rose-500 px-4 py-3 rounded-lg text-center text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
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
                  placeholder="Video sarlavhasini kiriting"
                  required
                />
              </div>

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
                  placeholder="Video haqida qisqacha ma'lumot"
                />
              </div>

              <div>
                <label htmlFor="categories" className="block text-sm font-medium text-gray-300 mb-1.5">
                  Kategoriyalar
                </label>
                <input
                  type="text"
                  id="categories"
                  value={categories}
                  onChange={(e) => setCategories(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#1E293B]/60 backdrop-blur-sm rounded-lg border border-cyan-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  placeholder="Kategoriyalarni vergul bilan ajrating"
                />
              </div>
            </div>

            {isUploading && (
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block text-emerald-400">
                      Yuklanmoqda
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold inline-block text-emerald-400">
                      {uploadProgress}%
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-emerald-400/20">
                  <div
                    style={{ width: `${uploadProgress}%` }}
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
                disabled={isUploading}
                className={`px-6 py-2.5 rounded-lg text-center font-medium transition-all ${
                  isUploading
                    ? 'bg-emerald-400/50 cursor-not-allowed'
                    : 'bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-cyan-400 hover:to-emerald-400 shadow-lg shadow-emerald-500/20'
                }`}
              >
                {isUploading ? 'Yuklanmoqda...' : 'Yuklash'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
} 