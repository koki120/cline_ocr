import { useState, useEffect } from 'react';

interface OCRPreviewProps {
  markdown: string;
  imageUrl?: string;
  isLoading?: boolean;
}

export default function OCRPreview({ markdown, imageUrl, isLoading = false }: OCRPreviewProps) {
  const [renderedHtml, setRenderedHtml] = useState<string>('');

  // Simple Markdown to HTML converter
  useEffect(() => {
    if (!markdown) {
      setRenderedHtml('');
      return;
    }

    // Convert Markdown to HTML
    let html = markdown
      // Headers
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Lists
      .replace(/^\s*- (.*$)/gm, '<li>$1</li>')
      // Line breaks
      .replace(/\n/g, '<br />');

    // Wrap lists in <ul> tags
    html = html.replace(/<li>.*?<\/li>/g, (match) => {
      return `<ul>${match}</ul>`;
    });

    // Replace consecutive <ul> tags with a single <ul>
    html = html.replace(/<\/ul>\s*<ul>/g, '');

    setRenderedHtml(html);
  }, [markdown]);

  return (
    <div className="ocr-preview">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Image preview */}
        {imageUrl && (
          <div className="md:w-1/3">
            <div className="border rounded p-2">
              <img src={imageUrl} alt="OCR Source" className="w-full" />
            </div>
          </div>
        )}

        {/* Markdown preview */}
        <div className={`${imageUrl ? 'md:w-2/3' : 'w-full'}`}>
          <div className="border rounded p-4 min-h-[200px] bg-white">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="ml-2">OCR処理中...</span>
              </div>
            ) : renderedHtml ? (
              <div
                className="markdown-preview prose"
                dangerouslySetInnerHTML={{ __html: renderedHtml }}
              />
            ) : (
              <div className="text-gray-400 italic">
                OCR結果がここに表示されます
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
