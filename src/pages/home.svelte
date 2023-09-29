<script lang="ts">
	import { PDFDocument } from 'pdf-lib';
	import { saveFile } from '../utils/save-file.js';

	let splits: string[] = [''];
	let files: FileList | undefined;
	let doc: PDFDocument | undefined;

	$: files,
		(() => {
			if (!files || !files[0]) {
				doc = undefined;
				return;
			}
			files[0].arrayBuffer().then(async (buff) => {
				doc = await PDFDocument.load(buff);
			});
		})();

	const split = async () => {
		if (!doc || !files?.[0]) return;

		splits.forEach(async (val, idx) => {
			if (val === '') return;

			const pages = val
				.split(',')
				.map((page) => {
					if (!page.includes('-')) {
						return Number.isNaN(parseInt(page)) ? [] : parseInt(page) - 1;
					}
					const data = page.split('-').map((val) => parseInt(val));
					if (data.length < 2 || Number.isNaN(data[0]) || Number.isNaN(data[1])) return [];

					const temp: number[] = [];
					for (let i = data[0]; i <= data[1]; i++) {
						temp.push(i - 1);
					}
					return temp;
				})
				.flat()
				.filter((val) => val >= 0 || val);
			if (pages.length === 0) return;

			const resultDoc = await PDFDocument.create();
			const copiedPages = await resultDoc.copyPages(doc!, pages);
			for (const copied of copiedPages) {
				resultDoc.addPage(copied);
			}
			const buff = await resultDoc.save();
			saveFile(buff, `Split#${idx + 1}_No${val}_${files![0]?.name}`, 'application/pdf');
		});
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
				<div>
					<div class="flex md:gap-4 items-center justify-start">
						<div class="text-sm md:text-base w-[60px]">{`Split #${idx + 1}`}</div>
						<input
							class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-3/4 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
							type="text"
							placeholder="Pages number"
							bind:value={splits[idx]}
							use:init
						/>
						{#if idx === 0}
							<div class="w-[30px] h-[30px] ml-1 md:ml-0" />
						{:else}
							<button
								on:click={() => {
									splits = splits.filter((_, i) => idx != i);
								}}
								class="font-bold text-sm bg-red-300 w-[30px] h-[30px] rounded-full ml-1 md:ml-0"
							>
								&#10005;
							</button>
						{/if}
					</div>
				</div>
			{/each}
		</div>
		<button
			type="button"
			class="text-white bg-orange-400 focus:outline-none focus:ring-4 focus:ring-blue-300 rounded-lg text-sm px-3 py-1 text-center mt-2 shadow-sm"
			on:click={() => {
				splits.push('');
				splits = [...splits];
			}}
		>
			Add Split
		</button>
	</div>
	<div class="mt-4 flex justify-end md:justify-start">
		<button
			type="button"
			disabled={!doc || !splits.find((val) => val !== '')}
			class="text-white bg-gradient-to-br from-green-400 to-blue-600 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 shadow-md disabled:opacity-50"
			on:click={() => {
				split();
			}}
		>
			Download
		</button>
	</div>
</div>
