<script lang='ts'>
    import { createEventDispatcher } from 'svelte';
    import { inventoryHistory } from '../stores.js';
    import dayjs from 'dayjs';

    export let item;
    const dispatch = createEventDispatcher();
    $: history = $inventoryHistory[item.id] || [];
</script>

<div class="modal modal-open">
    <div class="modal-box w-11/12 max-w-2xl">
        <h3 class="font-bold text-lg">Inventory History for {item.name}</h3>
        <div class="py-4 max-h-96 overflow-y-auto">
            <table class="table table-sm w-full">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Reason</th>
                        <th class="text-center">Change</th>
                        <th class="text-right">New Quantity</th>
                    </tr>
                </thead>
                <tbody>
                    {#each history as entry}
                        <tr class="hover">
                            <td>{dayjs(entry.date).format('YYYY-MM-DD HH:mm')}</td>
                            <td>{entry.reason}</td>
                            <td class="text-center font-mono">{entry.change}</td>
                            <td class="text-right font-mono">{entry.newQty}</td>
                        </tr>
                    {/each}
                    {#if history.length === 0}
                        <tr><td colspan="4" class="text-center py-4">No history for this item.</td></tr>
                    {/if}
                </tbody>
            </table>
        </div>
        <div class="modal-action">
            <button class="btn" on:click={() => dispatch('close')}>Close</button>
        </div>
    </div>
</div>
