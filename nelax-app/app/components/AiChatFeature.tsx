'use client';

import React from 'react';
import Link from 'next/link';
import FadeInUp from './FadeInUp';
import { LevShader } from './animations/chroma';
import { Cpu, CheckCircle2, ArrowRight, ExternalLink, Terminal, Zap } from 'lucide-react';

export default function AiChatFeature() {
  return (
    <section id="features" className="py-24 px-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        
        {/* Left Column: Text & Content */}
        <FadeInUp delayMs={0} className="flex flex-col items-start gap-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-xs font-semibold text-amber-400">
            <Zap className="w-3.5 h-3.5" />
            <span>x402 Micropayments via Pollar</span>
          </div>

          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-white leading-tight">
            Autonomous compute leasing with Pollar&apos;s transaction engine.
          </h2>

          <p className="text-base text-gray-400 leading-relaxed max-w-xl">
            When autonomous agents need GPU or CPU clusters, compute providers issue HTTP 402 Payment Challenges. Powered by the <span className="text-white font-medium">Pollar SDK (@pollar/core)</span>, Nelax signs and broadcasts instantaneous Stellar micro-transactions to lease hardware on-demand with zero human friction.
          </p>

          <div className="flex items-center gap-4 mt-2">
            <Link
              href="/marketplace"
              className="bg-white hover:bg-gray-100 text-black text-sm font-medium px-6 py-3 rounded-full transition-colors cursor-pointer flex items-center gap-2"
            >
              <span>Explore Compute Nodes</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="https://stellar.expert/explorer/testnet"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white text-sm font-medium transition-colors flex items-center gap-1.5"
            >
              <span>View On-Chain Ledger</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </FadeInUp>

        {/* Right Column: Floating Mockup with Shader Background */}
        <FadeInUp delayMs={200} className="w-full">
          <div className="rounded-3xl overflow-hidden p-6 sm:p-8 border border-white/10 relative min-h-[460px] flex items-end justify-center shadow-2xl bg-black">
            {/* Optimized Chroma Shader Background (No Video, No Gradients) */}
            <div className="absolute inset-0 pointer-events-none opacity-40 overflow-hidden">
              <LevShader theme="dark" background={{ dark: "#000000" }} />
            </div>
            <div className="absolute inset-0 bg-black/40 pointer-events-none" />

            {/* Floating UI Card: x402 Protocol Settlement Inspector with Pollar */}
            <div className="relative z-10 w-full bg-[#1C1C1E]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex flex-col gap-4 shadow-2xl">
              {/* Top Chips */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                <span className="px-3 py-1.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5 shrink-0 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  HTTP 402 &rarr; 200 OK
                </span>
                <span className="px-3 py-1.5 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/20 flex items-center gap-1.5 shrink-0 font-mono text-[11px]">
                  @pollar/core
                </span>
                <span className="px-3 py-1.5 rounded-full bg-white/10 text-gray-200 border border-white/5 flex items-center gap-1.5 shrink-0 font-mono">
                  <Cpu className="w-3 h-3 text-cyan-400" />
                  NVIDIA H100 SXM5
                </span>
              </div>

              {/* Terminal Code Snippet with Pollar telemetry */}
              <div className="bg-black/60 border border-white/10 rounded-xl p-3.5 font-mono text-xs text-gray-300 flex flex-col gap-2">
                <div className="flex items-center justify-between text-[11px] text-gray-500 border-b border-white/5 pb-2">
                  <div className="flex items-center gap-1.5">
                    <Terminal className="w-3 h-3 text-amber-400" />
                    <span>Pollar Agent Session</span>
                  </div>
                  <span className="text-emerald-400">Pollar Tx Settled (2.8s)</span>
                </div>
                <div className="text-gray-400">
                  <span className="text-cyan-400">$</span> nelax rent gpu-h100-01 --duration 1h
                </div>
                <div className="text-gray-500 text-[11px] leading-relaxed">
                  [x402] Challenge received &bull; Memo: &quot;lease-gpu-h100-01&quot;<br />
                  [Pollar SDK] Broadcasting signed tx via tx/build-sign-submit<br />
                  [Stellar] Hash: <span className="text-cyan-300">05c4...93df</span> &bull; Fee: 0.00001 XLM<br />
                  [Cluster] Access token issued: <span className="text-white">x402-live-session-granted</span>
                </div>
              </div>

              {/* Verification Footer */}
              <div className="flex items-center justify-between text-xs text-gray-400 px-1">
                <span>Settlement: Pollar &bull; Stellar Testnet</span>
                <span className="text-emerald-400 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Cluster Active
                </span>
              </div>
            </div>
          </div>
        </FadeInUp>

      </div>
    </section>
  );
}
