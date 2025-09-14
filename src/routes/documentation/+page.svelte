<script lang="ts">
    // To add future updates, simply add a new object to the top of this array.
    const updateNotes = [
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
        <header class="text-center py-6">
            <h1>PoSolana Suite: A Comprehensive Guide</h1>
        </header>

        <div class="card bg-base-100 shadow-xl border">
            <div class="card-body">
                <h2 class="card-title">1.
Introduction & Philosophy</h2>
                <p>
                    Welcome to the PoSolana Suite, your all-in-one solution for running a modern business on the Solana network.
This guide provides an in-depth walkthrough of every feature, from initial setup to advanced analytics, helping you harness the full power of the platform.
                </p>
                <p>
                    A foundational principle of the suite is <strong>data privacy and user control</strong>.
All your critical business data—including transaction history, inventory lists, and customer information—is stored exclusively in your local browser storage.
This means you are the sole custodian of your information, ensuring maximum privacy and security.
                </p>
            </div>
        </div>

        <div class="card bg-base-100 shadow-xl border mt-8">
            <div class="card-body">
                <h2 class="card-title">2.
Getting Started: A Detailed Tutorial</h2>
                
                <h3>Step 1: Initial Merchant Setup</h3>
                <p>
                    Upon your first visit, you will be greeted by a setup screen.
This is a one-time process to configure your store's identity.
                </p>
                <ul>
                    <li><strong>Store Name:</strong> Enter the name of your business.
This name will be displayed prominently on your dashboard, invoices, and the customer-facing payment screen.</li>
                    <li><strong>Merchant Wallet Address:</strong> This is the most crucial piece of information.
Enter the public key of the Solana wallet where you wish to receive all customer payments.
The application will automatically validate the address to ensure it is a valid Solana public key before proceeding.</li>
                </ul>
                <p>
                    Once you click "Enter Suite," this information is saved, and you will be taken to your main dashboard.
                </p>

                <h3>Step 2: Adding Your First Product</h3>
                <p>
                    Before you can make a sale, you need something to sell.
Navigate to the <strong>Inventory Management</strong> page and use the "Add New Item" form to define your product.
You can add a name, SKU, barcode, quantity, cost, and price.
                </p>

                <h3>Step 3: Processing Your First Transaction</h3>
                <p>
                    Navigate to the <strong>Point of Sale (POS)</strong> page.
You can either build a cart by adding items from your inventory or enter a custom amount using the keypad.
Clicking "Create QR Code" generates a unique Solana Pay QR code for the customer to scan.
Upon successful payment, your inventory is automatically updated, and the transaction is logged.
                </p>
            </div>
        </div>

        <div class="card bg-base-100 shadow-xl border mt-8">
            <div class="card-body">
                <h2 class="card-title">3.
In-Depth Feature Guide</h2>

                <h3>The Dashboard</h3>
                <p>
                    Your central hub, featuring navigation cards and a customizable widget area.
Use the "Edit Widgets" button to toggle the visibility of various data modules, including key metrics, recent transactions, sales charts, live token prices, and operational alerts.
                </p>

                <h3>Inventory Management</h3>
                <p>
                    A comprehensive system organized into three tabs: Inventory, Categories, and Reports.
You can manage products with SKUs and printable barcodes, organize them with categories, and view a detailed history log for every stock change.
The reports tab offers deep insights with Inventory Valuation, Sales Velocity, and Dead Stock analysis.
                </p>

                <h3>Invoicing</h3>
                <p>
                    Create, manage, and track professional invoices for your clients.
Add items from inventory or custom line items, apply taxes, and generate a specific Solana Pay QR code for direct payment.
The system automatically checks for on-chain payment confirmation and updates the invoice status accordingly. You can also download invoices as PDFs.
                </p>

                <h3>Analytics</h3>
                <p>
                    Get a clear overview of your business performance.
All financial data is converted to its real-time USD value using live price feeds for accuracy.
View total revenue, transaction counts, and charts for sales by token and sales over time.
The analytics page now includes profitability metrics, top-selling products, and sales by category. You can also export your sales data to a CSV file.
                </p>

                <h3>Settings & Customization</h3>
                <p>
                    Tailor the suite to your brand.
Here you can change the visual theme, upload your logo, manage your data with import/export tools, and reset the store if needed.
The data import/export feature now includes all application data, ensuring a complete backup of your store.
                </p>
            </div>
        </div>

        <div class="card bg-base-100 shadow-xl border mt-8">
            <div class="card-body">
                <h2 class="card-title">4.
Update Notes</h2>
                {#each updateNotes as update}
                    <div class="collapse collapse-arrow bg-base-200 mb-2">
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
        </div>

    </div>
</div>
