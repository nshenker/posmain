<script>
    import { onMount } from 'svelte';
    import { browser } from '$app/environment';
    import "../app.css";
    import { fullScreen, merchantLogo, theme } from './stores.js';
	import Fullscreen from "svelte-fullscreen";
    import ThemeSwitcher from "./ThemeSwitcher.svelte";
    import { goto } from '$app/navigation';
    import { Toaster } from 'svelte-french-toast';
    import Toast from './Toast.svelte';

    theme.subscribe(value => {
        if (browser) {
            document.documentElement.setAttribute('data-theme', value);
        }
    });

    onMount(() => {
        if(browser) {
            document.documentElement.setAttribute('data-theme', $theme);
        }
    });
</script>

{#if browser}
    <Fullscreen let:onRequest let:onExit bind:fullscreen={$fullScreen}>
        <div class="bg-base-200 min-h-screen">
            <Toaster />
            <Toast />
            <div class="fixed top-0 left-0 right-0 z-50 bg-base-100 shadow-md no-print">
                <div class="navbar px-4">
                    <div class="navbar-start">
                        {#if $merchantLogo}
                            <img src={$merchantLogo} alt="Merchant Logo" class="h-10">
                        {:else}
                            <button on:click={() => goto('/dashboard')} class="btn btn-ghost normal-case text-xl font-greycliffbold">PoSolana</button>
                        {/if}
                    </div>
                    <div class="navbar-center hidden lg:flex">
                        <ul class="menu menu-horizontal px-1">
                            <li><a href="/dashboard">Dashboard</a></li>
                            <li><a href="/pos">Point of Sale</a></li>
                            <li><a href="/invoicing">Invoicing</a></li>
                            <li><a href="/inventory">Inventory</a></li>
                            <li><a href="/analytics">Analytics</a></li>
                        </ul>
                    </div>
                    <div class="navbar-end">
                        <ThemeSwitcher />
                        <button class="btn btn-ghost btn-circle" on:click={$fullScreen ? onExit : onRequest}>
                            {#if !$fullScreen}
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 inline"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" /></svg>
                            {:else}
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 inline"><path stroke-linecap="round" stroke-linejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" /></svg>
                            {/if}
                        </button>
                    </div>
                </div>
            </div>
            <main class="pt-24 pb-16 md:pb-4">
              <slot />
            </main>
        </div>
    </Fullscreen>
{:else}
    <div class="bg-base-200 min-h-screen">
        <div class="fixed top-0 left-0 right-0 z-50 bg-base-100 shadow-md no-print">
            <div class="navbar px-4">
                <div class="navbar-start">
                    {#if $merchantLogo}
                        <img src={$merchantLogo} alt="Merchant Logo" class="h-10">
                    {:else}
                        <button on:click={() => goto('/dashboard')} class="btn btn-ghost normal-case text-xl font-greycliffbold">PoSolana</button>
                    {/if}
                </div>
                <div class="navbar-center hidden lg:flex">
                    <ul class="menu menu-horizontal px-1">
                        <li><a href="/dashboard">Dashboard</a></li>
                        <li><a href="/pos">Point of Sale</a></li>
                        <li><a href="/invoicing">Invoicing</a></li>
                        <li><a href="/inventory">Inventory</a></li>
                        <li><a href="/analytics">Analytics</a></li>
                    </ul>
                </div>
                <div class="navbar-end">
                    <ThemeSwitcher />
                </div>
            </div>
        </div>
        <main class="pt-24 pb-16 md:pb-4">
          <slot />
        </main>
    </div>
{/if}
