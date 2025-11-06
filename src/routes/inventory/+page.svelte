<script lang='ts'>
    import { inventory, mints, publicKey, categories, inventoryHistory, locations } from '../stores.js';
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { browser } from '$app/environment';
    import { showToast } from '../toastStore.js';
    import HistoryModal from './HistoryModal.svelte';
    import Reports from './Reports.svelte';
    import { saveBarcode, saveMultipleBarcodes } from '../../utils/barcode.js';
    import { logHistory } from '../../utils/inventory.js';
    import VariantEditor from './VariantEditor.svelte';
    import ItemDetailsModal from './ItemDetailsModal.svelte';
    import LocationsModal from './LocationsModal.svelte';
    import ManageItemModal from './ManageItemModal.svelte';
    import InventoryItemCard from './InventoryItemCard.svelte';
    import { exportInventoryToCsv, importInventoryFromCsv } from '../../utils/csv.js'; // NEW IMPORT

    let activeTab = 'inventory';
    let showHistoryModal = false;
    let showItemModal = false;
    let showLocationsModal = false;
    let showManageItemModal = false;
    let selectedItemForHistory = null;
    let selectedItemForEdit = null;
    let selectedItemForManage = null;
    let isManagingVariant = false;
    let newCategory = '';
    let selectedItems = [];
    let loading = true;
    let expandedItems = {};
    
    let inventoryViewMode = 'list';
// --- NEW IMPORT STATE ---
    let inventoryImportFile;
// Holds the selected file for import
    let isImporting = false;
// Flag for loading state
    let importError = null;
