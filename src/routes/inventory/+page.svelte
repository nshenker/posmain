<script lang='ts'>
    import { inventory, mints } from '../stores.js';

    let newItem = {
        name: '',
        quantity: null,
        price: null,
        currency: 'USDC' // Default currency
    };

    function addItem() {
        const name = newItem.name.trim();
        const quantity = Number(newItem.quantity);
        const price = Number(newItem.price);

        if (name && !isNaN(quantity) && quantity > 0 && !isNaN(price) && price >= 0) {
            const newItemData = {
                id: Date.now().toString(),
                name,
                quantity,
                price,
                currency: newItem.currency
            };
            $inventory = [...$inventory, newItemData];
            
            newItem = { name: '', quantity: null, price: null, currency: 'USDC' };
        } else {
            alert("Please fill out all fields with valid values.");
        }
    }

    function removeItem(itemId) {
        if (confirm("Are you sure you want to remove this item?")) {
            $inventory = $inventory.filter(item => item.id !== itemId);
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
            <form on:submit|preventDefault={addItem} class="grid grid-cols-1 md:grid-cols-6 gap-4">
                <input type="text" placeholder="Item Name" class="input input-bordered md:col-span-2" bind:value={newItem.name} />
                <input type="number" placeholder="Quantity" class="input input-bordered md:col-span-1" bind:value={newItem.quantity} min="1" step="1" />
                <div class="input-group md:col-span-2">
                    <input type="number" placeholder="Price" class="input input-bordered w-full" bind:value={newItem.price} min="0" step="0.01" />
                    <select class="select select-bordered" bind:value={newItem.currency}>
                        {#each $mints as mint}
                        <option value={mint.name}>{mint.name}</option>
                        {/each}
                    </select>
                </div>
                <button type="submit" class="btn btn-primary md:col-span-1">Add Item</button>
            </form>
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
                            <th class="text-center">Quantity</th>
                            <th class="text-right">Price</th>
                            <th class="text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each $inventory as item (item.id)}
                            <tr class="hover">
                                <td class="font-greycliffmed">{item.name}</td>
                                <td class="text-center font-mono">{item.quantity}</td>
                                <td class="text-right font-mono">{item.price.toFixed(2)} {item.currency}</td>
                                <td class="text-center space-x-2">
                                    <button class="btn btn-xs btn-outline btn-success" on:click={() => updateQuantity(item.id, 1)}>+</button>
                                    <button class="btn btn-xs btn-outline btn-warning" on:click={() => updateQuantity(item.id, -1)}>-</button>
                                    <button class="btn btn-xs btn-outline btn-error" on:click={() => removeItem(item.id)}>Remove</button>
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
