import { useState } from 'react';
import type { MetaFunction } from '@remix-run/node';
import { Link } from '@remix-run/react';
import CameraCapture from '../components/CameraCapture';
import OCRPreview from '../components/OCRPreview';
import type { OCRResponse } from '../lib/visionService';

export const meta: MetaFunction = () => {
  return [
    { title: 'Textbook OCR App - 教科書デジタル化アプリ' },
    { name: 'description', content: 'スマートフォンで教科書を撮影してMarkdown形式で電子化' },
  ];
};

export default function Index() {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [ocrResult, setOcrResult] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle image capture from camera
  const handleImageCapture = async (imageBase64: string) => {
    setCapturedImage(imageBase64);
    setIsProcessing(true);
    setError(null);
    setOcrResult('');

    try {
      // Send image to OCR API
      const response = await fetch('/api/ocr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_base64: imageBase64,
        }),
      });

      if (!response.ok) {
        throw new Error('OCR処理に失敗しました');
      }

      const result: OCRResponse = await response.json();
      setOcrResult(result.markdown);
    } catch (err) {
      console.error('OCR processing error:', err);
      setError('OCR処理中にエラーが発生しました。もう一度お試しください。');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle download of markdown
  const handleDownload = () => {
    if (!ocrResult) return;

    const blob = new Blob([ocrResult], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `textbook-ocr-${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Reset the app state
  const handleReset = () => {
    setCapturedImage(null);
    setOcrResult('');
    setError(null);
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">
              📚 Textbook OCR App
            </h1>
            <Link
              to="/editor"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              編集履歴
            </Link>
          </div>
          <p className="text-gray-600 mt-1">
            教科書をスマートフォンで撮影してMarkdown形式で電子化
          </p>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Error message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Camera section */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">📷 カメラ撮影</h2>
              <CameraCapture onCapture={handleImageCapture} />

              {capturedImage && (
                <div className="mt-4">
                  <button
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 mr-2"
                    onClick={handleReset}
                  >
                    リセット
                  </button>
                  {ocrResult && (
                    <button
                      className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                      onClick={handleDownload}
                    >
                      Markdownダウンロード
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* OCR Preview section */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">📝 OCR結果</h2>
              <OCRPreview
                markdown={ocrResult}
                imageUrl={capturedImage || undefined}
                isLoading={isProcessing}
              />
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-8 bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">
              📋 使用方法
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-blue-700">
              <li>「カメラを起動」ボタンをクリックしてカメラを開始</li>
              <li>教科書のページを画面に映して「撮影」ボタンをクリック</li>
              <li>OCR処理が自動で実行され、Markdown形式のテキストが生成されます</li>
              <li>結果を確認し、必要に応じて「Markdownダウンロード」でファイルを保存</li>
              <li>「編集履歴」から過去のOCR結果を確認・編集できます</li>
            </ol>
          </div>

          {/* Features */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-3xl mb-3">🚀</div>
              <h4 className="font-semibold mb-2">高速処理</h4>
              <p className="text-gray-600 text-sm">
                Google Cloud Vision APIを使用した高精度なOCR処理
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-3xl mb-3">📱</div>
              <h4 className="font-semibold mb-2">モバイル対応</h4>
              <p className="text-gray-600 text-sm">
                スマートフォンのカメラで簡単に撮影・処理
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-3xl mb-3">✏️</div>
              <h4 className="font-semibold mb-2">編集機能</h4>
              <p className="text-gray-600 text-sm">
                OCR結果をMarkdown形式で編集・ダウンロード
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
