<script>
    import { onMount, onDestroy } from 'svelte';
    import { browser } from '$app/environment';
    import "../app.css";
    import { fullScreen, merchantLogo, theme, storeName, businessAddress } from './stores.js';
    import { fetchPrices } from './priceStore.js';
    import ThemeSwitcher from "./ThemeSwitcher.svelte";
    import { goto, afterNavigate } from '$app/navigation';
    import { Toaster } from 'svelte-french-toast';
    import Toast from './Toast.svelte';
    import { receiptToPrint } from './printStore.js';
    import Receipt from './pos/Receipt.svelte';
    import { tour } from '../utils/tourStore.js';
    import { page } from '$app/stores';
    import { tourSteps } from '../utils/tourSteps.js';

    theme.subscribe(value => {
        if (browser) {
            document.documentElement.setAttribute('data-theme', value);
        }
    });

    // Clean up the store after printing is done
    if (browser) {
        window.onafterprint = () => {
            receiptToPrint.set(null);
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
            const Shepherd = (await import('shepherd.js')).default;

            fetchPrices();
            document.documentElement.setAttribute('data-theme', $theme);
            document.addEventListener('fullscreenchange', handleFullscreenChange);

            const newTour = new Shepherd.Tour({
                defaultStepOptions: {
                    classes: 'shadow-lg bg-base-200 p-4 rounded-lg',
                    cancelIcon: {
                        enabled: true
                    },
                    scrollTo: { behavior: 'smooth', block: 'center' },
                    tippyOptions: {
                        maxWidth: 320,
                        popperOptions: {
                            modifiers: [{ name: 'preventOverflow', options: { mainAxis: false } }]
                        }
                    },
                },
                useModalOverlay: true
            });

            const steps = tourSteps(newTour);
            steps.forEach(step => {
                const stepOptions = { ...step };
                stepOptions.buttons = step.buttons.map(b => ({
                    ...b,
                    classes: b.secondary ? 'btn btn-ghost' : 'btn-primary'
                }));
                newTour.addStep(stepOptions);
            });
            tour.set(newTour);

            newTour.on('active', () => {
                // document.body.style.overflow = 'hidden'; // COMMENTED OUT TO FIX SCROLLING
            });
            newTour.on('inactive', () => {
                // document.body.style.overflow = ''; // COMMENTED OUT TO FIX SCROLLING
            });
        }
    });

    onDestroy(() => {
        if (browser) {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            if ($tour) {
                $tour.complete();
                tour.set(null);
            }
        }
    });
    
    function showStepWhenReady(tourInstance, stepId) {
        if (!tourInstance) return;
        const step = tourInstance.getById(stepId);
        if (!step || !step.options.attachTo || !step.options.attachTo.element) {
            tourInstance.show(stepId);
            return;
        }

        const elementSelector = step.options.attachTo.element;

        let attempts = 0;
        const maxAttempts = 100; // Wait up to 5 seconds

        const interval = setInterval(() => {
            const element = document.querySelector(elementSelector);
            
            if (element) {
                clearInterval(interval);
                tourInstance.show(stepId);
            } else if (attempts >= maxAttempts) {
                clearInterval(interval);
                console.error(`Tour Error: Could not find element "${elementSelector}" for step "${stepId}".`);
                step.options.attachTo = undefined; 
                tourInstance.show(stepId);
            }
            attempts++;
        }, 50);
    }

    afterNavigate(() => {
        if (browser && $tour) {
            const currentPath = $page.url.pathname;
            const currentStep = $tour.getCurrentStep();
            
            const pageToStepsMap = {
                '/dashboard': ['welcome', 'dashboard-metrics', 'dashboard-widgets', 'dashboard-nav'],
                '/pos': ['pos-intro', 'pos-create-charge', 'pos-transactions-list', 'pos-settings-wallet', 'pos-settings-data'],
                '/invoicing': ['invoicing-intro', 'invoicing-items', 'invoicing-actions', 'invoicing-table'],
                '/inventory': ['inventory-intro', 'inventory-add', 'inventory-variants', 'inventory-management', 'inventory-reports-view'],
                '/crm': ['crm-intro', 'crm-actions'],
                '/analytics': ['analytics-intro', 'analytics-filter', 'analytics-charts']
            };

            const stepsForCurrentPage = pageToStepsMap[currentPath];
            if (!stepsForCurrentPage && $tour.isActive()) {
                $tour.cancel();
                return;
            }

            if(stepsForCurrentPage) {
                const entryStepForCurrentPage = stepsForCurrentPage[0];
                if ($tour.isActive() && (!currentStep || !stepsForCurrentPage.includes(currentStep.id))) {
                    showStepWhenReady($tour, entryStepForCurrentPage);
                }
            }
        }
    });
</script>

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

<div class="bg-base-200 min-h-screen overflow-y-auto no-print">
    <Toaster />
    <Toast />
    <div class="fixed top-0 left-0 right-0 z-50 bg-base-100 shadow-md">
        <div class="navbar px-4">
            <div class="navbar-start">
                <div class="dropdown">
                    <label tabindex="0" class="btn btn-ghost lg:hidden">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h8m-8 6h16" /></svg>
                    </label>
                    <ul tabindex="0" class="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52">
                        <li><a href="/dashboard">Dashboard</a></li>
                        <li><a href="/pos">Point of Sale</a></li>
                        <li><a href="/invoicing">Invoicing</a></li>
                        <li><a href="/inventory">Inventory</a></li>
                        <li><a href="/crm">CRM</a></li>
                        <li><a href="/analytics">Analytics</a></li>
                        <li><a href="/documentation">Documentation</a></li>
                    </ul>
                </div>
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
                    <li><a href="/crm">CRM</a></li>
                    <li><a href="/analytics">Analytics</a></li>
                    <li><a href="/documentation">Documentation</a></li>
                </ul>
            </div>
            <div class="navbar-end">
                <ThemeSwitcher />
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
    </div>
    <main class="pt-24 pb-16 md:pb-4">
      <slot />
    </main>
</div>

<div class="print-area" style="display: none;">
    {#if $receiptToPrint}
        <Receipt 
            transaction={$receiptToPrint}
            storeName={$storeName}
            merchantLogo={$merchantLogo}
            businessAddress={$businessAddress}
        />
    {/if}
</div>
