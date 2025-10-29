<script lang='ts'>
    import { createEventDispatcher } from 'svelte';
    import { savedCarts } from '../stores.js';
    import { showToast } from '../toastStore.js';
    import dayjs from 'dayjs';

    const dispatch = createEventDispatcher();

    function selectCart(cart) {
        dispatch('select', cart);
    }

    function deleteCart(cartId) {
        if (confirm('Are you sure you want to delete this saved cart?')) {
            $savedCarts = $savedCarts.filter(cart => cart.id !== cartId);
            showToast('Cart deleted.', 'success');
        }
    }
</script>

<div class="modal modal-open">
    <div class="modal-box w-11/12 max-w-lg">
        <h3 class="font-bold text-lg">Load Saved Cart</h3>
        <div class="py-4 max-h-96 overflow-y-auto">
            {#if $savedCarts.length > 0}
                <table class="table w-full table-sm">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Items</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each $savedCarts as cart (cart.id)}
                            <tr class="hover">
                                <td>{cart.name}</td>
                                <td class="text-center">{cart.items.length}</td>
                                <td class="space-x-1 text-center">
                                    <button class="btn btn-xs btn-outline btn-success" on:click={() => selectCart(cart)}>Load</button>
                                    <button class="btn btn-xs btn-outline btn-error" on:click={() => deleteCart(cart.id)}>Delete</button>
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            {:else}
                <p class="text-center">No carts saved yet.</p>
            {/if}
        </div>
        <div class="modal-action">
            <button class="btn" on:click={() => dispatch('close')}>Close</button>
        </div>
    </div>
</div>
