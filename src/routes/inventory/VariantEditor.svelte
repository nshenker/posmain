<script lang="ts">
    export let variants = [];
    export let basePrice = 0;
    export let baseCost = 0;

    let newAttributeName = '';
    let newAttributeValues = '';
    let attributes = [];

    function addAttribute() {
        if (newAttributeName.trim() && newAttributeValues.trim()) {
            attributes = [
                ...attributes,
                {
                    name: newAttributeName.trim(),
                    values: newAttributeValues.split(',').map(v => v.trim())
                }
            ];
            newAttributeName = '';
            newAttributeValues = '';
            generateVariants();
        }
    }

    function removeAttribute(index) {
        attributes.splice(index, 1);
        attributes = attributes;
        generateVariants();
    }

    function generateVariants() {
        if (attributes.length === 0) {
            variants = [];
            return;
        }

        const combinations = attributes.reduce((acc, attr) => {
            if (acc.length === 0) {
                return attr.values.map(v => [{ name: attr.name, value: v }]);
            }
            const newAcc = [];
            acc.forEach(combo => {
                attr.values.forEach(value => {
                    newAcc.push([...combo, { name: attr.name, value: value }]);
                });
            });
            return newAcc;
        }, []);

        variants = combinations.map((combo, index) => {
            const name = combo.map(c => c.value).join(' / ');
            // Try to find an existing variant to preserve its data
            const existing = variants.find(v => v.name === name);
            return {
                id: existing?.id || `var_${Date.now()}_${index}`,
                name: name,
                sku: existing?.sku || '',
                barcode: existing?.barcode || '',
                quantity: existing?.quantity || 0,
                price: existing?.price || basePrice,
                cost: existing?.cost || baseCost
            };
        });
    }
</script>

<div class="space-y-4 p-4 border rounded-lg bg-base-200">
    <h3 class="font-bold">Product Variants</h3>
    
    <div class="space-y-2">
        {#each attributes as attr, i}
            <div class="flex items-center gap-2">
                <div class="badge badge-lg">{attr.name}: {attr.values.join(', ')}</div>
                <button type="button" class="btn btn-xs btn-circle btn-error" on:click={() => removeAttribute(i)}>✕</button>
            </div>
        {/each}
        <form on:submit|preventDefault={addAttribute} class="grid grid-cols-1 md:grid-cols-3 gap-2">
            <input type="text" placeholder="Attribute (e.g., Size)" class="input input-sm input-bordered" bind:value={newAttributeName} />
            <input type="text" placeholder="Values, comma-separated" class="input input-sm input-bordered" bind:value={newAttributeValues} />
            <button type="submit" class="btn btn-sm btn-secondary">Add Attribute</button>
        </form>
    </div>

    {#if variants.length > 0}
        <div class="overflow-x-auto">
            <table class="table table-sm w-full">
                <thead>
                    <tr>
                        <th>Variant</th>
                        <th>SKU</th>
                        <th>Barcode</th>
                        <th>Cost</th>
                        <th>Price</th>
                        <th>Quantity</th>
                    </tr>
                </thead>
                <tbody>
                    {#each variants as variant, i}
                        <tr>
                            <td class="font-greycliffmed">{variant.name}</td>
                            <td><input type="text" class="input input-sm input-bordered w-full" bind:value={variants[i].sku} /></td>
                            <td><input type="text" class="input input-sm input-bordered w-full" bind:value={variants[i].barcode} /></td>
                            <td><input type="number" step="0.01" class="input input-sm input-bordered w-full" bind:value={variants[i].cost} /></td>
                            <td><input type="number" step="0.01" class="input input-sm input-bordered w-full" bind:value={variants[i].price} /></td>
                            <td><input type="number" step="1" class="input input-sm input-bordered w-full" bind:value={variants[i].quantity} /></td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    {/if}
</div>
