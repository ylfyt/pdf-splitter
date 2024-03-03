/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

import { build, files, version } from '$service-worker';

declare let self: ServiceWorkerGlobalScope;

const CACHE_NAME = `cache-${version}`;
const ASSETS = [
    ...build,
    ...files.filter(el => !el.includes(".nojekyll"))
];

self.addEventListener('install', e => {
    const addFileToCache = async () => {
        const cache = await caches.open(CACHE_NAME);
        await cache.addAll(ASSETS);
    };
    e.waitUntil(addFileToCache());
});

self.addEventListener('activate', e => {
    const deleteOldCache = async () => {
        for (const key of await caches.keys()) {
            if (key !== CACHE_NAME) {
                await caches.delete(key);
            }
        }
    };
    e.waitUntil(deleteOldCache());
});

self.addEventListener('fetch', e => {
    if (e.request.method !== 'GET') return;

    const getResponse = async () => {
        const url = new URL(e.request.url);
        console.log('URL', url.pathname);

        const cache = await caches.open(CACHE_NAME);

        if (ASSETS.includes(url.pathname)) {
            const cachedResponse = await cache.match(url.pathname);
            console.log('ASSET', cachedResponse);
            if (cachedResponse) return cachedResponse;
        }

        try {
            const response = await fetch(e.request);
            const isNotExtension = url.protocol === 'http:';
            const isSuccess = response.status === 200;
            if (isNotExtension && isSuccess) {
                console.log('NOT EXT');
                cache.put(e.request, response.clone());
            }
            console.log('res', response);
            return response;
        } catch {
            const cachedResponse = await cache.match(url.pathname);
            console.log('off', cachedResponse);
            if (cachedResponse) return cachedResponse;
        }
        console.log('not found');
        return new Response('Req: Not found', { status: 404 });
    };

    e.respondWith(getResponse());
});

self.addEventListener('message', e => {
    if (e.data && e.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
