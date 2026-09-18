import { NextResponse } from 'next/server';
import { computeStore } from '@/lib/compute-store';

export async function GET() {
  const machines = computeStore.getMachines();
  const activities = computeStore.getActivities();

  const totalCapacityVram = machines.reduce((acc, m) => {
    if (m.vram) {
      const match = m.vram.match(/(\d+)\s*GB/i);
      if (match) return acc + parseInt(match[1], 10);
    }
    return acc;
  }, 0);

  const availableCount = machines.filter((m) => m.status === 'available').length;
  const leasedCount = machines.filter((m) => m.status === 'leased').length;

  return NextResponse.json({
    success: true,
    network: 'stellar:testnet',
    providerWallet: process.env.NELAX_PROVIDER_WALLET || 'GCWDVYVPM7ORTD5INWSP3C5TRV5TRBEIHZWY3K4HS3STLKJE5I7OSMVB',
    stats: {
      totalNodes: machines.length,
      availableNodes: availableCount,
      leasedNodes: leasedCount,
      totalVramGb: totalCapacityVram,
      totalLeasesCount: activities.length,
    },
    machines,
    recentActivity: activities.slice(0, 10),
  });
}
