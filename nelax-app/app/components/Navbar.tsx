"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import NelaxLogo from "./NelaxLogo";
import { Menu, X, ArrowUpRight } from "lucide-react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "How it Works", href: "#about", isRoute: false },
    { name: "Features", href: "#features", isRoute: false },
    { name: "Marketplace", href: "/marketplace", isRoute: true },
    { name: "Guide", href: "/onboarding", isRoute: true },
    { name: "FAQ", href: "#faq", isRoute: false },
  ];

  const handleScrollTo = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    } else {
      window.location.href = `/${href}`;
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-black/80 backdrop-blur-md shadow-lg" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Left: Logo */}
        <Link href="/" className="cursor-pointer">
          <NelaxLogo />
        </Link>

        {/* Center: Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) =>
            link.isRoute ? (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-gray-300 hover:text-white transition-colors flex items-center gap-1"
              >
                {link.name}
                {link.href === "/marketplace" && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                )}
              </Link>
            ) : (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleScrollTo(e, link.href)}
                className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                {link.name}
              </a>
            ),
          )}
        </nav>

        {/* Right: Desktop CTA Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/onboarding"
            className="text-gray-300 hover:text-white text-sm font-medium px-4 py-2 transition-colors cursor-pointer"
          >
            Setup Guide
          </Link>
          <Link
            href="/marketplace"
            className="bg-[#1F1F22] hover:bg-[#2A2A2D] text-white text-sm font-medium px-5 py-2.5 rounded-full border border-white/10 transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm hover:border-white/20"
          >
            Launch App
            <ArrowUpRight className="w-3.5 h-3.5 text-gray-400" />
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-gray-300 hover:text-white focus:outline-none cursor-pointer"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-black/95 border-b border-white/10 px-6 py-6 flex flex-col gap-4 backdrop-blur-xl animate-in slide-in-from-top-2 duration-200">
          {navLinks.map((link) =>
            link.isRoute ? (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium text-gray-300 hover:text-white py-2 border-b border-white/5 transition-colors flex items-center justify-between"
              >
                <span>{link.name}</span>
                {link.href === "/marketplace" && (
                  <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">
                    Live
                  </span>
                )}
              </Link>
            ) : (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleScrollTo(e, link.href)}
                className="text-base font-medium text-gray-300 hover:text-white py-2 border-b border-white/5 transition-colors"
              >
                {link.name}
              </a>
            ),
          )}
          <div className="flex flex-col gap-2.5 mt-2">
            <Link
              href="/marketplace"
              onClick={() => setMobileMenuOpen(false)}
              className="text-center bg-white hover:bg-gray-100 text-black text-sm font-semibold px-5 py-3 rounded-full transition-colors"
            >
              Launch Marketplace
            </Link>
            <Link
              href="/onboarding"
              onClick={() => setMobileMenuOpen(false)}
              className="text-center bg-[#1F1F22] hover:bg-[#2A2A2D] text-white text-sm font-medium px-5 py-3 rounded-full border border-white/10 transition-colors"
            >
              Agent Setup Guide
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
