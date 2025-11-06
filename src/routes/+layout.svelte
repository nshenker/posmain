<script>
    import { onMount, onDestroy } from 'svelte';
    import { browser } from '$app/environment';
    import "../app.css";
    import { fullScreen, merchantLogo, theme, storeName, businessAddress, currentUser, barcodeScanned } from './stores.js';
    import { fetchPrices } from './priceStore.js';
    import ThemeSwitcher from "./ThemeSwitcher.svelte";
    import { goto, afterNavigate } from '$app/navigation';
    import { Toaster } from 'svelte-french-toast';
    import Toast from './Toast.svelte';
    import { receiptToPrint, invoiceToPrint } from './printStore.js';
    import Receipt from './pos/Receipt.svelte';
    import InvoicePrintable from './invoicing/InvoicePrintable.svelte';
    import { page } from '$app/stores';
    import LoginModal from './LoginModal.svelte';
    let showLogin = !$currentUser;
    // NEW STATE
    let showThemeModal = false;

	// --- NEW: Global Barcode Scanner Logic ---
    let barcodeBuffer = '';
    let lastKeypressTime = 0;
    const SCANNER_TIMEOUT = 50; // ms between keystrokes

    function handleKeydown(e) {
        const currentTime = Date.now();
// If there's a pause, reset the buffer. It's likely manual typing.
        if (currentTime - lastKeypressTime > SCANNER_TIMEOUT) {
            barcodeBuffer = '';
        }

        if (e.key === 'Enter') {
            if (barcodeBuffer.length > 3) { // Basic validation for a barcode
                barcodeScanned.set(barcodeBuffer);
// Update the store with the scanned code
                e.preventDefault();
// <-- THE FIX: Stop "Enter" from also submitting the form
            }
            barcodeBuffer = '';
        } else if (e.key.length === 1) { // Append alphanumeric characters
            barcodeBuffer += e.key;
        }

        lastKeypressTime = currentTime;
    }
	// --- END: Global Barcode Scanner Logic ---

    currentUser.subscribe(value => {
        showLogin = !value;
    });
    function logout() {
        currentUser.set(null);
        goto('/pos');
    }

    theme.subscribe(value => {
        if (browser) {
            document.documentElement.setAttribute('data-theme', value);
        }
    });
// Clean up the store after printing is done
    if (browser) {
        window.onafterprint = () => {
            receiptToPrint.set(null);
            invoiceToPrint.set(null);
        };
    }

    function handleFullscreenChange() {
        const isCurrentlyFullscreen = document.fullscreenElement != null;
        if ($fullScreen !== isCurrentlyFullscreen) {
            fullScreen.set(isCurrentlyFullscreen);
        }
    }

    async function toggleFullscreen() {
        if (!document.fullscreenElement) {
            await document.documentElement.requestFullscreen();
        } else {
            if (document.exitFullscreen) {
                await document.exitFullscreen();
            }
        }
    }

    onMount(async () => {
        if(browser) {
            fetchPrices();
            document.documentElement.setAttribute('data-theme', $theme);
            document.addEventListener('fullscreenchange', handleFullscreenChange);
        }
    });
    onDestroy(() => {
        if (browser) {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        }
    });
    afterNavigate(() => {
        if (browser) {
            const currentPath = $page.url.pathname;
            
            const pageToStepsMap = {
                '/dashboard': ['welcome', 'dashboard-metrics', 'dashboard-widgets', 'dashboard-nav'],
                '/pos': ['pos-intro', 'pos-create-charge', 'pos-transactions-list', 'pos-settings-wallet', 'pos-settings-data'],
                '/timeclock': ['timeclock-intro', 'timeclock-select'],
                '/invoicing': ['invoicing-intro', 'invoicing-items', 'invoicing-actions', 'invoicing-table'],
                '/inventory': ['inventory-intro', 'inventory-add', 'inventory-variants', 'inventory-management', 'inventory-reports-view'],
                '/crm': ['crm-intro', 'crm-actions'],
                '/analytics': ['analytics-intro', 'analytics-filter', 'analytics-charts']
            };

            const stepsForCurrentPage = pageToStepsMap[currentPath];
        }
    });
</script>

