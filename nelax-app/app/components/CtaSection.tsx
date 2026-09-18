'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import FadeInUp from './FadeInUp';
import { ArrowRight, Terminal, Copy, Check } from 'lucide-react';

export default function CtaSection() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText('npx -y nelax-cli discover');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="py-24 px-6 max-w-7xl mx-auto">
      <FadeInUp delayMs={0}>
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0D0D0E] p-8 sm:p-14 text-center flex flex-col items-center shadow-2xl">
          
          {/* Hackathon Badge without emojis or gradients */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-gray-300 mb-8 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Pollar Hackathon 2026 &bull; Stellar Testnet</span>
          </div>

          {/* Headline */}
          <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-white mb-6 max-w-3xl leading-tight">
            The future of autonomous AI commerce <br className="hidden sm:inline" />
            starts on <span className="font-serif italic font-normal text-white">Pollar.</span>
          </h2>

          {/* Subtext */}
          <p className="text-base text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Nelax combines Pollar&apos;s embedded wallet SDK with Stellar&apos;s 3-second finality and the x402 compute protocol. Give your agents full financial autonomy without human bottlenecks.
          </p>

          {/* Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl mb-10">
            <div className="p-4 rounded-xl bg-black/60 border border-white/5 flex flex-col items-center">
              <span className="text-2xl font-bold font-mono text-white">&lt; 3.0s</span>
              <span className="text-xs text-gray-400 mt-1">Stellar Ledger Finality</span>
            </div>
            <div className="p-4 rounded-xl bg-black/60 border border-white/5 flex flex-col items-center">
              <span className="text-2xl font-bold font-mono text-emerald-400">0 Keys</span>
              <span className="text-xs text-gray-400 mt-1">Exposed (@pollar/core)</span>
            </div>
            <div className="p-4 rounded-xl bg-black/60 border border-white/5 flex flex-col items-center">
              <span className="text-2xl font-bold font-mono text-cyan-400">&lt; $0.00001</span>
              <span className="text-xs text-gray-400 mt-1">Average Settlement Cost</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8 w-full sm:w-auto">
            <Link
              href="/marketplace"
              className="w-full sm:w-auto bg-white text-black text-sm font-medium px-7 py-3.5 rounded-full hover:bg-gray-100 transition-colors shadow-lg cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Explore Marketplace</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/dashboard"
              className="w-full sm:w-auto bg-[#1F1F22] hover:bg-[#2A2A2D] text-white text-sm font-medium px-7 py-3.5 rounded-full border border-white/10 transition-colors cursor-pointer"
            >
              Agent Guardrails Dashboard
            </Link>
          </div>

          {/* Quick CLI Command */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-black/60 hover:bg-black/80 border border-white/10 hover:border-white/20 font-mono text-xs text-gray-300 cursor-pointer transition-colors"
          >
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-gray-500">$</span>
            <span>npx -y nelax-cli discover</span>
            {copied ? (
              <span className="text-emerald-400 text-[11px] flex items-center gap-1 font-sans">
                <Check className="w-3 h-3" /> Copied
              </span>
            ) : (
              <Copy className="w-3 h-3 text-gray-400" />
            )}
          </button>

        </div>
      </FadeInUp>
    </section>
  );
}
