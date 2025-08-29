<script lang='ts'>
    import { onMount } from "svelte";
    import { goto } from '$app/navigation';
    import { browser } from '$app/environment';
    import { storeName, merchantLogo, publicKey } from '../stores.js';

    let donateModal;
    let librariesLoaded = false;
    let createQR, encodeURL, web3;
    const devWallet = 'CXfJMf3d8mm96RGtttztVcCwTGr1Dwnk6vypRAhZs6Yo';

    onMount(async () => {
        if (browser && !$publicKey) {
            alert("Please set your merchant wallet address first.");
            goto('/');
        }
        if (browser) {
             try {
                const solanaPay = await import('@solana/pay');
                const solanaWeb3 = await import('@solana/web3.js');
                createQR = solanaPay.createQR;
                encodeURL = solanaPay.encodeURL;
                web3 = solanaWeb3;
                librariesLoaded = true;
            } catch (e) {
                console.error("Failed to load Solana libraries", e);
            }
        }
    });

    function showDonateModal() {
        if (donateModal) {
            donateModal.showModal();
            generateDonateQrCode();
        }
    }

    function generateDonateQrCode() {
        if (!librariesLoaded) return;
        const qrCodeElement = document.getElementById('donate-qr-code');
        if (!qrCodeElement) return;

        const url = encodeURL({
            recipient: new web3.PublicKey(devWallet),
            label: "Donation to PoSolana Dev"
        });
        
        const qr = createQR(url, 220, 'transparent');
        qrCodeElement.innerHTML = '';
        qr.append(qrCodeElement);
    }

    async function copyAddress() {
        try {
            await navigator.clipboard.writeText(devWallet);
            alert('Address copied to clipboard!');
        } catch (err) {
            console.error('Failed to copy text: ', err);
            alert('Failed to copy address.');
        }
    }
</script>

<!-- Donate Modal -->
<dialog bind:this={donateModal} class="modal">
    <div class="modal-box">
        <h3 class="font-bold text-lg">Donate to the Developer</h3>
        <p class="py-4">If you find PoSolana useful, please consider supporting its development. Thank you!</p>
        <div class="flex flex-col items-center justify-center space-y-4">
            <div id="donate-qr-code" class="bg-white p-2 rounded-md">
                {#if !librariesLoaded}
                    <div class="w-[220px] h-[220px] flex items-center justify-center">
                        <span class="loading loading-spinner loading-lg"></span>
                    </div>
                {/if}
            </div>
            <div class="input-group">
                <input type="text" value={devWallet} readonly class="input input-bordered w-full text-xs" />
                <button class="btn btn-square" on:click={copyAddress}>
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                </button>
            </div>
        </div>
        <div class="modal-action">
            <form method="dialog">
                <button class="btn">Close</button>
            </form>
        </div>
    </div>
</dialog>

<div class="container mx-auto px-4 sm:px-6 lg:px-8">
    <header class="text-center py-6">
        <h1 class="text-4xl font-greycliffbold text-charcoal">
            {$storeName} Merchant Suite
        </h1>
        {#if $merchantLogo}
            <img src={$merchantLogo} alt="Merchant Logo" class="h-24 mx-auto mt-4">
        {/if}
    </header>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
        <!-- Point of Sale Card -->
        <div class="card bg-base-100 shadow-xl border border-gray-200 hover:shadow-2xl transition-shadow">
            <div class="card-body items-center text-center">
                <h2 class="card-title text-2xl font-greycliffmed text-charcoal">Point of Sale</h2>
                <p>Create charges and accept payments in Solana.</p>
                <div class="card-actions justify-center mt-4">
                    <button on:click={() => goto('/pos')} class="btn btn-primary">Go to POS</button>
                </div>
            </div>
        </div>

        <!-- Invoicing Card -->
        <div class="card bg-base-100 shadow-xl border border-gray-200 hover:shadow-2xl transition-shadow">
            <div class="card-body items-center text-center">
                <h2 class="card-title text-2xl font-greycliffmed text-charcoal">Invoicing</h2>
                <p>Manage your customer invoices.</p>
                <div class="card-actions justify-center mt-4">
                    <button on:click={() => goto('/invoicing')} class="btn btn-primary">Manage Invoices</button>
                </div>
            </div>
        </div>

        <!-- Inventory Card -->
        <div class="card bg-base-100 shadow-xl border border-gray-200 hover:shadow-2xl transition-shadow">
            <div class="card-body items-center text-center">
                <h2 class="card-title text-2xl font-greycliffmed text-charcoal">Inventory</h2>
                <p>Keep track of your product inventory.</p>
                <div class="card-actions justify-center mt-4">
                    <button on:click={() => goto('/inventory')} class="btn btn-primary">Manage Inventory</button>
                </div>
            </div>
        </div>
        
        <!-- Donate Card -->
        <div class="card bg-base-100 shadow-xl border border-gray-200 hover:shadow-2xl transition-shadow">
            <div class="card-body items-center text-center">
                <h2 class="card-title text-2xl font-greycliffmed text-charcoal">Support Us</h2>
                <p>Enjoying PoSolana? Consider donating to the developer.</p>
                <div class="card-actions justify-center mt-4">
                    <button class="btn btn-accent" on:click={showDonateModal}>Donate</button>
                </div>
            </div>
        </div>
    </div>
</div>
