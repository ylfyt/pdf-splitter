<script lang="ts">
    import { PDFDocument } from 'pdf-lib';
    import { saveFile } from '@/utils/save-file.js';

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

    const getPages = (split: string): number[] | string => {
        const pages: number[] = [];
        const pageInfo = split.split(',');
        for (let page of pageInfo) {
            if (!page.includes('-')) {
                const pageNumber = parseInt(page);
                if (isNaN(pageNumber)) {
                    return `Split ${split}: must be number`;
                }
                pages.push(pageNumber) - 1;
                continue;
            }
            const data = page.split('-').map((val) => parseInt(val));
            if (data.length < 2 || isNaN(data[0]) || isNaN(data[1])) {
                return `Split ${split}: must be number`;
            }
            for (let i = data[0]; i <= data[1]; i++) {
                pages.push(i - 1);
            }
        }

        if (pages.length === 0) {
            return `Split ${split}: no valid page number`;
        }
        for (let page of pages) {
            if (page < 0 || page >= doc!.getPageCount()) {
                return `Split ${split}: page number must be between ${1} - ${doc?.getPageCount()}`;
            }
        }
        return pages;
    };

    const splitPdf = async () => {
        const pdf: number[][] = [];
        for (let idx = 0; idx < splits.length; idx++) {
            const pages = getPages(splits[idx]);
            if (typeof pages === 'string') {
                message = pages;
                pdf.push([]);
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

<div class="flex flex-col gap-8 rounded-lg border-gray-900 px-4 pb-8 pt-4 md:mt-10 md:gap-10 md:border md:px-6">
    <h1 class="text-center text-3xl font-medium">PDF Splitter</h1>
    <div class="">
        <div class="mb-2 text-sm font-bold text-gray-900 md:text-lg md:font-medium">Upload PDF File</div>
        <div>
            <input
                accept=".pdf"
                class="w-full cursor-pointer rounded-lg border border-gray-300 bg-gray-50 p-2 text-sm text-gray-900 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400 dark:placeholder-gray-400"
                type="file"
                bind:files
            />
            {#if doc}
                <div class="mt-1 text-xs font-medium text-gray-900 md:text-sm">
                    Pages Count: <span class="text-red-600">{doc?.getPageCount()}</span>
                </div>
            {/if}
        </div>
    </div>
    <div>
        <div class="mb-2 flex items-center gap-2">
            <span class="text-sm font-bold text-gray-900 md:text-lg md:font-medium">Split Pages</span>
            <span class="text-xs md:text-base">(Separated by comma, ex: 1, 2, 5-10, 14)</span>
        </div>
        <div class="flex flex-col gap-3">
            {#each splits as _, idx}
                <div class="flex items-center justify-center md:gap-4">
                    <div class="w-[70px] text-sm md:text-base">{`Split #${idx + 1}`}</div>
                    <input
                        class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                        type="text"
                        placeholder="Pages number"
                        bind:value={splits[idx]}
                        use:init
                    />
                    <button
                        on:click={() => {
                            splits = splits.filter((_, i) => idx != i);
                        }}
                        class={`flex h-[35px] w-[35px] items-center justify-center rounded-full text-2xl font-bold ${idx === 0 ? 'invisible' : 'visible'}`}
                    >
                        &#10005;
                    </button>
                </div>
            {/each}
        </div>
        <button
            type="button"
            class="mt-2 rounded-lg bg-green-400 px-3 py-1 text-center text-sm shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-300"
            on:click={() => {
                splits.push('');
                splits = [...splits];
            }}
        >
            Add Split
        </button>
    </div>
    <div class="mt-4 flex flex-row-reverse items-center gap-4 md:flex-row">
        <button
            type="button"
            disabled={!doc || !splits.find((val) => val !== '')}
            class="rounded-lg bg-orange-400 px-4 py-2 shadow-md disabled:opacity-70"
            on:click={() => {
                splitPdf();
            }}
        >
            Split
        </button>
        {#if message.length != 0}
            <span class="text-center text-red-600">{message}</span>
        {/if}
    </div>
</div>
