'use client';

import React from 'react';

interface NelaxLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
}

export default function NelaxLogo({
  size = 28,
  className = '',
  showText = true,
}: NelaxLogoProps) {
  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Untitled UI Style Minimalist Stroke Geometric SVG for Nelax */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-300 hover:scale-105"
      >
        {/* Outer subtle rounded polygon container */}
        <rect
          x="3"
          y="3"
          width="26"
          height="26"
          rx="7"
          stroke="white"
          strokeWidth="1.8"
          strokeOpacity="0.3"
        />
        {/* Modern Geometric Stroke 'N' with node accent */}
        <path
          d="M10 22V10L22 22V10"
          stroke="white"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Stellar Autonomous Pulse Node */}
        <circle cx="22" cy="10" r="2" fill="white" />
        <circle cx="10" cy="22" r="1.5" fill="white" fillOpacity="0.6" />
      </svg>

      {showText && (
        <span className="text-xl font-bold tracking-tight text-white font-sans flex items-center gap-1.5">
          Nelax
          <span className="text-[10px] uppercase font-mono tracking-widest px-1.5 py-0.5 rounded bg-white/10 text-gray-400 font-normal">
            Protocol
          </span>
        </span>
      )}
    </div>
  );
}
