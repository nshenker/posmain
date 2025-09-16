<script lang="ts">
    import { customers, invoices, customerGroups } from '../stores.js';
    import CustomerDetailsModal from './CustomerDetailsModal.svelte';
    import CustomerViewModal from './CustomerViewModal.svelte';
    import ManageGroupsModal from './ManageGroupsModal.svelte';

    let showCustomerModal = false;
    let showViewModal = false;
    let showGroupsModal = false;
    let selectedCustomer = null;

    let selectedTag = '';
    let selectedGroup = '';

    function addNewCustomer() {
        selectedCustomer = null;
        showCustomerModal = true;
    }

    function editCustomer(customer) {
        selectedCustomer = customer;
        showCustomerModal = true;
    }

    function viewCustomer(customer) {
        selectedCustomer = customer;
        showViewModal = true;
    }

    function removeCustomer(customerId) {
        if (confirm('Are you sure you want to delete this customer?')) {
            $customers = $customers.filter(c => c.id !== customerId);
        }
    }

    $: allTags = [...new Set($customers.flatMap(c => c.tags || []))];

    $: filteredCustomers = $customers.filter(customer => {
        const tagMatch = selectedTag ? (customer.tags || []).includes(selectedTag) : true;
        const group = $customerGroups.find(g => g.id === selectedGroup);
        const groupMatch = selectedGroup ? (group ? group.customerIds.includes(customer.id) : false) : true;
        return tagMatch && groupMatch;
    });

    $: customersWithData = filteredCustomers.map(customer => {
        const customerInvoices = $invoices.filter(invoice => invoice.customerId === customer.id && invoice.status === 'Paid');
        const totalSpent = customerInvoices.reduce((acc, inv) => acc + inv.total, 0);
        return {
            ...customer,
            totalSpent
        };
    });
</script>

<div class="container mx-auto px-4 sm:px-6 lg:px-8">
    <header class="text-center py-6">
        <h1 class="text-4xl font-greycliffbold">Customer Relationship Management</h1>
    </header>

    <div class="flex justify-between items-center mb-4">
        <div>
            <select class="select select-bordered mr-2" bind:value={selectedTag}>
                <option value="">All Tags</option>
                {#each allTags as tag}
                    <option value={tag}>{tag}</option>
                {/each}
            </select>
            <select class="select select-bordered" bind:value={selectedGroup}>
                <option value="">All Groups</option>
                {#each $customerGroups as group}
                    <option value={group.id}>{group.name}</option>
                {/each}
            </select>
        </div>
        <div>
            <button class="btn btn-secondary mr-2" on:click={() => showGroupsModal = true}>Manage Groups</button>
            <button class="btn btn-primary" on:click={addNewCustomer}>Add New Customer</button>
        </div>
    </div>

    <div class="card bg-base-100 shadow-xl border">
        <div class="card-body">
            <div class="overflow-x-auto">
                <table class="table w-full">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th class="text-right">Total Spent</th>
                            <th class="text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each customersWithData as customer (customer.id)}
                            <tr class="hover">
                                <td class="font-greycliffmed">{customer.name}</td>
                                <td>{customer.email}</td>
                                <td>{customer.phone}</td>
                                <td class="text-right font-mono">${customer.totalSpent.toFixed(2)}</td>
                                <td class="text-center space-x-1">
                                    <button class="btn btn-xs btn-outline" on:click={() => viewCustomer(customer)}>View</button>
                                    <button class="btn btn-xs btn-outline" on:click={() => editCustomer(customer)}>Edit</button>
                                    <button class="btn btn-xs btn-outline btn-error" on:click={() => removeCustomer(customer.id)}>Delete</button>
                                </td>
                            </tr>
                        {/each}
                        {#if $customers.length === 0}
                            <tr>
                                <td colspan="5" class="text-center py-4">No customers yet.</td>
                            </tr>
                        {/if}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>

{#if showCustomerModal}
    <CustomerDetailsModal
        customer={selectedCustomer}
        on:close={() => showCustomerModal = false}
    />
{/if}

{#if showViewModal}
    <CustomerViewModal
        customer={selectedCustomer}
        on:close={() => showViewModal = false}
    />
{/if}

{#if showGroupsModal}
    <ManageGroupsModal
        on:close={() => showGroupsModal = false}
    />
{/if}
