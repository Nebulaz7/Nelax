import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { pollarService } from './pollar.js';
import { getSession, saveSession, clearSession, hasSession, getSessionPath } from './session.js';
import { x402Client } from './x402.js';

const program = new Command();

// Custom banner
function printBanner() {
  console.log(chalk.cyanBright.bold('\n╔══════════════════════════════════════════════════════════════════════╗'));
  console.log(chalk.cyanBright.bold('║') + chalk.whiteBright.bold('   ⚡ NELAX — Autonomous AI Agent Wallets & x402 Compute on Stellar   ') + chalk.cyanBright.bold('║'));
  console.log(chalk.cyanBright.bold('╚══════════════════════════════════════════════════════════════════════╝\n'));
}

program
  .name('nelax')
  .description(chalk.cyanBright('⚡ Nelax — Autonomous AI Agent Wallets on Stellar (Pollar & x402)'))
  .version('0.1.0', '-v, --version', 'Output the current version of Nelax CLI');

// ==========================================
// Command: LOGIN
// ==========================================
program
  .command('login <email>')
  .description('Initiate headless email OTP login for an AI agent or developer')
  .option('--json', 'Output result in JSON format')
  .action(async (email: string, options: { json?: boolean }) => {
    const spinner = ora(chalk.blue(`Requesting OTP code for ${chalk.bold(email)}...`)).start();
    try {
      const { clientSessionId } = await pollarService.requestEmailOtp(email);
      saveSession({ email, clientSessionId, verified: false });
      spinner.succeed(chalk.green(`OTP verification code successfully sent to ${chalk.bold(email)}`));

      if (options.json) {
        console.log(JSON.stringify({ success: true, email, clientSessionId, step: 'entering_code' }));
      } else {
        console.log(chalk.yellow(`\nNext step: Run ${chalk.bold(`nelax verify <code>`)} to complete login and activate your wallet.\n`));
      }
    } catch (err: any) {
      spinner.fail(chalk.red(`Failed to send verification code: ${err.message}`));
      if (options.json) {
        console.log(JSON.stringify({ success: false, error: err.message }));
      }
      process.exit(1);
    }
  });

// ==========================================
// Command: VERIFY
// ==========================================
program
  .command('verify <code>')
  .description('Verify the received OTP code and retrieve/deploy the Stellar wallet')
  .option('--json', 'Output result in JSON format')
  .action(async (code: string, options: { json?: boolean }) => {
    const currentSession = getSession();
    const spinner = ora(chalk.blue('Verifying OTP code and configuring non-custodial Stellar wallet...')).start();

    try {
      const { walletAddress, session } = await pollarService.verifyEmailOtp(
        code.trim(),
        currentSession?.clientSessionId
      );
      saveSession({
        walletAddress,
        sessionToken: session?.token || session?.id,
        verified: true,
        network: 'testnet',
      });

      spinner.succeed(chalk.green.bold('Authentication successful! Wallet active.'));

      if (options.json) {
        console.log(
          JSON.stringify({
            success: true,
            walletAddress,
            network: 'testnet',
            explorerUrl: `https://testnet.stellar.expert/explorer/testnet/account/${walletAddress}`,
          })
        );
      } else {
        console.log('\n' + chalk.gray('─'.repeat(60)));
        console.log(chalk.whiteBright.bold('Stellar Wallet Address: ') + chalk.cyanBright.bold(walletAddress));
        console.log(chalk.whiteBright.bold('Network:                ') + chalk.magenta('Stellar Testnet'));
        console.log(
          chalk.whiteBright.bold('Explorer:               ') +
            chalk.underline.blue(`https://testnet.stellar.expert/explorer/testnet/account/${walletAddress}`)
        );
        console.log(chalk.gray('─'.repeat(60)));
        console.log(chalk.gray(`Session cached locally at: ${getSessionPath()}`));
        console.log(chalk.yellow(`\nTip: Run ${chalk.bold('nelax wallet')} to view your testnet USDC balance.\n`));
      }
    } catch (err: any) {
      spinner.fail(chalk.red(`Verification failed: ${err.message}`));
      if (options.json) {
        console.log(JSON.stringify({ success: false, error: err.message }));
      }
      process.exit(1);
    }
  });

