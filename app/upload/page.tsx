'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();

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
        showStatus('error', "Iltimos, video tanlang");
        return;
      }

      // Fayl hajmini tekshirish (2GB gacha)
      if (file.size > 2 * 1024 * 1024 * 1024) {
        showStatus('error', "Video hajmi 2GB dan oshmasligi kerak");
        return;
      }

      showStatus('info', "Video yuklanmoqda...");

      // XMLHttpRequest orqali yuklash progressini kuzatish
      const xhr = new XMLHttpRequest();
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('requireSignedURLs', 'false');

      // Progress eventini kuzatish
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(progress);
          showStatus('info', `Video yuklanmoqda: ${progress}%`);
        }
      };

      // Promise orqali XMLHttpRequest ni ishlatish
      const uploadVideo = () => {
        return new Promise((resolve, reject) => {
          xhr.open('POST', `https://api.cloudflare.com/client/v4/accounts/${process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID}/stream`);
          xhr.setRequestHeader('Authorization', `Bearer ${process.env.NEXT_PUBLIC_CLOUDFLARE_API_TOKEN}`);

          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve(JSON.parse(xhr.response));
            } else {
              reject(new Error(`Video yuklashda xatolik: ${xhr.status} ${xhr.statusText}`));
            }
          };

          xhr.onerror = () => reject(new Error('Tarmoq xatoligi: Video yuklab bo\'lmadi'));
          xhr.send(uploadFormData);
        });
      };

      const data = await uploadVideo() as any;
      
      if (data.success) {
        showStatus('info', "Video qayta ishlanmoqda...");

        // Video ma'lumotlarini yangilash
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
          showStatus('success', "✅ Video muvaffaqiyatli yuklandi va admin tomonidan ko'rib chiqiladi. 3 soniyadan so'ng asosiy sahifaga qaytasiz...");
          
          // Notification API orqali xabar berish
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Video yuklandi', {
              body: "Video muvaffaqiyatli yuklandi va admin tomonidan ko'rib chiqiladi",
              icon: '/logo.png'
            });
          }
        } else {
          const errorData = await updateResponse.json();
          throw new Error(`Video ma'lumotlarini yangilashda xatolik: ${errorData.errors?.[0]?.message || 'Noma\'lum xato'}`);
        }
      } else {
        throw new Error(data.errors?.[0]?.message || 'Cloudflare Stream xatoligi');
      }
    } catch (error) {
      console.error('Upload error:', error);
      showStatus('error', "❌ " + (error instanceof Error ? error.message : 'Noma\'lum xato'));
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Notification ruxsatini so'rash
  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  // Komponent yuklanganda Notification ruxsatini so'rash
  useState(() => {
    requestNotificationPermission();
  });

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Video Yuklash</h1>

      {status.type && (
        <div className={`mb-4 p-4 rounded-lg ${
          status.type === 'success' ? 'bg-green-100 text-green-700 border border-green-200' :
          status.type === 'error' ? 'bg-red-100 text-red-700 border border-red-200' :
          'bg-blue-100 text-blue-700 border border-blue-200'
        }`}>
          {status.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Video fayl (max: 2GB)</label>
            <input
              type="file"
              accept="video/*"
              required
              className="w-full p-2 border rounded-lg"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Sarlavha</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full p-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Tavsif</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full p-2 border rounded-lg"
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Kategoriyalar (vergul bilan ajrating)</label>
            <input
              type="text"
              value={formData.categories}
              onChange={(e) => setFormData({...formData, categories: e.target.value})}
              className="w-full p-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Teglar (vergul bilan ajrating)</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({...formData, tags: e.target.value})}
              className="w-full p-2 border rounded-lg"
            />
          </div>
        </div>

        {uploading && (
          <div className="mb-4">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-center mt-2 text-sm text-gray-600">
              {uploadProgress}% yuklandi
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={uploading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          {uploading ? "Yuklanmoqda..." : "Yuklash"}
        </button>
      </form>
    </div>
  );
} 