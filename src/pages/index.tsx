import { useEffect, useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { saveFile } from '../utils/save-file';

export const Home = () => {
	const [file, setFile] = useState<File>();
	const [numOfPages, setNumOfPages] = useState<number>();
	const [doc, setDoc] = useState<PDFDocument>();
	const [loading, setLoading] = useState(false);
	const [splitter, setSplitter] = useState<string[]>(['']);

	useEffect(() => {
		if (!file) {
			setDoc(undefined);
			return;
		}
		setLoading(true);
		file.arrayBuffer().then(async (buff) => {
			setDoc(await PDFDocument.load(buff));
			setLoading(false);
		});
	}, [file]);

	useEffect(() => {
		if (!doc) {
			setNumOfPages(undefined);
			return;
		}
		setNumOfPages(doc.getPageCount());
	}, [doc]);

	const split = async () => {
		if (!doc) return;
		splitter.forEach(async (val) => {
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
			const copiedPages = await resultDoc.copyPages(doc, pages);
			for (const copied of copiedPages) {
				resultDoc.addPage(copied);
			}
			const buff = await resultDoc.save();
			saveFile(buff, `${val}_${file?.name}`, 'application/pdf');
		});
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (!e.target.files || !e.target.files[0]) {
			setFile(undefined);
			return;
		}
		setFile(e.target.files[0]);
	};

	return (
		<div className="mt-10 border rounded-lg py-4 px-6">
			<h1 className="text-3xl text-center mb-4">PDF Splitter</h1>
			<div className="">
				<label className="block mb-2 font-medium text-gray-900">Upload file</label>
				<div className="flex justify-between">
					<input
						accept=".pdf"
						className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
						id="file_input"
						type="file"
						onChange={handleFileChange}
					/>
					<div className="w-[150px] font-semibold text-right">{numOfPages ? `${numOfPages} pages` : ''}</div>
				</div>
			</div>
			<div>
				{splitter.map((val, idx) => {
					return (
						<div key={idx}>
							<input
								onChange={(e) => {
									splitter[idx] = e.target.value;
									setSplitter([...splitter]);
								}}
								type="text"
								value={val}
							/>
							{idx === 0 ? (
								<></>
							) : (
								<button
									onClick={() => {
										setSplitter(splitter.filter((_, i) => i !== idx));
									}}
								>
									X
								</button>
							)}
						</div>
					);
				})}
				<button
					onClick={() => {
						splitter.push('');
						setSplitter([...splitter]);
					}}
				>
					+
				</button>
			</div>
			<div>
				<button onClick={split}>Split</button>
			</div>
		</div>
	);
};
