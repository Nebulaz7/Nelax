# Nelax CLI Implementation Plan (`PLAN_CLI.md`)

This document outlines the step-by-step implementation plan for **`nelax-cli`**, the autonomous agentic wallet CLI powered by Pollar and Stellar Testnet.

---

## 1. Overview & Objectives

* **Target Package**: `nelax-cli/`
* **Command Name**: `nelax` (executable globally or via `npx nelax`)
* **Primary Users**: AI Agents (Claude Code, OpenClaw, Hermes Agent, Antigravity, shell runtimes) and Developers.
* **Network**: **Stellar Testnet** (`stellar:testnet`).
* **Core Value**: Enables AI agents to autonomously manage non-custodial wallets, make direct Stellar payments, and pay for compute via the **x402** protocol without human UI interaction.

---

## 2. Tech Stack & Architecture

* **Language**: TypeScript (ES2022, Node16 module resolution)
* **Bundler**: `tsup` (compiles to lightweight executable CJS/ESM binary in `dist/`)
* **CLI Engine**: `commander` (clean command parsing, flags, auto-generated `--help`)
* **Styling & UX**: `chalk` (terminal styling), `ora` (spinners)
* **Storage**: `conf` (persisting session data to `~/.nelax/session.json`)
* **Blockchain/Wallet**: `@pollar/core` (`PollarClient`), `@stellar/stellar-sdk` (optional helper utilities)
* **Environment**: `dotenv` (loads `POLLAR_API_KEY`)

```
nelax-cli/
├── src/
│   ├── index.ts          # CLI entrypoint & Commander setup (commands + --help)
│   ├── pollar.ts         # PollarClient wrapper (auth, balances, direct payments, signAuthEntry)
│   ├── session.ts        # Persistent session manager (~/.nelax/session.json)
│   ├── x402.ts           # x402 client logic (402 detection -> sign/pay -> retry with proof)
│   └── types.ts          # Type definitions & response schemas
├── package.json          # bin entry, scripts, dependencies
├── tsconfig.json         # TypeScript compiler configuration
└── tsup.config.ts        # tsup bundling configuration
```

---

## 3. Phased Implementation Breakdown

We will implement `nelax-cli` in 5 focused, incremental phases:

---

### Phase 1: Project Scaffolding & Configuration
* **Goal**: Establish the build toolchain, binary configuration, and dependencies.
* **Tasks**:
  1. Initialize `package.json` in `nelax-cli/`:
     - Set `"bin": { "nelax": "./dist/index.js" }`
     - Add scripts: `build`, `dev`, `start`, `link:local`.
  2. Install dependencies:
     - Runtime: `@pollar/core`, `commander`, `conf`, `chalk`, `ora`, `dotenv`
     - Dev: `typescript`, `tsup`, `@types/node`
  3. Create `tsconfig.json` and `tsup.config.ts` (with shebang injection `#!/usr/bin/env node`).
  4. Verify clean compilation: `npm run build` generates `./dist/index.js`.

---

### Phase 2: Session Storage & Pollar Client Integration
* **Goal**: Implement the headless authentication and balance management layer.
* **Tasks**:
  1. **`src/session.ts`**:
     - Manage session config file at `~/.nelax/session.json`.
     - Fields: `{ email, sessionToken, walletAddress, network, updatedAt }`.
     - Methods: `saveSession()`, `loadSession()`, `clearSession()`, `hasSession()`.
  2. **`src/pollar.ts`**:
     - Instantiate `PollarClient` using `pub_testnet_077431599670fb80328d36889d95f721`.
     - Implement `requestLoginCode(email)` using `pollar.login({ provider: 'email', email })` or `pollar.sendEmailCode(email)`.
     - Implement `confirmLoginCode(code)` using `pollar.verifyEmailCode(code)` and extract the Stellar wallet address.
     - Implement `fetchBalance(address)` using `pollar.getWalletBalance(address, 'testnet')`.
     - Implement `executeDirectPayment(to, amount, asset)` using `pollar.buildTx` + `pollar.signAndSubmitTx` or `pollar.runTx`.
     - Implement `signSorobanAuthEntry(entryXdr)` using `pollar.signAuthEntry()`.

---

### Phase 3: Core Commands & Rich `--help`
* **Goal**: Wire up all CLI commands with clear output for humans and a `--json` flag for AI agents.
* **Commands to implement**:

| Command | Arguments / Flags | Description |
| :--- | :--- | :--- |
| **`nelax --help`** | `-h, --help` | Comprehensive overview of all available commands, usage examples, and agent tips. |
| **`nelax login`** | `<email>` | Starts the email OTP authentication flow; sends code to inbox. |
| **`nelax verify`** | `<code>` | Verifies the OTP code, activates wallet, and saves session locally. |
| **`nelax wallet`** | `[--json]` | Prints wallet public key (G-address), testnet USDC balance, XLM balance, and testnet explorer link. |
| **`nelax pay`** | `<destination> <amount> [asset]` | Direct on-chain Stellar testnet transfer (defaults to USDC). Returns tx hash. |
| **`nelax history`** | `[--limit 10] [--json]` | Lists recent transactions on Stellar testnet for the active wallet. |
| **`nelax logout`** | — | Deletes local session from `~/.nelax/session.json`. |

---

### Phase 4: Autonomous x402 Compute Payment (`nelax rent` / `nelax fetch`)
* **Goal**: Implement the autonomous payment protocol for compute resources.
* **Command**: `nelax rent <machine-id> [options]` / `nelax fetch <url>`
* **Workflow**:
  1. Sends initial `POST` to the compute marketplace endpoint (e.g. `http://localhost:3000/api/rent/:id`).
  2. Detects HTTP `402 Payment Required`.
  3. Parses response payload:
     - `recipient`: Provider's Stellar G-address
     - `amount`: Cost in USDC (e.g., `0.05`)
     - `asset`: `USDC`
     - `network`: `stellar:testnet`
  4. Autonomously signs & submits the testnet transaction using the agent's Pollar session.
  5. Retries request with header `X-402-Payment-Hash: <tx_hash>`.
  6. Receives HTTP `200 OK` with simulated VM/SSH credentials:
     - `ip`, `sshPort`, `username`, `authToken`, `leaseExpiresAt`.
  7. Outputs the connection details formatted cleanly for agents to immediately use.

---

### Phase 5: Testing, Local Linking & Verification
* **Goal**: Validate the entire CLI end-to-end on Stellar testnet.
* **Tasks**:
  1. Run `npm link` inside `nelax-cli/` to expose `nelax` in the terminal.
  2. Run `nelax --help` to confirm formatting.
  3. Run live test:
     ```bash
     nelax login user@example.com
     nelax verify 123456
     nelax wallet
     nelax pay <testnet-g-address> 1.0 USDC
     nelax history
     ```
  4. Confirm all transactions appear on `https://stellar.expert/explorer/testnet`.

---

## 4. Execution Checkpoints

- [x] **Checkpoint 1**: Phase 1 (Scaffolding & Build setup complete)
- [x] **Checkpoint 2**: Phase 2 (Pollar client & session storage verified)
- [x] **Checkpoint 3**: Phase 3 (`--help`, `login`, `verify`, `wallet`, `pay`, `logout` working)
- [x] **Checkpoint 4**: Phase 4 (`x402` payment & compute rental working)
- [ ] **Checkpoint 5**: Phase 5 (End-to-end verification & agent test)
