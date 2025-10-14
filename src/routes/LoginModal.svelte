<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { employees, currentUser } from './stores.js';
    import { showToast } from './toastStore.js';

    const dispatch = createEventDispatcher();
    let pin = '';

    function handleKeyPress(key) {
        if (key === 'Clear') {
            pin = '';
        } else if (key === 'Enter') {
            login();
        } else if (pin.length < 6) {
            pin += key;
        }
    }

    function login() {
        const user = $employees.find(e => e.pin === pin);
        if (user) {
            currentUser.set(user);
            dispatch('login');
        } else {
            showToast('Invalid PIN', 'error');
            pin = '';
        }
    }
</script>

<div class="modal modal-open">
    <div class="modal-box">
        <h3 class="font-bold text-lg">Enter PIN</h3>
        <input type="password" class="input input-bordered w-full text-center text-2xl my-4" bind:value={pin} readonly />
        <div class="grid grid-cols-3 gap-2">
            {#each ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'Clear', '0', 'Enter'] as key}
                <button class="btn btn-lg" on:click={() => handleKeyPress(key)}>{key}</button>
            {/each}
        </div>
    </div>
</div>
