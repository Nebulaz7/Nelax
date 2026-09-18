'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import {
  Server,
  Cpu,
  Zap,
  Copy,
  Check,
  Activity,
  RefreshCw,
  X,
  Play,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Terminal,
  Code2,
  Sliders,
  ChevronDown,
  ChevronUp,
  Coins,
  Search,
  Layers,
  Unlock,
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
  const [providerWallet, setProviderWallet] = useState(
    'GCWDVYVPM7ORTD5INWSP3C5TRV5TRBEIHZWY3K4HS3STLKJE5I7OSMVB',
  );

  // Filtering & Search
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'available' | 'leased'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);

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

    setTimeout(() => {
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
          Authorization: `x402 ${simCustomTxHash}`,
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
      if (selectedCategory !== 'all') {
        if (selectedCategory === 'gpu' && m.category !== 'GPU') return false;
        if (selectedCategory === 'apple' && m.category !== 'Apple Silicon') return false;
        if (selectedCategory === 'cpu' && m.category !== 'High-Compute CPU') return false;
      }
      if (selectedStatus !== 'all' && m.status !== selectedStatus) return false;
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
    <div className="min-h-screen bg-black text-white selection:bg-white/20 selection:text-white flex flex-col">
      {/* Landing Page Shared Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 pt-32 pb-24 flex flex-col gap-10">
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 text-xs font-mono text-gray-400 mb-4 bg-white/5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Stellar Testnet &bull; Pollar Relay</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white">
              Compute{' '}
              <span className="font-serif italic font-normal text-gray-300">
                Marketplace
              </span>
            </h1>
            <p className="text-sm sm:text-base text-gray-400 mt-2 max-w-2xl leading-relaxed">
              Decentralized GPU &amp; CPU nodes leased autonomously by AI agents via HTTP 402 micropayments. Powered by the Pollar Protocol (<code className="text-xs text-cyan-300">@pollar/core</code>).
            </p>
          </div>

          {/* Quick Header Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <a
              href="https://stellar.expert/explorer/testnet/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Stellar Testnet
              <ExternalLink className="w-3 h-3 ml-0.5 text-gray-500" />
            </a>

            <Link
              href="/onboarding"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition-colors"
            >
              <Sliders className="w-3 h-3 text-gray-400" />
              Setup Guide
            </Link>

            <button
              onClick={() => setShowQuickstartDrawer(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
            >
              <Code2 className="w-3.5 h-3.5 text-gray-400" />
              Protocol Docs
            </button>

            <button
              onClick={() => fetchCatalog(true)}
              disabled={refreshing}
              title="Refresh catalog"
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-white' : ''}`} />
            </button>
          </div>
        </div>

        {/* METRICS STRIP */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-[#0c0c0e] border border-white/10 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
              <span>Available Nodes</span>
              <Server className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {stats.availableNodes}{' '}
              <span className="text-xs font-normal text-gray-500">/ {stats.totalNodes} Online</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#0c0c0e] border border-white/10 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
              <span>Active Leased</span>
              <Activity className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {stats.leasedNodes}{' '}
              <span className="text-xs font-normal text-gray-500">Nodes</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#0c0c0e] border border-white/10 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
              <span>Cluster VRAM</span>
              <Cpu className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {stats.totalVramGb}{' '}
              <span className="text-xs font-normal text-gray-500">GB</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#0c0c0e] border border-white/10 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
              <span>Testnet Volume</span>
              <Coins className="w-4 h-4 text-yellow-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              21.0{' '}
              <span className="text-xs font-normal text-gray-500">XLM Settled</span>
            </div>
          </div>
        </div>

        {/* CONTROLS: CATEGORIES, STATUS, SEARCH */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-full bg-[#0c0c0e] border border-white/10">
            {[
              { id: 'all', label: 'All Clusters' },
              { id: 'gpu', label: 'GPU' },
              { id: 'apple', label: 'Apple Silicon' },
              { id: 'cpu', label: 'CPU' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                  selectedCategory === tab.id
                    ? 'bg-white text-black font-semibold'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            {/* Status Pills */}
            <div className="flex items-center gap-1 p-1 rounded-full bg-[#0c0c0e] border border-white/10 text-xs">
              <button
                onClick={() => setSelectedStatus('all')}
                className={`px-3 py-1 rounded-full transition-colors cursor-pointer ${
                  selectedStatus === 'all'
                    ? 'bg-white/15 text-white font-medium'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedStatus('available')}
                className={`px-3 py-1 rounded-full transition-colors cursor-pointer ${
                  selectedStatus === 'available'
                    ? 'bg-emerald-500/20 text-emerald-300 font-medium'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Available
              </button>
              <button
                onClick={() => setSelectedStatus('leased')}
                className={`px-3 py-1 rounded-full transition-colors cursor-pointer ${
                  selectedStatus === 'leased'
                    ? 'bg-purple-500/20 text-purple-300 font-medium'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Leased
              </button>
            </div>

            {/* Search */}
            <div className="relative flex-1 sm:w-60">
              <input
                type="text"
                placeholder="Search specs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-1.5 rounded-full bg-[#0c0c0e] border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-colors"
              />
              <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* REDESIGNED SIMPLIFIED COMPUTE CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredMachines.map((machine) => {
            const isLeased = machine.status === 'leased';
            const lease = machine.currentLease;
            const isExpanded = expandedCardId === machine.id;

            return (
              <div
                key={machine.id}
                className={`group rounded-2xl border transition-all duration-200 bg-[#0c0c0e] p-6 flex flex-col justify-between ${
                  isLeased
                    ? 'border-purple-500/30'
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex flex-col gap-4">
                  {/* Card Top: Category Badge & Status */}
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] text-gray-400 bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
                      {machine.category} &bull; #{machine.id}
                    </span>

                    {isLeased ? (
                      <span className="inline-flex items-center gap-1.5 text-xs text-purple-400 font-medium">
                        <span className="w-2 h-2 rounded-full bg-purple-400" />
                        Leased
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        Available
                      </span>
                    )}
                  </div>

                  {/* Title & Tagline */}
                  <div>
                    <h2 className="text-xl font-bold text-white tracking-tight group-hover:text-gray-100">
                      {machine.name}
                    </h2>
                    <p className="text-xs text-gray-400 mt-1 line-clamp-1">
                      {machine.tagline}
                    </p>
                  </div>

                  {/* SIMPLIFIED KEY SPECS: 3 Clean Highlight Points */}
                  <div className="grid grid-cols-3 gap-2 py-3 px-4 rounded-xl bg-black/50 border border-white/5 text-center">
                    <div>
                      <span className="block text-[10px] uppercase font-mono text-gray-500">Memory</span>
                      <span className="text-xs sm:text-sm font-semibold text-white truncate block">
                        {machine.vram ? machine.vram.split(' ')[0] + ' ' + machine.vram.split(' ')[1] : machine.ram.split(' ')[0] + ' RAM'}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase font-mono text-gray-500">Compute</span>
                      <span className="text-xs sm:text-sm font-semibold text-white truncate block">
                        {machine.cpu.split(' ')[0]} vCPU
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase font-mono text-gray-500">Uplink</span>
                      <span className="text-xs sm:text-sm font-semibold text-white truncate block">
                        {machine.networkSpeed.split(' ')[0]}
                      </span>
                    </div>
                  </div>

                  {/* Pricing Row */}
                  <div className="flex items-baseline justify-between pt-1">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-bold text-white tracking-tight">
                        {machine.hourlyPriceXlm} XLM
                      </span>
                      <span className="text-xs text-gray-400">/ hour</span>
                    </div>
                    <span className="text-xs font-mono text-gray-500">
                      &asymp; ${machine.hourlyPriceUsdc} USDC
                    </span>
                  </div>

                  {/* Optional Expanded Detailed Hardware Spec Drawer */}
                  {isExpanded && (
                    <div className="pt-3 border-t border-white/5 space-y-2 text-xs text-gray-400 animate-in fade-in duration-150">
                      {machine.gpu && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">GPU Unit:</span>
                          <span className="text-gray-200 text-right font-mono">{machine.gpu}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-500">Processor:</span>
                        <span className="text-gray-200 text-right font-mono">{machine.cpu}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">System RAM:</span>
                        <span className="text-gray-200 text-right font-mono">{machine.ram}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Storage:</span>
                        <span className="text-gray-200 text-right font-mono">{machine.storage}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Network:</span>
                        <span className="text-gray-200 text-right font-mono">{machine.networkSpeed}</span>
                      </div>
                    </div>
                  )}

                  {/* ACTIVE LEASE DETAILS (IF LEASED) */}
                  {isLeased && lease && (
                    <div className="rounded-xl bg-purple-950/20 border border-purple-500/20 p-3.5 flex flex-col gap-2 text-xs">
                      <div className="flex items-center justify-between text-purple-300 font-semibold">
                        <span className="flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-purple-400" />
                          Lease Verified On-Chain
                        </span>
                        <button
                          onClick={() => handleReleaseMachine(machine.id)}
                          title="Reset for testing"
                          className="text-[11px] text-gray-400 hover:text-white underline cursor-pointer"
                        >
                          Release Node
                        </button>
                      </div>

                      <div className="flex items-center justify-between text-gray-400">
                        <span>Agent Wallet:</span>
                        <span className="font-mono text-gray-300">
                          {lease.agentWallet.slice(0, 6)}...{lease.agentWallet.slice(-6)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-gray-400">
                        <span>Transaction Hash:</span>
                        <a
                          href={`https://stellar.expert/explorer/testnet/tx/${lease.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-cyan-300 hover:underline inline-flex items-center gap-1"
                        >
                          {lease.txHash.slice(0, 8)}...
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>

                      {/* SSH Command */}
                      <div className="mt-1 p-2 rounded-lg bg-black font-mono text-xs text-emerald-400 flex items-center justify-between border border-white/10">
                        <span className="truncate">{lease.sshCommand}</span>
                        <button
                          onClick={() => copyToClipboard(lease.sshCommand, `ssh-${machine.id}`)}
                          className="ml-2 text-gray-400 hover:text-white shrink-0 cursor-pointer"
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
                <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between gap-3">
                  {/* Copy CLI command pill */}
                  <button
                    onClick={() =>
                      copyToClipboard(`nelax rent ${machine.id}`, `cmd-${machine.id}`)
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-mono text-xs text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 transition-colors cursor-pointer"
                    title="Copy agent lease command"
                  >
                    {copiedKey === `cmd-${machine.id}` ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>nelax rent {machine.id}</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-2">
                    {/* Toggle Specs */}
                    <button
                      onClick={() =>
                        setExpandedCardId(isExpanded ? null : machine.id)
                      }
                      className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                      title={isExpanded ? 'Collapse specs' : 'Expand full specs'}
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>

                    {/* Inspect 402 Button */}
                    <button
                      onClick={() => setInspectMachine(machine)}
                      className="px-2.5 py-1.5 rounded-full text-xs font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                      title="Inspect x402 headers"
                    >
                      Inspect 402
                    </button>

                    {/* Primary Action Button */}
                    <button
                      onClick={() => startSimulation(machine)}
                      className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                        isLeased
                          ? 'bg-white/10 text-gray-300 hover:bg-white/20'
                          : 'bg-white hover:bg-gray-100 text-black shadow-sm'
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
        </div>

        {/* LIVE ON-CHAIN SETTLEMENT STREAM */}
        <div className="rounded-2xl border border-white/10 bg-[#0c0c0e] p-6 sm:p-8">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/5">
            <div className="flex items-center gap-2.5">
              <Activity className="w-5 h-5 text-gray-400" />
              <h3 className="text-lg font-bold text-white">Live On-Chain Settlement Stream</h3>
            </div>
            <span className="text-xs text-gray-400 flex items-center gap-1.5 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Horizon Stream Active
            </span>
          </div>

          <div className="divide-y divide-white/5 overflow-x-auto">
            {activities.length === 0 ? (
              <p className="text-xs text-gray-500 py-6 text-center">No transactions recorded yet.</p>
            ) : (
              activities.map((act) => (
                <div
                  key={act.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-white/[0.02] px-2 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                      <Zap className="w-4 h-4 text-cyan-300" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{act.machineName}</span>
                        <span className="font-mono text-[10px] text-gray-500">#{act.machineId}</span>
                      </div>
                      <div className="text-gray-400 text-[11px] flex items-center gap-2 mt-0.5">
                        <span>Agent:</span>
                        <span className="font-mono text-gray-300">
                          {act.agentWallet.slice(0, 6)}...{act.agentWallet.slice(-6)}
                        </span>
                        <span>&bull;</span>
                        <span>{new Date(act.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-end sm:self-center">
                    <div className="text-right">
                      <span className="font-bold text-emerald-400">+{act.amount} {act.asset}</span>
                      <div className="text-[10px] text-gray-500">x402 Micro-settlement</div>
                    </div>
                    <a
                      href={`https://stellar.expert/explorer/testnet/tx/${act.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white font-mono text-[11px] border border-white/5 transition-colors"
                    >
                      {act.txHash.slice(0, 8)}...
                      <ExternalLink className="w-3 h-3 opacity-60" />
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Shared Footer */}
      <Footer />

      {/* ========================================================= */}
      {/* MODAL 1: INTERACTIVE x402 LEASE SIMULATOR */}
      {/* ========================================================= */}
      {simulationMachine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-xl rounded-2xl border border-white/10 bg-[#0c0c0e] p-6 sm:p-8 shadow-2xl flex flex-col gap-6 text-white">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <Terminal className="w-4 h-4 text-cyan-300" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    x402 Autonomous Lease Simulator
                  </h3>
                  <p className="text-xs text-gray-400">
                    Demonstration of HTTP 402 challenge &amp; Stellar settlement via Pollar
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSimulationMachine(null)}
                className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Target Machine Summary */}
            <div className="p-3.5 rounded-xl bg-black border border-white/10 flex items-center justify-between text-xs">
              <div>
                <span className="text-gray-400">Target Node: </span>
                <strong className="text-white font-semibold">{simulationMachine.name}</strong>{' '}
                <span className="text-gray-500 font-mono">({simulationMachine.id})</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-white">{simulationMachine.hourlyPriceXlm} XLM</span>
                <span className="text-gray-400"> / hr</span>
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
                  className={`p-2 rounded-xl border text-[11px] font-medium transition-colors ${
                    simStep === s.step
                      ? 'bg-white text-black border-white font-semibold'
                      : simStep > s.step
                      ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                      : 'bg-white/5 border-white/5 text-gray-500'
                  }`}
                >
                  {s.label}
                </div>
              ))}
            </div>

            {/* Error Message if any */}
            {simError && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{simError}</span>
              </div>
            )}

            {/* Step 1: Initial Request */}
            {simStep === 1 && (
              <div className="flex flex-col gap-3 text-xs">
                <p className="text-gray-300">
                  The AI agent issues an unauthenticated HTTP request to lease the node without attaching any payment proof:
                </p>
                <div className="p-3 rounded-xl bg-black font-mono text-gray-300 border border-white/10 flex flex-col gap-1 text-[11px]">
                  <span className="text-cyan-300">POST /api/rent/{simulationMachine.id} HTTP/1.1</span>
                  <span className="text-gray-500">Host: nelax.nebulaz.xyz</span>
                  <span className="text-gray-500">Accept: application/json</span>
                  <span className="text-gray-500">X-Agent-Wallet: GCWDVYVPM7...5I7OS</span>
                </div>
                <button
                  onClick={executeSimStep1}
                  disabled={simLoading}
                  className="mt-2 w-full py-3 rounded-full bg-white hover:bg-gray-100 text-black font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
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
                <div className="flex items-center gap-2 text-yellow-300 font-medium">
                  <AlertCircle className="w-4 h-4" />
                  <span>HTTP 402 Payment Required Challenge Intercepted</span>
                </div>
                <div className="p-3 rounded-xl bg-black font-mono text-gray-300 border border-white/10 flex flex-col gap-1 max-h-44 overflow-y-auto text-[11px]">
                  <span className="text-yellow-400">HTTP/1.1 402 Payment Required</span>
                  <span className="text-gray-400">{simChallengeData.headers['WWW-Authenticate']}</span>
                  <pre className="text-emerald-400 text-[11px] mt-1">
                    {JSON.stringify(simChallengeData.body, null, 2)}
                  </pre>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-gray-400 text-[11px]">
                    Stellar Testnet Transaction Hash:
                  </label>
                  <input
                    type="text"
                    value={simCustomTxHash}
                    onChange={(e) => setSimCustomTxHash(e.target.value)}
                    placeholder="c8b5f729a3b7f1c7b8b36e9223ca917bb58c4d2ab2c525c1302591ecf3a40c30"
                    className="w-full px-3 py-2 rounded-lg bg-black border border-white/15 font-mono text-xs text-white focus:outline-none focus:border-white/40"
                  />
                </div>

                <button
                  onClick={executeSimStep2Payment}
                  disabled={simLoading}
                  className="mt-2 w-full py-3 rounded-full bg-white hover:bg-gray-100 text-black font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
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
                <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>On-Chain Settlement Confirmed on Stellar Horizon!</span>
                </div>

                <div className="p-3 rounded-xl bg-black font-mono text-gray-300 border border-white/10 flex flex-col gap-1 text-[11px]">
                  <span className="text-cyan-300">POST /api/rent/{simulationMachine.id} HTTP/1.1</span>
                  <span className="text-emerald-400">X-402-Payment-Hash: {simCustomTxHash}</span>
                  <span className="text-emerald-400">Authorization: x402 {simCustomTxHash}</span>
                </div>

                <button
                  onClick={executeSimStep3Unlock}
                  disabled={simLoading}
                  className="mt-2 w-full py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  {simLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Claim &amp; Provision Node with Proof</span>
                      <Unlock className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Step 4: Machine Successfully Unlocked */}
            {simStep === 4 && simProvisionResult && (
              <div className="flex flex-col gap-3 text-xs">
                <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 flex flex-col gap-1">
                  <div className="flex items-center gap-2 font-bold text-emerald-300 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Node Provisioned Successfully
                  </div>
                  <p className="text-xs text-gray-300">
                    SSH credentials cryptographically unlocked via x402 payment proof.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-black border border-white/10 flex flex-col gap-2 font-mono text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Host IP:</span>
                    <span className="text-gray-200">{simProvisionResult.ip}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">SSH Port:</span>
                    <span className="text-gray-200">{simProvisionResult.sshPort}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Username:</span>
                    <span className="text-gray-200">{simProvisionResult.username}</span>
                  </div>
                  <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between">
                    <span className="text-emerald-400 font-bold">{simProvisionResult.sshCommand}</span>
                    <button
                      onClick={() => copyToClipboard(simProvisionResult.sshCommand, 'modal-ssh')}
                      className="text-gray-400 hover:text-white cursor-pointer"
                    >
                      {copiedKey === 'modal-ssh' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => setSimulationMachine(null)}
                  className="mt-2 w-full py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-xl rounded-2xl border border-white/10 bg-[#0c0c0e] p-6 sm:p-8 shadow-2xl flex flex-col gap-5 text-white">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-2.5">
                <Code2 className="w-5 h-5 text-gray-400" />
                <h3 className="text-base font-bold text-white">x402 Protocol Specification</h3>
              </div>
              <button
                onClick={() => setInspectMachine(null)}
                className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed">
              When an agent requests <code className="text-gray-200">/api/rent/{inspectMachine.id}</code> without proof, the Nelax server issues standard HTTP 402 headers with Stellar Testnet destination and amount:
            </p>

            <div className="p-3.5 rounded-xl bg-black font-mono text-xs text-gray-300 border border-white/10 flex flex-col gap-1.5 overflow-x-auto">
              <span className="text-yellow-400 font-bold">HTTP/1.1 402 Payment Required</span>
              <span className="text-gray-400">Content-Type: application/json</span>
              <span className="text-cyan-300">
                WWW-Authenticate: X-402 destination=&quot;{providerWallet}&quot;, amount=&quot;{inspectMachine.hourlyPriceXlm}&quot;, asset=&quot;XLM&quot;, network=&quot;stellar:testnet&quot;
              </span>
              <span className="text-gray-500 mt-2">// JSON Challenge:</span>
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
                    `curl -i -X POST https://nelax.nebulaz.xyz/api/rent/${inspectMachine.id}`,
                    'curl-test',
                  )
                }
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition-colors cursor-pointer"
              >
                {copiedKey === 'curl-test' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                Copy cURL Command
              </button>

              <button
                onClick={() => setInspectMachine(null)}
                className="px-5 py-1.5 rounded-full bg-white hover:bg-gray-100 text-xs font-semibold text-black cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* DRAWER: AGENT INTEGRATION QUICKSTART */}
      {/* ========================================================= */}
      {showQuickstartDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg h-full bg-[#0c0c0e] border-l border-white/10 p-6 sm:p-8 flex flex-col gap-6 overflow-y-auto text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-2.5">
                <Terminal className="w-5 h-5 text-gray-400" />
                <h3 className="text-base font-bold text-white">Agent Integration Guide</h3>
              </div>
              <button
                onClick={() => setShowQuickstartDrawer(false)}
                className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Step 1: CLI */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-300">
                1. Nelax Agent CLI
              </span>
              <p className="text-xs text-gray-400">
                Authenticate your agent wallet via email OTP and inspect balance:
              </p>
              <div className="p-3.5 rounded-xl bg-black font-mono text-xs text-gray-300 border border-white/10 flex flex-col gap-1.5">
                <span className="text-gray-500"># Authenticate wallet via Pollar</span>
                <span className="text-emerald-400">$ nelax login agent@nelax.xyz</span>
                <span className="text-emerald-400">$ nelax verify &lt;code&gt;</span>
                <span className="text-gray-500 mt-2"># Check balance on Stellar Horizon</span>
                <span className="text-emerald-400">$ nelax wallet --json</span>
                <span className="text-gray-500 mt-2"># Discover and lease compute</span>
                <span className="text-emerald-400">$ nelax discover --json</span>
                <span className="text-emerald-400">$ nelax rent gpu-h100-01</span>
              </div>
            </div>

            {/* Step 2: Protocol Flow */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-300">
                2. Autonomous Settlement Flow
              </span>
              <div className="p-3.5 rounded-xl bg-black border border-white/10 text-xs text-gray-300 flex flex-col gap-2 leading-relaxed">
                <p>
                  <strong>Step 1:</strong> Agent requests <code className="text-gray-200">POST /api/rent/&lt;id&gt;</code>.
                </p>
                <p>
                  <strong>Step 2:</strong> Nelax returns <code className="text-yellow-300">HTTP 402 Payment Required</code> with recipient Stellar wallet and XLM price.
                </p>
                <p>
                  <strong>Step 3:</strong> Agent signs and broadcasts payment via Pollar onto the Stellar Testnet.
                </p>
                <p>
                  <strong>Step 4:</strong> Agent retries request with header <code className="text-emerald-400">X-402-Payment-Hash: &lt;tx_hash&gt;</code>. Server verifies on Horizon and provisions SSH credentials.
                </p>
              </div>
            </div>

            {/* Step 3: SKILL.md */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-300">
                3. Universal AI Agent Skill
              </span>
              <p className="text-xs text-gray-400">
                Place <code className="text-gray-300">SKILL.md</code> in your agent&apos;s workspace to equip it with autonomous Stellar capabilities:
              </p>
              <div className="p-3.5 rounded-xl bg-black font-mono text-xs text-gray-400 border border-white/10">
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
              className="mt-auto w-full py-3 rounded-full bg-white hover:bg-gray-100 text-black font-semibold text-xs transition-colors cursor-pointer"
            >
              Close Documentation
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
