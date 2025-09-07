<script lang='ts'>
    import { successArray } from '../../stores.js';
    import dayjs from 'dayjs';
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
                {#each $successArray.slice(-3).reverse() as item (item.txid)}
                    <tr class="hover">
                        <td>{dayjs.unix(item.timestamp).format("YYYY-MM-DD HH:mm")}</td>
                        <td>
                            <a class="link link-primary" href={`https://solscan.io/tx/${item.txid}`} target="_blank" rel="noopener noreferrer">
                                {item.txid.substring(0, 4)}...{item.txid.substring(item.txid.length - 4)}
                            </a>
                        </td>
                        <td class="text-right font-mono">{item.uiAmount} {item.mint}</td>
                    </tr>
                {/each}
                {#if $successArray.length === 0}
                    <tr>
                        <td colspan="3" class="text-center text-gray-500 py-4">No transactions yet.</td>
                    </tr>
                {/if}
            </tbody>
        </table>
    </div>
</div>
