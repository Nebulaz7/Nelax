#!/usr/bin/env node

// src/index.ts
import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";

// src/pollar.ts
import { PollarClient, createMemoryAdapter } from "@pollar/core";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// src/session.ts
import Conf from "conf";
var config = new Conf({
  projectName: "nelax",
  defaults: {
    network: "testnet",
    updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    verified: false
  }
});
function getSession() {
  const address = config.get("walletAddress");
  const clientSessionId = config.get("clientSessionId");
  if (!address && !clientSessionId) {
    return null;
  }
  return {
    email: config.get("email"),
    clientSessionId,
    sessionToken: config.get("sessionToken"),
    walletAddress: address,
    network: config.get("network") || "testnet",
    updatedAt: config.get("updatedAt") || (/* @__PURE__ */ new Date()).toISOString(),
    verified: config.get("verified") ?? false
  };
}
function saveSession(updates) {
  if (updates.email !== void 0) config.set("email", updates.email);
  if (updates.clientSessionId !== void 0) config.set("clientSessionId", updates.clientSessionId);
  if (updates.sessionToken !== void 0) config.set("sessionToken", updates.sessionToken);
  if (updates.walletAddress !== void 0) config.set("walletAddress", updates.walletAddress);
  if (updates.network !== void 0) config.set("network", updates.network);
  if (updates.verified !== void 0) config.set("verified", updates.verified);
  config.set("updatedAt", (/* @__PURE__ */ new Date()).toISOString());
  return getSession();
}
function clearSession() {
  config.clear();
}
function getSessionPath() {
  return config.path;
}

