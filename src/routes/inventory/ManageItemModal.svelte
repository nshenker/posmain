<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { saveBarcode } from '../../utils/barcode.js';

    export let item;
    export let isVariant = false; // This new property tells the modal if it's for a variant

    const dispatch = createEventDispatcher();

    function dispatchAction(action) {
        dispatch(action, item);
    }
</script>

<div class="modal modal-open">
    <div class="modal-box">
        <h3 class="font-bold text-lg">Manage: {item.name}</h3>
        <div class="py-4 space-y-2">
            <button 
                class="btn btn-outline w-full" 
                on:click={() => dispatchAction('edit')}
                disabled={isVariant}
            >
                Edit Details
            </button>
            {#if isVariant}
                <p class="text-xs text-center opacity-60">Edit variants by editing the main product.</p>
            {/if}

            <button class="btn btn-outline w-full" on:click={() => dispatchAction('history')}>View History</button>
            
            {#if item.barcode}
                <button class="btn btn-outline w-full" on:click={() => saveBarcode(item)}>Download Barcode</button>
            {/if}

            <div class="divider"></div>

            <button 
                class="btn btn-error btn-outline w-full" 
                on:click={() => dispatchAction('remove')}
                disabled={isVariant}
            >
                Remove Item
            </button>
             {#if isVariant}
                <p class="text-xs text-center opacity-60">Remove variants by editing the main product.</p>
            {/if}
        </div>
        <div class="modal-action">
            <button class="btn" on:click={() => dispatch('close')}>Close</button>
        </div>
    </div>
</div>
