import type { NelaxSession, ComputeLease, X402Challenge } from './types.js';
import { pollarService } from './pollar.js';

export interface X402FetchOptions {
  method?: 'GET' | 'POST';
  body?: any;
  headers?: Record<string, string>;
  onStatus?: (message: string) => void;
}

export class X402PaymentClient {
  /**
   * Performs an autonomous x402 fetch:
   * 1. Hits the resource endpoint.
   * 2. Detects HTTP 402 Payment Required.
   * 3. Parses payment parameters (destination, amount, asset).
   * 4. Settles the payment on Stellar Testnet via Pollar.
   * 5. Retries the request with payment proof (X-402-Payment-Hash).
   * 6. Returns the unlocked compute credentials.
   */
  async rentCompute(
    endpointUrl: string,
    session: NelaxSession,
    options: X402FetchOptions = {}
  ): Promise<ComputeLease> {
    const { onStatus } = options;
    const method = options.method || 'POST';

    onStatus?.(`Connecting to compute endpoint: ${endpointUrl}`);

    const initialHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Agent-Wallet': session.walletAddress || '',
      ...(options.headers || {}),
    };

    // Step 1: Initial Request
    const initialRes = await fetch(endpointUrl, {
      method,
      headers: initialHeaders,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    // If already authorized (200 OK)
    if (initialRes.status === 200) {
      onStatus?.('Access granted immediately without payment requirement.');
      return await initialRes.json();
    }

    // Step 2: Detect 402 Payment Required
    if (initialRes.status !== 402) {
      const errText = await initialRes.text().catch(() => '');
      throw new Error(`Unexpected response (${initialRes.status}): ${errText || initialRes.statusText}`);
    }

    onStatus?.('HTTP 402 Payment Required received. Parsing payment challenge...');

    // Step 3: Parse Challenge details from JSON body or Headers
    let challenge: X402Challenge;
    try {
      const body = await initialRes.json();
      challenge = {
        destination: body.destination || body.recipient || body.payTo,
        amount: String(body.amount || '0.05'),
        asset: body.asset || 'USDC',
        network: body.network || 'stellar:testnet',
        resourceId: body.resourceId || body.machineId,
      };
    } catch {
      throw new Error('Failed to parse 402 Payment Required challenge payload from server');
    }

    if (!challenge.destination) {
      throw new Error('402 Challenge did not specify a recipient destination address');
    }

    onStatus?.(
      `Autonomous Payment Required: ${challenge.amount} ${challenge.asset} to ${challenge.destination.slice(0, 8)}...`
    );

    // Step 4: Autonomous Settlement on Stellar Testnet
    onStatus?.('Signing and submitting payment via Pollar on Stellar Testnet...');
    const paymentResult = await pollarService.sendPayment(
      challenge.destination,
      challenge.amount,
      challenge.asset
    );

    onStatus?.(`Payment settled! Tx Hash: ${paymentResult.hash.slice(0, 12)}...`);

    // Step 5: Retry request with payment proof
    onStatus?.('Retrying compute request with cryptographic payment proof...');
    const retryHeaders: Record<string, string> = {
      ...initialHeaders,
      'Authorization': `x402 ${paymentResult.hash}`,
      'X-402-Payment-Hash': paymentResult.hash,
      'X-402-Network': 'stellar:testnet',
      'X-Agent-Wallet': session.walletAddress || '',
    };

    const retryRes = await fetch(endpointUrl, {
      method,
      headers: retryHeaders,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    if (!retryRes.ok) {
      const failText = await retryRes.text().catch(() => '');
      throw new Error(`Failed to claim resource after payment (${retryRes.status}): ${failText}`);
    }

    const computeData: any = await retryRes.json();
    onStatus?.('Compute resource successfully unlocked and provisioned!');

    const lease: ComputeLease = {
      machineId: computeData.machineId || challenge.resourceId || 'node-cloud',
      name: computeData.name || 'Cloud Compute Node',
      ip: computeData.ip || '198.51.100.42',
      sshPort: computeData.sshPort || 2202,
      username: computeData.username || 'agent',
      authToken: computeData.authToken || 'token_' + paymentResult.hash.slice(0, 16),
      leaseExpiresAt: computeData.leaseExpiresAt || new Date(Date.now() + 3600 * 1000).toISOString(),
      sshCommand:
        computeData.sshCommand ||
        `ssh ${computeData.username || 'agent'}@${computeData.ip || '198.51.100.42'} -p ${computeData.sshPort || 2202}`,
      txHash: paymentResult.hash,
    };

    return lease;
  }
}

export const x402Client = new X402PaymentClient();
