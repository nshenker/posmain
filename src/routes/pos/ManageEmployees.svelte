<script lang="ts">
    import { employees } from '../stores.js';
    import { showToast } from '../toastStore.js';

    let newEmployee = { name: '', pin: '', role: 'employee' };
    let editingEmployeeId = null;
    let newPin = '';

    function addEmployee() {
        if (newEmployee.name.trim() && newEmployee.pin.trim()) {
            if ($employees.some(e => e.pin === newEmployee.pin)) {
                showToast('This PIN is already in use.', 'error');
                return;
            }
            // Add new employee with a default 'Clocked Out' status
            $employees = [...$employees, { ...newEmployee, id: Date.now().toString(), status: 'Clocked Out' }];
            newEmployee = { name: '', pin: '', role: 'employee' };
            showToast('Employee added', 'success');
        } else {
            showToast('Please enter a name and PIN.', 'error');
        }
    }

    function removeEmployee(id) {
        if (id === 'admin') {
            showToast('Cannot remove the default admin account.', 'error');
            return;
        }
        if (confirm('Are you sure you want to remove this employee?')) {
            $employees = $employees.filter(e => e.id !== id);
        }
    }

    function startEditing(employee) {
        editingEmployeeId = employee.id;
        newPin = employee.pin;
    }

    function savePin(employeeId) {
        if (newPin.trim().length < 4) {
            showToast('PIN must be at least 4 digits.', 'error');
            return;
        }
        if ($employees.some(e => e.pin === newPin && e.id !== employeeId)) {
            showToast('This PIN is already in use.', 'error');
            return;
        }
        $employees = $employees.map(e => {
            if (e.id === employeeId) {
                return { ...e, pin: newPin };
            }
            return e;
        });
        editingEmployeeId = null;
        newPin = '';
        showToast('PIN updated successfully.', 'success');
    }
</script>

<div class="card w-full max-w-2xl bg-base-100 shadow-xl border">
    <div class="card-body">
        <h2 class="card-title text-xl font-greycliffmed mb-4">Manage Employees</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <input type="text" placeholder="Name" class="input input-bordered" bind:value={newEmployee.name} />
            <input type="text" placeholder="PIN (at least 4 digits)" class="input input-bordered" bind:value={newEmployee.pin} />
            <select class="select select-bordered" bind:value={newEmployee.role}>
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
            </select>
        </div>
        <button class="btn btn-primary" on:click={addEmployee}>Add Employee</button>
        <div class="divider"></div>
        <div class="overflow-x-auto">
            <table class="table w-full">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Role</th>
                        <th>PIN</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {#each $employees as employee (employee.id)}
                        <tr class="hover">
                            <td>{employee.name}</td>
                            <td><span class="badge badge-ghost">{employee.role}</span></td>
                            <td>
                                {#if editingEmployeeId === employee.id}
                                    <input type="text" class="input input-sm input-bordered w-24" bind:value={newPin} />
                                {:else}
                                    <span>****</span>
                                {/if}
                            </td>
                            <td class="text-right">
                                {#if editingEmployeeId === employee.id}
                                    <button class="btn btn-xs btn-success" on:click={() => savePin(employee.id)}>Save</button>
                                    <button class="btn btn-xs btn-ghost" on:click={() => editingEmployeeId = null}>Cancel</button>
                                {:else}
                                    <button class="btn btn-xs btn-outline" on:click={() => startEditing(employee)}>Edit PIN</button>
                                    <button class="btn btn-xs btn-error ml-2" on:click={() => removeEmployee(employee.id)} disabled={employee.id === 'admin'}>Remove</button>
                                {/if}
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    </div>
</div>
