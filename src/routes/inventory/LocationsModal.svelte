<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { locations } from '../stores.js';
    import { showToast } from '../toastStore.js';

    const dispatch = createEventDispatcher();
    let newLocationName = '';
    let nestingUnderId = null; // NEW: The ID of the parent location for the next addition

    function addLocation(parentId = null) {
        if (!newLocationName.trim()) return;

        // NEW: Save with optional parentId
        $locations = [...$locations, { 
            id: Date.now().toString(), 
            name: newLocationName.trim(),
            parentId: parentId 
        }];
        
        // Reset state
        newLocationName = '';
        nestingUnderId = null;
    }

    function removeLocation(locationId) {
        // NEW: Recursively find and remove all children
        const getChildrenIds = (id) => $locations.filter(l => l.parentId === id).flatMap(l => [l.id, ...getChildrenIds(l.id)]);
        const idsToRemove = [locationId, ...getChildrenIds(locationId)];
        $locations = $locations.filter(loc => !idsToRemove.includes(loc.id));
    }

    // NEW: Function to build a nested structure for hierarchical rendering
    function buildHierarchy(allLocations, parentId = null, level = 0) {
        return allLocations
            .filter(loc => loc.parentId === parentId)
            .map(parent => ({
                ...parent,
                level,
                children: buildHierarchy(allLocations, parent.id, level + 1)
            }));
    }

    // NEW: Function to flatten the hierarchy for the table while maintaining order
    function flattenLocations(hierarchy) {
        let flatList = [];
        for (const loc of hierarchy) {
            flatList.push(loc);
            flatList.push(...flattenLocations(loc.children));
        }
        return flatList;
    }

    // Reactive statements to manage the display list
    $: locationsHierarchy = buildHierarchy($locations);
    $: flatLocations = flattenLocations(locationsHierarchy);
</script>

<div class="modal modal-open">
    <div class="modal-box w-11/12 max-w-lg">
        <h3 class="font-bold text-lg">Manage Locations</h3>
        <div class="py-4 space-y-4">
            
            <form on:submit|preventDefault={() => addLocation(nestingUnderId)} class="input-group">
                <input type="text" placeholder="{nestingUnderId ? 'New sub-location name' : 'New top-level location name'}" class="input input-bordered w-full" bind:value={newLocationName} />
                <button type="submit" class="btn btn-primary">Add</button>
                {#if nestingUnderId}
                    <button type="button" class="btn btn-ghost" on:click={() => { nestingUnderId = null; newLocationName = ''; }}>Cancel Nesting</button>
                {/if}
            </form>

            <div class="overflow-x-auto">
                <table class="table w-full">
                    <tbody>
                        {#each flatLocations as location (location.id)}
                            <tr class="hover">
                                <td style="padding-left: {1 + (location.level * 1.5)}rem;">
                                    {#if location.level > 0}
                                        <span class="opacity-50 mr-1">↳</span>
                                    {/if}
                                    {location.name}
                                </td>
                                <td class="text-right space-x-2">
                                    <button class="btn btn-xs btn-outline btn-info" on:click={() => nestingUnderId = location.id}>Add Sub-Location</button>
                                    <button class="btn btn-xs btn-error" on:click={() => removeLocation(location.id)}>Remove</button>
                                </td>
                            </tr>
                        {/each}
                        {#if $locations.length === 0}
                            <tr><td colspan="2" class="text-center opacity-70 py-4">No locations added yet.</td></tr>
                        {/if}
                    </tbody>
                </table>
            </div>
        </div>
        <div class="modal-action">
            <button class="btn" on:click={() => dispatch('close')}>Done</button>
        </div>
    </div>
</div>
