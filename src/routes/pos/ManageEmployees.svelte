<script lang="ts">
    import { employees } from '../stores.js';
    import { showToast } from '../toastStore.js';
    import EditEmployeeModal from './EditEmployeeModal.svelte';
    import AddEmployeeModal from './AddEmployeeModal.svelte'; // NEW IMPORT

    let employeeToEdit = null; 
    let showAddEmployeeModal = false; // NEW STATE

    function removeEmployee(id) {
        if (id === 'admin') {
            showToast('Cannot remove the default admin account.', 'error');
            return;
        }
        if (confirm('Are you sure you want to remove this employee?')) {
            $employees = $employees.filter(e => e.id !== id);
        }
    }

    // Function to open the Edit modal
    function openEditModal(employee) {
        employeeToEdit = employee;
    }
    
    // Function to save changes from the Edit modal
    function handleEditSave(event) {
        const updatedEmployee = event.detail;
        $employees = $employees.map(e => 
            e.id === updatedEmployee.id ? updatedEmployee : e
        );
        employeeToEdit = null;
        showToast('Employee details updated successfully.', 'success');
    }
</script>

{#if employeeToEdit}
    <EditEmployeeModal
        employee={employeeToEdit}
        allEmployees={$employees}
        on:close={() => employeeToEdit = null}
        on:save={handleEditSave}
    />
{/if}

{#if showAddEmployeeModal}
    <AddEmployeeModal on:close={() => showAddEmployeeModal = false} />
{/if}

<div class="card w-full max-w-2xl bg-base-100 shadow-xl border">
    <div class="card-body">
        <h2 class="card-title text-xl font-greycliffmed mb-4">Manage Employees</h2>
        
        <div class="flex justify-end mb-4">
             <button class="btn btn-primary" on:click={() => showAddEmployeeModal = true}>Add New Employee</button>
        </div>
        
        <h3 class="font-bold text-lg mb-2">Current Staff</h3>

        <div class="overflow-x-auto">
            <table class="table w-full">
          
                <thead>
                    <tr>
                        <th class="w-1/4">Name</th>
                        <th class="w-1/6">Role</th>
                        <th class="w-1/6 text-right">Hourly Rate</th>
                        <th class="w-1/6">Status</th>
                        <th class="w-1/4 text-center">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {#each $employees as employee (employee.id)}
  
                       <tr class="hover">
                            <td class="font-bold">{employee.name}</td>
                            <td><span class="badge badge-ghost whitespace-nowrap">{employee.role}</span></td>
                            <td class="text-right font-mono">${(employee.hourlyRate || 0).toFixed(2)}/hr</td>
                            <td>
                                <span class="badge badge-sm badge-outline whitespace-nowrap {employee.status === 'Clocked In' ? 'badge-success' : 'badge-neutral'}">
                                    {employee.status || 'N/A'}
                                </span>
                            </td>
                            <td class="text-center space-x-2">
                                <button class="btn btn-xs btn-outline btn-info" on:click={() => openEditModal(employee)}>Edit</button>
                                <button class="btn btn-xs btn-error" on:click={() => removeEmployee(employee.id)} disabled={employee.id === 'admin'}>Remove</button>
                            </td>
                        </tr>
                    {/each}
          
                </tbody>
            </table>
        </div>
    </div>
</div>
