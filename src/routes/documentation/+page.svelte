<script lang="ts">
    // To add future updates, simply add a new object to the top of this array.
    const updateNotes = [
        {
            version: 'v1.14',
            date: 'October 2025',
            title: 'Credit Card Payments & Advanced Inventory',
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
        {
            version: 'v1.10',
            date: 'September 2025',
            title: 'UI Overhaul & Advanced CRM',
            notes: [
                'Redesigned the Point of Sale page for a more intuitive, no-scroll experience on both desktop and mobile.',
                'Enhanced the CRM with customer tagging, communication logs, and customer groups for advanced segmentation.',
                'Added CSV import and export functionality for customer data.',
                'Improved the mobile responsiveness of the Analytics and Inventory pages.'
            ]
        },
        {
            version: 'v1.9',
            date: 'September 2025',
            title: 'Professional Receipt Printing',
            notes: [
                'Added the ability to print professional, well-formatted receipts for each transaction.',
                'Receipts are optimized for thermal printers and include the store logo, name, and transaction details.',
                'The printing system has been engineered to be reliable, ensuring a clean, single-page print every time.'
            ]
        },
        {
            version: 'v1.8',
            date: 'September 2025',
            title: 'Advanced CRM Suite',
            notes: [
                'Added a new CRM section for comprehensive customer management.',
                'Implemented customer tagging for segmentation and marketing.',
                'Added a communication log to track all customer interactions.',
                'Introduced customer groups for targeted campaigns and promotions.'
            ]
        },
        {
            version: 'v1.7',
            date: 'September 2025',
            title: 'Advanced Analytics & Data Management',
            notes: [
                'Enhanced the Analytics page with profitability metrics (Total Profit, Average Profit Margin).',
                'Added new analytics widgets for top-selling products, sales by category, and sales by day of the week.',
                'Implemented a date range filter and CSV export for sales data.',
                'Updated the data import/export feature to include all application data, such as invoices and inventory history.'
            ]
        },
        {
            version: 'v1.6',
            date: 'September 2025',
            title: 'Advanced Invoicing & On-Chain Payments',
            notes: [
                'Invoices now automatically check for on-chain payment confirmation.',
                'Added the ability to download invoices as PDFs.',
                'Improved the print layout for a cleaner, more professional look.'
            ]
        },
        {
            version: 'v1.5',
            date: 'September 2025',
            title: 'Automatic Inventory Depletion on Sale',
            notes: [
                'Inventory stock levels are now automatically and instantly updated the moment a customer\'s payment is confirmed on the Solana network.',
                'A "Sale" event, including a reference to the transaction ID, is now automatically logged in the history for each item sold, providing a complete audit trail.'
            ]
        },
        {
            version: 'v1.4',
            date: 'September 2025',
            title: 'Advanced Inventory Management Suite',
            notes: [
                'Added optional SKU and Barcode fields for precise product tracking. A new utility allows for generating and printing single or multiple barcode labels for physical products.',
                'Merchants can now create and manage custom categories to better organize their inventory.',
                'A comprehensive history log was added to each item, tracking every stock change with a reason and timestamp.',
                'A "Reports" tab was added to the Inventory page, featuring an Inventory Valuation report, a Sales Velocity report, and a Dead Stock report.'
            ]
        },
        {
            version: 'v1.3',
            date: 'September 2025',
            title: 'Live Price Feeds & Analytics Overhaul',
            notes: [
                'Integrated the CoinGecko API to fetch real-time prices for all supported tokens.',
                'The Analytics page and Dashboard widgets were upgraded to use this live data, ensuring all revenue and sales figures are accurately displayed in their current USD value.',
                'A new "Token Price Charts" widget was added to the dashboard, displaying historical price data for each token with a selectable timeframe.'
            ]
        },
        {
            version: 'v1.2',
            date: 'September 2025',
            title: 'Dashboard Widget System',
            notes: [
                'The main dashboard was enhanced with a system of customizable widgets to provide at-a-glance business insights.',
                'Merchants can now use the "Edit Widgets" button to choose which widgets are visible on their dashboard.'
            ]
        },
        {
            version: 'v1.0',
            date: 'September 2025',
            title: 'Initial Launch',
            notes: [
                'Core functionality including merchant setup, the main dashboard, Point of Sale, a basic inventory system, invoicing, and analytics was launched.'
            ]
        }
    ];
</script>

<div class="container mx-auto px-4 sm:px-6 lg:px-8">
    <div class="prose max-w-none">
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
                            <li><a href="#introduction">Introduction & Philosophy</a></li>
                            <li><a href="#getting-started">Getting Started</a></li>
                            <li><a href="#feature-guide">In-Depth Feature Guide</a></li>
                            <li><a href="#data-security">Data, Security, and Backups</a></li>
                            <li><a href="#faq">FAQ</a></li>
                            <li><a href="#update-notes">Update Notes</a></li>
                        </ul>
                    </div>
                </div>
            </aside>

            <main class="lg:col-span-3 space-y-8">
                <div id="introduction" class="card bg-base-100 shadow-xl border">
                    <div class="card-body">
                        <h2 class="card-title text-2xl font-greycliffmed">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            1. Introduction & Philosophy
                        </h2>
                        <p class="mt-4">
                            Welcome to the <strong>PoSolana Suite</strong>, your all-in-one solution for running a modern business on the Solana network. This platform is a comprehensive toolkit, integrating <strong>Point of Sale (POS)</strong>, <strong>Inventory Management</strong>, <strong>Invoicing</strong>, <strong>Customer Relationship Management (CRM)</strong>, and advanced <strong>Analytics</strong> into a single, cohesive interface. This guide provides an in-depth walkthrough of every feature, from initial setup to advanced data management, helping you harness the full power of decentralized commerce.
                        </p>
                        <p>
                            A foundational principle of the suite is <strong>data privacy and user control</strong>. All your critical business data is stored exclusively in your <strong>local browser storage</strong>. This means no cloud servers, no monthly data fees, and no third-party access to your information. You are the sole custodian of your data, ensuring maximum privacy and security.
                        </p>
                    </div>
                </div>

                <div id="getting-started" class="card bg-base-100 shadow-xl border">
                    <div class="card-body">
                        <h2 class="card-title text-2xl font-greycliffmed">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                            2. Getting Started: A Detailed Tutorial
                        </h2>
                        <p class="mt-4">Follow these simple steps to get your store up and running in minutes.</p>
                        <p class="mt-2">For a hands-on walkthrough, we highly recommend using our new interactive product tour. You can start it from the Dashboard at any time to get a guided look at all the suite's features.</p>
                        
                        <ul class="timeline timeline-vertical mt-6">
                            <li>
                                <div class="timeline-start">Step 1</div>
                                <div class="timeline-middle">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 text-primary"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.06 0l4.25-5.832z" clip-rule="evenodd" /></svg>
                                </div>
                                <div class="timeline-end timeline-box">
                                    <div class="font-bold">Merchant Setup</div>
                                    Upon your first visit, you will be greeted by a setup screen. This one-time process configures your store's identity and payment destination.
                                </div>
                                <hr/>
                            </li>
                            <li>
                                <hr/>
                                <div class="timeline-start">Step 2</div>
                                <div class="timeline-middle">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 text-primary"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.06 0l4.25-5.832z" clip-rule="evenodd" /></svg>
                                </div>
                                <div class="timeline-end timeline-box">
                                    <div class="font-bold">Add a Product</div>
                                    Before you can make a sale, you need to populate your inventory. Navigate to the <strong>Inventory Management</strong> page and use the "Add New Item" form to define your product.
                                </div>
                                <hr/>
                            </li>
                            <li>
                                <hr/>
                                <div class="timeline-start">Step 3</div>
                                <div class="timeline-middle">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 text-primary"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.06 0l4.25-5.832z" clip-rule="evenodd" /></svg>
                                </div>
                                <div class="timeline-end timeline-box">
                                    <div class="font-bold">First Transaction</div>
                                    Navigate to the <strong>Point of Sale (POS)</strong> page. You can create a charge by adding items from your inventory or by entering a custom amount. Clicking "Create QR Code" generates a unique Solana Pay QR code for the customer to scan.
                                </div>
                                <hr/>
                            </li>
                            <li>
                                <hr/>
                                <div class="timeline-start">Step 4</div>
                                <div class="timeline-middle">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 text-primary"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.06 0l4.25-5.832z" clip-rule="evenodd" /></svg>
                                </div>
                                <div class="timeline-end timeline-box">
                                    <div class="font-bold">Explore</div>
                                    After your first sale, return to the <strong>Dashboard</strong>. You'll see your new transaction reflected in the "Key Metrics," "Recent Transactions," and other widgets. This central hub is where you can get a quick, at-a-glance overview of your business's performance.
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>

                <div id="feature-guide" class="card bg-base-100 shadow-xl border">
                    <div class="card-body">
                        <h2 class="card-title text-2xl font-greycliffmed">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                            3. In-Depth Feature Guide
                        </h2>
                        <p class="mt-4">Dive deep into the core components of the PoSolana Suite.</p>
                        <div class="space-y-2 mt-4">
                            <div class="collapse collapse-arrow bg-base-200">
                                <input type="checkbox" /> 
                                <div class="collapse-title text-xl font-medium">
                                    <strong>The Dashboard:</strong> Your Business at a Glance
                                </div>
                                <div class="collapse-content"> 
                                    <p>The <strong>Dashboard</strong> is the central hub of the PoSolana Suite, designed to give you a real-time, high-level overview of your business's health and performance. It is composed of a series of customizable widgets, each providing a unique insight into your operations. You can use the <strong>"Edit Widgets"</strong> button to choose which data modules are most important to you, allowing you to tailor the dashboard to your specific needs. This flexibility ensures that you see the information that matters most to you, right when you log in.</p>
                                </div>
                            </div>

                            <div class="collapse collapse-arrow bg-base-200">
                                <input type="checkbox" /> 
                                <div class="collapse-title text-xl font-medium">
                                    <strong>Point of Sale (POS):</strong> The Heart of Your Operations
                                </div>
                                <div class="collapse-content"> 
                                    <p>Our <strong>POS</strong> is engineered for speed, flexibility, and ease of use in any retail environment. You can create charges in two primary ways: either by adding pre-defined products from your inventory to build a customer's cart, or by entering a custom amount on the built-in keypad for services or miscellaneous items. The system supports multiple cryptocurrencies, and once a transaction is initiated, a Solana Pay QR code is generated for the customer to scan. The transaction status updates in real-time as soon as the payment is confirmed on the Solana network, ensuring a smooth and efficient checkout process for both you and your customers.</p>
                                </div>
                            </div>
                         
                            <div class="collapse collapse-arrow bg-base-200">
                                <input type="checkbox" /> 
                                <div class="collapse-title text-xl font-medium">
                                    <strong>Receipts and Printing:</strong> Professional and Reliable
                                </div>
                                <div class="collapse-content"> 
                                    <p>After each transaction, you can provide customers with a clean, professional receipt. From the <strong>Transaction History</strong> page, simply click the "Print" button next to any sale. This will generate a receipt that is optimized for standard thermal receipt printers, ensuring a perfect, single-page print every time. The receipt includes your store's logo and name, a detailed list of items purchased, and the transaction ID for the customer's records.</p>
                                </div>
                            </div>

                            <div class="collapse collapse-arrow bg-base-200">
                                <input type="checkbox" /> 
                                <div class="collapse-title text-xl font-medium">
                                    <strong>Inventory Management:</strong> Your Digital Stockroom
                                </div>
                                <div class="collapse-content"> 
                                    <p>A comprehensive inventory system is crucial for any retail business, and ours is organized into three main tabs to provide full control over your stock:</p>
                                    <ul>
                                        <li><strong>Inventory:</strong> Here you can add, edit, and remove products. Each item can be assigned a name, SKU, barcode, quantity, cost, price, and category. This allows for precise tracking and management of your stock, giving you a clear view of your inventory at all times.</li>
                                        <li><strong>Categories:</strong> Organize your products into custom categories to streamline your inventory and gain better insights into your sales data. This helps you understand which product lines are performing best and where you might need to make adjustments.</li>
                                        <li><strong>Reports:</strong> This tab offers powerful analytical tools, including an <strong>Inventory Valuation</strong> report to see the total value of your stock, a <strong>Sales Velocity</strong> report to identify your best-selling items, and a <strong>Dead Stock</strong> report to highlight products that aren't moving, helping you make informed decisions about your inventory.</li>
                                    </ul>
                                </div>
                            </div>

                            <div class="collapse collapse-arrow bg-base-200">
                                <input type="checkbox" /> 
                                <div class="collapse-title text-xl font-medium">
                                    <strong>CRM (Customer Relationship Management):</strong> Build Stronger Relationships
                                </div>
                                <div class="collapse-content"> 
                                    <p>Our <strong>CRM</strong> is a powerful suite of tools designed to help you build and maintain strong relationships with your customers. You can create and manage detailed customer profiles, including contact information, private notes, and a full transaction history. The CRM is seamlessly integrated with the invoicing module and features <strong>customer tagging</strong> for easy segmentation, a <strong>communication log</strong> to track all your interactions, and <strong>custom groups</strong> for targeted marketing campaigns, giving you all the tools you need to provide personalized and effective customer service.</p>
                                </div>
                            </div>

                            <div class="collapse collapse-arrow bg-base-200">
                                <input type="checkbox" /> 
                                <div class="collapse-title text-xl font-medium">
                                    <strong>Invoicing:</strong> Professional and Seamless Billing
                                </div>
                                <div class="collapse-content"> 
                                    <p>Create, manage, and track professional invoices for your clients with our streamlined invoicing module. You can either select an existing customer from your CRM or add a new one on the fly. Invoices can be populated with items from your inventory or with custom line items, and you can apply taxes as needed. Each invoice generates a unique <strong>Solana Pay QR code</strong> for direct payment, simplifying the billing process. The system automatically checks for on-chain payment confirmation and updates the invoice status accordingly. For your records, you can also download invoices as PDFs to send to your clients or for your own bookkeeping.</p>
                                </div>
                            </div>

                            <div class="collapse collapse-arrow bg-base-200">
                                <input type="checkbox" /> 
                                <div class="collapse-title text-xl font-medium">
                                    <strong>Analytics:</strong> Data-Driven Decisions
                                </div>
                                <div class="collapse-content"> 
                                    <p>The <strong>Analytics</strong> page gives you a clear and comprehensive overview of your business's performance. All financial data is converted to its real-time USD value using live price feeds for accuracy. You can view total revenue, transaction counts, and charts for sales by token and sales over time. The analytics page also includes profitability metrics, a list of your top-selling products, and a breakdown of sales by category. For more in-depth analysis, you can filter your data by date range and export it to a CSV file, giving you the power to make informed, data-driven decisions.</p>
                                </div>
                            </div>

                            <div class="collapse collapse-arrow bg-base-200">
                                <input type="checkbox" /> 
                                <div class="collapse-title text-xl font-medium">
                                    <strong>Settings & Customization:</strong> Make It Your Own
                                </div>
                                <div class="collapse-content"> 
                                    <p>Tailor the suite to your brand and workflow in the <strong>Settings</strong> section. Here you can change the visual theme to match your brand, upload your company logo for a professional touch, and manage your data with our import/export tools. The data import/export feature is designed to include all application data, ensuring a complete backup of your store can be made at any time. And if you ever need to start fresh, you can reset the store to its default state with a single click.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div id="data-security" class="card bg-base-100 shadow-xl border">
                    <div class="card-body">
                        <h2 class="card-title text-2xl font-greycliffmed">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 20.944a11.955 11.955 0 018.618-3.04 11.955 11.955 0 018.618 3.04 12.02 12.02 0 00-3-8.984z" /></svg>
                            4. Data, Security, and Backups
                        </h2>
                        <div class="alert alert-warning shadow-lg mt-4">
                            <div>
                                <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                <span><strong>Important:</strong> Your data is stored locally in your browser. It is crucial to export your data regularly to prevent loss.</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div id="faq" class="card bg-base-100 shadow-xl border">
                    <div class="card-body">
                        <h2 class="card-title text-2xl font-greycliffmed">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.79 4 4s-1.79 4-4 4-4-1.79-4-4a4.02 4.02 0 011.55-3.232z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 12v3m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            5. Frequently Asked Questions (FAQ)
                        </h2>
                        <div class="space-y-2 mt-4">
                            <div class="collapse collapse-arrow bg-base-200">
                                <input type="checkbox" /> 
                                <div class="collapse-title text-lg font-medium">
                                    Where is my data stored?
                                </div>
                                <div class="collapse-content"> 
                                    <p>Your data is stored exclusively in your web browser's local storage. It is not sent to any external servers, ensuring you have complete control and privacy over your information.</p>
                                </div>
                            </div>

                            <div class="collapse collapse-arrow bg-base-200">
                                <input type="checkbox" /> 
                                <div class="collapse-title text-lg font-medium">
                                    What happens if I clear my browser cache?
                                </div>
                                <div class="collapse-content"> 
                                    <p>Clearing your browser's cache or site data will permanently delete all your store's information. It is crucial to export your data regularly using the "Export Data" feature in the settings to prevent data loss.</p>
                                </div>
                            </div>

                            <div class="collapse collapse-arrow bg-base-200">
                                <input type="checkbox" /> 
                                <div class="collapse-title text-lg font-medium">
                                    Is this a custodial service?
                                </div>
                                <div class="collapse-content"> 
                                    <p>No. The PoSolana Suite is completely non-custodial. We never have access to your private keys or your funds. All payments go directly from your customer's wallet to the merchant wallet you configure during setup.</p>
                                </div>
                            </div>

                            <div class="collapse collapse-arrow bg-base-200">
                                <input type="checkbox" /> 
                                <div class="collapse-title text-lg font-medium">
                                    What wallets are compatible?
                                </div>
                                <div class="collapse-content"> 
                                    <p>Any Solana wallet that supports the Solana Pay protocol can be used by customers to make payments. This includes popular wallets like Phantom, Solflare, and others.</p>
                                </div>
                            </div>

                            <div class="collapse collapse-arrow bg-base-200">
                                <input type="checkbox" /> 
                                <div class="collapse-title text-lg font-medium">
                                    Can I use this on multiple devices?
                                </div>
                                <div class="collapse-content"> 
                                    <p>Yes, but you will need to use the "Export Data" and "Import Data" features to transfer your store's data between devices. Since all data is stored locally in the browser, it is not automatically synced across different devices.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div id="update-notes" class="card bg-base-100 shadow-xl border">
                    <div class="card-body">
                        <h2 class="card-title text-2xl font-greycliffmed">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            6. Update Notes
                        </h2>
                        <div class="space-y-2 mt-4">
                            {#each updateNotes as update}
                                <div class="collapse collapse-arrow bg-base-200">
                                    <input type="checkbox" /> 
                                    <div class="collapse-title text-lg font-medium">
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
                    </div>
                </div>
            </main>
        </div>
    </div>
</div>
