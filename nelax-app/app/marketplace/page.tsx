'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Cpu,
  Server,
  Zap,
  ShieldCheck,
  Terminal,
  ExternalLink,
  Copy,
  Check,
  Activity,
  RefreshCw,
  Flame,
  Layers,
  Lock,
  Unlock,
  Clock,
  Coins,
  ChevronRight,
  Code2,
  HardDrive,
  Wifi,
  Info,
  X,
  Play,
  RotateCcw,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import type { MachineSpec, ActivityItem } from '@/lib/compute-store';

interface ApiMachinesResponse {
  success: boolean;
  network: string;
  providerWallet: string;
  stats: {
    totalNodes: number;
    availableNodes: number;
    leasedNodes: number;
    totalVramGb: number;
    totalLeasesCount: number;
  };
  machines: MachineSpec[];
  recentActivity: ActivityItem[];
}

export default function MarketplacePage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [machines, setMachines] = useState<MachineSpec[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [stats, setStats] = useState({
    totalNodes: 4,
    availableNodes: 4,
    leasedNodes: 0,
    totalVramGb: 232,
    totalLeasesCount: 2,
  });
  const [providerWallet, setProviderWallet] = useState('GCWDVYVPM7ORTD5INWSP3C5TRV5TRBEIHZWY3K4HS3STLKJE5I7OSMVB');

  // Filtering & Search
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'available' | 'leased'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Drawers
  const [inspectMachine, setInspectMachine] = useState<MachineSpec | null>(null);
  const [simulationMachine, setSimulationMachine] = useState<MachineSpec | null>(null);
  const [showQuickstartDrawer, setShowQuickstartDrawer] = useState(false);

  // Simulation State
  const [simStep, setSimStep] = useState<1 | 2 | 3 | 4>(1);
  const [simLoading, setSimLoading] = useState(false);
  const [simError, setSimError] = useState<string | null>(null);
  const [simChallengeData, setSimChallengeData] = useState<any>(null);
  const [simCustomTxHash, setSimCustomTxHash] = useState('');
  const [simProvisionResult, setSimProvisionResult] = useState<any>(null);

  // Toast / Copy state
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const fetchCatalog = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    try {
      const res = await fetch('/api/machines');
      if (res.ok) {
        const data: ApiMachinesResponse = await res.json();
        setMachines(data.machines || []);
        setActivities(data.recentActivity || []);
        if (data.stats) setStats(data.stats);
        if (data.providerWallet) setProviderWallet(data.providerWallet);
      }
    } catch (err) {
      console.error('Failed to fetch machines catalog:', err);
    } finally {
      setLoading(false);
      if (isManualRefresh) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
    const interval = setInterval(() => {
      fetchCatalog();
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey((prev) => (prev === key ? null : prev));
    }, 2000);
  };

  const handleReleaseMachine = async (machineId: string) => {
    try {
      const res = await fetch(`/api/rent/${machineId}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchCatalog(true);
      }
    } catch (err) {
      console.error('Failed to release machine:', err);
    }
  };

  // Run in-browser x402 Simulation
  const startSimulation = (machine: MachineSpec) => {
    setSimulationMachine(machine);
    setSimStep(1);
    setSimLoading(false);
    setSimError(null);
    setSimChallengeData(null);
    setSimCustomTxHash('');
    setSimProvisionResult(null);
  };

  const executeSimStep1 = async () => {
    if (!simulationMachine) return;
    setSimLoading(true);
    setSimError(null);
    try {
      // Step 1: Send request without payment proof
      const res = await fetch(`/api/rent/${simulationMachine.id}`, {
        method: 'POST',
      });
      const data = await res.json();
      if (res.status === 402) {
        setSimChallengeData({
          status: 402,
          headers: {
            'WWW-Authenticate': `X-402 destination="${data.destination || providerWallet}", amount="${data.amount}", asset="${data.asset}", network="stellar:testnet"`,
          },
          body: data,
        });
        setSimStep(2);
      } else {
        setSimError(`Unexpected response: HTTP ${res.status}`);
      }
    } catch (err: any) {
      setSimError(err.message || 'Failed to request resource');
    } finally {
      setSimLoading(false);
    }
  };

  const executeSimStep2Payment = async () => {
    if (!simulationMachine) return;
    setSimLoading(true);
    setSimError(null);

    // Simulate agent signing & broadcasting to Stellar Testnet Horizon
    // We use a verified live testnet transaction or generate one
    setTimeout(() => {
      // Default to a real verified testnet tx hash or user entered hash
      const realOrMockHash =
        simCustomTxHash.trim() ||
        'c8b5f729a3b7f1c7b8b36e9223ca917bb58c4d2ab2c525c1302591ecf3a40c30';
      setSimCustomTxHash(realOrMockHash);
      setSimStep(3);
      setSimLoading(false);
    }, 900);
  };

  const executeSimStep3Unlock = async () => {
    if (!simulationMachine || !simCustomTxHash) return;
    setSimLoading(true);
    setSimError(null);
    try {
      const res = await fetch(`/api/rent/${simulationMachine.id}`, {
        method: 'POST',
        headers: {
          'X-402-Payment-Hash': simCustomTxHash,
          'Authorization': `x402 ${simCustomTxHash}`,
          'X-Agent-Wallet': 'GCWDVYVPM7ORTD5INWSP3C5TRV5TRBEIHZWY3K4HS3STLKJE5I7OSMVB',
        },
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSimProvisionResult(data);
        setSimStep(4);
        await fetchCatalog();
      } else {
        setSimError(data.message || 'Failed to verify payment and unlock machine.');
      }
    } catch (err: any) {
      setSimError(err.message || 'Network error claiming compute node.');
    } finally {
      setSimLoading(false);
    }
  };

  const filteredMachines = useMemo(() => {
    return machines.filter((m) => {
      // Category filter
      if (selectedCategory !== 'all') {
        if (selectedCategory === 'gpu' && m.category !== 'GPU') return false;
        if (selectedCategory === 'apple' && m.category !== 'Apple Silicon') return false;
        if (selectedCategory === 'cpu' && m.category !== 'High-Compute CPU') return false;
      }
      // Status filter
      if (selectedStatus !== 'all' && m.status !== selectedStatus) return false;
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          m.name.toLowerCase().includes(q) ||
          m.id.toLowerCase().includes(q) ||
          m.tagline.toLowerCase().includes(q) ||
          (m.gpu && m.gpu.toLowerCase().includes(q)) ||
          m.cpu.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [machines, selectedCategory, selectedStatus, searchQuery]);

  return (
    <div className="min-h-screen bg-[#07090e] text-zinc-100 selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Background ambient light effects */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-10 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 left-1/3 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293710_1px,transparent_1px),linear-gradient(to_bottom,#1f293710_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      {/* Main Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-8">
        
        {/* TOP BAR / NAVIGATION */}
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-zinc-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-violet-600 p-[1px] shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-[#090d16] rounded-xl flex items-center justify-center">
                <Server className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-white">Nelax</span>
                <span className="px-2 py-0.5 text-xs font-semibold uppercase tracking-wider rounded-md bg-gradient-to-r from-cyan-500/20 to-violet-500/20 text-cyan-300 border border-cyan-500/30">
                  x402 Marketplace
                </span>
              </div>
              <p className="text-xs text-zinc-400">Autonomous AI Agent Compute on Stellar Testnet</p>
            </div>
          </div>

          {/* Network Badges & Quick Actions */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <a
              href="https://stellar.expert/explorer/testnet/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-950/50 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-900/40 transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Stellar Testnet
              <ExternalLink className="w-3 h-3 ml-0.5 opacity-60" />
            </a>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-cyan-950/50 text-cyan-300 border border-cyan-500/30">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              Pollar Relay Active
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-violet-950/50 text-violet-300 border border-violet-500/30">
              <Zap className="w-3 h-3 text-violet-400" />
              x402 Protocol
            </div>

            <button
              onClick={() => setShowQuickstartDrawer(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/60 transition-colors cursor-pointer"
            >
              <Code2 className="w-3.5 h-3.5 text-cyan-400" />
              Agent Docs
            </button>

            <button
              onClick={() => fetchCatalog(true)}
              disabled={refreshing}
              title="Refresh catalog"
              className="p-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white border border-zinc-700/60 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
          </div>
        </header>

        {/* HERO BANNER & STATS */}
        <section className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-gradient-to-b from-[#0e1424]/90 via-[#0a0f1c]/80 to-[#070a12]/90 p-6 md:p-8 backdrop-blur-xl shadow-2xl">
          <div className="max-w-3xl flex flex-col gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 w-fit">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Zero-Human Latency • Automated Micropayments
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
              Instant Cloud & GPU Compute Leased via{' '}
              <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-violet-400 bg-clip-text text-transparent">
                HTTP 402
              </span>
            </h1>
            <p className="text-sm md:text-base text-zinc-400 leading-relaxed">
              Autonomous AI agents like Claude Code, OpenClaw, and Hermes discover clusters, negotiate HTTP 402 challenges, sign instant payments on Stellar Testnet via Pollar, and unlock dedicated SSH credentials within milliseconds.
            </p>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 mt-8 pt-6 border-t border-zinc-800/80">
            <div className="p-3.5 rounded-xl bg-zinc-900/50 border border-zinc-800/80 flex flex-col gap-1">
              <div className="flex items-center justify-between text-zinc-400 text-xs">
                <span>Available Nodes</span>
                <Server className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold text-white flex items-baseline gap-1">
                {stats.availableNodes}
                <span className="text-xs font-normal text-zinc-500">/ {stats.totalNodes} Online</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-900/50 border border-zinc-800/80 flex flex-col gap-1">
              <div className="flex items-center justify-between text-zinc-400 text-xs">
                <span>Active Leased</span>
                <Activity className="w-3.5 h-3.5 text-violet-400" />
              </div>
              <div className="text-2xl font-bold text-violet-300">
                {stats.leasedNodes}
                <span className="text-xs font-normal text-zinc-500 ml-1">Nodes Active</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-900/50 border border-zinc-800/80 flex flex-col gap-1">
              <div className="flex items-center justify-between text-zinc-400 text-xs">
                <span>Cluster VRAM</span>
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <div className="text-2xl font-bold text-cyan-300">
                {stats.totalVramGb}
                <span className="text-xs font-normal text-zinc-500 ml-1">GB VRAM</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-900/50 border border-zinc-800/80 flex flex-col gap-1">
              <div className="flex items-center justify-between text-zinc-400 text-xs">
                <span>Total On-Chain Volume</span>
                <Coins className="w-3.5 h-3.5 text-yellow-400" />
              </div>
              <div className="text-2xl font-bold text-yellow-300">
                21.0
                <span className="text-xs font-normal text-zinc-500 ml-1">XLM Settled</span>
              </div>
            </div>
          </div>
        </section>

        {/* SEARCH, CATEGORY TABS & FILTER */}
        <section className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-zinc-900/80 border border-zinc-800/80">
            {[
              { id: 'all', label: 'All Compute' },
              { id: 'gpu', label: 'High-End GPU' },
              { id: 'apple', label: 'Apple Silicon' },
              { id: 'cpu', label: 'EPYC CPU' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  selectedCategory === tab.id
                    ? 'bg-gradient-to-r from-cyan-500/20 to-violet-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Right Filters */}
          <div className="flex items-center gap-3">
            {/* Status Filter */}
            <div className="flex items-center gap-1 p-1 rounded-lg bg-zinc-900/80 border border-zinc-800/80 text-xs">
              <button
                onClick={() => setSelectedStatus('all')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  selectedStatus === 'all' ? 'bg-zinc-800 text-white font-medium' : 'text-zinc-400'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedStatus('available')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  selectedStatus === 'available' ? 'bg-emerald-950/60 text-emerald-300 font-medium' : 'text-zinc-400'
                }`}
              >
                Available
              </button>
              <button
                onClick={() => setSelectedStatus('leased')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  selectedStatus === 'leased' ? 'bg-violet-950/60 text-violet-300 font-medium' : 'text-zinc-400'
                }`}
              >
                Leased
              </button>
            </div>

            {/* Search Input */}
            <div className="relative flex-1 md:w-56">
              <input
                type="text"
                placeholder="Search cluster specs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-3 pr-8 py-1.5 rounded-lg bg-zinc-900/80 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </section>

        {/* HARDWARE NODE CARDS GRID */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredMachines.map((machine) => {
            const isLeased = machine.status === 'leased';
            const lease = machine.currentLease;

            return (
              <div
                key={machine.id}
                className={`relative flex flex-col justify-between rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isLeased
                    ? 'border-violet-500/40 bg-gradient-to-b from-[#120d22]/90 via-[#0d0918]/80 to-[#07050d]/90 shadow-lg shadow-violet-950/30'
                    : 'border-zinc-800/90 hover:border-cyan-500/40 bg-gradient-to-b from-[#0d121f]/90 via-[#0a0d17]/80 to-[#06080e]/90 hover:shadow-xl hover:shadow-cyan-950/20'
                }`}
              >
                {/* Status Indicator Bar */}
                <div className={`h-1 w-full ${isLeased ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500' : 'bg-gradient-to-r from-cyan-500 to-emerald-400'}`} />

                <div className="p-6 flex flex-col gap-5">
                  {/* Top Card Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-zinc-800/90 text-zinc-300 border border-zinc-700/60">
                          {machine.category}
                        </span>
                        <span className="font-mono text-xs text-zinc-500">#{machine.id}</span>
                      </div>
                      <h3 className="text-xl font-bold text-white tracking-tight">{machine.name}</h3>
                      <p className="text-xs text-zinc-400 line-clamp-2">{machine.tagline}</p>
                    </div>

                    {/* Status Badge */}
                    <div>
                      {isLeased ? (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-violet-950/60 text-violet-300 border border-violet-500/40">
                          <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
                          Leased by Agent
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-500/40">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          Available
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Hardware Specs Grid */}
                  <div className="grid grid-cols-2 gap-2.5 p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800/60 text-xs">
                    {machine.gpu && (
                      <div className="flex items-center gap-2 text-zinc-300 col-span-2">
                        <Flame className="w-4 h-4 text-orange-400 shrink-0" />
                        <span className="font-medium text-zinc-200">{machine.gpu}</span>
                      </div>
                    )}
                    {machine.vram && (
                      <div className="flex items-center gap-2 text-zinc-400">
                        <Layers className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span>VRAM: <strong className="text-zinc-200">{machine.vram}</strong></span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-zinc-400">
                      <Cpu className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                      <span>CPU: <strong className="text-zinc-200">{machine.cpu}</strong></span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-400">
                      <Server className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>RAM: <strong className="text-zinc-200">{machine.ram}</strong></span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-400">
                      <HardDrive className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                      <span className="truncate">Disk: <strong className="text-zinc-200">{machine.storage}</strong></span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-400 col-span-2">
                      <Wifi className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span>Uplink: <strong className="text-zinc-200">{machine.networkSpeed}</strong></span>
                    </div>
                  </div>

                  {/* Pricing Box */}
                  <div className="flex items-baseline justify-between pt-1">
                    <div>
                      <span className="text-2xl font-extrabold text-white">{machine.hourlyPriceXlm} XLM</span>
                      <span className="text-xs text-zinc-400 ml-1">/ hour</span>
                    </div>
                    <div className="text-xs text-zinc-500 font-medium">
                      ≈ ${machine.hourlyPriceUsdc} USDC
                    </div>
                  </div>

                  {/* ACTIVE LEASE METADATA (IF LEASED) */}
                  {isLeased && lease && (
                    <div className="rounded-xl bg-violet-950/30 border border-violet-500/30 p-3.5 flex flex-col gap-2 text-xs">
                      <div className="flex items-center justify-between text-violet-300 font-semibold">
                        <span className="flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-violet-400" />
                          Lease Verified On-Chain
                        </span>
                        <button
                          onClick={() => handleReleaseMachine(machine.id)}
                          title="Reset for testing"
                          className="text-[11px] text-zinc-400 hover:text-white underline cursor-pointer"
                        >
                          Release Node
                        </button>
                      </div>

                      <div className="flex items-center justify-between text-zinc-400">
                        <span>Agent Wallet:</span>
                        <span className="font-mono text-zinc-300">
                          {lease.agentWallet.slice(0, 6)}...{lease.agentWallet.slice(-6)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-zinc-400">
                        <span>Transaction Hash:</span>
                        <a
                          href={`https://stellar.expert/explorer/testnet/tx/${lease.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1"
                        >
                          {lease.txHash.slice(0, 10)}...
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>

                      {/* SSH Command */}
                      <div className="mt-1 p-2 rounded bg-zinc-950 font-mono text-xs text-emerald-400 flex items-center justify-between border border-zinc-800">
                        <span className="truncate">{lease.sshCommand}</span>
                        <button
                          onClick={() => copyToClipboard(lease.sshCommand, `ssh-${machine.id}`)}
                          className="ml-2 text-zinc-400 hover:text-white shrink-0 cursor-pointer"
                        >
                          {copiedKey === `ssh-${machine.id}` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Actions Footer */}
                <div className="p-4 bg-zinc-950/80 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-2">
                  <button
                    onClick={() =>
                      copyToClipboard(`nelax rent ${machine.id}`, `cmd-${machine.id}`)
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700/60 transition-colors cursor-pointer"
                  >
                    {copiedKey === `cmd-${machine.id}` ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-cyan-400" />
                        <span>nelax rent {machine.id}</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setInspectMachine(machine)}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-800/80 border border-transparent hover:border-zinc-700 transition-colors cursor-pointer"
                      title="Inspect x402 Challenge headers & response"
                    >
                      Inspect 402
                    </button>

                    <button
                      onClick={() => startSimulation(machine)}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-sm ${
                        isLeased
                          ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                          : 'bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-black shadow-cyan-500/20'
                      }`}
                    >
                      <Play className="w-3 h-3" />
                      {isLeased ? 'Inspect Lease' : 'Simulate Lease'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        {/* LIVE ON-CHAIN SETTLEMENT ACTIVITY FEED */}
        <section className="mt-4 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 backdrop-blur-md">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-bold text-white">Live On-Chain Settlement Stream</h2>
            </div>
            <span className="text-xs text-zinc-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Real-Time Horizon Stream
            </span>
          </div>

          <div className="divide-y divide-zinc-800/60 overflow-x-auto">
            {activities.length === 0 ? (
              <p className="text-xs text-zinc-500 py-4 text-center">No transactions recorded yet.</p>
            ) : (
              activities.map((act) => (
                <div
                  key={act.id}
                  className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-zinc-800/20 px-2 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center shrink-0">
                      <Zap className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{act.machineName}</span>
                        <span className="font-mono text-[10px] text-zinc-500">#{act.machineId}</span>
                      </div>
                      <div className="text-zinc-400 text-[11px] flex items-center gap-2">
                        <span>Agent:</span>
                        <span className="font-mono text-zinc-300">
                          {act.agentWallet.slice(0, 6)}...{act.agentWallet.slice(-6)}
                        </span>
                        <span>•</span>
                        <span>{new Date(act.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-end sm:self-center">
                    <div className="text-right">
                      <span className="font-bold text-emerald-400">+{act.amount} {act.asset}</span>
                      <div className="text-[10px] text-zinc-500">x402 Micro-settlement</div>
                    </div>
                    <a
                      href={`https://stellar.expert/explorer/testnet/tx/${act.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-cyan-300 hover:text-cyan-200 font-mono text-[11px] transition-colors"
                    >
                      {act.txHash.slice(0, 8)}...
                      <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* FOOTER */}
        <footer className="pt-8 pb-12 text-center text-xs text-zinc-500 border-t border-zinc-800/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Nelax Protocol. Built for the Pollar Hackathon on Stellar Testnet.</p>
          <div className="flex items-center gap-4 text-zinc-400">
            <a
              href="https://stellar.expert/explorer/testnet/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-cyan-400 transition-colors"
            >
              Stellar Expert
            </a>
            <span>•</span>
            <a
              href="https://developers.stellar.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-cyan-400 transition-colors"
            >
              Stellar Horizon
            </a>
            <span>•</span>
            <button
              onClick={() => setShowQuickstartDrawer(true)}
              className="hover:text-cyan-400 transition-colors cursor-pointer"
            >
              Agent Protocol Docs
            </button>
          </div>
        </footer>
      </div>

      {/* ========================================================= */}
      {/* MODAL 1: INTERACTIVE x402 RENTAL SIMULATOR */}
      {/* ========================================================= */}
      {simulationMachine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-2xl rounded-2xl border border-zinc-700/80 bg-[#0d121f] p-6 shadow-2xl flex flex-col gap-5 text-zinc-100">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-950/90 border border-cyan-500/40 flex items-center justify-center">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    x402 Autonomous Lease Simulator
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Interactive demonstration of HTTP 402 challenge & Stellar Testnet settlement
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSimulationMachine(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Target Machine Summary */}
            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between text-xs">
              <div>
                <span className="text-zinc-400">Target Node: </span>
                <strong className="text-white font-semibold">{simulationMachine.name}</strong>{' '}
                <span className="text-zinc-500 font-mono">({simulationMachine.id})</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-cyan-400">{simulationMachine.hourlyPriceXlm} XLM</span>
                <span className="text-zinc-500"> / hr</span>
              </div>
            </div>

            {/* Step Progress Indicator */}
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              {[
                { step: 1, label: '1. Request' },
                { step: 2, label: '2. 402 Challenge' },
                { step: 3, label: '3. Testnet Pay' },
                { step: 4, label: '4. Provisioned' },
              ].map((s) => (
                <div
                  key={s.step}
                  className={`p-2 rounded-lg border font-medium transition-all ${
                    simStep === s.step
                      ? 'bg-cyan-950/60 border-cyan-500/60 text-cyan-300'
                      : simStep > s.step
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400'
                      : 'bg-zinc-900/40 border-zinc-800/60 text-zinc-500'
                  }`}
                >
                  {s.label}
                </div>
              ))}
            </div>

            {/* Error Message if any */}
            {simError && (
              <div className="p-3 rounded-lg bg-red-950/60 border border-red-500/40 text-xs text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{simError}</span>
              </div>
            )}

            {/* Step 1: Initial Request */}
            {simStep === 1 && (
              <div className="flex flex-col gap-3 text-xs">
                <p className="text-zinc-300">
                  The AI agent issues an unauthenticated HTTP request to lease the node without attaching any payment proof.
                </p>
                <div className="p-3 rounded-lg bg-zinc-950 font-mono text-zinc-300 border border-zinc-800 flex flex-col gap-1">
                  <span className="text-cyan-400">POST /api/rent/{simulationMachine.id} HTTP/1.1</span>
                  <span className="text-zinc-500">Host: localhost:3000</span>
                  <span className="text-zinc-500">Accept: application/json</span>
                  <span className="text-zinc-500">X-Agent-Wallet: GCWDVYVPM7...5I7OS</span>
                </div>
                <button
                  onClick={executeSimStep1}
                  disabled={simLoading}
                  className="mt-2 w-full py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  {simLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Send Initial Request (Trigger HTTP 402)</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Step 2: HTTP 402 Challenge Received */}
            {simStep === 2 && simChallengeData && (
              <div className="flex flex-col gap-3 text-xs">
                <div className="flex items-center gap-2 text-amber-300 font-semibold">
                  <AlertCircle className="w-4 h-4" />
                  <span>HTTP 402 Payment Required Challenge Intercepted</span>
                </div>
                <div className="p-3 rounded-lg bg-zinc-950 font-mono text-zinc-300 border border-zinc-800 flex flex-col gap-1 max-h-48 overflow-y-auto">
                  <span className="text-amber-400">HTTP/1.1 402 Payment Required</span>
                  <span className="text-zinc-400">{simChallengeData.headers['WWW-Authenticate']}</span>
                  <span className="text-zinc-500">Content-Type: application/json</span>
                  <pre className="text-emerald-400 text-[11px] mt-2">
                    {JSON.stringify(simChallengeData.body, null, 2)}
                  </pre>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-zinc-400 text-[11px]">
                    Stellar Testnet Transaction Hash (Uses pre-verified on-chain tx or paste your own):
                  </label>
                  <input
                    type="text"
                    value={simCustomTxHash}
                    onChange={(e) => setSimCustomTxHash(e.target.value)}
                    placeholder="c8b5f729a3b7f1c7b8b36e9223ca917bb58c4d2ab2c525c1302591ecf3a40c30"
                    className="w-full px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-700 font-mono text-xs text-cyan-300"
                  />
                </div>

                <button
                  onClick={executeSimStep2Payment}
                  disabled={simLoading}
                  className="mt-2 w-full py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-400 hover:to-violet-400 text-black font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  {simLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Submit Payment On-Chain via Pollar</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Step 3: Payment Confirmed -> Retry with Proof */}
            {simStep === 3 && (
              <div className="flex flex-col gap-3 text-xs">
                <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>On-Chain Settlement Confirmed on Stellar Horizon!</span>
                </div>

                <div className="p-3 rounded-lg bg-zinc-950 font-mono text-zinc-300 border border-zinc-800 flex flex-col gap-1">
                  <span className="text-cyan-400">POST /api/rent/{simulationMachine.id} HTTP/1.1</span>
                  <span className="text-emerald-400">X-402-Payment-Hash: {simCustomTxHash}</span>
                  <span className="text-emerald-400">Authorization: x402 {simCustomTxHash}</span>
                  <span className="text-zinc-500">X-Agent-Wallet: GCWDVYVPM7...5I7OS</span>
                </div>

                <button
                  onClick={executeSimStep3Unlock}
                  disabled={simLoading}
                  className="mt-2 w-full py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  {simLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Claim & Provision Node with Proof</span>
                      <Unlock className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Step 4: Machine Successfully Unlocked */}
            {simStep === 4 && simProvisionResult && (
              <div className="flex flex-col gap-3 text-xs">
                <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/80 to-cyan-950/80 border border-emerald-500/40 text-emerald-200 flex flex-col gap-1">
                  <div className="flex items-center gap-2 font-bold text-emerald-300 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    Node Unlocked & Provisioned Successfully!
                  </div>
                  <p className="text-xs text-zinc-300">
                    Credentials cryptographically unlocked via x402 payment proof.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-col gap-2 font-mono">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">IP Host:</span>
                    <span className="text-cyan-300">{simProvisionResult.ip}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">SSH Port:</span>
                    <span className="text-zinc-300">{simProvisionResult.sshPort}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Username:</span>
                    <span className="text-zinc-300">{simProvisionResult.username}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Auth Token:</span>
                    <span className="text-zinc-400 truncate max-w-xs">{simProvisionResult.authToken}</span>
                  </div>
                  <div className="mt-2 pt-2 border-t border-zinc-800 flex items-center justify-between">
                    <span className="text-emerald-400 font-bold">{simProvisionResult.sshCommand}</span>
                    <button
                      onClick={() => copyToClipboard(simProvisionResult.sshCommand, 'modal-ssh')}
                      className="text-zinc-400 hover:text-white"
                    >
                      {copiedKey === 'modal-ssh' ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => setSimulationMachine(null)}
                  className="mt-2 w-full py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs transition-colors cursor-pointer"
                >
                  Close Simulator
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: INSPECT RAW 402 PROTOCOL */}
      {/* ========================================================= */}
      {inspectMachine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-xl rounded-2xl border border-zinc-800 bg-[#0d121f] p-6 shadow-2xl flex flex-col gap-4 text-zinc-100">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">x402 Protocol Specification</h3>
              </div>
              <button
                onClick={() => setInspectMachine(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              When an agent requests <code className="text-cyan-300">/api/rent/{inspectMachine.id}</code> without proof, the Nelax server issues standard HTTP 402 headers with Stellar Testnet destination and amount:
            </p>

            <div className="p-3.5 rounded-xl bg-zinc-950 font-mono text-xs text-zinc-300 border border-zinc-800 flex flex-col gap-1 overflow-x-auto">
              <span className="text-amber-400 font-bold">HTTP/1.1 402 Payment Required</span>
              <span className="text-zinc-400">Content-Type: application/json</span>
              <span className="text-cyan-400">
                WWW-Authenticate: X-402 destination=&quot;{providerWallet}&quot;, amount=&quot;{inspectMachine.hourlyPriceXlm}&quot;, asset=&quot;XLM&quot;, network=&quot;stellar:testnet&quot;
              </span>
              <span className="text-zinc-600 mt-2">// JSON Payload:</span>
              <pre className="text-emerald-400 text-[11px]">
{`{
  "status": 402,
  "error": "Payment Required",
  "destination": "${providerWallet}",
  "amount": "${inspectMachine.hourlyPriceXlm}",
  "asset": "XLM",
  "network": "stellar:testnet",
  "resourceId": "${inspectMachine.id}"
}`}
              </pre>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() =>
                  copyToClipboard(
                    `curl -i -X POST http://localhost:3000/api/rent/${inspectMachine.id}`,
                    'curl-test'
                  )
                }
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700/60"
              >
                {copiedKey === 'curl-test' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                Copy cURL Test Command
              </button>

              <button
                onClick={() => setInspectMachine(null)}
                className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* DRAWER: AGENT QUICKSTART & DOCS */}
      {/* ========================================================= */}
      {showQuickstartDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg h-full bg-[#0b101c] border-l border-zinc-800 p-6 flex flex-col gap-6 overflow-y-auto text-zinc-100 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Agent Integration Quickstart</h3>
              </div>
              <button
                onClick={() => setShowQuickstartDrawer(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quickstart 1: CLI commands */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">1. Nelax Agent CLI</span>
              <p className="text-xs text-zinc-400">
                Install and authenticate the Nelax CLI on any machine or container runtime:
              </p>
              <div className="p-3 rounded-xl bg-zinc-950 font-mono text-xs text-zinc-300 border border-zinc-800 flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500"># Authenticate wallet via email OTP</span>
                  <button
                    onClick={() => copyToClipboard('nelax login agent@nelax.xyz\nnelax verify <code>', 'doc-1')}
                    className="text-zinc-500 hover:text-white"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
                <span className="text-cyan-300">$ nelax login agent@nelax.xyz</span>
                <span className="text-cyan-300">$ nelax verify &lt;code&gt;</span>
                <span className="text-zinc-500 mt-2"># Check balance on Stellar Horizon</span>
                <span className="text-cyan-300">$ nelax wallet --json</span>
                <span className="text-zinc-500 mt-2"># Discover available GPU and CPU nodes</span>
                <span className="text-cyan-300">$ nelax discover --json</span>
                <span className="text-zinc-500 mt-2"># Autonomously resolve 402 & lease compute</span>
                <span className="text-emerald-400">$ nelax rent gpu-h100-01</span>
              </div>
            </div>

            {/* Quickstart 2: Autonomous Protocol Flow */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-violet-400">2. How Autonomous Settlement Works</span>
              <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-300 flex flex-col gap-2 leading-relaxed">
                <p>
                  <strong>Step A:</strong> Agent sends <code className="text-cyan-300">POST /api/rent/&lt;id&gt;</code>.
                </p>
                <p>
                  <strong>Step B:</strong> Nelax returns <code className="text-amber-300">HTTP 402 Payment Required</code> with recipient Stellar wallet and XLM price.
                </p>
                <p>
                  <strong>Step C:</strong> The agent signs and broadcasts payment via Pollar onto the Stellar Testnet ledger.
                </p>
                <p>
                  <strong>Step D:</strong> Agent retries request with header <code className="text-emerald-400">X-402-Payment-Hash: &lt;tx_hash&gt;</code>. Server verifies on Horizon and provisions SSH credentials.
                </p>
              </div>
            </div>

            {/* Quickstart 3: Skill definition */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">3. Universal AI Agent Skill (Claude / Hermes)</span>
              <p className="text-xs text-zinc-400">
                Place <code className="text-zinc-300">SKILL.md</code> in your agent&apos;s workspace. It automatically equips the agent with autonomous Stellar payment capabilities.
              </p>
              <div className="p-3 rounded-xl bg-zinc-950 font-mono text-xs text-zinc-400 border border-zinc-800 max-h-36 overflow-y-auto">
                <pre>{`name: nelax-stellar-agent
description: Autonomous Stellar wallet & x402 compute payments
commands:
  - nelax wallet
  - nelax pay <dest> <amount> [asset]
  - nelax rent <machineId>
  - nelax fetch <url>`}</pre>
              </div>
            </div>

            <button
              onClick={() => setShowQuickstartDrawer(false)}
              className="mt-auto w-full py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs transition-colors cursor-pointer"
            >
              Close Documentation
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
