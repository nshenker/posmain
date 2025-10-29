<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { inventory, mints, categories, locations } from '../stores.js';
    import { showToast } from '../toastStore.js';
    import VariantEditor from './VariantEditor.svelte';
    import { logHistory } from '../../utils/inventory.js';
    export let item = null;
    const dispatch = createEventDispatcher();
    let currentItem = item ? { ...item } : getInitialNewItem();
    let adjustmentAmount = 1;
    let adjustmentReason = 'Manual Adjustment';
    let variantAdjustmentAmounts = {};
    function getInitialNewItem() {
        return {
            id: null, type: 'simple', name: '', sku: '', barcode: '',
            quantity: null, price: null, cost: null, currency: 'USDC',
            category: 'Default', variants: [], bundledItems: [], locationId: null,
            imageURL: '' // ADDED: New field for item image
        };
    }

    function handleImageUpload(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                currentItem.imageURL = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    }

    function saveItem() {
        if (!currentItem.name.trim()) {
            showToast("Please enter a customer name.", "error");
            return;
        }
        dispatch('save', currentItem);
    }

    function adjustQuantity(amount) {
        const change = parseInt(amount, 10);
        if (isNaN(change)) return;

        const oldQuantity = currentItem.quantity || 0;
        const newQuantity = Math.max(0, oldQuantity + change);
        currentItem.quantity = newQuantity;
        logHistory(currentItem.id, adjustmentReason, `${change > 0 ? '+' : ''}${change}`, newQuantity);
        showToast(`Quantity updated to ${newQuantity}`, 'success');
    }

    function adjustVariantQuantity(variant, amount) {
        const change = parseInt(amount, 10);
        if (isNaN(change)) return;

        const oldQuantity = variant.quantity || 0;
        const newQuantity = Math.max(0, oldQuantity + change);
        variant.quantity = newQuantity;
        logHistory(variant.id, adjustmentReason, `${change > 0 ? '+' : ''}${change}`, newQuantity);
        // Recalculate total quantity for parent item
        currentItem.quantity = currentItem.variants.reduce((total, v) => total + (v.quantity || 0), 0);
        showToast(`Stock for ${variant.name} updated to ${newQuantity}`, 'success');
    }
</script>

