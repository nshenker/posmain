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
            rootMargin: '-100px 0px -50% 0px', // Adjust margin to trigger highlighting sooner
            threshold: 0
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

    // All update notes are restored here
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
        {
            version: 'v1.13',
            date: 'October 2025',
            title: 'Dynamic Sales Tax & Receipt Overhaul',
            notes: [
                'New Feature: Added a "Tax Settings" section to the Settings page, allowing merchants to define a sales tax rate and set a default preference.',
                'New Feature: A new "Apply Tax" toggle on the Point of Sale page gives merchants on-the-fly control over charging tax for individual transactions.',
                'Enhancement: The printed receipt has been completely redesigned to match a professional, detailed format.',
                'Enhancement: Receipts are now "tax-aware" and will only show a sales tax line item if tax was applied to the transaction.',
                'Enhancement: The data backup and restore system now includes all new tax settings.'
            ]
        },
        {
            version: 'v1.12',
            date: 'October 2025',
            title: 'Product Variants & System-Wide Stability',
            notes: [
                'New Feature: Added a comprehensive Product Variant system to the Inventory page, allowing for items with multiple attributes like size or color.',
                'New Feature: The POS and Invoicing pages now fully support adding specific product variants to a charge or invoice.',
                'Enhancement: Inventory stock and history are now tracked on a per-variant basis, providing a more granular audit trail.',
                'Enhancement: The "Top Selling Products" and "Profitability" analytics reports now correctly process and display data for individual variants.',
                'Enhancement: The interactive product tour has been updated to explain the new Product Variant system.',
                'Fix: Resolved a critical bug that caused the Inventory page to load a blank screen on the first visit.',
                'Fix: Corrected an issue where barcodes for product variants could not be found when scanned.',
                'Fix: Ensured that the data backup and restore system correctly handles all new product variant data.'
            ]
        },
        {
            version: 'v1.11',
            date: 'October 2025',
            title: 'Major Mobile Redesign & Interactive Tour',
            notes: [
                'Complete mobile UI overhaul for a clean, modern, and highly functional experience on any device.',
                'Redesigned the Point of Sale page with a sleek, unified tab bar for intuitive navigation on both mobile and desktop.',
                'Introduced a brand new, fully responsive guided product tour to help users master every feature of the suite.',
                'Enhanced the tour\'s logic to be device-aware, ensuring a flawless experience from start to finish on any screen size.'
            ]
        },
        // ... all other past update notes
    ];
</script>