// Holds import error message
// --- END NEW IMPORT STATE ---

    onMount(() => {
        if (browser && !$publicKey) {
            showToast("Please set your merchant wallet address first.", "error");
            goto('/');
        }
        loading = false;
    });
    $: allSelected = $inventory.length > 0 && selectedItems.length === $inventory.length;
    function toggleSelectAll(e) {
        if (e.target.checked) {
            selectedItems = $inventory.map(i => i.id);
        } else {
            selectedItems = [];
        }
    }

    function handleSaveItem(event) {
        const itemToSave = event.detail;
        if (itemToSave.id) {
            // Update existing item
            $inventory = $inventory.map(item => item.id === itemToSave.id ? itemToSave : item);
        } else {
            // Add new item
            const newId = `gen_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
            let itemToAdd = { ...itemToSave, id: newId };
            if (itemToAdd.type === 'simple') {
                logHistory(newId, 'Item Created', `+${itemToAdd.quantity}`, itemToAdd.quantity);
            } else if (itemToAdd.type === 'variable') {
                itemToAdd.quantity = itemToAdd.variants.reduce((total, v) => total + (v.quantity || 0), 0);
                itemToAdd.variants.forEach(v => {
                    // Ensure variant has an ID for history logging
                    if (!v.id) v.id = `var_${newId}_${Math.random().toString(36).substring(2, 9)}`;
                    if (v.quantity > 0) {
                     
                        logHistory(v.id, 'Variant Created', `+${v.quantity}`, v.quantity);
                    }
                });
            }
            $inventory = [...$inventory, itemToAdd];
        }
        showItemModal = false;
    }

    function openNewItemModal() {
        selectedItemForEdit = null;
        showItemModal = true;
    }

    function openEditItemModal(item) {
        selectedItemForEdit = item;
        showItemModal = true;
    }

    function openManageItemModal(item, isVariant = false) {
        selectedItemForManage = item;
        isManagingVariant = isVariant;
        showManageItemModal = true;
    }

    function removeItem(itemId) {
        if (browser && confirm("Are you sure you want to remove this item? This action is permanent.")) {
             const itemToRemove = $inventory.find(item => item.id === itemId);
             $inventory = $inventory.filter(item => item.id !== itemId);
             selectedItems = selectedItems.filter(id => id !== itemId);
             inventoryHistory.update(history => {
                delete history[itemId];
                // Remove history for variants if it was a variable product
                if (itemToRemove && itemToRemove.type === 'variable' && itemToRemove.variants) {
                    itemToRemove.variants.forEach(v => delete history[v.id]);
 
       
                }
                return history;
            });
        }
    }

    function viewHistory(item) {
        selectedItemForHistory = item;
        showHistoryModal = true;
    }

    function handleSaveSelected() {
        const itemsToSave = $inventory.filter(item => selectedItems.includes(item.id));
        if (itemsToSave.length > 0) {
            saveMultipleBarcodes(itemsToSave);
        } else {
            showToast("Please select items to save.", "error");
        }
    }
    
    // --- NEW HANDLERS FOR IMPORT/EXPORT ---
    
    function handleExportAll() {
        if ($inventory.length === 0) {
            showToast("No inventory items to export.", "error");
            return;
        }
        exportInventoryToCsv($inventory);
    }

    function handleFileSelect(event) {
        inventoryImportFile = event.target.files[0];
        if (inventoryImportFile) {
            importError = null;
        }
    }

    function startInventoryImport() {
        if (!inventoryImportFile) {
            showToast("Please select a CSV file.", "error");
            return;
        }

        isImporting = true;
        importError = null;
        importInventoryFromCsv(inventoryImportFile, (error, importedItems) => {
            isImporting = false;
            if (error) {
                importError = error.message;
                showToast(`Import Failed: ${error.message}`, "error");
                return;
            }
   
          
            // --- Merge Logic ---
            const newInventory = [...$inventory];

            importedItems.forEach(importedItem => {
                const index = newInventory.findIndex(item => item.id === importedItem.id);
                
       
                if (index > -1) {
                    // 1. Update existing item: Overwrite only the properties provided by the CSV
                    // This uses the spread operator to merge the new item data into the existing item, preserving old fields if not overwritten.
              
                    newInventory[index] = { ...newInventory[index], ...importedItem };
                } else {
                    // 2. Add new item
                    newInventory.push(importedItem);
                }
            });

            $inventory = newInventory;
            showToast(`${importedItems.length} items imported/updated successfully!`, "success");
            
            // Clear the file input
            const input = document.getElementById('inventory-csv-input') as HTMLInputElement;
            if (input) input.value = '';
            inventoryImportFile = null;
        });
    }

    // --- END NEW HANDLERS ---

    function addCategory() {
        if (newCategory.trim() && !$categories.includes(newCategory.trim())) {
            $categories = [...$categories, newCategory.trim()];
            newCategory = '';
        }
    }

    function removeCategory(category) {
        if (category === 'Default') {
            showToast("The 'Default' category cannot be removed.", "error");
            return;
        }
        if (browser && confirm(`Are you sure you want to remove the "${category}" category? Items in this category will be moved to 'Default'.`)) {
            $inventory = $inventory.map(item => {
                if (item?.category === category) { // Added safe check
                    return { ...item, category: 'Default' };
    
                }
                return item;
            });
            $categories = $categories.filter(c => c !== category);
        }
    }
</script>

<style>
    .responsive-table td, .responsive-table th {
        padding-top: 0.5rem;
        padding-bottom: 0.5rem;
    }
    .variant-row td {
        background-color: oklch(var(--b2) / 0.5);
    }
</style>

{#if showHistoryModal}
    <HistoryModal item={selectedItemForHistory} on:close={() => showHistoryModal = false} />
{/if}

{#if showItemModal}
    <ItemDetailsModal item={selectedItemForEdit} on:close={() => showItemModal = false} on:save={handleSaveItem} />
{/if}

{#if showManageItemModal}
    <ManageItemModal
        item={selectedItemForManage}
        isVariant={isManagingVariant}
        on:close={() => showManageItemModal = false}
        on:edit={(e) => {
            showManageItemModal = false;
            openEditItemModal(e.detail);
        }}
        on:history={(e) => {
            showManageItemModal = false;
            viewHistory(e.detail);
        }}
        on:remove={(e) => {
            showManageItemModal = false;
            removeItem(e.detail.id);
        }}
    />
{/if}

{#if showLocationsModal}
    <LocationsModal on:close={() => showLocationsModal = false} />
{/if}

<div class="container mx-auto px-4 sm:px-6 lg:px-8">
    <header class="text-center py-6">
        <h1 class="text-4xl font-greycliffbold">Inventory Management</h1>
    </header>

    <div id="inventory-tabs" role="tablist" class="tabs tabs-boxed justify-center mb-6">
        <button role="tab" class="tab" class:tab-active={activeTab === 'inventory'} on:click={() => activeTab = 'inventory'}>Inventory</button>
        <button role="tab" class="tab" class:tab-active={activeTab === 'categories'} on:click={() => activeTab = 'categories'}>Categories</button>
        <button role="tab" class="tab" class:tab-active={activeTab === 'locations'} on:click={() => activeTab = 'locations'}>Locations</button>
        <button role="tab" class="tab" class:tab-active={activeTab === 'reports'} on:click={() => activeTab = 'reports'}>Reports</button>
    </div>
    {#if !loading}
    <div class="mt-6">
        {#if activeTab === 'inventory'}
            <div class="card w-full bg-base-100 shadow-xl border mx-auto">
                <div class="card-body p-4 sm:p-8">
       
           
                    <div class="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
						<h2 class="card-title text-xl font-greycliffmed">Current Inventory</h2>
                        <div class="flex gap-2 flex-wrap">
                             <button class="btn btn-secondary" on:click={handleExportAll}>Export CSV</button>
                    
                            <button class="btn btn-secondary" on:click={() => document.getElementById('inventory-import-form').classList.toggle('hidden')}>Import CSV</button>
                             <div class="join">
                                 <button class="btn btn-sm join-item" class:btn-active={inventoryViewMode === 'list'} on:click={() => inventoryViewMode = 'list'}>
           
                                     <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" /></svg>
                              
                                </button>
                                <button class="btn btn-sm join-item" class:btn-active={inventoryViewMode === 'grid'} on:click={() => inventoryViewMode = 'grid'}>
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm11 0h7v7h-7v-7z" clip-rule="evenodd" /></svg>
   
                                   </button>
                            </div>
                            {#if selectedItems.length > 0}
       
                    
                              <button class="btn btn-secondary" on:click={handleSaveSelected}>Save {selectedItems.length} Barcode(s)</button>
                            {/if}
                 
                            <button class="btn btn-primary" on:click={openNewItemModal}>Add New Item</button>
                        </div>
     
                    </div>
                    
               
                    <div id="inventory-import-form" class="bg-base-200 p-4 rounded-lg mb-4 hidden">
                        <h3 class="font-bold mb-2">Import Inventory from CSV</h3>
                        <div class="alert alert-warning text-sm mb-4">
                            Uploading a CSV will **UPDATE** existing items if they have matching IDs, or **ADD** new items. This is not suitable for complex variant management.
                        </div>
                        
                        {#if importError}
                            <div class="alert alert-error mb-4">{importError}</div>
                    
                        {/if}

                        <div class="grid grid-cols-1 md:grid-cols-[1fr,auto] gap-4">
                            <input type="file" id="inventory-csv-input" accept=".csv" class="file-input file-input-bordered w-full" on:change={handleFileSelect} disabled={isImporting} />
                            <button 
  
                               class="btn btn-primary" 
                                on:click={startInventoryImport} 
                                disabled={!inventoryImportFile || isImporting}
                                class:loading={isImporting}
                            >
                                {isImporting ? 'Processing...' : 'Upload & Merge'}
                            </button>
                        </div>
                    </div>
                    
    
                    
                    {#if inventoryViewMode === 'list'}
                    
                    <div id="inventory-table-container" class="overflow-x-auto">
                   
                        <table class="table w-full">
                                <thead>
								    <tr>
         
                                        <th><input type="checkbox" on:change={toggleSelectAll} checked={allSelected} 
/></th>
									    <th>Item Name</th>
                                        <th>Location</th>
                             
                          
                                <th>Type</th>
									    <th class="text-center">Total Qty</th>
                                        <th class="text-right">Price</th>
          
                             
                                <th class="text-center">Actions</th>
								    </tr>
                    
                                </thead>
             
                   
                             <tbody>
								    {#each $inventory as item (item.id)} <tr class="hover">
               
                                            <td>
            
      
                                        {#if item.type === 'variable'}
                            
                               
                                                <button class="btn btn-xs btn-ghost" on:click={() => expandedItems[item.id] = !expandedItems[item.id]}>
                                          
                                            {expandedItems[item.id] ? '▼' : '►'}
                                                    </button>
                                              
                                            {:else}
      
                                                  
                                            <input type="checkbox" bind:group={selectedItems} value={item.id} />
                                    
                                            {/if}
             
 
                                            </td>
										    <td class="font-greycliffmed">{item.name || 'N/A'}</td>
                                            <td>{ $locations.find(loc => loc.id === item.locationId)?.name || 'N/A' }</td>
                                            <td><span class="badge badge-ghost badge-sm">{item.type || 'N/A'}</span></td>
										    <td class="text-center font-mono">{typeof item.quantity === 'number' ? item.quantity : 'N/A'}</td>
                                            <td class="text-right font-mono">
                                                {#if item.type === 'simple'}
 
                                                    {(item.price || 0).toFixed(2)} {item.currency || ''}
                                                {:else if item.type === 'variable' && item.variants && item.variants.length > 0}
                                          
                                                    From ${(Math.min(...item.variants.map(v => v.price ?? 0)) || 0).toFixed(2)}
                                     
    
                                        {:else}
                                               
              
                                          
                                          0.00 {/if}
                             
                                </td>
    
                                         
                                        
                                <td class="text-center">
                                                <button class="btn btn-xs btn-outline" on:click={() => openManageItemModal(item)}>Manage</button>
             
                             
                                           </td>
									    </tr>
                                        {#if expandedItems[item.id] && item.type === 'variable' && item.variants}
      
                                            {#each item.variants as variant (variant.id)}
                        
                                        <tr class="hover variant-row">
      
                                                    <td></td>
              
  
                                                    <td class="pl-8">{variant.name || 'N/A'}</td>
                                                    <td></td> <td><span class="badge badge-sm">Variant</span></td>
                                             
                                           <td class="text-center font-mono">
                                              
         
                                     
                                           ({typeof variant.quantity === 'number' ? variant.quantity : 'N/A'} in stock)
            
                                        </td>
                            
                                
                                         
                                                    <td class="text-right font-mono">{(variant.price || 0).toFixed(2)}</td>
                                   
 
                                                 <td class="text-center">
                                    
              
                                 
                                           <button class="btn btn-xs btn-outline" on:click={() => openManageItemModal({ ...variant, name: `${item.name || 'Item'} - ${variant.name || 'Variant'}`, parentId: item.id, currency: item.currency, imageURL: item.imageURL }, true)}>Manage</button>
 
                                                    </td>
              
                     
                                          </tr>
         
                                            {/each}
             
        
                                    {/if}
                                    {/each}
 
                            
                                    {#if !$inventory || $inventory.length === 0}
									    <tr><td colspan="7" class="text-center py-4">No items in inventory. Add one to get started!</td></tr>
                                    {/if}
                                </tbody>
						    </table>
                        
                        </div>
                    {:else}
                        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                          
                            {#each $inventory as item (item.id)}
                  
                               <InventoryItemCard item={item} on:manage={(e) => openManageItemModal(e.detail)} />
                            {/each}
            
                            {#if $inventory.length === 0}
                      
                               <div class="col-span-full text-center py-4">No items in inventory. Add one to get started!</div>
                            {/if}
                        </div>
                    {/if}
       
                </div>
 
           </div>

        {:else if activeTab === 'categories'}
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div class="card bg-base-100 shadow-xl border">
                    <div class="card-body p-8">
                        <h2 
          
                           class="card-title text-xl font-greycliffmed mb-4">Add New Category</h2>
                        <form on:submit|preventDefault={addCategory} class="input-group">
							<input type="text" placeholder="Category Name" class="input input-bordered w-full" bind:value={newCategory} />
                            <button type="submit" class="btn btn-primary">Add</button>
   
                         </form>
					</div>
     
                </div>
                <div class="card bg-base-100 shadow-xl border">
                    <div 
                        class="card-body p-8">
                        <h2 class="card-title text-xl font-greycliffmed mb-4">Manage Categories</h2>
						<div class="overflow-x-auto">
                 
                            <table class="table w-full">
                      
                                <tbody>
									{#each $categories as category}
                
                                        <tr class="hover">
											<td>{category}</td>
           
                   
                                            <td class="text-right">
                   
                                                 {#if category !== 'Default'}
       
                                                    <button class="btn btn-xs btn-error" on:click={() => removeCategory(category)}>Remove</button>
												{/if}
                                  
                                            </td>
             
                                      </tr>
									{/each}
                                </tbody>
       
                      </table>
						</div>
             
                    </div>
     
               </div>
            </div>
        {:else if activeTab === 'locations'}
  
            <div class="card bg-base-100 shadow-xl border">
                 <div 
                        class="card-body">
      
                       <h2 class="card-title text-xl font-greycliffmed">Manage Locations</h2>
          
                       <p>Define physical locations for your inventory items (e.g., Shelf A, Back Room).</p>
                     <div class="card-actions justify-center mt-4">
                   
      
                       <button class="btn btn-primary" on:click={() => showLocationsModal 
= true}>Open Location Manager</button>
                    </div>
                 </div>
            </div>
        {:else if activeTab === 'reports'}
            
             <Reports/>
        {/if}
   
    </div>
 
    {/if}
</div>
