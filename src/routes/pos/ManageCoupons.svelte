<script lang="ts">
    import { coupons } from '../stores.js';
    import { showToast } from '../toastStore.js';
    import ConfirmationModal from '../ConfirmationModal.svelte';

    let newCode = '';
    let newValue = 10;
    let newType = 'percentage';
    let couponToRemove = null;

    function addCoupon() {
        if (!newCode.trim()) {
            showToast('Please enter a coupon code.', 'error');
            return;
        }
        if (newValue <= 0) {
            showToast('Discount value must be greater than 0.', 'error');
            return;
        }
        if ($coupons.some(c => c.code.toLowerCase() === newCode.trim().toLowerCase())) {
            showToast('This coupon code already exists.', 'error');
            return;
        }

        const newCoupon = {
            id: Date.now().toString(),
            code: newCode.trim().toUpperCase(),
            type: newType, // 'percentage' or 'fixed'
            value: newValue,
            isActive: true
        };

        $coupons = [...$coupons, newCoupon];
        showToast(`Coupon "${newCoupon.code}" added!`, 'success');
        
        newCode = '';
        newValue = 10;
    }

    function removeCoupon() {
        if (!couponToRemove) return;
        $coupons = $coupons.filter(c => c.id !== couponToRemove.id);
        showToast(`Coupon "${couponToRemove.code}" removed.`, 'success');
        couponToRemove = null;
    }
</script>

{#if couponToRemove}
    <ConfirmationModal
        message="Are you sure you want to delete the coupon '{couponToRemove.code}'?"
        on:confirm={removeCoupon}
        on:cancel={() => couponToRemove = null}
    />
{/if}

<div class="card w-full bg-base-100 shadow-xl border">
    <div class="card-body p-4 sm:p-8">
        <h2 class="card-title text-xl font-greycliffmed mb-4">Manage Coupons & Discounts</h2>
        
        <form on:submit|preventDefault={addCoupon} class="card bg-base-200 p-4 rounded-lg">
            <h3 class="font-bold mb-2">Create New Coupon</h3>
            
            <div class="flex flex-wrap gap-2 items-center">
                
                <input 
                    type="text" 
                    placeholder="Coupon" 
                    class="input input-bordered w-full sm:w-auto sm:flex-1" 
                    bind:value={newCode} 
                    required 
                />
                
                <input 
                    type="number" 
                    placeholder="10" 
                    class="input input-bordered w-24" 
                    bind:value={newValue} 
                    min="0.01" 
                    step="0.01" 
                    required 
                />
                
                <select 
                    class="select select-bordered w-32" 
                    bind:value={newType}
                >
                    <option value="percentage">% Percentage</option>
                    <option value="fixed">$ Fixed Amount</option>
                </select>
                
                <button type="submit" class="btn btn-primary w-full sm:w-auto">ADD</button>
            </div>
            </form>
        
        <div class="divider"></div>
        
        <h3 class="font-bold mb-2">Active Coupons</h3>
        <div class="overflow-x-auto">
            <table class="table w-full table-sm">
                <thead>
                    <tr>
                        <th>Code</th>
                        <th>Type</th>
                        <th class="text-right">Value</th>
                        <th class="text-center">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {#each $coupons as coupon (coupon.id)}
                        <tr class="hover">
                            <td class="font-mono">{coupon.code}</td>
                            <td><span class="badge badge-ghost">{coupon.type}</span></td>
                            <td class="text-right font-mono">
                                {coupon.type === 'percentage' ? `${coupon.value}%` : `$${coupon.value.toFixed(2)}`}
                            </td>
                            <td class="text-center">
                                <button class="btn btn-xs btn-error" on:click={() => couponToRemove = coupon}>
                                    Remove
                                </button>
                            </td>
                        </tr>
                    {/each}
                    {#if $coupons.length === 0}
                        <tr>
                            <td colspan="4" class="text-center py-4">No coupons created yet.</td>
                        </tr>
                    {/if}
                </tbody>
            </table>
        </div>
    </div>
</div>
