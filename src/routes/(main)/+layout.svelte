<script lang="ts">
    import '@/index.css';
    import { browser } from '$app/environment';
    import { isDarkStore } from '@/stores/theme';

    $: {
        if (browser) {
            $isDarkStore
                ? document.documentElement.classList.add('dark')
                : document.documentElement.classList.remove('dark');
        }
    }
</script>

<div class="flex min-h-dvh flex-col items-center">
    <div class="w-full px-4 md:w-[1024px]">
        <slot />
    </div>
</div>
