<script lang='ts'>
    import { createEventDispatcher } from 'svelte';
    import { inventory } from '../stores.js';
    import Fuse from 'fuse.js'; // Import Fuse.js

    export let currentCurrency;
const dispatch = createEventDispatcher();

    let selectedItemWithVariants = null;
    let searchTerm = ''; // Add state for the search term

    // Setup Fuse.js for fuzzy searching
    $: fuse = new Fuse($inventory, { keys: ['name'], threshold: 0.3 });
    // Filter inventory based on the search term
    $: filteredInventory = searchTerm ? fuse.search(searchTerm).map(result => result.item) : $inventory;


    function selectItem(item) {
        if (currentCurrency && item.currency !== currentCurrency) {
            return;
}

        if (item.type === 'variable' && item.variants.length > 0) {
            selectedItemWithVariants = item;
} else {
            dispatch('addItem', item);
}
    }

    function selectVariant(variant) {
        const itemWithVariant = {
            ...selectedItemWithVariants,
            price: variant.price,
            sku: variant.sku,
            // Add variant details to the name for clarity in the cart
            name: `${selectedItemWithVariants.name} - ${variant.name}`,

         variantId: variant.id,
        };
dispatch('addItem', itemWithVariant);
        selectedItemWithVariants = null; // Close the variant modal
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
                                <tr class="hover">

                      <td>{variant.name}</td>
                                    <td class="text-right font-mono">{(variant.price || 0).toFixed(2)}</td>
                                    <td class="text-center">

                                       <button class="btn btn-xs btn-outline btn-success" on:click={() => selectVariant(variant)} disabled={variant.quantity <= 0}>
                                            {#if variant.quantity > 0}Add{:else}Out of Stock{/if}

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
        <div class="modal-box">
            <h3 class="font-bold text-lg">Select an item from inventory</h3>

            <input type="text" placeholder="Search items..." class="input input-bordered w-full mt-4 mb-2" bind:value={searchTerm} />


          <div class="py-4 max-h-64 overflow-y-auto"> <div class="overflow-x-auto">
                    <table class="table w-full">
                        <thead>

  <tr>
                                <th>Item Name</th>
                                <th class="text-right">Price</th>

<th class="text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>

     {#each filteredInventory as item (item.id)}
                                <tr class="hover">
                                    <td class="font-greycliffmed">{item.name}</td>

               <td class="text-right font-mono">
                                         {#if item.type === 'simple'}{(item.price ||
0).toFixed(2)} {item.currency}{:else}From ${(Math.min(...item.variants.map(v => v.price)) || 0).toFixed(2)}{/if}
                                    </td>
                                    <td class="text-center">

                   <button
                                            class="btn btn-xs btn-outline btn-success"

          on:click={() => selectItem(item)}
                                            disabled={(currentCurrency && item.currency !== currentCurrency) ||
item.quantity <= 0}
                                        >
                                            {#if item.quantity > 0}Add{:else}Out of Stock{/if}

                               </button>
                                    </td>
                                </tr>

                           {/each}
                            {#if filteredInventory.length === 0}
                                <tr><td colspan="3" class="text-center py-4">
                                    {#if searchTerm}
                                        No items match "{searchTerm}".
                                    {:else}
                                        No items in inventory.
                                    {/if}
                                </td></tr>

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
{/if}