// ==========================================
// Command: WALLET / BALANCE
// ==========================================
program
  .command('wallet')
  .alias('balance')
  .description('Inspect current wallet address, testnet USDC and XLM balances')
  .option('--json', 'Output result in JSON format')
  .action(async (options: { json?: boolean }) => {
    const session = getSession();
    if (!session || !session.walletAddress) {
      if (options.json) {
        console.log(JSON.stringify({ error: 'No active session found. Run nelax login <email> first.' }));
      } else {
        console.log(chalk.red('\nNo active session found!'));
        console.log(chalk.yellow(`Run ${chalk.bold('nelax login <email>')} to initialize your agent wallet.\n`));
      }
      process.exit(1);
    }

    const spinner = ora(chalk.blue('Fetching Stellar testnet balances...')).start();
    try {
      const overview = await pollarService.getWalletOverview(session.walletAddress);
      spinner.stop();

      if (options.json) {
        console.log(JSON.stringify(overview, null, 2));
      } else {
        console.log('\n' + chalk.gray('─'.repeat(60)));
        console.log(chalk.whiteBright.bold('Agent Wallet:   ') + chalk.cyanBright.bold(overview.address));
        console.log(chalk.whiteBright.bold('Network:        ') + chalk.magenta('Stellar Testnet'));
        console.log(chalk.whiteBright.bold('Status:         ') + chalk.green('Active (Pollar Sponsored)'));
        console.log(chalk.gray('─'.repeat(60)));
        console.log(chalk.yellow.bold('Balances:'));
        for (const b of overview.balances) {
          const formatted = `${chalk.bold(b.balance)} ${chalk.cyan(b.asset)}`;
          console.log(`  • ${formatted}`);
        }
        console.log(chalk.gray('─'.repeat(60)));
        console.log(chalk.whiteBright('Explorer: ') + chalk.underline.blue(overview.explorerUrl) + '\n');
      }
    } catch (err: any) {
      spinner.fail(chalk.red(`Failed to fetch wallet info: ${err.message}`));
      process.exit(1);
    }
  });

// ==========================================
// Command: PAY (Direct P2P Payment)
// ==========================================
program
  .command('pay <destination> <amount> [asset]')
  .description('Send direct on-chain testnet payment to any Stellar address (defaults to USDC)')
  .option('--json', 'Output result in JSON format')
  .action(async (destination: string, amount: string, asset: string = 'USDC', options: { json?: boolean }) => {
    const session = getSession();
    if (!session || !session.walletAddress) {
      console.log(chalk.red('\nAuthentication required. Run nelax login <email> first.\n'));
      process.exit(1);
    }

    const spinner = ora(
      chalk.blue(`Submitting on-chain payment of ${chalk.bold(amount)} ${chalk.bold(asset.toUpperCase())} to ${destination.slice(0, 8)}...`)
    ).start();

    try {
      const result = await pollarService.sendPayment(destination, amount, asset);
      spinner.succeed(chalk.green.bold('Transaction confirmed on Stellar Testnet!'));

      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log('\n' + chalk.gray('─'.repeat(60)));
        console.log(chalk.whiteBright.bold('Amount:      ') + chalk.yellow.bold(`${amount} ${asset.toUpperCase()}`));
        console.log(chalk.whiteBright.bold('Recipient:   ') + chalk.cyanBright(destination));
        console.log(chalk.whiteBright.bold('Status:      ') + chalk.green.bold(result.status.toUpperCase()));
        console.log(chalk.whiteBright.bold('Tx Hash:     ') + chalk.white(result.hash));
        console.log(chalk.whiteBright.bold('Explorer:    ') + chalk.underline.blue(result.explorerUrl));
        console.log(chalk.gray('─'.repeat(60)) + '\n');
      }
    } catch (err: any) {
      spinner.fail(chalk.red(`Payment failed: ${err.message}`));
      if (options.json) {
        console.log(JSON.stringify({ success: false, error: err.message }));
      }
      process.exit(1);
    }
  });

