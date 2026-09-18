'use client';

import React from 'react';
import Link from 'next/link';
import FadeInUp from './FadeInUp';
import { LevShader } from './animations/chroma';
import { ShieldCheck, Wallet, ArrowRight, Activity, Sliders } from 'lucide-react';

export default function AiTranscriptionFeature() {
  return (
    <section className="py-24 px-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        
        {/* Left Column: Floating Mockup with Shader Background */}
        <FadeInUp delayMs={0} className="w-full order-2 lg:order-1">
          <div className="rounded-3xl overflow-hidden p-6 sm:p-8 border border-white/10 relative min-h-[460px] flex items-end justify-center shadow-2xl bg-black">
            {/* Optimized Chroma Shader Background (No Video, No Gradients) */}
            <div className="absolute inset-0 pointer-events-none opacity-40 overflow-hidden">
              <LevShader theme="dark" background={{ dark: "#000000" }} />
            </div>
            <div className="absolute inset-0 bg-black/40 pointer-events-none" />

            {/* Floating UI Card: Autonomous Agent Guardrail & Pollar Wallet Telemetry */}
            <div className="relative z-10 w-full bg-[#1C1C1E]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex flex-col gap-4 shadow-2xl">
              
              {/* Header: Agent Identity & Pollar Session */}
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-white">Agent-Alpha-01</span>
                      <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded font-mono">
                        POLLAR SESSION
                      </span>
                    </div>
                    <span className="text-xs font-mono text-gray-400">GCWD...MVB</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-400 block">Balance</span>
                  <span className="text-sm font-bold font-mono text-white">10,240.50 XLM</span>
                </div>
              </div>

              {/* Guardrails Status Bars */}
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                    Per-Tx Ceiling
                  </span>
                  <span className="font-mono text-white font-medium">50.00 XLM max</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-emerald-400" />
                    Daily Spend Cap
                  </span>
                  <span className="font-mono text-emerald-400">12% utilized (120 / 1,000 XLM)</span>
                </div>
                {/* Progress Bar */}
                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-400 h-full rounded-full w-[12%]" />
                </div>
              </div>

              {/* Real-time Stellar Settlement Frequency Stream */}
              <div className="flex items-center gap-1 h-7 px-2 bg-black/40 border border-white/5 rounded-lg">
                {[12, 18, 14, 24, 10, 26, 16, 22, 12, 28, 18, 14, 24, 8, 20, 14, 26, 18, 12, 22, 10, 24, 14, 18, 8, 20].map((h, i) => (
                  <span
                    key={i}
                    style={{ height: `${h}px` }}
                    className={`flex-1 rounded-full transition-all ${
                      i < 18 ? 'bg-emerald-400/80' : 'bg-white/20'
                    }`}
                  />
                ))}
              </div>

              {/* Emergency Killswitch Status */}
              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="font-medium">Pollar Circuit Breaker: ARMED</span>
                </div>
                <span className="text-[11px] text-gray-400">0ms trip latency</span>
              </div>
            </div>
          </div>
        </FadeInUp>

        {/* Right Column: Text & Content */}
        <FadeInUp delayMs={200} className="flex flex-col items-start gap-6 order-1 lg:order-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-400/10 border border-emerald-400/20 text-xs font-semibold text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Pollar Agent Wallets &amp; Guardrails</span>
          </div>

          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-white leading-tight">
            Cryptographic limits for autonomous spending.
          </h2>

          <p className="text-base text-gray-400 leading-relaxed max-w-xl">
            Never worry about runaway agent loops or unauthorized drain. Built with <span className="text-white font-medium">Pollar&apos;s non-custodial wallet primitives</span>, human operators define strict per-transaction ceilings, daily balance caps, and trigger an emergency cryptographic killswitch with sub-second execution on Stellar.
          </p>

          <Link
            href="/dashboard"
            className="mt-2 bg-white hover:bg-gray-100 text-black text-sm font-medium px-6 py-3 rounded-full transition-colors cursor-pointer flex items-center gap-2"
          >
            <span>Open Guardrail Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </FadeInUp>

      </div>
    </section>
  );
}
