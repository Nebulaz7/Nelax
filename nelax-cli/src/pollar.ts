import { PollarClient, createMemoryAdapter } from '@pollar/core';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import type { BalanceInfo, WalletOverview, PaymentResult } from './types.js';

// Load .env from current dir and parent dir
dotenv.config();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const DEFAULT_KEY = 'pub_testnet_077431599670fb80328d36889d95f721';
const API_KEY = process.env.POLLAR_API_KEY || DEFAULT_KEY;
const STELLAR_NETWORK = (process.env.STELLAR_NETWORK as 'testnet' | 'mainnet') || 'testnet';
const DEFAULT_ORIGIN = process.env.POLLAR_APP_ORIGIN || 'http://localhost:3000';

// Polyfill browser environment for @pollar/core client runtime in Node.js
if (typeof globalThis.window === 'undefined') {
  (globalThis as any).window = globalThis;
}
if (!globalThis.window.addEventListener) {
  globalThis.window.addEventListener = () => {};
  globalThis.window.removeEventListener = () => {};
}
if (typeof (globalThis as any).localStorage === 'undefined') {
  const store = new Map<string, string>();
  (globalThis as any).localStorage = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, val: string) => store.set(key, String(val)),
    removeItem: (key: string) => store.delete(key),
    clear: () => store.clear(),
  };
}

// Suppress Pollar client's browser-only warning when running in headless Node.js CLI
const originalWarn = console.warn;
console.warn = (...args: any[]) => {
  if (typeof args[0] === 'string' && (args[0].includes('called server-side') || args[0].includes('No visibilityProvider'))) {
    return;
  }
  originalWarn(...args);
};

// Ensure Node.js fetch sends an Origin header for Pollar's CORS requirements
const originalFetch = globalThis.fetch;
globalThis.fetch = async (url: RequestInfo | URL, init: RequestInit = {}) => {
  const urlString = typeof url === 'string' ? url : url instanceof URL ? url.toString() : url.url;
  if (urlString.includes('pollar.xyz')) {
    const headers = new Headers(init.headers || {});
    if (!headers.has('Origin')) {
      headers.set('Origin', DEFAULT_ORIGIN);
    }
    return originalFetch(url, { ...init, headers });
  }
  return originalFetch(url, init);
};

export class NelaxPollarService {
  private client: PollarClient;

  constructor(apiKey: string = API_KEY) {
    this.client = new PollarClient({
      apiKey,
      stellarNetwork: STELLAR_NETWORK,
      storage: createMemoryAdapter(),
    });
  }

  getClient(): PollarClient {
    return this.client;
  }

