"use client";

import React from "react";
import Link from "next/link";
import NelaxLogo from "./NelaxLogo";
import FadeInUp from "./FadeInUp";
import { LevShader } from "./animations/chroma";
import { ArrowRight, ExternalLink } from "lucide-react";

export default function Footer() {
  return (
    <footer
      id="contact"
      className="relative z-0 pt-32 pb-10 px-6 border-t border-white/5 bg-black text-white overflow-hidden"
    >
      {/* Optimized Chroma Shader Animated Background (No Video, No Gradients) */}
      {/* <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none opacity-25">
        <LevShader theme="dark" background={{ dark: "#000000" }} />
      </div> */}

      {/* Top CTA Banner */}
      <div className="max-w-4xl mx-auto text-center flex flex-col items-center mb-32">
        <FadeInUp delayMs={0}>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-white mb-8">
            Ready to empower your{" "}
            <span className="font-serif italic font-normal">agents?</span>
          </h2>
        </FadeInUp>

        <FadeInUp delayMs={150}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/marketplace"
              className="bg-white text-black text-sm font-medium px-6 py-3 rounded-full hover:bg-gray-100 transition-colors shadow-lg cursor-pointer flex items-center gap-2"
            >
              <span>Explore Marketplace</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/onboarding"
              className="bg-[#1F1F22] hover:bg-[#2A2A2D] text-white text-sm font-medium px-6 py-3 rounded-full border border-white/5 transition-colors cursor-pointer"
            >
              Agent Setup Guide
            </Link>
          </div>
        </FadeInUp>
      </div>

      {/* Link Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 max-w-7xl mx-auto mb-24">
        {/* Col 1: Brand & Bio */}
        <div className="flex flex-col items-start gap-4">
          <NelaxLogo />
          <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
            The financial &amp; compute layer for autonomous AI agents on
            Stellar. Powered by the{" "}
            <span className="text-white font-medium">Pollar Protocol</span> (
            <code className="text-xs text-cyan-300">@pollar/core</code>).
          </p>
        </div>

        {/* Col 2: Protocol & Apps */}
        <div className="flex flex-col gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Protocol
          </span>
          <ul className="flex flex-col gap-2.5 text-sm">
            <li>
              <Link
                href="/marketplace"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Compute Marketplace
              </Link>
            </li>
            <li>
              <Link
                href="/onboarding"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Agent Setup Guide
              </Link>
            </li>
            <li>
              <a
                href="#features"
                className="text-gray-400 hover:text-white transition-colors"
              >
                x402 Protocol Specification
              </a>
            </li>
            <li>
              <a
                href="https://www.npmjs.com/package/nelax-cli"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors inline-flex items-center gap-1"
              >
                <span>npm: nelax-cli</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </li>
          </ul>
        </div>

        {/* Col 3: Pollar & Stellar Ecosystem */}
        <div className="flex flex-col gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Pollar &amp; Stellar
          </span>
          <ul className="flex flex-col gap-2.5 text-sm">
            <li>
              <a
                href="https://pollar.xyz"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors inline-flex items-center gap-1"
              >
                <span>Pollar Protocol (pollar.xyz)</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </li>
            <li>
              <a
                href="https://docs.pollar.xyz"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors inline-flex items-center gap-1"
              >
                <span>Pollar SDK Documentation</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </li>
            <li>
              <a
                href="https://stellar.expert/explorer/testnet"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors inline-flex items-center gap-1"
              >
                <span>Stellar Expert Explorer</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </li>
            <li>
              <a
                href="https://soroban.stellar.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors inline-flex items-center gap-1"
              >
                <span>Soroban Smart Contracts</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </li>
          </ul>
        </div>

        {/* Col 4: Developers & Hackathon */}
        <div className="flex flex-col gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Hackathon &amp; Devs
          </span>
          <ul className="flex flex-col gap-2.5 text-sm">
            <li>
              <a
                href="https://github.com/Nebulaz7/Nelax"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors inline-flex items-center gap-1"
              >
                <span>GitHub Repository</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </li>
            <li>
              <span className="text-emerald-400 text-xs font-medium">
                Pollar Hackathon 2026 Submission
              </span>
            </li>
            <li>
              <a
                href="#about"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Agent Skill (SKILL.md)
              </a>
            </li>
            <li>
              <Link
                href="/onboarding"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Quickstart &amp; Funding Guide
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="flex flex-col md:flex-row justify-center items-center gap-2 text-xs text-gray-500 border-t border-white/5 pt-8">
        <span>&copy; 2026 Nelax Protocol. All rights reserved</span>
        <span className="hidden md:inline">&bull;</span>
        <span>
          Powered by <span className="text-gray-300">Pollar Protocol</span>{" "}
          (@pollar/core) on <span className="text-gray-300">Stellar</span>
        </span>
        <span className="hidden md:inline">&bull;</span>
        <span>
          Submitted to{" "}
          <span className="text-gray-300">Pollar Hackathon 2026</span>
        </span>
      </div>
    </footer>
  );
}
