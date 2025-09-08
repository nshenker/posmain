<script lang='ts'>
  import { successArray } from '../stores.js';
  import dayjs from 'dayjs';
</script>

<div class="card w-full max-w-4xl bg-base-100 shadow-xl border border-gray-200">
    <div class="card-body p-8">
        <h2 class="card-title text-xl font-greycliffmed text-charcoal mb-4">Transaction History</h2>
        <div class="overflow-x-auto">
            <table class="table w-full">
                <thead>
                    <tr>
                        <th class="text-left">Date</th>
                        <th class="text-left">Transaction ID</th>
                        <th class="text-right">Amount</th>
                        <th class="text-right">Coin</th>
                    </tr>
                </thead>
                <tbody>
                    {#each $successArray as item (item.txid)}
                    <tr class="hover">
				        <td>{dayjs.unix(item.timestamp).format("YYYY-MM-DD HH:mm:ss")}</td>
                        <td>
                            <a class="link link-primary" href={`https://solscan.io/tx/${item.txid}`} target="_blank" rel="noopener noreferrer">
                                {item.txid.substring(0, 4)}...{item.txid.substring(item.txid.length - 4)}
                            </a>
                        </td>
                        <td class="text-right font-mono">{item.uiAmount}</td>
					    <td class="text-right font-mono">{item.mint}</td>
                    </tr>
                    {/each}
                    {#if $successArray.length === 0}
                        <tr>
	                     <td colspan="4" class="text-center text-gray-500 py-4">No transactions yet.</td>
                        </tr>
                    {/if}
                </tbody>
            </table>
		       </div>
    </div>
</div>
