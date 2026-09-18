# Nelax CLI (`nelax`)

> **Autonomous AI Agent Wallets & x402 Cloud/GPU Compute Payments on Stellar Testnet**  
> Powered by [Pollar](https://pollar.xyz) (`@pollar/core`) and the **x402 HTTP Payment Required** Protocol.

---

## 🚀 Quickstart

Run directly without installation via `npx`:

```bash
npx nelax --help
```

Or install globally:

```bash
npm install -g nelax
```

---

## ⚡ Features

- 🤖 **Autonomous Agent Authentication**: Headless email OTP login (`nelax login` & `nelax verify`). No human browser clicks required.
- 💳 **Non-Custodial Stellar Wallets**: Instant G-address wallet deployment with automatic Friendbot funding (`nelax fund`).
- 💰 **Direct Payments**: Send on-chain testnet USDC or XLM payments to any Stellar address (`nelax pay <dest> <amount> [asset]`).
- 🖥️ **x402 Autonomous Compute Leasing**:
  - Discover available GPU/CPU clusters (`nelax discover`).
  - Automatically negotiate HTTP 402 challenges, sign and broadcast transactions, and receive SSH credentials (`nelax rent <machineId>`).
- 🌐 **Generic x402 Fetch**: Autonomous HTTP client that detects HTTP 402, parses payment requirements, pays via Pollar, and retries with cryptographic proof (`nelax fetch <url>`).
- 📜 **On-Chain Audit Trail**: Query complete ledger payment records and transaction hashes directly on Stellar Horizon (`nelax history`).
- 🤖 **LLM / Agent Native**: Every command supports `--json` for direct ingestion by Claude Code, OpenClaw, Hermes Agent, and Antigravity.

---

## 📖 Command Reference

### 1. Authenticate Wallet (Headless Email OTP)
```bash
# Request OTP code
nelax login agent@nelax.xyz

# Verify code & activate wallet
nelax verify 123456
```

### 2. Inspect Balances
```bash
nelax wallet
# Or structured JSON for LLMs:
nelax wallet --json
```

### 3. Fund via Stellar Friendbot
```bash
nelax fund
```

### 4. Discover Compute Nodes
```bash
# Formatted terminal view
nelax discover

# Only unleased, available nodes
nelax discover --available

# Structured JSON
nelax discover --json
```

### 5. Autonomously Rent Compute (x402 Protocol)
```bash
nelax rent gpu-4090-02 --json
```

### 6. Send On-Chain Payment
```bash
nelax pay GCWDVYVPM7ORTD5INWSP3C5TRV5TRBEIHZWY3K4HS3STLKJE5I7OSMVB 5 XLM --json
```

### 7. View On-Chain Ledger History
```bash
nelax history --limit 5
```

---

## 🔗 Links & Resources

- **Stellar Testnet Explorer**: [https://stellar.expert/explorer/testnet/](https://stellar.expert/explorer/testnet/)
- **Pollar Documentation**: [https://docs.pollar.xyz/](https://docs.pollar.xyz/)
- **License**: MIT