// ==========================================
// Command: RENT (x402 Autonomous Compute)
// ==========================================
program
  .command('rent <machineId>')
  .description('Autonomously rent a compute node via the x402 payment protocol')
  .option('-u, --url <url>', 'Base URL of the Nelax compute marketplace', process.env.NELAX_MARKETPLACE_URL || 'http://localhost:3000')
  .option('--json', 'Output result in JSON format')
  .action(async (machineId: string, options: { url: string; json?: boolean }) => {
    const session = getSession();
    if (!session || !session.walletAddress) {
      console.log(chalk.red('\nAuthentication required. Run nelax login <email> first.\n'));
      process.exit(1);
    }

    const endpointUrl = `${options.url.replace(/\/$/, '')}/api/rent/${encodeURIComponent(machineId)}`;
    const spinner = ora(chalk.blue(`Requesting compute machine ${chalk.bold(machineId)}...`)).start();

    try {
      const lease = await x402Client.rentCompute(endpointUrl, session, {
        method: 'POST',
        onStatus: (msg) => {
          spinner.text = chalk.blue(msg);
        },
      });

      spinner.succeed(chalk.green.bold(`Compute Node [${machineId}] successfully provisioned via x402!`));

      if (options.json) {
        console.log(JSON.stringify(lease, null, 2));
      } else {
        console.log('\n' + chalk.cyanBright('╔══════════════════════════════════════════════════════════════════════╗'));
        console.log(chalk.cyanBright('║') + chalk.whiteBright.bold('                   PROVISIONED COMPUTE INSTANCE                       ') + chalk.cyanBright('║'));
        console.log(chalk.cyanBright('╚══════════════════════════════════════════════════════════════════════╝'));
        console.log(chalk.whiteBright.bold('Node ID:        ') + chalk.yellow.bold(lease.machineId));
        console.log(chalk.whiteBright.bold('Host / IP:      ') + chalk.cyanBright(lease.ip));
        console.log(chalk.whiteBright.bold('SSH Port:       ') + chalk.white(lease.sshPort));
        console.log(chalk.whiteBright.bold('Username:       ') + chalk.white(lease.username));
        console.log(chalk.whiteBright.bold('Access Token:   ') + chalk.gray(lease.authToken));
        console.log(chalk.whiteBright.bold('Lease Expiry:   ') + chalk.magenta(lease.leaseExpiresAt));
        console.log(chalk.whiteBright.bold('Stellar Tx:     ') + chalk.underline.blue(`https://testnet.stellar.expert/explorer/testnet/tx/${lease.txHash}`));
        console.log(chalk.gray('─'.repeat(60)));
        console.log(chalk.green.bold('Connect Command:'));
        console.log(chalk.black.bgWhite(` ${lease.sshCommand} `));
        console.log(chalk.gray('─'.repeat(60)) + '\n');
      }
    } catch (err: any) {
      spinner.fail(chalk.red(`Compute rental failed: ${err.message}`));
      if (options.json) {
        console.log(JSON.stringify({ success: false, error: err.message }));
      }
      process.exit(1);
    }
  });

// ==========================================
// Command: FETCH (Generic x402 Fetch)
// ==========================================
program
  .command('fetch <url>')
  .description('Perform an autonomous x402 HTTP fetch (detects 402, auto-pays, retries with proof)')
  .option('-X, --method <method>', 'HTTP method (GET or POST)', 'GET')
  .option('--json', 'Output result in JSON format')
  .action(async (url: string, options: { method: string; json?: boolean }) => {
    const session = getSession();
    if (!session || !session.walletAddress) {
      console.log(chalk.red('\nAuthentication required. Run nelax login <email> first.\n'));
      process.exit(1);
    }

    const spinner = ora(chalk.blue(`Initiating x402 fetch to ${url}...`)).start();
    try {
      const result = await x402Client.rentCompute(url, session, {
        method: options.method.toUpperCase() as 'GET' | 'POST',
        onStatus: (msg) => {
          spinner.text = chalk.blue(msg);
        },
      });

      spinner.succeed(chalk.green.bold('x402 Resource request unlocked!'));
      console.log(JSON.stringify(result, null, 2));
    } catch (err: any) {
      spinner.fail(chalk.red(`x402 Fetch failed: ${err.message}`));
      process.exit(1);
    }
  });

