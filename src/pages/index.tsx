import { useEffect, useState } from 'react';
import { PDFDocument } from 'pdf-lib';

export const Home = () => {
	const [file, setFile] = useState<File>();

	useEffect(() => {
		if (!file) return;
		console.time('ok');

		file.arrayBuffer().then(async (buff) => {
			console.timeEnd('ok');
		});
	}, [file]);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (!e.target.files || !e.target.files[0]) {
			setFile(undefined);
			return;
		}
		setFile(e.target.files[0]);
	};
	return (
		<div>
			<div>
				<h1>Home</h1>
				<button>test</button>
				<input accept=".pdf" type="file" onChange={handleFileChange} />
			</div>
			<iframe id="pdf"></iframe>
		</div>
	);
};
