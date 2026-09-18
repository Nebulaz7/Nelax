'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Copy, Check, Terminal, ExternalLink, ArrowRight, BookOpen } from 'lucide-react';

interface CodeSnippetProps {
  code: string;
  label?: string;
  comment?: string;
}

function PromptBox({ code, label = 'Copy', comment }: CodeSnippetProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-4 rounded-xl border border-white/10 bg-[#0c0c0e] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-[#121215] text-xs text-gray-400">
        <span className="font-mono text-[11px]">{label}</span>
        <button
          onClick={handleCopy}
          className="hover:text-white transition-colors cursor-pointer flex items-center gap-1"
          aria-label="Copy prompt"
        >
          {copied ? (
            <span className="text-emerald-400 font-sans text-[11px] flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Copied
            </span>
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
        </button>
      </div>
      <div className="p-4 font-mono text-xs text-emerald-400 leading-relaxed overflow-x-auto selection:bg-emerald-500/20">
        {code}
      </div>
      {comment && (
        <div className="px-4 py-2 border-t border-white/5 bg-[#09090b] text-[11px] text-gray-500 font-mono">
          {comment}
        </div>
      )}
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-white/20 selection:text-white flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-6 pt-32 pb-24">
        {/* Main Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 text-xs font-mono text-gray-400 mb-4 bg-white/5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Developer &bull; Agent Setup</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white">
            Become User
          </h1>
        </div>

        {/* Intro Box (Matching OKX.AI reference styling) */}
        <div className="rounded-2xl border border-white/10 bg-[#0d0d0f] p-6 sm:p-8 mb-16 text-left">
          <h2 className="text-xl font-bold text-white mb-2">
            Users &amp; Autonomous Agents
          </h2>
          <p className="font-mono text-xs text-gray-400 uppercase tracking-wide leading-relaxed mb-6">
            FIRST, EQUIP YOUR AGENT AND JOIN THIS FULLY AGENT-DRIVEN ECOSYSTEM. AS A TASK INITIATOR, YOU PUBLISH TASKS AND LEASE HARDWARE BY COMMUNICATING DIRECTLY WITH YOUR AGENT.
          </p>

          <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
            <p>
              We&apos;ll guide you through setting up Nelax with your Agent, after which your agent can discover and lease resources through two modes:
            </p>
            <div className="font-mono text-xs text-gray-400 space-y-1.5 pl-2">
              <p>&gt; <strong className="text-white">Auto-match:</strong> the agent receives signed HTTP 402 challenges and settles micropayments automatically.</p>
              <p>&gt; <strong className="text-white">Direct assignment:</strong> instruct your agent to lease a specific cluster (H100, RTX 4090, Apple M3, EPYC) directly from the live catalog.</p>
            </div>
            <p className="pt-2 text-xs text-gray-500">
              Both parties agree &rarr; agent funds the lease via Pollar on Stellar Testnet. After settlement, instant SSH credentials and access tokens are returned. Cryptographic guardrails prevent unauthorized loop spend.
            </p>
          </div>
        </div>

        {/* Vertical Stepper Timeline */}
        <div className="relative pl-6 sm:pl-10 space-y-16">
          {/* Vertical Connecting Guide Line */}
          <div className="absolute left-[15px] sm:left-[19px] top-6 bottom-6 w-[1px] bg-white/15" />

          {/* STEP 1 */}
          <div className="relative flex items-start gap-4 sm:gap-6">
            <div className="relative z-10 w-8 h-8 rounded-full border border-white/20 bg-black text-xs font-bold text-white flex items-center justify-center shrink-0">
              1
            </div>
            <div className="flex-1 pt-0.5">
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
                Install OpenClaw, Hermes, Claude Code, or Codex, or use a cloud-hosted Agent from a third party.
              </h3>
              <p className="text-sm text-gray-400 mb-4 leading-relaxed">
                Nelax is framework-agnostic. Any AI agent runtime with shell capabilities can operate Nelax CLI commands and interpret the agent skill definition.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href="https://github.com/Nebulaz7/Nelax/blob/main/SKILL.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-full bg-white hover:bg-zinc-200 text-black text-xs font-semibold transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>VIEW AGENT SKILL (SKILL.MD)</span>
                </a>
                <a
                  href="https://github.com/Nebulaz7/Nelax"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 text-xs font-medium transition-colors inline-flex items-center gap-1.5"
                >
                  <span>GITHUB REPO</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* STEP 2 */}
          <div className="relative flex items-start gap-4 sm:gap-6">
            <div className="relative z-10 w-8 h-8 rounded-full border border-white/20 bg-black text-xs font-bold text-white flex items-center justify-center shrink-0">
              2
            </div>
            <div className="flex-1 pt-0.5">
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
                Install Nelax CLI
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Send the prompt below to your Agent, and follow its guidance to install Nelax CLI. Once installation finishes, open a new session in your Agent to start using Nelax.
              </p>

              <PromptBox
                code="npx -y nelax-cli discover"
                label="Copy"
                comment="Alternative global install: npm install -g nelax-cli"
              />
            </div>
          </div>

          {/* STEP 3 */}
          <div className="relative flex items-start gap-4 sm:gap-6">
            <div className="relative z-10 w-8 h-8 rounded-full border border-white/20 bg-black text-xs font-bold text-white flex items-center justify-center shrink-0">
              3
            </div>
            <div className="flex-1 pt-0.5">
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
                Log in to the Agentic Wallet
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Have your email ready, and then send the prompt below to your Agent. It will guide you through logging in to your Pollar embedded non-custodial wallet on Stellar.
              </p>

              <PromptBox
                code="log in to Agentic Wallet on Nelax with my email"
                label="Copy"
                comment="Direct CLI command: nelax login <email> then nelax verify <code>"
              />
            </div>
          </div>

          {/* STEP 4 */}
          <div className="relative flex items-start gap-4 sm:gap-6">
            <div className="relative z-10 w-8 h-8 rounded-full border border-white/20 bg-black text-xs font-bold text-white flex items-center justify-center shrink-0">
              4
            </div>
            <div className="flex-1 pt-0.5">
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
                Fund the Agent Wallet &amp; Check Balances
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Enter the prompt below. Follow the Agent to verify testnet balances and request 10,000 free XLM from the Stellar Friendbot faucet with zero setup fees.
              </p>

              <PromptBox
                code="fund my Nelax agent wallet with testnet XLM and show my balance"
                label="Copy"
                comment="Direct CLI command: nelax fund && nelax wallet"
              />
            </div>
          </div>

          {/* STEP 5 */}
          <div className="relative flex items-start gap-4 sm:gap-6">
            <div className="relative z-10 w-8 h-8 rounded-full border border-white/20 bg-black text-xs font-bold text-white flex items-center justify-center shrink-0">
              5
            </div>
            <div className="flex-1 pt-0.5">
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
                Lease on-demand compute or trigger tasks
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Describe your compute requirements in a conversation with your Agent &mdash; it&apos;ll query the live hardware catalog, negotiate the HTTP 402 challenge, broadcast payment on Stellar, and return live SSH credentials. Just watch the chat or terminal window as your Agent handles the rest.
              </p>

              <div className="mt-2 text-xs text-gray-500 font-mono">
                (The negotiation between the Agent and the compute provider is displayed automatically in the terminal session.)
              </div>

              <PromptBox
                code="Lease an NVIDIA H100 GPU cluster for 1 hour using Nelax on Stellar"
                label="Example Prompt"
                comment="Direct CLI command: nelax rent gpu-h100-01 --duration 1h"
              />

              <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-base font-bold text-white">Ready to inspect compute nodes?</h4>
                  <p className="text-xs text-gray-400">View real-time hardware cluster availability and pricing.</p>
                </div>
                <Link
                  href="/marketplace"
                  className="px-6 py-2.5 rounded-full bg-white hover:bg-zinc-200 text-black text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Explore Marketplace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
