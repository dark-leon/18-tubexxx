'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { defaultCategories, categoryGroups } from '@/app/utils/categories';

export default function UploadPage() {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info' | null; message: string }>({ type: null, message: '' });
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categories: '',
    tags: ''
  });
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('video/')) {
        setSelectedFile(file);
      } else {
        showStatus('error', "Please select a video file");
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev => {
      const isSelected = prev.includes(categoryId);
      if (isSelected) {
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      categories: selectedCategories.map(id => 
        defaultCategories.find(c => c.id === id)?.name || ''
      ).join(', ')
    }));
  }, [selectedCategories]);

  const showStatus = (type: 'success' | 'error' | 'info', message: string) => {
    setStatus({ type, message });
    if (type === 'success') {
      setTimeout(() => {
        setStatus({ type: null, message: '' });
        router.push('/');
      }, 3000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setUploadProgress(0);
    setStatus({ type: null, message: '' });

    try {
      const form = e.target as HTMLFormElement;
      const fileInput = form.querySelector('input[type="file"]') as HTMLInputElement;
      const file = fileInput.files?.[0];

      if (!file) {
        showStatus('error', "Please select a video file");
        return;
      }

      // Check file size (up to 2GB)
      if (file.size > 2 * 1024 * 1024 * 1024) {
        showStatus('error', "Video size should not exceed 2GB");
        return;
      }

      showStatus('info', "Uploading video...");

      // Track upload progress with XMLHttpRequest
      const xhr = new XMLHttpRequest();
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('requireSignedURLs', 'false');

      // Track progress event
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(progress);
          showStatus('info', `Uploading: ${progress}%`);
        }
      };

      // Use Promise with XMLHttpRequest
      const uploadVideo = () => {
        return new Promise((resolve, reject) => {
          xhr.open('POST', `https://api.cloudflare.com/client/v4/accounts/${process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID}/stream`);
          xhr.setRequestHeader('Authorization', `Bearer ${process.env.NEXT_PUBLIC_CLOUDFLARE_API_TOKEN}`);

          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve(JSON.parse(xhr.response));
            } else {
              reject(new Error(`Upload error: ${xhr.status} ${xhr.statusText}`));
            }
          };

          xhr.onerror = () => reject(new Error('Network error: Could not upload video'));
          xhr.send(uploadFormData);
        });
      };

      const data = await uploadVideo() as any;
      
      if (data.success) {
        showStatus('info', "Processing video...");

        // Update video metadata
        const updateResponse = await fetch(`https://api.cloudflare.com/client/v4/accounts/${process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID}/stream/${data.result.uid}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_CLOUDFLARE_API_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            meta: {
              name: formData.name,
              description: formData.description,
              categories: formData.categories,
              tags: formData.tags,
              uploadedAt: new Date().toISOString(),
              views: "0",
              likes: "0",
              dislikes: "0",
              isApproved: "false"
            },
            readyToStream: false
          })
        });

        if (updateResponse.ok) {
          showStatus('success', "✅ Video uploaded successfully and will be reviewed by admin. Redirecting to home page in 3 seconds...");
          
          // Show notification
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Video Uploaded', {
              body: "Video uploaded successfully and will be reviewed by admin",
              icon: '/logo.png'
            });
          }
        } else {
          const errorData = await updateResponse.json();
          throw new Error(`Error updating video metadata: ${errorData.errors?.[0]?.message || 'Unknown error'}`);
        }
      } else {
        throw new Error(data.errors?.[0]?.message || 'Cloudflare Stream error');
      }
    } catch (error) {
      console.error('Upload error:', error);
      showStatus('error', "❌ " + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Request notification permission
  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.05)_0%,rgba(6,182,212,0.05)_100%)] pointer-events-none"></div>
      <div className="fixed inset-0 bg-[url('/dots.png')] opacity-[0.03] mix-blend-screen pointer-events-none"></div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            Upload Video
          </h1>

          {status.type && (
            <div className={`mb-6 p-4 rounded-xl backdrop-blur-sm border ${
              status.type === 'success' ? 'bg-emerald-400/10 border-emerald-400/20 text-emerald-400' :
              status.type === 'error' ? 'bg-red-400/10 border-red-400/20 text-red-400' :
              'bg-cyan-400/10 border-cyan-400/20 text-cyan-400'
            }`}>
              {status.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-[#111827]/60 backdrop-blur-sm rounded-xl border border-cyan-950 p-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Video File (max: 2GB)</label>
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={`relative group cursor-pointer transition-all ${
                      dragActive ? 'border-emerald-400 bg-emerald-400/5' : 'border-cyan-950 hover:border-emerald-400/50 hover:bg-emerald-400/5'
                    } border-2 border-dashed rounded-xl p-8`}
                    onClick={handleFileButtonClick}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="video/*"
                      required
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                    <div className="flex flex-col items-center justify-center space-y-4 text-center">
                      <div className="p-4 rounded-full bg-emerald-400/10 text-emerald-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      {selectedFile ? (
                        <>
                          <p className="text-emerald-400 font-medium">{selectedFile.name}</p>
                          <p className="text-gray-400 text-sm">Click or drag to change video</p>
                        </>
                      ) : (
                        <>
                          <p className="text-gray-300 font-medium">Drag and drop your video here</p>
                          <p className="text-gray-400 text-sm">or click to select a file</p>
                        </>
                      )}
                      <p className="text-gray-400 text-xs">MP4, WebM or Ogg • Max 2GB</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Title</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full p-3 bg-[#1E293B]/60 backdrop-blur-sm rounded-lg border border-cyan-950 text-gray-300 focus:ring-2 focus:ring-emerald-400/20 transition-all"
                    placeholder="Enter video title..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full p-3 bg-[#1E293B]/60 backdrop-blur-sm rounded-lg border border-cyan-950 text-gray-300 focus:ring-2 focus:ring-emerald-400/20 transition-all"
                    rows={4}
                    placeholder="Enter video description..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Categories</label>
                  <div className="space-y-6">
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
                            disabled={uploading}
                          >
                            {category.name}
                          </button>
                        ))}
                      </div>
                    </div>

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
                            disabled={uploading}
                          >
                            {category.name}
                          </button>
                        ))}
                      </div>
                    </div>

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
                            disabled={uploading}
                          >
                            {category.name}
                          </button>
                        ))}
                      </div>
                    </div>

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
                            disabled={uploading}
                          >
                            {category.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Tags</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({...formData, tags: e.target.value})}
                    className="w-full p-3 bg-[#1E293B]/60 backdrop-blur-sm rounded-lg border border-cyan-950 text-gray-300 focus:ring-2 focus:ring-emerald-400/20 transition-all"
                    placeholder="Enter tags separated by commas..."
                  />
                </div>
              </div>
            </div>

            {uploading && (
              <div className="bg-[#111827]/60 backdrop-blur-sm rounded-xl border border-cyan-950 p-6">
                <div className="h-2 bg-[#1E293B] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-center mt-2 text-sm text-gray-400">
                  {uploadProgress}% uploaded
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={uploading}
              className={`w-full p-4 rounded-xl font-medium transition-all ${
                uploading
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-cyan-400 hover:to-emerald-400 shadow-lg shadow-emerald-500/20'
              }`}
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 