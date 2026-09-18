'use client';

import React, { useState } from 'react';
import FadeInUp from './FadeInUp';
import { Plus } from 'lucide-react';

const FAQ_DATA = [
  {
    question: 'What is Nelax and how does it leverage the Pollar Protocol?',
    answer:
      'Nelax is an autonomous AI agent compute & payment protocol built on top of Pollar infrastructure for the Pollar Hackathon 2026. It leverages the Pollar SDK (@pollar/core) to give AI agents non-custodial Stellar wallets, session authentication, and automated x402 HTTP micropayments for leasing on-demand GPU clusters.',
  },
  {
    question: 'How does the Pollar SDK (@pollar/core) power agent wallets?',
    answer:
      'Nelax integrates Pollar\'s PollarClient and memory adapters to handle key generation, session tokens, and cryptographic transaction signing. Transactions are constructed and broadcast via Pollar\'s secure endpoints without ever exposing the agent\'s private keys to third parties or host environments.',
  },
  {
    question: 'How does the x402 compute leasing protocol work with Pollar?',
    answer:
      'When an AI agent requests compute resources without an active lease, the compute provider returns an HTTP 402 Payment Required challenge. Nelax passes the challenge to Pollar\'s transaction builder, signs the micropayment on Stellar, attaches the resulting hash, and unlocks immediate cluster access in under 3 seconds.',
  },
  {
    question: 'How do spending guardrails protect against runaway AI loops?',
    answer:
      'Nelax enforces deterministic spending ceilings: per-transaction limits (e.g. max 50 XLM per lease), daily spend quotas, and an emergency cryptographic killswitch. If an agent encounters an infinite loop or anomalous activity, the killswitch halts all outgoing Pollar transactions instantly.',
  },
  {
    question: 'Can I use Nelax and Pollar with existing LLM agent frameworks?',
    answer:
      'Yes. Nelax is framework-agnostic. You can run our zero-install CLI via "npx -y nelax-cli discover", install the npm package, or provide our agent skill file (SKILL.md) to models like Claude, Gemini, GPT-4, or AutoGPT to grant them autonomous wallet capabilities.',
  },
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleItem = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-32 px-6 max-w-3xl mx-auto">
      <FadeInUp delayMs={0}>
        <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-white text-center mb-12">
          We&apos;ve got answers
        </h2>
      </FadeInUp>

      {/* Main Transparent Accordion Wrapper with Border */}
      <FadeInUp delayMs={150}>
        <div className="border border-white/10 rounded-xl bg-transparent overflow-hidden">
          {FAQ_DATA.map((faq, idx) => {
            const isOpen = openIndex === idx;
            const isLast = idx === FAQ_DATA.length - 1;

            return (
              <div
                key={idx}
                className={!isLast ? 'border-b border-white/10' : ''}
              >
                {/* Accordion Question Trigger Button */}
                <button
                  onClick={() => toggleItem(idx)}
                  className="w-full py-6 px-6 flex items-center justify-between gap-4 text-left transition-colors hover:bg-white/[0.02] cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span className="text-base text-white font-medium leading-normal">
                    {faq.question}
                  </span>
                  
                  {/* Plus Icon that rotates perfectly into an X */}
                  <span
                    className={`transform transition-transform duration-300 ease-out text-gray-400 shrink-0 ${
                      isOpen ? 'rotate-45 text-white' : 'rotate-0'
                    }`}
                  >
                    <Plus className="w-5 h-5" />
                  </span>
                </button>

                {/* CSS Grid Animation: grid-template-rows 0fr to 1fr */}
                <div
                  className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                    isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="text-gray-400 text-sm pb-6 px-6 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </FadeInUp>
    </section>
  );
}
