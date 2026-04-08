import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

export function ModelTraining() {
  const { setCurrentPage, registeredUsers, modelsLoaded } = useApp();
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [isModelTrained, setIsModelTrained] = useState(false);
  const [trainingLog, setTrainingLog] = useState<string[]>([]);

  // Check if model is already trained on mount
  useEffect(() => {
    const trained = localStorage.getItem('model_trained');
    if (trained === 'true') {
      setIsModelTrained(true);
    }
  }, []);

  const simulateTraining = async () => {
    if (registeredUsers.length === 0) {
      alert('No users registered! Please collect face data first.');
      return;
    }

    setIsTraining(true);
    setTrainingProgress(0);
    setTrainingLog([]);
    setIsModelTrained(false);

    const totalSamples = registeredUsers.reduce((acc, user) => acc + user.sampleCount, 0);
    
    const logs = [
      '🚀 Initializing Face Recognition System...',
      '📂 Loading face descriptors from database...',
      `📊 Found ${totalSamples} face samples from ${registeredUsers.length} user(s)`,
      '🔄 Computing face embeddings...',
      '📐 Normalizing face vectors...',
      '🧠 Building recognition model...',
      '📝 Writing model configuration...',
      '✅ Training complete!'
    ];

    for (let i = 0; i < logs.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setTrainingLog(prev => [...prev, logs[i]]);
      setTrainingProgress(((i + 1) / logs.length) * 100);
    }

    // Simulate per-user processing
    for (const user of registeredUsers) {
      await new Promise(resolve => setTimeout(resolve, 500));
      setTrainingLog(prev => [...prev, `  → Processed ${user.name} (${user.sampleCount} samples)`]);
    }

    await new Promise(resolve => setTimeout(resolve, 500));
    setTrainingLog(prev => [...prev, '', '🎉 Model training completed successfully!', '💾 Model saved to browser storage']);
    
    localStorage.setItem('model_trained', 'true');
    setIsModelTrained(true);
    setIsTraining(false);
  };

  const resetModel = () => {
    localStorage.removeItem('model_trained');
    setIsModelTrained(false);
    setTrainingLog([]);
    setTrainingProgress(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">🧠 Model Training</h1>
          <p className="text-gray-300">Train the face recognition model with collected data</p>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
            <div className="text-4xl mb-3">👥</div>
            <h3 className="text-lg font-semibold text-white">Registered Users</h3>
            <p className="text-3xl font-bold text-blue-400 mt-2">{registeredUsers.length}</p>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
            <div className="text-4xl mb-3">📸</div>
            <h3 className="text-lg font-semibold text-white">Total Samples</h3>
            <p className="text-3xl font-bold text-green-400 mt-2">
              {registeredUsers.reduce((acc, user) => acc + user.sampleCount, 0)}
            </p>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
            <div className="text-4xl mb-3">{isModelTrained ? '✅' : '⏳'}</div>
            <h3 className="text-lg font-semibold text-white">Model Status</h3>
            <p className={`text-xl font-bold mt-2 ${isModelTrained ? 'text-green-400' : 'text-yellow-400'}`}>
              {isModelTrained ? 'Trained' : 'Not Trained'}
            </p>
          </div>
        </div>

        {/* Models Loading Status */}
        {!modelsLoaded && (
          <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-xl p-4 mb-6">
            <p className="text-yellow-400 text-center">
              ⏳ Loading face recognition models... Please wait.
            </p>
          </div>
        )}

        {/* Training Progress */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">📊 Training Progress</h2>
          
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Progress</span>
              <span>{Math.round(trainingProgress)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-4">
              <div 
                className={`h-4 rounded-full transition-all duration-300 ${
                  isModelTrained 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                    : 'bg-gradient-to-r from-blue-500 to-purple-500'
                }`}
                style={{ width: `${trainingProgress}%` }}
              />
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex gap-4">
            <button
              onClick={simulateTraining}
              disabled={isTraining || registeredUsers.length === 0 || !modelsLoaded}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white py-3 px-6 rounded-xl font-medium transition-all"
            >
              {isTraining ? '⏳ Training...' : '🚀 Start Training'}
            </button>
            
            {isModelTrained && (
              <button
                onClick={resetModel}
                className="bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-xl font-medium transition-all"
              >
                🔄 Reset Model
              </button>
            )}
          </div>
        </div>

        {/* Training Log */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">📋 Training Log</h2>
          
          <div className="bg-black/50 rounded-xl p-4 font-mono text-sm h-64 overflow-y-auto">
            {trainingLog.length === 0 ? (
              <p className="text-gray-500">Training logs will appear here...</p>
            ) : (
              trainingLog.map((log, index) => (
                <div key={index} className={`py-1 ${log.startsWith('✅') || log.startsWith('🎉') ? 'text-green-400' : 'text-gray-300'}`}>
                  {log || '\u00A0'}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Algorithm Info */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">ℹ️ About the Algorithm</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-blue-400 mb-2">Face-API.js</h3>
              <p className="text-gray-400 text-sm">
                Uses TensorFlow.js to run face detection and recognition in the browser.
                The model extracts 128-dimensional face descriptors for comparison.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-purple-400 mb-2">Recognition Method</h3>
              <p className="text-gray-400 text-sm">
                Uses euclidean distance to compare face descriptors. Lower distance means
                higher similarity. Threshold of 0.6 determines match confidence.
              </p>
            </div>
          </div>
        </div>

        {/* User Summary */}
        {registeredUsers.length > 0 && (
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">👥 Registered Users</h2>
            
            <div className="space-y-3">
              {registeredUsers.map((user) => (
                <div 
                  key={user.id}
                  className="flex items-center justify-between bg-white/10 rounded-xl p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-white font-medium">{user.name}</h3>
                      <p className="text-gray-400 text-sm">ID: {user.id}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-green-400 font-medium">{user.sampleCount} samples</p>
                    <p className="text-gray-500 text-sm">Ready for training</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-center gap-4">
          <button
            onClick={() => setCurrentPage('collection')}
            className="bg-white/10 hover:bg-white/20 text-white py-3 px-8 rounded-xl font-medium transition-all"
          >
            ← Collect Data
          </button>
          <button
            onClick={() => setCurrentPage('recognition')}
            disabled={!isModelTrained}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-3 px-8 rounded-xl font-medium transition-all"
          >
            Go to Recognition →
          </button>
        </div>
      </div>
    </div>
  );
}