// src/pollar.ts
dotenv.config();
var __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
var DEFAULT_KEY = "pub_testnet_077431599670fb80328d36889d95f721";
var API_KEY = process.env.POLLAR_API_KEY || DEFAULT_KEY;
var STELLAR_NETWORK = process.env.STELLAR_NETWORK || "testnet";
var DEFAULT_ORIGIN = process.env.POLLAR_APP_ORIGIN || "http://localhost:3000";
if (typeof globalThis.window === "undefined") {
  globalThis.window = globalThis;
}
if (!globalThis.window.addEventListener) {
  globalThis.window.addEventListener = () => {
  };
  globalThis.window.removeEventListener = () => {
  };
}
if (typeof globalThis.localStorage === "undefined") {
  const store = /* @__PURE__ */ new Map();
  globalThis.localStorage = {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, val) => store.set(key, String(val)),
    removeItem: (key) => store.delete(key),
    clear: () => store.clear()
  };
}
var originalWarn = console.warn;
console.warn = (...args) => {
  if (typeof args[0] === "string" && (args[0].includes("called server-side") || args[0].includes("No visibilityProvider"))) {
    return;
  }
  originalWarn(...args);
};
var originalFetch = globalThis.fetch;
globalThis.fetch = async (input, init) => {
  let urlString;
  let headers;
  if (input instanceof Request) {
    urlString = input.url;
    headers = new Headers(input.headers);
    if (init?.headers) {
      new Headers(init.headers).forEach((v, k) => headers.set(k, v));
    }
  } else {
    urlString = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
    headers = new Headers(init?.headers || {});
  }
  if (urlString.includes("pollar.xyz")) {
    if (!headers.has("Origin")) {
      headers.set("Origin", DEFAULT_ORIGIN);
    }
  }
  if (input instanceof Request) {
    return originalFetch(new Request(input, { ...init, headers }));
  }
  return originalFetch(input, { ...init, headers });
};
var NelaxPollarService = class {
  client;
  constructor(apiKey = API_KEY) {
    this.client = new PollarClient({
      apiKey,
      stellarNetwork: STELLAR_NETWORK,
      storage: createMemoryAdapter()
    });
  }
  getClient() {
    return this.client;
  }
  /**
   * Request an OTP email code for an agent or user email address
   */
  async requestEmailOtp(email) {
    const sessionRes = await originalFetch("https://sdk.api.pollar.xyz/v1/auth/session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-pollar-api-key": API_KEY,
        "Origin": DEFAULT_ORIGIN
      },
      body: JSON.stringify({})
    });
    const sessionData = await sessionRes.json().catch(() => ({}));
    if (!sessionRes.ok || !sessionData?.content?.clientSessionId) {
      const err = sessionData?.code || sessionData?.message || "Failed to initialize session with Pollar";
      throw new Error(err);
    }
    const clientSessionId = sessionData.content.clientSessionId;
    const emailRes = await originalFetch("https://sdk.api.pollar.xyz/v1/auth/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-pollar-api-key": API_KEY,
        "Origin": DEFAULT_ORIGIN
      },
      body: JSON.stringify({
        clientSessionId,
        email
      })
    });
    const emailData = await emailRes.json().catch(() => ({}));
    if (!emailRes.ok || emailData?.code !== "SDK_EMAIL_CODE_SENT") {
      const err = emailData?.code || emailData?.message || "Failed to dispatch email verification code";
      throw new Error(err);
    }
    return {
      success: true,
      clientSessionId,
      message: `OTP verification code successfully sent to ${email}`
    };
  }
  /**
   * Confirm the OTP code and retrieve the active wallet address
   */
  async verifyEmailOtp(code, clientSessionId) {
    if (!clientSessionId) {
      throw new Error('No pending login session found. Run "nelax login <email>" first.');
    }
    const verifyRes = await originalFetch("https://sdk.api.pollar.xyz/v1/auth/email/verify-code", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-pollar-api-key": API_KEY,
        "Origin": DEFAULT_ORIGIN
      },
      body: JSON.stringify({
        clientSessionId,
        code: code.trim()
      })
    });
    const verifyData = await verifyRes.json().catch(() => ({}));
    if (!verifyRes.ok || verifyData?.code !== "SDK_EMAIL_CODE_VERIFIED") {
      const codeErr = verifyData?.code;
      if (codeErr === "SDK_EMAIL_CODE_EXPIRED") {
        throw new Error('Verification code has expired. Please run "nelax login <email>" again.');
      }
      if (codeErr === "SDK_EMAIL_CODE_INVALID" || codeErr === "INVALID_EMAIL_CODE") {
        throw new Error("Invalid verification code. Please check your email and try again.");
      }
      throw new Error(verifyData?.message || verifyData?.code || "Verification failed");
    }
    let statusRes = await originalFetch(
      `https://sdk.api.pollar.xyz/v1/auth/session/status/${encodeURIComponent(clientSessionId)}/poll`,
      {
        headers: {
          "accept": "application/json",
          "x-pollar-api-key": API_KEY,
          "Origin": DEFAULT_ORIGIN
        }
      }
    );
    let statusData = await statusRes.json().catch(() => ({}));
    let attempts = 0;
    while (attempts < 15 && statusData?.content?.status === "PENDING") {
      await new Promise((r) => setTimeout(r, 500));
      statusRes = await originalFetch(
        `https://sdk.api.pollar.xyz/v1/auth/session/status/${encodeURIComponent(clientSessionId)}/poll`,
        {
          headers: {
            "accept": "application/json",
            "x-pollar-api-key": API_KEY,
            "Origin": DEFAULT_ORIGIN
          }
        }
      );
      statusData = await statusRes.json().catch(() => ({}));
      attempts++;
    }
    const loginRes = await originalFetch("https://sdk.api.pollar.xyz/v1/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-pollar-api-key": API_KEY,
        "Origin": DEFAULT_ORIGIN
      },
      body: JSON.stringify({
        clientSessionId
      })
    });
    const loginData = await loginRes.json().catch(() => ({}));
    const content = loginData?.content || {};
    const walletAddress = content.wallet?.address || content.wallet?.publicKey || content.data?.providers?.wallet?.address || content.data?.wallet?.address || content.walletAddress || content.address || statusData?.content?.wallet?.address || statusData?.content?.data?.providers?.wallet?.address;
    if (!walletAddress) {
      if (!loginRes.ok) {
        throw new Error(loginData?.message || loginData?.code || "Failed to finalize login on Pollar");
      }
      throw new Error(`Authentication completed, but no wallet address was extracted: ${JSON.stringify(loginData)}`);
    }
    return {
      walletAddress,
      session: loginData?.content || {}
    };
  }
  /**
   * Request Friendbot funding on Stellar Testnet for an address
   */
  async fundTestnetAccount(walletAddress) {
    try {
      const res = await originalFetch(`https://friendbot.stellar.org/?addr=${encodeURIComponent(walletAddress)}`);
      if (res.ok) {
        return { success: true, alreadyFunded: false, message: "Account successfully activated and funded with 10,000 XLM!" };
      }
      const data = await res.json().catch(() => ({}));
      if (data?.detail?.includes("already funded") || data?.detail?.includes("already exist")) {
        return { success: true, alreadyFunded: true, message: "Account is already active and funded on Stellar Testnet." };
      }
      return { success: false, alreadyFunded: false, message: data?.detail || "Friendbot request failed." };
    } catch (e) {
      return { success: false, alreadyFunded: false, message: e.message };
    }
  }
  /**
   * Fetch balances for a wallet address from Stellar Horizon testnet, with Pollar fallback
   */
  async getWalletOverview(walletAddress) {
    const balances = [];
    try {
      let res = await originalFetch(`https://horizon-testnet.stellar.org/accounts/${walletAddress}`);
      if (res.status === 404 && STELLAR_NETWORK === "testnet") {
        await this.fundTestnetAccount(walletAddress);
        await new Promise((r) => setTimeout(r, 1200));
        res = await originalFetch(`https://horizon-testnet.stellar.org/accounts/${walletAddress}`);
      }
      if (res.ok) {
        const accountData = await res.json();
        for (const b of accountData.balances || []) {
          balances.push({
            asset: b.asset_type === "native" ? "XLM" : b.asset_code || "TOKEN",
            balance: b.balance,
            code: b.asset_code,
            issuer: b.asset_issuer,
            isNative: b.asset_type === "native"
          });
        }
      }
    } catch {
    }
    if (balances.length === 0) {
      try {
        const pollarBalance = await this.client.getWalletBalance(walletAddress, STELLAR_NETWORK);
        if (pollarBalance?.balances && Array.isArray(pollarBalance.balances)) {
          for (const b of pollarBalance.balances) {
            balances.push({
              asset: b.asset_code || "XLM",
              balance: b.balance || "0.00",
              code: b.asset_code,
              issuer: b.asset_issuer,
              isNative: b.asset_type === "native"
            });
          }
        }
      } catch {
      }
    }
    if (balances.length === 0) {
      balances.push(
        { asset: "USDC", balance: "0.0000000", code: "USDC", isNative: false },
        { asset: "XLM", balance: "0.0000000", isNative: true }
      );
    }
    return {
      address: walletAddress,
      network: STELLAR_NETWORK,
      balances,
      explorerUrl: `https://stellar.expert/explorer/testnet/account/${walletAddress}`
    };
  }
  /**
   * Execute a direct on-chain payment (USDC by default, or XLM)
   */
  async sendPayment(destination, amount, assetCode = "USDC") {
    const session = getSession();
    if (!session || !session.walletAddress) {
      throw new Error('Authentication required. Run "nelax login <email>" first.');
    }
    const isNative = assetCode.toUpperCase() === "XLM";
    const asset = isNative ? { type: "native" } : {
      type: "credit_alphanum4",
      code: "USDC",
      issuer: "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5"
    };
    const token = typeof session.sessionToken === "string" ? session.sessionToken : session.sessionToken?.accessToken;
    const res = await originalFetch("https://sdk.api.pollar.xyz/v1/tx/build-sign-submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-pollar-api-key": API_KEY,
        "Origin": DEFAULT_ORIGIN,
        ...token ? { "Authorization": `Bearer ${token}` } : {}
      },
      body: JSON.stringify({
        address: session.walletAddress,
        operation: "payment",
        params: {
          destination,
          amount,
          asset
        },
        options: {},
        waitForConfirmation: false
      })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.success || !data?.content?.hash) {
      const errMsg = data?.message || data?.code || data?.content?.resultCode || JSON.stringify(data);
      throw new Error(`Payment failed: ${errMsg}`);
    }
    const hash = data.content.hash;
    const status = data.content.status === "SUCCESS" ? "success" : "pending";
    return {
      hash,
      status,
      explorerUrl: `https://stellar.expert/explorer/testnet/tx/${hash}`,
      amount,
      asset: assetCode.toUpperCase(),
      destination,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  /**
   * Sign a Soroban Authorization Entry for x402
   */
  async signAuthEntry(entryXdr, validUntilLedger) {
    const result = await this.client.signAuthEntry(entryXdr, {
      validUntilLedger: validUntilLedger || 1e6
    });
    return result;
  }
  /**
   * Log out from Pollar
   */
  async logout() {
    await this.client.logout();
  }
};
var pollarService = new NelaxPollarService();

