<script lang='ts'>
    import { inventory, pmtAmt, selectedMint } from '../stores.js';
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();

    function selectItem(item) {
        $pmtAmt = item.price.toFixed(2);
        $selectedMint = item.currency;
        dispatch('close');
    }
</script>

<div class="modal modal-open">
    <div class="modal-box">
        <h3 class="font-bold text-lg">Select an Item from Inventory</h3>
        <button class="btn btn-sm btn-circle absolute right-2 top-2" on:click={() => dispatch('close')}>✕</button>
        <div class="py-4">
            <div class="overflow-x-auto">
                <table class="table w-full">
                    <thead>
                        <tr>
                            <th>Item Name</th>
                            <th class="text-right">Price</th>
                            <th class="text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each $inventory as item (item.id)}
                            <tr class="hover">
                                <td class="font-greycliffmed">{item.name}</td>
                                <td class="text-right font-mono">{(item.price || 0).toFixed(2)} {item.currency}</td>
                                <td class="text-center">
                                    <button class="btn btn-xs btn-primary" on:click={() => selectItem(item)}>Add</button>
                                </td>
                            </tr>
                        {/each}
                        {#if $inventory.length === 0}
                            <tr>
                                <td colspan="3" class="text-center text-gray-500 py-4">No items in inventory.</td>
                            </tr>
                        {/if}
                    </tbody>
                </table>
            </div>
        </div>
        <div class="modal-action">
            <button class="btn" on:click={() => dispatch('close')}>Close</button>
        </div>
    </div>
</div>
