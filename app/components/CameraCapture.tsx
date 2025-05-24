import { useState, useRef, useEffect } from 'react';

interface CameraCaptureProps {
  onCapture: (imageBase64: string) => void;
}

export default function CameraCapture({ onCapture }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Start camera
  const startCamera = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('カメラへのアクセスに失敗しました。カメラの使用許可を確認してください。');
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();

      tracks.forEach((track) => {
        track.stop();
      });

      videoRef.current.srcObject = null;
      setIsCameraActive(false);
    }
  };

  // Capture image
  const captureImage = () => {
    if (!canvasRef.current || !videoRef.current) return;

    setIsCapturing(true);

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas to base64 image
    const imageBase64 = canvas.toDataURL('image/png');

    // Pass the captured image to parent component
    onCapture(imageBase64);

    setIsCapturing(false);
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="camera-capture">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="relative">
        {/* Video preview */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className={`w-full border rounded ${isCameraActive ? 'block' : 'hidden'}`}
        />

        {/* Canvas for capturing (hidden) */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Camera controls */}
        <div className="mt-4 flex justify-between">
          {!isCameraActive ? (
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={startCamera}
            >
              カメラを起動
            </button>
          ) : (
            <>
              <button
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                onClick={stopCamera}
              >
                カメラを停止
              </button>

              <button
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                onClick={captureImage}
                disabled={isCapturing}
              >
                {isCapturing ? '処理中...' : '撮影'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