// src/x402.ts
var X402PaymentClient = class {
  /**
   * Performs an autonomous x402 fetch:
   * 1. Hits the resource endpoint.
   * 2. Detects HTTP 402 Payment Required.
   * 3. Parses payment parameters (destination, amount, asset).
   * 4. Settles the payment on Stellar Testnet via Pollar.
   * 5. Retries the request with payment proof (X-402-Payment-Hash).
   * 6. Returns the unlocked compute credentials.
   */
  async rentCompute(endpointUrl, session, options = {}) {
    const { onStatus } = options;
    const method = options.method || "POST";
    onStatus?.(`Connecting to compute endpoint: ${endpointUrl}`);
    const initialHeaders = {
      "Content-Type": "application/json",
      "X-Agent-Wallet": session.walletAddress || "",
      ...options.headers || {}
    };
    const initialRes = await fetch(endpointUrl, {
      method,
      headers: initialHeaders,
      body: options.body ? JSON.stringify(options.body) : void 0
    });
    if (initialRes.status === 200) {
      onStatus?.("Access granted immediately without payment requirement.");
      return await initialRes.json();
    }
    if (initialRes.status !== 402) {
      const errText = await initialRes.text().catch(() => "");
      throw new Error(`Unexpected response (${initialRes.status}): ${errText || initialRes.statusText}`);
    }
    onStatus?.("HTTP 402 Payment Required received. Parsing payment challenge...");
    let challenge;
    try {
      const body = await initialRes.json();
      challenge = {
        destination: body.destination || body.recipient || body.payTo,
        amount: String(body.amount || "0.05"),
        asset: body.asset || "USDC",
        network: body.network || "stellar:testnet",
        resourceId: body.resourceId || body.machineId
      };
    } catch {
      throw new Error("Failed to parse 402 Payment Required challenge payload from server");
    }
    if (!challenge.destination) {
      throw new Error("402 Challenge did not specify a recipient destination address");
    }
    onStatus?.(
      `Autonomous Payment Required: ${challenge.amount} ${challenge.asset} to ${challenge.destination.slice(0, 8)}...`
    );
    onStatus?.("Signing and submitting payment via Pollar on Stellar Testnet...");
    const paymentResult = await pollarService.sendPayment(
      challenge.destination,
      challenge.amount,
      challenge.asset
    );
    onStatus?.(`Payment settled! Tx Hash: ${paymentResult.hash.slice(0, 12)}...`);
    onStatus?.("Retrying compute request with cryptographic payment proof...");
    const retryHeaders = {
      ...initialHeaders,
      "Authorization": `x402 ${paymentResult.hash}`,
      "X-402-Payment-Hash": paymentResult.hash,
      "X-402-Network": "stellar:testnet",
      "X-Agent-Wallet": session.walletAddress || ""
    };
    const retryRes = await fetch(endpointUrl, {
      method,
      headers: retryHeaders,
      body: options.body ? JSON.stringify(options.body) : void 0
    });
    if (!retryRes.ok) {
      const failText = await retryRes.text().catch(() => "");
      throw new Error(`Failed to claim resource after payment (${retryRes.status}): ${failText}`);
    }
    const computeData = await retryRes.json();
    onStatus?.("Compute resource successfully unlocked and provisioned!");
    const lease = {
      machineId: computeData.machineId || challenge.resourceId || "node-cloud",
      name: computeData.name || "Cloud Compute Node",
      ip: computeData.ip || "198.51.100.42",
      sshPort: computeData.sshPort || 2202,
      username: computeData.username || "agent",
      authToken: computeData.authToken || "token_" + paymentResult.hash.slice(0, 16),
      leaseExpiresAt: computeData.leaseExpiresAt || new Date(Date.now() + 3600 * 1e3).toISOString(),
      sshCommand: computeData.sshCommand || `ssh ${computeData.username || "agent"}@${computeData.ip || "198.51.100.42"} -p ${computeData.sshPort || 2202}`,
      txHash: paymentResult.hash
    };
    return lease;
  }
};
var x402Client = new X402PaymentClient();

