'use client';

import React from 'react';
import Link from 'next/link';
import Logo from './Logo';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full bg-[#09090b]/95 backdrop-blur-sm border-b-2 border-zinc-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Left: Logo */}
        <Link href="/" className="flex items-center gap-2 group cursor-pointer">
          <Logo size={34} wordmarkColor="#ffffff" />
        </Link>

        {/* Center: Section Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-bold">
          <a
            href="#how-it-works"
            className="text-zinc-300 hover:text-white transition-colors cursor-pointer"
          >
            How It Works
          </a>

          <a
            href="#features"
            className="text-zinc-300 hover:text-white transition-colors cursor-pointer"
          >
            Features
          </a>

          <a
            href="#faqs"
            className="text-zinc-300 hover:text-white transition-colors cursor-pointer"
          >
            FAQs
          </a>
        </nav>

        {/* Right: Dashboard & Get Started Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Dashboard Button */}
          <Link
            href="/dashboard"
            className="px-3.5 py-1.5 rounded-md text-xs sm:text-sm font-bold bg-zinc-900 hover:bg-zinc-800 text-zinc-100 border-2 border-zinc-700 shadow-[2px_2px_0px_#3f3f46] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all cursor-pointer"
          >
            Dashboard
          </Link>

          {/* Get Started Button (Neo-brutalist mint accent with white hard shadow) */}
          <Link
            href="/marketplace"
            className="px-4 py-1.5 rounded-md text-xs sm:text-sm font-bold bg-[#86EFAC] hover:bg-[#6ee7b7] text-black border-2 border-black shadow-[3px_3px_0px_#ffffff] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#ffffff] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all cursor-pointer"
          >
            Get Started
          </Link>
        </div>

      </div>
    </header>
  );
}
