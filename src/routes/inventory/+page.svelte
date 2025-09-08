<script lang='ts'>
    import { inventory, mints, publicKey, categories, inventoryHistory } from '../stores.js';
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { browser } from '$app/environment';
    import { showToast } from '../toastStore.js';
    import HistoryModal from './HistoryModal.svelte';
    import Reports from './Reports.svelte';
    import { printBarcode, printMultipleBarcodes } from '../../utils/barcode.js';
    import { logHistory } from '../../utils/inventory.js';

    let activeTab = 'inventory';
    let showHistoryModal = false;
    let selectedItemForHistory = null;
    let newCategory = '';
    let selectedItems = [];

    let newItem = {
        name: '',
        sku: '',
        barcode: '',
        quantity: null,
        price: null,
        cost: null,
        currency: 'USDC',
        category: 'Default'
    };

    onMount(() => {
        if (browser && !$publicKey) {
            showToast("Please set your merchant wallet address first.", "error");
            goto('/');
        }
    });

    $: allSelected = $inventory.length > 0 && selectedItems.length === $inventory.length;

    function toggleSelectAll(e) {
        if (e.target.checked) {
            selectedItems = $inventory.map(i => i.id);
        } else {
            selectedItems = [];
        }
    }

    function addItem() {
        const { name, quantity, price, cost } = newItem;
        if (name.trim() && quantity > 0 && price >= 0 && cost >= 0) {
            const newId = Date.now().toString();
            $inventory = [...$inventory, { ...newItem, id: newId }];
            logHistory(newId, 'Item Created', `+${quantity}`, quantity);
            newItem = { name: '', sku: '', barcode: '', quantity: null, price: null, cost: null, currency: 'USDC', category: 'Default' };
        } else {
            if (browser) showToast("Please fill out all required fields with valid values.", "error");
        }
    }

    function removeItem(itemId) {
        if (browser && confirm("Are you sure you want to remove this item? This action is permanent.")) {
            $inventory = $inventory.filter(item => item.id !== itemId);
            selectedItems = selectedItems.filter(id => id !== itemId);
            inventoryHistory.update(history => {
                delete history[itemId];
                return history;
            });
        }
    }
    
    function updateQuantity(itemId, amount) {
        $inventory = $inventory.map(item => {
            if (item.id === itemId) {
                const newQuantity = Math.max(0, item.quantity + amount);
                logHistory(itemId, 'Manual Adjustment', `${amount > 0 ? '+' : ''}${amount}`, newQuantity);
                return { ...item, quantity: newQuantity };
            }
            return item;
        });
    }

    function viewHistory(item) {
        selectedItemForHistory = item;
        showHistoryModal = true;
    }
    
    function handlePrintSelected() {
        const itemsToPrint = $inventory.filter(item => selectedItems.includes(item.id));
        if (itemsToPrint.length > 0) {
            printMultipleBarcodes(itemsToPrint);
        } else {
            showToast("Please select items to print.", "error");
        }
    }

    function addCategory() {
        if (newCategory.trim() && !$categories.includes(newCategory.trim())) {
            $categories = [...$categories, newCategory.trim()];
            newCategory = '';
        }
    }

    function removeCategory(category) {
        if (category === 'Default') {
            showToast("The 'Default' category cannot be removed.", "error");
            return;
        }
        if (browser && confirm(`Are you sure you want to remove the "${category}" category? Items in this category will be moved to 'Default'.`)) {
            $inventory = $inventory.map(item => {
                if (item.category === category) {
                    return { ...item, category: 'Default' };
                }
                return item;
            });
            $categories = $categories.filter(c => c !== category);
        }
    }
</script>

