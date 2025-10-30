<script lang="ts">
    import { customers, invoices, customerGroups, successArray, mints } from '../stores.js';
    import { get } from 'svelte/store';
    import { tokenPrices } from '../priceStore.js';
    import CustomerDetailsModal from './CustomerDetailsModal.svelte';
    import CustomerViewModal from './CustomerViewModal.svelte';
    import ManageGroupsModal from './ManageGroupsModal.svelte';
    import { exportCustomersToCsv, importCustomersFromCsv } from '../../utils/csv.js';
    import ConfirmationModal from '../ConfirmationModal.svelte';
    import Fuse from 'fuse.js';
    import dayjs from 'dayjs'; // Import dayjs

    let showCustomerModal = false;
    let showViewModal = false;
    let showGroupsModal = false;
    let selectedCustomer = null;
    let customerToRemove = null;

    let selectedTag = '';
    let selectedGroup = '';
    let searchTerm = '';

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

    function confirmRemoveCustomer(customerId) {
        customerToRemove = customerId;
    }

    function doRemoveCustomer() {
        if (customerToRemove) {
            $customers = $customers.filter(c => c.id !== customerToRemove);
            customerToRemove = null;
        }
    }

    $: allTags = [...new Set($customers.flatMap(c => c.tags || []))];
    $: fuse = new Fuse($customers, { keys: ['name', 'email', 'phone'], threshold: 0.3 });
    $: searchedCustomers = searchTerm ? fuse.search(searchTerm).map(result => result.item) : $customers;

    $: filteredCustomers = searchedCustomers.filter(customer => {
        const tagMatch = selectedTag ? (customer.tags || []).includes(selectedTag) : true;
        const group = $customerGroups.find(g => g.id === selectedGroup);
        const groupMatch = selectedGroup ? (group ? group.customerIds.includes(customer.id) : false) : true;
        return tagMatch && groupMatch;
    });

    // --- NEW LOGIC START: Calculate Total Spent in USD ---
    
    // 1. Merge all confirmed sales (POS transactions + Paid Invoices)
    $: paidInvoicesAsSales = $invoices.filter(inv => inv.status === 'Paid').map(inv => ({
        timestamp: dayjs(inv.issueDate).unix(),
        uiAmount: inv.total,
        mint: inv.paymentCurrency,
        items: inv.items,
        txid: `invoice-${inv.id}`,
        customerId: inv.customerId,
    }));
    $: allSales = [...$successArray, ...paidInvoicesAsSales];

    // 2. Calculate the total USD value spent for each customer
    $: salesByCustomerUSD = (() => {
        const prices = get(tokenPrices);
        const mintsArray = get(mints);
        if (!prices || Object.keys(prices).length === 0) return {};

        const usdMap = {};
        
        const getTxnUsdValue = (txn) => {
            // If the transaction was a card payment (recorded as 'USD'), the value is already USD.
            if (txn.mint === 'USD') {
                return txn.uiAmount;
            }
            
            const mintInfo = mintsArray.find(m => m.name === txn.mint);
            if (!mintInfo) return 0;

            // Get the price based on CoinGecko ID
            const price = prices[mintInfo.coingeckoId]?.usd || 0;
            return txn.uiAmount * price;
        };

        allSales.forEach(sale => {
            const customerId = sale.customerId || null;
            if (customerId) {
                const usdValue = getTxnUsdValue(sale);
                usdMap[customerId] = (usdMap[customerId] || 0) + usdValue;
            }
        });
        return usdMap;
    })();

    // 3. Map the calculated USD spent back to the customer list
    $: customersWithData = filteredCustomers.map(customer => {
        const totalSpentUSD = salesByCustomerUSD[customer.id] || 0;
        
        return {
            ...customer,
            totalSpent: totalSpentUSD, // Now correctly calculated in USD
            loyaltyPoints: customer.loyaltyPoints || 0
        };
    });
    // --- NEW LOGIC END ---
</script>

