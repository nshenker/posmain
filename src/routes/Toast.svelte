<script>
    import { toast as toastStore } from './toastStore.js';
    import { toast } from 'svelte-french-toast';
    import { onMount } from 'svelte';

    onMount(() => {
        const unsubscribe = toastStore.subscribe(notification => {
            if (notification) {
                switch (notification.type) {
                    case 'success':
                        toast.success(notification.message);
                        break;
                    case 'error':
                        toast.error(notification.message);
                        break;
                    default:
                        toast(notification.message);
                }
                // Reset the store so the toast doesn't re-appear on page navigation
                toastStore.set(null);
            }
        });

        return () => unsubscribe();
    });
</script>
