'use client';

import Link from 'next/link';
import { useState } from 'react';

interface NavbarProps {
  onSearch?: (query: string) => void;
}

export default function Navbar({ onSearch }: NavbarProps) {
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
    // Real-time search (optional)
    if (onSearch) {
      onSearch(value);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-[#030712]/80 backdrop-blur-md border-b border-cyan-950 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-bold text-white flex items-center space-x-2">
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">18-TubeXXX</span>
            <span className="text-sm text-gray-500">Free Adult Videos</span>
          </Link>

          {/* Desktop menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link
                href="/"
                className="text-gray-400 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Home
              </Link>
              <Link
                href="/popular"
                className="text-gray-400 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Popular
              </Link>
              <Link
                href="/new"
                className="text-gray-400 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                New
              </Link>
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

          {/* Admin Panel Button */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/admin/login"
              className="px-4 py-2 bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-cyan-400 hover:to-emerald-400 rounded-lg text-white transition-all shadow-lg shadow-emerald-500/20"
            >
              Admin Panel
            </Link>
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
              <Link
                href="/"
                className="text-gray-400 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
              >
                Home
              </Link>
              <Link
                href="/popular"
                className="text-gray-400 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
              >
                Popular
              </Link>
              <Link
                href="/new"
                className="text-gray-400 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
              >
                New
              </Link>
              <Link
                href="/admin/login"
                className="text-gray-400 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
              >
                Admin Panel
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
} 