<style>
    @media (max-width: 767px) {
        .responsive-table thead {
            display: none;
        }
        .responsive-table tbody, .responsive-table tr, .responsive-table td {
            display: block;
            width: 100%;
        }
        .responsive-table tr {
            margin-bottom: 1rem;
            border-bottom: 2px solid oklch(var(--b2));
            padding-bottom: 1rem;
        }
        .responsive-table td {
            text-align: right;
            padding-left: 50%;
            position: relative;
        }
        .responsive-table td::before {
            content: attr(data-label);
            position: absolute;
            left: 0.5rem;
            width: 45%;
            padding-right: 0.5rem;
            text-align: left;
            font-weight: bold;
        }
    }
</style>

{#if customerToRemove}
    <ConfirmationModal
        message="Are you sure you want to delete this customer?"
        on:confirm={doRemoveCustomer}
        on:cancel={() => customerToRemove = null}
    />
{/if}

<div class="container mx-auto px-4 sm:px-6 lg:px-8">
    <header class="text-center py-6">
        <h1 class="text-4xl font-greycliffbold">Customer Relationship Management</h1>
    </header>

    <div id="crm-actions" class="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
        <div class="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <input type="text" placeholder="Search customers..." class="input input-bordered w-full" bind:value={searchTerm} />
           <select class="select select-bordered w-full" bind:value={selectedTag}>
                <option value="">All Tags</option>
                {#each allTags as tag}
                    <option value={tag}>{tag}</option>
                {/each}
            </select>
         <select class="select select-bordered w-full" bind:value={selectedGroup}>
                <option value="">All Groups</option>
                {#each $customerGroups as group}
                    <option value={group.id}>{group.name}</option>
                {/each}
            </select>
       </div>
        <div class="flex gap-2 flex-wrap justify-center">
            <button class="btn btn-secondary" on:click={() => importCustomersFromCsv()}>Import CSV</button>
            <button class="btn btn-secondary" on:click={() => exportCustomersToCsv($customers)}>Export CSV</button>
            <button class="btn btn-secondary" on:click={() => showGroupsModal = true}>Manage Groups</button>
            <button class="btn btn-primary" on:click={addNewCustomer}>Add New Customer</button>
        </div>
    </div>

  <div id="crm-table" class="card bg-base-100 shadow-xl border">
        <div class="card-body">
            <div class="overflow-x-auto">
                <table class="table w-full responsive-table">
                    <thead>
                        <tr>
        <th>Name</th>
                            <th>Tags</th>
                            <th>Email</th>
                        <th>Phone</th>
                            <th class="text-right">Loyalty Points</th>
                            <th class="text-right">Total Spent</th>
                            <th class="text-center">Actions</th>
       </tr>
                    </thead>
                    <tbody>
                        {#each customersWithData as customer (customer.id)}
               <tr class="hover">
                                <td data-label="Name" class="font-greycliffmed">{customer.name}</td>
                                <td data-label="Tags">
                   <div class="flex flex-wrap gap-1 justify-end md:justify-start">
                                        {#each (customer.tags || []).slice(0, 2) as tag}
                                            <span class="badge badge-outline">{tag}</span>
                                        {/each}
           {#if (customer.tags || []).length > 2}
                                            <span class="badge badge-outline">...</span>
                    {/if}
                                    </div>
                                </td>
            <td data-label="Email">{customer.email}</td>
                                <td data-label="Phone">{customer.phone}</td>
                                <td data-label="Loyalty Points" class="text-right font-mono">{customer.loyaltyPoints}</td>
          <td data-label="Total Spent" class="text-right font-mono">${customer.totalSpent.toFixed(2)}</td>
                                <td data-label="Actions" class="md:text-center">
                                    <div class="flex flex-wrap justify-end md:justify-center gap-1">
                                        <button class="btn btn-xs btn-outline" on:click={() => viewCustomer(customer)}>View</button>
                                        <button class="btn btn-xs btn-outline" on:click={() => editCustomer(customer)}>Edit</button>
       <button class="btn btn-xs btn-outline btn-error" on:click={() => confirmRemoveCustomer(customer.id)}>Delete</button>
                                    </div>
                        </td>
                            </tr>
                        {/each}
                        {#if $customers.length === 0}
             <tr>
                                <td colspan="7" class="text-center py-4">No customers yet.</td>
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
        on:save={() => showCustomerModal = false}
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
