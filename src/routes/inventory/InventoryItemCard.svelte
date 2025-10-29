<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { locations } from '../stores.js';

    export let item;
    const dispatch = createEventDispatcher();
</script>

<div class="card bg-base-100 shadow-xl border overflow-hidden h-full flex flex-col">
    <div class="h-48 w-full relative">
        {#if item.imageURL}
            <img src={item.imageURL} alt={item.name} class="w-full h-full object-cover" />
        {:else}
            <div class="w-full h-full bg-base-200 flex items-center justify-center text-base-content/50">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-12 5h12a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            </div>
        {/if}
        
        <span class="badge absolute top-2 left-2 {item.quantity <= 5 ? 'badge-error' : 'badge-primary'}">
            Qty: {item.quantity}
        </span>
    </div>
    <div class="card-body p-4 flex-grow flex flex-col justify-between">
        <div>
            <h2 class="card-title text-lg font-greycliffmed leading-tight mb-1 truncate">{item.name}</h2>
            <p class="text-xs text-base-content/70">
                { $locations.find(loc => loc.id === item.locationId)?.name || 'No Location' }
            </p>
        </div>
        
        <div class="flex flex-col mt-2">
            <p class="text-xl font-mono font-bold">
                {#if item.type === 'simple'}
                    {(item.price || 0).toFixed(2)} {item.currency || ''}
                {:else if item.type === 'variable' && item.variants && item.variants.length > 0}
                    From ${(Math.min(...item.variants.map(v => v.price ?? 0)) || 0).toFixed(2)}
                {:else}
                    N/A
                {/if}
            </p>
            <div class="card-actions justify-end mt-3">
                <button class="btn btn-sm btn-outline w-full" on:click={() => dispatch('manage', item)}>Manage</button>
            </div>
        </div>
    </div>
</div>
