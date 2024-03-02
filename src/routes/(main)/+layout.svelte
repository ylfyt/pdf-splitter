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

<svelte:head>
    <title>PDF Splitter</title>
    <meta name="description" content="PDF Splitter" />
</svelte:head>

<div class="flex min-h-dvh flex-col items-center">
    <div class="w-full px-4 lg:w-1/2">
        <slot />
    </div>
</div>
