<script>
    import { theme } from './stores.js';
    const themes = [
        { name: "light", colors: { primary: '#D4AF37', secondary: '#C09E26', accent: '#FACC15', base: '#FFFFFF' } },
        { name: "dark", colors: { primary: '#D4AF37', secondary: '#C09E26', accent: '#FACC15', base: '#2A303C' } },
        { name: "usdc", colors: { primary: '#2775CA', secondary: '#3385D9', accent: '#4A90E2', base: '#F0F5FA' } },
        { name: "sol", colors: { primary: '#9945FF', secondary: '#14F195', accent: '#000000', base: '#F0F0F0' } },
        { name: "bonk", colors: { primary: '#FBAE26', secondary: '#E85B25', accent: '#FFFFFF', base: '#FFF8E7' } },
        { name: "emerald", colors: { primary: '#6ee7b7', secondary: '#34d399', accent: '#10b981', base: '#f0fdf4' } },
        { name: "sapphire", colors: { primary: '#7dd3fc', secondary: '#38bdf8', accent: '#0ea5e9', base: '#f0f9ff' } },
        { name: "ruby", colors: { primary: '#fca5a5', secondary: '#f87171', accent: '#ef4444', base: '#fef2f2' } },
        { name: "amethyst", colors: { primary: '#d8b4fe', secondary: '#c084fc', accent: '#a855f7', base: '#f5f3ff' } },
        { name: "ivory", colors: { primary: '#d6d3d1', secondary: '#e7e5e4', accent: '#a8a29e', base: '#ffffff' } },
        { name: "rose", colors: { primary: '#fb7185', secondary: '#f43f5e', accent: '#e11d48', base: '#fff1f2' } },
        { name: "amber", colors: { primary: '#fcd34d', secondary: '#fbbf24', accent: '#f59e0b', base: '#fffbeb' } },
        { name: "cyan", colors: { primary: '#67e8f9', secondary: '#22d3ee', accent: '#06b6d4', base: '#ecfeff' } },
    ];

    function handleKeyDown(event, themeName) {
        if (event.key === 'Enter') {
            $theme = themeName;
        }
    }
</script>

<div class="dropdown dropdown-end">
    <label tabindex="0" class="btn btn-ghost btn-circle">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
    </label>
    <div tabindex="0" class="dropdown-content mt-3 p-4 shadow bg-base-200 rounded-box w-80 grid grid-cols-2 gap-4 max-h-96 overflow-y-auto">
        {#each themes as themeOption}
            <div class="border border-base-content/20 rounded-lg cursor-pointer hover:border-primary" on:click={() => $theme = themeOption.name} on:keydown={(e) => handleKeyDown(e, themeOption.name)} role="button" tabindex="0">
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
