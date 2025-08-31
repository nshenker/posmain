<script>
    import { theme } from './stores.js';
    const themes = [
        { name: "light", colors: { primary: '#D4AF37', base: '#FFFFFF' } },
        { name: "dark", colors: { primary: '#D4AF37', base: '#1E1E1E' } },
        { name: "usdc", colors: { primary: '#2775CA', base: '#F0F5FA' } },
        { name: "sol", colors: { primary: '#9945FF', base: '#F0F0F0' } },
        { name: "bonk", colors: { primary: '#FBAE26', base: '#FFF8E7' } },
        { name: "emerald", colors: { primary: '#6ee7b7', base: '#f0fdf4' } },
        { name: "sapphire", colors: { primary: '#7dd3fc', base: '#f0f9ff' } },
        { name: "ruby", colors: { primary: '#fca5a5', base: '#fef2f2' } },
        { name: "amethyst", colors: { primary: '#d8b4fe', base: '#f5f3ff' } },
        { name: "ivory", colors: { primary: '#d6d3d1', base: '#ffffff' } },
        { name: "rose", colors: { primary: '#fb7185', base: '#fff1f2' } },
        { name: "amber", colors: { primary: '#fcd34d', base: '#fffbeb' } },
        { name: "cyan", colors: { primary: '#67e8f9', base: '#ecfeff' } },
    ];
</script>

<div class="dropdown dropdown-end">
    <label tabindex="0" class="btn btn-ghost btn-circle">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
    </label>
    <ul tabindex="0" class="menu menu-sm dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52 z-50">
        {#each themes as themeOption}
            <li>
                <a on:click={() => $theme = themeOption.name}>
                    <div class="flex items-center gap-2">
                        <div class="w-4 h-4 rounded-full border border-base-300" style="background-color: {themeOption.colors.base};"></div>
                        <div class="w-4 h-4 rounded-full border border-base-300" style="background-color: {themeOption.colors.primary};"></div>
                        <span>{@html themeOption.name.charAt(0).toUpperCase() + themeOption.name.slice(1)}</span>
                    </div>
                </a>
            </li>
        {/each}
    </ul>
</div>
