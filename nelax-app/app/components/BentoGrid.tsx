'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import FadeInUp from './FadeInUp';
import {
  Cpu,
  ShieldCheck,
  Zap,
  Key,
  Terminal,
  Sliders,
  Copy,
  Check,
  ArrowUpRight,
  Sparkles,
  Layers,
  Code2,
} from 'lucide-react';

export default function BentoGrid() {
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedCli, setCopiedCli] = useState(false);

  const handleCopyKey = () => {
    navigator.clipboard.writeText(
      'GCWDVYVPM7ORTD5INWSP3C5TRV5TRBEIHZWY3K4HS3STLKJE5I7OSMVB'
    );
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleCopyCli = () => {
    navigator.clipboard.writeText('npx -y nelax-cli discover');
    setCopiedCli(true);
    setTimeout(() => setCopiedCli(false), 2000);
  };

  return (
    <section id="architecture" className="py-24 px-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="max-w-3xl mx-auto text-center mb-16">
        <FadeInUp delayMs={0}>
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-gray-300 mb-6">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>Built with Pollar Protocol</span>
          </div>
        </FadeInUp>

        <FadeInUp delayMs={100}>
          <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight text-white mb-6">
            Empowering autonomous agents with Pollar infrastructure.
          </h2>
        </FadeInUp>

        <FadeInUp delayMs={200}>
          <p className="text-base text-gray-400 leading-relaxed max-w-2xl mx-auto">
            Nelax deeply integrates the <span className="text-white font-medium">Pollar SDK (@pollar/core)</span> to power non-custodial agent wallets, session authentication, and automated x402 compute micropayments on Stellar.
          </p>
        </FadeInUp>
      </div>

      {/* Asymmetric Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* CARD 1 (Spans 2 cols): Pollar Embedded Wallet Engine */}
        <FadeInUp delayMs={100} className="md:col-span-2">
          <div className="h-full bg-[#0D0D0E] border border-white/10 hover:border-white/20 transition-all duration-300 rounded-2xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden group shadow-lg">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <Code2 className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 bg-cyan-400/10 px-2.5 py-1 rounded-full border border-cyan-400/20">
                  @pollar/core SDK
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-semibold text-white mb-3 tracking-tight">
                Embedded Non-Custodial Agent Wallets
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed max-w-lg mb-6">
                Powered by Pollar&apos;s client primitives and memory adapters. AI agents provision programmatic Stellar wallets and sign transactions with zero private key leaks.
              </p>
            </div>

            {/* Code Block Showing Real Pollar SDK Usage in Nelax */}
            <div className="relative z-10 bg-black/60 border border-white/10 rounded-xl p-4 font-mono text-xs text-gray-300 flex flex-col gap-2">
              <div className="flex items-center justify-between text-[11px] text-gray-500 border-b border-white/5 pb-2">
                <span>nelax-cli &bull; pollar.ts</span>
                <span className="text-emerald-400 font-sans">Active Pollar Runtime</span>
              </div>
              <pre className="text-[11px] leading-relaxed overflow-x-auto text-gray-300">
                <span className="text-purple-400">import</span> &#123; PollarClient, createMemoryAdapter &#125; <span className="text-purple-400">from</span> <span className="text-emerald-300">&apos;@pollar/core&apos;</span>;{'\n'}
                <span className="text-blue-400">const</span> pollar = <span className="text-purple-400">new</span> <span className="text-yellow-300">PollarClient</span>&#40;&#123;{'\n'}
                {'  '}apiKey: process.env.<span className="text-cyan-300">POLLAR_API_KEY</span>,{'\n'}
                {'  '}stellarNetwork: <span className="text-emerald-300">&apos;testnet&apos;</span>,{'\n'}
                {'  '}storage: <span className="text-yellow-300">createMemoryAdapter</span>&#40;&#41;,{'\n'}
                &#125;&#41;;{'\n'}
                <span className="text-gray-500">// Broadcast micropayment via Pollar tx engine</span>{'\n'}
                <span className="text-purple-400">await</span> pollar.<span className="text-yellow-300">buildSignSubmit</span>&#40;&#123; operation: <span className="text-emerald-300">&apos;payment&apos;</span>, params &#125;&#41;;
              </pre>
            </div>
          </div>
        </FadeInUp>

        {/* CARD 2 (Spans 1 col): Pollar Session & Auth */}
        <FadeInUp delayMs={200} className="md:col-span-1">
          <div className="h-full bg-[#0D0D0E] border border-white/10 hover:border-white/20 transition-all duration-300 rounded-2xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden group shadow-lg">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Key className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-mono text-gray-400 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                  Pollar API
                </span>
              </div>

              <h3 className="text-xl font-semibold text-white mb-2 tracking-tight">
                Pollar Session Gateway
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed mb-6">
                Automated client session initialization (<span className="font-mono text-xs">/v1/auth/session</span>) and email OTP verification with Pollar&apos;s auth cluster.
              </p>
            </div>

            {/* Session Card */}
            <div className="bg-black/60 border border-white/10 rounded-xl p-3.5 flex flex-col gap-2">
              <div className="flex items-center justify-between text-[10px] text-gray-500 uppercase tracking-wider">
                <span>Pollar Wallet Address</span>
                <button
                  onClick={handleCopyKey}
                  className="text-gray-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                >
                  {copiedKey ? (
                    <span className="text-emerald-400 text-[10px] flex items-center gap-0.5">
                      <Check className="w-3 h-3" /> Copied
                    </span>
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>
              <div className="font-mono text-xs text-cyan-300 truncate">
                GCWDVYVPM7...OSMVB
              </div>
              <div className="text-[11px] text-emerald-400 font-medium flex items-center gap-1.5 pt-1 border-t border-white/5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Pollar Session Synced &bull; 10,240 XLM
              </div>
            </div>
          </div>
        </FadeInUp>

        {/* CARD 3 (Spans 1 col): Soroban Auth Signing via Pollar */}
        <FadeInUp delayMs={300} className="md:col-span-1">
          <div className="h-full bg-[#0D0D0E] border border-white/10 hover:border-white/20 transition-all duration-300 rounded-2xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden group shadow-lg">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
                  <Layers className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                  Soroban
                </span>
              </div>

              <h3 className="text-xl font-semibold text-white mb-2 tracking-tight">
                Soroban Auth Signer
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed mb-6">
                Utilizes <span className="font-mono text-xs">pollar.signAuthEntry()</span> to authorize decentralized escrow contracts and compute rental agreements on Soroban.
              </p>
            </div>

            <div className="p-3.5 bg-purple-500/5 border border-purple-500/20 rounded-xl flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Auth Method:</span>
                <span className="font-mono text-purple-300">signAuthEntry()</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Valid Ledger:</span>
                <span className="font-mono text-white">1,000,000</span>
              </div>
              <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden mt-1">
                <div className="bg-purple-400 h-full w-full" />
              </div>
            </div>
          </div>
        </FadeInUp>

        {/* CARD 4 (Spans 2 cols): x402 Micropayments with Pollar Engine */}
        <FadeInUp delayMs={400} className="md:col-span-2">
          <div className="h-full bg-[#0D0D0E] border border-white/10 hover:border-white/20 transition-all duration-300 rounded-2xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden group shadow-lg">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Zap className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-full border border-emerald-400/20">
                  x402 Micropayments
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-semibold text-white mb-3 tracking-tight">
                Pollar Transaction Engine &amp; x402 Lease Protocol
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed max-w-lg mb-6">
                When GPU nodes issue HTTP 402 challenges, Pollar&apos;s transaction engine constructs, signs, and settles micro-transactions on Stellar in under 3 seconds to unlock hardware.
              </p>
            </div>

            {/* Protocol Steps */}
            <div className="bg-black/60 border border-white/10 rounded-xl p-4 flex flex-col gap-2 font-mono text-xs text-gray-300">
              <div className="flex items-center justify-between text-[11px] text-gray-500 border-b border-white/5 pb-2">
                <span>x402 &bull; Pollar Execution Trace</span>
                <span className="text-emerald-400">Confirmed (2.8s)</span>
              </div>
              <div className="text-[11px] space-y-1">
                <div>1. Provider &rarr; <span className="text-amber-400">402 Payment Required</span> (Price: 3.20 XLM)</div>
                <div>2. Pollar SDK &rarr; <span className="text-cyan-400">tx/build-sign-submit</span> broadcast to Horizon</div>
                <div>3. Stellar Ledger &rarr; <span className="text-gray-300">Hash: 05c4...93df</span> &bull; Fee: 0.00001 XLM</div>
                <div>4. Cluster Granted &rarr; <span className="text-emerald-400">200 OK</span> &bull; Session Active</div>
              </div>
            </div>
          </div>
        </FadeInUp>

        {/* CARD 5 (Spans full 3 cols): Pollar Hackathon 2026 Showcase */}
        <FadeInUp delayMs={500} className="md:col-span-3">
          <div className="bg-[#0D0D0E] border border-white/10 hover:border-white/20 transition-all duration-300 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 text-white flex items-center justify-center shrink-0">
                <Terminal className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-lg font-semibold text-white">
                    Built for the Pollar Hackathon 2026
                  </h4>
                  <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                    @pollar/core &bull; Stellar Testnet
                  </span>
                </div>
                <p className="text-sm text-gray-400 max-w-xl">
                  Nelax demonstrates how Pollar transforms Stellar into the premier financial and compute settlement layer for autonomous AI agents.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <button
                onClick={handleCopyCli}
                className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl bg-black/60 border border-white/10 hover:border-white/20 font-mono text-xs text-gray-300 flex items-center justify-between gap-3 cursor-pointer transition-colors"
              >
                <span>$ npx -y nelax-cli discover</span>
                {copiedCli ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-gray-400" />
                )}
              </button>
              <Link
                href="/marketplace"
                className="px-5 py-2.5 rounded-xl bg-white hover:bg-gray-100 text-black text-xs font-semibold transition-colors flex items-center gap-1.5 shrink-0"
              >
                <span>Launch App</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </FadeInUp>

      </div>
    </section>
  );
}