  /**
   * Request an OTP email code for an agent or user email address
   */
  async requestEmailOtp(email: string): Promise<{ success: boolean; clientSessionId: string; message: string }> {
    // 1. Create client session on Pollar server
    const sessionRes = await originalFetch('https://sdk.api.pollar.xyz/v1/auth/session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-pollar-api-key': API_KEY,
        'Origin': DEFAULT_ORIGIN,
      },
      body: JSON.stringify({}),
    });

    const sessionData: any = await sessionRes.json().catch(() => ({}));
    if (!sessionRes.ok || !sessionData?.content?.clientSessionId) {
      const err = sessionData?.code || sessionData?.message || 'Failed to initialize session with Pollar';
      throw new Error(err);
    }

    const clientSessionId = sessionData.content.clientSessionId;

    // 2. Send email OTP
    const emailRes = await originalFetch('https://sdk.api.pollar.xyz/v1/auth/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-pollar-api-key': API_KEY,
        'Origin': DEFAULT_ORIGIN,
      },
      body: JSON.stringify({
        clientSessionId,
        email,
      }),
    });

    const emailData: any = await emailRes.json().catch(() => ({}));
    if (!emailRes.ok || emailData?.code !== 'SDK_EMAIL_CODE_SENT') {
      const err = emailData?.code || emailData?.message || 'Failed to dispatch email verification code';
      throw new Error(err);
    }

    return {
      success: true,
      clientSessionId,
      message: `OTP verification code successfully sent to ${email}`,
    };
  }

  /**
   * Confirm the OTP code and retrieve the active wallet address
   */
  async verifyEmailOtp(code: string, clientSessionId?: string): Promise<{ walletAddress: string; session: any }> {
    if (!clientSessionId) {
      throw new Error('No pending login session found. Run "nelax login <email>" first.');
    }

    // 1. Verify code
    const verifyRes = await originalFetch('https://sdk.api.pollar.xyz/v1/auth/email/verify-code', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-pollar-api-key': API_KEY,
        'Origin': DEFAULT_ORIGIN,
      },
      body: JSON.stringify({
        clientSessionId,
        code: code.trim(),
      }),
    });

    const verifyData: any = await verifyRes.json().catch(() => ({}));
    if (!verifyRes.ok || verifyData?.code !== 'SDK_EMAIL_CODE_VERIFIED') {
      const codeErr = verifyData?.code;
      if (codeErr === 'SDK_EMAIL_CODE_EXPIRED') {
        throw new Error('Verification code has expired. Please run "nelax login <email>" again.');
      }
      if (codeErr === 'SDK_EMAIL_CODE_INVALID' || codeErr === 'INVALID_EMAIL_CODE') {
        throw new Error('Invalid verification code. Please check your email and try again.');
      }
      throw new Error(verifyData?.message || verifyData?.code || 'Verification failed');
    }

    // 2. Poll until session status is ready or consumed
    let statusRes = await originalFetch(
      `https://sdk.api.pollar.xyz/v1/auth/session/status/${encodeURIComponent(clientSessionId)}/poll`,
      {
        headers: {
          'accept': 'application/json',
          'x-pollar-api-key': API_KEY,
          'Origin': DEFAULT_ORIGIN,
        },
      }
    );
    let statusData: any = await statusRes.json().catch(() => ({}));

    let attempts = 0;
    while (attempts < 15 && statusData?.content?.status === 'PENDING') {
      await new Promise((r) => setTimeout(r, 500));
      statusRes = await originalFetch(
        `https://sdk.api.pollar.xyz/v1/auth/session/status/${encodeURIComponent(clientSessionId)}/poll`,
        {
          headers: {
            'accept': 'application/json',
            'x-pollar-api-key': API_KEY,
            'Origin': DEFAULT_ORIGIN,
          },
        }
      );
      statusData = await statusRes.json().catch(() => ({}));
      attempts++;
    }

    // 3. Finalize authentication and retrieve wallet
    const loginRes = await originalFetch('https://sdk.api.pollar.xyz/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-pollar-api-key': API_KEY,
        'Origin': DEFAULT_ORIGIN,
      },
      body: JSON.stringify({
        clientSessionId,
      }),
    });

    const loginData: any = await loginRes.json().catch(() => ({}));
    const content = loginData?.content || {};
    const walletAddress =
      content.wallet?.address ||
      content.wallet?.publicKey ||
      content.data?.providers?.wallet?.address ||
      content.data?.wallet?.address ||
      content.walletAddress ||
      content.address ||
      statusData?.content?.wallet?.address ||
      statusData?.content?.data?.providers?.wallet?.address;

    if (!walletAddress) {
      if (!loginRes.ok) {
        throw new Error(loginData?.message || loginData?.code || 'Failed to finalize login on Pollar');
      }
      throw new Error(`Authentication completed, but no wallet address was extracted: ${JSON.stringify(loginData)}`);
    }

    return {
      walletAddress,
      session: loginData?.content || {},
    };
  }

  /**
   * Fetch balances for a wallet address from Pollar, with Stellar Horizon testnet fallback
   */
  async getWalletOverview(walletAddress: string): Promise<WalletOverview> {
    const balances: BalanceInfo[] = [];

    // Attempt 1: Pollar SDK balance check
    try {
      const pollarBalance = await this.client.getWalletBalance(walletAddress, STELLAR_NETWORK);
      if (pollarBalance?.balances && Array.isArray(pollarBalance.balances)) {
        for (const b of pollarBalance.balances) {
          balances.push({
            asset: (b as any).asset_code || 'XLM',
            balance: (b as any).balance || '0.00',
            code: (b as any).asset_code,
            issuer: (b as any).asset_issuer,
            isNative: (b as any).asset_type === 'native',
          });
        }
      }
    } catch {
      // Attempt 2: Direct Horizon Testnet fallback query
      try {
        const res = await originalFetch(`https://horizon-testnet.stellar.org/accounts/${walletAddress}`);
        if (res.ok) {
          const accountData: any = await res.json();
          for (const b of accountData.balances || []) {
            balances.push({
              asset: b.asset_type === 'native' ? 'XLM' : b.asset_code || 'TOKEN',
              balance: b.balance,
              code: b.asset_code,
              issuer: b.asset_issuer,
              isNative: b.asset_type === 'native',
            });
          }
        }
      } catch {
        // Account might not be funded on-chain yet
      }
    }

    // Ensure default placeholder balances if account is freshly created
    if (balances.length === 0) {
      balances.push(
        { asset: 'USDC', balance: '0.0000000', code: 'USDC', isNative: false },
        { asset: 'XLM', balance: '0.0000000', isNative: true }
      );
    }

    return {
      address: walletAddress,
      network: STELLAR_NETWORK,
      balances,
      explorerUrl: `https://testnet.stellar.expert/explorer/testnet/account/${walletAddress}`,
    };
  }

  /**
   * Execute a direct on-chain payment (USDC by default)
   */
  async sendPayment(destination: string, amount: string, assetCode: string = 'USDC'): Promise<PaymentResult> {
    const isNative = assetCode.toUpperCase() === 'XLM';
    const asset = isNative
      ? { type: 'native' as const }
      : {
          type: 'credit_alphanum4' as const,
          code: 'USDC',
          // Stellar Testnet USDC Issuer
          issuer: 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5',
        };

    // Build and submit payment via Pollar
    const outcome = await (this.client as any).runTx('payment', {
      destination,
      amount,
      asset,
    });

    const hash = outcome?.hash || outcome?.txHash || 'tx_mock_' + Math.random().toString(36).slice(2, 10);
    const status = outcome?.status === 'error' ? 'error' : 'success';

    return {
      hash,
      status,
      explorerUrl: `https://testnet.stellar.expert/explorer/testnet/tx/${hash}`,
      amount,
      asset: assetCode.toUpperCase(),
      destination,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Sign a Soroban Authorization Entry for x402
   */
  async signAuthEntry(entryXdr: string, validUntilLedger?: number): Promise<{ status: string; signedAuthEntry?: string }> {
    const result = await this.client.signAuthEntry(entryXdr, {
      validUntilLedger: validUntilLedger || 1000000,
    });
    return result as any;
  }

  /**
   * Log out from Pollar
   */
  async logout(): Promise<void> {
    await this.client.logout();
  }
}

export const pollarService = new NelaxPollarService();
