<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { coupons, cartDiscount } from '../stores.js';
    import { showToast } from '../toastStore.js';

    const dispatch = createEventDispatcher();

    let activeTab = 'manual';
    
    // Manual tab
    let manualAmount = null;
    let manualType = 'percentage';

    // Coupon tab
    let couponCode = '';
    
    $: availableCoupons = $coupons.filter(c => c.isActive);

    function applyManualDiscount() {
        if (!manualAmount || manualAmount <= 0) {
            showToast('Please enter a positive discount amount.', 'error');
            return;
        }
        $cartDiscount = {
            type: manualType,
            value: manualAmount,
            code: `MANUAL ${manualType === 'percentage' ? '%' : '$'}`
        };
        showToast('Manual discount applied!', 'success');
        dispatch('close');
    }

    function applyCouponCode() {
        if (!couponCode.trim()) {
            showToast('Please enter a coupon code.', 'error');
            return;
        }
        
        const foundCoupon = $coupons.find(c => c.code.toLowerCase() === couponCode.trim().toLowerCase() && c.isActive);
        
        if (foundCoupon) {
            $cartDiscount = {
                type: foundCoupon.type,
                value: foundCoupon.value,
                code: foundCoupon.code
            };
            showToast(`Coupon "${foundCoupon.code}" applied!`, 'success');
            dispatch('close');
        } else {
            showToast('Invalid or expired coupon code.', 'error');
            $cartDiscount = null;
        }
    }
    
    function applyCouponFromList(coupon) {
        $cartDiscount = {
            type: coupon.type,
            value: coupon.value,
            code: coupon.code
        };
        showToast(`Coupon "${coupon.code}" applied!`, 'success');
        dispatch('close');
    }

    function clearDiscount() {
        $cartDiscount = null;
        showToast('Discount cleared.', 'info');
        dispatch('close');
    }
</script>

<div class="modal modal-open">
    <div class="modal-box w-11/12 max-w-lg">
        <h3 class="font-bold text-lg">Apply Discount</h3>
        
        <div role="tablist" class="tabs tabs-bordered justify-center mt-4">
            <button role="tab" class="tab" on:click={() => activeTab = 'manual'} class:tab-active={activeTab === 'manual'}>Manual</button>
            <button role="tab" class="tab" on:click={() => activeTab = 'coupon'} class:tab-active={activeTab === 'coupon'}>Coupon</button>
        </div>

        <div class:hidden={activeTab !== 'manual'} class="py-4 space-y-4">
            <p>Apply a manual discount to the cart subtotal.</p>
            <div class="form-control">
                <label class="label"><span class="label-text">Discount Amount</span></label>
                <div class="input-group">
                    <input type="number" placeholder="e.g., 10" class="input input-bordered w-full" bind:value={manualAmount} min="0.01" step="0.01" />
                    <select class="select select-bordered" bind:value={manualType}>
                        <option value="percentage">%</option>
                        <option value="fixed">$</option>
                    </select>
                </div>
            </div>
            <button class="btn btn-primary w-full" on:click={applyManualDiscount}>Apply Manual Discount</button>
        </div>

        <div class:hidden={activeTab !== 'coupon'} class="py-4 space-y-4">
            <form on:submit|preventDefault={applyCouponCode} class="input-group">
                <input type="text" placeholder="Enter coupon code..." class="input input-bordered w-full" bind:value={couponCode} />
                <button type="submit" class="btn btn-primary">Apply</button>
            </form>
            
            <div class="divider">Or Select Active Coupon</div>
            
            <div class="max-h-48 overflow-y-auto space-y-2">
                {#each availableCoupons as coupon (coupon.id)}
                    <button class="btn btn-outline btn-block justify-between" on:click={() => applyCouponFromList(coupon)}>
                        <span>
                            <span class="font-mono">{coupon.code}</span>
                            <span class="text-xs normal-case ml-2">({coupon.type === 'percentage' ? `${coupon.value}% off` : `$${coupon.value.toFixed(2)} off`})</span>
                        </span>
                        <span class="badge badge-success">Apply</span>
                    </button>
                {:else}
                    <p class="text-center opacity-70">No active coupons available.</p>
                {/each}
            </div>
        </div>
        
        <div class="modal-action justify-between">
            <button class="btn btn-error" on:click={clearDiscount} disabled={!$cartDiscount}>Clear Discount</button>
            <button class="btn" on:click={() => dispatch('close')}>Cancel</button>
        </div>
    </div>
</div>
