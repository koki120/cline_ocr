import { useState } from "react";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getAllOCRResults } from "../lib/db.server";

// Define OCR result type
interface OCRResult {
	id: number;
	image_filename: string;
	markdown_text: string;
	created_at: string;
}

/**
 * Loader function to fetch OCR results
 */
export async function loader() {
	const ocrResults = getAllOCRResults() as OCRResult[];
	return json({ ocrResults });
}

/**
 * Editor page component
 */
export default function Editor() {
	const { ocrResults } = useLoaderData<typeof loader>();
	const [selectedResult, setSelectedResult] = useState<OCRResult | null>(
		ocrResults[0] || null,
	);
	const [markdown, setMarkdown] = useState(selectedResult?.markdown_text || "");

	// Handle result selection
	const handleResultSelect = (result: OCRResult) => {
		setSelectedResult(result);
		setMarkdown(result.markdown_text);
	};

	// Handle markdown change
	const handleMarkdownChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		setMarkdown(e.target.value);
	};

	// Handle markdown download
	const handleDownloadMarkdown = () => {
		if (!selectedResult) return;

		// Create a Blob with the markdown content
		const markdownBlob = new Blob([markdown], { type: "text/markdown" });
		const markdownUrl = URL.createObjectURL(markdownBlob);

		// Create a download link and click it
		const downloadLink = document.createElement("a");
		downloadLink.href = markdownUrl;
		downloadLink.download = `ocr-result-${selectedResult.id}.md`;
		document.body.appendChild(downloadLink);
		downloadLink.click();
		document.body.removeChild(downloadLink);
		URL.revokeObjectURL(markdownUrl);
	};

	// Handle ZIP download
	const handleDownloadZip = async () => {
		if (!selectedResult) return;

		try {
			const response = await fetch("/api/download-zip", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					ocrResultId: selectedResult.id,
					markdown: markdown,
				}),
			});

			if (!response.ok) {
				throw new Error("ZIP download failed");
			}

			// Create a blob from the response
			const blob = await response.blob();
			const url = URL.createObjectURL(blob);

			// Create a download link and click it
			const downloadLink = document.createElement("a");
			downloadLink.href = url;
			downloadLink.download = `textbook-ocr-${selectedResult.id}.zip`;
			document.body.appendChild(downloadLink);
			downloadLink.click();
			document.body.removeChild(downloadLink);
			URL.revokeObjectURL(url);
		} catch (error) {
			console.error("Error downloading ZIP:", error);
			alert("ZIP ダウンロードに失敗しました。");
		}
	};

	return (
		<div className="container mx-auto p-4">
			<h1 className="text-2xl font-bold mb-4">OCR Editor</h1>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				{/* OCR Results List */}
				<div className="border rounded p-4">
					<h2 className="text-xl font-semibold mb-2">OCR Results</h2>
					{ocrResults.length === 0 ? (
						<p className="text-gray-500">No OCR results found</p>
					) : (
						<ul className="space-y-2">
							{ocrResults.map((result) => (
								<li key={result.id}>
									<button
										className={`w-full text-left p-2 rounded ${
											selectedResult?.id === result.id
												? "bg-blue-100 border border-blue-300"
												: "hover:bg-gray-100"
										}`}
										onClick={() => handleResultSelect(result)}
										onKeyDown={(e) => {
											if (e.key === "Enter" || e.key === " ") {
												handleResultSelect(result);
											}
										}}
									>
										<div className="font-medium">Result #{result.id}</div>
										<div className="text-sm text-gray-500">
											{new Date(result.created_at).toLocaleString()}
										</div>
									</button>
								</li>
							))}
						</ul>
					)}
				</div>

				{/* Markdown Editor */}
				<div className="border rounded p-4 md:col-span-2">
					<h2 className="text-xl font-semibold mb-2">Markdown Editor</h2>
					{selectedResult ? (
						<>
							<div className="mb-4">
								<img
									src={`/downloadImage/${selectedResult.image_filename}`}
									alt="OCR Source"
									className="max-h-40 border rounded"
								/>
							</div>
							<textarea
								className="w-full h-64 p-2 border rounded font-mono"
								value={markdown}
								onChange={handleMarkdownChange}
							></textarea>
							<div className="mt-4 flex justify-end space-x-2">
								<button
									className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
									onClick={handleDownloadMarkdown}
								>
									Markdownダウンロード
								</button>
								<button
									className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
									onClick={handleDownloadZip}
								>
									ZIPダウンロード
								</button>
							</div>
						</>
					) : (
						<p className="text-gray-500">Select an OCR result to edit</p>
					)}
				</div>
			</div>
		</div>
	);
}
