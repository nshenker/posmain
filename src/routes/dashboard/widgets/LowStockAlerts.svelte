<script lang='ts'>
    import { inventory } from '../../stores.js';
    import { goto } from '$app/navigation';

    const lowStockThreshold = 5;
    $: lowStockItems = $inventory.filter(item => item.quantity <= lowStockThreshold);
</script>

<div class="card-body">
    <h2 class="card-title text-xl font-greycliffmed mb-4">Low Stock Alerts</h2>
    {#if lowStockItems.length > 0}
        <div class="overflow-x-auto">
            <table class="table w-full">
                <thead>
                    <tr>
                        <th>Item</th>
                        <th class="text-right">Qty Left</th>
                    </tr>
                </thead>
                <tbody>
                    {#each lowStockItems as item}
                        <tr class="hover">
                            <td>{item.name}</td>
                            <td class="text-right text-error font-mono">{item.quantity}</td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
         <div class="card-actions justify-center mt-4">
            <button on:click={() => goto('/inventory')} class="btn btn-sm btn-outline">Manage Inventory</button>
        </div>
    {:else}
        <p class="text-center">All inventory levels are looking good!</p>
    {/if}
</div>
