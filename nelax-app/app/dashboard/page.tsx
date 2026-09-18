'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Wallet,
  ShieldCheck,
  ShieldAlert,
  Coins,
  ArrowUpRight,
  ArrowDownLeft,
  Lock,
  Unlock,
  Sliders,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Copy,
  Check,
  Zap,
  Server,
  Sparkles,
  Layers,
  ChevronRight,
  TrendingUp,
  Ban,
  DollarSign
} from 'lucide-react';

interface WalletBalance {
  asset: string;
  balance: string;
  isNative: boolean;
  usdValue: string;
}

interface PaymentRecord {
  id: string;
  type: string;
  amount: string;
  asset: string;
  isOutgoing: boolean;
  counterparty: string;
  timestamp: string;
  txHash: string;
}

interface AgentGuardrails {
  maxPerTxXlm: number;
  dailyCapXlm: number;
  spentTodayXlm: number;
  isPaused: boolean;
  allowComputeLeases: boolean;
  allowP2PTransfers: boolean;
  minBalanceAlertXlm: number;
}

const DEFAULT_GUARDRAILS: AgentGuardrails = {
  maxPerTxXlm: 10,
  dailyCapXlm: 50,
  spentTodayXlm: 23,
  isPaused: false,
  allowComputeLeases: true,
  allowP2PTransfers: true,
  minBalanceAlertXlm: 100,
};

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [address, setAddress] = useState('GCWDVYVPM7ORTD5INWSP3C5TRV5TRBEIHZWY3K4HS3STLKJE5I7OSMVB');
  const [balances, setBalances] = useState<WalletBalance[]>([
    { asset: 'XLM', balance: '9958.9999500', isNative: true, usdValue: '2489.75' },
  ]);
  const [totalUsd, setTotalUsd] = useState('2489.75');
  const [recentPayments, setRecentPayments] = useState<PaymentRecord[]>([]);

  // Guardrail settings (stored in localStorage)
  const [guardrails, setGuardrails] = useState<AgentGuardrails>(DEFAULT_GUARDRAILS);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const [funding, setFunding] = useState(false);
  const [fundSuccess, setFundSuccess] = useState(false);

  // Fetch Live Balances from Horizon
  const fetchWallet = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await fetch(`/api/wallet?address=${encodeURIComponent(address)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setBalances(data.balances || []);
          setTotalUsd(data.totalUsd || '0.00');
          if (data.address) setAddress(data.address);
          if (data.recentPayments) setRecentPayments(data.recentPayments);
        }
      }
    } catch (err) {
      console.error('Failed to query wallet:', err);
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  };

  // Load saved guardrails from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('nelax_agent_guardrails');
      if (saved) {
        setGuardrails(JSON.parse(saved));
      }
    } catch {}
    fetchWallet();
  }, []);

  const saveSettings = () => {
    try {
      localStorage.setItem('nelax_agent_guardrails', JSON.stringify(guardrails));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch {}
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Friendbot top-up
  const handleTopup = async () => {
    setFunding(true);
    setFundSuccess(false);
    try {
      const res = await fetch(`https://friendbot.stellar.org?addr=${encodeURIComponent(address)}`);
      if (res.ok) {
        setFundSuccess(true);
        setTimeout(() => setFundSuccess(false), 4000);
        await fetchWallet(true);
      }
    } catch (err) {
      console.error('Friendbot topup failed:', err);
    } finally {
      setFunding(false);
    }
  };

  const percentDailyUsed = Math.min(
    100,
    Math.round((guardrails.spentTodayXlm / guardrails.dailyCapXlm) * 100)
  );

  return (
    <div className="min-h-screen bg-[#07090e] text-zinc-100 selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Ambient background glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-32 left-1/3 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-10 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293710_1px,transparent_1px),linear-gradient(to_bottom,#1f293710_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-8">
        
        {/* HEADER */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-violet-600 p-[1px] shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-[#090d16] rounded-xl flex items-center justify-center">
                <Sliders className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-white">Nelax</span>
                <span className="px-2 py-0.5 text-xs font-semibold uppercase tracking-wider rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                  Agent Dashboard
                </span>
              </div>
              <p className="text-xs text-zinc-400">Assets & Autonomous Spending Guardrails</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/marketplace"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/60 transition-colors"
            >
              <Server className="w-3.5 h-3.5 text-cyan-400" />
              Compute Marketplace
              <ChevronRight className="w-3 h-3 text-zinc-400" />
            </Link>

            <button
              onClick={() => fetchWallet(true)}
              disabled={refreshing}
              title="Refresh balances"
              className="p-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white border border-zinc-700/60 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
          </div>
        </header>

        {/* EMERGENCY STATUS BANNER (IF PAUSED) */}
        {guardrails.isPaused && (
          <div className="rounded-xl border border-red-500/40 bg-red-950/40 p-4 flex items-center justify-between gap-3 text-xs text-red-200">
            <div className="flex items-center gap-2.5">
              <Ban className="w-5 h-5 text-red-400 shrink-0" />
              <div>
                <strong className="text-white font-semibold">Agent Spending Paused:</strong> Autonomous transactions and compute leases are currently blocked by human override.
              </div>
            </div>
            <button
              onClick={() => setGuardrails({ ...guardrails, isPaused: false })}
              className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold shrink-0 cursor-pointer"
            >
              Resume Autonomy
            </button>
          </div>
        )}

        {/* TOP ASSETS OVERVIEW */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Portfolio Card */}
          <div className="lg:col-span-2 rounded-2xl border border-zinc-800 bg-gradient-to-b from-[#0e1424]/90 via-[#0a0f1c]/80 to-[#070a12]/90 p-6 md:p-8 backdrop-blur-xl shadow-xl flex flex-col justify-between gap-6">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs text-zinc-400 uppercase font-semibold tracking-wider">
                  Total Agent Portfolio Value
                </span>
                <div className="text-3xl md:text-4xl font-extrabold text-white mt-1 flex items-baseline gap-2">
                  <span>${totalUsd}</span>
                  <span className="text-xs font-medium text-emerald-400">USD</span>
                </div>
                <p className="text-xs text-zinc-500 mt-1">
                  Non-custodial reserves on Stellar Testnet (Pollar Sponsored)
                </p>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Horizon Active
              </div>
            </div>

            {/* Wallet Address Strip */}
            <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 truncate">
                <Wallet className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="text-zinc-500 shrink-0">Stellar Address:</span>
                <span className="font-mono text-zinc-300 truncate">{address}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <button
                  onClick={copyAddress}
                  className="px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700/60 inline-flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
                <a
                  href={`https://stellar.expert/explorer/testnet/account/${address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-cyan-300 hover:text-cyan-200 border border-zinc-700/60 inline-flex items-center gap-1 transition-colors"
                >
                  Explorer
                  <ExternalLink className="w-3 h-3 opacity-70" />
                </a>
              </div>
            </div>

            {/* Balances Pills */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              {balances.map((b) => (
                <div
                  key={b.asset}
                  className="p-3.5 rounded-xl bg-zinc-900/50 border border-zinc-800/80 flex flex-col gap-1"
                >
                  <div className="flex items-center justify-between text-zinc-400 text-xs">
                    <span className="font-semibold text-zinc-200">{b.asset}</span>
                    <span className="text-[11px] text-zinc-500">{b.isNative ? 'Native Gas' : 'Stablecoin'}</span>
                  </div>
                  <div className="text-xl font-bold text-white tracking-tight">
                    {parseFloat(b.balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                  </div>
                  <span className="text-[11px] text-zinc-400">≈ ${b.usdValue} USD</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Top-Up / Fund Card */}
          <div className="rounded-2xl border border-zinc-800 bg-gradient-to-b from-[#101422]/90 via-[#0a0f1c]/80 to-[#070a12]/90 p-6 flex flex-col justify-between gap-4 shadow-xl">
            <div className="flex flex-col gap-2">
              <div className="w-9 h-9 rounded-lg bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center">
                <Coins className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-base font-bold text-white">Stellar Friendbot Top-Up</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Instantly request testnet funds to refill the agent&apos;s wallet balance without an exchange or credit card.
              </p>
            </div>

            {fundSuccess && (
              <div className="p-3 rounded-lg bg-emerald-950/50 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Credited +10,000 XLM on Stellar Testnet!</span>
              </div>
            )}

            <button
              onClick={handleTopup}
              disabled={funding}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-950/40"
            >
              {funding ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Coins className="w-4 h-4" />
                  <span>Request +10,000 XLM Refuel</span>
                </>
              )}
            </button>
          </div>
        </section>

        {/* AGENT SPENDING LIMITS & GUARDRAILS (THE CORE FEATURE) */}
        <section className="rounded-2xl border border-zinc-800/90 bg-[#0d121f]/90 p-6 md:p-8 backdrop-blur-xl shadow-2xl flex flex-col gap-6">
          
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-cyan-400" />
                <h2 className="text-lg font-bold text-white">Autonomous Agent Spending Guardrails</h2>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Set programmable limits so your autonomous agent cannot overspend or drain funds.
              </p>
            </div>

            {/* Emergency Pause Toggle */}
            <button
              onClick={() => setGuardrails({ ...guardrails, isPaused: !guardrails.isPaused })}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                guardrails.isPaused
                  ? 'bg-red-950 text-red-300 border border-red-500/50 shadow-md shadow-red-950/40'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700/60'
              }`}
            >
              {guardrails.isPaused ? <Lock className="w-3.5 h-3.5 text-red-400" /> : <Unlock className="w-3.5 h-3.5 text-emerald-400" />}
              {guardrails.isPaused ? 'Spending Paused' : 'Emergency Pause'}
            </button>
          </div>

          {/* Limits Config Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* 1. Per-Transaction Limit */}
            <div className="p-5 rounded-xl bg-zinc-950/60 border border-zinc-800/80 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                  Per-Transaction Ceiling
                </span>
                <span className="text-sm font-extrabold text-cyan-400">
                  {guardrails.maxPerTxXlm} XLM
                </span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Maximum amount the agent can authorize in a single autonomous x402 payment or compute lease.
              </p>

              <input
                type="range"
                min="1"
                max="50"
                step="1"
                value={guardrails.maxPerTxXlm}
                onChange={(e) =>
                  setGuardrails({ ...guardrails, maxPerTxXlm: parseInt(e.target.value, 10) })
                }
                className="w-full accent-cyan-400 cursor-pointer"
              />

              {/* Quick Preset Buttons */}
              <div className="flex items-center gap-2">
                {[1, 5, 10, 25, 50].map((val) => (
                  <button
                    key={val}
                    onClick={() => setGuardrails({ ...guardrails, maxPerTxXlm: val })}
                    className={`px-2.5 py-1 rounded text-xs font-mono transition-colors cursor-pointer ${
                      guardrails.maxPerTxXlm === val
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                    }`}
                  >
                    {val} XLM
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Daily Spending Cap */}
            <div className="p-5 rounded-xl bg-zinc-950/60 border border-zinc-800/80 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                  24-Hour Spending Cap
                </span>
                <span className="text-sm font-extrabold text-violet-400">
                  {guardrails.dailyCapXlm} XLM
                </span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Rolling daily budget limit. The agent will be rate-limited if this threshold is crossed.
              </p>

              {/* Progress Utilization */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-[11px] text-zinc-400">
                  <span>Usage: {guardrails.spentTodayXlm} XLM</span>
                  <span>{percentDailyUsed}% utilized</span>
                </div>
                <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-violet-500 transition-all duration-300"
                    style={{ width: `${percentDailyUsed}%` }}
                  />
                </div>
              </div>

              <input
                type="range"
                min="10"
                max="200"
                step="5"
                value={guardrails.dailyCapXlm}
                onChange={(e) =>
                  setGuardrails({ ...guardrails, dailyCapXlm: parseInt(e.target.value, 10) })
                }
                className="w-full accent-violet-400 cursor-pointer"
              />
            </div>
          </div>

          {/* Permissions & Category Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            
            <label className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-950/40 border border-zinc-800/80 cursor-pointer hover:border-zinc-700 transition-colors">
              <div className="flex items-center gap-3">
                <Server className="w-4 h-4 text-cyan-400" />
                <div>
                  <div className="text-xs font-semibold text-white">x402 Compute Leasing</div>
                  <div className="text-[11px] text-zinc-500">Allow agent to autonomously lease GPUs & CPUs</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={guardrails.allowComputeLeases}
                onChange={(e) =>
                  setGuardrails({ ...guardrails, allowComputeLeases: e.target.checked })
                }
                className="w-4 h-4 accent-cyan-400 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-950/40 border border-zinc-800/80 cursor-pointer hover:border-zinc-700 transition-colors">
              <div className="flex items-center gap-3">
                <ArrowUpRight className="w-4 h-4 text-violet-400" />
                <div>
                  <div className="text-xs font-semibold text-white">Direct P2P Payments</div>
                  <div className="text-[11px] text-zinc-500">Allow agent to send transfers via nelax pay</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={guardrails.allowP2PTransfers}
                onChange={(e) =>
                  setGuardrails({ ...guardrails, allowP2PTransfers: e.target.checked })
                }
                className="w-4 h-4 accent-violet-400 cursor-pointer"
              />
            </label>
          </div>

          {/* Save Action */}
          <div className="flex items-center justify-between pt-4 border-t border-zinc-800/80">
            <span className="text-xs text-zinc-500">
              Settings persist locally and apply to all agent CLI execution sessions.
            </span>

            <button
              onClick={saveSettings}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-black font-semibold text-xs transition-colors shadow-lg shadow-cyan-950/40 cursor-pointer"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Guardrails Saved!</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Save Guardrail Limits</span>
                </>
              )}
            </button>
          </div>
        </section>

        {/* RECENT AGENT ON-CHAIN ACTIVITY AUDIT */}
        <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 backdrop-blur-md">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <h3 className="text-base font-bold text-white">Live On-Chain Settlement Stream</h3>
            </div>
            <span className="text-xs text-zinc-500">Horizon Testnet</span>
          </div>

          <div className="divide-y divide-zinc-800/60 overflow-x-auto text-xs">
            {recentPayments.length === 0 ? (
              <p className="text-zinc-500 py-4 text-center">No transactions recorded yet.</p>
            ) : (
              recentPayments.map((p) => {
                const withinLimit = parseFloat(p.amount) <= guardrails.maxPerTxXlm;

                return (
                  <div
                    key={p.id}
                    className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-zinc-800/20 px-2 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          p.isOutgoing
                            ? 'bg-amber-950/60 border border-amber-500/40 text-amber-400'
                            : 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-400'
                        }`}
                      >
                        {p.isOutgoing ? (
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowDownLeft className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">
                            {p.isOutgoing ? 'Agent Dispatched Payment' : 'Received Funds'}
                          </span>
                          {p.isOutgoing && (
                            <span
                              className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                                withinLimit
                                  ? 'bg-emerald-950 text-emerald-300'
                                  : 'bg-amber-950 text-amber-300'
                              }`}
                            >
                              {withinLimit ? '✓ Under Limit' : 'Over Limit'}
                            </span>
                          )}
                        </div>
                        <div className="text-zinc-500 text-[11px] font-mono">
                          {p.isOutgoing ? 'To: ' : 'From: '}
                          {p.counterparty?.slice(0, 10)}... • {new Date(p.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 self-end sm:self-center">
                      <div className="text-right">
                        <div
                          className={`font-bold ${
                            p.isOutgoing ? 'text-zinc-200' : 'text-emerald-400'
                          }`}
                        >
                          {p.isOutgoing ? '-' : '+'}
                          {parseFloat(p.amount).toFixed(2)} {p.asset}
                        </div>
                      </div>
                      <a
                        href={`https://stellar.expert/explorer/testnet/tx/${p.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-cyan-300 transition-colors"
                        title="View on Stellar Expert"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

      </div>
    </div>
  );
}
