<script lang='ts'>
    import { createEventDispatcher } from 'svelte';
    import { inventory } from '../stores.js';
    export let currentCurrency;

    const dispatch = createEventDispatcher();

    function selectItem(item) {
        if (currentCurrency && item.currency !== currentCurrency) {
            // Logic to prevent adding items with different currencies is in CreateCharge.svelte
            // but we can also disable the button here for better UX.
            return;
        }
        dispatch('addItem', item);
    }
</script>

<div class="modal modal-open">
    <div class="modal-box">
        <h3 class="font-bold text-lg">Select an item from inventory</h3>
        <div class="py-4">
            <div class="overflow-x-auto">
                <table class="table w-full">
                    <thead>
                        <tr>
                            <th>Item Name</th>
                            <th class="text-right">Price</th>
                            <th class="text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each $inventory as item (item.id)}
                            <tr class="hover">
                                <td class="font-greycliffmed">{item.name}</td>
                                <td class="text-right font-mono">{(item.price || 0).toFixed(2)} {item.currency}</td>
                                <td class="text-center">
                                    <button
                                        class="btn btn-xs btn-outline btn-success"
                                        on:click={() => selectItem(item)}
                                        disabled={currentCurrency && item.currency !== currentCurrency}
                                    >
                                        Add
                                    </button>
                                </td>
                            </tr>
                        {/each}
                        {#if $inventory.length === 0}
                            <tr><td colspan="3" class="text-center py-4">No items in inventory.</td></tr>
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
