<script>
    import { createEventDispatcher } from 'svelte';
    import { theme } from './stores.js';
    
    const dispatch = createEventDispatcher();
    
    const themes = [
        { name: "light", colors: { primary: '#570df8', secondary: '#f000b8', accent: '#37cdbe', base: '#ffffff' } },
        { name: "dark", colors: { primary: '#793ef9', secondary: '#f000b8', accent: '#37cdbe', base: '#3d4451' } },
        { name: "cupcake", colors: { primary: '#65c3c8', secondary: '#ef9fbc', accent: '#eeaf3a', base: '#faf7f5' } },
        { name: "bumblebee", colors: { primary: '#f9d72f', secondary: '#e0a82e', accent: '#18182f', base: '#ffffff' } },
        { name: "emerald", colors: { primary: '#66cc8a', secondary: '#377cfb', accent: '#f6d860', base: '#ffffff' } },
        { name: "corporate", colors: { primary: '#4b6bfb', secondary: '#7b92b2', accent: '#67cba0', base: '#ffffff' } },
        { name: "synthwave", colors: { primary: '#e779c1', secondary: '#58c7f3', accent: '#f3cc30', base: '#2d2a55' } },
        { name: "retro", colors: { primary: '#ef9995', secondary: '#a4cbb4', accent: '#ebdc99', base: '#e4d8b4' } },
        { name: "cyberpunk", colors: { primary: '#00bcd4', secondary: '#ff4081', accent: '#7c4dff', base: '#0d0d1a' } },
        { name: "valentine", colors: { primary: '#e96d7b', secondary: '#a991f7', accent: '#86efac', base: '#f0d6e8' } },
    ];
    
    function selectTheme(themeName) {
        $theme = themeName;
        dispatch('close');
    }
</script>

<div class="modal modal-open">
    <div class="modal-box max-w-lg">
        <h3 class="font-bold text-lg">Select Theme</h3>
        
        <div class="py-4 grid grid-cols-2 md:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
            {#each themes as themeOption}
                <div 
                    role="button" 
                    tabindex="0" 
                    class="border-2 rounded-lg cursor-pointer transition-all duration-200 shadow-lg 
                           {themeOption.name === $theme ? 'border-primary ring-4 ring-primary/50' : 'border-base-content/20 hover:border-primary'}" 
                    on:click={() => selectTheme(themeOption.name)}
                >
                    <div class="bg-base-100 rounded-t-lg p-2 font-bold text-base-content text-sm">
                        {@html themeOption.name.charAt(0).toUpperCase() + themeOption.name.slice(1)}
                    </div>
                    <div class="p-2 bg-base-100 rounded-b-lg">
                        <div class="flex flex-wrap gap-1">
                            <div class="w-5 h-5 rounded-full" style="background-color: {themeOption.colors.primary};"></div>
                            <div class="w-5 h-5 rounded-full" style="background-color: {themeOption.colors.secondary};"></div>
                            <div class="w-5 h-5 rounded-full" style="background-color: {themeOption.colors.accent};"></div>
                            <div class="w-5 h-5 rounded-full" style="background-color: {themeOption.colors.base};"></div>
                        </div>
                    </div>
                </div>
            {/each}
        </div>

        <div class="modal-action">
            <button class="btn" on:click={() => dispatch('close')}>Close</button>
        </div>
    </div>
</div>
