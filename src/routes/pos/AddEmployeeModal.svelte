<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { employees } from '../stores.js';
    import { showToast } from '../toastStore.js';

    const dispatch = createEventDispatcher();
    
    let newEmployee = { name: '', pin: '', role: 'employee', hourlyRate: 15.00 };

    function addEmployee() {
        if (newEmployee.name.trim() === '') {
            showToast('Employee name cannot be empty.', 'error');
            return;
        }
        if (newEmployee.pin.trim().length < 4) {
            showToast('PIN must be at least 4 digits.', 'error');
            return;
        }
        if (newEmployee.hourlyRate < 0) {
             showToast('Hourly rate cannot be negative.', 'error');
             return;
        }
        
        // Check if PIN is already used
        if ($employees.some(e => e.pin === newEmployee.pin)) {
            showToast('This PIN is already in use.', 'error');
            return;
        }

        // Add new employee with a default 'Clocked Out' status
        $employees = [...$employees, { ...newEmployee, id: Date.now().toString(), status: 'Clocked Out' }];
        
        // Reset state and notify success
        showToast('Employee added successfully.', 'success');
        dispatch('close');
    }
</script>

<div class="modal modal-open">
    <div class="modal-box">
        <h3 class="font-bold text-lg mb-4">Add New Employee</h3>
        <form on:submit|preventDefault={addEmployee} class="space-y-4">
            
            <div class="form-control">
                <label class="label"><span class="label-text">Name</span></label>
                <input type="text" placeholder="Name" class="input input-bordered w-full" bind:value={newEmployee.name} required />
            </div>
            
            <div class="grid grid-cols-2 gap-4">
                <div class="form-control">
                    <label class="label"><span class="label-text">Role</span></label>
                    <select class="select select-bordered" bind:value={newEmployee.role}>
                        <option value="employee">Employee</option>
                        <option value="manager">Manager</option>
                    </select>
                </div>
                 <div class="form-control">
                    <label class="label"><span class="label-text">Hourly Rate ($/hr)</span></label>
                    <input type="number" placeholder="15.00" class="input input-bordered w-full" bind:value={newEmployee.hourlyRate} step="0.01" min="0" required />
                </div>
            </div>

            <div class="form-control">
                <label class="label"><span class="label-text">PIN (4-6 digits)</span></label>
                <input type="text" placeholder="Set PIN" class="input input-bordered w-full" bind:value={newEmployee.pin} pattern="\d{4,6}" inputmode="numeric" required />
            </div>

            <div class="modal-action mt-6">
                <button type="button" class="btn" on:click={() => dispatch('close')}>Cancel</button>
                <button type="submit" class="btn btn-primary">Add Employee</button>
            </div>
        </form>
    </div>
</div>
