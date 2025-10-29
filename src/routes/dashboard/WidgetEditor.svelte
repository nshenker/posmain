<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { dashboardLayout } from '../stores.js';

    const dispatch = createEventDispatcher();

    function toggleWidgetVisibility(widgetId) {
        dashboardLayout.update(layout => {
            const widget = layout.widgets.find(w => w.id === widgetId);
            if (widget) {
                widget.visible = !widget.visible;
            }
            return layout;
        });
    }
</script>

<div class="modal modal-open">
    <div class="modal-box">
        <h3 class="font-bold text-lg">Edit Dashboard Widgets</h3>
        
        <div class="py-4 space-y-2">
            {#each $dashboardLayout.widgets as widget (widget.id)}
                <div class="form-control">
                    <label class="label cursor-pointer">
                        <span class="label-text">{widget.name}</span> 
                        <input 
                            type="checkbox" 
                            class="toggle toggle-primary" 
                            checked={widget.visible} 
                            on:change={() => toggleWidgetVisibility(widget.id)} 
                        />
                    </label>
                </div>
            {/each}
        </div>

        <div class="modal-action">
            <button class="btn btn-primary" on:click={() => dispatch('close')}>Done</button>
        </div>
    </div>
</div>
