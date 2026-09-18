# Nelax — Pollar Hackathon Plan

**Event:** Pollar Hackathon: Build on Pollar (Boundless)
**Deadline:** Sep 18, 2026, 1:00 PM UTC — ~13 hours from now
**Prize pool:** $500 total ($250 / $150 / $100)
**Track:** "Build any app on Pollar" (not the flagship Africa–LatAm corridor)

---

## 1. The idea

**Nelax** is infrastructure that lets AI agents create and control their own Stellar wallets — autonomously, with no human clicking through a login flow on their behalf.

The pitch in one line:

> **AI agents that can log into their own non-custodial wallet, get paid, and pay for things — using nothing but a CLI and their own reasoning.**

Concretely, it's three pieces:

1. **A CLI (`npx nelax`)** — wraps Pollar's email-OTP auth + payments so any agent with shell access can run `nelax login`, `nelax verify`, `nelax wallet`, `nelax pay`, `nelax history`.
2. **A skill file** — teaches agent frameworks (OpenClaw, Claude Code, etc.) when and how to call the CLI. This is what makes it "plug into your normal agentic framework" rather than a bespoke integration.
3. **A landing page + live testnet compute marketplace** — human-facing. Explains what Nelax is, how to register an agent, and shows a live view of fake compute machines agents can rent — proving the payment flow is real by watching an agent pay for one on-chain (testnet).

**Why this fits the hackathon well:**

