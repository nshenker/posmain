<script lang="ts">
    // To add future updates, simply add a new object to the top of this array.
    const updateNotes = [
        {
            version: '0.9.3',
            title: 'Advanced Discounts and Global Scanning',
            date: 'Oct 2025',
            notes: [
                'Implemented Global Barcode Scanner (Keyboard Wedge) listener for instant, click-free item addition on the POS.',
                'Added a full Coupon and Discount management system, allowing creation of fixed ($) or percentage (%) discounts applied to the cart subtotal.',
                'Discounts are applied pre-tax for correct calculation.',
                'Loyalty Point redemption is now disabled if a cart discount is active to prevent complex stacking.',
                'Fixed minor UI issues in the Manage Coupons section.'
            ]
        },
        {
            version: '0.9.2',
            title: 'Loyalty & Employee Management',
            date: 'Sep 2025',
            notes: [
                'Added a full Loyalty Points system (1 pt per $1 USD spent) integrated into CRM and POS.',
                'Implemented Loyalty Redemption feature for discounts at checkout.',
                'Introduced Time Clock for employee shift tracking and payroll reports.',
                'Added employee roles (Manager/Employee) for access control.'
            ]
        },
        {
            version: '0.9.1',
            title: 'Stripe, Invoicing, and Inventory V2',
            date: 'Aug 2025',
            notes: [
                'Integrated Stripe for Credit/Debit card payments on the POS.',
                'Added comprehensive Invoicing module with Solana Pay QR codes.',
                'Upgraded Inventory to support Variable Products (variants, separate SKUs/stock for size/color, etc.).',
                'Added Inventory Locations management.'
            ]
        },
        {
            version: '0.9.0',
            title: 'Initial Launch',
            date: 'Jul 2025',
            notes: [
                'Launched core Point of Sale (POS) and CRM functionality.',
                'Implemented local storage for non-custodial, private data management.',
                'Added multi-token support (SOL, USDC, BONK) via real-time CoinGecko pricing.',
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
                            <li><a href="#whitepaper">PoSolana Whitepaper</a></li>
                            <li><a href="#getting-started">Getting Started</a></li>
                            <li><a href="#feature-guide">In-Depth Feature Guide</a></li>
                            <li><a href="#data-security">Data, Security, and Backups</a></li>
                            <li><a href="#faq">FAQ</a></li>
                            <li><a href="#update-notes">Update Notes ({updateNotes.length})</a></li>
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
                            Welcome to the <strong>PoSolana Suite</strong>, your all-in-one solution for running a modern business on the Solana network.
                            This platform is a comprehensive toolkit, integrating <strong>Point of Sale (POS)</strong>, <strong>Inventory Management</strong>, <strong>Invoicing</strong>, <strong>Customer Relationship Management (CRM)</strong>, and advanced <strong>Analytics</strong> into a single, cohesive interface.
                            This guide provides an in-depth walkthrough of every feature, from initial setup to advanced data management, helping you harness the full power of decentralized commerce.
                        </p>
                        <p>
                            A foundational principle of the suite is <strong>data privacy and user control</strong>.
                            All your critical business data is stored exclusively in your <strong>local browser storage</strong>.
                            This means no cloud servers, no monthly data fees, and no third-party access to your information.
                            You are the sole custodian of your data, ensuring maximum privacy and security.
                        </p>
                    </div>
                </div>
                
                <div id="whitepaper" class="card bg-base-100 shadow-xl border">
                    <div class="card-body">
                        <h2 class="card-title text-2xl font-greycliffmed">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            2. PoSolana Whitepaper: A Non-Custodial POS Model
                        </h2>
                        <h3 class="text-xl font-bold mt-4">2.1 Abstract: Absolute Merchant Sovereignty</h3>
                        <p>
                            PoSolana is a decentralized, non-custodial Point-of-Sale (POS) suite designed for the Solana ecosystem. Our core philosophy is **Absolute Merchant Sovereignty**, achieved through two key design choices: zero-custody payments via Solana Pay and localized data storage. This model eliminates centralized risk, subscription fees, and reliance on third-party data infrastructure.
                        </p>
                        
                        <h3 class="text-xl font-bold mt-4">2.2 Decentralized Payment Rail (Solana Pay)</h3>
                        <p>
                            All crypto transactions adhere to the Solana Pay standard.
                            This is paramount because payments flow directly from the customer's wallet to the merchant's configured wallet address.
                            PoSolana never takes possession of, custody of, or intermediate control over funds, making the system entirely non-custodial.
                            This eliminates counterparty risk and allows the merchant immediate settlement.
                        </p>

                        <h3 class="text-xl font-bold mt-4">2.3 Data Infrastructure & Fees</h3>
                        <p>
                            All business intelligence data—including Inventory, CRM profiles, and historical Transactions—is persisted exclusively in the merchant's local browser storage (localStorage).
                            This results in zero cloud storage costs and prevents external data breaches.
                            The only cost associated with operating the system is the minute Solana transaction fee paid by the customer.
                            Merchants are strongly advised to use the Data Management tools for frequent, external backups.
                        </p>
                    </div>
                </div>
                <div id="getting-started" class="card bg-base-100 shadow-xl border">
                    <div class="card-body">
                        <h2 class="card-title text-2xl font-greycliffmed">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                            3. Getting Started: A Detailed Tutorial
                        </h2>
                        <p class="mt-4">Follow this detailed, step-by-step guide to take your store from zero to fully operational in just a few minutes.
                        </p>
                        
                        <ul class="timeline timeline-vertical mt-6">
                            <li>
                                <div class="timeline-start">Step 1</div>
                                <div class="timeline-middle">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 text-primary"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.06 0l4.25-5.832z" clip-rule="evenodd" /></svg>
                                </div>
                                <div class="timeline-end timeline-box">
                                    <div class="font-bold">Initial Store Setup</div>
                                    The first time you launch the application, you'll be guided through a brief, one-time setup process.
                                    This is where you'll establish the core identity and security of your store.
                                    You will be asked for three key pieces of information:
                                    <ul class="list-disc pl-6 mt-2">
                                        <li><strong>Store Name:</strong> This is the public name of your business (e.g., "Solana Coffee"). It will appear on receipts and invoices.</li>
                                        <li><strong>Wallet Address:</strong> This is the public Solana wallet address where all customer payments will be sent. Double-check this for accuracy!</li>
                                        <li><strong>Admin PIN:</strong> This is a 4-digit PIN that you will create. It grants access to all manager-level features, including settings, analytics, and employee management. Keep this PIN secure.</li>
                                    </ul>
                                </div>
                                <hr/>
                            </li>
                            <li>
                                <hr/>
                                <div class="timeline-start">Step 2</div>
                                <div class="timeline-middle">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" 
                                    fill="currentColor" class="w-5 h-5 text-primary"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.06 0l4.25-5.832z" clip-rule="evenodd" 
                                    /></svg>
                                </div>
                                <div class="timeline-end timeline-box">
                                    <div class="font-bold">Add Your First Product</div>
                                    You can't make a sale without something to sell!
                                    Navigate to the <strong>Inventory</strong> page using the main navigation bar. Here, you'll find the tools to manage your entire catalog.
                                    Click "Add New Item" to open the product creation modal. You can define its name, price, cost, and stock quantity.
                                    For items with options like size or color, you can use the "Variable Product" type to create different versions, each with its own price and stock level.
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
                                    <div class="font-bold">Process Your First Transaction</div>
                                    With a product in your inventory, it's time to make a sale.
                                    Go to the <strong>Point of Sale (POS)</strong> page. Use the "Add Item" button to select the product you just created, or use the keypad to enter a custom sale amount.
                                    Once the charge is ready, you have two options:
                                    <ul class="list-disc pl-6 mt-2">
                                        <li><strong>Pay with Crypto:</strong> This generates a unique Solana Pay QR code. Your customer scans this with their wallet app to complete the payment.</li>
                                        <li><strong>Pay with Card:</strong> If you've configured Stripe in the settings, you can accept traditional credit and debit card payments.</li>
                                    </ul>
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
                                    <div class="font-bold">Review Your Dashboard</div>
                                    After your first sale, navigate back to the <strong>Dashboard</strong>.
                                    This is your business's command center. You will see your new transaction instantly reflected in the "Key Metrics" and "Recent Transactions" widgets.
                                    All financial figures are converted to their current USD value in real-time, giving you an accurate, at-a-glance overview of your performance.
                                </div>
                                <hr/>
                            </li>
                            <li>
                                <hr/>
                                <div class="timeline-start">Step 5</div>
                                <div class="timeline-middle">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 text-primary"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.06 0l4.25-5.832z" clip-rule="evenodd" /></svg>
                                </div>
                                <div class="timeline-end timeline-box">
                                    <div class="font-bold">Explore and Configure</div>
                                    Congratulations, your store is operational!
                                    Now is a great time to explore the other sections.
                                    Go to the <strong>Settings</strong> page to add your business logo and address for receipts.
                                    If you have a team, you can add them in the "Manage Employees" section.
                                    Finally, check out the new <strong>Time Clock</strong> page to see how your staff can manage their shifts.
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>

                <div id="feature-guide" class="card bg-base-100 shadow-xl border">
                    <div class="card-body">
                        <h2 class="card-title text-2xl font-greycliffmed">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                            4. In-Depth Feature Guide
                        </h2>
                        <p class="mt-4">Dive deep into the core components of the PoSolana Suite.</p>
                        <div class="space-y-2 mt-4">
                            
                            <div class="collapse collapse-arrow bg-base-200">
                                <input type="checkbox" /> 
                                <div class="collapse-title text-xl font-medium">
                                    <strong>Global Barcode Scanning:</strong> Checkout Instantly
                                </div>
                                <div class="collapse-content"> 
                                    <p>
                                        The Point of Sale now supports true "keyboard wedge" barcode scanners. This means any USB or Bluetooth scanner acts as a simple keyboard to input product codes. 
                                        Critically, the system actively listens for rapid input ending in `Enter` from **any screen view on the POS**, eliminating the need to click into the search field. This is the fastest way to ring up sales.
                                    </p>
                                </div>
                            </div>
                            
                            <div class="collapse collapse-arrow bg-base-200">
                                <input type="checkbox" /> 
                                <div class="collapse-title text-xl font-medium">
                                    <strong>Advanced Discounts:</strong> Run Sales & Campaigns
                                </div>
                                <div class="collapse-content"> 
                                    <p>
                                        The Discounts module (accessible via Settings) provides two layers of savings flexibility:
                                    </p>
                                    <ul class="list-disc pl-6 mt-2">
                                        <li><strong>Coupons:</strong> Create static codes (e.g., "HOLIDAY25") for a fixed dollar amount or percentage off the cart subtotal.</li>
                                        <li><strong>Manual Discounts:</strong> Apply a one-time fixed or percentage discount manually at the POS screen.</li>
                                    </ul>
                                    <p class="text-sm italic mt-2">
                                        **Note on Calculation:** All discounts are applied to the subtotal *before* tax, ensuring accurate sales tax reporting. Loyalty point redemption is automatically disabled if an Order Discount is applied to the cart.
                                    </p>
                                </div>
                            </div>
                            
                            <div class="collapse collapse-arrow bg-base-200">
                                <input type="checkbox" /> 
                                <div class="collapse-title text-xl font-medium">
                                    <strong>User & Role Management:</strong> Secure Your Operations
                                </div>
                                <div class="collapse-content"> 
                                    <p>The PoSolana Suite now includes a robust user management system.
                                        As an administrator, you can create accounts for your staff with two distinct roles: <strong>Manager</strong> and <strong>Employee</strong>.
                                        Each user has a unique, secure PIN for logging in. Managers have full access to all features, including settings and analytics, while Employees have a focused view, limited to the Point of Sale and the new Time Clock, ensuring your sensitive business data remains protected.
                                    </p>
                                </div>
                            </div>
                            
                            <div class="collapse collapse-arrow bg-base-200">
                                <input type="checkbox" /> 
                                <div class="collapse-title text-xl font-medium">
                                    <strong>Employee Time Clock:</strong> Track Hours with Ease
                                </div>
                                <div class="collapse-content"> 
                                    <p>Our new <strong>Time Clock</strong> is a simple yet powerful tool for managing your team's hours.
                                        Accessible to all logged-in users, it provides a clean, mobile-friendly interface where employees can use their PIN to <strong>Clock In</strong>, <strong>Start/End Breaks</strong>, <strong>Start/End Lunch</strong>, and <strong>Clock Out</strong>.
                                        Every action is timestamped and recorded, providing an accurate log for payroll and performance tracking.
                                    </p>
                                </div>
                            </div>
                            
                            <div class="collapse collapse-arrow bg-base-200">
                                <input type="checkbox" /> 
                                <div class="collapse-title text-xl font-medium">
                                    <strong>Credit Card & Hybrid Payments:</strong> Bridge Web2 and Web3
                                </div>
                                <div class="collapse-content"> 
                                    <p>The PoSolana Suite now allows you to serve all your customers, regardless of how they prefer to pay.
                                        By integrating with <strong>Stripe</strong>, you can now accept credit and debit card payments alongside your existing crypto options.
                                        To enable this, simply add your secure Stripe API keys in the settings.
                                        When you create a charge, you'll see a "Pay with Card" button.
                                        The system will automatically convert any crypto amount to its current USD value for the card transaction, providing a seamless experience for you and your customer.
                                    </p>
                                </div>
                            </div>
                            
                            <div class="collapse collapse-arrow bg-base-200">
                                <input type="checkbox" /> 
                                <div class="collapse-title text-xl font-medium">
                                    <strong>Point of Sale (POS):</strong> The Heart of Your Operations
                                </div>
                                <div class="collapse-content"> 
                                    <p>Our <strong>POS</strong> is engineered for speed, flexibility, and ease of use in any retail environment.
                                        You can create charges by adding pre-defined products from your inventory, or by entering a custom amount on the built-in keypad.
                                        The system supports multiple cryptocurrencies and now, with Stripe, traditional card payments.
                                        For crypto, a Solana Pay QR code is generated for the customer to scan, and the transaction status updates in real-time as soon as the payment is confirmed on the Solana network.
                                    </p>
                                </div>
                            </div>
                            
                            <div class="collapse collapse-arrow bg-base-200">
                                <input type="checkbox" /> 
                                <div class="collapse-title text-xl font-medium">
                                    <strong>Inventory Management:</strong> Your Digital Stockroom
                                </div>
                                <div class="collapse-content"> 
                                    <p>Our comprehensive inventory system is designed to provide full control over your stock.
                                        It now supports both **Simple Products** (with a single stock count) and **Variable Products** for items with multiple options like size or color.
                                        Each variant can have its own SKU, price, cost, and barcode, and its stock is tracked individually, giving you a precise and granular view of your inventory at all times.
                                    </p>
                                </div>
                            </div>
                            
                            <div class="collapse collapse-arrow bg-base-200">
                                <input type="checkbox" /> 
                                <div class="collapse-title text-xl font-medium">
                                    <strong>CRM (Customer Relationship Management):</strong> Build Stronger Relationships
                                </div>
                                <div class="collapse-content"> 
                                    <p>Our <strong>CRM</strong> is a powerful suite of tools designed to help you build and maintain strong relationships with your customers.
                                        It automatically tracks each customer's full purchase history, including the specific product variants they bought.
                                        The CRM also features <strong>customer tagging</strong> for easy segmentation and a <strong>communication log</strong> to track all your interactions.
                                    </p>
                                </div>
                            </div>
                            
                            <div class="collapse collapse-arrow bg-base-200">
                                <input type="checkbox" /> 
                                <div class="collapse-title text-xl font-medium">
                                    <strong>Invoicing:</strong> Professional and Seamless Billing
                                </div>
                                <div class="collapse-content"> 
                                    <p>Create, manage, and track professional invoices for your clients.
                                        You can either select an existing customer from your CRM or add a new one on the fly.
                                        Invoices can be populated with items from your inventory—including specific product variants—or with custom line items.
                                        Each invoice generates a unique <strong>Solana Pay QR code</strong> for direct payment, and the system automatically checks for on-chain payment confirmation.
                                    </p>
                                </div>
                            </div>

                            <div class="collapse collapse-arrow bg-base-200">
                                <input type="checkbox" /> 
                                <div class="collapse-title text-xl font-medium">
                                    <strong>Analytics:</strong> Data-Driven Decisions
                                </div>
                                <div class="collapse-content"> 
                                    <p>The <strong>Analytics</strong> page gives you a clear and comprehensive overview of your business's performance.
                                        All financial data is converted to its real-time USD value for accuracy.
                                        You can view sales by payment method (including "USD" for card payments), and because we track costs for each product variant, your profitability metrics are always precise.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div id="data-security" class="card bg-base-100 shadow-xl border">
                    <div class="card-body">
                        <h2 class="card-title text-2xl font-greycliffmed">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 
                                12.02 0 003 20.944a11.955 11.955 0 018.618-3.04 11.955 11.955 0 018.618 3.04 12.02 12.02 0 
                                00-3-8.984z" /></svg>
                            5. Data, Security, and Backups
                        </h2>
                        <div class="alert alert-warning shadow-lg mt-4">
                            <div>
                                <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                <span><strong>Important:</strong> Your data is stored locally 
                                in your browser. It is crucial to export your data regularly to prevent loss.
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div id="faq" class="card bg-base-100 shadow-xl border">
                    <div class="card-body">
                        <h2 class="card-title text-2xl font-greycliffmed">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" 
                                fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.79 4 4s-1.79 4-4 4-4-1.79-4-4a4.02 4.02 0 011.55-3.232z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 12v3m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            6. Frequently Asked Questions (FAQ)
                        </h2>
   
                        <div class="space-y-2 mt-4">
                            <div class="collapse collapse-arrow bg-base-200">
                                <input type="checkbox" /> 
                                <div class="collapse-title text-lg font-medium">
                                    Where is my data stored?
                                </div>
                                <div class="collapse-content"> 
                                    <p>Your data is stored exclusively in your web browser's local storage.
                                        It is not sent to any external servers, ensuring you have complete control and privacy over your information.
                                    </p>
                                </div>
                            </div>

                            <div class="collapse collapse-arrow bg-base-200">
                                <input type="checkbox" /> 
                                <div class="collapse-title 
                                text-lg font-medium">
                                    What happens if I clear my browser cache?
                                </div>
                                <div class="collapse-content"> 
                                    <p>Clearing your browser's cache or site data will permanently delete all your store's information.
                                        It is crucial to export your data regularly using the "Export Data" feature in the settings to prevent data loss.
                                    </p>
                                </div>
                            </div>

                            <div class="collapse collapse-arrow bg-base-200">
                                <input type="checkbox" /> 
                                <div class="collapse-title 
                                text-lg font-medium">
                                    Is this a custodial service?
                                </div>
                                <div class="collapse-content"> 
                                    <p>No.
                                        The PoSolana Suite is completely non-custodial. We never have access to your private keys or your funds.
                                        All payments go directly from your customer's wallet to the merchant wallet you configure during setup.
                                    </p>
                                </div>
                            </div>

                            <div class="collapse collapse-arrow bg-base-200">
                                <input type="checkbox" /> 
                                <div class="collapse-title 
                                text-lg font-medium">
                                    What wallets are compatible?
                                </div>
                                <div class="collapse-content"> 
                                    <p>Any Solana wallet that supports the Solana Pay protocol can be used by customers to make payments.
                                        This includes popular wallets like Phantom, Solflare, and others.
                                    </p>
                                </div>
                            </div>

                            <div class="collapse collapse-arrow bg-base-200">
                                <input type="checkbox" /> 
                                <div class="collapse-title text-lg font-medium">
                                    Can I use this on multiple devices?
                                </div>
                                <div class="collapse-content"> 
                                    <p>Yes, but you will need to use the "Export Data" and "Import Data" features to transfer your store's data between devices.
                                        Since all data is stored locally in the browser, it is not automatically synced across different devices.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div id="update-notes" class="card bg-base-100 shadow-xl border">
                    <div class="card-body">
                        <h2 class="card-title text-2xl font-greycliffmed">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            7. Update Notes
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
