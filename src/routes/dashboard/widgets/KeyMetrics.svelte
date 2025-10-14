<script lang='ts'>
    import { successArray, mints, invoices, customers } from '../../stores.js';
    import { tokenPrices } from '../../priceStore.js';
    import { get } from 'svelte/store';
    import dayjs from 'dayjs';

    let totalRevenue = 0;
    let totalTransactions = 0;
    let averageSale = 0;

    $: paidInvoicesAsSales = $invoices.filter(inv => inv.status === 'Paid').map(inv => ({
        timestamp: dayjs(inv.issueDate).unix(),
        uiAmount: inv.total,
        mint: inv.paymentCurrency,
        items: inv.items,
        txid: `invoice-${inv.id}`
    }));
    $: allSales = [...$successArray, ...paidInvoicesAsSales];

    $: {
        const prices = get(tokenPrices);
        if (prices && Object.keys(prices).length > 0) {
            const getTxnUsdValue = (txn) => {
                // If the transaction was a direct USD card payment, the value is simply the amount.
                if (txn.mint === 'USD') {
                    return txn.uiAmount;
                }
                
                // Otherwise, find the crypto price and calculate the USD value.
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
        }
    }
</script>

<div class="card-body items-center text-center">
    <h2 class="card-title text-xl font-greycliffmed">Key Metrics</h2>
    <div id="key-metrics-widget" class="stats stats-vertical lg:stats-horizontal shadow">
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
