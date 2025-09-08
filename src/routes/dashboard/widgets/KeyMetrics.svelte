<script lang='ts'>
    import { successArray, mints } from '../../stores.js';
    import { tokenPrices } from '../../priceStore.js';
    import { onMount } from 'svelte';

    let totalRevenue = 0;
    let totalTransactions = 0;
    let averageSale = 0;
    
    onMount(() => {
        const mintMap = new Map($mints.map(m => [m.mint, m.coingeckoId]));
        
        const unsubscribe = tokenPrices.subscribe(prices => {
            if (Object.keys(prices).length === 0) return;

            const getTxnUsdValue = (txn) => {
                // Find the mint address from the successArray's mint name (e.g., "SOL")
                const mintInfo = $mints.find(m => m.name === txn.mint);
                if (!mintInfo) return 0;

                const coingeckoId = mintMap.get(mintInfo.mint);
                const price = prices[coingeckoId]?.usd || 0;
                return txn.uiAmount * price;
            };

            totalTransactions = $successArray.length;
            if (totalTransactions > 0) {
                totalRevenue = $successArray.reduce((acc, curr) => acc + getTxnUsdValue(curr), 0);
                averageSale = totalRevenue / totalTransactions;
            } else {
                totalRevenue = 0;
                averageSale = 0;
            }
        });

        return unsubscribe;
    });
</script>

<div class="card-body items-center text-center">
    <h2 class="card-title text-xl font-greycliffmed">Key Metrics</h2>
    <div class="stats stats-vertical lg:stats-horizontal shadow">
        <div class="stat">
            <div class="stat-title">Total Revenue</div>
            <div class="stat-value text-primary">${totalRevenue.toFixed(2)}</div>
        </div>
        <div class="stat">
            <div class="stat-title">Total Transactions</div>
            <div class="stat-value text-secondary">{totalTransactions}</div>
        </div>
        <div class="stat">
            <div class="stat-title">Average Sale</div>
            <div class="stat-value text-accent">${averageSale.toFixed(2)}</div>
        </div>
    </div>
</div>
