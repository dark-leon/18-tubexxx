'use client';

import Link from 'next/link';
import { useState, Suspense } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

interface NavbarProps {
  onSearch?: (query: string) => void;
  onFilterChange?: (filter: string) => void;
}

function NavbarContent({ onSearch, onFilterChange }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // URL parametrlarini yangilash
      const params = new URLSearchParams(searchParams.toString());
      params.set('search', searchQuery.trim());
      router.push(`${pathname}?${params.toString()}`);
      
      // Parent komponentga qidiruv so'rovini yuborish
      if (onSearch) {
        onSearch(searchQuery.trim());
      }
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
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
          <Link href="/" className="text-xl font-bold text-white flex items-center space-x-2 group">
            <div className="flex items-center">
              <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent text-lg sm:text-2xl font-extrabold tracking-tight group-hover:scale-105 transition-transform duration-300">
                18-Tube
              </span>
              <span className="bg-gradient-to-r from-pink-500 via-red-500 to-pink-500 bg-clip-text text-transparent text-lg sm:text-2xl font-extrabold tracking-tight group-hover:scale-105 transition-transform duration-300">
                XXX
              </span>
              <div className="ml-1 h-1.5 sm:h-2 w-1.5 sm:w-2 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 group-hover:animate-ping"></div>
            </div>
          </Link>

          {/* Search - Always visible on all screens */}
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-lg mx-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search videos..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full bg-[#111827]/60 backdrop-blur-sm text-white pl-4 pr-10 py-2 rounded-full focus:outline-none focus:ring-1 focus:ring-cyan-400/50 border border-cyan-950 hover:border-cyan-800/50 transition-colors text-sm sm:text-base"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
              >
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5"
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

          {/* Desktop menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <button
                onClick={() => handleFilterClick('all')}
                className={`text-gray-400 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300 flex items-center gap-2 hover:bg-[#1F2937]/80 ${
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
                className={`text-gray-400 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300 flex items-center gap-2 hover:bg-[#1F2937]/80 ${
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
                className={`text-gray-400 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300 flex items-center gap-2 hover:bg-[#1F2937]/80 ${
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
                className={`text-gray-400 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300 flex items-center gap-2 hover:bg-[#1F2937]/80 ${
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

          {/* User menu */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/upload"
              className="px-4 py-2 bg-gradient-to-r from-pink-500 to-red-500 hover:from-red-500 hover:to-pink-500 rounded-lg text-white transition-all duration-300 shadow-lg shadow-red-500/20 hover:shadow-red-500/30 hover:scale-105 flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Upload Video</span>
            </Link>
            <Link
              href="/admin/login"
              className="px-4 py-2 bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-cyan-400 hover:to-emerald-400 rounded-lg text-white transition-all duration-300 shadow-lg shadow-emerald-500/20 hover:shadow-cyan-500/30 hover:scale-105"
            >
              Login
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-400 hover:text-white focus:outline-none p-2 rounded-lg hover:bg-[#1F2937]/80 transition-all duration-300"
              aria-label="Toggle menu"
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
            {/* Mobile Navigation Links */}
            <div className="px-2 pb-3 space-y-1 bg-[#111827]/60 backdrop-blur-sm rounded-lg border border-cyan-950 mt-2">
              <button
                onClick={() => {
                  handleFilterClick('all');
                  setIsMenuOpen(false);
                }}
                className={`w-full text-left text-gray-400 hover:text-white px-3 py-2 rounded-md text-base font-medium flex items-center gap-2 transition-colors ${
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
                onClick={() => {
                  handleFilterClick('popular');
                  setIsMenuOpen(false);
                }}
                className={`w-full text-left text-gray-400 hover:text-white px-3 py-2 rounded-md text-base font-medium flex items-center gap-2 transition-colors ${
                  searchParams.get('filter') === 'popular' ? 'text-emerald-400' : ''
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <span>Popular</span>
              </button>
              <button
                onClick={() => {
                  handleFilterClick('new');
                  setIsMenuOpen(false);
                }}
                className={`w-full text-left text-gray-400 hover:text-white px-3 py-2 rounded-md text-base font-medium flex items-center gap-2 transition-colors ${
                  searchParams.get('filter') === 'new' ? 'text-emerald-400' : ''
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>New</span>
              </button>
              <button
                onClick={() => {
                  handleFilterClick('liked');
                  setIsMenuOpen(false);
                }}
                className={`w-full text-left text-gray-400 hover:text-white px-3 py-2 rounded-md text-base font-medium flex items-center gap-2 transition-colors ${
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
                onClick={() => setIsMenuOpen(false)}
                className="block text-gray-400 hover:text-white px-3 py-2 rounded-md text-base font-medium transition-colors"
              >
                Upload Video
              </Link>
              <Link
                href="/admin/login"
                onClick={() => setIsMenuOpen(false)}
                className="block text-gray-400 hover:text-white px-3 py-2 rounded-md text-base font-medium transition-colors"
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

export default function Navbar(props: NavbarProps) {
  return (
    <Suspense fallback={
      <nav className="fixed top-0 left-0 right-0 bg-[#030712]/80 backdrop-blur-md border-b border-cyan-950 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent text-2xl font-extrabold tracking-tight">
                18-Tube
              </span>
              <span className="bg-gradient-to-r from-pink-500 via-red-500 to-pink-500 bg-clip-text text-transparent text-2xl font-extrabold tracking-tight">
                XXX
              </span>
              <div className="ml-1 h-2 w-2 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400"></div>
            </div>
            <div className="animate-pulse h-10 w-64 bg-[#111827]/60 rounded-full"></div>
          </div>
        </div>
      </nav>
    }>
      <NavbarContent {...props} />
    </Suspense>
  );
} 