{#if showHistoryModal}
    <HistoryModal item={selectedItemForHistory} on:close={() => showHistoryModal = false} />
{/if}

<div class="container mx-auto px-4 sm:px-6 lg:px-8">
    <header class="text-center py-6">
        <h1 class="text-4xl font-greycliffbold">Inventory Management</h1>
    </header>

    <div role="tablist" class="tabs tabs-bordered justify-center">
        <button role="tab" class="tab" class:tab-active={activeTab === 'inventory'} on:click={() => activeTab = 'inventory'}>Inventory</button>
        <button role="tab" class="tab" class:tab-active={activeTab === 'categories'} on:click={() => activeTab = 'categories'}>Categories</button>
        <button role="tab" class="tab" class:tab-active={activeTab === 'reports'} on:click={() => activeTab = 'reports'}>Reports</button>
    </div>

    <div class="mt-6">
        {#if activeTab === 'inventory'}
            <div class="card w-full bg-base-100 shadow-xl border mx-auto">
                <div class="card-body p-8">
                    <h2 class="card-title text-xl font-greycliffmed mb-4">Add New Item</h2>
                    <form on:submit|preventDefault={addItem} class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <input type="text" placeholder="Item Name*" class="input input-bordered" bind:value={newItem.name} />
                        <input type="text" placeholder="SKU (Optional)" class="input input-bordered" bind:value={newItem.sku} />
                        <input type="text" placeholder="Barcode (Optional)" class="input input-bordered" bind:value={newItem.barcode} />
                        <select class="select select-bordered" bind:value={newItem.category}>
                             {#each $categories as category}<option value={category}>{category}</option>{/each}
                        </select>
                        <input type="number" placeholder="Quantity*" class="input input-bordered" bind:value={newItem.quantity} min="0" step="1" />
                        <div class="input-group">
                             <span>Cost*</span>
                            <input type="number" placeholder="0.00" class="input input-bordered w-full" bind:value={newItem.cost} min="0" step="0.01" />
                        </div>
                        <div class="input-group">
                            <span>Price*</span>
                            <input type="number" placeholder="0.00" class="input input-bordered w-full" bind:value={newItem.price} min="0" step="0.01" />
                            <select class="select select-bordered" bind:value={newItem.currency}>
                                {#each $mints as mint}<option value={mint.name}>{mint.name}</option>{/each}
                            </select>
                        </div>
                        <button type="submit" class="btn btn-primary">Add Item</button>
                    </form>
                </div>
            </div>

            <div class="card w-full bg-base-100 shadow-xl border mx-auto mt-6">
                <div class="card-body p-8">
                    <div class="flex justify-between items-center mb-4">
                        <h2 class="card-title text-xl font-greycliffmed">Current Inventory</h2>
                        {#if selectedItems.length > 0}
                             <button class="btn btn-secondary" on:click={handlePrintSelected}>Print {selectedItems.length} Barcode(s)</button>
                        {/if}
                    </div>
                    <div class="overflow-x-auto">
                        <table class="table w-full">
                            <thead>
                                <tr>
                                    <th class="w-10"><input type="checkbox" class="checkbox" on:change={toggleSelectAll} checked={allSelected} /></th>
                                    <th>Item Name</th>
                                    <th>SKU</th>
                                    <th>Barcode</th>
                                    <th class="text-center">Quantity</th>
                                    <th class="text-right">Price</th>
                                    <th class="text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {#each $inventory as item (item.id)}
                                    <tr class="hover">
                                        <td><input type="checkbox" class="checkbox" bind:group={selectedItems} value={item.id} /></td>
                                        <td class="font-greycliffmed">{item.name}</td>
                                        <td>{item.sku}</td>
                                        <td class="flex items-center gap-2">
                                            <span>{item.barcode}</span>
                                            {#if item.barcode}
                                                <button class="btn btn-xs btn-ghost" on:click={() => printBarcode(item)}>🖨️</button>
                                            {/if}
                                        </td>
                                        <td class="text-center font-mono">{item.quantity}</td>
                                        <td class="text-right font-mono">{(item.price || 0).toFixed(2)} {item.currency}</td>
                                        <td class="text-center space-x-1">
                                            <button class="btn btn-xs btn-outline" on:click={() => viewHistory(item)}>History</button>
                                            <button class="btn btn-xs btn-outline btn-success" on:click={() => updateQuantity(item.id, 1)}>+</button>
                                            <button class="btn btn-xs btn-outline btn-warning" on:click={() => updateQuantity(item.id, -1)}>-</button>
                                            <button class="btn btn-xs btn-outline btn-error" on:click={() => removeItem(item.id)}>Remove</button>
                                        </td>
                                    </tr>
                                {/each}
                                {#if $inventory.length === 0}
                                    <tr><td colspan="7" class="text-center py-4">No items in inventory.</td></tr>
                                {/if}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

        {:else if activeTab === 'categories'}
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="card bg-base-100 shadow-xl border">
                    <div class="card-body p-8">
                         <h2 class="card-title text-xl font-greycliffmed mb-4">Add New Category</h2>
                         <form on:submit|preventDefault={addCategory} class="input-group">
                             <input type="text" placeholder="Category Name" class="input input-bordered w-full" bind:value={newCategory} />
                             <button type="submit" class="btn btn-primary">Add</button>
                         </form>
                    </div>
                </div>
                <div class="card bg-base-100 shadow-xl border">
                    <div class="card-body p-8">
                        <h2 class="card-title text-xl font-greycliffmed mb-4">Manage Categories</h2>
                         <div class="overflow-x-auto">
                            <table class="table w-full">
                                <tbody>
                                    {#each $categories as category}
                                        <tr class="hover">
                                            <td>{category}</td>
                                            <td class="text-right">
                                                {#if category !== 'Default'}
                                                    <button class="btn btn-xs btn-error" on:click={() => removeCategory(category)}>Remove</button>
                                                {/if}
                                            </td>
                                        </tr>
                                    {/each}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        {:else if activeTab === 'reports'}
            <Reports/>
        {/if}
    </div>
</div>
