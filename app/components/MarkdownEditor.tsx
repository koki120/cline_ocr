import { useState, useEffect } from "react";

interface MarkdownEditorProps {
	initialValue: string;
	onChange: (value: string) => void;
}

export default function MarkdownEditor({
	initialValue,
	onChange,
}: MarkdownEditorProps) {
	const [markdown, setMarkdown] = useState(initialValue);
	const [previewHtml, setPreviewHtml] = useState<string>("");
	const [isPreviewMode, setIsPreviewMode] = useState(false);

	// Update markdown when initialValue changes
	useEffect(() => {
		setMarkdown(initialValue);
	}, [initialValue]);

	// Handle markdown change
	const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		const newValue = e.target.value;
		setMarkdown(newValue);
		onChange(newValue);
	};

	// Convert markdown to HTML for preview
	useEffect(() => {
		if (!markdown) {
			setPreviewHtml("");
			return;
		}

		// Convert Markdown to HTML
		let html = markdown
			// Headers
			.replace(/^# (.*$)/gm, "<h1>$1</h1>")
			.replace(/^## (.*$)/gm, "<h2>$1</h2>")
			.replace(/^### (.*$)/gm, "<h3>$1</h3>")
			// Bold
			.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
			// Italic
			.replace(/\*(.*?)\*/g, "<em>$1</em>")
			// Lists
			.replace(/^\s*- (.*$)/gm, "<li>$1</li>")
			// Line breaks
			.replace(/\n/g, "<br />");

		// Wrap lists in <ul> tags
		html = html.replace(/<li>.*?<\/li>/g, (match) => {
			return `<ul>${match}</ul>`;
		});

		// Replace consecutive <ul> tags with a single <ul>
		html = html.replace(/<\/ul>\s*<ul>/g, "");

		setPreviewHtml(html);
	}, [markdown]);

	return (
		<div className="markdown-editor">
			{/* Editor toolbar */}
			<div className="flex justify-between items-center mb-2 border-b pb-2">
				<div className="font-medium">Markdown Editor</div>
				<div>
					<button
						className={`px-3 py-1 rounded mr-2 ${
							!isPreviewMode
								? "bg-blue-500 text-white"
								: "bg-gray-200 text-gray-700 hover:bg-gray-300"
						}`}
						onClick={() => setIsPreviewMode(false)}
					>
						編集
					</button>
					<button
						className={`px-3 py-1 rounded ${
							isPreviewMode
								? "bg-blue-500 text-white"
								: "bg-gray-200 text-gray-700 hover:bg-gray-300"
						}`}
						onClick={() => setIsPreviewMode(true)}
					>
						プレビュー
					</button>
				</div>
			</div>

			{/* Editor content */}
			<div className="border rounded">
				{isPreviewMode ? (
					<div className="p-4 min-h-[300px] prose">
						{previewHtml ? (
							<div dangerouslySetInnerHTML={{ __html: previewHtml }} />
						) : (
							<div className="text-gray-400 italic">
								プレビューするコンテンツがありません
							</div>
						)}
					</div>
				) : (
					<textarea
						className="w-full h-[300px] p-4 font-mono text-sm"
						value={markdown}
						onChange={handleChange}
						placeholder="Markdownを入力してください..."
					/>
				)}
			</div>

			{/* Markdown help */}
			<div className="mt-2 text-xs text-gray-500">
				<details>
					<summary className="cursor-pointer">Markdownヘルプ</summary>
					<div className="mt-2 p-2 bg-gray-50 rounded">
						<ul className="list-disc pl-5 space-y-1">
							<li>
								<code># 見出し1</code> - 大見出し
							</li>
							<li>
								<code>## 見出し2</code> - 中見出し
							</li>
							<li>
								<code>### 見出し3</code> - 小見出し
							</li>
							<li>
								<code>**太字**</code> - <strong>太字</strong>
							</li>
							<li>
								<code>*斜体*</code> - <em>斜体</em>
							</li>
							<li>
								<code>- リスト項目</code> - 箇条書き
							</li>
						</ul>
					</div>
				</details>
			</div>
		</div>
	);
}
