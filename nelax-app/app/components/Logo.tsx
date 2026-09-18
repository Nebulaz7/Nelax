'use client';

import React from 'react';

interface LogoProps {
  showWordmark?: boolean;
  size?: number;
  className?: string;
  wordmarkColor?: string;
}

export default function Logo({
  showWordmark = true,
  size = 36,
  className = '',
  wordmarkColor = 'currentColor',
}: LogoProps) {
  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Neo-brutalist Isometric Cube Icon */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-150 hover:-translate-y-0.5 hover:translate-x-0.5"
      >
        {/* Hard 0-blur drop shadow */}
        <path
          d="M26 18 H76 C81.523 18 86 22.477 86 28 V78 C86 83.523 81.523 88 76 88 H26 C20.477 88 16 83.523 16 78 V28 C16 22.477 20.477 18 26 18 Z"
          fill="#000000"
          transform="translate(6, 6)"
        />

        {/* Top 3D Facet (Mint Green) */}
        <path
          d="M 22 14 L 30 6 H 80 C 85.5 6 90 10.5 90 16 V 66 L 82 74 H 82 V 22 C 82 17.58 78.42 14 74 14 Z"
          fill="#86EFAC"
          stroke="#000000"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />

        {/* Main Front Face (Soft Lilac) */}
        <rect
          x="16"
          y="14"
          width="66"
          height="66"
          rx="14"
          fill="#D8B4FE"
          stroke="#000000"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />

        {/* Minimalist Geometric 'N' */}
        <path
          d="M 33 27 V 67 H 41 V 46 L 57 67 H 65 V 27 H 57 V 48 L 41 27 Z"
          fill="#000000"
        />
      </svg>

      {/* Wordmark (Optional) */}
      {showWordmark && (
        <span
          className="font-black tracking-tight leading-none text-2xl uppercase font-sans"
          style={{ color: wordmarkColor }}
        >
          NELAX
        </span>
      )}
    </div>
  );
}
