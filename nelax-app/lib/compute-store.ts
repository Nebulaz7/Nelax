export interface MachineSpec {
  id: string;
  name: string;
  tagline: string;
  category: 'GPU' | 'Apple Silicon' | 'High-Compute CPU';
  gpu?: string;
  vram?: string;
  cpu: string;
  ram: string;
  storage: string;
  networkSpeed: string;
  hourlyPriceXlm: string;
  hourlyPriceUsdc: string;
  destinationWallet: string;
  status: 'available' | 'leased';
  currentLease?: {
    agentWallet: string;
    txHash: string;
    leaseExpiresAt: string;
    ip: string;
    sshPort: number;
    username: string;
    authToken: string;
    sshCommand: string;
  };
}

export interface ActivityItem {
  id: string;
  timestamp: string;
  machineId: string;
  machineName: string;
  agentWallet: string;
  amount: string;
  asset: string;
  txHash: string;
  status: 'provisioned' | 'active';
}

const DEFAULT_PROVIDER_WALLET =
  process.env.NELAX_PROVIDER_WALLET || 'GCWDVYVPM7ORTD5INWSP3C5TRV5TRBEIHZWY3K4HS3STLKJE5I7OSMVB';

// In-memory compute cluster inventory
const INITIAL_MACHINES: MachineSpec[] = [
  {
    id: 'gpu-h100-01',
    name: 'NVIDIA H100 80GB SXM5',
    tagline: 'Ultra-low latency LLM fine-tuning & high-throughput inference',
    category: 'GPU',
    gpu: '1x NVIDIA H100 SXM5 80GB HBM3',
    vram: '80 GB (3.35 TB/s)',
    cpu: '112 vCPU (AMD EPYC 9654)',
    ram: '480 GB DDR5 ECC',
    storage: '2x 3.84 TB NVMe Gen5 (RAID 0)',
    networkSpeed: '100 Gbps InfiniBand NDR',
    hourlyPriceXlm: '5.0',
    hourlyPriceUsdc: '1.25',
    destinationWallet: DEFAULT_PROVIDER_WALLET,
    status: 'available',
  },
  {
    id: 'gpu-4090-02',
    name: 'NVIDIA RTX 4090 24GB',
    tagline: 'Standard agent compute for code generation, local embeddings & batch tasks',
    category: 'GPU',
    gpu: '1x NVIDIA RTX 4090 24GB GDDR6X',
    vram: '24 GB (1.0 TB/s)',
    cpu: '24 vCPU (Intel Xeon Platinum)',
    ram: '64 GB DDR5',
    storage: '1 TB NVMe SSD',
    networkSpeed: '10 Gbps Uplink',
    hourlyPriceXlm: '1.0',
    hourlyPriceUsdc: '0.25',
    destinationWallet: DEFAULT_PROVIDER_WALLET,
    status: 'available',
  },
  {
    id: 'apple-m3-03',
    name: 'Apple Silicon M3 Ultra',
    tagline: 'High unified memory pool for massive context window KV-cache exploration',
    category: 'Apple Silicon',
    gpu: '76-Core Metal GPU Core Acceleration',
    vram: '128 GB Unified LPDDR5',
    cpu: '24-Core (16 Perf + 8 Eff)',
    ram: '128 GB Unified (800 GB/s)',
    storage: '2 TB APFS Flash',
    networkSpeed: '10 Gbps Ethernet',
    hourlyPriceXlm: '2.5',
    hourlyPriceUsdc: '0.60',
    destinationWallet: DEFAULT_PROVIDER_WALLET,
    status: 'available',
  },
  {
    id: 'cpu-epyc-04',
    name: 'AMD EPYC 9654 High-Compute',
    tagline: 'High parallelism node for compilation, recursive web crawling & verification',
    category: 'High-Compute CPU',
    cpu: '64 vCPU (x86_64 AVX-512)',
    ram: '256 GB DDR5 Multi-Channel',
    storage: '1.92 TB NVMe',
    networkSpeed: '25 Gbps Fiber',
    hourlyPriceXlm: '1.0',
    hourlyPriceUsdc: '0.25',
    destinationWallet: DEFAULT_PROVIDER_WALLET,
    status: 'available',
  },
];

