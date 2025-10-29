<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { locations } from '../stores.js';
    import { showToast } from '../toastStore.js';

    const dispatch = createEventDispatcher();
    let newLocationName = '';

    function addLocation() {
        if (newLocationName.trim()) {
            $locations = [...$locations, { id: Date.now().toString(), name: newLocationName.trim() }];
            newLocationName = '';
        }
    }

    function removeLocation(locationId) {
        $locations = $locations.filter(loc => loc.id !== locationId);
    }
</script>

<div class="modal modal-open">
    <div class="modal-box w-11/12 max-w-lg">
        <h3 class="font-bold text-lg">Manage Locations</h3>
        <div class="py-4 space-y-4">
            <form on:submit|preventDefault={addLocation} class="input-group">
                <input type="text" placeholder="New location name" class="input input-bordered w-full" bind:value={newLocationName} />
                <button type="submit" class="btn btn-primary">Add</button>
            </form>

            <div class="overflow-x-auto">
                <table class="table w-full">
                    <tbody>
                        {#each $locations as location}
                            <tr class="hover">
                                <td>{location.name}</td>
                                <td class="text-right">
                                    <button class="btn btn-xs btn-error" on:click={() => removeLocation(location.id)}>Remove</button>
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        </div>
        <div class="modal-action">
            <button class="btn" on:click={() => dispatch('close')}>Done</button>
        </div>
    </div>
</div>
