export function saveFile(data: ArrayBuffer, fileName: string, fileType: string) {
	return new Promise<void>((resolve) => {
		const link = document.createElement('a');
		link.style.display = 'none';
		document.body.appendChild(link);

		const blob = new Blob([data], { type: fileType });
		const objectURL = URL.createObjectURL(blob);

		link.href = objectURL;
		link.href = URL.createObjectURL(blob);
		link.download = fileName;
		link.click();
		setTimeout(() => {
			resolve();
			link.remove();
		}, 100);
	});
}
