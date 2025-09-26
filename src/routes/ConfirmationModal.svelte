<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    export let message = "Are you sure?";
    const dispatch = createEventDispatcher();
</script>

<div class="modal modal-open">
    <div class="modal-box">
        <h3 class="font-bold text-lg">Confirm Action</h3>
        <p class="py-4">{message}</p>
        <div class="modal-action">
            <button class="btn" on:click={() => dispatch('cancel')}>Cancel</button>
            <button class="btn btn-error" on:click={() => dispatch('confirm')}>Confirm</button>
        </div>
    </div>
</div>