{#if showThemeModal}
    <ThemeSwitcher on:close={() => showThemeModal = false} />
{/if}

<style>
    @media print {
        .no-print {
            display: none !important;
        }
        .print-area {
            display: block !important;
            position: absolute;
            left: 0;
            top: 0;
        }
    }
</style>

<svelte:window on:keydown={handleKeydown} />

{#if showLogin && $page.url.pathname !== '/' && $page.url.pathname !== '/documentation'}
    <LoginModal on:login={() => showLogin = false} />

{:else if $page.url.pathname === '/'}
    <main class="min-h-screen">
        <slot />
    </main>

{:else}
    <Toaster />
    <Toast />
    
    <div class="drawer lg:drawer-open">
        <input id="my-drawer-2" type="checkbox" class="drawer-toggle" />
        
        <div class="drawer-content flex flex-col bg-base-200 min-h-screen no-print">
            
            <div class="navbar lg:hidden fixed top-0 left-0 right-0 z-50 bg-base-100 shadow-md">
                <div class="navbar-start">
                    <label for="my-drawer-2" class="btn btn-ghost btn-circle">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h8m-8 6h16" /></svg>
                    </label>
                    {#if $merchantLogo}
                        <img src={$merchantLogo} alt="Merchant Logo" class="h-10 ml-2">
                    {:else}
                        <button on:click={() => goto('/dashboard')} class="btn btn-ghost normal-case text-xl font-greycliffbold">PoSolana</button>
                    {/if}
                </div>
                
                <div class="navbar-end">
                    <button class="btn btn-ghost btn-circle" on:click={() => showThemeModal = true}>
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
                    </button>
                    {#if browser}
                        <button class="btn btn-ghost btn-circle" on:click={toggleFullscreen}>
                            {#if !$fullScreen}
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 inline"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" /></svg>
                            {:else}
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 inline"><path stroke-linecap="round" stroke-linejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" /></svg>
                            {/if}
                        </button>
                    {/if}
                </div>
            </div>

            <main class="flex-1 p-4 sm:p-6 lg:p-8 mt-16 lg:mt-0">
                <slot />
            </main>
        </div>
        
        <div class="drawer-side z-50">
            <label for="my-drawer-2" class="drawer-overlay"></label>
            <div class="menu w-64 h-full bg-base-100 text-base-content border-r shadow-xl flex flex-col">
                <div class="p-4 flex items-center justify-center h-16 border-b flex-shrink-0">
                    {#if $merchantLogo}
                        <img src={$merchantLogo} alt="Merchant Logo" class="h-10">
                    {:else}
                        <span class="text-xl font-greycliffbold text-primary">PoSolana</span>
                    {/if}
                </div>

                <ul class="menu p-4 w-full flex-grow overflow-y-auto">
                    <div class="divider my-2">Point of Sale</div>
                    <li class={($page.url.pathname === '/pos' ? 'bordered' : '')}><a href="/pos">New Charge</a></li>
                    <li class={($page.url.pathname === '/pos/transactions' ? 'bordered' : '')}><a href="/pos/transactions">Transactions</a></li>
                    <li class={($page.url.pathname === '/timeclock' ? 'bordered' : '')}><a href="/timeclock">Time Clock</a></li>

                    {#if $currentUser && $currentUser.role === 'manager'}
                        <div class="divider my-2">Back Office</div>
                        <li class={($page.url.pathname === '/dashboard' ? 'bordered' : '')}><a href="/dashboard">Dashboard</a></li>
                        <li class={($page.url.pathname === '/invoicing' ? 'bordered' : '')}><a href="/invoicing">Invoicing</a></li>
                        <li class={($page.url.pathname === '/inventory' ? 'bordered' : '')}><a href="/inventory">Inventory</a></li>
                        <li class={($page.url.pathname === '/crm' ? 'bordered' : '')}><a href="/crm">CRM</a></li>
                        <li class={($page.url.pathname === '/analytics' ? 'bordered' : '')}><a href="/analytics">Analytics</a></li>
                        <li class={($page.url.pathname === '/pos/settings' ? 'bordered' : '')}><a href="/pos/settings">Settings</a></li>
                    {/if}
                    
                    <div class="divider my-2">Other</div>
                    <li class={($page.url.pathname === '/documentation' ? 'bordered' : '')}><a href="/documentation">Documentation</a></li>
                </ul>
                
                <div class="p-4 border-t flex-shrink-0">
                    {#if $currentUser}
                        <p class="text-sm font-bold truncate mb-1">{$currentUser.name} ({$currentUser.role})</p>
                        <button class="btn btn-sm btn-outline btn-block" on:click={logout}>
                            Logout
                        </button>
                    {/if}
                    
                    <div class="flex justify-between items-center mt-2">
                        <button class="btn btn-ghost btn-sm" on:click={() => showThemeModal = true}>
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
                            <span>Change Theme</span>
                        </button>
                        {#if browser}
                            <button class="btn btn-ghost btn-circle btn-sm" on:click={toggleFullscreen}>
                                {#if !$fullScreen}
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 inline"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" /></svg>
                                {:else}
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 inline"><path stroke-linecap="round" stroke-linejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" /></svg>
                                    {/if}
                                </button>
                            {/if}
                        </div>
                    </div>
                </div>
            </div>
        {/if}

<div 
class="print-area" style="display: none;">
  
  {#if $receiptToPrint}
        <Receipt 
            transaction={$receiptToPrint}
            storeName={$storeName}
            merchantLogo={$merchantLogo}
            businessAddress={$businessAddress}
        />
    {/if}
    {#if $invoiceToPrint}
        <InvoicePrintable 
            invoiceData={$invoiceToPrint}
        />
    {/if}
</div>
