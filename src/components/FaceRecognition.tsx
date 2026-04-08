import { useState, useRef, useCallback, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  recognizeFace, 
  getFaceDetectionBox,
  loadDatabaseFromStorage
} from '../services/faceRecognitionService';

export function FaceRecognition() {
  const { setCurrentPage, recognizeUser, modelsLoaded } = useApp();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [recognitionResult, setRecognitionResult] = useState<{
    recognized: boolean;
    userId: string;
    userName: string;
    confidence: number;
  } | null>(null);
  const [status, setStatus] = useState<'idle' | 'scanning' | 'success' | 'failed' | 'no-face'>('idle');
  const [message, setMessage] = useState('');
  const [scanProgress, setScanProgress] = useState(0);
  const animationRef = useRef<number>();
  const scanTimeoutRef = useRef<NodeJS.Timeout>();

  // Load database on mount
  useEffect(() => {
    loadDatabaseFromStorage();
  }, []);

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480, facingMode: 'user' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
        setStatus('idle');
        setMessage('Camera ready. Click "Scan Face" to authenticate.');
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
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
      setIsScanning(false);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
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
                // Determine color based on status
                let color = '#3b82f6'; // blue default
                if (status === 'success') color = '#22c55e';
                else if (status === 'failed' || status === 'no-face') color = '#ef4444';
                else if (isScanning) color = '#eab308';
                
                ctx.strokeStyle = color;
                ctx.lineWidth = 4;
                ctx.strokeRect(box.x, box.y, box.width, box.height);
                
                // Draw corner markers
                const cornerSize = 25;
                ctx.lineWidth = 5;
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

                // Draw scanning effect
                if (isScanning) {
                  const scanLineY = box.y + (box.height * (scanProgress / 100));
                  ctx.strokeStyle = '#00ff00';
                  ctx.lineWidth = 2;
                  ctx.beginPath();
                  ctx.moveTo(box.x, scanLineY);
                  ctx.lineTo(box.x + box.width, scanLineY);
                  ctx.stroke();
                }
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
  }, [isStreaming, modelsLoaded, isScanning, status, scanProgress]);

  // Perform face recognition
  const startRecognition = async () => {
    if (!isStreaming || !modelsLoaded || !videoRef.current) {
      setMessage('Please start the camera first');
      return;
    }

    // Check if face is detected first
    if (!faceDetected) {
      setStatus('no-face');
      setMessage('⚠️ No face detected! Please position your face in the camera frame.');
      return;
    }

    setIsScanning(true);
    setStatus('scanning');
    setMessage('🔍 Scanning face... Hold still.');
    setRecognitionResult(null);
    setScanProgress(0);

    // Simulate scanning progress
    const progressInterval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 100);

    // Perform actual recognition after a short delay
    scanTimeoutRef.current = setTimeout(async () => {
      try {
        if (!videoRef.current) return;
        
        const result = await recognizeFace(videoRef.current);
        
        clearInterval(progressInterval);
        setScanProgress(100);
        
        if (!result.faceDetected) {
          setStatus('no-face');
          setMessage('⚠️ No face detected! Please position your face in the camera frame.');
          setIsScanning(false);
          return;
        }

        if (result.recognized) {
          setStatus('success');
          setRecognitionResult({
            recognized: true,
            userId: result.userId,
            userName: result.userName,
            confidence: result.confidence
          });
          setMessage(`✅ Welcome, ${result.userName}! Access granted.`);
          
          // Voice greeting
          speak(`Welcome ${result.userName}. Access granted.`);
          
          // Navigate to dashboard after delay
          setTimeout(() => {
            recognizeUser(result.userId, result.userName, result.confidence);
            setCurrentPage('dashboard');
          }, 2000);
        } else {
          setStatus('failed');
          setRecognitionResult({
            recognized: false,
            userId: '',
            userName: 'Unknown',
            confidence: 0
          });
          setMessage('❌ Face not recognized. Access denied.');
          speak('Access denied. Face not recognized.');
        }
      } catch (error) {
        console.error('Recognition error:', error);
        setStatus('failed');
        setMessage('❌ Recognition failed. Please try again.');
      }
      
      setIsScanning(false);
    }, 1500);
  };

  // Text-to-speech
  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.volume = 1;
      speechSynthesis.speak(utterance);
    }
  };

  // Reset recognition
  const resetRecognition = () => {
    setRecognitionResult(null);
    setStatus('idle');
    setMessage('Ready to scan.');
    setScanProgress(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">🔐 Face Recognition Login</h1>
          <p className="text-gray-300">Secure authentication using AI-powered face recognition</p>
          {!modelsLoaded && (
            <div className="mt-4 bg-yellow-500/20 text-yellow-400 px-4 py-2 rounded-lg inline-block">
              ⏳ Loading face recognition models... Please wait.
            </div>
          )}
        </div>

        {/* Main Camera Section */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 mb-6">
          <div className="relative aspect-video bg-black rounded-xl overflow-hidden">
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
            
            {/* Status indicators */}
            {isStreaming && (
              <>
                {/* Face detection indicator */}
                <div className={`absolute top-4 left-4 px-4 py-2 rounded-full text-sm font-medium ${
                  faceDetected 
                    ? 'bg-green-500/80 text-white' 
                    : 'bg-red-500/80 text-white animate-pulse'
                }`}>
                  {faceDetected ? '✓ Face Detected' : '⚠️ No Face Detected'}
                </div>

                {/* Scanning indicator */}
                {isScanning && (
                  <div className="absolute top-4 right-4 px-4 py-2 rounded-full bg-yellow-500/80 text-white text-sm font-medium animate-pulse">
                    🔍 Scanning...
                  </div>
                )}

                {/* Result overlay */}
                {status === 'success' && recognitionResult && (
                  <div className="absolute inset-0 flex items-center justify-center bg-green-500/20">
                    <div className="text-center bg-black/70 rounded-2xl p-8">
                      <div className="text-6xl mb-4">✅</div>
                      <h2 className="text-3xl font-bold text-green-400 mb-2">Access Granted</h2>
                      <p className="text-2xl text-white">{recognitionResult.userName}</p>
                      <p className="text-green-400">Confidence: {recognitionResult.confidence}%</p>
                    </div>
                  </div>
                )}

                {status === 'failed' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-red-500/20">
                    <div className="text-center bg-black/70 rounded-2xl p-8">
                      <div className="text-6xl mb-4">❌</div>
                      <h2 className="text-3xl font-bold text-red-400 mb-2">Access Denied</h2>
                      <p className="text-white">Face not recognized</p>
                    </div>
                  </div>
                )}

                {status === 'no-face' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-yellow-500/20">
                    <div className="text-center bg-black/70 rounded-2xl p-8">
                      <div className="text-6xl mb-4 animate-bounce">👤</div>
                      <h2 className="text-2xl font-bold text-yellow-400 mb-2">No Face Detected</h2>
                      <p className="text-white">Please position your face in the camera frame</p>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Camera not started */}
            {!isStreaming && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                <div className="text-center">
                  <div className="text-6xl mb-4">🔐</div>
                  <p className="text-gray-400">Click "Start Camera" to begin</p>
                </div>
              </div>
            )}
          </div>

          {/* Message display */}
          {message && (
            <div className={`mt-4 p-4 rounded-xl text-center font-medium ${
              status === 'success' ? 'bg-green-500/20 text-green-400' :
              status === 'failed' || status === 'no-face' ? 'bg-red-500/20 text-red-400' :
              status === 'scanning' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-blue-500/20 text-blue-400'
            }`}>
              {message}
            </div>
          )}

          {/* Scan progress */}
          {isScanning && (
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>Analyzing face...</span>
                <span>{scanProgress}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-100"
                  style={{ width: `${scanProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Control Buttons */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {!isStreaming ? (
              <button
                onClick={startCamera}
                disabled={!modelsLoaded}
                className="col-span-2 md:col-span-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-4 px-6 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
              >
                📷 Start Camera
              </button>
            ) : (
              <>
                <button
                  onClick={startRecognition}
                  disabled={isScanning}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white py-4 px-6 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
                >
                  🔍 Scan Face
                </button>
                
                <button
                  onClick={resetRecognition}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white py-4 px-6 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
                >
                  🔄 Reset
                </button>
                
                <button
                  onClick={stopCamera}
                  className="bg-red-600 hover:bg-red-700 text-white py-4 px-6 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
                >
                  ⏹️ Stop
                </button>
                
                <button
                  onClick={startCamera}
                  className="bg-gray-600 hover:bg-gray-700 text-white py-4 px-6 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
                >
                  🔄 Restart
                </button>
              </>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">📋 Instructions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
            <div className="flex items-start gap-3">
              <span className="text-2xl">1️⃣</span>
              <p>Start the camera and ensure good lighting on your face</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">2️⃣</span>
              <p>Position your face within the camera frame until detected</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">3️⃣</span>
              <p>Click "Scan Face" and hold still during the scan</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">4️⃣</span>
              <p>Wait for the system to recognize your face and grant access</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-center gap-4">
          <button
            onClick={() => setCurrentPage('home')}
            className="bg-white/10 hover:bg-white/20 text-white py-3 px-8 rounded-xl font-medium transition-all"
          >
            ← Home
          </button>
          <button
            onClick={() => setCurrentPage('collection')}
            className="bg-purple-600 hover:bg-purple-700 text-white py-3 px-8 rounded-xl font-medium transition-all"
          >
            Register New User →
          </button>
        </div>
      </div>
    </div>
  );
}
