import * as faceapi from 'face-api.js';

// Face database stored in memory and localStorage
export interface FaceData {
  userId: string;
  userName: string;
  descriptors: Float32Array[];
}

const MODEL_URL = 'https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights';
const STORAGE_KEY = 'face_recognition_database';

let modelsLoaded = false;
let faceDatabase: FaceData[] = [];

// Load models from CDN
export async function loadModels(): Promise<boolean> {
  if (modelsLoaded) return true;
  
  try {
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    ]);
    modelsLoaded = true;
    console.log('Face recognition models loaded successfully');
    return true;
  } catch (error) {
    console.error('Error loading face recognition models:', error);
    return false;
  }
}

// Check if models are loaded
export function areModelsLoaded(): boolean {
  return modelsLoaded;
}

// Detect face in video element
export async function detectFace(video: HTMLVideoElement): Promise<faceapi.WithFaceDescriptor<faceapi.WithFaceLandmarks<{ detection: faceapi.FaceDetection }, faceapi.FaceLandmarks68>> | null> {
  if (!modelsLoaded) {
    throw new Error('Models not loaded');
  }

  const detection = await faceapi
    .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.5 }))
    .withFaceLandmarks()
    .withFaceDescriptor();

  return detection || null;
}

// Capture face descriptor for enrollment
export async function captureFaceDescriptor(video: HTMLVideoElement): Promise<Float32Array | null> {
  const detection = await detectFace(video);
  return detection ? detection.descriptor : null;
}

// Add face to database
export function addToDatabase(userId: string, userName: string, descriptors: Float32Array[]): void {
  // Remove existing entry if any
  faceDatabase = faceDatabase.filter(f => f.userId !== userId);
  
  // Add new entry
  faceDatabase.push({ userId, userName, descriptors });
  
  // Save to localStorage
  saveDatabaseToStorage();
}

// Save database to localStorage
function saveDatabaseToStorage(): void {
  const serializable = faceDatabase.map(face => ({
    userId: face.userId,
    userName: face.userName,
    descriptors: face.descriptors.map(d => Array.from(d))
  }));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
}

// Load database from localStorage
export function loadDatabaseFromStorage(): void {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      faceDatabase = parsed.map((face: { userId: string; userName: string; descriptors: number[][] }) => ({
        userId: face.userId,
        userName: face.userName,
        descriptors: face.descriptors.map(d => new Float32Array(d))
      }));
      console.log('Loaded face database:', faceDatabase.length, 'users');
    } catch (error) {
      console.error('Error loading database:', error);
      faceDatabase = [];
    }
  }
}

// Get all users in database
export function getAllUsers(): { userId: string; userName: string; sampleCount: number }[] {
  return faceDatabase.map(f => ({
    userId: f.userId,
    userName: f.userName,
    sampleCount: f.descriptors.length
  }));
}

// Remove user from database
export function removeFromDatabase(userId: string): void {
  faceDatabase = faceDatabase.filter(f => f.userId !== userId);
  saveDatabaseToStorage();
}

// Clear entire database
export function clearDatabase(): void {
  faceDatabase = [];
  localStorage.removeItem(STORAGE_KEY);
}

// Recognize face against database
export async function recognizeFace(
  video: HTMLVideoElement
): Promise<{ recognized: boolean; userId: string; userName: string; confidence: number; faceDetected: boolean }> {
  if (!modelsLoaded) {
    throw new Error('Models not loaded');
  }

  const detection = await detectFace(video);

  if (!detection) {
    return {
      recognized: false,
      userId: '',
      userName: '',
      confidence: 0,
      faceDetected: false
    };
  }

  if (faceDatabase.length === 0) {
    return {
      recognized: false,
      userId: '',
      userName: '',
      confidence: 0,
      faceDetected: true
    };
  }

  // Compare against all stored faces
  let bestMatch: { userId: string; userName: string; distance: number } | null = null;

  for (const faceData of faceDatabase) {
    for (const descriptor of faceData.descriptors) {
      const distance = faceapi.euclideanDistance(detection.descriptor, descriptor);
      
      if (!bestMatch || distance < bestMatch.distance) {
        bestMatch = {
          userId: faceData.userId,
          userName: faceData.userName,
          distance
        };
      }
    }
  }

  // Threshold for recognition (lower is stricter)
  const THRESHOLD = 0.6;
  
  if (bestMatch && bestMatch.distance < THRESHOLD) {
    const confidence = Math.round((1 - bestMatch.distance) * 100);
    return {
      recognized: true,
      userId: bestMatch.userId,
      userName: bestMatch.userName,
      confidence: Math.min(confidence, 99),
      faceDetected: true
    };
  }

  return {
    recognized: false,
    userId: '',
    userName: '',
    confidence: 0,
    faceDetected: true
  };
}

// Draw detection box on canvas
export function drawDetectionBox(
  canvas: HTMLCanvasElement,
  video: HTMLVideoElement,
  detection: faceapi.WithFaceLandmarks<{ detection: faceapi.FaceDetection }, faceapi.FaceLandmarks68> | null
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (detection) {
    const box = detection.detection.box;
    
    // Draw face bounding box
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 3;
    ctx.strokeRect(box.x, box.y, box.width, box.height);

    // Draw landmarks
    const landmarks = detection.landmarks;
    ctx.fillStyle = '#00ff00';
    
    landmarks.positions.forEach((point) => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 2, 0, 2 * Math.PI);
      ctx.fill();
    });
  }
}

// Get face detection box for video
export async function getFaceDetectionBox(
  video: HTMLVideoElement
): Promise<{ x: number; y: number; width: number; height: number } | null> {
  const detection = await detectFace(video);
  if (!detection) return null;
  return detection.detection.box;
}