<div class="modal modal-open">
    <div class="modal-box w-11/12 max-w-2xl">
        <h3 class="font-bold text-lg">{item ?
        'Edit' : 'Add'} Item</h3>
        <form on:submit|preventDefault={saveItem} class="space-y-4 py-4">
            
            <div class="form-control w-full">
                <label class="label"><span class="label-text">Product Image (Optional)</span></label>
                <div class="flex items-center gap-4">
                    {#if currentItem.imageURL}
                        <img src={currentItem.imageURL} alt="Product Preview" class="w-16 h-16 object-cover rounded-md border" />
                        <button type="button" class="btn btn-sm btn-error" on:click={() => currentItem.imageURL = ''}>Remove Image</button>
                    {:else}
                        <input type="file" on:change={handleImageUpload} class="file-input file-input-bordered file-input-sm w-full" accept="image/*" />
                    {/if}
                </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <select class="select select-bordered md:col-span-1" bind:value={currentItem.type}>
                    <option value="simple">Simple Product</option>
                    <option value="variable">Variable Product</option>
      
                <option value="bundle" disabled>Bundle (Coming Soon)</option>
                </select>
                <input type="text" placeholder="Item Name*" class="input input-bordered md:col-span-2" bind:value={currentItem.name} />
            </div>

            {#if currentItem.type === 'simple'}
               
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {#if !item}
                        <div class="form-control">
                            <label class="label"><span class="label-text">Initial Quantity*</span></label>
                  
                            <input type="number" placeholder="Quantity*" class="input input-bordered" bind:value={currentItem.quantity} min="0" step="1" />
                        </div>
                    {:else}
                         <div class="form-control">
            
                            <label class="label"><span class="label-text">Current Quantity</span></label>
                            <div class="input input-bordered w-full flex items-center">{currentItem.quantity}</div>
                        </div>
                    {/if}
    
                    <div class="form-control">
                        <label class="label"><span class="label-text">Category</span></label>
                        <select class="select select-bordered" bind:value={currentItem.category}>
                            {#each $categories 
                            as category}<option value={category}>{category}</option>{/each}
                        </select>
                    </div>
                     <div class="form-control">
                        <label class="label"><span class="label-text">Cost*</span></label>
      
                        <div class="input-group">
                            <span>$</span>
                            <input type="number" placeholder="0.00" class="input input-bordered w-full" bind:value={currentItem.cost} min="0" step="0.01" />
                
                        </div>
                    </div>
                    <div class="form-control">
                        <label class="label"><span class="label-text">Price*</span></label>
                        <div 
                        class="input-group">
                            <span>$</span>
                            <input type="number" placeholder="0.00" class="input input-bordered w-full" bind:value={currentItem.price} min="0" step="0.01" />
                            <select class="select select-bordered" bind:value={currentItem.currency}>
    
                                {#each $mints as mint}<option value={mint.name}>{mint.name}</option>{/each}
                            </select>
                        </div>
                
                    </div>
                     <div class="form-control">
                        <label class="label"><span class="label-text">SKU (Optional)</span></label>
                        <input type="text" placeholder="SKU (Optional)" class="input input-bordered" bind:value={currentItem.sku} />
                
                    </div>
                     <div class="form-control">
                        <label class="label"><span class="label-text">Barcode (Optional)</span></label>
                        <input type="text" placeholder="Barcode (Optional)" class="input input-bordered" bind:value={currentItem.barcode} />
                
                    </div>
                     <div class="form-control md:col-span-2">
                        <label class="label"><span class="label-text">Location</span></label>
                        <select class="select select-bordered" bind:value={currentItem.locationId}>
                    
                            <option value={null}>No Location</option>
                            {#each $locations as location}<option value={location.id}>{location.name}</option>{/each}
                        </select>
                    </div>
              
                </div>
                
                {#if item}
                <div class="divider">Stock Adjustment</div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                    <input type="number" placeholder="Amount" class="input input-bordered" bind:value={adjustmentAmount} 
                    min="1" />
                    <input type="text" placeholder="Reason (e.g., Stock Count)" class="input input-bordered" bind:value={adjustmentReason} />
                    <div class="flex gap-2 sm:col-span-2">
                        <button type="button" class="btn btn-success flex-1" on:click={() => adjustQuantity(adjustmentAmount)}>Add</button>
                
                        <button type="button" class="btn btn-error flex-1" on:click={() => adjustQuantity(-adjustmentAmount)}>Remove</button>
                    </div>
                </div>
                {/if}
            {/if}

            {#if currentItem.type === 'variable'}
      
                <VariantEditor bind:variants={currentItem.variants} basePrice={currentItem.price} baseCost={currentItem.cost} />
                {#if item}
                <div class="divider">Stock Adjustment</div>
                <div class="space-y-2">
                    <input type="text" placeholder="Reason for all adjustments" class="input input-bordered w-full" bind:value={adjustmentReason} />
    
                    {#each currentItem.variants as variant, i}
                        <div class="grid grid-cols-1 md:grid-cols-[1fr,80px,170px] gap-4 items-center p-2 rounded-lg bg-base-200">
                            <span class="font-bold">{variant.name} ({variant.quantity} in stock)</span>
                
                            <input type="number" placeholder="Amt" class="input input-sm input-bordered" bind:value={variantAdjustmentAmounts[variant.id]} min="1" />
                            <div class="flex gap-2">
                                <button type="button" class="btn btn-success btn-sm flex-1" on:click={() => adjustVariantQuantity(currentItem.variants[i], variantAdjustmentAmounts[variant.id] ||
                                1)}>Add</button>
                                <button type="button" class="btn btn-error btn-sm flex-1" on:click={() => adjustVariantQuantity(currentItem.variants[i], -(variantAdjustmentAmounts[variant.id] || 1))}>Remove</button>
                            </div>
                        </div>
     
                    {/each}
                </div>
                {/if}
            {/if}
            
            <div class="modal-action">
                
                <button type="button" class="btn" on:click={() => dispatch('close')}>Cancel</button>
                <button type="submit" class="btn btn-primary">Save Item</button>
            </div>
        </form>
    </div>
</div>
