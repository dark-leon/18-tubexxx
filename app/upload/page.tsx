'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [uploading, setUploading] = useState(false);

  const categories = [
    'Amateur', 'Anal', 'Asian', 'Big Ass', 'Big Tits', 'Blonde', 'Blowjob',
    'Brunette', 'Creampie', 'Cumshot', 'DeepThroat', 'Doggystyle', 'Ebony',
    'Facial', 'Hardcore', 'Interracial', 'Latina', 'Lesbian', 'Masturbation',
    'MILF', 'Orgasm', 'POV', 'Public', 'Real', 'Redhead', 'Russian', 'Solo',
    'Squirt', 'Teen', 'Threesome', 'Toys', 'Verified'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title || !category) return;

    setUploading(true);
    // TODO: Implement video upload logic here
    // For now, just show a success message and redirect
    setTimeout(() => {
      alert('Video uploaded successfully! It will be visible after admin approval.');
      router.push('/');
    }, 2000);
  };

  return (
    <div className="container mx-auto px-4 pt-24 pb-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Upload Video</h1>
        
        <div className="bg-[#111827]/60 backdrop-blur-sm p-6 rounded-xl border border-cyan-950">
          <div className="mb-6 text-yellow-400 bg-yellow-400/10 p-4 rounded-lg">
            <p className="text-sm">
              Note: Your video will be reviewed by our admins before being published on the site.
              This process helps ensure the quality and appropriateness of content.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Video File
              </label>
              <input
                type="file"
                accept="video/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full bg-[#1F2937]/60 text-white px-4 py-2 rounded-lg border border-cyan-950 focus:outline-none focus:ring-1 focus:ring-cyan-400/50"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#1F2937]/60 text-white px-4 py-2 rounded-lg border border-cyan-950 focus:outline-none focus:ring-1 focus:ring-cyan-400/50"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full bg-[#1F2937]/60 text-white px-4 py-2 rounded-lg border border-cyan-950 focus:outline-none focus:ring-1 focus:ring-cyan-400/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#1F2937]/60 text-white px-4 py-2 rounded-lg border border-cyan-950 focus:outline-none focus:ring-1 focus:ring-cyan-400/50"
                required
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat.toLowerCase()}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={uploading}
              className={`w-full px-4 py-2 bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-cyan-400 hover:to-emerald-400 rounded-lg text-white transition-all shadow-lg shadow-emerald-500/20 ${
                uploading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {uploading ? 'Uploading...' : 'Upload Video'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 