<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import dayjs from 'dayjs';
    import { triggerPrint } from '../printStore.js'; // Ensure triggerPrint is imported
    
    // The transaction object must be passed in the format of a $successArray entry
    export let transaction;
    const dispatch = createEventDispatcher();
    
    function getMintName(mintAddressOrName) {
        if (mintAddressOrName === 'USD') return 'USD (Card)';
        // Fallback since $mints store is not available in a standalone component
        return transaction.mint ||
            'N/A';
    }
</script>

<div class="modal modal-open">
    <div class="modal-box w-11/12 max-w-xl">
        <div class="flex justify-between items-center pb-4 border-b">
            <h3 class="font-bold text-lg">Invoice Payment Details</h3>
            <button class="btn btn-sm btn-circle btn-ghost" on:click={() => dispatch('close')}>✕</button>
        </div>
        
        <div class="py-4 space-y-4">
            <div class="card bg-base-200 shadow-sm">
 
                <div class="card-body p-4">
                    <div class="text-sm space-y-1">
                        <p><strong>Date:</strong> {dayjs.unix(transaction.timestamp).format('YYYY-MM-DD HH:mm:ss')}</p>
                        <p><strong>Total Paid:</strong> <span class="font-mono">{transaction.uiAmount.toFixed(2)} {getMintName(transaction.mint)}</span></p>
       
                        <p><strong>Status:</strong> <span class="badge badge-success">PAID (Invoice)</span></p>
                        <p><strong>Transaction ID:</strong> 
                            {#if transaction.txid.startsWith('invoice-')}
                        
                                <span class="font-mono">{transaction.txid}</span>
                            {:else if transaction.txid.startsWith('pi_')}
                                <a class="link link-primary font-mono" href={`https://dashboard.stripe.com/payments/${transaction.txid}`} target="_blank" rel="noopener noreferrer">
                      
                                    {transaction.txid.substring(0, 10)}... (Stripe)
                                </a>
                            {:else}
                        
                                <a class="link link-primary font-mono" href={`https://solscan.io/tx/${transaction.txid}`} target="_blank" rel="noopener noreferrer">
                                    {transaction.txid.substring(0, 10)}... (Solana)
                                </a>
               
                            {/if}
                        </p>
                    </div>
                </div>
            </div>
            
   
            {#if transaction.items && transaction.items.length > 0}
                <div class="card bg-base-200 shadow-sm">
                    <div class="card-body p-4">
                        <h4 class="font-bold text-base">Items Sold:</h4>
                  
                        <ul class="list-disc pl-6 text-sm">
                            {#each transaction.items as item}
                                <li>{item.quantity}x {item.name} @ ${(item.price ||
                                    0).toFixed(2)} each</li>
                            {/each}
                        </ul>
                    </div>
                </div>
           
            {/if}
        </div>

        <div class="modal-action">
            <button class="btn btn-sm btn-outline" on:click={() => triggerPrint(transaction)}>Print Receipt</button>
            <button class="btn btn-sm" on:click={() => dispatch('close')}>Close</button>
        </div>
    </div>
</div>
