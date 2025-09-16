<script lang='ts'>
    import { successArray, mints, invoices } from '../../stores.js';
    import { tokenPrices } from '../../priceStore.js';
    import { onMount } from 'svelte';
    import dayjs from 'dayjs';

    let totalRevenue = 0;
    let totalTransactions = 0;
    let averageSale = 0;

    onMount(() => {
        const unsubscribe = tokenPrices.subscribe(prices => {
            if (Object.keys(prices).length === 0) return;
            
            // Combine direct sales with paid invoices
            const paidInvoicesAsSales = $invoices.filter(inv => inv.status === 'Paid').map(inv => ({
                timestamp: dayjs(inv.issueDate).unix(),
                uiAmount: inv.total,
                mint: inv.paymentCurrency,
                items: inv.items,
                txid: `invoice-${inv.id}`
            }));
            const allSales = [...$successArray, ...paidInvoicesAsSales];

            const getTxnUsdValue = (txn) => {
                const mintInfo = $mints.find(m => m.name === txn.mint);
                if (!mintInfo) return 0;
                const price = prices[mintInfo.coingeckoId]?.usd || 0;
                return txn.uiAmount * price;
            };

            totalTransactions = allSales.length;
            if (totalTransactions > 0) {
                totalRevenue = allSales.reduce((acc, curr) => acc + getTxnUsdValue(curr), 0);
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
