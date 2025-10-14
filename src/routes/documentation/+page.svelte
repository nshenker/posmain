<script lang="ts">
    // To add future updates, simply add a new object to the top of this array.
    const updateNotes = [
        {
            version: 'v1.16',
            date: 'October 2025',
            title: 'User Roles & Time Clock',
            notes: [
                'New Feature: Implemented a complete User and Role Management system. Store owners can now create accounts for employees and managers with different permission levels.',
                'New Feature: Added a secure PIN-based login system for all users.',
                'New Feature: Introduced an Employee Time Clock page where staff can clock in, clock out, and manage breaks using their PIN.',
                'Enhancement: The initial store setup now includes creating a custom, secure Admin PIN.',
                'Enhancement: The navigation bar and settings pages are now role-aware, restricting access to sensitive areas like Analytics and employee management to manager-level users.',
                'Enhancement: The data backup and restore system has been updated to include all new employee and time clock event data, ensuring a complete backup solution.'
            ]
        },
        {
            version: 'v1.15',
            date: 'October 2025',
            title: 'Inventory Overhaul & Financial Flexibility',
            notes: [
                'New Feature: Added a complete Inventory Location Management system. Merchants can now create custom locations (e.g., shelves, bins, rooms) and assign items to them for precise physical tracking.',
                'New Feature: A "Charge 3% Credit Card Fee" toggle was added to the settings, allowing merchants to choose whether to pass Stripe processing fees on to the customer or absorb the cost themselves.',
                'Enhancement: The Inventory page has been completely redesigned for a cleaner, more intuitive user experience.',
                'Enhancement: Adding and editing inventory items now takes place in a dedicated, streamlined modal for a more focused workflow.',
                'Enhancement: The data export/import functionality has been updated to include the new inventory locations data, ensuring a complete and seamless backup solution.'
            ]
        },
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
                                    Upon your first visit, you will be greeted by a setup screen. This one-time process configures your store's identity, payment destination, and your secure Admin PIN.
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
                                    <strong>User & Role Management:</strong> Secure Your Operations
                                </div>
                                <div class="collapse-content"> 
                                    <p>The PoSolana Suite now includes a robust user management system. As an administrator, you can create accounts for your staff with two distinct roles: <strong>Manager</strong> and <strong>Employee</strong>. Each user has a unique, secure PIN for logging in. Managers have full access to all features, including settings and analytics, while Employees have a focused view, limited to the Point of Sale and the new Time Clock, ensuring your sensitive business data remains protected.</p>
                                </div>
                            </div>
                            
                            <div class="collapse collapse-arrow bg-base-200">
                                <input type="checkbox" /> 
                                <div class="collapse-title text-xl font-medium">
                                    <strong>Employee Time Clock:</strong> Track Hours with Ease
                                </div>
                                <div class="collapse-content"> 
                                    <p>Our new <strong>Time Clock</strong> is a simple yet powerful tool for managing your team's hours. Accessible to all logged-in users, it provides a clean, mobile-friendly interface where employees can use their PIN to <strong>Clock In</strong>, <strong>Start/End Breaks</strong>, <strong>Start/End Lunch</strong>, and <strong>Clock Out</strong>. Every action is timestamped and recorded, providing an accurate log for payroll and performance tracking.</p>
                                </div>
                            </div>
                            
                            <div class="collapse collapse-arrow bg-base-200">
                                <input type="checkbox" /> 
                                <div class="collapse-title text-xl font-medium">
                                    <strong>Credit Card & Hybrid Payments:</strong> Bridge Web2 and Web3
                                </div>
                                <div class="collapse-content"> 
                                    <p>The PoSolana Suite now allows you to serve all your customers, regardless of how they prefer to pay. By integrating with <strong>Stripe</strong>, you can now accept credit and debit card payments alongside your existing crypto options. To enable this, simply add your secure Stripe API keys in the settings. When you create a charge, you'll see a "Pay with Card" button. The system will automatically convert any crypto amount to its current USD value for the card transaction, providing a seamless experience for you and your customer.</p>
                                </div>
                            </div>
                            
                            <div class="collapse collapse-arrow bg-base-200">
                                <input type="checkbox" /> 
                                <div class="collapse-title text-xl font-medium">
                                    <strong>Point of Sale (POS):</strong> The Heart of Your Operations
                                </div>
                                <div class="collapse-content"> 
                                    <p>Our <strong>POS</strong> is engineered for speed, flexibility, and ease of use in any retail environment. You can create charges by adding pre-defined products from your inventory, or by entering a custom amount on the built-in keypad. The system supports multiple cryptocurrencies and now, with Stripe, traditional card payments. For crypto, a Solana Pay QR code is generated for the customer to scan, and the transaction status updates in real-time as soon as the payment is confirmed on the Solana network.</p>
                                </div>
                            </div>
                            
                            <div class="collapse collapse-arrow bg-base-200">
                                <input type="checkbox" /> 
                                <div class="collapse-title text-xl font-medium">
                                    <strong>Receipts and Printing:</strong> Professional and Reliable
                                </div>
                                <div class="collapse-content"> 
                                    <p>After each transaction, you can provide customers with a clean, professional receipt. From the <strong>Transaction History</strong> page, simply click the "Print" button. The receipt is optimized for standard thermal printers and now dynamically shows the payment method used—whether it was a Solana wallet or a credit card.</p>
                                </div>
                            </div>

                            <div class="collapse collapse-arrow bg-base-200">
                                <input type="checkbox" /> 
                                <div class="collapse-title text-xl font-medium">
                                    <strong>Inventory Management:</strong> Your Digital Stockroom
                                </div>
                                <div class="collapse-content"> 
                                    <p>Our comprehensive inventory system is designed to provide full control over your stock. It now supports both **Simple Products** (with a single stock count) and **Variable Products** for items with multiple options like size or color. Each variant can have its own SKU, price, cost, and barcode, and its stock is tracked individually, giving you a precise and granular view of your inventory at all times.</p>
                                </div>
                            </div>

                            <div class="collapse collapse-arrow bg-base-200">
                                <input type="checkbox" /> 
                                <div class="collapse-title text-xl font-medium">
                                    <strong>CRM (Customer Relationship Management):</strong> Build Stronger Relationships
                                </div>
                                <div class="collapse-content"> 
                                    <p>Our <strong>CRM</strong> is a powerful suite of tools designed to help you build and maintain strong relationships with your customers. It automatically tracks each customer's full purchase history, including the specific product variants they bought. The CRM also features <strong>customer tagging</strong> for easy segmentation and a <strong>communication log</strong> to track all your interactions.</p>
                                </div>
                            </div>

                            <div class="collapse collapse-arrow bg-base-200">
                                <input type="checkbox" /> 
                                <div class="collapse-title text-xl font-medium">
                                    <strong>Invoicing:</strong> Professional and Seamless Billing
                                </div>
                                <div class="collapse-content"> 
                                    <p>Create, manage, and track professional invoices for your clients. You can either select an existing customer from your CRM or add a new one on the fly. Invoices can be populated with items from your inventory—including specific product variants—or with custom line items. Each invoice generates a unique <strong>Solana Pay QR code</strong> for direct payment, and the system automatically checks for on-chain payment confirmation.</p>
                                </div>
                            </div>

                            <div class="collapse collapse-arrow bg-base-200">
                                <input type="checkbox" /> 
                                <div class="collapse-title text-xl font-medium">
                                    <strong>Analytics:</strong> Data-Driven Decisions
                                </div>
                                <div class="collapse-content"> 
                                    <p>The <strong>Analytics</strong> page gives you a clear and comprehensive overview of your business's performance. All financial data is converted to its real-time USD value for accuracy. You can view sales by payment method (including "USD" for card payments), and because we track costs for each product variant, your profitability metrics are always precise.</p>
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
