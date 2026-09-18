---
name: nelax
description: Autonomous Stellar AI Agent Wallets and x402 HTTP Payment Protocol CLI for renting compute, paying API endpoints, and managing non-custodial testnet balances.
version: 1.0.0
author: Nelax Team (Pollar Hackathon 2026)
tools:
  - nelax
---

# Nelax: Autonomous AI Agent Wallets & x402 Compute Rental

Nelax empowers AI agents (Claude Code, OpenClaw, Hermes Agent, Antigravity, and autonomous subagents) with non-custodial **Stellar Testnet** wallets powered by **Pollar** and native **x402 Payment-Required** compute provisioning.

With Nelax, agents can pay for their own resources, rent on-demand GPU/cloud servers, and interact on-chain without human credit cards or UI bottlenecks.

---

## Agent Quick Reference

All CLI commands support `--json` for direct, structured ingestion by LLMs and agent runtimes.

| Action | Command | Expected Output |
|---|---|---|
| **Help & Capabilities** | `nelax --help` | Complete command list and usage guides |
| **Check Wallet & Balances** | `nelax wallet --json` | JSON with G-address, XLM balance, USDC balance, explorer URL |
| **Fund with Testnet XLM** | `nelax fund` | Free +10,000 XLM from Stellar Testnet Friendbot |
| **Rent GPU/Cloud Compute** | `nelax rent <machine-id> --json` | Handles HTTP 402, executes Stellar payment, returns SSH login |
| **Generic x402 API Fetch** | `nelax fetch <url> --json` | Resolves HTTP 402 challenge automatically and returns payload |
| **Send On-Chain Payment** | `nelax pay <address> <amount> [asset] --json` | Submits Stellar transaction and returns tx hash |
| **Transaction History** | `nelax history --json` | On-chain ledger operations and payment records |
| **Agent Login (OTP)** | `nelax login <email>` | Dispatches one-time verification code |
| **Verify & Activate** | `nelax verify <code> --json` | Confirms session and auto-funds wallet |

---

## Agent Usage Recipes

### 1. Check Wallet State & Balances
```bash
nelax wallet --json
```
**JSON Schema:**
```json
{
  "address": "GCWDVYVPM7ORTD5INWSP3C5TRV5TRBEIHZWY3K4HS3STLKJE5I7OSMVB",
  "network": "testnet",
  "balances": [
    {
      "asset": "XLM",
      "balance": "10000.0000000",
      "isNative": true
    }
  ],
  "explorerUrl": "https://stellar.expert/explorer/testnet/account/GCWDVYVPM7ORTD5INWSP3C5TRV5TRBEIHZWY3K4HS3STLKJE5I7OSMVB"
}
```

---

### 2. Auto-Rent GPU Compute via x402
When an agent encounters a compute-intensive task (e.g. model fine-tuning, heavy compilation, data scraping), it can provision an isolated VM instantly:
```bash
nelax rent gpu-h100-01 --json
```
**x402 Protocol Flow:**
1. Agent sends `POST /api/rent/gpu-h100-01`
2. Server responds `HTTP 402 Payment Required` with invoice `{ destination, amount: 0.05, asset: "USDC", network: "stellar:testnet" }`
3. Nelax CLI autonomously signs & submits the Stellar Testnet payment
4. Nelax CLI retries the request with `X-402-Payment-Hash: <txHash>`
5. Server validates transaction and provisions machine, returning `HTTP 200 OK` with SSH credentials:

```json
{
  "machineId": "gpu-h100-01",
  "name": "NVIDIA H100 SXM5 Node",
  "ip": "138.199.36.42",
  "sshPort": 2222,
  "username": "agent-nelax",
  "authToken": "lease_sec_99a81f...",
  "leaseExpiresAt": "2026-09-18T05:15:00.000Z",
  "txHash": "7b88fa90...",
  "sshCommand": "ssh -p 2222 agent-nelax@138.199.36.42"
}
```
The agent can immediately execute commands on the remote instance using `ssh`.

---

### 3. Fetch Behind a Paywalled API (x402)
```bash
nelax fetch https://marketplace.nelax.ai/api/datasets/finetune-weights --json
```

---

### 4. Direct Micro-Payment to Counterparty
```bash
nelax pay GCWDVYVPM7ORTD5INWSP3C5TRV5TRBEIHZWY3K4HS3STLKJE5I7OSMVB 1.5 XLM --json
```

---

## Session Persistence & Security
- Sessions are stored in the user config directory: `~/.nelax/session.json`.
- Private keys and signing logic are managed through **Pollar's non-custodial smart wallet infrastructure**.
- Stellar Network: **Stellar Testnet** (`stellar:testnet`).
- Explorer: `https://stellar.expert/explorer/testnet/`
