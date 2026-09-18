'use client';

import React from 'react';

interface PletyLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
}

export default function PletyLogo({
  size = 28,
  className = '',
  showText = true,
}: PletyLogoProps) {
  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Untitled UI Style Minimal Stroke Geometric SVG */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        <circle cx="16" cy="16" r="14" stroke="white" strokeWidth="2" />
        <path
          d="M10 16C10 12.6863 12.6863 10 16 10C19.3137 10 22 12.6863 22 16C22 19.3137 19.3137 22 16 22"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="16" cy="16" r="2.5" fill="white" />
      </svg>

      {showText && (
        <span className="text-xl font-bold tracking-tight text-white font-sans">
          Plety
        </span>
      )}
    </div>
  );
}
