# Nelax Compute Marketplace & x402 Protocol Implementation Plan (`PLAN_COMPUTE.md`)

This plan details the architecture, API specifications, and frontend design for the **Nelax Compute Marketplace** and **x402 Resource Server** in `nelax-app/`.

---

## 1. Overview & Objectives

* **Target Scope**:
  1. `nelax-app/app/api/machines/route.ts` (Compute catalog discovery API)
  2. `nelax-app/app/api/rent/[id]/route.ts` (x402 Payment-Required resource server)
  3. `nelax-app/app/marketplace/page.tsx` (Human & judge-facing marketplace dashboard)
* **Explicit Boundary**: **Do NOT modify `app/page.tsx`** (preserve user's landing page design intact).
* **Core Value**: 
  - Allows autonomous AI agents (`nelax-cli`, Claude Code, OpenClaw, Hermes, Antigravity) to query hardware, receive an HTTP 402 challenge, settle payment on Stellar Testnet via Pollar, and unlock provisioned compute credentials.
  - Provides a live web marketplace showcasing hardware status, specs, pricing, and on-chain lease activity verified on `stellar.expert`.

---

## 2. The x402 Protocol Flow

```
┌──────────────────────────┐                                  ┌──────────────────────────┐
│   Autonomous AI Agent    │                                  │   Nelax x402 Server      │
│   (nelax-cli / runtime)  │                                  │   (/api/rent/[id])       │
└────────────┬─────────────┘                                  └────────────┬─────────────┘
             │                                                             │
             │  1. POST /api/rent/gpu-h100-01 (No payment)                 │
             │────────────────────────────────────────────────────────────>│
             │                                                             │
             │  2. HTTP 402 Payment Required                               │
             │     Headers: WWW-Authenticate: X-402 destination=...        │
             │     Body: { destination, amount, asset, network }           │
             │<────────────────────────────────────────────────────────────│
             │                                                             │
             │──┐ 3. Autonomous Settlement                                 │
             │  │ Pollar build-sign-submit on Stellar Testnet              │
             │  │ (e.g. 1 XLM to Provider Address)                         │
             │<─┘                                                          │
             │                                                             │
             │  4. POST /api/rent/gpu-h100-01                              │
             │     Header: X-402-Payment-Hash: <stellar_tx_hash>           │
             │────────────────────────────────────────────────────────────>│
             │                                                             │
             │                                                ┌────────────┴────────────┐
             │                                                │ Verify Tx on Horizon    │
             │                                                │ Testnet & lock machine  │
             │                                                └────────────┬────────────┘
             │                                                             │
             │  5. HTTP 200 OK                                             │
             │     Body: { machineId, ip, sshPort, username, sshCommand }  │
             │<────────────────────────────────────────────────────────────│
```

---

## 3. Phased Implementation Breakdown

### Section 1: In-Memory / Local Store for Compute Nodes (`lib/compute-store.ts`)
* Define catalog of realistic machine configurations:
  - **`gpu-h100-01`**: NVIDIA H100 80GB SXM5 (112 vCPU, 480 GB RAM) — `5 XLM` ($1.25)
  - **`gpu-4090-02`**: NVIDIA RTX 4090 24GB (24 vCPU, 64 GB RAM) — `1 XLM` ($0.25)
  - **`apple-m3-03`**: Apple M3 Ultra 128GB Unified Memory (24-Core CPU, 76-Core GPU) — `2.5 XLM` ($0.60)
  - **`cpu-epyc-04`**: AMD EPYC 9654 64-Core (256 GB RAM) — `1 XLM` ($0.25)
* State tracking:
  - `status`: `'available'` | `'leased'`
  - `leaseInfo`: `{ agentWallet, txHash, expiresAt, ip, sshPort, username }`
  - Helper methods: `getMachines()`, `getMachineById(id)`, `leaseMachine(id, agentWallet, txHash)`

---

### Section 2: x402 Compute API Routes
#### `GET /api/machines`
* Returns current machine catalog, availability status, specs, pricing, and active lease records.

#### `POST /api/rent/[id]` & `GET /api/rent/[id]`
* **Step 1: Check Payment Proof**
  - Read header `X-402-Payment-Hash` or `Authorization: x402 <hash>`.
* **Step 2: If Missing -> Issue HTTP 402**
  - Status code: `402`
  - Headers:
    ```http
    WWW-Authenticate: X-402 destination="GCWDVYVPM7ORTD5INWSP3C5TRV5TRBEIHZWY3K4HS3STLKJE5I7OSMVB", amount="1", asset="XLM", network="stellar:testnet"
    ```
  - JSON Body:
    ```json
    {
      "status": 402,
      "error": "Payment Required",
      "message": "Payment required to lease compute node gpu-4090-02",
      "x402": {
        "destination": "GCWDVYVPM7ORTD5INWSP3C5TRV5TRBEIHZWY3K4HS3STLKJE5I7OSMVB",
        "amount": "1",
        "asset": "XLM",
        "network": "stellar:testnet",
        "machineId": "gpu-4090-02"
      }
    }
    ```
* **Step 3: If Payment Hash Provided -> Verify on Stellar Testnet**
  - Query Horizon testnet endpoint:
    `https://horizon-testnet.stellar.org/transactions/<txHash>`
  - Verify `successful: true`.
  - Mark node status as `leased` in `compute-store`.
  - Return `HTTP 200 OK` with provisioned credentials:
    ```json
    {
      "success": true,
      "machineId": "gpu-4090-02",
      "name": "NVIDIA RTX 4090 24GB",
      "ip": "142.250.190.46",
      "sshPort": 2222,
      "username": "agent-nelax",
      "authToken": "lease_sec_c8b5f7...",
      "leaseExpiresAt": "2026-09-18T05:43:00.000Z",
      "txHash": "c8b5f729a3b7f1c7b8b36e9223ca917bb58c4d2ab2c525c1302591ecf3a40c30",
      "sshCommand": "ssh -p 2222 agent-nelax@142.250.190.46"
    }
    ```

---

### Section 3: Marketplace Dashboard UI (`app/marketplace/page.tsx`)
* **Page Route**:
  - Primary: `/marketplace`
  - Alias / Redirect: Handle `/marketpalce` path to avoid 404 from the initial typo.
* **Visual Theme**:
  - Sleek dark aesthetic (`#09090b` / `#0f172a`), neon cyber accents (cyan `#06b6d4`, violet `#8b5cf6`, emerald `#10b981`), glassmorphism cards.
* **Component Architecture**:
  1. **Marketplace Header & Live Network Status**:
     - Title: `⚡ Nelax Autonomous Compute Marketplace`
     - Network Pill: `● Stellar Testnet (Active)` | `● Pollar Relay (Connected)`
     - Summary Stats: Available Nodes, Active Leases, On-chain Volume Settled.
  2. **Hardware Grid / Node Cards**:
     - Hardware specs: Architecture, VRAM, CPU cores, System RAM, Bandwidth.
     - Live status badge:
       - Green pulse: `Available for Instant Agent Lease`
       - Purple pulse: `Leased by Agent (GCWDV...5I7OS)`
     - Pricing tag: `1 XLM / hr` ($0.25)
     - Action Buttons:
       - **Copy Agent Command**: `nelax rent <id>`
       - **Simulate Autonomous Lease**: Opens modal to trigger real testnet payment & inspect response.
  3. **Live Activity & On-Chain Settlement Feed**:
     - Real-time list of recent rentals with timestamps, agent wallet addresses, and direct links to `https://stellar.expert/explorer/testnet/tx/<hash>`.
  4. **Agent Quickstart Drawer**:
     - Copyable snippet of `SKILL.md` instructions and `nelax rent <machineId>` CLI usage.

---

## 4. Execution Checkpoints

- [ ] **Checkpoint 1**: Create `nelax-app/lib/compute-store.ts` (Node definitions & lease state).
- [ ] **Checkpoint 2**: Create `nelax-app/app/api/machines/route.ts` & `nelax-app/app/api/rent/[id]/route.ts` with real Horizon testnet payment verification.
- [ ] **Checkpoint 3**: Build `nelax-app/app/marketplace/page.tsx` with dynamic node list, filtering, live status, and activity feed.
- [ ] **Checkpoint 4**: End-to-end test: Run `nelax rent gpu-4090-02` from CLI -> confirm HTTP 402 challenge is received -> payment executed on Stellar Testnet -> machine is unlocked and marked rented on `/marketplace`.

---

## 5. Verification Plan

### Automated / CLI Verification
```bash
# 1. Test machine catalog
curl http://localhost:3000/api/machines

# 2. Test 402 Payment Required response
curl -i -X POST http://localhost:3000/api/rent/gpu-4090-02

# 3. Test autonomous end-to-end rental via CLI
nelax rent gpu-4090-02
```

### Manual Verification
- Open `http://localhost:3000/marketplace` in browser.
- Verify node cards show live availability.
- Observe node change status to "Leased by Agent" after CLI rental.
- Click the transaction link and verify on Stellar Expert.
