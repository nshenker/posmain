<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { successArray, invoices } from '../stores.js';
    import dayjs from 'dayjs';

    export let customer;
    const dispatch = createEventDispatcher();

    $: customerTransactions = [
        ...$successArray.filter(tx => tx.customerId === customer.id),
        ...$invoices.filter(inv => inv.customerId === customer.id && inv.status === 'Paid').map(inv => ({
            timestamp: dayjs(inv.issueDate).unix(),
            uiAmount: inv.total,
            mint: inv.paymentCurrency,
            txid: `invoice-${inv.id}`
        }))
    ].sort((a, b) => b.timestamp - a.timestamp);
</script>

<div class="modal modal-open">
    <div class="modal-box w-11/12 max-w-4xl">
        <h3 class="font-bold text-lg">{customer.name}</h3>
        
        <div class="py-4 space-y-4">
            <div>
                <h4 class="font-bold">Contact Information</h4>
                <p>Email: {customer.email || 'N/A'}</p>
                <p>Phone: {customer.phone || 'N/A'}</p>
                <p>Wallet: {customer.wallet || 'N/A'}</p>
            </div>

            <div>
                <h4 class="font-bold">Tags</h4>
                <div class="flex flex-wrap gap-2">
                    {#each (customer.tags || []) as tag}
                        <div class="badge badge-outline">{tag}</div>
                    {/each}
                    {#if !(customer.tags && customer.tags.length)}
                        <p>No tags for this customer.</p>
                    {/if}
                </div>
            </div>

            <div>
                <h4 class="font-bold">Notes</h4>
                <p>{customer.notes || 'No notes for this customer.'}</p>
            </div>

            <div>
                <h4 class="font-bold">Communication Log</h4>
                <div class="max-h-48 overflow-y-auto">
                    {#each (customer.communicationLog || []) as log}
                        <div class="chat chat-start">
                            <div class="chat-header">
                                <time class="text-xs opacity-50">{dayjs(log.timestamp).format("YYYY-MM-DD HH:mm")}</time>
                            </div>
                            <div class="chat-bubble">{log.entry}</div>
                        </div>
                    {/each}
                    {#if !(customer.communicationLog && customer.communicationLog.length)}
                        <p>No communication logs for this customer.</p>
                    {/if}
                </div>
            </div>

            <div>
                <h4 class="font-bold">Transaction History</h4>
                <div class="overflow-x-auto">
                    <table class="table w-full">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Transaction ID</th>
                                <th class="text-right">Amount</th>
                                <th class="text-right">Coin</th>
                            </tr>
                        </thead>
                        <tbody>
                            {#each customerTransactions as tx (tx.txid)}
                                <tr class="hover">
                                    <td>{dayjs.unix(tx.timestamp).format("YYYY-MM-DD HH:mm")}</td>
                                    <td>
                                        {#if tx.txid.startsWith('invoice-')}
                                            {tx.txid}
                                        {:else}
                                            <a class="link link-primary" href={`https://solscan.io/tx/${tx.txid}`} target="_blank" rel="noopener noreferrer">
                                                {tx.txid.substring(0, 4)}...{tx.txid.substring(tx.txid.length - 4)}
                                            </a>
                                        {/if}
                                    </td>
                                    <td class="text-right font-mono">{tx.uiAmount.toFixed(2)}</td>
                                    <td class="text-right font-mono">{tx.mint}</td>
                                </tr>
                            {/each}
                            {#if customerTransactions.length === 0}
                                <tr>
                                    <td colspan="4" class="text-center py-4">No transactions for this customer.</td>
                                </tr>
                            {/if}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        
        <div class="modal-action">
            <button class="btn" on:click={() => dispatch('close')}>Close</button>
        </div>
    </div>
</div>