// Initial activity feed preloaded with real Stellar Testnet transactions executed during testing
const INITIAL_ACTIVITIES: ActivityItem[] = [
  {
    id: 'act-01',
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    machineId: 'gpu-4090-02',
    machineName: 'NVIDIA RTX 4090 24GB',
    agentWallet: 'GCWDVYVPM7ORTD5INWSP3C5TRV5TRBEIHZWY3K4HS3STLKJE5I7OSMVB',
    amount: '1.0',
    asset: 'XLM',
    txHash: 'c8b5f729a3b7f1c7b8b36e9223ca917bb58c4d2ab2c525c1302591ecf3a40c30',
    status: 'active',
  },
  {
    id: 'act-02',
    timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    machineId: 'gpu-h100-01',
    machineName: 'NVIDIA H100 80GB SXM5',
    agentWallet: 'GCWDVYVPM7ORTD5INWSP3C5TRV5TRBEIHZWY3K4HS3STLKJE5I7OSMVB',
    amount: '20.0',
    asset: 'XLM',
    txHash: '5eb109dfd0ad6ab37bf82fa977ffc123fd3e8f05b1dcfbd2c0c7c344b1cf8c69',
    status: 'active',
  },
];

// Global in-memory singleton across hot-reloads in Next.js development server
declare global {
  // eslint-disable-next-line no-var
  var __nelax_machines: MachineSpec[] | undefined;
  // eslint-disable-next-line no-var
  var __nelax_activities: ActivityItem[] | undefined;
}

if (!globalThis.__nelax_machines) {
  globalThis.__nelax_machines = [...INITIAL_MACHINES];
}
if (!globalThis.__nelax_activities) {
  globalThis.__nelax_activities = [...INITIAL_ACTIVITIES];
}

export const computeStore = {
  getMachines(): MachineSpec[] {
    return globalThis.__nelax_machines!;
  },

  getMachineById(id: string): MachineSpec | undefined {
    return globalThis.__nelax_machines!.find((m) => m.id.toLowerCase() === id.toLowerCase());
  },

  getActivities(): ActivityItem[] {
    return globalThis.__nelax_activities!;
  },

  leaseMachine(
    id: string,
    agentWallet: string,
    txHash: string
  ): { success: boolean; machine?: MachineSpec; error?: string } {
    const machine = this.getMachineById(id);
    if (!machine) {
      return { success: false, error: `Compute node '${id}' not found in inventory` };
    }

    const leaseDurationHours = 1;
    const expiresAt = new Date(Date.now() + leaseDurationHours * 3600 * 1000).toISOString();
    const mockOctet = (Math.abs(txHash.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)) % 150) + 50;
    const ip = `142.250.190.${mockOctet}`;
    const sshPort = 2222;
    const username = 'agent-nelax';
    const authToken = `lease_sec_${txHash.slice(0, 16)}`;
    const sshCommand = `ssh -p ${sshPort} ${username}@${ip}`;

    machine.status = 'leased';
    machine.currentLease = {
      agentWallet,
      txHash,
      leaseExpiresAt: expiresAt,
      ip,
      sshPort,
      username,
      authToken,
      sshCommand,
    };

    // Prepend to activity feed
    globalThis.__nelax_activities!.unshift({
      id: `act-${Date.now()}`,
      timestamp: new Date().toISOString(),
      machineId: machine.id,
      machineName: machine.name,
      agentWallet,
      amount: machine.hourlyPriceXlm,
      asset: 'XLM',
      txHash,
      status: 'active',
    });

    return { success: true, machine };
  },

  releaseMachine(id: string): boolean {
    const machine = this.getMachineById(id);
    if (!machine) return false;
    machine.status = 'available';
    delete machine.currentLease;
    return true;
  },
};
