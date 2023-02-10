import { useEffect, useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { saveFile } from '../utils/save-file';

export const Home = () => {
	const [file, setFile] = useState<File>();
	const [numOfPages, setNumOfPages] = useState<number>();
	const [doc, setDoc] = useState<PDFDocument>();
	const [loading, setLoading] = useState(false);
	const [splitter, setSplitter] = useState<string[]>(['']);
	const [message, setMessage] = useState('');

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
		<div className="mt-10 border rounded-lg py-4 px-6 flex flex-col gap-5">
			<h1 className="text-3xl text-center">PDF Splitter</h1>
			<div className="">
				<label className="text-lg font-medium text-gray-900 mb-4">Upload file</label>
				<div className="flex justify-between items-center">
					<input accept=".pdf" className="bg-white file:rounded-md file:bg-gray-300 hover:file:bg-gray-400 w-full p-2 rounded-md" type="file" onChange={handleFileChange} />
					<div className="w-[150px] font-semibold text-right">{numOfPages ? `${numOfPages} pages` : ''}</div>
				</div>
			</div>
			<div>
				<span className="block text-lg font-medium text-gray-900 mb-1">Split Pages</span>
				<div className="flex flex-col gap-3">
					{splitter.map((val, idx) => {
						return (
							<div key={idx}>
								<div className="flex gap-4 items-center">
									<div>{`Split #${idx + 1}`}</div>
									<input
										className="min-w-[400px] text-lg rounded-md px-2 py-1"
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
											className="font-bold bg-red-300 w-[30px] h-[30px] rounded-full"
											onClick={() => {
												setSplitter(splitter.filter((_, i) => i !== idx));
											}}
										>
											&#10005;
										</button>
									)}
								</div>
							</div>
						);
					})}
				</div>
				<button
					onClick={() => {
						splitter.push('');
						setSplitter([...splitter]);
					}}
					type="button"
					className="text-white bg-orange-400 focus:outline-none focus:ring-4 focus:ring-blue-300 rounded-lg text-sm px-3 py-1 text-center mt-2 shadow-sm"
				>
					Add Split
				</button>
			</div>
			<div className="mt-10">
				<button
					type="button"
					disabled={!doc || !file || !splitter.find((val) => val !== '')}
					onClick={split}
					className="text-white bg-gradient-to-br from-green-400 to-blue-600 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2 shadow-md disabled:opacity-50"
				>
					Download
				</button>
			</div>
			<div>{message}</div>
		</div>
	);
};
