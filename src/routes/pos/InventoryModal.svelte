<script lang='ts'>
    import { createEventDispatcher } from 'svelte';
    import { inventory } from '../stores.js';
    import Fuse from 'fuse.js';
    import InventoryItemCard from '../inventory/InventoryItemCard.svelte'; // Reuse the card component

    export let currentCurrency;
    const dispatch = createEventDispatcher();
    let selectedItemWithVariants = null;
    let searchTerm = '';
    
    // NEW STATE: Toggle between 'grid' and 'list' view
    let viewMode = 'grid'; 

    // Setup Fuse.js for fuzzy searching
    $: fuse = new Fuse($inventory, { keys: ['name'], threshold: 0.3 });
    
    // Filter inventory based on the search term
    $: filteredInventory = searchTerm ?
        fuse.search(searchTerm).map(result => result.item) : $inventory;

    // --- Core Logic for Item/Variant Selection ---
    function selectItem(item) {
        if (currentCurrency && item.currency !== currentCurrency) {
            return;
        }

        if (item.type === 'variable' && item.variants.length > 0) {
            selectedItemWithVariants = item;
        } else {
            // Check quantity before dispatching
            if (item.quantity <= 0) return;
            dispatch('addItem', item);
        }
    }

    function selectVariant(parentItem, variant) {
        const itemWithVariant = {
            ...parentItem,
            // Corrected object property assignments
            price: variant.price,
            cost: variant.cost, 
            sku: variant.sku, 
            barcode: variant.barcode, 
            // Add variant details to the name for clarity in the cart
            name: `${parentItem.name} - ${variant.name}`,
            variantId: variant.id,
            // Use the variant's quantity for stock check
            quantity: variant.quantity 
        };

        if (variant.quantity <= 0) return;

        dispatch('addItem', itemWithVariant);
        selectedItemWithVariants = null; // Close the variant modal
    }
    
    // Function to calculate minimum price for display
    function getMinPrice(item) {
        if (item.type === 'simple') return (item.price || 0).toFixed(2);
        if (item.variants && item.variants.length > 0) {
            return (Math.min(...item.variants.map(v => v.price ?? 0)) || 0).toFixed(2);
        }
        return '0.00';
    }

    // Function to determine if an item is completely out of stock
    function isOutOfStock(item) {
        if (item.type === 'simple') return item.quantity <= 0;
        if (item.type === 'variable' && item.variants) {
            return item.variants.every(v => v.quantity <= 0);
        }
        return true; // Default to out of stock if invalid/no variants
    }
    
    // Function to handle click from card view
    function handleCardClick(item) {
        if (isOutOfStock(item)) return;
        selectItem(item);
    }
</script>

