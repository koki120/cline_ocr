import { useState, useEffect } from "react";

interface OCRPreviewProps {
	markdown: string;
	imageUrl?: string;
	isLoading?: boolean;
	error?: string | null;
}

export default function OCRPreview({
	markdown,
	imageUrl,
	isLoading = false,
	error = null,
}: OCRPreviewProps) {
	const [renderedHtml, setRenderedHtml] = useState<string>("");

	// Simple Markdown to HTML converter
	useEffect(() => {
		if (!markdown) {
			setRenderedHtml("");
			return;
		}

		// Convert Markdown to HTML
		let html = markdown
			// Headers
			.replace(
				/^# (.*$)/gm,
				'<h1 class="text-2xl font-bold mb-4 text-gray-800">$1</h1>',
			)
			.replace(
				/^## (.*$)/gm,
				'<h2 class="text-xl font-semibold mb-3 text-gray-700">$1</h2>',
			)
			.replace(
				/^### (.*$)/gm,
				'<h3 class="text-lg font-medium mb-2 text-gray-600">$1</h3>',
			)
			// Bold
			.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
			// Italic
			.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
			// Lists
			.replace(/^\s*- (.*$)/gm, '<li class="mb-1">$1</li>')
			// Numbered lists
			.replace(/^\s*(\d+)\.\s+(.*$)/gm, '<li class="mb-1">$2</li>')
			// Line breaks
			.replace(/\n/g, "<br />");

		// Wrap lists in <ul> tags
		html = html.replace(
			/(<li class="mb-1">.*?<\/li>(?:<br \/>)*)+/g,
			(match) => {
				return `<ul class="list-disc list-inside mb-4 space-y-1">${match.replace(/<br \/>/g, "")}</ul>`;
			},
		);

		// Clean up extra line breaks
		html = html.replace(/<br \/>\s*<br \/>/g, "<br />");

		setRenderedHtml(html);
	}, [markdown]);

	return (
		<div className="ocr-preview">
			<div className="flex flex-col md:flex-row gap-4">
				{/* Image preview */}
				{imageUrl && (
					<div className="md:w-1/3">
						<div className="border rounded p-2 bg-gray-50">
							<img
								src={imageUrl}
								alt="OCR Source"
								className="w-full rounded shadow-sm"
								onError={(e) => {
									const target = e.target as HTMLImageElement;
									target.style.display = "none";
								}}
							/>
						</div>
					</div>
				)}

				{/* Markdown preview */}
				<div className={`${imageUrl ? "md:w-2/3" : "w-full"}`}>
					<div className="border rounded p-4 min-h-[200px] bg-white">
						{error ? (
							<div className="flex items-center justify-center h-full">
								<div className="text-center">
									<div className="text-red-500 text-4xl mb-2">⚠️</div>
									<div className="text-red-600 font-medium mb-2">
										エラーが発生しました
									</div>
									<div className="text-red-500 text-sm">{error}</div>
								</div>
							</div>
						) : isLoading ? (
							<div className="flex items-center justify-center h-full">
								<div className="text-center">
									<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
									<div className="text-blue-600 font-medium">OCR処理中...</div>
									<div className="text-gray-500 text-sm mt-1">
										画像を解析しています
									</div>
								</div>
							</div>
						) : renderedHtml ? (
							<div className="markdown-preview">
								<div
									className="prose prose-sm max-w-none"
									dangerouslySetInnerHTML={{ __html: renderedHtml }}
								/>
							</div>
						) : (
							<div className="flex items-center justify-center h-full">
								<div className="text-center">
									<div className="text-gray-400 text-4xl mb-2">📄</div>
									<div className="text-gray-500 font-medium">
										OCR結果がここに表示されます
									</div>
									<div className="text-gray-400 text-sm mt-1">
										画像を撮影してOCR処理を開始してください
									</div>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
