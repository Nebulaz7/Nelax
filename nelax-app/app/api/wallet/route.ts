import { NextResponse } from 'next/server';

const DEFAULT_WALLET =
  process.env.NELAX_AGENT_WALLET ||
  process.env.NELAX_PROVIDER_WALLET ||
  'GCWDVYVPM7ORTD5INWSP3C5TRV5TRBEIHZWY3K4HS3STLKJE5I7OSMVB';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address') || DEFAULT_WALLET;

  try {
    const horizonUrl = `https://horizon-testnet.stellar.org/accounts/${encodeURIComponent(address)}`;
    const accountRes = await fetch(horizonUrl, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 10 },
    });

    if (!accountRes.ok) {
      return NextResponse.json({
        success: false,
        address,
        network: 'stellar:testnet',
        error: 'Account not found on Stellar Testnet',
        balances: [{ asset: 'XLM', balance: '0.0000000', isNative: true }],
        totalUsd: '0.00',
      });
    }

    const accountData: any = await accountRes.json();

    const balances = (accountData.balances || []).map((b: any) => {
      const isNative = b.asset_type === 'native';
      const asset = isNative ? 'XLM' : b.asset_code || 'TOKEN';
      const balanceNum = parseFloat(b.balance || '0');
      // Approximate 1 XLM = $0.25 USD, 1 USDC = $1.00 USD
      const usdRate = asset === 'XLM' ? 0.25 : 1.0;
      const usdValue = (balanceNum * usdRate).toFixed(2);

      return {
        asset,
        balance: b.balance,
        isNative,
        usdValue,
        issuer: b.asset_issuer,
      };
    });

    const totalUsd = balances
      .reduce((sum: number, b: any) => sum + parseFloat(b.usdValue || '0'), 0)
      .toFixed(2);

    // Fetch recent payment activity
    let recentPayments: any[] = [];
    try {
      const paymentsRes = await fetch(
        `https://horizon-testnet.stellar.org/accounts/${encodeURIComponent(address)}/payments?limit=10&order=desc`,
        { headers: { Accept: 'application/json' } }
      );
      if (paymentsRes.ok) {
        const payData: any = await paymentsRes.json();
        recentPayments = (payData._embedded?.records || []).map((p: any) => {
          const isCreate = p.type === 'create_account';
          const amount = isCreate ? p.starting_balance : p.amount;
          const isOutgoing = isCreate ? false : p.from === address;
          const asset = isCreate || p.asset_type === 'native' ? 'XLM' : p.asset_code || 'USDC';

          return {
            id: p.id,
            type: p.type,
            amount,
            asset,
            isOutgoing,
            counterparty: isCreate ? p.funder : isOutgoing ? p.to : p.from,
            timestamp: p.created_at,
            txHash: p.transaction_hash,
          };
        });
      }
    } catch {
      // payments query optional fallback
    }

    return NextResponse.json({
      success: true,
      address,
      network: 'stellar:testnet',
      balances,
      totalUsd,
      sequence: accountData.sequence,
      recentPayments,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to query Stellar Horizon' },
      { status: 500 }
    );
  }
}
