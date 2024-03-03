<script lang="ts">
    import '@/index.css';
    import { browser } from '$app/environment';
    import { isDarkStore } from '@/stores/theme';
    import { onMount } from 'svelte';

    $: if (browser) {
        $isDarkStore
            ? document.documentElement.classList.add('dark')
            : document.documentElement.classList.remove('dark');
    }

    const detectSWUpdate = async () => {
        const registration = await navigator.serviceWorker.ready;

        registration.addEventListener('updatefound', () => {
            const newSW = registration.installing;
            newSW?.addEventListener('statechange', () => {
                if (newSW.state === 'installed') {
                    if (confirm('New update available! Reload to update?')) {
                        newSW.postMessage({ type: 'SKIP_WAITING' });
                        window.location.reload();
                    }
                }
            });
        });
    };

    onMount(() => {
        detectSWUpdate();
    });
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
