import { useState, useRef, useCallback, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  captureFaceDescriptor, 
  addToDatabase, 
  getFaceDetectionBox
} from '../services/faceRecognitionService';

export function DataCollection() {
  const { setCurrentPage, refreshUsers, modelsLoaded } = useApp();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [userId, setUserId] = useState('');
  const [userName, setUserName] = useState('');
  const [capturedDescriptors, setCapturedDescriptors] = useState<Float32Array[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureCount, setCaptureCount] = useState(0);
  const [status, setStatus] = useState('idle');
  const [faceDetected, setFaceDetected] = useState(false);
  const [captureProgress, setCaptureProgress] = useState(0);
  const [message, setMessage] = useState('');
  const targetSamples = 20;
  const animationRef = useRef<number | null>(null);

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480, facingMode: 'user' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
        setStatus('streaming');
        setMessage('Camera started. Position your face in the frame.');
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setStatus('error');
      setMessage('Error accessing camera. Please allow camera permissions.');
    }
  }, []);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsStreaming(false);
      setStatus('idle');
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }
  }, []);

  // Face detection loop
  useEffect(() => {
    if (!isStreaming || !modelsLoaded || !videoRef.current) return;

    const detectLoop = async () => {
      if (videoRef.current && videoRef.current.readyState === 4) {
        try {
          const box = await getFaceDetectionBox(videoRef.current);
          setFaceDetected(box !== null);
          
          // Draw detection box on canvas
          if (canvasRef.current && videoRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            if (ctx) {
              canvasRef.current.width = videoRef.current.videoWidth;
              canvasRef.current.height = videoRef.current.videoHeight;
              ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
              
              if (box) {
                ctx.strokeStyle = isCapturing ? '#22c55e' : '#3b82f6';
                ctx.lineWidth = 3;
                ctx.strokeRect(box.x, box.y, box.width, box.height);
                
                // Draw corner markers
                const cornerSize = 20;
                ctx.lineWidth = 4;
                ctx.beginPath();
                // Top-left
                ctx.moveTo(box.x, box.y + cornerSize);
                ctx.lineTo(box.x, box.y);
                ctx.lineTo(box.x + cornerSize, box.y);
                // Top-right
                ctx.moveTo(box.x + box.width - cornerSize, box.y);
                ctx.lineTo(box.x + box.width, box.y);
                ctx.lineTo(box.x + box.width, box.y + cornerSize);
                // Bottom-right
                ctx.moveTo(box.x + box.width, box.y + box.height - cornerSize);
                ctx.lineTo(box.x + box.width, box.y + box.height);
                ctx.lineTo(box.x + box.width - cornerSize, box.y + box.height);
                // Bottom-left
                ctx.moveTo(box.x + cornerSize, box.y + box.height);
                ctx.lineTo(box.x, box.y + box.height);
                ctx.lineTo(box.x, box.y + box.height - cornerSize);
                ctx.stroke();
              }
            }
          }
        } catch (err) {
          setFaceDetected(false);
        }
      }
      animationRef.current = requestAnimationFrame(detectLoop);
    };

    detectLoop();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isStreaming, modelsLoaded, isCapturing]);

  // Auto-capture faces
  useEffect(() => {
    if (!isCapturing || !isStreaming || !modelsLoaded) return;

    const captureInterval = setInterval(async () => {
      if (captureCount >= targetSamples) {
        setIsCapturing(false);
        setStatus('completed');
        setMessage('All samples captured! Click "Save to Database" to save.');
        return;
      }

      if (!faceDetected) {
        setMessage('No face detected. Please position your face in the frame.');
        return;
      }

      if (videoRef.current) {
        const descriptor = await captureFaceDescriptor(videoRef.current);
        if (descriptor) {
          setCapturedDescriptors(prev => [...prev, descriptor]);
          setCaptureCount(prev => prev + 1);
          setCaptureProgress(((captureCount + 1) / targetSamples) * 100);
          setMessage(`Captured sample ${captureCount + 1} of ${targetSamples}`);
        }
      }
    }, 500); // Capture every 500ms

    return () => clearInterval(captureInterval);
  }, [isCapturing, isStreaming, modelsLoaded, captureCount, faceDetected]);

  // Save to database
  const saveToDatabase = () => {
    if (!userId || !userName) {
      alert('Please enter User ID and Name');
      return;
    }

    if (capturedDescriptors.length < 5) {
      alert('Please capture at least 5 samples before saving');
      return;
    }

    addToDatabase(userId, userName, capturedDescriptors);
    refreshUsers();
    setMessage(`Successfully saved ${userName} to database with ${capturedDescriptors.length} samples!`);
    setStatus('saved');
    
    // Reset for next user
    setTimeout(() => {
      setUserId('');
      setUserName('');
      setCapturedDescriptors([]);
      setCaptureCount(0);
      setCaptureProgress(0);
      setStatus('streaming');
      setMessage('Ready to capture another user');
    }, 2000);
  };

  // Manual capture single frame
  const captureSingleFrame = async () => {
    if (!faceDetected) {
      setMessage('No face detected. Please position your face in the frame.');
      return;
    }

    if (videoRef.current) {
      const descriptor = await captureFaceDescriptor(videoRef.current);
      if (descriptor) {
        setCapturedDescriptors(prev => [...prev, descriptor]);
        setCaptureCount(prev => prev + 1);
        setCaptureProgress(((captureCount + 1) / targetSamples) * 100);
        setMessage(`Manually captured sample ${captureCount + 1}`);
      }
    }
  };

  // Reset capture
  const resetCapture = () => {
    setCapturedDescriptors([]);
    setCaptureCount(0);
    setCaptureProgress(0);
    setStatus('streaming');
    setMessage('Capture reset. Ready to capture new samples.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">📸 Face Data Collection</h1>
          <p className="text-gray-300">Capture facial data to register new users in the system</p>
          {!modelsLoaded && (
            <div className="mt-4 bg-yellow-500/20 text-yellow-400 px-4 py-2 rounded-lg inline-block">
              ⏳ Loading face recognition models...
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Camera Section */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">🎥 Camera Feed</h2>
            
            <div className="relative aspect-video bg-black rounded-xl overflow-hidden mb-4">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full"
              />
              
              {/* Face detection indicator */}
              {isStreaming && (
                <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-medium ${
                  faceDetected 
                    ? 'bg-green-500/80 text-white' 
                    : 'bg-red-500/80 text-white'
                }`}>
                  {faceDetected ? '✓ Face Detected' : '✗ No Face'}
                </div>
              )}

              {/* Capturing indicator */}
              {isCapturing && (
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="bg-black/50 rounded-lg p-3">
                    <div className="flex justify-between text-white text-sm mb-2">
                      <span>Capturing...</span>
                      <span>{captureCount}/{targetSamples}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${captureProgress}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Status overlay */}
              {!isStreaming && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                  <div className="text-center">
                    <div className="text-6xl mb-4">📷</div>
                    <p className="text-gray-400">Camera not started</p>
                  </div>
                </div>
              )}
            </div>

            {/* Camera controls */}
            <div className="flex gap-4">
              {!isStreaming ? (
                <button
                  onClick={startCamera}
                  disabled={!modelsLoaded}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-3 px-6 rounded-xl font-medium transition-all"
                >
                  📷 Start Camera
                </button>
              ) : (
                <button
                  onClick={stopCamera}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-xl font-medium transition-all"
                >
                  ⏹️ Stop Camera
                </button>
              )}
            </div>

            {/* Message display */}
            {message && (
              <div className={`mt-4 p-3 rounded-lg text-sm ${
                status === 'error' ? 'bg-red-500/20 text-red-400' :
                status === 'completed' || status === 'saved' ? 'bg-green-500/20 text-green-400' :
                'bg-blue-500/20 text-blue-400'
              }`}>
                {message}
              </div>
            )}
          </div>

          {/* Controls Section */}
          <div className="space-y-6">
            {/* User Info */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">👤 User Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">User ID</label>
                  <input
                    type="text"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    placeholder="Enter unique user ID (e.g., user001)"
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Full Name</label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Enter full name (e.g., John Doe)"
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Capture Controls */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">🎯 Capture Controls</h2>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-white/10 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-blue-400">{capturedDescriptors.length}</div>
                  <div className="text-gray-400 text-sm">Samples Captured</div>
                </div>
                <div className="bg-white/10 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-green-400">{targetSamples}</div>
                  <div className="text-gray-400 text-sm">Target Samples</div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>Progress</span>
                  <span>{Math.round(captureProgress)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${captureProgress}%` }}
                  />
                </div>
              </div>

              <div className="space-y-3">
                {!isCapturing ? (
                  <button
                    onClick={() => {
                      setIsCapturing(true);
                      setStatus('capturing');
                    }}
                    disabled={!isStreaming || !userId || !userName || !modelsLoaded}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white py-3 px-6 rounded-xl font-medium transition-all"
                  >
                    🔄 Start Auto Capture
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setIsCapturing(false);
                      setStatus('streaming');
                    }}
                    className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-3 px-6 rounded-xl font-medium transition-all"
                  >
                    ⏸️ Pause Capture
                  </button>
                )}

                <button
                  onClick={captureSingleFrame}
                  disabled={!isStreaming || !faceDetected || isCapturing}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-3 px-6 rounded-xl font-medium transition-all"
                >
                  📸 Capture Single Frame
                </button>

                <button
                  onClick={resetCapture}
                  disabled={capturedDescriptors.length === 0}
                  className="w-full bg-gray-600 hover:bg-gray-700 disabled:bg-gray-700 text-white py-3 px-6 rounded-xl font-medium transition-all"
                >
                  🔄 Reset Capture
                </button>

                <button
                  onClick={saveToDatabase}
                  disabled={capturedDescriptors.length < 5}
                  className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white py-3 px-6 rounded-xl font-medium transition-all"
                >
                  💾 Save to Database
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 flex justify-center gap-4">
          <button
            onClick={() => setCurrentPage('dashboard')}
            className="bg-white/10 hover:bg-white/20 text-white py-3 px-8 rounded-xl font-medium transition-all"
          >
            ← Back to Dashboard
          </button>
          <button
            onClick={() => setCurrentPage('recognition')}
            className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-8 rounded-xl font-medium transition-all"
          >
            Go to Face Recognition →
          </button>
        </div>
      </div>
    </div>
  );
}
