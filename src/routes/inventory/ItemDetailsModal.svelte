<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { inventory, mints, categories, locations } from '../stores.js';
    import { showToast } from '../toastStore.js';
    import VariantEditor from './VariantEditor.svelte';

    export let item = null;
    const dispatch = createEventDispatcher();

    let currentItem = item ? { ...item } : getInitialNewItem();

    function getInitialNewItem() {
        return {
            id: null, type: 'simple', name: '', sku: '', barcode: '',
            quantity: null, price: null, cost: null, currency: 'USDC',
            category: 'Default', variants: [], bundledItems: [], locationId: null
        };
    }

    function saveItem() {
        if (!currentItem.name.trim()) {
            showToast("Please enter an item name.", "error");
            return;
        }
        dispatch('save', currentItem);
    }
</script>

<div class="modal modal-open">
    <div class="modal-box w-11/12 max-w-2xl">
        <h3 class="font-bold text-lg">{item ? 'Edit' : 'Add'} Item</h3>
        <form on:submit|preventDefault={saveItem} class="space-y-4 py-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <select class="select select-bordered lg:col-span-1" bind:value={currentItem.type}>
                    <option value="simple">Simple Product</option>
                    <option value="variable">Variable Product</option>
                    <option value="bundle" disabled>Bundle (Coming Soon)</option>
                </select>
                <input type="text" placeholder="Item Name*" class="input input-bordered lg:col-span-3" bind:value={currentItem.name} />
            </div>

            {#if currentItem.type === 'simple'}
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <input type="number" placeholder="Quantity*" class="input input-bordered" bind:value={currentItem.quantity} min="0" step="1" />
                    <select class="select select-bordered" bind:value={currentItem.category}>
                        {#each $categories as category}<option value={category}>{category}</option>{/each}
                    </select>
                    <div class="input-group">
                        <span>Cost*</span>
                        <input type="number" placeholder="0.00" class="input input-bordered w-full" bind:value={currentItem.cost} min="0" step="0.01" />
                    </div>
                    <div class="input-group">
                        <span>Price*</span>
                        <input type="number" placeholder="0.00" class="input input-bordered w-full" bind:value={currentItem.price} min="0" step="0.01" />
                        <select class="select select-bordered" bind:value={currentItem.currency}>
                            {#each $mints as mint}<option value={mint.name}>{mint.name}</option>{/each}
                        </select>
                    </div>
                    <input type="text" placeholder="SKU (Optional)" class="input input-bordered" bind:value={currentItem.sku} />
                    <input type="text" placeholder="Barcode (Optional)" class="input input-bordered" bind:value={currentItem.barcode} />
                    <select class="select select-bordered" bind:value={currentItem.locationId}>
                        <option value={null}>No Location</option>
                        {#each $locations as location}<option value={location.id}>{location.name}</option>{/each}
                    </select>
                </div>
            {/if}

            {#if currentItem.type === 'variable'}
                <VariantEditor bind:variants={currentItem.variants} basePrice={currentItem.price} baseCost={currentItem.cost} />
            {/if}
            
            <div class="modal-action">
                <button type="button" class="btn" on:click={() => dispatch('close')}>Cancel</button>
                <button type="submit" class="btn btn-primary">Save Item</button>
            </div>
        </form>
    </div>
</div>
