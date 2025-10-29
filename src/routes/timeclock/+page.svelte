<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { employees, timeClockEvents, currentUser } from '../stores.js';
    import { showToast } from '../toastStore.js';
    import TimeClockReports from './TimeClockReports.svelte'; // NEW IMPORT

    let currentTime = new Date();
    let selectedEmployee = null;
    let pin = '';
    let interval;
    let showReports = false; // NEW STATE
    
    onMount(() => {
        interval = setInterval(() => {
            currentTime = new Date();
        }, 1000);
    });
    onDestroy(() => {
        clearInterval(interval);
    });
    function handleSelectEmployee(employee) {
        selectedEmployee = employee;
        pin = '';
    }

    function handleKeyPress(key) {
        if (pin.length < 6) {
            pin += key;
        }
    }

    function confirmAction(action) {
        if (!selectedEmployee) return;
        if (pin !== selectedEmployee.pin) {
            showToast('Invalid PIN.', 'error');
            pin = '';
            return;
        }

        const newStatus = {
            'Clock In': 'Clocked In',
            'Start Break': 'On Break',
            'Start Lunch': 'On Lunch',
            'End Break': 'Clocked In',
            'End Lunch': 'Clocked In',
          
            'Clock Out': 'Clocked Out',
        }[action];
        // Update employee status in the store
        employees.update(allEmployees => {
            return allEmployees.map(emp => 
                emp.id === selectedEmployee.id ? { ...emp, status: newStatus } : emp
            );
        });
        // Log the event
        timeClockEvents.update(events => [
            ...events,
            {
                employeeId: selectedEmployee.id,
                employeeName: selectedEmployee.name,
                type: action,
            
                timestamp: new Date().toISOString()
            }
        ]);
        showToast(`${selectedEmployee.name} has successfully ${action.toLowerCase()}.`, 'success');

        // Reset state
        selectedEmployee = null;
        pin = '';
    }

    function getStatusClass(status) {
        switch (status) {
            case 'Clocked In': return 'badge-success';
            case 'On Break': return 'badge-warning';
            case 'On Lunch': return 'badge-warning';
            case 'Clocked Out': return 'badge-neutral';
            default: return 'badge-ghost';
        }
    }

    $: recentEvents = [...$timeClockEvents].reverse().slice(0, 5);
</script>

<div class="container mx-auto px-4">
    {#if showReports}
        <TimeClockReports onBack={() => showReports = false} />
    {:else}
        <div class="card bg-base-100 shadow-xl max-w-4xl mx-auto">
            <div class="card-body">
                <div id="timeclock-header" class="text-center mb-6">
                    <h1 class="card-title text-3xl justify-center font-greycliffbold">Employee Time Clock</h1>
                    <p class="text-2xl font-mono mt-2">{currentTime.toLocaleTimeString()}</p>
                    
                    {#if $currentUser && $currentUser.role === 'manager'}
                        <button class="btn btn-sm btn-outline btn-info mt-4" on:click={() => showReports = true}>
                            View Payroll Reports
                        </button>
                    {/if}
                </div>

           
                {#if !selectedEmployee}
                    <div>
                        <h2 class="text-xl font-greycliffmed mb-4 text-center">Select Your Name</h2>
                        <div id="employee-selection-grid" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {#each $employees as employee}
   
                                <button 
                                    class="card bg-base-200 shadow-md hover:bg-base-300 active:bg-primary active:text-primary-content transform transition-transform duration-150 ease-in-out active:scale-95 h-32" 
                              
                                    on:click={() => handleSelectEmployee(employee)}
                                >
                                    <div class="card-body items-center justify-center text-center p-2">
                               
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mb-1 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    
                                        </svg>
                                        <span class="font-bold text-base whitespace-normal leading-tight">{employee.name}</span>
                                        <span class="badge badge-sm {getStatusClass(employee.status)} mt-1">{employee.status ||
                                        'Clocked Out'}</span>
                                    </div>
                                </button>
                            {/each}
               
                        </div>
                    </div>
                {:else}
                    <div class="w-full max-w-sm mx-auto">
                         <div class="text-center">
                            <h2 class="text-2xl 
                            font-greycliffmed">Welcome, {selectedEmployee.name}</h2>
                            <p class="mb-4">Enter your PIN to continue.</p>
                        </div>
                        
                        <input type="password" class="input input-bordered w-full text-center tracking-widest text-3xl mb-4" bind:value={pin} 
                        readonly placeholder="----"/>

                        <div class="grid grid-cols-3 gap-2 mb-4">
                            {#each ['1', '2', '3', '4', '5', '6', '7', '8', '9'] as key}
                                <button class="btn btn-lg" on:click={() => handleKeyPress(key)}>{key}</button>
       
                            {/each}
                            <button class="btn btn-lg btn-warning" on:click={() => pin = pin.slice(0, -1)}>←</button>
                            <button class="btn btn-lg" on:click={() => handleKeyPress('0')}>0</button>
                         
                            <button class="btn btn-lg btn-error" on:click={() => pin = ''}>Clear</button>
                        </div>

                        <div class="space-y-2">
                            {#if selectedEmployee.status === 'Clocked Out' ||
                            !selectedEmployee.status}
                                <button class="btn btn-success w-full btn-lg" on:click={() => confirmAction('Clock In')}>Clock In</button>
                            {:else if selectedEmployee.status === 'Clocked In'}
                                <div class="grid grid-cols-2 gap-2">
   
                                    <button class="btn btn-warning w-full" on:click={() => confirmAction('Start Break')}>Start Break</button>
                                    <button class="btn btn-warning w-full" on:click={() => confirmAction('Start Lunch')}>Start Lunch</button>
                       
                                </div>
                                <button class="btn btn-error w-full mt-2" on:click={() => confirmAction('Clock Out')}>Clock Out</button>
                            {:else if selectedEmployee.status === 'On Break'}
                                <button 
                                class="btn btn-info w-full btn-lg" on:click={() => confirmAction('End Break')}>End Break</button>
                            {:else if selectedEmployee.status === 'On Lunch'}
                                <button class="btn btn-info w-full btn-lg" on:click={() => confirmAction('End Lunch')}>End Lunch</button>
                            {/if}
  
                        </div>

                        <div class="text-center mt-4">
                            <button class="btn btn-ghost" on:click={() => selectedEmployee = null}>← Back to Employee List</button>
                        </div>
     
                    </div>
                {/if}
                
                <div class="divider my-8">Recent Activity</div>
                <div class="overflow-x-auto">
                    <table class="table table-zebra table-sm w-full">
                 
                        <thead>
                            <tr>
                                <th>Time</th>
                                <th>Employee</th>
                 
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {#each 
                            recentEvents as event}
                                <tr>
                                    <td>{new Date(event.timestamp).toLocaleTimeString()}</td>
                                    <td>{event.employeeName}</td>
     
                                    <td><span class="badge badge-outline">{event.type}</span></td>
                                </tr>
                            {/each}
                   
                            {#if recentEvents.length === 0}
                                <tr><td colspan="3" class="text-center">No recent activity.</td></tr>
                            {/if}
                        </tbody>
                    
                    </table>
                </div>
            </div>
        </div>
    {/if}
</div>
