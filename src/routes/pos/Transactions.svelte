<script lang='ts'>
    import { successArray } from '../stores.js';
    import dayjs from 'dayjs';
    import { triggerPrint } from '../printStore.js';

    let expandedTransactions = {};
    function toggleTransaction(txid) {
        expandedTransactions[txid] = !expandedTransactions[txid];
    }
</script>

<div id="transactions-card" class="card w-full max-w-4xl bg-base-100 shadow-xl border border-gray-200">
    <div class="card-body p-8">
        <h2 class="card-title text-xl font-greycliffmed text-charcoal mb-4">Transaction History</h2>
        <div class="overflow-x-auto">
            <table class="table w-full">
                <thead>
                    <tr>
                        <th></th>
                        <th class="text-left">Date</th>
                        <th class="text-left">Transaction ID</th>
                        <th class="text-right">Amount</th>
                        <th class="text-right">Currency</th>
                        <th class="text-center">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {#each $successArray as item (item.txid)}
                        <tr class="hover">
                            <td>
                                {#if item.items && item.items.length}
                                    <button class="btn btn-xs btn-ghost" on:click={() => toggleTransaction(item.txid)}>
                                        {expandedTransactions[item.txid] ? '▼' : '►'}
                                    </button>
                                {/if}
                            </td>
                            <td>{dayjs.unix(item.timestamp).format("YYYY-MM-DD HH:mm:ss")}</td>
                            <td>
                                {#if item.txid.startsWith('pi_')}
                                    <a class="link link-primary" href={`https://dashboard.stripe.com/payments/${item.txid}`} target="_blank" rel="noopener noreferrer">
                                        {item.txid.substring(0, 10)}...
                                    </a>
                                {:else}
                                    <a class="link link-primary" href={`https://solscan.io/tx/${item.txid}`} target="_blank" rel="noopener noreferrer">
                                        {item.txid.substring(0, 4)}...{item.txid.substring(item.txid.length - 4)}
                                    </a>
                                {/if}
                            </td>
                            <td class="text-right font-mono">{item.uiAmount.toFixed(2)}</td>
                            <td class="text-right font-mono">{item.mint}</td>
                            <td class="text-center">
                                <button class="btn btn-xs btn-outline" on:click={() => triggerPrint(item)}>Print</button>
                            </td>
                        </tr>
                         {#if expandedTransactions[item.txid] && item.items && item.items.length}
                            <tr class="bg-base-200">
                                <td colspan="6" class="p-0">
                                    <div class="p-4">
                                        <h5 class="font-bold text-sm mb-2">Purchased Items:</h5>
                                        <ul class="list-disc pl-6">
                                            {#each item.items as cartItem}
                                                <li>{cartItem.quantity}x {cartItem.name} @ ${(cartItem.price || 0).toFixed(2)} each</li>
                                            {/each}
                                        </ul>
                                    </div>
                                </td>
                            </tr>
                         {/if}
                    {/each}
                    {#if $successArray.length === 0}
                        <tr>
	                     <td colspan="6" class="text-center text-gray-500 py-4">No transactions yet.</td>
                        </tr>
                    {/if}
                </tbody>
            </table>
		       </div>
    </div>
</div>
