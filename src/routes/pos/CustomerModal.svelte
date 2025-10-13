<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { customers } from '../stores.js';
    import { showToast } from '../toastStore.js';
    import Fuse from 'fuse.js';

    const dispatch = createEventDispatcher();

    let searchTerm = '';
    let newCustomerName = '';

    $: fuse = new Fuse($customers, { keys: ['name', 'email'], threshold: 0.3 });
    $: filteredCustomers = searchTerm ? fuse.search(searchTerm).map(result => result.item) : $customers;

    function selectCustomer(customer) {
        dispatch('select', customer);
    }

    function addNewCustomer() {
        if (!newCustomerName.trim()) {
            showToast('Please enter a name for the new customer.', 'error');
            return;
        }
        const newCustomer = {
            id: Date.now().toString(),
            name: newCustomerName.trim(),
            email: '',
            phone: '',
            wallet: '',
            notes: '',
            tags: [],
            communicationLog: []
        };
        $customers = [...$customers, newCustomer];
        dispatch('select', newCustomer);
    }
</script>

<div class="modal modal-open">
    <div class="modal-box">
        <h3 class="font-bold text-lg">Select or Add Customer</h3>
        
        <div class="py-4 space-y-4">
            <input type="text" placeholder="Search existing customers..." class="input input-bordered w-full" bind:value={searchTerm} />
            
            <div class="max-h-60 overflow-y-auto">
                <ul class="menu bg-base-200 rounded-box">
                    {#each filteredCustomers as customer (customer.id)}
                        <li><a on:click={() => selectCustomer(customer)}>{customer.name}</a></li>
                    {/each}
                </ul>
            </div>

            <div class="divider">OR</div>

            <form on:submit|preventDefault={addNewCustomer} class="input-group">
                <input type="text" placeholder="Add new customer name..." class="input input-bordered w-full" bind:value={newCustomerName} />
                <button type="submit" class="btn btn-secondary">Add</button>
            </form>
        </div>

        <div class="modal-action">
            <button class="btn" on:click={() => dispatch('close')}>Cancel</button>
        </div>
    </div>
</div>
