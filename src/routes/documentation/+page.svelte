<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { browser } from '$app/environment';

    let activeSection = 'introduction';
    let observer;

    const sections = [
        { id: 'introduction', title: 'Introduction & Philosophy' },
        { id: 'getting-started', title: 'Getting Started' },
        { id: 'feature-guide', title: 'In-Depth Feature Guide' },
        { id: 'data-security', title: 'Data, Security, and Backups' },
        { id: 'faq', title: 'FAQ' },
        { id: 'update-notes', title: 'Update Notes' }
    ];

    onMount(() => {
        if (!browser) return;

        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.3
        };

        observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    activeSection = entry.target.id;
                }
            });
        }, observerOptions);

        sections.forEach(section => {
            const el = document.getElementById(section.id);
            if (el) observer.observe(el);
        });
    });

    onDestroy(() => {
        if (observer) {
            observer.disconnect();
        }
    });

    const updateNotes = [
        {
            version: 'v1.14',
            date: 'October 2025',
            title: 'Credit Card Payments & System-Wide Integration',
            notes: [
                'New Feature: Integrated Stripe to allow merchants to accept credit card payments directly through the POS.',
                'New Feature: Added a comprehensive Product Variant system to the Inventory page for items with multiple options like size or color.',
                'New Feature: Implemented a dynamic sales tax system, allowing merchants to set a tax rate and apply it on a per-transaction basis.',
                'Enhancement: The printed receipt has been completely redesigned for a more professional look and now dynamically shows the payment method (Card or Solana) and tax information.',
                'Enhancement: Added a Business Address field in settings, which now appears on receipts.',
                'Enhancement: The data export and import system has been upgraded to include all new settings, such as Stripe keys, tax info, and product variant data.',
                'Fix: Resolved critical bugs to ensure transaction compatibility with a wider range of wallets, including Solflare.',
                'Fix: The interactive tour and all analytics have been updated to be fully compatible with all new features.'
            ]
        },
        // ... other update notes remain the same
    ];
</script>

<style>
    section {
        padding-top: 4rem;
        margin-top: -4rem;
    }
    .prose h2 {
        @apply text-3xl mb-4 border-b pb-2;
        font-family: 'GreycliffBold', sans-serif;
    }
    .prose h3 {
        @apply text-2xl mt-8 mb-3;
        font-family: 'GreycliffMed', sans-serif;
    }
</style>

<div class="container mx-auto px-4 sm:px-6 lg:px-8">
    <header class="text-center py-10">
        <h1 class="text-5xl font-greycliffbold text-primary">PoSolana Suite Documentation</h1>
        <p class="text-xl mt-4 text-base-content/80">Your complete guide to leveraging the full power of decentralized commerce.</p>
    </header>

    <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside class="lg:col-span-1 lg:sticky top-24 h-max">
            <div class="card bg-base-100 shadow-xl border">
                <div class="card-body p-6">
                    <h2 class="card-title text-lg font-greycliffmed">On this page</h2>
                    <ul class="menu menu-compact text-base">
                        {#each sections as section}
                            <li>
                                <a href="#{section.id}" class:bg-base-300={activeSection === section.id}>
                                    {section.title}
                                </a>
                            </li>
                        {/each}
                    </ul>
                </div>
            </div>
        </aside>

        <main class="lg:col-span-3 prose max-w-none">
            <section id="introduction">
                <h2>Introduction & Philosophy</h2>
                <p>
                    Welcome to the <strong>PoSolana Suite</strong>, your all-in-one solution for running a modern business on the Solana network. This platform is a comprehensive toolkit, integrating <strong>Point of Sale (POS)</strong>, <strong>Inventory Management</strong>, <strong>Invoicing</strong>, <strong>Customer Relationship Management (CRM)</strong>, and advanced <strong>Analytics</strong> into a single, cohesive interface.
                </p>
                <p>
                    A foundational principle of the suite is <strong>data privacy and user control</strong>. All your critical business data is stored exclusively in your <strong>local browser storage</strong>. This means no cloud servers, no monthly data fees, and no third-party access to your information. You are the sole custodian of your data, ensuring maximum privacy and security.
                </p>
            </section>

            <div class="divider"></div>

            <section id="getting-started">
                <h2>Getting Started</h2>
                <p>Follow these simple steps to get your store up and running in minutes. For a hands-on walkthrough, we highly recommend using our interactive product tour, which you can start from the Dashboard at any time.</p>
                
                <ul class="timeline timeline-vertical mt-6">
                    </ul>
            </section>

            <div class="divider"></div>

            <section id="feature-guide">
                <h2>In-Depth Feature Guide</h2>
                
                <h3>Credit Card & Hybrid Payments</h3>
                <p>The PoSolana Suite now allows you to serve all your customers by integrating with <strong>Stripe</strong> to accept credit and debit card payments alongside your existing crypto options. To enable this, simply add your secure Stripe API keys in the settings. The system will automatically convert any crypto amount to its current USD value for the card transaction.</p>

                <h3>Point of Sale (POS)</h3>
                <p>Engineered for speed and flexibility, our POS allows you to create charges from inventory items or custom amounts. It supports multiple cryptocurrencies and now, with Stripe, traditional card payments. For crypto, a Solana Pay QR code is generated, and the transaction status updates in real-time.</p>
                
                </section>
            
            <div class="divider"></div>

            <section id="data-security">
                <h2>Data, Security, and Backups</h2>
                <div class="alert alert-warning shadow-lg mt-4">
                    <div>
                        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        <span><strong>Important:</strong> Your data is stored locally in your browser. It is crucial to export your data regularly to prevent loss.</span>
                    </div>
                </div>
            </section>

            <div class="divider"></div>

            <section id="faq">
                <h2>Frequently Asked Questions (FAQ)</h2>
                <div class="space-y-2 mt-4">
                    <div class="collapse collapse-arrow bg-base-200">
                        <input type="checkbox" /> 
                        <div class="collapse-title text-xl font-medium">
                            Where is my data stored?
                        </div>
                        <div class="collapse-content"> 
                            <p>Your data is stored exclusively in your web browser's local storage. It is not sent to any external servers, ensuring you have complete control and privacy over your information.</p>
                        </div>
                    </div>
                    </div>
            </section>

            <div class="divider"></div>
            
            <section id="update-notes">
                <h2>Update Notes</h2>
                 <div class="space-y-2 mt-4">
                    {#each updateNotes as update}
                        <div class="collapse collapse-arrow bg-base-200">
                            <input type="checkbox" /> 
                            <div class="collapse-title text-xl font-medium">
                                {update.title} ({update.version}) - {update.date}
                            </div>
                            <div class="collapse-content"> 
                                <ul class="list-disc pl-6">
                                    {#each update.notes as note}
                                        <li>{note}</li>
                                    {/each}
                                </ul>
                            </div>
                        </div>
                    {/each}
                </div>
            </section>
        </main>
    </div>
</div>
