'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginWithEmailAndPassword } from '../../utils/firebase';
import Cookies from 'js-cookie';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const user = await loginWithEmailAndPassword(email, password);
      // Set auth session cookie
      Cookies.set('auth_session', user.uid, { expires: 7 }); // 7 days cookie
      router.push('/admin');
    } catch (err: any) {
      setError('Invalid email or password');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.05)_0%,rgba(6,182,212,0.05)_100%)] pointer-events-none"></div>
      <div className="fixed inset-0 bg-[url('/dots.png')] opacity-[0.03] mix-blend-screen pointer-events-none"></div>
      <div className="relative flex items-center justify-center min-h-screen">
        <div className="w-full max-w-md p-8 bg-[#111827]/60 backdrop-blur-sm rounded-2xl border border-cyan-950 shadow-xl">
          <h1 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Admin</h1>
          <p className="text-gray-400 text-center mb-8">Enter your credentials to login to the system </p>
          
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-rose-500/10 border border-rose-500 text-rose-500 px-4 py-3 rounded-lg text-center text-sm">
                {error}
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1.5">
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#1E293B]/60 backdrop-blur-sm rounded-lg border border-cyan-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  placeholder="admin@example.com"
                  required
                />
                <svg
                  className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1.5">
                Parol
              </label>
              <div className="relative">
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#1E293B]/60 backdrop-blur-sm rounded-lg border border-cyan-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  placeholder="••••••••"
                  required
                />
                <svg
                  className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-2.5 rounded-lg text-center font-medium transition-all duration-300 ${
                isLoading
                  ? 'bg-emerald-400/50 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-cyan-400 hover:to-emerald-400 shadow-lg shadow-emerald-500/20'
              }`}
            >
              {isLoading ? 'Kirish...' : 'Kirish'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 