<script lang='ts'>
    import { createEventDispatcher } from 'svelte';
    import { customers } from '../stores.js';
    import Fuse from 'fuse.js';

    const dispatch = createEventDispatcher();
    let searchTerm = '';

    $: fuse = new Fuse($customers, { keys: ['name', 'email'], threshold: 0.3 });
    $: filteredCustomers = searchTerm ? fuse.search(searchTerm).map(result => result.item) : $customers;

    function selectCustomer(customer) {
        dispatch('select', customer);
    }
</script>

<div class="modal modal-open">
    <div class="modal-box">
        <h3 class="font-bold text-lg">Select Customer</h3>
        <input type="text" placeholder="Search customers..." class="input input-bordered w-full mt-4" bind:value={searchTerm} />
        <div class="py-4 max-h-64 overflow-y-auto">
            <ul class="menu bg-base-100">
                {#each filteredCustomers as customer (customer.id)}
                    <li><a on:click={() => selectCustomer(customer)}>{customer.name}</a></li>
                {/each}
            </ul>
        </div>
        <div class="modal-action justify-between">
            <button class="btn btn-primary" on:click={() => dispatch('new')}>New Customer</button>
            <button class="btn" on:click={() => dispatch('close')}>Close</button>
        </div>
    </div>
</div>
