<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { loyaltyRedemptionRate } from '../stores.js';
    import { showToast } from '../toastStore.js';

    const dispatch = createEventDispatcher();

    // Deep clone the store value for local editing
    let rate = { ...$loyaltyRedemptionRate };

    function saveRate() {
        if (rate.points <= 0 || rate.discount <= 0) {
            showToast('Points and Discount must be greater than zero.', 'error');
            return;
        }
        $loyaltyRedemptionRate = rate;
        showToast('Loyalty redemption rate saved!', 'success');
        dispatch('close');
    }
</script>

<div class="modal modal-open">
    <div class="modal-box w-11/12 max-w-lg">
        <h3 class="font-bold text-lg">Loyalty Redemption Settings</h3>
        <p class="py-4">Define how many points are required for a specific USD discount value. (E.g., 100 points = $10 off)</p>
        
        <div class="grid grid-cols-2 gap-4">
            <div class="form-control">
                <label class="label"><span class="label-text">Points Required</span></label>
                <input type="number" class="input input-bordered w-full" bind:value={rate.points} min="1" step="1" />
            </div>
            <div class="form-control">
                <label class="label"><span class="label-text">USD Discount Value ($)</span></label>
                <input type="number" class="input input-bordered w-full" bind:value={rate.discount} min="0.01" step="0.01" />
            </div>
        </div>

        <div class="alert alert-info shadow-lg mt-6">
            <div>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current flex-shrink-0 w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <span>Current Rate: {rate.points} points = ${rate.discount.toFixed(2)} off.</span>
            </div>
        </div>

        <div class="modal-action">
            <button class="btn" on:click={() => dispatch('close')}>Cancel</button>
            <button class="btn btn-primary" on:click={saveRate}>Save Settings</button>
        </div>
    </div>
</div>
