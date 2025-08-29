<script lang='ts'>
    import { onMount } from "svelte";
    import { inventory, storeName } from '../stores.js';

    let newItem = {
        id: '',
        name: '',
        quantity: 0,
        price: 0
    };

    function addItem() {
        if (newItem.name && newItem.quantity > 0 && newItem.price > 0) {
            $inventory = [...$inventory, { ...newItem, id: Date.now().toString() }];
            newItem = { id: '', name: '', quantity: 0, price: 0 }; // Reset form
        }
    }

    function updateQuantity(itemId, amount) {
        $inventory = $inventory.map(item => 
            item.id === itemId ? { ...item, quantity: Math.max(0, item.quantity + amount) } : item
        );
    }
</script>

<div class="container mx-auto px-4 sm:px-6 lg:px-8">
    <header class="text-center py-6">
        <h1 class="text-4xl font-greycliffbold text-charcoal">
            Inventory Management
        </h1>
    </header>

    <div class="card w-full max-w-4xl bg-base-100 shadow-xl border border-gray-200 mx-auto">
        <div class="card-body p-8">
            <h2 class="card-title text-xl font-greycliffmed text-charcoal mb-4">Add New Item</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input type="text" placeholder="Item Name" class="input input-bordered" bind:value={newItem.name} />
                <input type="number" placeholder="Quantity" class="input input-bordered" bind:value={newItem.quantity} />
                <input type="number" placeholder="Price" class="input input-bordered" bind:value={newItem.price} />
            </div>
            <div class="card-actions justify-end mt-4">
                <button class="btn btn-primary" on:click={addItem}>Add Item</button>
            </div>
        </div>
    </div>

    <div class="card w-full max-w-4xl bg-base-100 shadow-xl border border-gray-200 mx-auto mt-6">
        <div class="card-body p-8">
            <h2 class="card-title text-xl font-greycliffmed text-charcoal mb-4">Current Inventory</h2>
            <div class="overflow-x-auto">
                <table class="table w-full">
                    <thead>
                        <tr>
                            <th>Item Name</th>
                            <th>Quantity</th>
                            <th>Price</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each $inventory as item}
                            <tr class="hover">
                                <td>{item.name}</td>
                                <td>{item.quantity}</td>
                                <td class="font-mono">${item.price}</td>
                                <td class="space-x-2">
                                    <button class="btn btn-xs btn-success" on:click={() => updateQuantity(item.id, 1)}>+</button>
                                    <button class="btn btn-xs btn-error" on:click={() => updateQuantity(item.id, -1)}>-</button>
                                </td>
                            </tr>
                        {/each}
                        {#if $inventory.length === 0}
                            <tr>
                                <td colspan="4" class="text-center text-gray-500 py-4">No items in inventory.</td>
                            </tr>
                        {/if}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>
