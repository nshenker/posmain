<script>
    import { onMount } from 'svelte';
    import "../app.css";
    import { fullScreen, merchantLogo, theme } from './stores.js';
    import Fullscreen from "svelte-fullscreen";
    import ThemeSwitcher from "./ThemeSwitcher.svelte";

    // Subscribe to the theme store and update the data-theme attribute on the HTML element
    theme.subscribe(value => {
        if (typeof document !== 'undefined') {
            document.documentElement.setAttribute('data-theme', value);
        }
    });
    // Ensure the theme is set on mount for client-side rendering
    onMount(() => {
        document.documentElement.setAttribute('data-theme', $theme);
    });
</script>

 <Fullscreen let:onRequest let:onExit>
  <div class="bg-base-200 min-h-screen">
    <div class="fixed top-4 right-4 z-50 flex items-center space-x-4">
        <ThemeSwitcher />
        {#if $merchantLogo}
            <img src={$merchantLogo} alt="Merchant Logo" class="h-12">
        {/if}
    </div>
    <button class="fixed top-4 left-4 text-gray-400 hover:text-charcoal z-50" on:click={() => ($fullScreen ? onExit() : onRequest(), $fullScreen = !$fullScreen)}>
        {#if !$fullScreen}
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 inline">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
        </svg>
        {:else}
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 inline">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
        </svg>
        {/if}
    </button>
    <main class="pt-20 pb-16 md:pb-4">
      <slot />
    </main>
  </div>
</Fullscreen>
