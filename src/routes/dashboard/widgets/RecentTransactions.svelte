<script lang='ts'>
    import { successArray, invoices } from '../../stores.js';
    import dayjs from 'dayjs';
    $: paidInvoicesAsSales = $invoices.filter(inv => inv.status === 'Paid').map(inv => ({
        txnId: `invoice-paid-${inv.id}`, // <--- MODIFIED: Added internal ID
        timestamp: dayjs(inv.issueDate).unix(),
        uiAmount: inv.total,
        mint: inv.paymentCurrency,
        items: inv.items,
        txid: `Invoice #${inv.number}`
    }));
    $: allSales = [...$successArray, ...paidInvoicesAsSales];

    $: recentSales = allSales.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)).slice(0, 3);
</script>

<div class="card-body">
    <h2 class="card-title text-xl font-greycliffmed mb-4">Recent Transactions</h2>
    <div class="overflow-x-auto">
        <table class="table w-full table-sm">
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Transaction ID</th>
     
                <th class="text-right">Amount</th>
                </tr>
            </thead>
            <tbody>
                {#each recentSales as item (item.txnId || item.txid)}
                    <tr class="hover">
   
                        <td>{dayjs.unix(item.timestamp).format("YYYY-MM-DD HH:mm")}</td>
                        <td>
                            {#if item.txid.startsWith('Invoice')}
                         
    <span>{item.txid}</span>
                            {:else if item.txid.startsWith('pi_')}
                                <a class="link link-primary" href={`https://dashboard.stripe.com/payments/${item.txid}`} target="_blank" rel="noopener noreferrer">
                         
                Stripe Payment...
                                </a>
                            {:else}
                            
    <a class="link link-primary" href={`https://solscan.io/tx/${item.txid}`} target="_blank" rel="noopener noreferrer">
                                    {item.txid.substring(0, 4)}...{item.txid.substring(item.txid.length - 4)}
                                </a>
                   
                          {/if}
                        </td>
                        <td class="text-right font-mono">{item.uiAmount.toFixed(2)} {item.mint}</td>
                    </tr>
                {/each}
    
                {#if allSales.length === 0}
                    <tr>
                        <td colspan="3" class="text-center text-gray-500 py-4">No transactions yet.</td>
                    </tr>
               
    {/if}
            </tbody>
        </table>
    </div>
</div>