// ==========================================
// Command: HISTORY
// ==========================================
program
  .command('history')
  .description('Display recent transaction history on Stellar Testnet for the active wallet')
  .option('-l, --limit <number>', 'Number of transactions to display', '10')
  .option('--json', 'Output result in JSON format')
  .action(async (options: { limit: string; json?: boolean }) => {
    const session = getSession();
    if (!session || !session.walletAddress) {
      console.log(chalk.red('\nAuthentication required. Run nelax login <email> first.\n'));
      process.exit(1);
    }

    const spinner = ora(chalk.blue('Querying transaction history on Stellar Testnet...')).start();
    try {
      const limit = parseInt(options.limit, 10) || 10;
      const res = await fetch(`https://horizon-testnet.stellar.org/accounts/${session.walletAddress}/payments?limit=${limit}&order=desc`);
      spinner.stop();

      if (!res.ok) {
        console.log(chalk.yellow('\nNo transaction history recorded yet on Stellar Testnet for this wallet.\n'));
        return;
      }

      const data: any = await res.json();
      const records = data._embedded?.records || [];

      if (options.json) {
        console.log(JSON.stringify(records, null, 2));
        return;
      }

      if (records.length === 0) {
        console.log(chalk.yellow('\nNo payments found on-chain for this wallet yet.\n'));
        return;
      }

      console.log('\n' + chalk.gray('─'.repeat(70)));
      console.log(chalk.cyanBright.bold(`Recent Payments (Stellar Testnet) - Showing ${records.length} items`));
      console.log(chalk.gray('─'.repeat(70)));

      for (const tx of records) {
        const isOutgoing = tx.from === session.walletAddress;
        const arrow = isOutgoing ? chalk.red('▲ SENT') : chalk.green('▼ RECV');
        const asset = tx.asset_type === 'native' ? 'XLM' : tx.asset_code || 'TOKEN';
        const counterparty = isOutgoing ? tx.to : tx.from;
        const time = new Date(tx.created_at).toLocaleString();

        console.log(`${arrow}  ${chalk.bold(tx.amount)} ${chalk.cyan(asset)}  ${chalk.gray(`to/from ${counterparty?.slice(0, 10)}...`)}  ${chalk.gray(time)}`);
        console.log(`      Tx: ${chalk.underline.blue(`https://testnet.stellar.expert/explorer/testnet/tx/${tx.transaction_hash}`)}`);
      }
      console.log(chalk.gray('─'.repeat(70)) + '\n');
    } catch (err: any) {
      spinner.fail(chalk.red(`Failed to fetch history: ${err.message}`));
      process.exit(1);
    }
  });

// ==========================================
// Command: LOGOUT
// ==========================================
program
  .command('logout')
  .description('Clear cached agent session and logout from Pollar')
  .action(async () => {
    const spinner = ora(chalk.blue('Clearing session...')).start();
    try {
      await pollarService.logout();
      clearSession();
      spinner.succeed(chalk.green('Successfully logged out. Local session cleared.'));
    } catch (err: any) {
      clearSession();
      spinner.succeed(chalk.green('Local session cleared.'));
    }
  });

// Custom help configuration
program.addHelpText(
  'beforeAll',
  `
${chalk.cyanBright.bold('╔══════════════════════════════════════════════════════════════════════╗')}
${chalk.cyanBright.bold('║')} ${chalk.whiteBright.bold('  ⚡ NELAX — Autonomous AI Agent Wallets & x402 Compute on Stellar  ')} ${chalk.cyanBright.bold('║')}
${chalk.cyanBright.bold('╚══════════════════════════════════════════════════════════════════════╝')}
`
);

program.addHelpText(
  'afterAll',
  `
${chalk.yellow.bold('Examples for AI Agents & Developers:')}
  $ ${chalk.white('nelax login agent@nelax.xyz')}               # Initiate headless OTP login
  $ ${chalk.white('nelax verify 123456')}                       # Verify code & activate wallet
  $ ${chalk.white('nelax wallet')}                              # Check USDC & XLM testnet balances
  $ ${chalk.white('nelax wallet --json')}                       # Agent-friendly structured balance JSON
  $ ${chalk.white('nelax pay G... 1.5 USDC')}                   # Direct on-chain Stellar payment
  $ ${chalk.white('nelax rent gpu-h100-01')}                    # Autonomously pay & rent compute via x402
  $ ${chalk.white('nelax fetch http://api.host/rent/cluster')}  # Autonomous x402 HTTP challenge resolver
  $ ${chalk.white('nelax history')}                             # View on-chain transaction history
  $ ${chalk.white('nelax logout')}                              # Clear local cached session

${chalk.gray('Stellar Testnet Explorer: https://testnet.stellar.expert/explorer/testnet/')}
`
);

// If no arguments provided, show banner + help
if (process.argv.length <= 2) {
  printBanner();
  program.help();
}

program.parse(process.argv);
