<script lang="ts">
	import { PDFDocument } from 'pdf-lib';
	import { saveFile } from '../utils/save-file.js';

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

<div class="md:mt-10 md:border border-gray-900 rounded-lg pt-4 pb-8 px-4 md:px-6 flex flex-col gap-8 md:gap-10">
	<h1 class="text-3xl text-center font-medium">PDF Splitter</h1>
	<div class="">
		<div class="text-sm md:text-lg font-bold md:font-medium text-gray-900 mb-2">Upload PDF File</div>
		<div>
			<input
				accept=".pdf"
				class="w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 p-2"
				type="file"
				bind:files
			/>
			{#if doc}
				<div class="text-xs md:text-sm text-gray-900 mt-1 font-medium">
					Pages Count: <span class="text-red-600">{doc?.getPageCount()}</span>
				</div>
			{/if}
		</div>
	</div>
	<div>
		<div class="flex items-center mb-2 gap-2">
			<span class="text-sm md:text-lg font-bold md:font-medium text-gray-900">Split Pages</span>
			<span class="text-xs md:text-base">(Separated by comma, ex: 1, 2, 5-10, 14)</span>
		</div>
		<div class="flex flex-col gap-3">
			{#each splits as _, idx}
				<div class="flex md:gap-4 items-center justify-center">
					<div class="text-sm md:text-base w-[70px]">{`Split #${idx + 1}`}</div>
					<input
						class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
						type="text"
						placeholder="Pages number"
						bind:value={splits[idx]}
						use:init
					/>
					<button
						on:click={() => {
							splits = splits.filter((_, i) => idx != i);
						}}
						class={`font-bold text-2xl w-[35px] h-[35px] rounded-full flex items-center justify-center ${idx === 0 ? 'invisible': 'visible'}`}
					>
						&#10005;
					</button>
				</div>
			{/each}
		</div>
		<button
			type="button"
			class="bg-green-400 focus:outline-none focus:ring-4 focus:ring-blue-300 rounded-lg text-sm px-3 py-1 text-center mt-2 shadow-sm"
			on:click={() => {
				splits.push('');
				splits = [...splits];
			}}
		>
			Add Split
		</button>
	</div>
	<div class="mt-4 flex items-center md:flex-row flex-row-reverse gap-4">
		<button
			type="button"
			disabled={!doc || !splits.find((val) => val !== '')}
			class="py-2 px-4 bg-orange-400 rounded-lg shadow-md disabled:opacity-70"
			on:click={() => {
				splitPdf();
			}}
		>
			Split
		</button>
		{#if message.length != 0}
			<span class="text-red-600 text-center">{message}</span>
		{/if}
	</div>
</div>