{#if selectedItemWithVariants}
    <div class="modal modal-open">
        <div class="modal-box">
            <h3 class="font-bold text-lg">Select Variant for {selectedItemWithVariants.name}</h3>
            <div class="py-4">
                <div class="overflow-x-auto">
                    <table class="table w-full">

                        <tbody>
                            {#each selectedItemWithVariants.variants as variant}
                                {@const isUnavailable = variant.quantity <= 0}
                                <tr 
                                    class={`hover ${isUnavailable ? 'bg-error/10' : 'cursor-pointer'}`}
                                    on:click={() => selectVariant(selectedItemWithVariants, variant)}
                                >
                                    <td>{variant.name}</td>
                                    <td class="text-right font-mono">${(variant.price || 0).toFixed(2)}</td>
                                    <td class="text-center">

                                        <button 
                                            class="btn btn-xs btn-outline btn-success" 
                                            on:click|stopPropagation={() => selectVariant(selectedItemWithVariants, variant)} 
                                            disabled={isUnavailable}
                                        >
                                            {#if !isUnavailable}Add{:else}Out of Stock{/if}

                                        </button>
                                    </td>

                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>

            </div>
            <div class="modal-action">
                <button class="btn" on:click={() => selectedItemWithVariants = null}>Back</button>
            </div>
        </div>
    </div>
{:else}
    <div class="modal modal-open">
        <div class="modal-box w-11/12 max-w-4xl">
            <h3 class="font-bold text-lg">Select an item from inventory</h3>
            
            <div class="flex flex-col sm:flex-row gap-4 mt-4 mb-2">
                 <input type="text" placeholder="Search items..." class="input input-bordered w-full" bind:value={searchTerm} />
                 <div class="join flex-shrink-0">
                    <button class="btn join-item" class:btn-active={viewMode === 'list'} on:click={() => viewMode = 'list'}>
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" /></svg>
                    </button>
                    <button class="btn join-item" class:btn-active={viewMode === 'grid'} on:click={() => viewMode = 'grid'}>
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm11 0h7v7h-7v-7z" clip-rule="evenodd" /></svg>
                    </button>
                 </div>
            </div>

            <div class="py-4 max-h-[60vh] overflow-y-auto"> 
                {#if filteredInventory.length === 0}
                    <div class="text-center py-8">
                        {#if searchTerm}
                            No items match "{searchTerm}".
                        {:else}
                            No items in inventory.
                        {/if}
                    </div>
                {:else if viewMode === 'grid'}
                    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {#each filteredInventory as item (item.id)}
                            {@const disabled = (currentCurrency && item.currency !== currentCurrency) || isOutOfStock(item)}
                            <div 
                                class="card bg-base-100 shadow-xl border cursor-pointer h-full transition-all duration-200"
                                class:opacity-50={disabled}
                                class:hover:scale-[1.02]={!disabled}
                                on:click={() => handleCardClick(item)}
                            >
                                <div class="h-32 w-full relative">
                                    {#if item.imageURL}
                                        <img src={item.imageURL} alt={item.name} class="w-full h-full object-cover rounded-t-lg" />
                                    {:else}
                                        <div class="w-full h-full bg-base-200 flex items-center justify-center text-base-content/50 rounded-t-lg">
                                            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-12 5h12a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                        </div>
                                    {/if}
                                    <span class="badge badge-sm absolute top-2 right-2 {isOutOfStock(item) ? 'badge-error' : 'badge-primary'}">
                                        {#if isOutOfStock(item)}OOS{:else}Qty: {item.quantity}{/if}
                                    </span>
                                </div>
                                <div class="card-body p-3">
                                    <h2 class="card-title text-sm font-greycliffmed leading-tight truncate">{item.name}</h2>
                                    <p class="text-xs font-mono font-bold">${getMinPrice(item)} {item.currency}</p>
                                </div>
                            </div>
                        {/each}
                    </div>
                {:else}
                    <div class="overflow-x-auto">
                        <table class="table w-full table-compact">
                            <thead>
                                <tr>
                                    <th>Item Name</th>
                                    <th>Stock</th>
                                    <th class="text-right">Price</th>
                                    <th class="text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {#each filteredInventory as item (item.id)}
                                    <tr class="hover {isOutOfStock(item) ? 'bg-error/10' : ''}">
                                        <td class="font-greycliffmed">{item.name}</td>
                                        <td>{item.type === 'simple' ? item.quantity : 'Variable'}</td>
                                        <td class="text-right font-mono">
                                            {#if item.type === 'simple'}
                                                {(item.price || 0).toFixed(2)} {item.currency}
                                            {:else}
                                                From ${getMinPrice(item)} {item.currency}
                                            {/if}
                                        </td>
                                        <td class="text-center">
                                            <button
                                                class="btn btn-xs btn-outline btn-success"
                                                on:click={() => selectItem(item)}
                                                disabled={(currentCurrency && item.currency !== currentCurrency) || isOutOfStock(item)}
                                            >
                                                {#if isOutOfStock(item)}Out of Stock{:else}Add{/if}
                                            </button>
                                        </td>
                                    </tr>
                                {/each}
                            </tbody>
                        </table>
                    </div>
                {/if}
            </div>

            <div class="modal-action">
                <button class="btn" on:click={() => dispatch('close')}>Close</button>
            </div>
        </div>
    </div>
{/if}