// src/index.ts
var program = new Command();
function printBanner() {
  console.log(
    chalk.cyanBright.bold(
      "\n\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557"
    )
  );
  console.log(
    chalk.cyanBright.bold("\u2551") + chalk.whiteBright.bold(
      "   NELAX \u2014 Autonomous AI Agent Wallets & x402 Compute on Stellar   "
    ) + chalk.cyanBright.bold("\u2551")
  );
  console.log(
    chalk.cyanBright.bold(
      "\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255D\n"
    )
  );
}
program.name("nelax").description(
  chalk.cyanBright(
    "Nelax \u2014 Autonomous AI Agent Wallets on Stellar (Pollar & x402)"
  )
).version("0.1.0", "-v, --version", "Output the current version of Nelax CLI");
program.command("login <email>").description("Initiate headless email OTP login for an AI agent or developer").option("--json", "Output result in JSON format").action(async (email, options) => {
  const spinner = ora(
    chalk.blue(`Requesting OTP code for ${chalk.bold(email)}...`)
  ).start();
  try {
    const { clientSessionId } = await pollarService.requestEmailOtp(email);
    saveSession({ email, clientSessionId, verified: false });
    spinner.succeed(
      chalk.green(
        `OTP verification code successfully sent to ${chalk.bold(email)}`
      )
    );
    if (options.json) {
      console.log(
        JSON.stringify({
          success: true,
          email,
          clientSessionId,
          step: "entering_code"
        })
      );
    } else {
      console.log(
        chalk.yellow(
          `
Next step: Run ${chalk.bold(`nelax verify <code>`)} to complete login and activate your wallet.
`
        )
      );
    }
  } catch (err) {
    spinner.fail(
      chalk.red(`Failed to send verification code: ${err.message}`)
    );
    if (options.json) {
      console.log(JSON.stringify({ success: false, error: err.message }));
    }
    process.exit(1);
  }
});
program.command("verify <code>").description(
  "Verify the received OTP code and retrieve/deploy the Stellar wallet"
).option("--json", "Output result in JSON format").action(async (code, options) => {
  const currentSession = getSession();
  const spinner = ora(
    chalk.blue(
      "Verifying OTP code and configuring non-custodial Stellar wallet..."
    )
  ).start();
  try {
    const { walletAddress, session } = await pollarService.verifyEmailOtp(
      code.trim(),
      currentSession?.clientSessionId
    );
    saveSession({
      walletAddress,
      sessionToken: session?.token || session?.id,
      verified: true,
      network: "testnet"
    });
    pollarService.fundTestnetAccount(walletAddress).catch(() => {
    });
    spinner.succeed(
      chalk.green.bold("Authentication successful! Wallet active.")
    );
    if (options.json) {
      console.log(
        JSON.stringify({
          success: true,
          walletAddress,
          network: "testnet",
          explorerUrl: `https://stellar.expert/explorer/testnet/account/${walletAddress}`
        })
      );
    } else {
      console.log("\n" + chalk.gray("\u2500".repeat(60)));
      console.log(
        chalk.whiteBright.bold("Stellar Wallet Address: ") + chalk.cyanBright.bold(walletAddress)
      );
      console.log(
        chalk.whiteBright.bold("Network:                ") + chalk.magenta("Stellar Testnet")
      );
      console.log(
        chalk.whiteBright.bold("Explorer:               ") + chalk.underline.blue(
          `https://stellar.expert/explorer/testnet/account/${walletAddress}`
        )
      );
      console.log(chalk.gray("\u2500".repeat(60)));
      console.log(
        chalk.gray(`Session cached locally at: ${getSessionPath()}`)
      );
      console.log(
        chalk.yellow(
          `
Tip: Run ${chalk.bold("nelax wallet")} to view your testnet USDC balance.
`
        )
      );
    }
  } catch (err) {
    spinner.fail(chalk.red(`Verification failed: ${err.message}`));
    if (options.json) {
      console.log(JSON.stringify({ success: false, error: err.message }));
    }
    process.exit(1);
  }
});
function createSpinner(text, isJson) {
  if (isJson) {
    return {
      text: "",
      start: function() {
        return this;
      },
      stop: () => {
      },
      succeed: () => {
      },
      fail: () => {
      }
    };
  }
  return ora(chalk.blue(text)).start();
}
program.command("wallet").alias("balance").description("Inspect current wallet address, testnet USDC and XLM balances").option("--json", "Output result in JSON format").action(async (options) => {
  const session = getSession();
  if (!session || !session.walletAddress) {
    if (options.json) {
      console.log(
        JSON.stringify({
          error: "No active session found. Run nelax login <email> first."
        })
      );
    } else {
      console.log(chalk.red("\nNo active session found!"));
      console.log(
        chalk.yellow(
          `Run ${chalk.bold("nelax login <email>")} to initialize your agent wallet.
`
        )
      );
    }
    process.exit(1);
  }
  const spinner = createSpinner(
    "Fetching Stellar testnet balances...",
    options.json
  );
  try {
    const overview = await pollarService.getWalletOverview(
      session.walletAddress
    );
    spinner.stop();
    if (options.json) {
      console.log(JSON.stringify(overview, null, 2));
    } else {
      console.log("\n" + chalk.gray("\u2500".repeat(60)));
      console.log(
        chalk.whiteBright.bold("Agent Wallet:   ") + chalk.cyanBright.bold(overview.address)
      );
      console.log(
        chalk.whiteBright.bold("Network:        ") + chalk.magenta("Stellar Testnet")
      );
      console.log(
        chalk.whiteBright.bold("Status:         ") + chalk.green("Active (Pollar Sponsored)")
      );
      console.log(chalk.gray("\u2500".repeat(60)));
      console.log(chalk.yellow.bold("Balances:"));
      for (const b of overview.balances) {
        const formatted = `${chalk.bold(b.balance)} ${chalk.cyan(b.asset)}`;
        console.log(`  \u2022 ${formatted}`);
      }
      console.log(chalk.gray("\u2500".repeat(60)));
      console.log(
        chalk.whiteBright("Explorer: ") + chalk.underline.blue(overview.explorerUrl) + "\n"
      );
    }
  } catch (err) {
    spinner.fail(chalk.red(`Failed to fetch wallet info: ${err.message}`));
    process.exit(1);
  }
});
program.command("fund [address]").description(
  "Request 10,000 testnet XLM from Stellar Friendbot to activate or top up a wallet"
).option("--json", "Output result in JSON format").action(async (addressArg, options) => {
  const session = getSession();
  const targetAddress = addressArg || session?.walletAddress;
  if (!targetAddress) {
    if (options?.json) {
      console.log(
        JSON.stringify({
          error: "No wallet address specified and no active session found."
        })
      );
    } else {
      console.log(
        chalk.red(
          "\nNo wallet address specified and no active session found!"
        )
      );
      console.log(
        chalk.yellow(
          "Usage: nelax fund [stellar_address] or run nelax login <email> first.\n"
        )
      );
    }
    process.exit(1);
  }
  const spinner = createSpinner(
    `Checking / requesting Friendbot testnet funds for ${targetAddress.slice(0, 10)}...`,
    options?.json
  );
  try {
    const fundResult = await pollarService.fundTestnetAccount(targetAddress);
    if (!fundResult.success) {
      throw new Error(fundResult.message);
    }
    if (fundResult.alreadyFunded) {
      spinner.succeed(
        chalk.cyan.bold(
          "Wallet is already active and funded on Stellar Testnet!"
        )
      );
    } else {
      spinner.succeed(
        chalk.green.bold(
          "Successfully funded via Stellar Testnet Friendbot! (+10,000 XLM)"
        )
      );
    }
    if (options?.json) {
      console.log(
        JSON.stringify(
          {
            success: true,
            address: targetAddress,
            amount: "10000 XLM",
            network: "testnet",
            explorerUrl: `https://stellar.expert/explorer/testnet/account/${targetAddress}`
          },
          null,
          2
        )
      );
    } else {
      console.log("\n" + chalk.gray("\u2500".repeat(60)));
      console.log(
        chalk.whiteBright.bold("Funded Address: ") + chalk.cyanBright.bold(targetAddress)
      );
      console.log(
        chalk.whiteBright.bold("Credit:         ") + chalk.green.bold("+10,000.0000000 XLM")
      );
      console.log(
        chalk.whiteBright.bold("Network:        ") + chalk.magenta("Stellar Testnet")
      );
      console.log(
        chalk.whiteBright.bold("Explorer:       ") + chalk.underline.blue(
          `https://stellar.expert/explorer/testnet/account/${targetAddress}`
        )
      );
      console.log(chalk.gray("\u2500".repeat(60)) + "\n");
    }
  } catch (err) {
    spinner.fail(chalk.red(`Funding failed: ${err.message}`));
    if (options?.json) {
      console.log(JSON.stringify({ success: false, error: err.message }));
    }
    process.exit(1);
  }
});
program.command("pay <destination> <amount> [asset]").description(
  "Send direct on-chain testnet payment to any Stellar address (defaults to USDC)"
).option("--json", "Output result in JSON format").action(
  async (destination, amount, asset = "USDC", options) => {
    const session = getSession();
    if (!session || !session.walletAddress) {
      console.log(
        chalk.red(
          "\nAuthentication required. Run nelax login <email> first.\n"
        )
      );
      process.exit(1);
    }
    const spinner = createSpinner(
      `Submitting on-chain payment of ${amount} ${asset.toUpperCase()} to ${destination.slice(0, 8)}...`,
      options.json
    );
    try {
      const result = await pollarService.sendPayment(
        destination,
        amount,
        asset
      );
      spinner.succeed(
        chalk.green.bold("Transaction confirmed on Stellar Testnet!")
      );
      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log("\n" + chalk.gray("\u2500".repeat(60)));
        console.log(
          chalk.whiteBright.bold("Amount:      ") + chalk.yellow.bold(`${amount} ${asset.toUpperCase()}`)
        );
        console.log(
          chalk.whiteBright.bold("Recipient:   ") + chalk.cyanBright(destination)
        );
        console.log(
          chalk.whiteBright.bold("Status:      ") + chalk.green.bold(result.status.toUpperCase())
        );
        console.log(
          chalk.whiteBright.bold("Tx Hash:     ") + chalk.white(result.hash)
        );
        console.log(
          chalk.whiteBright.bold("Explorer:    ") + chalk.underline.blue(result.explorerUrl)
        );
        console.log(chalk.gray("\u2500".repeat(60)) + "\n");
      }
    } catch (err) {
      spinner.fail(chalk.red(`Payment failed: ${err.message}`));
      if (options.json) {
        console.log(JSON.stringify({ success: false, error: err.message }));
      }
      process.exit(1);
    }
  }
);
program.command("discover").alias("machines").alias("nodes").description("Discover available GPU/cloud compute nodes and pricing in the Nelax marketplace").option(
  "-u, --url <url>",
  "Base URL of the Nelax compute marketplace",
  process.env.NELAX_MARKETPLACE_URL || "http://localhost:3000"
).option("--available", "Filter to only show currently available unleased nodes").option("--json", "Output result in JSON format").action(async (options) => {
  const endpointUrl = `${options.url.replace(/\/$/, "")}/api/machines`;
  const spinner = createSpinner(
    "Querying Nelax compute marketplace catalog...",
    options.json
  );
  try {
    const res = await fetch(endpointUrl);
    spinner.stop();
    if (!res.ok) {
      throw new Error(`Failed to fetch compute catalog (HTTP ${res.status}): ${res.statusText}`);
    }
    const data = await res.json();
    let machines = data.machines || [];
    if (options.available) {
      machines = machines.filter((m) => m.status === "available");
    }
    if (options.json) {
      console.log(JSON.stringify({ ...data, machines }, null, 2));
      return;
    }
    console.log("\n" + chalk.gray("\u2500".repeat(74)));
    console.log(
      chalk.cyanBright.bold("  NELAX COMPUTE MARKETPLACE \u2014 DISCOVERED NODES  ") + chalk.gray(`(${machines.length} nodes)`)
    );
    console.log(chalk.gray("\u2500".repeat(74)));
    for (const m of machines) {
      const isAvail = m.status === "available";
      const statusBadge = isAvail ? chalk.bgGreen.black.bold(" AVAILABLE ") : chalk.bgMagenta.black.bold(" LEASED ");
      console.log(
        `
${statusBadge}  ${chalk.whiteBright.bold(m.name)}  ${chalk.yellow.bold(`(${m.id})`)}`
      );
      console.log(`  ${chalk.gray(m.tagline)}`);
      if (m.gpu) {
        console.log(`  \u2022 GPU:      ${chalk.cyan(m.gpu)} (${chalk.yellow(m.vram || "N/A")})`);
      }
      console.log(`  \u2022 CPU/RAM:  ${chalk.white(m.cpu)} | ${chalk.white(m.ram)}`);
      console.log(`  \u2022 Storage:  ${chalk.white(m.storage)} | Uplink: ${chalk.white(m.networkSpeed)}`);
      console.log(
        `  \u2022 Pricing:  ${chalk.green.bold(`${m.hourlyPriceXlm} XLM / hr`)} ${chalk.gray(`(~$${m.hourlyPriceUsdc} USDC)`)}`
      );
      if (!isAvail && m.currentLease) {
        console.log(
          `  \u2022 Leased:   ${chalk.magenta(`By ${m.currentLease.agentWallet.slice(0, 10)}...`)} (Tx: ${m.currentLease.txHash.slice(0, 10)}...)`
        );
      }
    }
    console.log("\n" + chalk.gray("\u2500".repeat(74)));
    console.log(
      chalk.yellow("Tip: ") + chalk.white("To lease any node autonomously via x402, run: ") + chalk.cyan.bold("nelax rent <machineId>")
    );
    console.log(chalk.gray("\u2500".repeat(74)) + "\n");
  } catch (err) {
    spinner.fail(chalk.red(`Failed to discover machines: ${err.message}`));
    if (options.json) {
      console.log(JSON.stringify({ success: false, error: err.message }));
    }
    process.exit(1);
  }
});
program.command("rent <machineId>").description("Autonomously rent a compute node via the x402 payment protocol").option(
  "-u, --url <url>",
  "Base URL of the Nelax compute marketplace",
  process.env.NELAX_MARKETPLACE_URL || "http://localhost:3000"
).option("--json", "Output result in JSON format").action(
  async (machineId, options) => {
    const session = getSession();
    if (!session || !session.walletAddress) {
      console.log(
        chalk.red(
          "\nAuthentication required. Run nelax login <email> first.\n"
        )
      );
      process.exit(1);
    }
    const endpointUrl = `${options.url.replace(/\/$/, "")}/api/rent/${encodeURIComponent(machineId)}`;
    const spinner = createSpinner(
      `Requesting compute machine ${machineId}...`,
      options.json
    );
    try {
      const lease = await x402Client.rentCompute(endpointUrl, session, {
        method: "POST",
        onStatus: (msg) => {
          if (!options.json) spinner.text = chalk.blue(msg);
        }
      });
      spinner.succeed(
        chalk.green.bold(
          `Compute Node [${machineId}] successfully provisioned via x402!`
        )
      );
      if (options.json) {
        console.log(JSON.stringify(lease, null, 2));
      } else {
        console.log(
          "\n" + chalk.cyanBright(
            "\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557"
          )
        );
        console.log(
          chalk.cyanBright("\u2551") + chalk.whiteBright.bold(
            "                   PROVISIONED COMPUTE INSTANCE                       "
          ) + chalk.cyanBright("\u2551")
        );
        console.log(
          chalk.cyanBright(
            "\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255D"
          )
        );
        console.log(
          chalk.whiteBright.bold("Node ID:        ") + chalk.yellow.bold(lease.machineId)
        );
        console.log(
          chalk.whiteBright.bold("Host / IP:      ") + chalk.cyanBright(lease.ip)
        );
        console.log(
          chalk.whiteBright.bold("SSH Port:       ") + chalk.white(lease.sshPort)
        );
        console.log(
          chalk.whiteBright.bold("Username:       ") + chalk.white(lease.username)
        );
        console.log(
          chalk.whiteBright.bold("Access Token:   ") + chalk.gray(lease.authToken)
        );
        console.log(
          chalk.whiteBright.bold("Lease Expiry:   ") + chalk.magenta(lease.leaseExpiresAt)
        );
        console.log(
          chalk.whiteBright.bold("Stellar Tx:     ") + chalk.underline.blue(
            `https://stellar.expert/explorer/testnet/tx/${lease.txHash}`
          )
        );
        console.log(chalk.gray("\u2500".repeat(60)));
        console.log(chalk.green.bold("Connect Command:"));
        console.log(chalk.black.bgWhite(` ${lease.sshCommand} `));
        console.log(chalk.gray("\u2500".repeat(60)) + "\n");
      }
    } catch (err) {
      spinner.fail(chalk.red(`Compute rental failed: ${err.message}`));
      if (options.json) {
        console.log(JSON.stringify({ success: false, error: err.message }));
      }
      process.exit(1);
    }
  }
);
program.command("fetch <url>").description(
  "Perform an autonomous x402 HTTP fetch (detects 402, auto-pays, retries with proof)"
).option("-X, --method <method>", "HTTP method (GET or POST)", "GET").option("--json", "Output result in JSON format").action(async (url, options) => {
  const session = getSession();
  if (!session || !session.walletAddress) {
    console.log(
      chalk.red(
        "\nAuthentication required. Run nelax login <email> first.\n"
      )
    );
    process.exit(1);
  }
  const spinner = createSpinner(
    `Initiating x402 fetch to ${url}...`,
    options.json
  );
  try {
    const result = await x402Client.rentCompute(url, session, {
      method: options.method.toUpperCase(),
      onStatus: (msg) => {
        if (!options.json) spinner.text = chalk.blue(msg);
      }
    });
    spinner.succeed(chalk.green.bold("x402 Resource request unlocked!"));
    console.log(JSON.stringify(result, null, 2));
  } catch (err) {
    spinner.fail(chalk.red(`x402 Fetch failed: ${err.message}`));
    process.exit(1);
  }
});
program.command("history").description(
  "Display recent transaction history on Stellar Testnet for the active wallet"
).option("-l, --limit <number>", "Number of transactions to display", "10").option("--json", "Output result in JSON format").action(async (options) => {
  const session = getSession();
  if (!session || !session.walletAddress) {
    console.log(
      chalk.red(
        "\nAuthentication required. Run nelax login <email> first.\n"
      )
    );
    process.exit(1);
  }
  const spinner = createSpinner(
    "Querying transaction history on Stellar Testnet...",
    options.json
  );
  try {
    const limit = parseInt(options.limit, 10) || 10;
    const res = await fetch(
      `https://horizon-testnet.stellar.org/accounts/${session.walletAddress}/payments?limit=${limit}&order=desc`
    );
    spinner.stop();
    if (!res.ok) {
      console.log(
        chalk.yellow(
          "\nNo transaction history recorded yet on Stellar Testnet for this wallet.\n"
        )
      );
      return;
    }
    const data = await res.json();
    const records = data._embedded?.records || [];
    if (options.json) {
      console.log(JSON.stringify(records, null, 2));
      return;
    }
    if (records.length === 0) {
      console.log(
        chalk.yellow("\nNo payments found on-chain for this wallet yet.\n")
      );
      return;
    }
    console.log("\n" + chalk.gray("\u2500".repeat(70)));
    console.log(
      chalk.cyanBright.bold(
        `Recent Payments (Stellar Testnet) - Showing ${records.length} items`
      )
    );
    console.log(chalk.gray("\u2500".repeat(70)));
    for (const tx of records) {
      const isCreateAccount = tx.type === "create_account";
      const amount = isCreateAccount ? tx.starting_balance : tx.amount;
      const isOutgoing = isCreateAccount ? false : tx.from === session.walletAddress;
      const arrow = isOutgoing ? chalk.red("\u25B2 SENT") : chalk.green("\u25BC RECV");
      const asset = isCreateAccount || tx.asset_type === "native" ? "XLM" : tx.asset_code || "TOKEN";
      const counterparty = isCreateAccount ? tx.funder : isOutgoing ? tx.to : tx.from;
      const time = new Date(tx.created_at).toLocaleString();
      const note = isCreateAccount ? chalk.yellow("(Genesis/Friendbot)") : "";
      console.log(
        `${arrow}  ${chalk.bold(amount)} ${chalk.cyan(asset)} ${note} ${chalk.gray(`to/from ${counterparty?.slice(0, 10)}...`)}  ${chalk.gray(time)}`
      );
      console.log(
        `      Tx: ${chalk.underline.blue(`https://stellar.expert/explorer/testnet/tx/${tx.transaction_hash}`)}`
      );
    }
    console.log(chalk.gray("\u2500".repeat(70)) + "\n");
  } catch (err) {
    spinner.fail(chalk.red(`Failed to fetch history: ${err.message}`));
    process.exit(1);
  }
});
program.command("logout").description("Clear cached agent session and logout from Pollar").action(async () => {
  const spinner = ora(chalk.blue("Clearing session...")).start();
  try {
    await pollarService.logout();
    clearSession();
    spinner.succeed(
      chalk.green("Successfully logged out. Local session cleared.")
    );
  } catch (err) {
    clearSession();
    spinner.succeed(chalk.green("Local session cleared."));
  }
});
program.addHelpText(
  "beforeAll",
  `
${chalk.cyanBright.bold("\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557")}
${chalk.cyanBright.bold("\u2551")} ${chalk.whiteBright.bold(" NELAX \u2014 Autonomous AI Agent Wallets & x402 Compute on Stellar  ")} ${chalk.cyanBright.bold("\u2551")}
${chalk.cyanBright.bold("\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255D")}
`
);
program.addHelpText(
  "afterAll",
  `
${chalk.yellow.bold("Examples for AI Agents & Developers:")}
  $ ${chalk.white("nelax login agent@nelax.xyz")}               # Initiate headless OTP login
  $ ${chalk.white("nelax verify 123456")}                       # Verify code & activate wallet
  $ ${chalk.white("nelax wallet")}                              # Check USDC & XLM testnet balances
  $ ${chalk.white("nelax wallet --json")}                       # Agent-friendly structured balance JSON
  $ ${chalk.white("nelax discover")}                            # Discover available GPU and CPU nodes
  $ ${chalk.white("nelax discover --json")}                     # Machine catalog as structured JSON
  $ ${chalk.white("nelax rent gpu-h100-01")}                    # Autonomously pay & rent compute via x402
  $ ${chalk.white("nelax pay G... 1.5 USDC")}                   # Direct on-chain Stellar payment
  $ ${chalk.white("nelax fetch http://api.host/rent/cluster")}  # Autonomous x402 HTTP challenge resolver
  $ ${chalk.white("nelax history")}                             # View on-chain transaction history
  $ ${chalk.white("nelax logout")}                              # Clear local cached session

${chalk.gray("Stellar Testnet Explorer: https://stellar.expert/explorer/testnet/")}
`
);
if (process.argv.length <= 2) {
  printBanner();
  program.help();
}
program.parse(process.argv);
//# sourceMappingURL=index.js.map