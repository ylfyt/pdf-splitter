<script lang="ts">
    import { PDFDocument } from 'pdf-lib';
    import { saveFile } from '@/utils/save-file.js';
    import { isDarkStore } from '@/stores/theme';
    import Icon from '@iconify/svelte';
    import { fly } from 'svelte/transition';

    let splits: string[] = [''];
    let files: FileList | undefined;
    let doc: PDFDocument | undefined;
    let message = '';

    const updateDoc = () => {
        if (!files || !files[0]) {
            doc = undefined;
            splits = [''];
            return;
        }
        files[0].arrayBuffer().then(async (buff) => {
            doc = await PDFDocument.load(buff);
        });
        splits = [''];
    };

    $: files, updateDoc();
    $: splits,
        (() => {
            message = '';
        })();

    const getPages = (split: string, idx: number): number[] | string => {
        const pages: number[] = [];
        const pageInfo = split.split(',');
        for (let page of pageInfo) {
            if (!page.includes('-')) {
                const pageNumber = parseInt(page);
                if (isNaN(pageNumber)) {
                    return `Split #${idx + 1}: must be number`;
                }
                pages.push(pageNumber - 1);
                continue;
            }
            const data = page.split('-').map((val) => parseInt(val));
            if (data.length < 2 || isNaN(data[0]) || isNaN(data[1])) {
                return `Split #${idx + 1}: must be number`;
            }
            for (let i = data[0]; i <= data[1]; i++) {
                pages.push(i - 1);
            }
        }

        if (pages.length === 0) {
            return `Split #${idx + 1}: no valid page number`;
        }
        for (let page of pages) {
            if (page < 0 || page >= doc!.getPageCount()) {
                return `Split #${idx + 1}: page number must be between ${1} - ${doc?.getPageCount()}`;
            }
        }
        return pages;
    };

    const splitPdf = async () => {
        const pdf: number[][] = [];
        for (let idx = 0; idx < splits.length; idx++) {
            const pages = getPages(splits[idx], idx);
            if (typeof pages === 'string') {
                message = pages;
                return;
            }
            pdf.push(pages);
        }

        for (let idx = 0; idx < splits.length; idx++) {
            if (pdf[idx].length === 0) {
                continue;
            }
            const resultDoc = await PDFDocument.create();
            const copiedPages = await resultDoc.copyPages(doc!, pdf[idx]);
            for (const copied of copiedPages) {
                resultDoc.addPage(copied);
            }
            const buff = await resultDoc.save();
            saveFile(buff, `Split#${idx + 1}_No${splits[idx]}_${files![0]?.name}`, 'application/pdf');
        }
    };

    function init(el: HTMLInputElement) {
        el.focus();
    }
</script>

<div class="mt-4 flex flex-col gap-8">
    <div class="flex items-end justify-between">
        <div>
            <h1 class="text-center text-2xl font-medium text-color0">PDF Splitter</h1>
            <p>By <a href="https://ylfyt.github.io" target="_blank" class="text-color0 underline">ylfyt</a></p>
        </div>
        <div>
            {#if $isDarkStore}
                <button
                    aria-label="dark-mode-toggle"
                    in:fly={{ y: -25 }}
                    on:click={() => isDarkStore.update((prev) => !prev)}
                    class="text-color0"><Icon icon="fa:moon-o" /></button
                >
            {:else}
                <button
                    aria-label="dark-mode-toggle"
                    in:fly={{ y: 25 }}
                    on:click={() => isDarkStore.update((prev) => !prev)}
                    class="text-color0"><Icon icon="fa:sun-o" /></button
                >
            {/if}
        </div>
    </div>
    <form on:submit|preventDefault={splitPdf} class="flex flex-col gap-8">
        <div>
            <label for="pdf" class="text-sm font-bold text-dark dark:text-light md:text-lg md:font-medium"
                >PDF File</label
            >
            <input
                id="pdf"
                accept=".pdf"
                class="mt-2 w-full cursor-pointer rounded-lg border border-gray-300 bg-gray-50 p-2 text-sm focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:placeholder-gray-400"
                type="file"
                required
                bind:files
            />
            {#if doc}
                <div class="mt-1 text-xs font-medium md:text-sm">
                    Pages Count: <span class="text-color0">{doc?.getPageCount()}</span>
                </div>
            {/if}
        </div>
        <div>
            <div class="mb-2 flex items-center gap-2">
                <span class="text-sm font-bold md:text-lg md:font-medium">Split Pages</span>
                <span class="text-xs md:text-base">(Separated by comma, ex: 1, 2, 5-10, 14)</span>
            </div>
            <div class="flex flex-col gap-3">
                {#each splits as _, idx (idx)}
                    <div class="flex items-center justify-center gap-2 md:gap-4">
                        <label for={`split-${idx}`} class="w-[70px] text-sm md:text-base">{`Split #${idx + 1}`}</label>
                        <input
                            id={`split-${idx}`}
                            class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                            type="text"
                            required
                            placeholder="Pages number"
                            bind:value={splits[idx]}
                            use:init
                        />
                        <button
                            type="button"
                            on:click={() => {
                                splits = splits.filter((_, i) => idx != i);
                            }}
                            class={`size-4 items-center justify-center rounded-full text-xl font-bold ${splits.length < 2 ? 'hidden' : 'flex'}`}
                        >
                            &#10005;
                        </button>
                    </div>
                {/each}
            </div>
            <button
                type="button"
                class="mt-2 rounded-lg bg-color0 px-3 py-1 text-center text-sm shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-300"
                on:click={() => {
                    splits.push('');
                    splits = [...splits];
                }}
            >
                Add Split
            </button>
        </div>
        <div class="mt-4 flex items-center justify-end gap-4">
            {#if message.length != 0}
                <span class="text-center text-red-600">{message}</span>
            {/if}
            <button
                disabled={!doc || !splits.find((val) => val !== '')}
                type="submit"
                class="rounded-lg bg-color0 px-4 py-2 shadow-md disabled:opacity-70"
            >
                Split
            </button>
        </div>
    </form>
</div>
