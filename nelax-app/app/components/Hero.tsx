"use client";

import React, { useState } from "react";
import Link from "next/link";
import FadeInUp from "./FadeInUp";
import { Copy, Check, Terminal, Sparkles, ArrowRight } from "lucide-react";

// Stroke-based ecosystem & partner logos featuring Pollar
const ECOSYSTEM_LOGOS = [
  {
    name: "Pollar Protocol",
    svg: (
      <svg
        className="h-6 w-auto"
        viewBox="0 0 120 24"
        fill="none"
        stroke="currentColor"
      >
        <circle cx="12" cy="12" r="9" strokeWidth="2" />
        <path d="M12 6V18M8 9L16 15" strokeWidth="2" strokeLinecap="round" />
        <circle cx="12" cy="12" r="2.5" fill="currentColor" />
        <text
          x="28"
          y="17"
          fill="currentColor"
          stroke="none"
          fontSize="14"
          fontWeight="700"
          letterSpacing="0.08em"
        >
          POLLAR
        </text>
      </svg>
    ),
  },
  {
    name: "Stellar",
    svg: (
      <svg
        className="h-6 w-auto"
        viewBox="0 0 110 24"
        fill="none"
        stroke="currentColor"
      >
        <circle cx="12" cy="12" r="9" strokeWidth="1.8" />
        <path d="M5 12H19M12 5V19" strokeWidth="1.8" strokeLinecap="round" />
        <text
          x="28"
          y="17"
          fill="currentColor"
          stroke="none"
          fontSize="13"
          fontWeight="600"
          letterSpacing="0.08em"
        >
          STELLAR
        </text>
      </svg>
    ),
  },
  {
    name: "Soroban",
    svg: (
      <svg
        className="h-6 w-auto"
        viewBox="0 0 115 24"
        fill="none"
        stroke="currentColor"
      >
        <path
          d="M4 18L12 6L20 18H4Z"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="13" r="2.5" strokeWidth="1.5" />
        <text
          x="28"
          y="17"
          fill="currentColor"
          stroke="none"
          fontSize="13"
          fontWeight="600"
          letterSpacing="0.08em"
        >
          SOROBAN
        </text>
      </svg>
    ),
  },
  {
    name: "x402 Protocol",
    svg: (
      <svg
        className="h-6 w-auto"
        viewBox="0 0 130 24"
        fill="none"
        stroke="currentColor"
      >
        <path
          d="M6 12C6 8.686 8.686 6 12 6H16C19.314 6 22 8.686 22 12C22 15.314 19.314 18 16 18H12"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
        <text
          x="28"
          y="17"
          fill="currentColor"
          stroke="none"
          fontSize="13"
          fontWeight="600"
          letterSpacing="0.08em"
        >
          x402 PROTOCOL
        </text>
      </svg>
    ),
  },
  {
    name: "Horizon API",
    svg: (
      <svg
        className="h-6 w-auto"
        viewBox="0 0 125 24"
        fill="none"
        stroke="currentColor"
      >
        <circle cx="12" cy="12" r="8" strokeWidth="1.8" />
        <ellipse
          cx="12"
          cy="12"
          rx="10"
          ry="4"
          strokeWidth="1.5"
          transform="rotate(-30 12 12)"
        />
        <text
          x="30"
          y="17"
          fill="currentColor"
          stroke="none"
          fontSize="13"
          fontWeight="600"
          letterSpacing="0.08em"
        >
          HORIZON
        </text>
      </svg>
    ),
  },
  {
    name: "NVIDIA H100",
    svg: (
      <svg
        className="h-6 w-auto"
        viewBox="0 0 135 24"
        fill="none"
        stroke="currentColor"
      >
        <rect x="4" y="5" width="16" height="14" rx="3" strokeWidth="1.8" />
        <path
          d="M8 9H16M8 12H16M8 15H13"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <text
          x="28"
          y="17"
          fill="currentColor"
          stroke="none"
          fontSize="13"
          fontWeight="600"
          letterSpacing="0.08em"
        >
          NVIDIA H100
        </text>
      </svg>
    ),
  },
];

export default function Hero() {
  const [copied, setCopied] = useState(false);

  const copyCliCommand = () => {
    navigator.clipboard.writeText("npx -y nelax-cli discover");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Duplicate 4 times for seamless infinite marquee loop
  const marqueeItems = [
    ...ECOSYSTEM_LOGOS,
    ...ECOSYSTEM_LOGOS,
    ...ECOSYSTEM_LOGOS,
    ...ECOSYSTEM_LOGOS,
  ];

  return (
    <section
      id="about"
      className="min-h-screen flex flex-col items-center justify-center pt-32 pb-20 relative z-0 overflow-hidden bg-black text-white"
    >
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/30 via-transparent to-black pointer-events-none" />

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 flex flex-col items-center text-center">
        {/* Headline */}
        <FadeInUp delayMs={150}>
          <h1 className="text-5xl md:text-7xl font-medium tracking-tight mb-6 text-center leading-[1.1]">
            The financial layer <br />
            for autonomous{" "}
            <span className="font-serif italic font-normal">agents.</span>
          </h1>
        </FadeInUp>

        {/* Sub-text: Deep Pollar Integration */}
        <FadeInUp delayMs={300}>
          <p className="text-[16px] text-gray-400 max-w-2xl text-center mb-10 leading-relaxed">
            Built on <span className="text-white font-medium">Pollar</span>.
            Equip your AI agents with cryptographic Stellar wallets via{" "}
            <span className="text-gray-300 font-mono text-xs bg-white/10 px-1.5 py-0.5 rounded">
              @pollar/core
            </span>
            , x402 HTTP micropayments for instant GPU clusters, and granular
            spending guardrails.
          </p>
        </FadeInUp>

        {/* Buttons */}
        <FadeInUp delayMs={450}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Link
              href="/marketplace"
              className="w-full sm:w-auto bg-white text-black text-sm font-medium px-6 py-3 rounded-full hover:bg-gray-100 transition-colors shadow-lg cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Explore Marketplace</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/dashboard"
              className="w-full sm:w-auto bg-[#1F1F22] hover:bg-[#2A2A2D] text-white text-sm font-medium px-6 py-3 rounded-full border border-white/5 transition-colors cursor-pointer"
            >
              Agent Dashboard
            </Link>
          </div>
        </FadeInUp>

        {/* Quick CLI Copy Pill */}
        <FadeInUp delayMs={600}>
          <button
            onClick={copyCliCommand}
            className="group flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 transition-all font-mono text-xs text-gray-300 cursor-pointer shadow-inner"
            title="Click to copy CLI command"
          >
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-gray-500">$</span>
            <span>npx -y nelax-cli discover</span>
            <div className="ml-1 text-gray-400 group-hover:text-white transition-colors">
              {copied ? (
                <span className="flex items-center gap-1 text-emerald-400 font-sans text-[11px]">
                  <Check className="w-3 h-3" /> Copied
                </span>
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </div>
          </button>
        </FadeInUp>
      </div>

      {/* Marquee: Powered by Pollar & Decentralized Infrastructure */}
      <div className="w-full mt-20">
        <p className="text-xs text-gray-500 uppercase tracking-widest font-medium mb-8 text-center">
          Powered by Pollar Protocol &bull; Built for the Pollar Hackathon 2026
        </p>

        <div className="w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
          <div className="flex w-max animate-marquee">
            {marqueeItems.map((brand, idx) => (
              <div
                key={`${brand.name}-${idx}`}
                className="flex-shrink-0 px-8 text-gray-400 hover:text-gray-200 transition-colors opacity-75 hover:opacity-100"
              >
                {brand.svg}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
