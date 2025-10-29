<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { customers } from '../stores.js';
    import { showToast } from '../toastStore.js';

    export let customer = null;
    const dispatch = createEventDispatcher();

    // Initialize with loyaltyPoints
    let currentCustomer = customer ?
 { ...customer, loyaltyPoints: customer.loyaltyPoints || 0 } : { id: null, name: '', email: '', phone: '', wallet: '', notes: '', tags: [], communicationLog: [], loyaltyPoints: 0 };
    let newTag = '';
    let newLogEntry = '';

    function addTag() {
        if (newTag && !(currentCustomer.tags || []).includes(newTag)) {
            currentCustomer.tags = [...(currentCustomer.tags || []), newTag];
            newTag = '';
        }
    }

    function removeTag(tagToRemove) {
        currentCustomer.tags = (currentCustomer.tags || []).filter(tag => tag !== tagToRemove);
    }

    function addLogEntry() {
        if (newLogEntry) {
            currentCustomer.communicationLog = [{ timestamp: new Date().toISOString(), entry: newLogEntry }, ...(currentCustomer.communicationLog || [])];
            newLogEntry = '';
        }
    }

    function saveCustomer() {
        if (!currentCustomer.name.trim()) {
            showToast('Please enter a customer name.', 'error');
            return;
        }

        if (currentCustomer.id) {
            $customers = $customers.map(c => c.id === currentCustomer.id ? currentCustomer : c);
            dispatch('save', currentCustomer); // Dispatch even on update
        } else {
            // Ensure new customer starts with 0 points unless manually set elsewhere
            const newCustomer = { ...currentCustomer, id: Date.now().toString(), loyaltyPoints: currentCustomer.loyaltyPoints || 0 };
            $customers = [...$customers, newCustomer];
            dispatch('save', newCustomer); // Dispatch the new customer
        }
        dispatch('close');
    }
</script>

<div class="modal modal-open">
    <div class="modal-box">
        <h3 class="font-bold text-lg">{currentCustomer.id ?
 'Edit' : 'Add'} Customer</h3>
        <div class="py-4 space-y-4">
            <input type="text" placeholder="Name" class="input input-bordered w-full" bind:value={currentCustomer.name} />
            <input type="email" placeholder="Email" class="input input-bordered w-full" bind:value={currentCustomer.email} />
            <input type="tel" placeholder="Phone" class="input input-bordered w-full" bind:value={currentCustomer.phone} />
            <input type="text" placeholder="Wallet Address" class="input input-bordered w-full" bind:value={currentCustomer.wallet} />
            <textarea class="textarea textarea-bordered w-full" placeholder="Notes" bind:value={currentCustomer.notes}></textarea>

             {#if currentCustomer.id}
             <div class="form-control">
                <label class="label"><span class="label-text">Loyalty Points</span></label>
                <input type="number" class="input input-bordered w-full" bind:value={currentCustomer.loyaltyPoints} />
             </div>
             {/if}

            <div>
                <div class="flex items-center gap-2">
                    <input type="text" placeholder="Add a tag" class="input input-bordered w-full" bind:value={newTag} on:keydown.enter|preventDefault={addTag} />
                    <button class="btn btn-secondary" on:click={addTag}>Add</button>
                </div>
                <div class="flex flex-wrap gap-2 mt-2">
                    {#each (currentCustomer.tags ||
 []) as tag}
                        <div class="badge badge-outline gap-2">
                            {tag}
                            <button on:click={() => removeTag(tag)}>✕</button>
                        </div>
                    {/each}
                </div>
            </div>

            <div>
                <textarea class="textarea textarea-bordered w-full" placeholder="Add a communication log entry" bind:value={newLogEntry}></textarea>
                <button class="btn btn-secondary mt-2" on:click={addLogEntry}>Add Log</button>
            </div>

        </div>
        <div class="modal-action">
            <button class="btn" on:click={() => dispatch('close')}>Cancel</button>
            <button class="btn btn-primary" on:click={saveCustomer}>Save</button>
        </div>
    </div>
</div>
