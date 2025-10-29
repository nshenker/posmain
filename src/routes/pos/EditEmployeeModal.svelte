<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { showToast } from '../toastStore.js';

    export let employee; // Employee object passed from parent
    export let allEmployees; // Full list of employees for PIN uniqueness check

    const dispatch = createEventDispatcher();
    
    // Create a local mutable copy of the employee details for binding
    let currentEmployee = { ...employee };
    
    function saveEmployee() {
        if (currentEmployee.name.trim() === '') {
            showToast('Employee name cannot be empty.', 'error');
            return;
        }
        if (currentEmployee.pin.trim().length < 4) {
            showToast('PIN must be at least 4 digits.', 'error');
            return;
        }
        if (currentEmployee.hourlyRate < 0) {
             showToast('Hourly rate cannot be negative.', 'error');
             return;
        }
        
        // Check if PIN is already used by another employee (excluding the current one)
        if (allEmployees.some(e => e.pin === currentEmployee.pin && e.id !== currentEmployee.id)) {
            showToast('This PIN is already in use by another employee.', 'error');
            return;
        }

        // Dispatch the updated employee data
        dispatch('save', currentEmployee);
        dispatch('close');
    }
</script>

<div class="modal modal-open">
    <div class="modal-box">
        <h3 class="font-bold text-lg">Edit {currentEmployee.name}'s Details</h3>
        <form on:submit|preventDefault={saveEmployee} class="py-4 space-y-4">
            
            <div class="form-control">
                <label class="label"><span class="label-text">Name</span></label>
                <input type="text" placeholder="Name" class="input input-bordered w-full" bind:value={currentEmployee.name} required />
            </div>
            
            <div class="grid grid-cols-2 gap-4">
                <div class="form-control">
                    <label class="label"><span class="label-text">Role</span></label>
                    <select class="select select-bordered" bind:value={currentEmployee.role}>
                        <option value="employee">Employee</option>
                        <option value="manager">Manager</option>
                    </select>
                </div>
                 <div class="form-control">
                    <label class="label"><span class="label-text">Hourly Rate ($/hr)</span></label>
                    <input type="number" placeholder="Hourly Rate" class="input input-bordered w-full" bind:value={currentEmployee.hourlyRate} step="0.01" min="0" required />
                </div>
            </div>

            <div class="form-control">
                <label class="label"><span class="label-text">PIN (4-6 digits)</span></label>
                <input type="text" placeholder="PIN" class="input input-bordered w-full" bind:value={currentEmployee.pin} pattern="\d{4,6}" inputmode="numeric" required />
            </div>

            <div class="modal-action mt-6">
                <button type="button" class="btn" on:click={() => dispatch('close')}>Cancel</button>
                <button type="submit" class="btn btn-primary">Save Changes</button>
            </div>
        </form>
    </div>
</div>