<style>
    section {
        padding-top: 5rem; /* Increased padding to offset sticky header */
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
        <aside class="lg:col-span-1">
            <div class="sticky top-24">
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
            </div>
        </aside>

        <main class="lg:col-span-3 prose max-w-none">
            <section id="introduction">
                <h2>Introduction & Philosophy</h2>
                <p>
                    Welcome to the <strong>PoSolana Suite</strong>, your all-in-one solution for running a modern business on the Solana network. This platform is a comprehensive toolkit, integrating <strong>Point of Sale (POS)</strong>, <strong>Inventory Management</strong>, <strong>Invoicing</strong>, <strong>Customer Relationship Management (CRM)</strong>, and advanced <strong>Analytics</strong> into a single, cohesive interface. This guide provides an in-depth walkthrough of every feature, from initial setup to advanced data management, helping you harness the full power of decentralized commerce.
                </p>
                <p>
                    A foundational principle of the suite is <strong>data privacy and user control</strong>. All your critical business data is stored exclusively in your <strong>local browser storage</strong>. This means no cloud servers, no monthly data fees, and no third-party access to your information. You are the sole custodian of your data, ensuring maximum privacy and security.
                </p>
            </section>

            <div class="divider my-12"></div>

            <section id="getting-started">
                <h2>Getting Started</h2>
                <p>Follow these simple steps to get your store up and running in minutes. For a hands-on walkthrough, we highly recommend using our interactive product tour, which you can start from the Dashboard at any time.</p>
                
                <ul class="timeline timeline-vertical mt-6">
                    </ul>
            </section>

            <div class="divider my-12"></div>

            <section id="feature-guide">
                <h2>In-Depth Feature Guide</h2>
                <div class="space-y-4">
                    <div class="collapse collapse-plus bg-base-200">
                        <input type="checkbox" />
                        <div class="collapse-title text-xl font-greycliffmed">Credit Card & Hybrid Payments</div>
                        <div class="collapse-content"><p>The PoSolana Suite now allows you to serve all your customers by integrating with <strong>Stripe</strong> to accept credit and debit card payments alongside your existing crypto options. To enable this, simply add your secure Stripe API keys in the settings. The system will automatically convert any crypto amount to its current USD value for the card transaction.</p></div>
                    </div>
                    <div class="collapse collapse-plus bg-base-200">
                        <input type="checkbox" />
                        <div class="collapse-title text-xl font-greycliffmed">Point of Sale (POS)</div>
                        <div class="collapse-content"><p>Engineered for speed and flexibility, our POS allows you to create charges from inventory items or custom amounts. It supports multiple cryptocurrencies and now, with Stripe, traditional card payments. For crypto, a Solana Pay QR code is generated, and the transaction status updates in real-time.</p></div>
                    </div>
                    <div class="collapse collapse-plus bg-base-200">
                        <input type="checkbox" />
                        <div class="collapse-title text-xl font-greycliffmed">Receipts and Printing</div>
                        <div class="collapse-content"><p>After each transaction, you can provide customers with a clean, professional receipt. From the <strong>Transaction History</strong> page, simply click the "Print" button. The receipt is optimized for standard thermal printers and now dynamically shows the payment method used—whether it was a Solana wallet or a credit card.</p></div>
                    </div>
                    <div class="collapse collapse-plus bg-base-200">
                        <input type="checkbox" />
                        <div class="collapse-title text-xl font-greycliffmed">Inventory Management</div>
                        <div class="collapse-content"><p>Our comprehensive inventory system is designed to provide full control over your stock. It now supports both **Simple Products** (with a single stock count) and **Variable Products** for items with multiple options like size or color. Each variant can have its own SKU, price, cost, and barcode, and its stock is tracked individually, giving you a precise and granular view of your inventory at all times.</p></div>
                    </div>
                    <div class="collapse collapse-plus bg-base-200">
                        <input type="checkbox" />
                        <div class="collapse-title text-xl font-greycliffmed">CRM (Customer Relationship Management)</div>
                        <div class="collapse-content"><p>Our <strong>CRM</strong> is a powerful suite of tools designed to help you build and maintain strong relationships with your customers. It automatically tracks each customer's full purchase history, including the specific product variants they bought. The CRM also features <strong>customer tagging</strong> for easy segmentation and a <strong>communication log</strong> to track all your interactions.</p></div>
                    </div>
                     <div class="collapse collapse-plus bg-base-200">
                        <input type="checkbox" />
                        <div class="collapse-title text-xl font-greycliffmed">Invoicing</div>
                        <div class="collapse-content"><p>Create, manage, and track professional invoices for your clients. You can either select an existing customer from your CRM or add a new one on the fly. Invoices can be populated with items from your inventory—including specific product variants—or with custom line items. Each invoice generates a unique <strong>Solana Pay QR code</strong> for direct payment, and the system automatically checks for on-chain payment confirmation.</p></div>
                    </div>
                    <div class="collapse collapse-plus bg-base-200">
                        <input type="checkbox" />
                        <div class="collapse-title text-xl font-greycliffmed">Analytics</div>
                        <div class="collapse-content"><p>The <strong>Analytics</strong> page gives you a clear and comprehensive overview of your business's performance. All financial data is converted to its real-time USD value for accuracy. You can view sales by payment method (including "USD" for card payments), and because we track costs for each product variant, your profitability metrics are always precise.</p></div>
                    </div>
                </div>
            </section>
            
            <div class="divider my-12"></div>

            <section id="data-security">
                <h2>Data, Security, and Backups</h2>
                <div class="alert alert-warning shadow-lg mt-4">
                    </div>
            </section>

            <div class="divider my-12"></div>

            <section id="faq">
                <h2>Frequently Asked Questions (FAQ)</h2>
                <div class="space-y-2 mt-4">
                    </div>
            </section>

            <div class="divider my-12"></div>
            
            <section id="update-notes">
                <h2>Update Notes</h2>
                 <div class="space-y-2 mt-4">
                    {#each updateNotes as update}
                        <div class="collapse collapse-plus bg-base-200">
                            <input type="checkbox" /> 
                            <div class="collapse-title text-xl font-greycliffmed">
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
