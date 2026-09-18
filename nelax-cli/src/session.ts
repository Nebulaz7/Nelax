import Conf from 'conf';
import type { NelaxSession } from './types.js';

const config = new Conf<NelaxSession>({
  projectName: 'nelax',
  defaults: {
    network: 'testnet',
    updatedAt: new Date().toISOString(),
    verified: false,
  },
});

export function getSession(): NelaxSession | null {
  const address = config.get('walletAddress');
  const clientSessionId = config.get('clientSessionId');
  if (!address && !clientSessionId) {
    return null;
  }
  return {
    email: config.get('email'),
    clientSessionId,
    sessionToken: config.get('sessionToken'),
    walletAddress: address,
    network: config.get('network') || 'testnet',
    updatedAt: config.get('updatedAt') || new Date().toISOString(),
    verified: config.get('verified') ?? false,
  };
}

export function saveSession(updates: Partial<NelaxSession>): NelaxSession {
  if (updates.email !== undefined) config.set('email', updates.email);
  if (updates.clientSessionId !== undefined) config.set('clientSessionId', updates.clientSessionId);
  if (updates.sessionToken !== undefined) config.set('sessionToken', updates.sessionToken);
  if (updates.walletAddress !== undefined) config.set('walletAddress', updates.walletAddress);
  if (updates.network !== undefined) config.set('network', updates.network);
  if (updates.verified !== undefined) config.set('verified', updates.verified);
  config.set('updatedAt', new Date().toISOString());

  return getSession()!;
}

export function clearSession(): void {
  config.clear();
}

export function hasSession(): boolean {
  return Boolean(config.get('walletAddress'));
}

export function getSessionPath(): string {
  return config.path;
}