- Most "build any app on Pollar" entries will be human-facing payment apps (tipping, bill splitting). Nelax is a different category — agent-facing infrastructure — which stands out to judges by default.
- It exercises Pollar's email-OTP flow programmatically and headlessly, which is a real, distinctive use of their SDK.
- It's a natural extension of work you're already deep in ([[Recoiz]] — agentic wallets on Arbitrum, ANIMA's NFA concept) — same thesis, different rails, so you're not starting cold.
- Small honest scope: no flagship-track infra dependency, no need for Pollar's team to unblock you mid-build.

---

## 2. Architecture

```
┌─────────────────────┐
│   Agent (any         │   runs shell commands
│   framework: OpenClaw,│──────────────┐
│   Claude Code, etc.)  │              │
└─────────────────────┘              ▼
                              ┌───────────────┐
                              │   nelax CLI    │
                              │  (npx nelax)   │
                              └───────┬───────┘
                                      │ wraps
                                      ▼
                          ┌─────────────────────┐
                          │  @pollar/core (SDK)  │
                          │  email OTP + runTx   │
                          └──────────┬───────────┘
                                     │
                                     ▼
                          ┌─────────────────────┐
                          │   Pollar Server       │
                          │  (Stellar testnet)    │
                          └──────────┬───────────┘
                                     │
                                     ▼
                          ┌─────────────────────┐
                          │  Stellar Testnet      │
                          │  (G-address wallet)   │
                          └─────────────────────┘

Separately, human-facing:
┌─────────────────────┐        ┌──────────────────────────┐
│  Landing page         │◄──────│  Live marketplace UI      │
│  (what/why/how)       │       │  (fake compute listings,  │
└─────────────────────┘        │  shows real tx activity)  │
                                 └──────────────────────────┘
```

**Session persistence:** CLI caches the authenticated session (token/keys) in `~/.nelax/session.json` after `verify` succeeds, so the agent only logs in once per session and every subsequent `pay`/`wallet`/`history` call reuses it.

**Compute marketplace:** intentionally fake/decorative on the compute side (no real VM provisioning — that's what [[arbitrum-agentic-wallet]] / Recoiz is building separately). What's real is the payment: `nelax pay` fires an actual Pollar testnet USDC transaction. The marketplace API returns a real `402 Payment Required` until payment clears, then a fake "provisioned" response (IP string, fake status). This is honest scoping — the hard, real part (payment authorization by an autonomous agent) is real; the easy, decorative part (a VM existing) is mocked and labeled as such.

---

## 3. Confirmed technical facts (from Pollar docs)

- `@pollar/core` works headless in plain Node — no React required: `new PollarClient({ apiKey, stellarNetwork: 'testnet' })`.
- Email OTP is a real, exact API:
  - `sendEmailCode(email: string): Promise<void>` — step 1, sends the code
  - `verifyEmailCode(code: string): Promise<void>` — step 2, resolves once authenticated
  - Under the hood: `POST /auth/email` and `POST /auth/email/verify-code`
- Payments: `runTx('payment', { destination, amount, asset })` — one-shot build/sign/submit. Returns `{ status: 'success' | 'pending' | 'error', ... }`.
- Balances: `refreshWalletBalance()` / balance state.
- History: `fetchTxHistory({ limit, offset })`.
- Keys: use `pub_testnet_...` (safe client-side) — for a CLI tool that's end-user-facing this is fine since it only authorizes user-initiated actions; never ship a `sec_testnet_` key in the CLI package.
- Testnet rate limit: 1,000 requests/day per key — plenty for a hackathon demo.
- Wallets are Stellar G-addresses; a base 1 XLM reserve + trustline reserves are sponsored automatically by Pollar (Immediate funding mode recommended for the demo so there's no separate activation step).

---

## 4. Build plan — next 13 hours

| Time (elapsed)    | Block                         | Tasks                                                                                                                                                                                                                                                                                                                              |
| ----------------- | ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **0:00 – 0:30**   | Setup                         | Create Pollar app in dashboard, get `pub_testnet_` key, set funding mode to **Immediate**, configure USDC trustline. Confirm `nelax` + `nelax-cli`/`npm` name still free (already checked: free).                                                                                                                                  |
| **0:30 – 2:30**   | CLI core                      | Scaffold `nelax` npm package (bin + commander). Implement `login <email>`, `verify <code>`, `wallet`, `pay <dest> <amount> [asset]`, `history`. Session cache in `~/.nelax/session.json`. Test end-to-end against Pollar testnet manually from terminal.                                                                           |
| **2:30 – 4:00**   | Mock marketplace API          | Small Express/Next API route: `GET /machines` (list fake listings), `POST /rent/:id` gated behind a 402 check — verifies a real Pollar tx hash/payment before returning `200` + fake provisioning JSON.                                                                                                                            |
| **4:00 – 5:30**   | Wire agent flow end-to-end    | Agent (in Claude Code / OpenClaw) runs `nelax login` → `verify` → queries `/machines` → `nelax pay <marketplace-wallet> <amount>` → confirms with marketplace → gets fake VM back. Run this manually several times until reliable.                                                                                                 |
| **5:30 – 6:15**   | Skill file                    | Write `SKILL.md`: what Nelax is, when to use each command, expected output shapes, example agent dialogue. This is what makes it "plug and play" for any framework.                                                                                                                                                                |
| **6:15 – 9:00**   | Landing page + marketplace UI | Next.js page: hero explaining Nelax, "how to register your agent" section (install command + skill link), live marketplace view (listings + status, refreshes to show real payment activity/tx hash link to Stellar Expert testnet). This is your strong suit — move fast, reuse Tailwind/Framer Motion patterns you already have. |
| **9:00 – 9:45**   | Polish + edge cases           | Handle OTP expiry, wrong code, insufficient balance, network errors gracefully in CLI output (agents need clear text to reason over).                                                                                                                                                                                              |
| **9:45 – 10:15**  | npm publish                   | Publish `nelax` to npm so `npx nelax` genuinely works for judges without a local clone.                                                                                                                                                                                                                                            |
| **10:15 – 11:30** | Record demo                   | Script + record: agent (live, in Claude Code or OpenClaw) logging in, paying, renting compute — side by side with the marketplace UI updating and a Stellar Expert testnet link proving the tx.                                                                                                                                    |
| **11:30 – 12:30** | Submission writeup            | One clear paragraph pitch, architecture diagram (reuse the one above), links: npm package, GitHub repo, live landing page, demo video.                                                                                                                                                                                             |
| **12:30 – 13:00** | Buffer                        | Bug fixes, resubmission if anything breaks.                                                                                                                                                                                                                                                                                        |

---

## 5. Resources

**Pollar:**

- Docs: https://docs.pollar.xyz/
- Full docs dump: https://docs.pollar.xyz/llms-full.txt
- Core SDK: `@pollar/core` — https://www.npmjs.com/package/@pollar/core
- React SDK (only if needed for landing page wallet display): `@pollar/react`
- Dashboard (get API keys, set funding mode, configure trustlines): https://dashboard.pollar.xyz
- Telegram support (team on all week): https://t.me/+eRBh0t5gAeZlMzhh
- Example app to reference patterns: https://github.com/pollar-xyz/demo-nextjs
- Stellar testnet explorer (for proving real tx in demo): https://stellar.expert/explorer/testnet

**Hackathon:**

- Listing: https://www.boundlessfi.xyz/hackathons/pollar-hackathon-build-on-pollar
- Submission deadline: Sep 18, 2026, 1:00 PM UTC

**Your own prior art to reuse:**

- [[arbitrum-agentic-wallet]] (Recoiz) — CLI/SDK + skill-file + MCP-wrapper pattern for agent framework compatibility; reuse the same shape here for Nelax's skill file
- [[anima-sui]] — NFA / agent-identity concepts, useful language for the pitch narrative
- Design patterns: Tailwind CSS, Framer Motion, shadcn/ui for the landing page + marketplace UI

**CLI dependencies (already installed in scaffold):**

- `commander` — CLI argument parsing
- `conf` — persistent local config/session storage
- `chalk` — terminal output styling
- `ora` — loading spinners
- `@pollar/core` — the SDK itself

---

## 6. Open decisions to make before/while building

- **Marketplace realism:** how many fake machines, what fields shown (latency/price/region) — pick simple, e.g. 3 machines, price + fake latency, done.
- **Team split:** solo vs pulling in help for a couple hours on the landing page while you focus on CLI + agent wiring.
- **Submission narrative one-liner:** lock this early so the landing page copy and demo script both point at the same phrase.
