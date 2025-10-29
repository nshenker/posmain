<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { customerGroups, customers } from '../stores.js';
    import { showToast } from '../toastStore.js';

    const dispatch = createEventDispatcher();

    let newGroupName = '';
    let selectedGroupId = null;

    function addGroup() {
        if (newGroupName.trim()) {
            $customerGroups = [...$customerGroups, { id: Date.now().toString(), name: newGroupName, customerIds: [] }];
            newGroupName = '';
        }
    }

    function removeGroup(groupId) {
        $customerGroups = $customerGroups.filter(g => g.id !== groupId);
        if (selectedGroupId === groupId) {
            selectedGroupId = null;
        }
    }

    function isCustomerInGroup(customerId) {
        const group = $customerGroups.find(g => g.id === selectedGroupId);
        return group ? group.customerIds.includes(customerId) : false;
    }

    function toggleCustomerInGroup(customerId) {
        $customerGroups = $customerGroups.map(g => {
            if (g.id === selectedGroupId) {
                if (g.customerIds.includes(customerId)) {
                    g.customerIds = g.customerIds.filter(id => id !== customerId);
                } else {
                    g.customerIds = [...g.customerIds, customerId];
                }
            }
            return g;
        });
    }
</script>

<div class="modal modal-open">
    <div class="modal-box w-11/12 max-w-4xl">
        <h3 class="font-bold text-lg">Manage Customer Groups</h3>
        
        <div class="py-4 space-y-4">
            <div class="flex items-center gap-2">
                <input type="text" placeholder="New group name" class="input input-bordered w-full" bind:value={newGroupName} />
                <button class="btn btn-primary" on:click={addGroup}>Add Group</button>
            </div>

            <div class="divider"></div>

            <div class="grid grid-cols-3 gap-4">
                <div class="col-span-1">
                    <h4 class="font-bold">Groups</h4>
                    <ul class="menu bg-base-100 rounded-box">
                        {#each $customerGroups as group}
                            <li>
                                <button class:active={selectedGroupId === group.id} on:click={() => selectedGroupId = group.id} class="w-full justify-between">
                                    {group.name}
                                    <span on:click|stopPropagation={() => removeGroup(group.id)}>✕</span>
                                </button>
                            </li>
                        {/each}
                    </ul>
                </div>

                <div class="col-span-2">
                    <h4 class="font-bold">Customers in Group</h4>
                    {#if selectedGroupId}
                        <div class="max-h-64 overflow-y-auto">
                            {#each $customers as customer}
                                <div class="form-control">
                                    <label class="label cursor-pointer">
                                        <span class="label-text">{customer.name}</span> 
                                        <input type="checkbox" class="checkbox" checked={isCustomerInGroup(customer.id)} on:change={() => toggleCustomerInGroup(customer.id)} />
                                    </label>
                                </div>
                            {/each}
                        </div>
                    {:else}
                        <p>Select a group to manage customers.</p>
                    {/if}
                </div>
            </div>
        </div>
        
        <div class="modal-action">
            <button class="btn" on:click={() => dispatch('close')}>Done</button>
        </div>
    </div>
</div>
