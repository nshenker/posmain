<script>
    import { theme } from './stores.js';
    const themes = [
        { name: "light", colors: { primary: '#570df8', secondary: '#f000b8', accent: '#37cdbe', base: '#ffffff' } },
        { name: "dark", colors: { primary: '#793ef9', secondary: '#f000b8', accent: '#37cdbe', base: '#3d4451' } },
        { name: "cupcake", colors: { primary: '#65c3c8', secondary: '#ef9fbc', accent: '#eeaf3a', base: '#faf7f5' } },
        { name: "bumblebee", colors: { primary: '#f9d72f', secondary: '#e0a82e', accent: '#18182f', base: '#ffffff' } },
        { name: "emerald", colors: { primary: '#66cc8a', secondary: '#377cfb', accent: '#f6d860', base: '#ffffff' } },
        { name: "corporate", colors: { primary: '#4b6bfb', secondary: '#7b92b2', accent: '#67cba0', base: '#ffffff' } },
        { name: "synthwave", colors: { primary: '#e779c1', secondary: '#58c7f3', accent: '#f3cc30', base: '#2d2a55' } },
        { name: "retro", colors: { primary: '#ef9995', secondary: '#a4cbb4', accent: '#ebdc99', base: '#e4d8b4' } },
        { name: "cyberpunk", colors: { primary: '#00bcd4', secondary: '#ff4081', accent: '#7c4dff', base: '#0d0d1a' 
        } },
        { name: "valentine", colors: { primary: '#e96d7b', secondary: '#a991f7', accent: '#86efac', base: '#f0d6e8' } },
    ];
</script>

<div class="dropdown dropdown-end">
    <div role="button" class="btn btn-ghost btn-circle">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
    </div>
    <div class="dropdown-content mt-3 p-4 shadow bg-base-200 rounded-box w-80 grid grid-cols-2 gap-4 max-h-96 overflow-y-auto">
        {#each themes as themeOption}
 
            <div role="button" tabindex="0" class="border border-base-content/20 rounded-lg cursor-pointer hover:border-primary" on:click={() => $theme = themeOption.name} on:keydown={(e) => { if (e.key === 'Enter') $theme = themeOption.name }}>
                <div class="bg-base-100 rounded-t-lg p-2 font-bold text-base-content">
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
</div>
