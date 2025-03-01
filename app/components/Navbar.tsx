'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

interface NavbarProps {
  onSearch?: (query: string) => void;
  onFilterChange?: (filter: string) => void;
}

export default function Navbar({ onSearch, onFilterChange }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  const handleFilterClick = (filter: string) => {
    if (onFilterChange) {
      onFilterChange(filter);
    }
    router.push(`/?filter=${filter}`);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-[#030712]/80 backdrop-blur-md border-b border-cyan-950 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-bold text-white flex items-center space-x-2">
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">18-TubeXXX</span>
          </Link>

          {/* Desktop menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <button
                onClick={() => handleFilterClick('all')}
                className={`text-gray-400 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                  pathname === '/' && (!searchParams.get('filter') || searchParams.get('filter') === 'all')
                    ? 'text-emerald-400'
                    : ''
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                <span>Trending</span>
              </button>
              <button
                onClick={() => handleFilterClick('popular')}
                className={`text-gray-400 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                  searchParams.get('filter') === 'popular' ? 'text-emerald-400' : ''
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <span>Popular</span>
              </button>
              <button
                onClick={() => handleFilterClick('new')}
                className={`text-gray-400 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                  searchParams.get('filter') === 'new' ? 'text-emerald-400' : ''
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>New</span>
              </button>
              <button
                onClick={() => handleFilterClick('liked')}
                className={`text-gray-400 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                  searchParams.get('filter') === 'liked' ? 'text-emerald-400' : ''
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                </svg>
                <span>Most Liked</span>
              </button>
            </div>
          </div>

          {/* Search */}
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-lg mx-4 hidden md:block">
            <div className="relative">
              <input
                type="text"
                placeholder="Search videos..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full bg-[#111827]/60 backdrop-blur-sm text-white pl-4 pr-10 py-2 rounded-full focus:outline-none focus:ring-1 focus:ring-cyan-400/50 border border-cyan-950 hover:border-cyan-800/50 transition-colors"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>
            </div>
          </form>

          {/* User menu */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="relative group">
              <button className="flex items-center space-x-2 text-gray-400 hover:text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Upload</span>
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-[#111827]/95 backdrop-blur-sm rounded-lg shadow-lg border border-cyan-950 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <Link
                  href="/upload"
                  className="block px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-[#1F2937]/80"
                >
                  Upload Video
                </Link>
              </div>
            </div>
            <Link
              href="/admin/login"
              className="px-4 py-2 bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-cyan-400 hover:to-emerald-400 rounded-lg text-white transition-all shadow-lg shadow-emerald-500/20"
            >
              Login
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-400 hover:text-white focus:outline-none p-2"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            {/* Mobile Search */}
            <form onSubmit={handleSearchSubmit} className="px-2 pt-2 pb-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search videos..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full bg-[#111827]/60 backdrop-blur-sm text-white pl-4 pr-10 py-2 rounded-full focus:outline-none focus:ring-1 focus:ring-cyan-400/50 border border-cyan-950 hover:border-cyan-800/50 transition-colors"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </button>
              </div>
            </form>

            {/* Mobile Navigation Links */}
            <div className="px-2 pb-3 space-y-1">
              <button
                onClick={() => handleFilterClick('all')}
                className={`w-full text-left text-gray-400 hover:text-white px-3 py-2 rounded-md text-base font-medium flex items-center gap-2 ${
                  pathname === '/' && (!searchParams.get('filter') || searchParams.get('filter') === 'all')
                    ? 'text-emerald-400'
                    : ''
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                <span>Trending</span>
              </button>
              <button
                onClick={() => handleFilterClick('popular')}
                className={`w-full text-left text-gray-400 hover:text-white px-3 py-2 rounded-md text-base font-medium flex items-center gap-2 ${
                  searchParams.get('filter') === 'popular' ? 'text-emerald-400' : ''
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <span>Popular</span>
              </button>
              <button
                onClick={() => handleFilterClick('new')}
                className={`w-full text-left text-gray-400 hover:text-white px-3 py-2 rounded-md text-base font-medium flex items-center gap-2 ${
                  searchParams.get('filter') === 'new' ? 'text-emerald-400' : ''
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>New</span>
              </button>
              <button
                onClick={() => handleFilterClick('liked')}
                className={`w-full text-left text-gray-400 hover:text-white px-3 py-2 rounded-md text-base font-medium flex items-center gap-2 ${
                  searchParams.get('filter') === 'liked' ? 'text-emerald-400' : ''
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                </svg>
                <span>Most Liked</span>
              </button>
              <div className="border-t border-cyan-950 my-2"></div>
              <Link
                href="/upload"
                className="block text-gray-400 hover:text-white px-3 py-2 rounded-md text-base font-medium"
              >
                Upload Video
              </Link>
              <Link
                href="/admin/login"
                className="block text-gray-400 hover:text-white px-3 py-2 rounded-md text-base font-medium"
              >
                Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
} 