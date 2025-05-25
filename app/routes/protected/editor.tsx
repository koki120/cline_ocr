import { useState } from "react";
import { redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link, Form } from "@remix-run/react";
import { getAllOCRResults } from "../../lib/db.server";
import { verifyToken } from "../../lib/auth.server";

// Define OCR result type
interface OCRResult {
	id: number;
	image_filename: string;
	markdown_text: string;
	created_at: string;
}

/**
 * Loader function with authentication guard
 */
export async function loader({ request }: LoaderFunctionArgs) {
	// Check authentication
	const cookieHeader = request.headers.get("Cookie");
	let isAuthenticated = false;

	if (cookieHeader) {
		const cookies = Object.fromEntries(
			cookieHeader.split("; ").map((cookie) => cookie.split("=")),
		);

		if (cookies.token) {
			const username = verifyToken(cookies.token);
			if (username) {
				isAuthenticated = true;
			}
		}
	}

	// Redirect to login if not authenticated
	if (!isAuthenticated) {
		return redirect("/login");
	}

	// Fetch OCR results if authenticated
	const ocrResults = getAllOCRResults() as OCRResult[];
	return Response.json({ ocrResults });
}

/**
 * Protected Editor page component
 */
export default function ProtectedEditor() {
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
		<div className="min-h-screen bg-gray-50">
			{/* Header with logout */}
			<header className="bg-white shadow-sm border-b">
				<div className="container mx-auto px-4 py-4">
					<div className="flex justify-between items-center">
						<div className="flex items-center space-x-4">
							<h1 className="text-2xl font-bold text-gray-800">
								📚 OCR Editor (認証済み)
							</h1>
							<Link
								to="/"
								className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
							>
								ホームに戻る
							</Link>
						</div>
						<Form action="/logout" method="post">
							<button
								type="submit"
								className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
							>
								ログアウト
							</button>
						</Form>
					</div>
					<p className="text-gray-600 mt-1">
						認証されたユーザーのみアクセス可能なエディター
					</p>
				</div>
			</header>

			{/* Main content */}
			<main className="container mx-auto p-4">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					{/* OCR Results List */}
					<div className="bg-white border rounded p-4">
						<h2 className="text-xl font-semibold mb-2">OCR Results</h2>
						{ocrResults.length === 0 ? (
							<div className="text-center py-8">
								<p className="text-gray-500 mb-4">OCR結果がありません</p>
								<Link
									to="/"
									className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
								>
									新しいOCRを実行
								</Link>
							</div>
						) : (
							<ul className="space-y-2">
								{ocrResults.map((result: OCRResult) => (
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
					<div className="bg-white border rounded p-4 md:col-span-2">
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
									placeholder="Markdownテキストを編集..."
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
							<div className="text-center py-8">
								<p className="text-gray-500">
									OCR結果を選択して編集を開始してください
								</p>
							</div>
						)}
					</div>
				</div>

				{/* Security notice */}
				<div className="mt-8 bg-green-50 rounded-lg p-6">
					<h3 className="text-lg font-semibold text-green-800 mb-3">
						🔒 セキュリティ情報
					</h3>
					<ul className="list-disc list-inside space-y-2 text-green-700">
						<li>このページは認証されたユーザーのみアクセス可能です</li>
						<li>セッションは7日間有効です</li>
						<li>
							セキュリティのため、使用後はログアウトすることをお勧めします
						</li>
					</ul>
				</div>
			</main>
		</div>
	);
}
