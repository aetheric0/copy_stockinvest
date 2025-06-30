export async function findIncomingTransactionToAddress(
    address: string,
    minAmount: number,
    currency: 'BTC' | 'USDT',
    since?: number
  ): Promise<{ txHash: string; amount: number; timestamp: number } | null> {
    if (process.env.NODE_ENV === "development") {
      return {
        txHash: "TESTNET123FAKEHASH",
        amount: minAmount,
        timestamp: Date.now(),
      }
    }
    try {
      if (currency === 'BTC') {
        const res = await fetch(`https://blockstream.info/api/address/${address}/txs`);
        const txs = await res.json();
  
        for (const tx of txs) {
          if (since && tx.status.block_time * 1000 < since) continue;
  
          for (const vout of tx.vout) {
            if (
              vout.scriptpubkey_address === address &&
              vout.value >= minAmount * 1e8
            ) {
              return {
                txHash: tx.txid,
                amount: vout.value / 1e8,
                timestamp: tx.status.block_time * 1000
              };
            }
          }
        }
      } else if (currency === 'USDT') {
        const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
        const url = `https://api.etherscan.io/api?module=account&action=tokentx&contractaddress=0xdAC17F958D2ee523a2206206994597C13D831ec7&address=${address}&apikey=${ETHERSCAN_API_KEY}`;
        const res = await fetch(url);
        const data = await res.json();
  
        if (data.status !== '1') return null;
  
        for (const tx of data.result) {
          const timestamp = Number(tx.timeStamp) * 1000;
          if (since && timestamp < since) continue;
  
          if (
            tx.to.toLowerCase() === address.toLowerCase() &&
            Number(tx.value) >= minAmount * 1e6
          ) {
            return {
              txHash: tx.hash,
              amount: Number(tx.value) / 1e6,
              timestamp
            };
          }
        }
      }
  
      return null;
    } catch (err) {
      console.error('Error searching blockchain txs:', err);
      return null;
    }
  }
  