export interface NelaxSession {
  email?: string;
  clientSessionId?: string;
  sessionToken?: string;
  walletAddress?: string;
  network: 'testnet' | 'mainnet';
  updatedAt: string;
  verified: boolean;
}

export interface BalanceInfo {
  asset: string;
  balance: string;
  code?: string;
  issuer?: string;
  isNative: boolean;
}

export interface WalletOverview {
  address: string;
  network: string;
  balances: BalanceInfo[];
  explorerUrl: string;
}

export interface PaymentResult {
  hash: string;
  status: 'success' | 'pending' | 'error';
  explorerUrl: string;
  amount: string;
  asset: string;
  destination: string;
  timestamp: string;
}

export interface X402Challenge {
  destination: string;
  amount: string;
  asset: string;
  network: string;
  memo?: string;
  resourceId?: string;
}

export interface ComputeLease {
  machineId: string;
  name?: string;
  ip: string;
  sshPort: number;
  username: string;
  authToken: string;
  leaseExpiresAt: string;
  sshCommand: string;
  txHash: string;
}
